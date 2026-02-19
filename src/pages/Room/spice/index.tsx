import { useEffect, useState } from "react";
import {
  RoomPage,
  RoomHeader,
  RoomInfo,
  MemberCount,
  LeaveButton,
  RoomContent,
} from "../../../styles/pages/Room";
import { GameArea } from "../../../styles/game";
import type { Card, PlayerHand } from "../../../types/game";
import {
  ChatToggleButton,
  ChatToggleButtonWrapper,
  ChatNotificationBadge,
  ChatOverlay,
  ChatArea,
  ChatHeaderMobile,
  ChatCloseButton,
  ChatMessages,
  NoMessages,
  ChatMessage,
  ChatInputArea,
  ChatInput,
  ChatSendButton,
} from "../../../styles/chat";
import SpiceGameBoard from "../../../components/spice/SpiceGameBoard";
import SpiceResultModal from "../../../components/spice/SpiceResultModal";
import SpiceHelpModal from "../../../components/spice/SpiceHelpModal";
import type { PlayerResult } from "../../../components/gang/types";
import { useRoomBase, type LocationState } from "../common/useRoomBase";

export default function SpiceRoom() {
  const {
    roomName,
    playerId,
    send,
    subscribe,
    gameConfig,
    players,
    memberCount,
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
  } = useRoomBase();

  const ls = locationState as LocationState & {
    deck?: Card[];
    myHand?: Card[];
    playerHands?: PlayerHand[];
    openCards?: Card[];
    gameStarted?: boolean;
    gameFinished?: boolean;
    gameOver?: boolean;
    gameOverResult?: "victory" | "defeat" | null;
    lastGameResults?: PlayerResult[];
  } | null;

  const [deck, setDeck] = useState<Card[]>(() => (ls?.deck as Card[]) ?? []);
  const [myHand, setMyHand] = useState<Card[]>(() => (ls?.myHand as Card[]) ?? []);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>(() => (ls?.playerHands as PlayerHand[]) ?? []);
  const [gameStarted, setGameStarted] = useState(ls?.gameStarted ?? false);
  const [openCards, setOpenCards] = useState<Card[]>(() => (ls?.openCards as Card[]) ?? []);
  const [notification] = useState("");
  const [showNotification] = useState(false);
  const [gameFinished, setGameFinished] = useState(ls?.gameFinished ?? false);
  const [showResults, setShowResults] = useState(false);
  const [playerResults, setPlayerResults] = useState<PlayerResult[]>(() => (ls?.lastGameResults as PlayerResult[]) ?? []);
  const [nextRoundReadyPlayers, setNextRoundReadyPlayers] = useState<string[]>([]);
  const [isNextRoundReady, setIsNextRoundReady] = useState(false);
  const [gameOver, setGameOver] = useState(ls?.gameOver ?? false);
  const [gameOverResult, setGameOverResult] = useState<"victory" | "defeat" | null>((ls?.gameOverResult as "victory" | "defeat" | null) ?? null);

  // 향신료 전용 소켓 이벤트
  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      switch (event) {
        case "roomCreated":
        case "roomJoined": {
          const joinData = data as {
            name: string;
            deck?: Card[];
            playerHands?: PlayerHand[];
            myHand?: Card[];
            gameStarted?: boolean;
            gameFinished?: boolean;
            lastGameResults?: PlayerResult[];
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
            openCards?: Card[];
          };
          if (joinData.name === roomName) {
            if (joinData.deck && joinData.deck.length > 0) setDeck(joinData.deck);
            if (joinData.playerHands) setPlayerHands(joinData.playerHands);
            if (joinData.myHand && joinData.myHand.length > 0) setMyHand(joinData.myHand);
            if (joinData.gameStarted !== undefined) setGameStarted(joinData.gameStarted);
            if (joinData.gameFinished !== undefined) setGameFinished(joinData.gameFinished);
            if (joinData.lastGameResults !== undefined) setPlayerResults(joinData.lastGameResults);
            if (joinData.gameOver !== undefined) setGameOver(joinData.gameOver);
            if (joinData.gameOverResult !== undefined) setGameOverResult(joinData.gameOverResult);
            if (joinData.openCards) setOpenCards(joinData.openCards);
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
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
          };
          if (gameData.roomName === roomName) {
            setGameStarted(true);
            setDeck(gameData.deck);
            if (gameData.myHand) setMyHand(gameData.myHand);
            if (gameData.playerHands) setPlayerHands(gameData.playerHands);
            if (gameData.openCards) setOpenCards(gameData.openCards);
            setGameFinished(false);
            setShowResults(false);
            setPlayerResults([]);
            setNextRoundReadyPlayers([]);
            setIsNextRoundReady(false);
            setGameOver(gameData.gameOver ?? false);
            setGameOverResult(gameData.gameOverResult ?? null);
          }
          break;
        }
        case "gameFinished": {
          const finishData = data as {
            roomName: string;
            openCards: Card[];
            playerResults: PlayerResult[];
            gameOver?: boolean;
            gameOverResult?: "victory" | "defeat" | null;
          };
          if (finishData.roomName === roomName) {
            if (finishData.gameOver === true) {
              setGameStarted(false);
              setGameOver(true);
              setGameOverResult(finishData.gameOverResult ?? null);
            }
            setGameFinished(true);
            setShowResults(true);
            setPlayerResults(finishData.playerResults);
            setOpenCards(finishData.openCards);
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
              setNextRoundReadyPlayers([]);
              setIsNextRoundReady(false);
            }
          }
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName]);

  const handleStartGame = () => {
    if (!roomName) return;
    send("startGame", { roomName });
  };
  const handleNextRound = () => {
    if (!roomName || isNextRoundReady) return;
    setIsNextRoundReady(true);
    send("readyNextRound", { roomName });
  };
  const handleRestart = () => {
    if (!roomName) return;
    handleStartGame();
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
          <div
            style={{
              background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "50%",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer",
              width: "22px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              transition: "all 0.3s",
            }}
            onClick={() => setShowHelpModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(243, 156, 18, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="게임 설명 보기"
          >
            ?
          </div>
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
          <SpiceGameBoard
            gameStarted={gameStarted}
            isHost={isHost}
            memberCount={memberCount}
            players={players}
            playerId={playerId}
            playerHands={playerHands}
            deck={deck}
            openCards={openCards}
            myHand={myHand}
            notification={notification}
            showNotification={showNotification}
            gameOver={gameOver}
            gameConfig={gameConfig}
            onStartGame={handleStartGame}
            onKickPlayer={handleKickPlayer}
          />
          <ChatToggleButtonWrapper>
            <ChatToggleButton
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (!isChatOpen) setHasUnreadMessages(false);
              }}
              aria-label="채팅"
            >
              <svg
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

          {gameFinished && (
            <SpiceResultModal
              playerResults={playerResults}
              openCards={openCards}
              showResults={showResults}
              isNextRoundReady={isNextRoundReady}
              nextRoundReadyPlayers={nextRoundReadyPlayers}
              memberCount={memberCount}
              gameOver={gameOver}
              gameOverResult={gameOverResult}
              isHost={isHost}
              onClose={() => setShowResults(false)}
              onShowResults={() => setShowResults(true)}
              onNextRound={handleNextRound}
              onRestart={handleRestart}
            />
          )}
        </GameArea>

        <ChatOverlay $isOpen={isChatOpen} onClick={() => setIsChatOpen(false)} />

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
            />
            <ChatSendButton onClick={sendMessage} disabled={!inputMessage.trim()}>
              전송
            </ChatSendButton>
          </ChatInputArea>
        </ChatArea>
      </RoomContent>

      <SpiceHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </RoomPage>
  );
}
