import { useState, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, { HelpSection, HelpText, PayTable as HelpPayTable, PayLabel, PayValue } from "./GameHelpModal";

// ── 타입 ─────────────────────────────────────────────────────────────────────

type Suit = "♠" | "♥" | "♦" | "♣";
type FaceValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface VPCard {
  suit: Suit;
  value: FaceValue;
  numericValue: number;
}

type HandRank =
  | "royal-flush" | "straight-flush" | "four-of-a-kind" | "full-house"
  | "flush" | "straight" | "three-of-a-kind" | "two-pair"
  | "jacks-or-better" | "nothing";

interface HandResult {
  rank: HandRank;
  label: string;
  multiplier: number;
}

type Phase = "idle" | "dealt" | "result";

// ── 상수 ─────────────────────────────────────────────────────────────────────

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const FACE_VALUES: FaceValue[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const NUMERIC: Record<FaceValue, number> = {
  A: 14, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13,
};

const PAY_TABLE: { rank: HandRank; label: string; multiplier: number }[] = [
  { rank: "royal-flush",     label: "로얄 플러시",       multiplier: 250 },
  { rank: "straight-flush",  label: "스트레이트 플러시",  multiplier: 50  },
  { rank: "four-of-a-kind",  label: "포카드",             multiplier: 25  },
  { rank: "full-house",      label: "풀하우스",           multiplier: 9   },
  { rank: "flush",           label: "플러시",             multiplier: 6   },
  { rank: "straight",        label: "스트레이트",         multiplier: 4   },
  { rank: "three-of-a-kind", label: "트리플",             multiplier: 3   },
  { rank: "two-pair",        label: "투페어",             multiplier: 2   },
  { rank: "jacks-or-better", label: "잭스오어베터",       multiplier: 2   },
  { rank: "nothing",         label: "꽝",                 multiplier: 0   },
];

// ── 덱 / 족보 유틸 ───────────────────────────────────────────────────────────

function buildDeck(): VPCard[] {
  const deck: VPCard[] = [];
  for (const suit of SUITS)
    for (const value of FACE_VALUES)
      deck.push({ suit, value, numericValue: NUMERIC[value] });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function evaluateHand(cards: VPCard[]): HandResult {
  const vals = cards.map((c) => c.numericValue).sort((a, b) => a - b);
  const suits = cards.map((c) => c.suit);
  const valueCounts: Record<number, number> = {};
  for (const v of vals) valueCounts[v] = (valueCounts[v] ?? 0) + 1;
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const isFlush = suits.every((s) => s === suits[0]);
  const uniqueVals = [...new Set(vals)].sort((a, b) => a - b);
  let isStraight = false;
  if (uniqueVals.length === 5) {
    if (uniqueVals[4] - uniqueVals[0] === 4) isStraight = true;
    else if (uniqueVals.join(",") === "2,3,4,5,14") isStraight = true;
  }
  if (isFlush && isStraight && vals.join(",") === "10,11,12,13,14") return pay("royal-flush");
  if (isFlush && isStraight) return pay("straight-flush");
  if (counts[0] === 4) return pay("four-of-a-kind");
  if (counts[0] === 3 && counts[1] === 2) return pay("full-house");
  if (isFlush) return pay("flush");
  if (isStraight) return pay("straight");
  if (counts[0] === 3) return pay("three-of-a-kind");
  if (counts[0] === 2 && counts[1] === 2) return pay("two-pair");
  if (counts[0] === 2) {
    const pairVal = Number(Object.entries(valueCounts).find(([, c]) => c === 2)?.[0]);
    if (pairVal >= 11 || pairVal === 14) return pay("jacks-or-better");
  }
  return pay("nothing");
}

function pay(rank: HandRank): HandResult {
  const entry = PAY_TABLE.find((p) => p.rank === rank)!;
  return { rank, label: entry.label, multiplier: entry.multiplier };
}

function isRed(card: VPCard) { return card.suit === "♥" || card.suit === "♦"; }

// ── 스타일 ───────────────────────────────────────────────────────────────────

const flipIn = keyframes`
  0%   { transform: rotateY(90deg); opacity: 0; }
  100% { transform: rotateY(0deg);  opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center top, #1a5c35 0%, #0d3d22 50%, #060f0a 100%);
  border-radius: 8px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px 16px;
  overflow-y: auto;
  gap: 10px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.div`
  color: #f0c040;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
`;

const HelpBtn = styled.button`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  background: rgba(240, 192, 64, 0.15);
  border: 1px solid rgba(240, 192, 64, 0.4);
  border-radius: 50%;
  color: #f0c040;
  font-size: 0.85rem;
  font-weight: 700;
  width: 28px;
  height: 28px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: rgba(240, 192, 64, 0.28); }
`;

const CloseBtn = styled.button`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #aaa;
  font-size: 0.85rem;
  padding: 4px 12px;
  cursor: pointer;
  &:hover { background: rgba(255,255,255,0.14); color: #fff; }
`;

// 카드 영역
const CardZone = styled.div`
  width: 100%;
  max-width: 440px;
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  border: 1px solid rgba(46,204,113,0.25);
  padding: 12px 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: ${slideUp} 0.3s ease;
`;

const ZoneLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const CardsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const CardWrapper = styled.div<{ $held: boolean; $flipping: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  ${({ $flipping }) => $flipping && css`animation: ${flipIn} 0.35s ease forwards;`}
`;

const CardFace = styled.div<{ $red: boolean; $held: boolean; $win?: boolean }>`
  width: 58px;
  height: 84px;
  background: #fff;
  border-radius: 7px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px 6px;
  font-weight: 700;
  user-select: none;
  overflow: hidden;
  border: 2px solid ${({ $held, $win }) =>
    $win ? "#f0c040" : $held ? "#f0c040" : "rgba(255,255,255,0.12)"};
  box-shadow: ${({ $held, $win }) =>
    $win ? "0 0 10px rgba(240,192,64,0.5)"
    : $held ? "0 0 8px rgba(240,192,64,0.35)"
    : "0 2px 6px rgba(0,0,0,0.5)"};
  transition: border 0.15s, box-shadow 0.15s;
`;

const CardCorner = styled.div<{ $red: boolean; $flip?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $flip }) => ($flip ? "flex-end" : "flex-start")};
  color: ${({ $red }) => ($red ? "#c0392b" : "#1a1a2e")};
  font-size: 0.72rem;
  line-height: 1.1;
  transform: ${({ $flip }) => ($flip ? "rotate(180deg)" : "none")};
`;

const CardSuitBig = styled.div<{ $red: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${({ $red }) => ($red ? "#c0392b" : "#1a1a2e")};
`;

const HoldBadge = styled.div<{ $held: boolean }>`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${({ $held }) => ($held ? "#f0c040" : "rgba(255,255,255,0.22)")};
  text-transform: uppercase;
  height: 13px;
`;

// 현재 족보 뱃지
const HandBadge = styled.div<{ $win: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${({ $win }) => ($win ? "rgba(240,192,64,0.18)" : "rgba(255,255,255,0.07)")};
  border: 1px solid ${({ $win }) => ($win ? "rgba(240,192,64,0.5)" : "rgba(255,255,255,0.12)")};
  color: ${({ $win }) => ($win ? "#f0c040" : "rgba(255,255,255,0.45)")};
`;

// 결과 배너
const ResultBanner = styled.div<{ $win: boolean }>`
  width: 100%;
  max-width: 440px;
  text-align: center;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${({ $win }) => ($win ? "rgba(240,192,64,0.15)" : "rgba(192,57,43,0.15)")};
  border: 1px solid ${({ $win }) => ($win ? "rgba(240,192,64,0.4)" : "rgba(192,57,43,0.3)")};
  animation: ${slideUp} 0.3s ease;
`;

const ResultLabel = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #f0c040;
`;

const ResultDelta = styled.div<{ $win: boolean }>`
  font-size: 0.85rem;
  margin-top: 3px;
  color: ${({ $win }) => ($win ? "#2ecc71" : "#e74c3c")};
  font-weight: 600;
`;

// 하단
const BottomArea = styled.div`
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
`;

const BalanceValue = styled.span`
  color: #f0c040;
  font-weight: 700;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionBtn = styled.button<{ $variant?: "primary" | "draw" }>`
  flex: 1;
  max-width: 180px;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  ${({ $variant }) => {
    if ($variant === "primary")
      return css`
        background: linear-gradient(135deg, #f0c040 0%, #e08000 100%);
        color: #1a0a00;
        &:hover { filter: brightness(1.1); }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      `;
    if ($variant === "draw")
      return css`
        background: linear-gradient(135deg, #2ecc71 0%, #1a8a4a 100%);
        color: #fff;
        &:hover { filter: brightness(1.1); }
      `;
    return css`
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ccc;
    `;
  }}
`;

const HoldHint = styled.div`
  text-align: center;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.5px;
`;

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const VP_MIN_RATIO = 0.01;
const VP_MAX_RATIO = 0.05;

interface Props {
  balance: number;
  initialBalance: number;
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

export default function VideoPokerGame({ balance, initialBalance, onBet, onResult, onClose }: Props) {
  const minBet = r100(initialBalance * VP_MIN_RATIO);
  const maxBet = r100(initialBalance * VP_MAX_RATIO);
  const [showHelp, setShowHelp] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [betAmount, setBetAmount] = useState(() => r100(initialBalance * VP_MIN_RATIO));
  const [deck, setDeck] = useState<VPCard[]>([]);
  const [hand, setHand] = useState<VPCard[]>([]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [flipping, setFlipping] = useState<boolean[]>([false, false, false, false, false]);
  const [handResult, setHandResult] = useState<HandResult | null>(null);
  const [lastDelta, setLastDelta] = useState<number | null>(null);

  const deal = useCallback(() => {
    if (balance < betAmount) return;
    const newDeck = shuffle(buildDeck());
    const newHand = newDeck.slice(0, 5);
    const remaining = newDeck.slice(5);
    setDeck(remaining);
    setHand(newHand);
    setHeld([false, false, false, false, false]);
    setHandResult(null);
    setLastDelta(null);
    setFlipping([true, true, true, true, true]);
    setTimeout(() => setFlipping([false, false, false, false, false]), 400);
    setPhase("dealt");
    onBet(betAmount);
  }, [balance, betAmount, onBet]);

  const draw = useCallback(() => {
    if (phase !== "dealt") return;
    const deckCopy = [...deck];
    const newHand = hand.map((card, i) => {
      if (held[i]) return card;
      return deckCopy.shift()!;
    });
    setFlipping(hand.map((_, i) => !held[i]));
    setTimeout(() => setFlipping([false, false, false, false, false]), 400);
    setHand(newHand);
    const result = evaluateHand(newHand);
    setHandResult(result);
    const payout = result.multiplier * betAmount;
    const netDelta = payout - betAmount;
    setLastDelta(netDelta);
    onResult(netDelta);
    setPhase("result");
  }, [phase, hand, held, deck, betAmount, onResult]);

  const toggleHold = (i: number) => {
    if (phase !== "dealt") return;
    setHeld((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
  };

  const currentRank = phase === "dealt" ? evaluateHand(hand) : handResult;
  const hasCards = phase === "dealt" || phase === "result";

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🎲 비디오 포커 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"DEAL — 5장을 받습니다.\n보관할 카드를 클릭해 HOLD 표시 후 DRAW.\n나머지 카드가 교체되어 최종 족보로 배당이 결정됩니다.\nJ·Q·K·A 원페어(잭스오어베터) 이상부터 배당이 있습니다."}</HelpText>
        </HelpSection>
        <HelpSection title="배당표">
          <HelpPayTable>
            <PayLabel>로얄 플러시</PayLabel><PayValue>250배</PayValue>
            <PayLabel>스트레이트 플러시</PayLabel><PayValue>50배</PayValue>
            <PayLabel>포카드</PayLabel><PayValue>25배</PayValue>
            <PayLabel>풀하우스</PayLabel><PayValue>9배</PayValue>
            <PayLabel>플러시</PayLabel><PayValue>6배</PayValue>
            <PayLabel>스트레이트</PayLabel><PayValue>4배</PayValue>
            <PayLabel>트리플</PayLabel><PayValue>3배</PayValue>
            <PayLabel>투페어</PayLabel><PayValue>2배</PayValue>
            <PayLabel>잭스오어베터 (J·Q·K·A 원페어)</PayLabel><PayValue>2배</PayValue>
            <PayLabel>그 외</PayLabel><PayValue>꽝</PayValue>
          </HelpPayTable>
        </HelpSection>
        <HelpSection title="잭스오어베터란?">
          <HelpText>{"J(잭), Q(퀸), K(킹), A(에이스) 중 하나로 이루어진 원페어.\n10 이하의 원페어는 배당이 없습니다."}</HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>🎲 비디오 포커</Title>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseBtn onClick={onClose}>닫기</CloseBtn>
      </Header>

      {/* 결과 배너 */}
      {phase === "result" && handResult && (
        <ResultBanner $win={handResult.multiplier > 0}>
          <ResultLabel>{handResult.label}</ResultLabel>
          <ResultDelta $win={(lastDelta ?? 0) >= 0}>
            {(lastDelta ?? 0) >= 0
              ? `+${(lastDelta ?? 0).toLocaleString()} 획득!`
              : `${(lastDelta ?? 0).toLocaleString()} 손실`}
          </ResultDelta>
        </ResultBanner>
      )}

      {/* 카드 존 */}
      {hasCards && (
        <CardZone>
          <ZoneLabel>
            {phase === "dealt" ? "카드를 클릭해 보관할 패를 선택하세요" : "최종 패"}
          </ZoneLabel>
          <CardsRow>
            {hand.map((card, i) => (
              <CardWrapper
                key={i}
                $held={held[i]}
                $flipping={flipping[i]}
                onClick={() => toggleHold(i)}
              >
                <HoldBadge $held={held[i]}>
                  {held[i] ? "HOLD" : phase === "dealt" ? "hold?" : ""}
                </HoldBadge>
                <CardFace
                  $red={isRed(card)}
                  $held={held[i]}
                  $win={phase === "result" && (handResult?.multiplier ?? 0) > 0}
                >
                  <CardCorner $red={isRed(card)}>
                    <span>{card.value}</span>
                    <span>{card.suit}</span>
                  </CardCorner>
                  <CardSuitBig $red={isRed(card)}>{card.suit}</CardSuitBig>
                  <CardCorner $red={isRed(card)} $flip>
                    <span>{card.value}</span>
                    <span>{card.suit}</span>
                  </CardCorner>
                </CardFace>
              </CardWrapper>
            ))}
          </CardsRow>
          {/* 현재 족보 뱃지 */}
          {currentRank && (
            <HandBadge $win={currentRank.multiplier > 0}>
              {currentRank.multiplier > 0 ? "✓" : "·"} {currentRank.label}
              {currentRank.multiplier > 0 && ` (${currentRank.multiplier}배)`}
            </HandBadge>
          )}
        </CardZone>
      )}

      {/* 하단 영역 */}
      <BottomArea>
        <BalanceRow>
          <span>잔액 <BalanceValue>{balance.toLocaleString()}</BalanceValue></span>
          {phase !== "idle" && (
            <span>베팅 <BalanceValue>{betAmount.toLocaleString()}</BalanceValue></span>
          )}
        </BalanceRow>

        {(phase === "idle" || phase === "result") && (
          <>
            <BetControls
              value={betAmount}
              onChange={setBetAmount}
              minBet={minBet}
              maxBet={maxBet}
              balance={balance}
              disabled={false}
            />
            <ActionRow>
              <ActionBtn $variant="primary" onClick={deal} disabled={balance < betAmount}>
                {phase === "result" ? "다시 딜 (DEAL)" : "딜 (DEAL)"}
              </ActionBtn>
            </ActionRow>
          </>
        )}

        {phase === "dealt" && (
          <>
            <HoldHint>보관할 카드를 선택한 뒤 DRAW를 누르세요</HoldHint>
            <ActionRow>
              <ActionBtn $variant="draw" onClick={draw}>
                드로우 (DRAW)
              </ActionBtn>
            </ActionRow>
          </>
        )}
      </BottomArea>
    </Overlay>
  );
}
