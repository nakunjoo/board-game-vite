import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, { HelpSection, HelpText, PayTable as HelpPayTable, PayLabel, PayValue } from "./GameHelpModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const SLOTS_MIN_RATIO = 0.01;
const SLOTS_MAX_RATIO = 0.02;

// ─── Constants ────────────────────────────────────────────────────────────────

const CELL_H = 80;
const REEL_COUNT = 3;
const SPIN_ROWS = 80;
const SPIN_DURATION = 5; // 스핀 선형 이동 시간(초)
const AUTO_STOP_DELAY = 5000; // 5초 후 자동 정지

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣"] as const;
type SlotSymbol = typeof SYMBOLS[number];

const SYMBOL_POOL: SlotSymbol[] = [
  "🍒", "🍒", "🍒", "🍒",
  "🍋", "🍋", "🍋",
  "🍊", "🍊", "🍊",
  "🍇", "🍇",
  "🔔", "🔔",
  "💎",
  "7️⃣",
];

function randomSymbol(): SlotSymbol {
  return SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
}

function calcMultiplier(payline: SlotSymbol[]): number {
  const [a, b, c] = payline;
  if (a === "7️⃣" && b === "7️⃣" && c === "7️⃣") return 100;
  if (a === "💎" && b === "💎" && c === "💎") return 50;
  if (a === "🔔" && b === "🔔" && c === "🔔") return 20;
  if (a === "🍇" && b === "🍇" && c === "🍇") return 15;
  if (a === "🍊" && b === "🍊" && c === "🍊") return 10;
  if (a === "🍋" && b === "🍋" && c === "🍋") return 8;
  if (a === "🍒" && b === "🍒" && c === "🍒") return 5;
  if (a === "🍒" && b === "🍒") return 2;
  if (a === "🍒") return 2;
  return 0;
}

// 결과 심볼이 가운데 행에 오도록 긴 스트립 생성
// 구조: [SPIN_ROWS개 랜덤] [result] [2개 랜덤]
// 멈췄을 때: 위=SPIN_ROWS-1, 가운데=SPIN_ROWS(result), 아래=SPIN_ROWS+1
function buildStrip(result: SlotSymbol): { strip: SlotSymbol[]; finalY: number } {
  const total = SPIN_ROWS + 3;
  const strip: SlotSymbol[] = Array.from({ length: total }, () => randomSymbol());
  strip[SPIN_ROWS] = result;
  const finalY = -((SPIN_ROWS - 1) * CELL_H);
  return { strip, finalY };
}

// ─── Animations ───────────────────────────────────────────────────────────────

const winPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(240, 192, 64, 0.6); }
  50%       { box-shadow: 0 0 0 10px rgba(240, 192, 64, 0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
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
  max-width: 480px;
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

const Machine = styled.div`
  background: #1a4a2a;
  border: 3px solid #f0c040;
  border-radius: 20px;
  padding: 20px;
  width: 100%;
  max-width: 380px;
  box-sizing: border-box;
  margin-bottom: 20px;
`;

const ReelContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
`;

const ReelWrapper = styled.div`
  flex: 1;
  height: ${CELL_H * 3}px;
  overflow: hidden;
  border: 2px solid #555;
  border-radius: 8px;
  background: #111;
  position: relative;
`;

const PaylineHighlight = styled.div<{ $win: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: ${CELL_H}px;
  height: ${CELL_H}px;
  border-top: 2px solid ${({ $win }) => ($win ? "#f0c040" : "rgba(240,192,64,0.25)")};
  border-bottom: 2px solid ${({ $win }) => ($win ? "#f0c040" : "rgba(240,192,64,0.25)")};
  pointer-events: none;
  z-index: 2;
  ${({ $win }) => $win && css`animation: ${winPulse} 0.8s ease infinite;`}
`;

const ReelStrip = styled.div`
  display: flex;
  flex-direction: column;
  will-change: transform;
`;

const SymbolCell = styled.div`
  width: 100%;
  height: ${CELL_H}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  flex-shrink: 0;
`;

const ResultText = styled.div<{ $win: boolean }>`
  text-align: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: ${({ $win }) => ($win ? "#f0c040" : "#e74c3c")};
  min-height: 28px;
  animation: ${({ $win: _ }) => css`${fadeIn} 0.3s ease`};
`;

const Section = styled.div`
  width: 100%;
  max-width: 380px;
  padding: 0 4px;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  color: #f0c040;
  font-size: 0.8rem;
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const SpinButton = styled.button<{ $disabled: boolean; $stop?: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ $disabled, $stop }) =>
    $stop ? "linear-gradient(135deg, #e74c3c 0%, #922b21 100%)"
    : $disabled ? "#555"
    : "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)"};
  color: ${({ $disabled }) => ($disabled ? "#999" : "#fff")};
  font-size: 1.2rem;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  letter-spacing: 3px;
  margin-bottom: 20px;
`;

const PayTable = styled.div`
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 16px;
`;

const PayRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: #ccc;
  font-size: 0.8rem;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  &:last-child { border-bottom: none; }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SlotsGame({ balance, initialBalance, onBet, onResult, onClose }: CasinoGameProps) {
  const minBet = r100(initialBalance * SLOTS_MIN_RATIO);
  const maxBet = r100(initialBalance * SLOTS_MAX_RATIO);

  const [chipAmount, setChipAmount] = useState(() => r100(initialBalance * SLOTS_MIN_RATIO));
  const [spinning, setSpinning] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [resultText, setResultText] = useState("");
  const [isWin, setIsWin] = useState(false);
  const [winPayline, setWinPayline] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [spinKey, setSpinKey] = useState(0);
  const [strips, setStrips] = useState<SlotSymbol[][]>(() =>
    Array.from({ length: REEL_COUNT }, () => buildStrip(randomSymbol()).strip)
  );

  const reelStripRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const finalYsRef = useRef<number[]>([0, 0, 0]);
  const resultsRef = useRef<SlotSymbol[]>([]);
  const betRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addTimer = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const showResult = () => {
    const multiplier = calcMultiplier(resultsRef.current);
    const bet = betRef.current;
    const win = multiplier > 0;
    setIsWin(win);
    setWinPayline(win);
    if (win) {
      setResultText(`💰 ${multiplier}배! +${((multiplier - 1) * bet).toLocaleString()}원`);
      onResult(multiplier * bet);
    } else {
      setResultText("😢 꽝");
      onResult(0);
    }
    setSpinning(false);
    setStopped(false);
  };

  // 릴 하나를 현재 위치에서 읽어 finalY로 ease-out
  const stopReelImperative = (ri: number) => {
    const el = reelStripRefs.current[ri];
    if (!el) return;
    const matrix = new DOMMatrix(window.getComputedStyle(el).transform);
    const currentY = matrix.m42;
    el.style.transition = "none";
    el.style.transform = `translateY(${currentY}px)`;
    void el.getBoundingClientRect(); // force reflow
    el.style.transition = "transform 0.5s ease-out";
    el.style.transform = `translateY(${finalYsRef.current[ri]}px)`;
  };

  // STOP 한 번 → 0→300ms→600ms 간격으로 순서대로 정지, 마지막 후 700ms에 결과
  const startStopSequence = () => {
    setStopped(true);
    clearAllTimers();
    addTimer(() => stopReelImperative(0), 0);
    addTimer(() => stopReelImperative(1), 300);
    addTimer(() => {
      stopReelImperative(2);
      addTimer(showResult, 700);
    }, 600);
  };

  const handleStop = () => {
    if (!spinning || stopped) return;
    startStopSequence();
  };

  const handleSpin = () => {
    if (spinning || balance < chipAmount) return;
    const newResults: SlotSymbol[] = Array.from({ length: REEL_COUNT }, () => randomSymbol());
    const newFinalYs: number[] = [];
    const newStrips: SlotSymbol[][] = [];
    for (let ri = 0; ri < REEL_COUNT; ri++) {
      const { strip, finalY } = buildStrip(newResults[ri]);
      newStrips.push(strip);
      newFinalYs.push(finalY);
    }
    resultsRef.current = newResults;
    betRef.current = chipAmount;
    finalYsRef.current = newFinalYs;

    clearAllTimers();
    onBet(chipAmount);
    setSpinning(true);
    setStopped(false);
    setResultText("");
    setWinPayline(false);
    setStrips(newStrips);
    setSpinKey((k) => k + 1);

    // 5초 후 자동 정지
    addTimer(startStopSequence, AUTO_STOP_DELAY);
  };

  // spinKey 변경 시 strips 리마운트 완료 후 linear 트랜지션 시작
  useEffect(() => {
    if (spinKey === 0) return;
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        reelStripRefs.current.forEach((el, ri) => {
          if (!el) return;
          el.style.transition = `transform ${SPIN_DURATION}s linear`;
          el.style.transform = `translateY(${finalYsRef.current[ri]}px)`;
        });
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
  }, [spinKey]);

  const canSpin = !spinning && balance >= chipAmount;
  const canStop = spinning && !stopped;

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🎰 슬롯머신 도움말">
        <HelpSection title="게임 방법">
          <HelpText>베팅금을 설정하고 SPIN을 누르세요. 세 개의 릴이 멈추면 가운데 줄(페이라인)의 심볼 조합으로 배당이 결정됩니다.</HelpText>
        </HelpSection>
        <HelpSection title="배당표 (베팅금 × 배수)">
          <HelpPayTable>
            <PayLabel>🍒 하나라도 있으면</PayLabel><PayValue>2배</PayValue>
            <PayLabel>🍒🍒 두 개</PayLabel><PayValue>2배</PayValue>
            <PayLabel>🍒🍒🍒 쓰리</PayLabel><PayValue>5배</PayValue>
            <PayLabel>🍋🍋🍋</PayLabel><PayValue>8배</PayValue>
            <PayLabel>🍊🍊🍊</PayLabel><PayValue>10배</PayValue>
            <PayLabel>🍇🍇🍇</PayLabel><PayValue>15배</PayValue>
            <PayLabel>🔔🔔🔔</PayLabel><PayValue>20배</PayValue>
            <PayLabel>💎💎💎</PayLabel><PayValue>50배</PayValue>
            <PayLabel>7️⃣7️⃣7️⃣</PayLabel><PayValue>100배</PayValue>
          </HelpPayTable>
        </HelpSection>
        <HelpSection title="확률 안내">
          <HelpText>{"7️⃣은 매우 희귀합니다. 💎와 🔔도 낮은 확률로 등장합니다.\n꽝(0배)이 나오면 베팅금 전액 손실입니다."}</HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>🎰 슬롯</Title>
        <BalanceTag>💰 {balance.toLocaleString()}원</BalanceTag>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseButton $disabled={spinning} onClick={spinning ? undefined : onClose}>
          닫기
        </CloseButton>
      </Header>

      <Machine>
        <ReelContainer>
          {Array.from({ length: REEL_COUNT }, (_, ri) => (
            <ReelWrapper key={ri}>
              <PaylineHighlight $win={winPayline} />
              <ReelStrip
                key={`${ri}-${spinKey}`}
                ref={(el) => { reelStripRefs.current[ri] = el; }}
              >
                {strips[ri].map((sym, si) => (
                  <SymbolCell key={si}>{sym}</SymbolCell>
                ))}
              </ReelStrip>
            </ReelWrapper>
          ))}
        </ReelContainer>

        <ResultText $win={isWin}>{resultText || " "}</ResultText>
      </Machine>

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

        <SpinButton
          $disabled={!canStop && !canSpin}
          $stop={canStop}
          onClick={canStop ? handleStop : canSpin ? handleSpin : undefined}
        >
          {canStop ? "STOP" : "SPIN"}
        </SpinButton>

        <SectionLabel>배당표 (베팅금 × 배수)</SectionLabel>
        <PayTable>
          {[
            ["🍒 × 1 이상", "2배"],
            ["🍒 × 3", "5배"],
            ["🍋 × 3", "8배"],
            ["🍊 × 3", "10배"],
            ["🍇 × 3", "15배"],
            ["🔔 × 3", "20배"],
            ["💎 × 3", "50배"],
            ["7️⃣ × 3", "100배"],
          ].map(([label, pay]) => (
            <PayRow key={label}>
              <span>{label}</span>
              <span style={{ color: "#f0c040", fontWeight: "bold" }}>{pay}</span>
            </PayRow>
          ))}
        </PayTable>
      </Section>
    </Overlay>
  );
}
