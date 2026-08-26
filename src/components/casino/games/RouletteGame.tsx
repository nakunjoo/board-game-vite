import { useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import type { CoPlayer } from "../types";
import GameHelpModal, { HelpSection, HelpText, PayTable, PayLabel, PayValue } from "./GameHelpModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  coPlayers: CoPlayer[];
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const ROULETTE_MIN_RATIO = 0.01;
const ROULETTE_MAX_RATIO = 0.05;

type BetType =
  | "red" | "black" | "odd" | "even" | "low" | "high"
  | "dozen1" | "dozen2" | "dozen3"
  | { number: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

function getNumberColor(n: number): "red" | "black" | "green" {
  if (n === 0) return "green";
  if (RED_NUMBERS.has(n)) return "red";
  return "black";
}

function getColorHex(color: "red" | "black" | "green"): string {
  if (color === "red") return "#c0392b";
  if (color === "black") return "#1a1a1a";
  return "#27ae60";
}

function calcPayout(result: number, betType: BetType): number {
  if (typeof betType === "object") return betType.number === result ? 35 : 0;
  const color = getNumberColor(result);
  if (betType === "red") return color === "red" ? 1 : 0;
  if (betType === "black") return color === "black" ? 1 : 0;
  if (betType === "odd") return result !== 0 && result % 2 === 1 ? 1 : 0;
  if (betType === "even") return result !== 0 && result % 2 === 0 ? 1 : 0;
  if (betType === "low") return result >= 1 && result <= 18 ? 1 : 0;
  if (betType === "high") return result >= 19 && result <= 36 ? 1 : 0;
  if (betType === "dozen1") return result >= 1 && result <= 12 ? 2 : 0;
  if (betType === "dozen2") return result >= 13 && result <= 24 ? 2 : 0;
  if (betType === "dozen3") return result >= 25 && result <= 36 ? 2 : 0;
  return 0;
}

function betKey(bt: BetType): string {
  return typeof bt === "object" ? `n:${bt.number}` : bt;
}

function keyToBetType(key: string): BetType {
  return key.startsWith("n:") ? { number: parseInt(key.slice(2)) } : (key as BetType);
}

// ─── Animations ───────────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #0d5c2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  padding-bottom: 60px;
`;

const Header = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  color: #f0c040;
  font-size: 1.1rem;
  margin: 0;
  letter-spacing: 2px;
`;

const BalanceTag = styled.div`
  color: #f0c040;
  font-size: 1rem;
  font-weight: bold;
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
  width: 30px;
  height: 30px;
  cursor: pointer;
  flex-shrink: 0;
  &:hover { background: rgba(240, 192, 64, 0.28); }
`;

const CloseButton = styled.button<{ $disabled?: boolean }>`
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const CoPlayersRow = styled.div`
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 20px 8px;
  box-sizing: border-box;
`;

const CoPlayerTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 3px 8px;
  font-size: 0.75rem;
`;

const CoPlayerName = styled.span`
  color: #ddd;
`;

const CoPlayerProfit = styled.span<{ $positive: boolean; $negative: boolean }>`
  font-weight: 700;
  color: ${({ $positive, $negative }) => ($positive ? "#2ecc71" : $negative ? "#e74c3c" : "#888")};
`;

const WheelArea = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 4px 0 10px;
`;

const WheelOuter = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
`;

const WheelSvg = styled.svg<{ $spinning: boolean; $deg: number; $duration: number }>`
  width: 160px;
  height: 160px;
  transform-origin: center;
  ${({ $spinning, $deg, $duration }) =>
    $spinning
      ? css`animation: ${spin} ${$duration}s linear infinite;`
      : css`transform: rotate(${$deg}deg); transition: transform ${$duration}s cubic-bezier(0.23, 1, 0.32, 1);`}
`;

const WheelCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ResultCircle = styled.div<{ $color: string; $show: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 3px solid #f0c040;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  animation: ${({ $show }) => ($show ? css`${fadeIn} 0.3s ease` : "none")};
`;

const ResultBanner = styled.div<{ $win: boolean; $show: boolean }>`
  position: absolute;
  top: 50%;
  right: -80px;
  transform: translateY(-50%);
  font-size: 1rem;
  font-weight: bold;
  color: ${({ $win }) => ($win ? "#f0c040" : "#e74c3c")};
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  animation: ${({ $show }) => ($show ? css`${fadeIn} 0.3s ease` : "none")};
  white-space: nowrap;
  pointer-events: none;
`;

const Section = styled.div`
  width: 100%;
  max-width: 700px;
  padding: 0 16px;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  color: #f0c040;
  font-size: 0.8rem;
  margin-bottom: 4px;
  letter-spacing: 1px;
`;

const BetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  margin-bottom: 8px;
`;

const BetButton = styled.button<{ $bg: string; $active: boolean }>`
  position: relative;
  padding: 7px 4px;
  border-radius: 8px;
  border: 2px solid ${({ $active }) => ($active ? "#f0c040" : "transparent")};
  background: ${({ $bg }) => $bg};
  color: #fff;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  opacity: 0.9;
  &:hover { opacity: 1; }
`;

const NumberModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const NumberModalBox = styled.div`
  background: #0d5c2e;
  border: 1px solid #f0c040;
  border-radius: 14px;
  padding: 14px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NumberModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NumberModalTitle = styled.div`
  color: #f0c040;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
`;

const NumberModalClose = styled.button`
  background: none;
  border: 1px solid rgba(240,192,64,0.4);
  border-radius: 8px;
  color: #f0c040;
  font-size: 0.85rem;
  padding: 4px 12px;
  cursor: pointer;
  &:hover { background: rgba(240,192,64,0.15); }
`;

const NumberTable = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const NumberCell = styled.button<{ $bg: string; $active: boolean }>`
  position: relative;
  border-radius: 5px;
  border: 2px solid ${({ $active }) => ($active ? "#f0c040" : "transparent")};
  background: ${({ $bg }) => $bg};
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  height: 38px;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
  &:hover { border-color: #f0c040; }
`;

const ZeroCell = styled(NumberCell)``;

const NumberOpenBtn = styled.button`
  width: 100%;
  padding: 7px 16px;
  border-radius: 10px;
  border: 1px dashed rgba(240,192,64,0.5);
  background: rgba(240,192,64,0.07);
  color: #f0c040;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 1px;
  &:hover { background: rgba(240,192,64,0.14); }
`;

const NumberBetRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NumberBetSummary = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  min-height: 42px;
  align-items: center;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const NumberBetTag = styled.div<{ $color: string }>`
  position: relative;
  flex-shrink: 0;
  background: ${({ $color }) => $color};
  border: 1px solid rgba(240,192,64,0.4);
  border-radius: 5px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  &:hover { border-color: #f0c040; }
`;

const BetCountBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f0c040;
  color: #111;
  font-size: 0.55rem;
  font-weight: 800;
  border-radius: 4px;
  padding: 1px 3px;
  line-height: 1.3;
  pointer-events: none;
`;

const ChipBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -4px;
  background: #f0c040;
  color: #111;
  font-size: 0.58rem;
  font-weight: 800;
  border-radius: 8px;
  padding: 1px 4px;
  line-height: 1.4;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
`;

const SpinButton = styled.button<{ $disabled: boolean }>`
  position: fixed;
  bottom: 10px;
  left: 10px;
  right: 10px;
  border-radius: 12px;
  padding: 14px;
  border: none;
  background: ${({ $disabled }) => ($disabled ? "#555" : "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)")};
  color: ${({ $disabled }) => ($disabled ? "#999" : "#0d5c2e")};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  letter-spacing: 2px;
  z-index: 50;
`;

const BetSummaryRow = styled.div`
  position: fixed;
  bottom: 62px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #ccc;
  background: rgba(13,92,46,0.9);
  padding: 6px 12px;
  border-radius: 10px;
  z-index: 50;
`;

const ClearBtn = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  color: #aaa;
  font-size: 0.78rem;
  padding: 3px 10px;
  cursor: pointer;
  &:hover { background: rgba(255,255,255,0.18); color: #fff; }
`;

// ─── Wheel SVG Builder ────────────────────────────────────────────────────────

function buildWheelPath(index: number, total: number, r: number, cx: number, cy: number) {
  const startAngle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const endAngle = ((index + 1) / total) * 2 * Math.PI - Math.PI / 2;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
}

const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RouletteGame({ balance, initialBalance, coPlayers, onBet, onResult, onClose }: CasinoGameProps) {
  const minBet = r100(initialBalance * ROULETTE_MIN_RATIO);
  const maxBet = r100(initialBalance * ROULETTE_MAX_RATIO);

  const [chipAmount, setChipAmount] = useState(() => r100(initialBalance * ROULETTE_MIN_RATIO));
  const [bets, setBets] = useState<Record<string, number>>({});
  const [spinning, setSpinning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNumberModal, setShowNumberModal] = useState(false);
  const [resultNumber, setResultNumber] = useState<number | null>(null);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [spinDuration, setSpinDuration] = useState(0);
  const [resultText, setResultText] = useState("");
  const [isWin, setIsWin] = useState(false);
  const prevDegRef = useRef(0);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const placeBet = (bt: BetType) => {
    if (spinning) return;
    const key = betKey(bt);
    setBets((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + chipAmount }));
  };

  const clearAllBets = () => {
    if (!spinning) setBets({});
  };

  const getBetAmount = (bt: BetType): number => bets[betKey(bt)] ?? 0;
  const isActive = (bt: BetType): boolean => getBetAmount(bt) > 0;

  const fmtChip = (n: number): string => {
    if (n >= 10000) return `${Math.floor(n / 1000)}k`;
    if (n >= 1000) return `${n / 1000}k`;
    return String(n);
  };

  const handleSpin = () => {
    if (totalBet === 0 || spinning || balance < totalBet) return;
    onBet(totalBet);
    setSpinning(true);
    setResultNumber(null);
    setResultText("");

    const result = Math.floor(Math.random() * 37);
    const resultIndex = WHEEL_ORDER.indexOf(result);
    const sectorDeg = 360 / 37;

    const targetVisual = 360 - (resultIndex + 0.5) * sectorDeg;
    const currentVisual = prevDegRef.current % 360;
    let delta = (targetVisual - currentVisual + 360) % 360;
    if (delta < 1) delta += 360;

    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDeg = prevDegRef.current + extraSpins + delta;
    const duration = 3.5 + Math.random() * 0.5;

    setSpinDuration(duration);
    setWheelDeg(targetDeg);
    prevDegRef.current = targetDeg;

    setTimeout(() => {
      setSpinning(false);
      setResultNumber(result);

      let totalDelta = 0;
      for (const [key, amount] of Object.entries(bets)) {
        const bt = keyToBetType(key);
        const multiplier = calcPayout(result, bt);
        if (multiplier > 0) totalDelta += (multiplier + 1) * amount;
      }
      const win = totalDelta > 0;
      setIsWin(win);
      if (win) {
        setResultText(`+${totalDelta.toLocaleString()}원`);
      } else {
        setResultText("");
      }
      onResult(totalDelta);
    }, (duration + 0.1) * 1000);
  };

  const canSpin = totalBet > 0 && !spinning && balance >= totalBet;

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🎡 룰렛 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"칩 금액을 설정하고 원하는 베팅 칸을 클릭해 칩을 올리세요.\n여러 칸에 동시에 베팅할 수 있습니다.\n우클릭하면 해당 칸의 베팅을 취소합니다.\n공이 멈춘 숫자와 색상에 따라 배당이 계산됩니다."}</HelpText>
        </HelpSection>
        <HelpSection title="배당표">
          <PayTable>
            <PayLabel>단일 숫자 (0~36)</PayLabel><PayValue>35배 + 원금</PayValue>
            <PayLabel>🔴 레드 / ⚫ 블랙</PayLabel><PayValue>1배 + 원금</PayValue>
            <PayLabel>홀수 / 짝수</PayLabel><PayValue>1배 + 원금</PayValue>
            <PayLabel>1~18 / 19~36</PayLabel><PayValue>1배 + 원금</PayValue>
            <PayLabel>1st 12 (1~12)</PayLabel><PayValue>2배 + 원금</PayValue>
            <PayLabel>2nd 12 (13~24)</PayLabel><PayValue>2배 + 원금</PayValue>
            <PayLabel>3rd 12 (25~36)</PayLabel><PayValue>2배 + 원금</PayValue>
          </PayTable>
        </HelpSection>
        <HelpSection title="팁">
          <HelpText>{"단일 숫자는 고배당(35배)이지만 확률이 낮습니다.\n여러 칸에 나눠 베팅해 위험을 분산시키세요."}</HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>🎡 룰렛</Title>
        <BalanceTag>💰 {balance.toLocaleString()}원</BalanceTag>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseButton $disabled={spinning} onClick={spinning ? undefined : onClose}>
          닫기
        </CloseButton>
      </Header>

      {coPlayers.length > 0 && (
        <CoPlayersRow>
          {coPlayers.map((p) => (
            <CoPlayerTag key={p.nickname}>
              <CoPlayerName>{p.nickname}</CoPlayerName>
              <CoPlayerProfit $positive={p.profit > 0} $negative={p.profit < 0}>
                {p.profit > 0 ? `+${p.profit.toLocaleString()}` : p.profit.toLocaleString()}
              </CoPlayerProfit>
            </CoPlayerTag>
          ))}
        </CoPlayersRow>
      )}

      {/* Wheel */}
      <WheelArea>
        <div style={{ width: 0, height: 0,
          borderLeft: "8px solid transparent", borderRight: "8px solid transparent",
          borderTop: "18px solid #f0c040",
          marginBottom: "-6px", zIndex: 10, position: "relative" }} />
        <WheelOuter>
          <WheelSvg
            viewBox="0 0 200 200"
            $spinning={false}
            $deg={wheelDeg}
            $duration={spinning ? spinDuration : spinDuration}
          >
            {WHEEL_ORDER.map((num, i) => (
              <path
                key={i}
                d={buildWheelPath(i, 37, 98, 100, 100)}
                fill={getColorHex(getNumberColor(num))}
                stroke="#f0c040"
                strokeWidth="0.5"
              />
            ))}
            <circle cx="100" cy="100" r="18" fill="#0d5c2e" stroke="#f0c040" strokeWidth="2" />
          </WheelSvg>
          <WheelCenter>
            {resultNumber !== null && (
              <ResultCircle $color={getColorHex(getNumberColor(resultNumber))} $show>
                {resultNumber}
              </ResultCircle>
            )}
          </WheelCenter>
          <ResultBanner $win={isWin} $show={!!resultText}>{resultText}</ResultBanner>
        </WheelOuter>
      </WheelArea>

      {/* 칩 금액 설정 */}
      <Section>
        <BetControls
          value={chipAmount}
          onChange={setChipAmount}
          minBet={minBet}
          maxBet={maxBet}
          balance={balance}
          disabled={spinning}
        />
      </Section>

      {/* 외부 베팅 */}
      <Section>
        <SectionLabel>외부 베팅</SectionLabel>
        <BetGrid>
          {(
            [
              { bt: "red" as BetType, label: "🔴 레드 (1:1)", bg: "#c0392b" },
              { bt: "black" as BetType, label: "⚫ 블랙 (1:1)", bg: "#1a1a1a" },
              { bt: "odd" as BetType, label: "홀수 (1:1)", bg: "#2c3e50" },
              { bt: "even" as BetType, label: "짝수 (1:1)", bg: "#2c3e50" },
              { bt: "low" as BetType, label: "1~18 (1:1)", bg: "#2c3e50" },
              { bt: "high" as BetType, label: "19~36 (1:1)", bg: "#2c3e50" },
              { bt: "dozen1" as BetType, label: "1st 12 (2:1)", bg: "#6c3483" },
              { bt: "dozen2" as BetType, label: "2nd 12 (2:1)", bg: "#6c3483" },
              { bt: "dozen3" as BetType, label: "3rd 12 (2:1)", bg: "#6c3483" },
            ] as { bt: BetType; label: string; bg: string }[]
          ).map(({ bt, label, bg }) => {
            const amt = getBetAmount(bt);
            return (
              <BetButton
                key={String(bt)}
                $bg={bg}
                $active={isActive(bt)}
                onClick={() => placeBet(bt)}
              >
                {label}
                {amt > 0 && <ChipBadge>{fmtChip(amt)}</ChipBadge>}
              </BetButton>
            );
          })}
        </BetGrid>
      </Section>

      {/* 단일 숫자 */}
      <Section>
        <SectionLabel>단일 숫자 (35:1)</SectionLabel>
        <NumberBetRow>
          <NumberOpenBtn onClick={() => !spinning && setShowNumberModal(true)}>
            🎯 숫자 선택하기
          </NumberOpenBtn>
          <NumberBetSummary>
            {Object.entries(bets).filter(([k]) => k.startsWith("n:")).map(([key, amt]) => {
              const n = parseInt(key.slice(2));
              const color = getNumberColor(n);
              return (
                <NumberBetTag
                  key={key}
                  $color={getColorHex(color)}
                  onClick={() => !spinning && setShowNumberModal(true)}
                >
                  {n}
                  <BetCountBadge>x{Math.round(amt / chipAmount)}</BetCountBadge>
                </NumberBetTag>
              );
            })}
          </NumberBetSummary>
        </NumberBetRow>
      </Section>

      {/* 숫자 선택 모달 */}
      {showNumberModal && (
        <NumberModalOverlay onClick={() => setShowNumberModal(false)}>
          <NumberModalBox onClick={(e) => e.stopPropagation()}>
            <NumberModalHeader>
              <NumberModalTitle>🎯 숫자 베팅 (35:1)</NumberModalTitle>
              <NumberModalClose onClick={() => setShowNumberModal(false)}>완료</NumberModalClose>
            </NumberModalHeader>
            <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
              탭할 때마다 칩 추가 · 취소는 아래 태그의 ✕ 버튼
            </div>
            <NumberTable>
              {[0, ...Array.from({ length: 36 }, (_, i) => i + 1)].map((n) => {
                const bt: BetType = { number: n };
                const amt = getBetAmount(bt);
                return (
                  <ZeroCell
                    key={n}
                    $bg={getColorHex(getNumberColor(n))}
                    $active={isActive(bt)}
                    onClick={() => placeBet(bt)}
                  >
                    {n}
                    {amt > 0 && <ChipBadge>{fmtChip(amt)}</ChipBadge>}
                  </ZeroCell>
                );
              })}
            </NumberTable>
          </NumberModalBox>
        </NumberModalOverlay>
      )}

      {/* 총 베팅 요약 */}
      <BetSummaryRow>
        <span>총 베팅: <strong style={{ color: totalBet > 0 ? "#f0c040" : "#666" }}>{totalBet.toLocaleString()}원</strong></span>
        {totalBet > 0 && !spinning && (
          <ClearBtn onClick={clearAllBets}>전체 초기화</ClearBtn>
        )}
      </BetSummaryRow>

      <Section>
        <SpinButton $disabled={!canSpin} onClick={handleSpin}>
          {spinning ? "스핀 중..." : "SPIN"}
        </SpinButton>
      </Section>
    </Overlay>
  );
}
