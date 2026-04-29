import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomBase } from "../common/useRoomBase";
import RoomLayout from "../common/RoomLayout";
import BlackjackGameBoard from "../../../components/blackjack/BlackjackGameBoard";
import BlackjackHelpModal from "../../../components/blackjack/BlackjackHelpModal";
import BlackjackBettingModal from "../../../components/blackjack/game/BlackjackBettingModal";
import BlackjackGameOverModal from "../../../components/blackjack/game/BlackjackGameOverModal";
import BlackjackBotPanel from "../../../components/blackjack/game/BlackjackBotPanel";
import type { BjHand, BjPlayerInfo, BjRoundResult } from "../../../components/blackjack/types";
import type { Card } from "../../../types/game";

function BjRoundResultOverlay({ result, myPlayerId }: { result: BjRoundResult; myPlayerId: string }) {
  const myResult = result.playerResults.find((p) => p.playerId === myPlayerId);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.55)", pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(10,20,10,0.92)", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 14, padding: "18px 28px", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 10, minWidth: 240,
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>
          라운드 {result.round} / {result.totalRounds} 결과
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          딜러: {result.dealerBust ? "버스트" : result.dealerBlackjack ? "블랙잭" : result.dealerValue}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
          {result.playerResults.map((p) => {
            const isMe = p.playerId === myPlayerId;
            const hand = p.hands[0];
            const resultLabel = hand?.result === "win" ? "승" : hand?.result === "lose" ? "패" : "무";
            const resultColor = hand?.result === "win" ? "#2ecc71" : hand?.result === "lose" ? "#e74c3c" : "#95a5a6";
            return (
              <div key={p.playerId} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 16, padding: "3px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ fontSize: 12, color: isMe ? "#7ec8ff" : "rgba(255,255,255,0.6)", fontWeight: isMe ? 700 : 400 }}>
                  {p.nickname}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  {hand?.value ?? "?"}점
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: resultColor, minWidth: 24, textAlign: "right" }}>
                  {resultLabel}
                </span>
              </div>
            );
          })}
        </div>
        {myResult && (
          <div style={{ fontSize: 14, fontWeight: 700, color: myResult.hands[0]?.payout > 0 ? "#2ecc71" : "#e74c3c" }}>
            {myResult.hands[0]?.payout > 0 ? `+${myResult.hands[0].payout}` : myResult.hands[0]?.payout ?? 0} 칩
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlackjackRoom() {
  const navigate = useNavigate();
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
    isChatOpen,
    hasUnreadMessages,
    messagesEndRef,
    setInputMessage,
    sendMessage,
    setIsChatOpen,
    setHasUnreadMessages,
    leaveRoom,
    showHelpModal,
    setShowHelpModal,
  } = useRoomBase();

  // ── 게임 상태 ────────────────────────────────────────────
  const [gameStarted, setGameStarted] = useState(false);
  const [phase, setPhase] = useState<"betting" | "action" | "dealer" | "result" | null>(null);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [initialChips, setInitialChips] = useState(100);

  // 칩
  const [bjChips, setBjChips] = useState<Record<string, number>>({});

  // 딜러
  const [dealerVisibleCards, setDealerVisibleCards] = useState<Card[]>([]);

  // 내 핸드
  const [myHands, setMyHands] = useState<BjHand[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [myBet, setMyBet] = useState(0);

  // 베팅 상태
  const [bettingDoneCount, setBettingDoneCount] = useState(0);
  const [alreadyBet, setAlreadyBet] = useState(false);
  const [bettingDonePlayers, setBettingDonePlayers] = useState<Set<string>>(new Set());

  // 다른 플레이어 핸드 정보
  const [playerHandsInfo, setPlayerHandsInfo] = useState<
    Array<{ playerId: string; hands: Array<{ cardCount: number; status: string; bet: number; value: number }> }>
  >([]);

  // 액션 완료 플레이어
  const [actionDone, setActionDone] = useState<string[]>([]);

  // 결과
  const [roundResult, setRoundResult] = useState<BjRoundResult | null>(null);

  // 게임 오버
  const [gameOver, setGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<{
    finalChips: Record<string, number>;
    ranking: Array<{ playerId: string; nickname: string; chips: number; rank: number }>;
  } | null>(null);

  // 재연결 타이머
  const [initialTimerTimeLeft, setInitialTimerTimeLeft] = useState<number | null>(null);

  // 게임 시작 설정 (방장)
  const [configInitialChips, setConfigInitialChips] = useState(100);
  const [configRounds, setConfigRounds] = useState(5);

  const myChips = bjChips[playerId] ?? 0;

  // ── 이벤트 구독 ──────────────────────────────────────────
  useEffect(() => {
    return subscribe((event, data) => {
      const d = data as Record<string, unknown>;

      switch (event) {
        case "roomJoined": {
          // 재연결 복원
          if (d.bjPhase) {
            setGameStarted(true);
            setPhase(d.bjPhase as typeof phase);
            setRound((d.bjCurrentRound as number) ?? 0);
            setTotalRounds((d.bjTotalRounds as number) ?? 5);
            setInitialChips((d.bjInitialChips as number) ?? 100);
            setBjChips((d.bjChips as Record<string, number>) ?? {});
            setMyHands((d.bjMyHands as BjHand[]) ?? []);
            setDealerVisibleCards((d.bjDealerVisibleCards as Card[]) ?? []);
            setPlayerHandsInfo(
              (d.bjPlayerHandsInfo as typeof playerHandsInfo) ?? []
            );
            setActionDone((d.bjActionDone as string[]) ?? []);
            setBettingDoneCount(((d.bjBettingDone as string[]) ?? []).length);
            if (d.bjActionTimerTimeLeft != null) {
              setInitialTimerTimeLeft(d.bjActionTimerTimeLeft as number);
            }
          }
          break;
        }

        case "bjBettingStarted": {
          setGameStarted(true);
          setPhase("betting");
          setRound((d.round as number) ?? 0);
          setTotalRounds((d.totalRounds as number) ?? 5);
          setInitialChips((d.initialChips as number) ?? 100);
          setBjChips(
            Object.fromEntries(
              (d.players as { playerId: string; chips: number }[]).map((p) => [p.playerId, p.chips])
            )
          );
          setMyHands([]);
          setDealerVisibleCards([]);
          setPlayerHandsInfo([]);
          setActionDone([]);
          setBettingDoneCount(0);
          setAlreadyBet(false);
          setBettingDonePlayers(new Set());
          setMyBet(0);
          setRoundResult(null);
          break;
        }

        case "bjBetPlaced": {
          const betPlayerId = d.playerId as string;
          setBettingDoneCount((d.bettingDoneCount as number) ?? 0);
          setBettingDonePlayers((prev) => new Set([...prev, betPlayerId]));
          if (betPlayerId === playerId) {
            setAlreadyBet(true);
          }
          break;
        }

        case "bjActionPhase": {
          setPhase("action");
          setMyHands((d.myHands as BjHand[]) ?? []);
          setCurrentHandIndex(0);
          setDealerVisibleCards(d.dealerVisibleCard ? [d.dealerVisibleCard as Card] : []);
          setPlayerHandsInfo((d.playerHandsInfo as typeof playerHandsInfo) ?? []);
          setActionDone([]);
          break;
        }

        case "myBjHandUpdate": {
          setMyHands((d.myHands as BjHand[]) ?? []);
          setCurrentHandIndex((d.currentHandIndex as number) ?? 0);
          break;
        }

        case "bjActionUpdate": {
          setPlayerHandsInfo((d.playerHandsInfo as typeof playerHandsInfo) ?? []);
          if (d.action === "split") {
            // 스플릿 후 핸드 수 업데이트는 playerHandsInfo로 처리
          }
          break;
        }

        case "bjPlayerDone": {
          const doneId = d.playerId as string;
          setActionDone((prev) => prev.includes(doneId) ? prev : [...prev, doneId]);
          break;
        }

        case "bjActionTimeout": {
          // 타이머 만료 — 딜러 페이즈로 전환 예정
          break;
        }

        case "bjDealerPhase": {
          setPhase("dealer");
          setDealerVisibleCards((d.dealerHand as Card[]) ?? []);
          break;
        }

        case "bjDeckEmpty": {
          // 덱 소진 알림 (딜러 페이즈로 자동 전환됨)
          break;
        }

        case "bjRoundResult": {
          setPhase("result");
          setRoundResult(d as unknown as BjRoundResult);
          setBjChips((d.chips as Record<string, number>) ?? {});
          setTimeout(() => {
            send("bjNextRound", { roomName });
          }, 5000);
          break;
        }

        case "bjNextRoundReady": {
          break;
        }

        case "bjGameOver": {
          setGameOver(true);
          setGameOverData({
            finalChips: (d.finalChips as Record<string, number>) ?? {},
            ranking: (d.ranking as Array<{ playerId: string; nickname: string; chips: number; rank: number }>) ?? [],
          });
          break;
        }
      }
    });
  }, [subscribe, playerId]);

  // ── 핸들러 ──────────────────────────────────────────────

  const handleStartGame = () => {
    send("startGame", {
      roomName,
      initialChips: configInitialChips,
      totalRounds: configRounds,
    });
  };

  const handlePlaceBet = (amount: number) => {
    setMyBet(amount);
    send("bjPlaceBet", { roomName, amount });
  };

  const handleAction = (action: "hit" | "stand" | "double" | "split", handIndex = 0) => {
    send("bjAction", { roomName, action, handIndex });
  };

  const handleGameOverClose = () => {
    navigate("/");
  };

  // ── bjPlayers 조립 ────────────────────────────────────────
  const bjPlayers: BjPlayerInfo[] = players.map((p) => ({
    playerId: p.playerId,
    nickname: p.nickname,
    order: p.order ?? 0,
    chips: bjChips[p.playerId] ?? 0,
    handInfo: playerHandsInfo.find((h) => h.playerId === p.playerId)?.hands ?? [],
    actionDone: actionDone.includes(p.playerId),
    bettingDone: bettingDonePlayers.has(p.playerId),
  }));

  return (
    <RoomLayout
      roomName={roomName ?? ""}
      displayName={gameConfig.displayName}
      memberCount={memberCount}
      helpButtonStyle={{
        background: "linear-gradient(135deg, #1a6b3c 0%, #0d4a28 100%)",
        boxShadow: "0 4px 12px rgba(13, 74, 40, 0.5)",
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
      send={send}
      subscribe={subscribe}
      playerId={playerId}
      modals={
        <>
          <BlackjackHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
          {gameOver && gameOverData && (
            <BlackjackGameOverModal
              ranking={gameOverData.ranking}
              finalChips={gameOverData.finalChips}
              myPlayerId={playerId}
              onClose={handleGameOverClose}
            />
          )}
          <BlackjackBotPanel
            roomName={roomName ?? ""}
            isHost={isHost}
            gameStarted={gameStarted}
            memberCount={memberCount}
            send={send}
          />
        </>
      }
    >
      <BlackjackGameBoard
        phase={phase}
        bjPlayers={bjPlayers}
        dealerVisibleCards={dealerVisibleCards}
        myPlayerId={playerId}
        myHands={myHands}
        currentHandIndex={currentHandIndex}
        myChips={myChips}
        myBet={myBet}
        actionTimerTimeLeft={null}
        initialTimerTimeLeft={initialTimerTimeLeft}
        round={round}
        totalRounds={totalRounds}
        isHost={isHost}
        gameStarted={gameStarted}
        memberCount={memberCount}
        initialChips={configInitialChips}
        setInitialChips={setConfigInitialChips}
        rounds={configRounds}
        setRounds={setConfigRounds}
        onStartGame={handleStartGame}
        alreadyBet={alreadyBet}
        onAction={handleAction}
      />

      {/* 베팅 모달 */}
      {phase === "betting" && (
        <BlackjackBettingModal
          myChips={myChips}
          initialChips={initialChips}
          bettingDoneCount={bettingDoneCount}
          totalPlayers={memberCount}
          alreadyBet={alreadyBet}
          onPlaceBet={handlePlaceBet}
        />
      )}

      {/* 라운드 결과 오버레이 */}
      {phase === "result" && roundResult && !gameOver && (
        <BjRoundResultOverlay result={roundResult} myPlayerId={playerId} />
      )}

    </RoomLayout>
  );
}
