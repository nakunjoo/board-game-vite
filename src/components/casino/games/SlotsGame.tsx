import { useState, useRef } from "react";
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

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣"] as const;
type Symbol = typeof SYMBOLS[number];

// Weighted pool for more realistic slot feel (cherries more common, 7 very rare)
const SYMBOL_POOL: Symbol[] = [
  "🍒", "🍒", "🍒", "🍒",
  "🍋", "🍋", "🍋",
  "🍊", "🍊", "🍊",
  "🍇", "🍇",
  "🔔", "🔔",
  "💎",
  "7️⃣",
];

function randomSymbol(): Symbol {
  return SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
}

function calcMultiplier(payline: Symbol[]): number {
  const [a, b, c] = payline;
  // Two or more cherries
  if (a === "🍒" && b === "🍒" && c === "🍒") return 5;
  if (a === "🍒" && b === "🍒") return 2;
  if (a === "🍒") return 2;
  if (a === "🍋" && b === "🍋" && c === "🍋") return 8;
  if (a === "🍊" && b === "🍊" && c === "🍊") return 10;
  if (a === "🍇" && b === "🍇" && c === "🍇") return 15;
  if (a === "🔔" && b === "🔔" && c === "🔔") return 20;
  if (a === "💎" && b === "💎" && c === "💎") return 50;
  if (a === "7️⃣" && b === "7️⃣" && c === "7️⃣") return 100;
  return 0;
}

// ─── Animations ───────────────────────────────────────────────────────────────

const scrollAnim = keyframes`
  0%   { transform: translateY(0); }
  100% { transform: translateY(-${100 * 10}%); }
`;

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
  border: 2px solid #555;
  border-radius: 8px;
  overflow: hidden;
  background: #111;
  position: relative;
  height: 240px; /* 3 rows × 80px */
`;

const PaylineHighlight = styled.div<{ $win: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  top: 80px;
  height: 80px;
  border-top: 2px solid ${({ $win }) => ($win ? "#f0c040" : "rgba(240,192,64,0.25)")};
  border-bottom: 2px solid ${({ $win }) => ($win ? "#f0c040" : "rgba(240,192,64,0.25)")};
  pointer-events: none;
  z-index: 2;
  ${({ $win }) => $win && css`animation: ${winPulse} 0.8s ease infinite;`}
`;

const ReelStrip = styled.div<{ $spinning: boolean; $duration: number; $finalOffset: number }>`
  display: flex;
  flex-direction: column;
  ${({ $spinning, $duration, $finalOffset }) =>
    $spinning
      ? css`animation: ${scrollAnim} ${$duration}s linear infinite;`
      : css`transform: translateY(-${$finalOffset * 80}px); transition: transform ${$duration}s cubic-bezier(0.23, 1, 0.32, 1);`}
`;

const SymbolCell = styled.div`
  width: 100%;
  height: 80px;
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

const SpinButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ $disabled }) => ($disabled ? "#555" : "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)")};
  color: ${({ $disabled }) => ($disabled ? "#999" : "#0d5c2e")};
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

const REEL_COUNT = 3;
const ROW_COUNT = 3;

function buildReelSymbols(count = 20): Symbol[] {
  return Array.from({ length: count }, () => randomSymbol());
}

export default function SlotsGame({ balance, initialBalance, onBet, onResult, onClose }: CasinoGameProps) {
  const minBet = r100(initialBalance * SLOTS_MIN_RATIO);
  const maxBet = r100(initialBalance * SLOTS_MAX_RATIO);
  const [chipAmount, setChipAmount] = useState(() => r100(initialBalance * SLOTS_MIN_RATIO));
  const [spinning, setSpinning] = useState(false);
  const [resultText, setResultText] = useState("");
  const [isWin, setIsWin] = useState(false);
  // Each reel: array of symbols (extra long for animation), final offset (index of top visible row)
  const [reels, setReels] = useState<Symbol[][]>(() =>
    Array.from({ length: REEL_COUNT }, () => buildReelSymbols())
  );
  const [finalOffsets, setFinalOffsets] = useState<number[]>([0, 0, 0]);
  const [reelSpinning, setReelSpinning] = useState<boolean[]>([false, false, false]);
  const [reelDurations, setReelDurations] = useState<number[]>([0, 0, 0]);
  const [winPayline, setWinPayline] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Get visible 3 rows for a reel given finalOffset (offset = index of top visible)
  const getVisible = (reel: Symbol[], offset: number): Symbol[] => {
    const len = reel.length;
    return [reel[offset % len], reel[(offset + 1) % len], reel[(offset + 2) % len]];
  };

  const handleSpin = () => {
    if (spinning || balance < chipAmount) return;
    onBet(chipAmount);
    setResultText("");
    setWinPayline(false);

    // Build new reels with results embedded
    const results: Symbol[] = Array.from({ length: REEL_COUNT }, () => randomSymbol());

    const newReels: Symbol[][] = reels.map((_, ri) => {
      const pool = buildReelSymbols(16);
      // Place result at index 1 (middle visible row) of final 3
      pool[pool.length - 2] = results[ri];
      return pool;
    });

    const newOffsets: number[] = newReels.map((reel) => reel.length - ROW_COUNT);
    const stopDurations: number[] = [1.8, 2.3, 2.8];
    const spinDurations: number[] = [0.3, 0.3, 0.3];

    setReels(newReels);
    setFinalOffsets(newOffsets);
    setReelSpinning([true, true, true]);
    setReelDurations(spinDurations);
    setSpinning(true);

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Stop each reel sequentially
    for (let ri = 0; ri < REEL_COUNT; ri++) {
      const t = setTimeout(() => {
        setReelSpinning((prev) => {
          const next = [...prev];
          next[ri] = false;
          return next;
        });
        setReelDurations((prev) => {
          const next = [...prev];
          next[ri] = 0.4;
          return next;
        });

        if (ri === REEL_COUNT - 1) {
          // All reels stopped — calculate result
          setTimeout(() => {
            const payline = results;
            const multiplier = calcMultiplier(payline);
            const delta = multiplier > 0 ? (multiplier - 1) * chipAmount : 0;
            const win = multiplier > 0;
            setIsWin(win);
            setWinPayline(win);
            if (win) {
              setResultText(`💰 ${multiplier}배! +${(delta).toLocaleString()}원`);
            } else {
              setResultText(`😢 꽝`);
            }
            onResult(delta);
            setSpinning(false);
          }, 300);
        }
      }, stopDurations[ri] * 1000);
      timersRef.current.push(t);
    }
  };

  const canSpin = !spinning && balance >= chipAmount;

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
          {reels.map((reel, ri) => {
            const visibleSymbols = getVisible(reel, reelSpinning[ri] ? 0 : finalOffsets[ri]);
            // For spinning: show a long strip; for stopped: show 3 cells at offset
            return (
              <ReelWrapper key={ri}>
                <PaylineHighlight $win={winPayline} />
                {reelSpinning[ri] ? (
                  <ReelStrip $spinning $duration={reelDurations[ri]} $finalOffset={0}>
                    {/* Repeat symbols for infinite scroll illusion */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <SymbolCell key={i}>{SYMBOLS[i % SYMBOLS.length]}</SymbolCell>
                    ))}
                  </ReelStrip>
                ) : (
                  <div>
                    {visibleSymbols.map((sym, si) => (
                      <SymbolCell key={si}>{sym}</SymbolCell>
                    ))}
                  </div>
                )}
              </ReelWrapper>
            );
          })}
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

        <SpinButton $disabled={!canSpin} onClick={handleSpin}>
          {spinning ? "스핀 중..." : "SPIN"}
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
