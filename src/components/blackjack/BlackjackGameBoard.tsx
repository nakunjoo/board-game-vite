import { useEffect, useRef, useState } from "react";
import type { Card } from "../../types/game";
import type { BjHand, BjPlayerInfo } from "./types";
import {
  BjBoard,
  BjDealerZone,
  BjDealerLabel,
  BjDealerCards,
  BjDealerValue,
  BjInfoRow,
  BjTimerBar,
  BjTimerFill,
  BjTimerText,
  BjRoundBadge,
  BjOpponentsArea,
  BjOpponentRow,
  BjOpponentSeat,
  BjSeatNickname,
  BjSeatChips,
  BjSeatBet,
  BjSeatHandValue,
  BjStatusBadge,
  BjSeatMiniHand,
  BjMiniCard,
  BjMyZone,
  BjMyLabel,
  BjMyChips,
  BjMyBet,
  BjMyCards,
  BjCardImg,
  BjCardBack,
  BjHandValue,
  BjHandLabel,
  BjHandSection,
  BjSplitDivider,
  BjActionButtons,
  BjActionBtn,
  BjPreGame,
  BjStartBtn,
  BjConfigRow,
  BjConfigLabel,
  BjConfigSelect,
} from "../../styles/game/blackjack/board";
import { BJ_ACTION_TIME_LIMIT } from "../../utils/games/blackjack";

function calcHandValue(cards: Card[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    const v = c.value >= 10 ? 10 : c.value;
    sum += v;
    if (c.value === 1) aces++;
  }
  while (sum <= 11 && aces > 0) { sum += 10; aces--; }
  return sum;
}

interface Props {
  phase: "betting" | "action" | "dealer" | "result" | null;
  bjPlayers: BjPlayerInfo[];
  dealerVisibleCards: Card[];
  myPlayerId: string;
  myHands: BjHand[];
  currentHandIndex: number;
  myChips: number;
  myBet: number;
  actionTimerTimeLeft: number | null;
  initialTimerTimeLeft: number | null;
  round: number;
  totalRounds: number;
  isHost: boolean;
  gameStarted: boolean;
  memberCount: number;
  initialChips: number;
  setInitialChips: (v: number) => void;
  rounds: number;
  setRounds: (v: number) => void;
  onStartGame: () => void;
  alreadyBet: boolean;
  onAction: (action: "hit" | "stand" | "double" | "split", handIndex?: number) => void;
}

const INITIAL_CHIPS_OPTIONS = [50, 100, 200, 500];

export default function BlackjackGameBoard({
  phase,
  bjPlayers,
  dealerVisibleCards,
  myPlayerId,
  myHands,
  currentHandIndex,
  myChips,
  myBet,
  actionTimerTimeLeft,
  initialTimerTimeLeft,
  round,
  totalRounds,
  isHost,
  gameStarted,
  memberCount,
  initialChips,
  setInitialChips,
  rounds,
  setRounds,
  onStartGame,
  alreadyBet,
  onAction,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(BJ_ACTION_TIME_LIMIT);
  const pendingInitialTime = useRef<number | null>(null);

  useEffect(() => {
    if (initialTimerTimeLeft != null) {
      pendingInitialTime.current = initialTimerTimeLeft;
    }
  }, [initialTimerTimeLeft]);

  useEffect(() => {
    if (phase !== "action") return;

    const initialVal = pendingInitialTime.current;
    if (initialVal != null) {
      setTimeLeft(initialVal);
      pendingInitialTime.current = null;
    } else {
      setTimeLeft(BJ_ACTION_TIME_LIMIT);
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, actionTimerTimeLeft]);

  const dealerValue = dealerVisibleCards.length > 0 ? calcHandValue(dealerVisibleCards) : 0;
  const dealerBust = (phase === "dealer" || phase === "result") && dealerValue > 21;
  const dealerBj = dealerVisibleCards.length === 2 && dealerValue === 21;

  const currentHand = myHands[currentHandIndex];
  const isMyTurn = phase === "action" && currentHand?.status === "active";
  const canDouble = isMyTurn && currentHand?.cards.length === 2 && myChips >= (currentHand?.bet ?? 0);
  const canSplit =
    isMyTurn &&
    currentHand?.cards.length === 2 &&
    myHands.length < 2 &&
    (currentHand.cards[0].value >= 10 ? 10 : currentHand.cards[0].value) ===
      (currentHand.cards[1].value >= 10 ? 10 : currentHand.cards[1].value) &&
    myChips >= (currentHand?.bet ?? 0);

  // ── 게임 시작 전 ─────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <BjBoard>
        <BjPreGame>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>블랙잭</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            {memberCount}명 참여 중
          </div>
          {isHost && (
            <>
              <BjConfigRow>
                <BjConfigLabel>초기 칩 수</BjConfigLabel>
                <BjConfigSelect value={initialChips} onChange={(e) => setInitialChips(Number(e.target.value))}>
                  {INITIAL_CHIPS_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}칩 (최대 베팅 {Math.floor(v / 2)})</option>
                  ))}
                </BjConfigSelect>
              </BjConfigRow>
              <BjConfigRow>
                <BjConfigLabel>라운드 수</BjConfigLabel>
                <BjConfigSelect value={rounds} onChange={(e) => setRounds(Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                    <option key={v} value={v}>{v}라운드</option>
                  ))}
                </BjConfigSelect>
              </BjConfigRow>
              <BjStartBtn onClick={onStartGame} disabled={memberCount < 2}>
                게임 시작
              </BjStartBtn>
            </>
          )}
          {!isHost && (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              방장이 게임을 시작하기를 기다리는 중...
            </div>
          )}
        </BjPreGame>
      </BjBoard>
    );
  }

  // ── 상대 플레이어: 위 최대 2명, 아래 나머지 ──────────────────
  // 최대 3명 상대 (총 4인)
  const opponents = bjPlayers.filter((p) => p.playerId !== myPlayerId);
  const topRow = opponents.slice(0, 2);    // P1, P2
  const bottomRow = opponents.slice(2);    // P3, P4

  const getActionStatusBadge = (p: BjPlayerInfo) => {
    if (phase === "betting") {
      if (p.bettingDone) return <BjStatusBadge $type="bet">✓ 베팅완료</BjStatusBadge>;
      return null;
    }
    if (phase === "action" && p.actionDone) {
      // 핸드 상태 중 가장 의미 있는 것 하나 표시
      const statuses = p.handInfo.map((h) => h.status);
      if (statuses.includes("blackjack")) return <BjStatusBadge $type="blackjack">블랙잭!</BjStatusBadge>;
      if (statuses.includes("bust")) return <BjStatusBadge $type="bust">버스트</BjStatusBadge>;
      if (statuses.includes("doubled")) return <BjStatusBadge $type="stand">더블 · 대기중</BjStatusBadge>;
      return <BjStatusBadge $type="stand">스탠드 · 대기중</BjStatusBadge>;
    }
    return null;
  };

  const renderOpponent = (p: BjPlayerInfo) => {
    const allBust = p.handInfo.length > 0 && p.handInfo.every((h) => h.status === "bust");
    const totalValue = p.handInfo.length > 0
      ? Math.max(...p.handInfo.map((h) => h.value))
      : 0;
    const hasBlackjack = p.handInfo.some((h) => h.status === "blackjack");

    return (
      <BjOpponentSeat
        key={p.playerId}
        $isDone={p.actionDone || (phase === "betting" && p.bettingDone)}
        $isBust={allBust}
      >
        <BjSeatNickname>{p.nickname}</BjSeatNickname>
        <BjSeatChips>💰 {p.chips}</BjSeatChips>
        {p.handInfo.length > 0 && p.handInfo[0].bet > 0 && (
          <BjSeatBet>베팅 {p.handInfo.reduce((s, h) => s + h.bet, 0)}</BjSeatBet>
        )}
        {p.handInfo.length > 0 && (
          <>
            <BjSeatMiniHand>
              {p.handInfo.map((h, hi) => (
                <BjMiniCard key={hi} $status={h.status}>
                  {"?".repeat(Math.min(h.cardCount, 3))}
                </BjMiniCard>
              ))}
            </BjSeatMiniHand>
            <BjSeatHandValue $bust={allBust} $blackjack={hasBlackjack}>
              {hasBlackjack ? "BJ" : allBust ? `버스트 (${totalValue})` : totalValue}
            </BjSeatHandValue>
          </>
        )}
        {getActionStatusBadge(p)}
      </BjOpponentSeat>
    );
  };

  return (
    <BjBoard>

      {/* 딜러 */}
      <BjDealerZone>
        <BjDealerLabel>Dealer</BjDealerLabel>
        <BjDealerCards>
          {dealerVisibleCards.map((c, i) => (
            <BjCardImg key={i} src={c.image} alt={c.name} $result={undefined} style={{ width: 38, height: 54 }} />
          ))}
          {phase === "action" && dealerVisibleCards.length === 1 && (
            <BjCardBack style={{ width: 38, height: 54 }} />
          )}
        </BjDealerCards>
        {dealerVisibleCards.length > 0 && (
          <BjDealerValue $bust={dealerBust} $blackjack={dealerBj}>
            {(phase === "dealer" || phase === "result")
              ? dealerBust ? "버스트" : dealerBj ? "블랙잭!" : dealerValue
              : dealerValue}
          </BjDealerValue>
        )}
      </BjDealerZone>

      {/* 타이머 + 라운드 (한 줄) */}
      <BjInfoRow>
        {phase === "action" && (
          <>
            <BjTimerBar>
              <BjTimerFill $pct={(timeLeft / BJ_ACTION_TIME_LIMIT) * 100} $low={timeLeft <= 10} />
            </BjTimerBar>
            <BjTimerText $low={timeLeft <= 10}>{timeLeft}s</BjTimerText>
          </>
        )}
        {round > 0 && (
          <BjRoundBadge>{round} / {totalRounds} 라운드</BjRoundBadge>
        )}
      </BjInfoRow>

      {/* 상대 플레이어 */}
      {opponents.length > 0 && (
        <BjOpponentsArea>
          {topRow.length > 0 && (
            <BjOpponentRow>{topRow.map(renderOpponent)}</BjOpponentRow>
          )}
          {bottomRow.length > 0 && (
            <BjOpponentRow>{bottomRow.map(renderOpponent)}</BjOpponentRow>
          )}
        </BjOpponentsArea>
      )}

      {/* 나 */}
      <BjMyZone>
        <BjMyLabel>나</BjMyLabel>
        <BjMyChips>💰 {myChips}</BjMyChips>
        {myBet > 0 && <BjMyBet>베팅 {myBet}</BjMyBet>}

        {myHands.length > 0 ? (
          <>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
              {myHands.map((hand, hi) => {
                const isActive = hi === currentHandIndex && hand.status === "active";
                const hVal = calcHandValue(hand.cards);
                return (
                  <BjHandSection key={hi} $active={isActive}>
                    {myHands.length > 1 && <BjHandLabel>핸드 {hi + 1}</BjHandLabel>}
                    <BjMyCards>
                      {hand.cards.map((c, ci) => (
                        <BjCardImg key={ci} src={c.image} alt={c.name} $result={hand.result} />
                      ))}
                    </BjMyCards>
                    <BjHandValue $bust={hand.status === "bust"} $blackjack={hand.status === "blackjack"}>
                      {hand.status === "blackjack"
                        ? "블랙잭! 🎉"
                        : hand.status === "bust"
                        ? `버스트 (${hVal})`
                        : hVal}
                    </BjHandValue>
                    {hand.bet > 0 && <BjHandLabel>베팅: {hand.bet}</BjHandLabel>}
                    {hi < myHands.length - 1 && <BjSplitDivider />}
                  </BjHandSection>
                );
              })}
            </div>

            {isMyTurn && (
              <BjActionButtons>
                <BjActionBtn $variant="primary" onClick={() => onAction("hit", currentHandIndex)}>
                  히트 (Hit)
                </BjActionBtn>
                <BjActionBtn $variant="danger" onClick={() => onAction("stand", currentHandIndex)}>
                  스탠드 (Stand)
                </BjActionBtn>
                <BjActionBtn $variant="warning" onClick={() => onAction("double", currentHandIndex)} disabled={!canDouble}>
                  더블다운
                </BjActionBtn>
                <BjActionBtn $variant="info" onClick={() => onAction("split", currentHandIndex)} disabled={!canSplit}>
                  스플릿
                </BjActionBtn>
              </BjActionButtons>
            )}

            {/* 내 액션 완료 상태 */}
            {phase === "action" && !isMyTurn && (() => {
              const s = currentHand?.status;
              if (s === "blackjack") return <BjStatusBadge $type="blackjack">블랙잭! 🎉 · 대기중</BjStatusBadge>;
              if (s === "bust") return <BjStatusBadge $type="bust">버스트 · 대기중</BjStatusBadge>;
              if (s === "doubled") return <BjStatusBadge $type="stand">더블다운 · 대기중</BjStatusBadge>;
              if (s === "stand") return <BjStatusBadge $type="stand">스탠드 · 대기중</BjStatusBadge>;
              return <BjStatusBadge $type="waiting">대기중...</BjStatusBadge>;
            })()}
          </>
        ) : (
          phase === "betting" && (
            alreadyBet
              ? <BjStatusBadge $type="bet">✓ 베팅완료 · 대기중</BjStatusBadge>
              : <BjHandLabel>베팅 중...</BjHandLabel>
          )
        )}
      </BjMyZone>

    </BjBoard>
  );
}
