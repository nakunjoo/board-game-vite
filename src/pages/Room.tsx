import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useWebSocket,
  getNicknameForRoom,
  clearNicknameForRoom,
} from "../contexts/WebSocketContext";
import {
  RoomPage,
  RoomHeader,
  RoomInfo,
  MemberCount,
  LeaveButton,
  RoomContent,
} from "../styles/pages/Room";
import {
  GameArea,
} from "../styles/game";
import type { Card, GameConfig, PlayerHand } from "../types/game";
import { getGameConfig } from "../utils/games";
import { evaluateHand, type HandResult } from "../utils/poker";
import {
  ChatToggleButton,
  ChatToggleButtonWrapper,
  ChatNotificationBadge,
  ChatArea,
  ChatHeaderMobile,
  ChatCloseButton,
  ChatMessages,
  NoMessages,
  ChatMessage,
  ChatInputArea,
  ChatInput,
  ChatSendButton,
} from "../styles/chat";
import {
  GangGameBoard,
  GangResultModal,
  type Player,
  type ChipData,
  type PreviousChipsData,
  type PlayerResult,
} from "../components/gang";

interface ChatMessageData {
  sender?: string;
  message: string;
  isSystem?: boolean;
}

interface LocationState {
  memberCount?: number;
  players?: { nickname: string; order: number }[];
}

export default function Room() {
  const { roomName } = useParams<{ roomName: string }>();
  const { connected, send, subscribe } = useWebSocket();
  const nickname = roomName ? getNicknameForRoom(roomName) : "";
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  // Lobby에서 진입 시 플래그가 있고, 소비 후 삭제. 새로고침 시에는 플래그 없음
  const [isRefresh] = useState(() => {
    const key = `joined:${roomName}`;
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      return false;
    }
    return true;
  });

  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [memberCount, setMemberCount] = useState(
    locationState?.memberCount ?? 0,
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>(() =>
    getGameConfig("gang"),
  );
  const [deck, setDeck] = useState<Card[]>(() => gameConfig.createDeck());
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [openCards, setOpenCards] = useState<Card[]>([]);
  const [hostNickname, setHostNickname] = useState<string>("");
  const [chips, setChips] = useState<ChipData[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previousChips, setPreviousChips] = useState<PreviousChipsData>({});
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [winLossRecord, setWinLossRecord] = useState<Record<string, boolean[]>>({});
  const [players, setPlayers] = useState<Player[]>(() => {
    if (locationState?.players) {
      return locationState.players.map((p) => ({
        nickname: p.nickname,
        isMe: p.nickname === nickname,
        order: p.order,
      }));
    }
    return [{ nickname, isMe: true, order: 0 }];
  });
  const [notification, setNotification] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>([]);
  const [nextRoundReadyPlayers, setNextRoundReadyPlayers] = useState<string[]>([]);
  const [isNextRoundReady, setIsNextRoundReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notificationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      console.log("[Room] 이벤트 수신:", event, data);
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
              {
                message: msgData.message,
                sender: msgData.sender,
                isSystem: msgData.isSystem,
              },
            ]);
            // 채팅이 닫혀있을 때만 알림 표시
            setHasUnreadMessages((prevUnread) => !isChatOpen || prevUnread);
          }
          break;
        }
        case "roomCreated":
        case "roomJoined": {
          const joinData = data as {
            name: string;
            memberCount?: number;
            players?: { nickname: string; order: number }[];
            deck?: Card[];
            playerHands?: PlayerHand[];
            myHand?: Card[];
            gameType?: string;
            gameStarted?: boolean;
            openCards?: Card[];
            hostNickname?: string;
            chips?: ChipData[];
            currentStep?: number;
            readyPlayers?: string[];
            previousChips?: Record<string, number[]>;
            winLossRecord?: Record<string, boolean[]>;
          };
          if (joinData.name === roomName) {
            if (joinData.gameType) {
              const config = getGameConfig(joinData.gameType);
              setGameConfig(config);
            }
            if (joinData.memberCount) {
              setMemberCount(joinData.memberCount);
            }
            if (joinData.players) {
              setPlayers(
                joinData.players.map((p) => ({
                  nickname: p.nickname,
                  isMe: p.nickname === nickname,
                  order: p.order,
                })),
              );
            }
            if (joinData.deck && joinData.deck.length > 0) {
              setDeck(joinData.deck);
            }
            if (joinData.playerHands) {
              setPlayerHands(joinData.playerHands);
            }
            if (joinData.myHand && joinData.myHand.length > 0) {
              setMyHand(joinData.myHand);
            }
            if (joinData.gameStarted !== undefined) {
              setGameStarted(joinData.gameStarted);
            }
            if (joinData.openCards) {
              setOpenCards(joinData.openCards);
            }
            if (joinData.hostNickname !== undefined) {
              setHostNickname(joinData.hostNickname);
            }
            if (joinData.chips !== undefined) {
              setChips(joinData.chips);
            }
            if (joinData.currentStep !== undefined) {
              setCurrentStep(joinData.currentStep);
            }
            if (joinData.readyPlayers !== undefined) {
              setReadyPlayers(joinData.readyPlayers);
            }
            if (joinData.previousChips !== undefined) {
              setPreviousChips(joinData.previousChips);
            }
            if (joinData.winLossRecord !== undefined) {
              setWinLossRecord(joinData.winLossRecord);
            }
          }
          break;
        }
        case "playerList": {
          const listData = data as {
            roomName: string;
            players: { nickname: string; order: number }[];
          };
          if (listData.roomName === roomName) {
            setPlayers(
              listData.players.map((p) => ({
                nickname: p.nickname,
                isMe: p.nickname === nickname,
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
            nickname?: string;
            order?: number;
            players?: { nickname: string; order: number }[];
          };
          if (joinData.roomName === roomName) {
            setMemberCount(joinData.memberCount);
            if (joinData.players) {
              setPlayers(
                joinData.players.map((p) => ({
                  nickname: p.nickname,
                  isMe: p.nickname === nickname,
                  order: p.order,
                })),
              );
            } else if (joinData.nickname) {
              setPlayers((prev) => {
                if (prev.some((p) => p.nickname === joinData.nickname))
                  return prev;
                return [
                  ...prev,
                  {
                    nickname: joinData.nickname!,
                    isMe: false,
                    order: joinData.order,
                  },
                ];
              });
            }
            setMessages((prev) => [
              ...prev,
              {
                message: `${joinData.nickname || "누군가"} 입장했습니다.`,
                isSystem: true,
              },
            ]);
          }
          break;
        }
        case "userLeft": {
          const leftData = data as {
            roomName: string;
            memberCount: number;
            nickname?: string;
          };
          if (leftData.roomName === roomName) {
            setMemberCount(leftData.memberCount);
            if (leftData.nickname) {
              setPlayers((prev) =>
                prev.filter((p) => p.nickname !== leftData.nickname),
              );
            }
            setMessages((prev) => [
              ...prev,
              {
                message: `${leftData.nickname || "누군가"} 퇴장했습니다.`,
                isSystem: true,
              },
            ]);
          }
          break;
        }
        case "roomList": {
          const listData = data as {
            rooms: { name: string; memberCount: number }[];
          };
          const currentRoom = listData.rooms.find((r) => r.name === roomName);
          if (currentRoom) {
            setMemberCount(currentRoom.memberCount);
          }
          break;
        }
        case "roomLeft":
          navigate("/");
          break;
        case "error": {
          const errorData = data as { message: string };
          alert(errorData.message);
          // 방이 존재하지 않으면 로비로 이동
          if (errorData.message.includes("방이 존재하지 않습니다")) {
            if (roomName) {
              clearNicknameForRoom(roomName);
              sessionStorage.removeItem(`joined:${roomName}`);
            }
            navigate("/");
          }
          break;
        }
        case "cardDrawn": {
          const cardData = data as {
            roomName: string;
            card: Card;
            deck: Card[];
            playerNickname: string;
            playerHands: PlayerHand[];
          };
          if (cardData.roomName === roomName) {
            setDeck(cardData.deck);
            setPlayerHands(cardData.playerHands);
            if (cardData.playerNickname === nickname) {
              setMyHand((prev) => [...prev, cardData.card]);
            }
          }
          break;
        }
        case "gameStarted": {
          const gameData = data as {
            roomName: string;
            deck: Card[];
            myHand?: Card[];
            playerHands?: PlayerHand[];
            openCards?: Card[];
            chips?: ChipData[];
          };
          if (gameData.roomName === roomName) {
            setGameStarted(true);
            setDeck(gameData.deck);
            if (gameData.myHand) {
              setMyHand(gameData.myHand);
            }
            if (gameData.playerHands) {
              setPlayerHands(gameData.playerHands);
            }
            if (gameData.openCards) {
              setOpenCards(gameData.openCards);
            }
            if (gameData.chips) {
              setChips(gameData.chips);
            }
            // 게임 시작 시 모든 상태 초기화
            setCurrentStep(1);
            setPreviousChips({});
            setIsReady(false);
            setReadyPlayers([]);
            setGameFinished(false);
            setShowResults(false);
            setPlayerResults([]);
            setNextRoundReadyPlayers([]);
            setIsNextRoundReady(false);
          }
          break;
        }
        case "chipSelected": {
          const chipData = data as {
            roomName: string;
            chips: ChipData[];
            readyPlayers?: string[];
            stolenFrom?: string;
            stolenBy?: string;
            chipNumber?: number;
          };
          if (chipData.roomName === roomName) {
            // 칩 빼앗김 감지
            if (
              chipData.stolenFrom &&
              chipData.stolenBy &&
              chipData.chipNumber
            ) {
              const message = `${chipData.stolenBy}님이 ${chipData.stolenFrom}님의 ${chipData.chipNumber}번 칩을 가져갔습니다!`;
              setNotification(message);
              setShowNotification(true);

              // 기존 타이머 클리어
              if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
              }

              // 3초 후 알림 숨김
              notificationTimerRef.current = setTimeout(() => {
                setShowNotification(false);
              }, 3000);

              // 내가 빼앗긴 경우 ready 해제
              if (chipData.stolenFrom === nickname) {
                setIsReady(false);
              }
            }

            setChips(chipData.chips);

            // 서버에서 보낸 readyPlayers 동기화
            if (chipData.readyPlayers) {
              setReadyPlayers(chipData.readyPlayers);
            }
          }
          break;
        }
        case "playerReadyUpdate": {
          const readyData = data as {
            roomName: string;
            readyPlayers: string[];
            allReady: boolean;
          };
          if (readyData.roomName === roomName) {
            setReadyPlayers(readyData.readyPlayers);
            // 내가 준비 완료 상태였는데 목록에 없으면 준비 해제됨
            if (isReady && !readyData.readyPlayers.includes(nickname)) {
              setIsReady(false);
            }
          }
          break;
        }
        case "nextStep": {
          const stepData = data as {
            roomName: string;
            currentStep: number;
            openCards: Card[];
            chips: ChipData[];
            deck: Card[];
            previousChips: PreviousChipsData;
          };
          if (stepData.roomName === roomName) {
            setCurrentStep(stepData.currentStep);
            setOpenCards(stepData.openCards);
            setChips(stepData.chips);
            setDeck(stepData.deck);
            setPreviousChips(stepData.previousChips);
            setIsReady(false);
            setReadyPlayers([]);
          }
          break;
        }
        case "gameFinished": {
          const finishData = data as {
            roomName: string;
            finalChips: ChipData[];
            previousChips: PreviousChipsData;
            openCards: Card[];
            playerResults: PlayerResult[];
            isWinner?: boolean;
            winLossRecord?: Record<string, boolean[]>;
          };
          if (finishData.roomName === roomName) {
            setGameFinished(true);
            setPlayerResults(finishData.playerResults);
            setOpenCards(finishData.openCards);
            if (finishData.winLossRecord !== undefined) {
              setWinLossRecord(finishData.winLossRecord);
            }
          }
          break;
        }
        case "nextRoundReadyUpdate": {
          const nextRoundData = data as {
            roomName: string;
            readyPlayers: string[];
            allReady: boolean;
          };
          if (nextRoundData.roomName === roomName) {
            setNextRoundReadyPlayers(nextRoundData.readyPlayers);
            if (nextRoundData.allReady) {
              // 모두 준비되면 상태 초기화
              setNextRoundReadyPlayers([]);
              setIsNextRoundReady(false);
            }
          }
          break;
        }
        case "kicked": {
          const kickData = data as {
            roomName: string;
            message: string;
          };
          if (kickData.roomName === roomName) {
            alert(kickData.message);
            navigate("/");
          }
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName, navigate, nickname, isChatOpen]);

  // 새로고침 시에만 재입장 (Lobby에서 진입 시 joined 플래그가 있음)
  useEffect(() => {
    if (connected && roomName && isRefresh) {
      const timer = setTimeout(() => {
        console.log("[Room] 재연결 joinRoom 전송:", { roomName, nickname });
        send("joinRoom", { name: roomName, nickname });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connected, roomName, send, nickname, isRefresh]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !roomName) return;
    send("roomMessage", {
      roomName,
      message: `${nickname}: ${inputMessage}`,
    });
    setInputMessage("");
  };

  const leaveRoom = () => {
    if (roomName) {
      send("leaveRoom", { name: roomName });
      clearNicknameForRoom(roomName);
      sessionStorage.removeItem(`joined:${roomName}`);
    }
  };

  // 방장 여부 확인: hostNickname이 설정되지 않았으면(빈 문자열) 첫 번째 플레이어가 방장
  const isHost = hostNickname
    ? nickname === hostNickname
    : players.length > 0 && players[0]?.nickname === nickname;

  // 족보 계산
  const myHandRank: HandResult | null =
    myHand.length > 0 && openCards.length > 0
      ? evaluateHand(myHand, openCards)
      : null;

  const handleStartGame = () => {
    if (!roomName || memberCount < 3) return;
    send("startGame", { roomName });
  };

  const handleChipClick = (chipNumber: number) => {
    if (!roomName) return;

    send("selectChip", { roomName, chipNumber });
  };

  const handleReady = () => {
    if (!roomName) return;
    const myChip = chips.find((c) => c.owner === nickname);
    if (!myChip) return;

    setIsReady(true);
    send("playerReady", { roomName });
  };

  const handleNextRound = () => {
    if (!roomName || isNextRoundReady) return;
    setIsNextRoundReady(true);
    send("readyNextRound", { roomName });
  };

  const handleKickPlayer = (targetNickname: string) => {
    if (!roomName) return;
    if (window.confirm(`${targetNickname}님을 강퇴하시겠습니까?`)) {
      send("kickPlayer", { roomName, targetNickname });
    }
  };

  return (
    <RoomPage>
      <RoomHeader>
        <h1>
          {roomName}{" "}
          <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 400 }}>
            {gameConfig.displayName}
          </span>
        </h1>
        <RoomInfo>
          <ChatToggleButtonWrapper>
            <ChatToggleButton
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) {
                  setHasUnreadMessages(false);
                }
              }}
              aria-label="채팅"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </ChatToggleButton>
            {hasUnreadMessages && !isChatOpen && <ChatNotificationBadge />}
          </ChatToggleButtonWrapper>
          <MemberCount>{memberCount}명 참여중</MemberCount>
          <LeaveButton onClick={leaveRoom} aria-label="나가기">
            <span className="leave-text">나가기</span>
            <svg
              className="leave-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </LeaveButton>
        </RoomInfo>
      </RoomHeader>

      <RoomContent>
        <GameArea>
          <GangGameBoard
            gameStarted={gameStarted}
            isHost={isHost}
            memberCount={memberCount}
            currentStep={currentStep}
            players={players}
            nickname={nickname}
            playerHands={playerHands}
            deck={deck}
            openCards={openCards}
            myHand={myHand}
            chips={chips}
            previousChips={previousChips}
            readyPlayers={readyPlayers}
            winLossRecord={winLossRecord}
            notification={notification}
            showNotification={showNotification}
            myHandRank={myHandRank}
            isReady={isReady}
            gameConfig={gameConfig}
            onStartGame={handleStartGame}
            onChipClick={handleChipClick}
            onReady={handleReady}
            onKickPlayer={handleKickPlayer}
          />
        </GameArea>

        <ChatArea $isOpen={isChatOpen}>
          <ChatHeaderMobile>
            <span>채팅</span>
            <ChatCloseButton onClick={() => setIsChatOpen(false)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </ChatCloseButton>
          </ChatHeaderMobile>
          <ChatMessages>
            {messages.length === 0 ? (
              <NoMessages>메시지가 없습니다.</NoMessages>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage key={index} $isSystem={msg.isSystem}>
                  {msg.message}
                </ChatMessage>
              ))
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInputArea>
            <ChatInput
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="메시지 입력..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={!connected}
            />
            <ChatSendButton
              onClick={sendMessage}
              disabled={!connected || !inputMessage.trim()}
            >
              전송
            </ChatSendButton>
          </ChatInputArea>
        </ChatArea>
      </RoomContent>

      {gameFinished && (
        <GangResultModal
          playerResults={playerResults}
          openCards={openCards}
          showResults={showResults}
          isNextRoundReady={isNextRoundReady}
          nextRoundReadyPlayers={nextRoundReadyPlayers}
          memberCount={memberCount}
          onClose={() => setShowResults(false)}
          onShowResults={() => setShowResults(true)}
          onNextRound={handleNextRound}
        />
      )}
    </RoomPage>
  );
}
