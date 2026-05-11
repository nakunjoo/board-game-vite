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
  numericValue: number; // A=14 for high, 1 for low-straight check
}

type HandRank =
  | "royal-flush"
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "jacks-or-better"
  | "nothing";

interface HandResult {
  rank: HandRank;
  label: string;
  multiplier: number; // 베팅 기준 배수
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
  { rank: "royal-flush",      label: "로얄 플러시",        multiplier: 250 },
  { rank: "straight-flush",   label: "스트레이트 플러시",   multiplier: 50 },
  { rank: "four-of-a-kind",   label: "포카드",              multiplier: 25 },
  { rank: "full-house",       label: "풀하우스",            multiplier: 9 },
  { rank: "flush",            label: "플러시",              multiplier: 6 },
  { rank: "straight",         label: "스트레이트",          multiplier: 4 },
  { rank: "three-of-a-kind",  label: "트리플",              multiplier: 3 },
  { rank: "two-pair",         label: "투페어",              multiplier: 2 },
  { rank: "jacks-or-better",  label: "잭스오어베터",        multiplier: 2 },
  { rank: "nothing",          label: "꽝",                  multiplier: 0 },
];

// ── 덱 / 족보 유틸 ───────────────────────────────────────────────────────────

function buildDeck(): VPCard[] {
  const deck: VPCard[] = [];
  for (const suit of SUITS) {
    for (const value of FACE_VALUES) {
      deck.push({ suit, value, numericValue: NUMERIC[value] });
    }
  }
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

  // 스트레이트 체크 (A-2-3-4-5 포함)
  const uniqueVals = [...new Set(vals)].sort((a, b) => a - b);
  let isStraight = false;
  if (uniqueVals.length === 5) {
    if (uniqueVals[4] - uniqueVals[0] === 4) {
      isStraight = true;
    } else if (uniqueVals.join(",") === "2,3,4,5,14") {
      // A-2-3-4-5 (wheel)
      isStraight = true;
    }
  }

  // 로얄 플러시
  if (isFlush && isStraight && vals.join(",") === "10,11,12,13,14") {
    return pay("royal-flush");
  }
  // 스트레이트 플러시
  if (isFlush && isStraight) return pay("straight-flush");
  // 포카드
  if (counts[0] === 4) return pay("four-of-a-kind");
  // 풀하우스
  if (counts[0] === 3 && counts[1] === 2) return pay("full-house");
  // 플러시
  if (isFlush) return pay("flush");
  // 스트레이트
  if (isStraight) return pay("straight");
  // 트리플
  if (counts[0] === 3) return pay("three-of-a-kind");
  // 투페어
  if (counts[0] === 2 && counts[1] === 2) return pay("two-pair");
  // 잭스오어베터 (J·Q·K·A 원페어)
  if (counts[0] === 2) {
    const pairVal = Number(
      Object.entries(valueCounts).find(([, c]) => c === 2)?.[0]
    );
    if (pairVal >= 11 || pairVal === 14) return pay("jacks-or-better");
  }
  return pay("nothing");
}

function pay(rank: HandRank): HandResult {
  const entry = PAY_TABLE.find((p) => p.rank === rank)!;
  return { rank, label: entry.label, multiplier: entry.multiplier };
}

// ── 스타일 ───────────────────────────────────────────────────────────────────

const flipIn = keyframes`
  0%   { transform: rotateY(90deg); opacity: 0; }
  100% { transform: rotateY(0deg);  opacity: 1; }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(10, 5, 20, 0.97);
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

// 패이 테이블
const PayTable = styled.div`
  width: 100%;
  max-width: 480px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 12px;
  background: rgba(0,0,0,0.45);
  border-radius: 8px;
  padding: 8px 14px;
  border: 1px solid rgba(255,220,80,0.15);
`;

const PayRow = styled.div<{ $active?: boolean; $dim?: boolean }>`
  display: contents;
  > span {
    font-size: 0.72rem;
    padding: 2px 0;
    color: ${({ $active, $dim }) =>
      $active ? "#f0c040" : $dim ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)"};
    font-weight: ${({ $active }) => ($active ? 700 : 400)};
    background: ${({ $active }) => ($active ? "rgba(240,192,64,0.12)" : "transparent")};
    border-radius: 3px;
    padding-left: ${({ $active }) => ($active ? "4px" : "0")};
  }
`;

// 카드 영역
const CardsRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
  max-width: 480px;
`;

const CardWrapper = styled.div<{ $held: boolean; $flipping?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  ${({ $flipping }) =>
    $flipping &&
    css`
      animation: ${flipIn} 0.35s ease forwards;
    `}
`;

const CardFace = styled.div<{ $red: boolean; $held: boolean; $result?: "win" | "lose" | null }>`
  width: 64px;
  height: 92px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 7px;
  font-weight: 700;
  user-select: none;
  border: 2px solid ${({ $held, $result }) =>
    $result === "win"
      ? "#f0c040"
      : $held
      ? "#f0c040"
      : "rgba(255,255,255,0.15)"};
  box-shadow: ${({ $held, $result }) =>
    $result === "win"
      ? "0 0 10px rgba(240,192,64,0.5)"
      : $held
      ? "0 0 8px rgba(240,192,64,0.4)"
      : "0 2px 6px rgba(0,0,0,0.5)"};
  transition: border 0.15s, box-shadow 0.15s;
`;

const CardCorner = styled.div<{ $red: boolean; $flip?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $flip }) => ($flip ? "flex-end" : "flex-start")};
  color: ${({ $red }) => ($red ? "#c0392b" : "#1a1a2e")};
  font-size: 0.75rem;
  line-height: 1.1;
  transform: ${({ $flip }) => ($flip ? "rotate(180deg)" : "none")};
`;

const CardSuitBig = styled.div<{ $red: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: ${({ $red }) => ($red ? "#c0392b" : "#1a1a2e")};
`;

const HoldBadge = styled.div<{ $held: boolean }>`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${({ $held }) => ($held ? "#f0c040" : "rgba(255,255,255,0.25)")};
  text-transform: uppercase;
  height: 14px;
`;

// 칩 + 버튼
const BottomArea = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const ActionBtn = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
  flex: 1;
  max-width: 160px;
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
    if ($variant === "danger")
      return css`
        background: linear-gradient(135deg, #c0392b 0%, #7b1a12 100%);
        color: #fff;
        &:hover { filter: brightness(1.1); }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      `;
    return css`
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #ccc;
      &:hover { background: rgba(255,255,255,0.16); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
    `;
  }}
`;

const ResultBanner = styled.div<{ $win: boolean }>`
  width: 100%;
  max-width: 480px;
  text-align: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${({ $win }) =>
    $win ? "rgba(240,192,64,0.15)" : "rgba(192,57,43,0.15)"};
  border: 1px solid ${({ $win }) =>
    $win ? "rgba(240,192,64,0.4)" : "rgba(192,57,43,0.3)"};
`;

const ResultLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #f0c040;
`;

const ResultDelta = styled.div<{ $win: boolean }>`
  font-size: 0.85rem;
  margin-top: 2px;
  color: ${({ $win }) => ($win ? "#2ecc71" : "#e74c3c")};
  font-weight: 600;
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

  const isRed = (card: VPCard) => card.suit === "♥" || card.suit === "♦";

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
    const newHand = hand.map((card, i) => {
      if (held[i]) return card;
      return deck.shift()!;
    });
    const newFlipping = hand.map((_, i) => !held[i]);
    setFlipping(newFlipping);
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
    setHeld((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const currentRank = phase === "dealt" ? evaluateHand(hand).rank : handResult?.rank;

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🎰 비디오 포커 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"DEAL을 누르면 5장을 받습니다.\n보관할 카드를 클릭해 HOLD하고 DRAW를 누르면 나머지 카드를 교체합니다.\n최종 5장의 족보에 따라 배당이 결정됩니다."}</HelpText>
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
        <Title>🎰 비디오 포커 (Jacks or Better)</Title>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseBtn onClick={onClose}>닫기</CloseBtn>
      </Header>

      {/* 패이 테이블 */}
      <PayTable>
        {PAY_TABLE.map((entry) => (
          <PayRow
            key={entry.rank}
            $active={currentRank === entry.rank}
            $dim={!!currentRank && currentRank !== entry.rank && entry.rank !== "nothing"}
          >
            <span>{entry.label}</span>
            <span style={{ textAlign: "right" }}>{entry.multiplier > 0 ? `${entry.multiplier}배` : "꽝"}</span>
          </PayRow>
        ))}
      </PayTable>

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

      {/* 카드 */}
      {(phase === "dealt" || phase === "result") && hand.length === 5 && (
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
                $result={
                  phase === "result"
                    ? (handResult?.multiplier ?? 0) > 0
                      ? "win"
                      : "lose"
                    : null
                }
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
      )}

      {/* 바닥 UI */}
      <BottomArea>
        <BalanceRow>
          <span>잔액</span>
          <BalanceValue>{balance.toLocaleString()}</BalanceValue>
          <span>베팅</span>
          <BalanceValue>{betAmount.toLocaleString()}</BalanceValue>
        </BalanceRow>

        <BetControls
          value={betAmount}
          onChange={setBetAmount}
          minBet={minBet}
          maxBet={maxBet}
          balance={balance}
          disabled={phase === "dealt"}
        />

        <ActionRow>
          {phase === "idle" || phase === "result" ? (
            <ActionBtn
              $variant="primary"
              onClick={deal}
              disabled={balance < betAmount}
            >
              {phase === "result" ? "다시 딜 (DEAL)" : "딜 (DEAL)"}
            </ActionBtn>
          ) : (
            <>
              <ActionBtn $variant="secondary" onClick={() => setHeld([false, false, false, false, false])}>
                전부 버리기
              </ActionBtn>
              <ActionBtn $variant="primary" onClick={draw}>
                드로우 (DRAW)
              </ActionBtn>
            </>
          )}
        </ActionRow>
      </BottomArea>
    </Overlay>
  );
}
