import { useState, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, { HelpSection, HelpText, PayTable, PayLabel, PayValue } from "./GameHelpModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const ROULETTE_MIN_RATIO = 0.01;
const ROULETTE_MAX_RATIO = 0.05;

type BetType =
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"
  | "dozen1"
  | "dozen2"
  | "dozen3"
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
  if (typeof betType === "object") {
    return betType.number === result ? 35 : 0;
  }
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
`;

const Header = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  color: #f0c040;
  font-size: 1.3rem;
  margin: 0;
  letter-spacing: 2px;
`;

const BalanceTag = styled.div`
  color: #f0c040;
  font-size: 1rem;
  font-weight: bold;
`;

const HelpBtn = styled.button`
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

const WheelArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0 16px;
`;

const WheelOuter = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const WheelSvg = styled.svg<{ $spinning: boolean; $deg: number; $duration: number }>`
  width: 200px;
  height: 200px;
  transform-origin: center;
  ${({ $spinning, $deg, $duration }) =>
    $spinning
      ? css`
          animation: ${spin} ${$duration}s linear infinite;
        `
      : css`
          transform: rotate(${$deg}deg);
          transition: transform ${$duration}s cubic-bezier(0.23, 1, 0.32, 1);
        `}
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
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 3px solid #f0c040;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  animation: ${({ $show }) => ($show ? css`${fadeIn} 0.3s ease` : "none")};
`;

const ResultBanner = styled.div<{ $win: boolean }>`
  margin-top: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  color: ${({ $win }) => ($win ? "#f0c040" : "#e74c3c")};
  min-height: 24px;
  text-align: center;
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
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const BetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 14px;
`;

const BetButton = styled.button<{ $bg: string; $active: boolean }>`
  padding: 10px 4px;
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

const NumberTable = styled.div`
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 3px;
  margin-bottom: 16px;
`;

const NumberCell = styled.button<{ $bg: string; $active: boolean }>`
  aspect-ratio: 1;
  border-radius: 4px;
  border: 2px solid ${({ $active }) => ($active ? "#f0c040" : "transparent")};
  background: ${({ $bg }) => $bg};
  color: #fff;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  &:hover { border-color: #f0c040; }
`;

const ZeroCell = styled(NumberCell)`
  grid-column: span 1;
`;

const SpinButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  max-width: 700px;
  margin: 0 auto 24px;
  display: block;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ $disabled }) => ($disabled ? "#555" : "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)")};
  color: ${({ $disabled }) => ($disabled ? "#999" : "#0d5c2e")};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  letter-spacing: 2px;
`;

const CurrentBetInfo = styled.div`
  text-align: center;
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 12px;
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

// European roulette order
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RouletteGame({ balance, initialBalance, onBet, onResult, onClose }: CasinoGameProps) {
  const minBet = r100(initialBalance * ROULETTE_MIN_RATIO);
  const maxBet = r100(initialBalance * ROULETTE_MAX_RATIO);
  const [chipAmount, setChipAmount] = useState(() => r100(initialBalance * ROULETTE_MIN_RATIO));
  const [betType, setBetType] = useState<BetType | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [resultNumber, setResultNumber] = useState<number | null>(null);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [spinDuration, setSpinDuration] = useState(0);
  const [resultText, setResultText] = useState("");
  const [isWin, setIsWin] = useState(false);
  const prevDegRef = useRef(0);

  const betLabel = (bt: BetType | null): string => {
    if (!bt) return "없음";
    if (typeof bt === "object") return `${bt.number}번`;
    const map: Record<string, string> = {
      red: "레드", black: "블랙", odd: "홀수", even: "짝수",
      low: "1~18", high: "19~36", dozen1: "1~12", dozen2: "13~24", dozen3: "25~36",
    };
    return map[bt] ?? bt;
  };

  const isActive = (bt: BetType): boolean => {
    if (!betType) return false;
    if (typeof bt === "object" && typeof betType === "object") return bt.number === betType.number;
    return bt === betType;
  };

  const handleSpin = () => {
    if (!betType || spinning || balance < chipAmount) return;
    onBet(chipAmount);
    setSpinning(true);
    setResultNumber(null);
    setResultText("");

    const result = Math.floor(Math.random() * 37);
    const resultIndex = WHEEL_ORDER.indexOf(result);
    const sectorDeg = 360 / 37;
    // We want the sector to land at the top (pointer at 12 o'clock)
    const targetSectorDeg = resultIndex * sectorDeg;
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDeg = prevDegRef.current + extraSpins + (360 - targetSectorDeg - sectorDeg / 2);
    const duration = 3.5 + Math.random() * 0.5;

    setSpinDuration(duration);
    setWheelDeg(targetDeg);
    prevDegRef.current = targetDeg % 360;

    setTimeout(() => {
      setSpinning(false);
      setResultNumber(result);
      const multiplier = calcPayout(result, betType);
      const delta = multiplier * chipAmount;
      const win = multiplier > 0;
      setIsWin(win);
      if (win) {
        setResultText(`🎉 당첨! +${delta.toLocaleString()}원 (${multiplier + 1}배)`);
      } else {
        setResultText(`😢 꽝! -${chipAmount.toLocaleString()}원`);
      }
      onResult(delta);
    }, (duration + 0.1) * 1000);
  };

  const canSpin = !!betType && !spinning && balance >= chipAmount;

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🎡 룰렛 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"베팅 유형을 선택하고 베팅금을 설정한 뒤 SPIN을 누르세요.\n공이 멈춘 숫자와 색상에 따라 배당이 결정됩니다.\n0은 그린으로, 모든 외부 베팅 패배입니다."}</HelpText>
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
          <HelpText>{"단일 숫자는 고배당(35배)이지만 확률이 낮습니다.\n레드/블랙, 홀/짝은 거의 50% 확률이지만 배당이 낮습니다."}</HelpText>
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

      {/* Wheel */}
      <WheelArea>
        <WheelOuter>
          <WheelSvg
            viewBox="0 0 200 200"
            $spinning={false}
            $deg={wheelDeg}
            $duration={spinning ? spinDuration : spinDuration}
          >
            {WHEEL_ORDER.map((num, i) => {
              const color = getNumberColor(num);
              return (
                <path
                  key={i}
                  d={buildWheelPath(i, 37, 98, 100, 100)}
                  fill={getColorHex(color)}
                  stroke="#f0c040"
                  strokeWidth="0.5"
                />
              );
            })}
            <circle cx="100" cy="100" r="18" fill="#0d5c2e" stroke="#f0c040" strokeWidth="2" />
          </WheelSvg>
          {/* pointer */}
          <WheelCenter>
            <div style={{ position: "absolute", top: 2, width: 0, height: 0,
              borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
              borderBottom: "16px solid #f0c040" }} />
          </WheelCenter>
          <WheelCenter>
            {resultNumber !== null && (
              <ResultCircle $color={getColorHex(getNumberColor(resultNumber))} $show>
                {resultNumber}
              </ResultCircle>
            )}
          </WheelCenter>
        </WheelOuter>
        <ResultBanner $win={isWin}>{resultText || " "}</ResultBanner>
      </WheelArea>

      {/* Bet amount */}
      <Section>
        <SectionLabel>베팅금 설정</SectionLabel>
        <BetControls
          value={chipAmount}
          onChange={setChipAmount}
          minBet={minBet}
          maxBet={maxBet}
          balance={balance}
          disabled={spinning}
        />
      </Section>

      {/* Bet type buttons */}
      <Section>
        <SectionLabel>베팅 선택</SectionLabel>
        <BetGrid>
          <BetButton $bg="#c0392b" $active={isActive("red")} onClick={() => setBetType("red")}>🔴 레드 (1:1)</BetButton>
          <BetButton $bg="#1a1a1a" $active={isActive("black")} onClick={() => setBetType("black")}>⚫ 블랙 (1:1)</BetButton>
          <BetButton $bg="#2c3e50" $active={isActive("odd")} onClick={() => setBetType("odd")}>홀수 (1:1)</BetButton>
          <BetButton $bg="#2c3e50" $active={isActive("even")} onClick={() => setBetType("even")}>짝수 (1:1)</BetButton>
          <BetButton $bg="#2c3e50" $active={isActive("low")} onClick={() => setBetType("low")}>1~18 (1:1)</BetButton>
          <BetButton $bg="#2c3e50" $active={isActive("high")} onClick={() => setBetType("high")}>19~36 (1:1)</BetButton>
          <BetButton $bg="#6c3483" $active={isActive("dozen1")} onClick={() => setBetType("dozen1")}>1st 12 (2:1)</BetButton>
          <BetButton $bg="#6c3483" $active={isActive("dozen2")} onClick={() => setBetType("dozen2")}>2nd 12 (2:1)</BetButton>
          <BetButton $bg="#6c3483" $active={isActive("dozen3")} onClick={() => setBetType("dozen3")}>3rd 12 (2:1)</BetButton>
        </BetGrid>
      </Section>

      {/* Number table */}
      <Section>
        <SectionLabel>단일 숫자 (35:1)</SectionLabel>
        <NumberTable>
          <ZeroCell
            key={0}
            $bg={getColorHex("green")}
            $active={isActive({ number: 0 })}
            onClick={() => setBetType({ number: 0 })}
          >0</ZeroCell>
          {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
            <NumberCell
              key={n}
              $bg={getColorHex(getNumberColor(n))}
              $active={isActive({ number: n })}
              onClick={() => setBetType({ number: n })}
            >{n}</NumberCell>
          ))}
        </NumberTable>
      </Section>

      <CurrentBetInfo>
        현재 베팅: {betLabel(betType)} | 베팅금: {chipAmount.toLocaleString()}원
      </CurrentBetInfo>

      <Section>
        <SpinButton $disabled={!canSpin} onClick={handleSpin}>
          {spinning ? "스핀 중..." : "SPIN"}
        </SpinButton>
      </Section>
    </Overlay>
  );
}
