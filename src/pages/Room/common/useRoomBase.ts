import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useWebSocket } from "../../../contexts/WebSocketContext";
import { useAuth } from "../../../contexts/AuthContext";
import { getGameConfig } from "../../../utils/games";
import type { GameConfig, Player } from "../../../types/game";

export interface LocationState {
  memberCount?: number;
  players?: { playerId: string; nickname: string; order: number }[];
  gameType?: string;
  deck?: unknown[];
  myHand?: unknown[];
  playerHands?: unknown[];
  openCards?: unknown[];
  chips?: unknown[];
  currentStep?: number;
  readyPlayers?: string[];
  previousChips?: Record<string, number[]>;
  winLossRecord?: Record<string, boolean[]>;
  gameStarted?: boolean;
  gameFinished?: boolean;
  gameOver?: boolean;
  gameOverResult?: string | null;
  lastGameResults?: unknown[];
  hostPlayerId?: string;
  hostNickname?: string;
}

interface ChatMessageData {
  sender?: string;
  message: string;
  isSystem?: boolean;
}

export interface UseRoomBaseOptions {
  /**
   * alert로 띄우지 않고 조용히 넘길 서버 에러 메시지 목록.
   * 경합에서 진 요청처럼, 사용자가 잘못한 게 아니고 알려봐야 의미 없는 에러에 쓴다.
   * (예: Spice에서 다른 사람이 먼저 도전해 페이즈가 닫힌 경우)
   */
  silentErrors?: string[];
}

// 방 페이지에서 받으면 재입장이 거부된 것 (재연결 유예 30초 초과 등) — 로비로 돌려보낸다
const ROOM_ACCESS_LOST_ERRORS = [
  "방이 존재하지 않습니다",
  "이미 게임이 시작된 방입니다",
  "비밀번호가 일치하지 않습니다",
  "인증에 실패했습니다",
];

const MAX_SAVED_MESSAGES = 100;

export function useRoomBase(options: UseRoomBaseOptions = {}) {
  const silentErrors = options.silentErrors;
  const silentErrorsRef = useRef<string[]>(silentErrors ?? []);
  useEffect(() => {
    silentErrorsRef.current = silentErrors ?? [];
  }, [silentErrors]);
  const { roomName } = useParams<{ roomName: string }>();
  const { connected, connectionId, send, subscribe } = useWebSocket();
  const { user, nickname: authNickname } = useAuth();
  const playerId = user?.id ?? "";
  const nickname = authNickname ?? user?.email ?? "";
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // 새로고침 감지: performance API로 실제 reload 여부 확인
  // location.state는 브라우저 History API에 의해 새로고침 후에도 유지되므로
  // !locationState 만으로는 새로고침 감지가 불가능함
  const isRefresh = (() => {
    const navEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    return navEntry?.type === "reload" || !locationState;
  })();

  // 이 방에 입장 처리된 연결. 로비에서 들어왔으면 지금 소켓은 이미 입장한 상태다.
  // 연결이 새로 맺어지면(새로고침, 끊긴 뒤 재연결) connectionId가 달라져 다시 joinRoom을 보낸다
  const joinedConnectionRef = useRef(isRefresh ? 0 : connectionId);
  // 서버가 roomJoined로 입장을 확인해 준 연결. 현재 연결과 다르면 아직 복원 중이다
  const [confirmedConnection, setConfirmedConnection] = useState(isRefresh ? -1 : connectionId);
  // 이 방에 한 번이라도 입장한 적이 있는지. 재입장 거부 안내 문구를 고르는 데 쓴다
  const wasInRoomRef = useRef(!isRefresh);

  const chatStorageKey = `chat:${roomName}`;
  const [messages, setMessages] = useState<ChatMessageData[]>(() => {
    if (!isRefresh) return [];
    try {
      return JSON.parse(sessionStorage.getItem(chatStorageKey) ?? "[]") as ChatMessageData[];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(chatStorageKey, JSON.stringify(messages.slice(-MAX_SAVED_MESSAGES)));
    } catch {
      // 저장 공간이 부족하면 새로고침 때 채팅만 비워진다
    }
  }, [chatStorageKey, messages]);

  // 닫은 결과창이 재연결·새로고침으로 다시 열리지 않게 한다 (새 판이 시작되면 초기화)
  const resultDismissedKey = `result-dismissed:${roomName}`;
  const resultDismissedRef = useRef(sessionStorage.getItem(resultDismissedKey) === "1");
  const setResultDismissed = useCallback(
    (dismissed: boolean) => {
      resultDismissedRef.current = dismissed;
      if (dismissed) sessionStorage.setItem(resultDismissedKey, "1");
      else sessionStorage.removeItem(resultDismissedKey);
    },
    [resultDismissedKey],
  );

  const [inputMessage, setInputMessage] = useState("");
  const [memberCount, setMemberCount] = useState(locationState?.memberCount ?? 0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>(() =>
    getGameConfig(locationState?.gameType ?? "gang"),
  );
  // 로비에서 입장하면 roomJoined를 로비가 받으므로 넘겨받은 값으로 시작한다
  const [hostPlayerId, setHostPlayerId] = useState<string>(locationState?.hostPlayerId ?? "");
  // 구독 콜백에서 방장이 나갔는지 판단하기 위한 최신값
  const hostPlayerIdRef = useRef(locationState?.hostPlayerId ?? "");
  const [_hostNickname, setHostNickname] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>(() => {
    if (locationState?.players) {
      return locationState.players.map((p) => ({
        playerId: p.playerId,
        nickname: p.nickname,
        isMe: p.playerId === playerId,
        order: p.order,
      }));
    }
    return [{ playerId, nickname, isMe: true, order: 0 }];
  });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅창 열릴 때 스크롤
  useEffect(() => {
    if (isChatOpen && window.innerWidth <= 1080) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isChatOpen]);

  // 공통 이벤트 구독 (채팅, 방 입장, 플레이어 목록, 퇴장, 에러, 강퇴)
  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      switch (event) {
        case "roomMessage": {
          const msgData = data as {
            roomName: string;
            message: string;
            sender?: string;
            isSystem?: boolean;
          };
          if (msgData.roomName === roomName) {
            setMessages((prev) => [
              ...prev,
              { message: msgData.message, sender: msgData.sender, isSystem: msgData.isSystem },
            ]);
            setHasUnreadMessages((prev) => !isChatOpen || prev);
          }
          break;
        }
        case "roomCreated":
        case "roomJoined": {
          const joinData = data as {
            name: string;
            memberCount?: number;
            players?: { playerId: string; nickname: string; order: number }[];
            gameType?: string;
            hostPlayerId?: string;
            hostNickname?: string;
          };
          if (joinData.name === roomName) {
            wasInRoomRef.current = true;
            setConfirmedConnection(joinedConnectionRef.current);
            if (joinData.gameType) setGameConfig(getGameConfig(joinData.gameType));
            if (joinData.memberCount) setMemberCount(joinData.memberCount);
            if (joinData.players) {
              setPlayers(
                joinData.players.map((p) => ({
                  playerId: p.playerId,
                  nickname: p.nickname,
                  isMe: p.playerId === playerId,
                  order: p.order,
                })),
              );
            }
            if (joinData.hostPlayerId !== undefined) {
              hostPlayerIdRef.current = joinData.hostPlayerId;
              setHostPlayerId(joinData.hostPlayerId);
            }
            if (joinData.hostNickname !== undefined) setHostNickname(joinData.hostNickname);
          }
          break;
        }
        case "playerList": {
          const listData = data as {
            roomName: string;
            players: { playerId: string; nickname: string; order: number }[];
          };
          if (listData.roomName === roomName) {
            setPlayers(
              listData.players.map((p) => ({
                playerId: p.playerId,
                nickname: p.nickname,
                isMe: p.playerId === playerId,
                order: p.order,
              })),
            );
          }
          break;
        }
        case "userJoined": {
          const joinData = data as {
            roomName: string;
            memberCount: number;
            playerId?: string;
            nickname?: string;
            order?: number;
            players?: { playerId: string; nickname: string; order: number }[];
          };
          if (joinData.roomName === roomName) {
            setMemberCount(joinData.memberCount);
            if (joinData.players) {
              setPlayers(
                joinData.players.map((p) => ({
                  playerId: p.playerId,
                  nickname: p.nickname,
                  isMe: p.playerId === playerId,
                  order: p.order,
                })),
              );
            } else if (joinData.playerId) {
              setPlayers((prev) => {
                if (prev.some((p) => p.playerId === joinData.playerId)) return prev;
                return [
                  ...prev,
                  {
                    playerId: joinData.playerId!,
                    nickname: joinData.nickname || joinData.playerId!,
                    isMe: false,
                    order: joinData.order,
                  },
                ];
              });
            }
            setMessages((prev) => [
              ...prev,
              { message: `${joinData.nickname || "누군가"} 입장했습니다.`, isSystem: true },
            ]);
          }
          break;
        }
        case "userLeft": {
          const leftData = data as {
            roomName: string;
            memberCount: number;
            playerId?: string;
            nickname?: string;
            hostPlayerId?: string;
            hostNickname?: string;
          };
          if (leftData.roomName === roomName) {
            setMemberCount(leftData.memberCount);
            if (leftData.playerId) {
              setPlayers((prev) => prev.filter((p) => p.playerId !== leftData.playerId));
            }
            const hostLeft = leftData.playerId !== undefined && leftData.playerId === hostPlayerIdRef.current;
            if (leftData.hostPlayerId) {
              hostPlayerIdRef.current = leftData.hostPlayerId;
              setHostPlayerId(leftData.hostPlayerId);
            }
            setMessages((prev) => [
              ...prev,
              { message: `${leftData.nickname || "누군가"} 퇴장했습니다.`, isSystem: true },
              ...(hostLeft && leftData.hostNickname
                ? [{ message: `${leftData.hostNickname}님이 새 방장이 되었습니다.`, isSystem: true }]
                : []),
            ]);
          }
          break;
        }
        case "roomList": {
          const listData = data as { rooms: { name: string; memberCount: number }[] };
          const currentRoom = listData.rooms.find((r) => r.name === roomName);
          if (currentRoom) setMemberCount(currentRoom.memberCount);
          break;
        }
        case "roomLeft":
          navigate("/", { replace: true });
          break;
        case "error": {
          const errorData = data as { message: string };
          if (silentErrorsRef.current.includes(errorData.message)) break;
          // 게임 중에 연결이 유예 시간(30초)보다 오래 끊기면 서버가 방에서 뺀다.
          // 그 뒤 재입장은 '이미 게임이 시작된 방'으로 거부되는데, 그대로 보여주면 무슨 일인지 알 수 없다
          alert(
            wasInRoomRef.current && errorData.message.includes("이미 게임이 시작된 방입니다")
              ? "연결이 30초 넘게 끊겨 진행 중인 게임에서 빠졌습니다."
              : errorData.message,
          );
          if (ROOM_ACCESS_LOST_ERRORS.some((m) => errorData.message.includes(m))) {
            if (roomName) {
              sessionStorage.removeItem(`joined:${roomName}`);
            }
            navigate("/", { replace: true });
          }
          break;
        }
        case "kicked": {
          const kickData = data as { roomName: string; message: string };
          if (kickData.roomName === roomName) {
            alert(kickData.message);
            navigate("/", { replace: true });
          }
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, navigate, playerId, isChatOpen]);

  useEffect(() => {
    if (!connected || !roomName || connectionId === 0) return;
    if (joinedConnectionRef.current === connectionId) return;
    // 새로고침 직후 프로필(닉네임)이 도착할 시간을 준다
    const timer = setTimeout(() => {
      joinedConnectionRef.current = connectionId;
      send("joinRoom", { name: roomName, nickname });
    }, 500);
    return () => clearTimeout(timer);
  }, [connected, connectionId, roomName, send, nickname]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !roomName) return;
    send("roomMessage", { roomName, message: `${nickname}: ${inputMessage}` });
    setInputMessage("");
  };

  const leaveRoom = () => {
    if (roomName) {
      send("leaveRoom", { name: roomName });
      sessionStorage.removeItem(`joined:${roomName}`);
      sessionStorage.removeItem(chatStorageKey);
      sessionStorage.removeItem(resultDismissedKey);
      // 끊긴 상태면 roomLeft가 오지 않는다. 서버는 유예 시간 뒤 알아서 내보낸다
      if (!connected) navigate("/", { replace: true });
    }
  };


  const handleKickPlayer = (targetPlayerId: string) => {
    if (!roomName) return;
    const target = players.find((p) => p.playerId === targetPlayerId);
    const targetName = target?.nickname || targetPlayerId;
    if (window.confirm(`${targetName}님을 강퇴하시겠습니까?`)) {
      send("kickPlayer", { roomName, targetPlayerId });
    }
  };

  const isHost = hostPlayerId
    ? playerId === hostPlayerId
    : players.length > 0 && players[0]?.playerId === playerId;

  return {
    // 로비가 대신 받은 입장 데이터 (새로고침이면 서버가 다시 보내주므로 null)
    entryState: isRefresh ? null : locationState,
    roomName,
    playerId,
    nickname,
    connected,
    reconnecting: !connected || confirmedConnection !== connectionId,
    resultDismissedRef,
    setResultDismissed,
    send,
    subscribe,
    gameConfig,
    players,
    memberCount,
    hostPlayerId,
    isHost,
    messages,
    setMessages,
    inputMessage,
    setInputMessage,
    isChatOpen,
    setIsChatOpen,
    hasUnreadMessages,
    setHasUnreadMessages,
    showHelpModal,
    setShowHelpModal,
    messagesEndRef,
    sendMessage,
    leaveRoom,
    handleKickPlayer,
    locationState,
  };
}
