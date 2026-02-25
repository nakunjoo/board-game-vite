import { useEffect, useState } from "react";
import type { Card, PlayerHand } from "../../../types/game";
import SkulkingGameBoard from "../../../components/skulking/SkulkingGameBoard";
import { SkulkingGameOverModal } from "../../../components/skulking/game/SkulkingResultModal";
import SkulkingHelpModal from "../../../components/skulking/SkulkingHelpModal";
import type { TrickEntry, RoundResult, GameOverResult } from "../../../components/skulking/types";
import { useRoomBase, type LocationState } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";

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

  const [gameOverResult, setGameOverResult] = useState<GameOverResult | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [roundEndCountdown, setRoundEndCountdown] = useState<number | null>(null);
  const [trickWinnerId, setTrickWinnerId] = useState<string | null>(null);

  // 선뽑기 상태
  const [isFirstDraw, setIsFirstDraw] = useState(false);
  const [myDrawnNumber, setMyDrawnNumber] = useState<number | null>(null);
  const [firstDrawResults, setFirstDrawResults] = useState<Record<string, number>>({});
  const [firstDrawFinished, setFirstDrawFinished] = useState(false);
  const [firstDrawWinnerId, setFirstDrawWinnerId] = useState<string | null>(null);
  const [firstDrawWinnerNickname, setFirstDrawWinnerNickname] = useState<string | null>(null);
  const [firstDrawCount, setFirstDrawCount] = useState(0);

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
            skulkingIsFirstDraw?: boolean;
            skulkingDrawnCount?: number;
          };
          if (d.name !== roomName) break;
          if (d.skulkingIsFirstDraw) {
            setIsFirstDraw(true);
            setFirstDrawCount(d.skulkingDrawnCount ?? 0);
            break;
          }
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
          setIsFirstDraw(false);
          setMyDrawnNumber(null);
          setFirstDrawResults({});
          setFirstDrawFinished(false);
          setFirstDrawWinnerId(null);
          setFirstDrawWinnerNickname(null);
          setFirstDrawCount(0);
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
          setTrickWinnerId(null);
          break;
        }
        case "skulkingFirstDrawStarted": {
          setIsFirstDraw(true);
          setMyDrawnNumber(null);
          setFirstDrawResults({});
          setFirstDrawFinished(false);
          setFirstDrawWinnerId(null);
          setFirstDrawWinnerNickname(null);
          setFirstDrawCount(0);
          break;
        }
        case "skulkingFirstDrawResult": {
          const d = data as { drawnNumber: number; drawnCount: number };
          setMyDrawnNumber(d.drawnNumber);
          setFirstDrawCount(d.drawnCount);
          break;
        }
        case "skulkingFirstDrawProgress": {
          const d = data as { drawnCount: number };
          setFirstDrawCount(d.drawnCount);
          break;
        }
        case "skulkingFirstDrawFinished": {
          const d = data as { results: Record<string, number>; firstPlayerId: string; firstNickname: string };
          setFirstDrawResults(d.results);
          setFirstDrawFinished(true);
          setFirstDrawWinnerId(d.firstPlayerId);
          setFirstDrawWinnerNickname(d.firstNickname);
          break;
        }
        case "skulkingBidPhase": {
          const d = data as { round: number; bids: Record<string, number> };
          setRound(d.round);
          setPhase("bid");
          setCurrentBidPlayerId(null);
          setBids(d.bids);
          break;
        }
        case "skulkingBidUpdate": {
          const d = data as { bids: Record<string, number> };
          setBids(d.bids);
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
        case "myHandUpdate": {
          const d = data as { myHand: Card[] };
          setMyHand(d.myHand);
          break;
        }
        case "skulkingTurnUpdate": {
          const d = data as { currentPlayerId: string; isNewTrick?: boolean };
          if (d.isNewTrick) {
            setCurrentTrick([]);
            setTrickWinnerId(null);
          }
          setCurrentPlayerId(d.currentPlayerId);
          break;
        }
        case "skulkingTrickResult": {
          const d = data as { winnerId: string; tricks: Record<string, number> };
          setTricks(d.tricks);
          setTrickWinnerId(d.winnerId);
          break;
        }
        case "skulkingRoundResult": {
          const d = data as RoundResult;
          setScores(d.totalScores);
          setPhase(null);
          if (!d.isLastRound) {
            setRoundEndCountdown(5);
            const tick = setInterval(() => {
              setRoundEndCountdown((c) => {
                if (c === null || c <= 1) {
                  clearInterval(tick);
                  return null;
                }
                return c - 1;
              });
            }, 1000);
            if (isHost) {
              setTimeout(() => {
                send("skulkingNextRound", { roomName });
              }, 5000);
            }
          }
          break;
        }
        case "skulkingGameOver": {
          const d = data as GameOverResult;
          setGameOverResult(d);
          setShowGameOver(true);
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
  };

  const handleDrawFirstCard = () => {
    if (!roomName || myDrawnNumber !== null) return;
    send("skulkingDrawFirstCard", { roomName });
  };

  const handleBid = (bid: number) => {
    if (!roomName) return;
    send("skulkingBid", { roomName, bid });
  };

  const handlePlayCard = (cardIndex: number, tigressDeclared?: "escape" | "pirate") => {
    if (!roomName) return;
    send("skulkingPlayCard", { roomName, cardIndex, tigressDeclared });
  };

  return (
    <RoomLayout
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        boxShadow: "0 4px 12px rgba(231, 76, 60, 0.4)",
      }}
      onHelp={() => setShowHelpModal(true)}
      onLeave={leaveRoom}
      messages={messages}
      inputMessage={inputMessage}
      isChatOpen={isChatOpen}
      hasUnreadMessages={hasUnreadMessages}
      messagesEndRef={messagesEndRef}
      onInputChange={setInputMessage}
      onSendMessage={sendMessage}
      onToggleChat={() => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) setHasUnreadMessages(false);
      }}
      onCloseChat={() => setIsChatOpen(false)}
      modals={
        <SkulkingHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      }
    >
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
        roundEndCountdown={roundEndCountdown}
        trickWinnerId={trickWinnerId}
        isFirstDraw={isFirstDraw}
        myDrawnNumber={myDrawnNumber}
        firstDrawResults={firstDrawResults}
        firstDrawFinished={firstDrawFinished}
        firstDrawWinnerId={firstDrawWinnerId}
        firstDrawWinnerNickname={firstDrawWinnerNickname}
        firstDrawCount={firstDrawCount}
        onStartGame={handleStartGame}
        onBid={handleBid}
        onPlayCard={handlePlayCard}
        onDrawFirstCard={handleDrawFirstCard}
        onKickPlayer={handleKickPlayer}
      />

      {showGameOver && gameOverResult && (
        <SkulkingGameOverModal
          result={gameOverResult}
          players={players.map((p) => ({ playerId: p.playerId, nickname: p.nickname }))}
          isHost={isHost}
        />
      )}
    </RoomLayout>
  );
}
