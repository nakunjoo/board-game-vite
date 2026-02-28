import { useEffect, useState } from "react";
import type { Card, PlayerHand } from "../../../types/game";
import SkulkingGameBoard from "../../../components/skulking/SkulkingGameBoard";
import { SkulkingGameOverModal } from "../../../components/skulking/game/SkulkingResultModal";
import SkulkingHelpModal from "../../../components/skulking/SkulkingHelpModal";
import type { TrickEntry, RoundResult, GameOverResult } from "../../../components/skulking/types";
import { useRoomBase, type LocationState } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";
import SkulkingTestPanel from "../../../components/skulking/SkulkingTestPanel";
import { SKULKING_SUIT_LABELS, SKULKING_SUIT_NAMES, isSpecialCard } from "../../../utils/games/skulking";

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
  } = useRoomBase();

  const addGameLog = (message: string) => {
    setMessages((prev) => [...prev, { message, isSystem: true }]);
  };

  const cardLabel = (card: Card, tigressDeclared?: "escape" | "pirate") => {
    if (card.type === "sk-tigress") {
      const declared = tigressDeclared === "pirate" ? "해적" : "탈출";
      return `🃏 타이그레스(${declared})`;
    }
    const emoji = SKULKING_SUIT_LABELS[card.type] ?? "?";
    const name = SKULKING_SUIT_NAMES[card.type] ?? card.type;
    if (isSpecialCard(card.type)) return `${emoji} ${name}`;
    return `${emoji} ${card.value}`;
  };

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
    roundBidTrickHistory?: Array<{ round: number; bids: Record<string, number>; tricks: Record<string, number> }>;
  } | null;

  const [gameStarted, setGameStarted] = useState(ls?.gameStarted ?? false);
  const [gameOver, setGameOver] = useState(ls?.gameOver ?? false);
  const [myHand, setMyHand] = useState<Card[]>(() => (ls?.myHand as Card[]) ?? []);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>(() => (ls?.playerHands as PlayerHand[]) ?? []);

  const [round, setRound] = useState(ls?.skulkingRound ?? 1);
  const [phase, setPhase] = useState<"bid" | "play" | null>(ls?.skulkingPhase ?? null);
  const [currentBidPlayerId, setCurrentBidPlayerId] = useState<string | null>(ls?.skulkingCurrentBidPlayerId ?? null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(ls?.skulkingCurrentPlayerId ?? null);
  const [trickLeadPlayerId, setTrickLeadPlayerId] = useState<string | null>(ls?.skulkingLeadPlayerId ?? null);
  const [trickOrder, setTrickOrder] = useState<string[]>([]);
  const [currentTrick, setCurrentTrick] = useState<TrickEntry[]>(() => (ls?.currentTrick as TrickEntry[]) ?? []);
  const [bids, setBids] = useState<Record<string, number>>(ls?.bids ?? {});
  const [tricks, setTricks] = useState<Record<string, number>>(ls?.tricks ?? {});
  const [scores, setScores] = useState<Record<string, number>>(ls?.scores ?? {});
  const [roundScores, setRoundScores] = useState<Record<string, number[]>>(ls?.roundScores ?? {});

  const [gameOverResult, setGameOverResult] = useState<GameOverResult | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [roundEndCountdown, setRoundEndCountdown] = useState<number | null>(null);
  const [trickWinnerId, setTrickWinnerId] = useState<string | null>(null);
  const [initialTimerTimeLeft, setInitialTimerTimeLeft] = useState<number | null>(null);
  const [roundHistory, setRoundHistory] = useState<Array<{ round: number; bids: Record<string, number>; tricks: Record<string, number> }>>(ls?.roundBidTrickHistory ?? []);

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
            roundScores?: Record<string, number[]>;
            roundBidTrickHistory?: Array<{ round: number; bids: Record<string, number>; tricks: Record<string, number> }>;
            skulkingCurrentPlayerId?: string | null;
            skulkingLeadPlayerId?: string | null;
            skulkingTrickOrder?: string[];
            skulkingTimerTimeLeft?: number | null;
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
          if (d.roundScores) setRoundScores(d.roundScores);
          if (d.roundBidTrickHistory) setRoundHistory(d.roundBidTrickHistory);
          if (d.skulkingCurrentPlayerId !== undefined) setCurrentPlayerId(d.skulkingCurrentPlayerId);
          if (d.skulkingLeadPlayerId !== undefined) setTrickLeadPlayerId(d.skulkingLeadPlayerId);
          if (d.skulkingTrickOrder?.length) setTrickOrder(d.skulkingTrickOrder);
          if (d.skulkingTimerTimeLeft !== undefined) setInitialTimerTimeLeft(d.skulkingTimerTimeLeft);
          if (d.currentTrick) setCurrentTrick(d.currentTrick);
          break;
        }
        case "skulkingRoundStarted": {
          const d = data as {
            round: number;
            myHand: Card[];
            playerHands: PlayerHand[];
            scores: Record<string, number>;
            roundScores?: Record<string, number[]>;
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
          if (d.roundScores) setRoundScores(d.roundScores);
          setCurrentTrick([]);
          setBids({});
          setTricks({});
          setPhase(null);
          setCurrentBidPlayerId(null);
          setCurrentPlayerId(null);
          setTrickLeadPlayerId(null);
          setTrickWinnerId(null);
          addGameLog(`━━━ 🃏 라운드 ${d.round} 시작 ━━━`);
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
          const d = data as { leadPlayerId: string; bids: Record<string, number>; trickOrder?: string[] };
          setPhase("play");
          setCurrentPlayerId(d.leadPlayerId);
          setTrickLeadPlayerId(d.leadPlayerId);
          if (d.trickOrder) setTrickOrder(d.trickOrder);
          setCurrentBidPlayerId(null);
          setBids(d.bids);
          setCurrentTrick([]);
          break;
        }
        case "skulkingCardPlayed": {
          const d = data as { nickname: string; card: Card; tigressDeclared?: "escape" | "pirate"; currentTrick: TrickEntry[]; playerHands: PlayerHand[] };
          setCurrentTrick(d.currentTrick);
          setPlayerHands(d.playerHands);
          addGameLog(`${d.nickname}: ${cardLabel(d.card, d.tigressDeclared)}`);
          break;
        }
        case "myHandUpdate": {
          const d = data as { myHand: Card[] };
          setMyHand(d.myHand);
          break;
        }
        case "skulkingTurnUpdate": {
          const d = data as { currentPlayerId: string; isNewTrick?: boolean; trickOrder?: string[] };
          if (d.isNewTrick) {
            setCurrentTrick([]);
            setTrickWinnerId(null);
            setTrickLeadPlayerId(d.currentPlayerId);
            if (d.trickOrder) setTrickOrder(d.trickOrder);
          }
          setCurrentPlayerId(d.currentPlayerId);
          break;
        }
        case "skulkingTrickResult": {
          const d = data as { winnerId: string; winnerNickname: string; trick: TrickEntry[]; tricks: Record<string, number>; bonus: number; trickCount: number; totalTricks: number };
          setTricks(d.tricks);
          setTrickWinnerId(d.winnerId);
          const trickLines = d.trick.map((e) => `  ${e.nickname}: ${cardLabel(e.card, e.tigressDeclared)}`).join("\n");
          const bonusText = d.bonus > 0 ? ` (+${d.bonus} 보너스)` : "";
          addGameLog(`🏆 ${d.winnerNickname} 트릭 획득${bonusText} [${d.trickCount}/${d.totalTricks}]\n${trickLines}`);
          // skulkingTurnUpdate(isNewTrick:true)가 오지 않는 경우(라운드 마지막 트릭 등)를 대비해
          // 2초 후에도 초기화되지 않았으면 강제 초기화
          setTimeout(() => {
            setCurrentTrick((prev) => (prev.length > 0 ? [] : prev));
            setTrickWinnerId(null);
          }, 2000);
          break;
        }
        case "skulkingRoundResult": {
          const d = data as RoundResult;
          setScores(d.totalScores);
          if (d.roundScoreHistory) setRoundScores(d.roundScoreHistory);
          setPhase(null);
          setRoundHistory(d.roundBidTrickHistory);
          {
            const lines = players.map((p) => {
              const bid = d.bids[p.playerId] ?? 0;
              const won = d.tricks[p.playerId] ?? 0;
              const score = d.roundScores[p.playerId] ?? 0;
              const success = bid === won;
              const mark = success ? "✅" : "❌";
              const scoreText = score >= 0 ? `+${score}` : `${score}`;
              return `  ${mark} ${p.nickname}: 비드 ${bid} / 트릭 ${won} (${scoreText}점)`;
            }).join("\n");
            addGameLog(`📊 라운드 ${d.round} 결과\n${lines}`);
          }
          if (!d.isLastRound) {
            setTimeout(() => {
              setCurrentTrick([]);
              setTrickWinnerId(null);
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
            }, 3000);
            if (isHost) {
              setTimeout(() => {
                send("skulkingNextRound", { roomName });
              }, 8000);
            }
          } else {
            setCurrentTrick([]);
            setTrickWinnerId(null);
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

  const skulkingPlayers = players.map((p) => {
    const trickOrderIndex = trickOrder.indexOf(p.playerId);
    return {
      ...p,
      order: trickOrderIndex >= 0 ? trickOrderIndex : p.order,
      bid: bids[p.playerId],
      tricks: tricks[p.playerId] ?? 0,
      score: scores[p.playerId] ?? 0,
      roundScores: roundScores[p.playerId] ?? [],
    };
  });

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
        <>
          <SkulkingHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
          {import.meta.env.DEV && (
            <SkulkingTestPanel
              roomName={roomName ?? ""}
              players={players.map((p) => ({ playerId: p.playerId, nickname: p.nickname }))}
              onSend={send}
            />
          )}
        </>
      }
    >
      <SkulkingGameBoard
        round={round}
        phase={phase}
        players={skulkingPlayers}
        myHand={myHand}
        playerHands={playerHands}
        currentTrick={currentTrick}
        currentBidPlayerId={currentBidPlayerId}
        currentPlayerId={currentPlayerId}
        trickLeadPlayerId={trickLeadPlayerId}
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
        roundHistory={roundHistory}
        initialTimerTimeLeft={initialTimerTimeLeft}
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
