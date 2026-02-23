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
import SkulkingGameBoard from "../../../components/skulking/SkulkingGameBoard";
import { SkulkingRoundResultModal, SkulkingGameOverModal } from "../../../components/skulking/SkulkingResultModal";
import SkulkingHelpModal from "../../../components/skulking/SkulkingHelpModal";
import type { TrickEntry, RoundResult, GameOverResult } from "../../../components/skulking/types";
import { useRoomBase, type LocationState } from "../common/useRoomBase";

export default function SkulkingRoom() {
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
    myHand?: Card[];
    playerHands?: PlayerHand[];
    gameStarted?: boolean;
    gameOver?: boolean;
    skulkingRound?: number;
    skulkingPhase?: "bid" | "play";
    skulkingCurrentBidPlayerId?: string | null;
    bids?: Record<string, number>;
    tricks?: Record<string, number>;
    scores?: Record<string, number>;
    roundScores?: Record<string, number[]>;
    skulkingCurrentPlayerId?: string | null;
    currentTrick?: TrickEntry[];
  } | null;

  const [gameStarted, setGameStarted] = useState(ls?.gameStarted ?? false);
  const [gameOver, setGameOver] = useState(ls?.gameOver ?? false);
  const [myHand, setMyHand] = useState<Card[]>(() => (ls?.myHand as Card[]) ?? []);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>(() => (ls?.playerHands as PlayerHand[]) ?? []);

  const [round, setRound] = useState(ls?.skulkingRound ?? 1);
  const [phase, setPhase] = useState<"bid" | "play" | null>(ls?.skulkingPhase ?? null);
  const [currentBidPlayerId, setCurrentBidPlayerId] = useState<string | null>(ls?.skulkingCurrentBidPlayerId ?? null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(ls?.skulkingCurrentPlayerId ?? null);
  const [currentTrick, setCurrentTrick] = useState<TrickEntry[]>(() => (ls?.currentTrick as TrickEntry[]) ?? []);
  const [bids, setBids] = useState<Record<string, number>>(ls?.bids ?? {});
  const [tricks, setTricks] = useState<Record<string, number>>(ls?.tricks ?? {});
  const [scores, setScores] = useState<Record<string, number>>(ls?.scores ?? {});

  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [gameOverResult, setGameOverResult] = useState<GameOverResult | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe((event, data) => {
      switch (event) {
        case "roomCreated":
        case "roomJoined": {
          const d = data as {
            name?: string;
            myHand?: Card[];
            playerHands?: PlayerHand[];
            gameStarted?: boolean;
            gameOver?: boolean;
            skulkingRound?: number;
            skulkingPhase?: "bid" | "play";
            skulkingCurrentBidPlayerId?: string | null;
            bids?: Record<string, number>;
            tricks?: Record<string, number>;
            scores?: Record<string, number>;
            skulkingCurrentPlayerId?: string | null;
            currentTrick?: TrickEntry[];
          };
          if (d.name !== roomName) break;
          if (d.myHand) setMyHand(d.myHand);
          if (d.playerHands) setPlayerHands(d.playerHands);
          if (d.gameStarted !== undefined) setGameStarted(d.gameStarted);
          if (d.gameOver !== undefined) setGameOver(d.gameOver);
          if (d.skulkingRound) setRound(d.skulkingRound);
          if (d.skulkingPhase) setPhase(d.skulkingPhase);
          if (d.skulkingCurrentBidPlayerId !== undefined) setCurrentBidPlayerId(d.skulkingCurrentBidPlayerId);
          if (d.bids) setBids(d.bids);
          if (d.tricks) setTricks(d.tricks);
          if (d.scores) setScores(d.scores);
          if (d.skulkingCurrentPlayerId !== undefined) setCurrentPlayerId(d.skulkingCurrentPlayerId);
          if (d.currentTrick) setCurrentTrick(d.currentTrick);
          break;
        }
        case "skulkingRoundStarted": {
          const d = data as {
            round: number;
            myHand: Card[];
            playerHands: PlayerHand[];
            scores: Record<string, number>;
          };
          setGameStarted(true);
          setRound(d.round);
          setMyHand(d.myHand);
          setPlayerHands(d.playerHands);
          setScores(d.scores);
          setCurrentTrick([]);
          setBids({});
          setTricks({});
          setPhase(null);
          setCurrentBidPlayerId(null);
          setCurrentPlayerId(null);
          setShowRoundResult(false);
          break;
        }
        case "skulkingBidPhase": {
          const d = data as { round: number; currentBidPlayerId: string; bids: Record<string, number> };
          setRound(d.round);
          setPhase("bid");
          setCurrentBidPlayerId(d.currentBidPlayerId);
          setBids(d.bids);
          break;
        }
        case "skulkingBidUpdate": {
          const d = data as { bids: Record<string, number>; nextBidPlayerId: string | null };
          setBids(d.bids);
          setCurrentBidPlayerId(d.nextBidPlayerId);
          break;
        }
        case "skulkingPlayPhase": {
          const d = data as { leadPlayerId: string; bids: Record<string, number> };
          setPhase("play");
          setCurrentPlayerId(d.leadPlayerId);
          setCurrentBidPlayerId(null);
          setBids(d.bids);
          setCurrentTrick([]);
          break;
        }
        case "skulkingCardPlayed": {
          const d = data as { currentTrick: TrickEntry[]; playerHands: PlayerHand[] };
          setCurrentTrick(d.currentTrick);
          setPlayerHands(d.playerHands);
          break;
        }
        case "skulkingTurnUpdate": {
          const d = data as { currentPlayerId: string };
          setCurrentPlayerId(d.currentPlayerId);
          setTimeout(() => setCurrentTrick([]), 1400);
          break;
        }
        case "skulkingTrickResult": {
          const d = data as { tricks: Record<string, number> };
          setTricks(d.tricks);
          break;
        }
        case "skulkingRoundResult": {
          const d = data as RoundResult;
          setRoundResult(d);
          setShowRoundResult(true);
          setPhase(null);
          break;
        }
        case "skulkingGameOver": {
          const d = data as GameOverResult;
          setGameOverResult(d);
          setShowGameOver(true);
          setShowRoundResult(false);
          setGameStarted(false);
          setGameOver(true);
          break;
        }
      }
    });
    return unsubscribe;
  }, [subscribe, roomName]);

  const handleStartGame = () => {
    if (!roomName) return;
    send("startGame", { roomName });
    setGameStarted(true);
  };

  const handleBid = (bid: number) => {
    if (!roomName) return;
    send("skulkingBid", { roomName, bid });
  };

  const handlePlayCard = (cardIndex: number, tigressDeclared?: "escape" | "pirate") => {
    if (!roomName) return;
    send("skulkingPlayCard", { roomName, cardIndex, tigressDeclared });
  };

  const handleNextRound = () => {
    if (!roomName) return;
    send("skulkingNextRound", { roomName });
    setShowRoundResult(false);
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
              background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
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
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(231, 76, 60, 0.4)";
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
            <svg className="leave-icon" width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </LeaveButton>
        </RoomInfo>
      </RoomHeader>

      <RoomContent>
        <GameArea>
          <SkulkingGameBoard
            round={round}
            phase={phase}
            players={players}
            myHand={myHand}
            playerHands={playerHands}
            currentTrick={currentTrick}
            currentBidPlayerId={currentBidPlayerId}
            currentPlayerId={currentPlayerId}
            myPlayerId={playerId}
            isHost={isHost}
            memberCount={memberCount}
            gameStarted={gameStarted}
            gameOver={gameOver}
            bids={bids}
            tricks={tricks}
            scores={scores}
            onStartGame={handleStartGame}
            onBid={handleBid}
            onPlayCard={handlePlayCard}
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </ChatToggleButton>
            {hasUnreadMessages && !isChatOpen && <ChatNotificationBadge />}
          </ChatToggleButtonWrapper>

          {showRoundResult && roundResult && !showGameOver && (
            <SkulkingRoundResultModal
              result={roundResult}
              players={players.map((p) => ({ playerId: p.playerId, nickname: p.nickname }))}
              isHost={isHost}
              onNextRound={handleNextRound}
            />
          )}

          {showGameOver && gameOverResult && (
            <SkulkingGameOverModal
              result={gameOverResult}
              players={players.map((p) => ({ playerId: p.playerId, nickname: p.nickname }))}
              isHost={isHost}
            />
          )}
        </GameArea>

        <ChatOverlay $isOpen={isChatOpen} onClick={() => setIsChatOpen(false)} />

        <ChatArea $isOpen={isChatOpen}>
          <ChatHeaderMobile>
            <span>채팅</span>
            <ChatCloseButton onClick={() => setIsChatOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      <SkulkingHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </RoomPage>
  );
}
