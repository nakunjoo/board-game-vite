import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  useWebSocket,
  getPlayerIdForRoom,
  getNicknameForRoom,
  clearNicknameForRoom,
} from "../../../contexts/WebSocketContext";
import { getGameConfig } from "../../../utils/games";
import type { GameConfig } from "../../../types/game";
import type { Player } from "../../../components/gang/types";

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

export function useRoomBase() {
  const { roomName } = useParams<{ roomName: string }>();
  const { connected, send, subscribe } = useWebSocket();
  const playerId = roomName ? getPlayerIdForRoom(roomName) : "";
  const nickname = roomName ? getNicknameForRoom(roomName) : "";
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [memberCount, setMemberCount] = useState(locationState?.memberCount ?? 0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>(() =>
    getGameConfig(locationState?.gameType ?? "gang"),
  );
  const [hostPlayerId, setHostPlayerId] = useState<string>("");
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
            if (joinData.hostPlayerId !== undefined) setHostPlayerId(joinData.hostPlayerId);
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
          };
          if (leftData.roomName === roomName) {
            setMemberCount(leftData.memberCount);
            if (leftData.playerId) {
              setPlayers((prev) => prev.filter((p) => p.playerId !== leftData.playerId));
            }
            setMessages((prev) => [
              ...prev,
              { message: `${leftData.nickname || "누군가"} 퇴장했습니다.`, isSystem: true },
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
          navigate("/");
          break;
        case "error": {
          const errorData = data as { message: string };
          alert(errorData.message);
          if (errorData.message.includes("방이 존재하지 않습니다")) {
            if (roomName) {
              clearNicknameForRoom(roomName);
              sessionStorage.removeItem(`joined:${roomName}`);
            }
            navigate("/");
          }
          break;
        }
        case "kicked": {
          const kickData = data as { roomName: string; message: string };
          if (kickData.roomName === roomName) {
            alert(kickData.message);
            navigate("/");
          }
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, navigate, playerId, isChatOpen]);

  // 새로고침 시에만 재입장 (locationState 없으면 새로고침)
  const isRefresh = !locationState;
  useEffect(() => {
    if (connected && roomName && isRefresh) {
      const timer = setTimeout(() => {
        send("joinRoom", { name: roomName, playerId, nickname });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connected, roomName, send, nickname, isRefresh]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !roomName) return;
    send("roomMessage", { roomName, message: `${nickname}: ${inputMessage}` });
    setInputMessage("");
  };

  const leaveRoom = () => {
    if (roomName) {
      send("leaveRoom", { name: roomName });
      clearNicknameForRoom(roomName);
      sessionStorage.removeItem(`joined:${roomName}`);
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
    roomName,
    playerId,
    nickname,
    connected,
    send,
    subscribe,
    gameConfig,
    players,
    memberCount,
    hostPlayerId,
    isHost,
    messages,
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
