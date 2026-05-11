import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import GameHelpModal, { HelpSection, HelpText, PayTable as HelpPayTable, PayLabel, PayValue } from "./GameHelpModal";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  onBet: (amount: number) => void;
  onResult: (delta: number) => void;
  onClose: () => void;
}

type Phase = "idle" | "racing" | "result";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const r100 = (v: number) => Math.max(100, Math.round(v / 100) * 100);
const HORSE_MIN_RATIO = 0.05;
const HORSE_MAX_RATIO = 0.30;

const HORSES = [
  { id: 0, name: "1번 말", color: "#e74c3c", emoji: "🔴" },
  { id: 1, name: "2번 말", color: "#3498db", emoji: "🔵" },
  { id: 2, name: "3번 말", color: "#2ecc71", emoji: "🟢" },
  { id: 3, name: "4번 말", color: "#f39c12", emoji: "🟡" },
];

const RACE_DURATION_MS = 4000;
const TICK_MS = 50;

// ─── 애니메이션 ───────────────────────────────────────────────────────────────

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── 스타일 ───────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #1a3a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
`;

const Header = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
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

const TrackArea = styled.div`
  width: 100%;
  max-width: 500px;
  background: #2d5a1b;
  border: 2px solid #f0c040;
  border-radius: 14px;
  padding: 16px;
  box-sizing: border-box;
  margin-bottom: 16px;
`;

const TrackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
`;

const HorseName = styled.div<{ $color: string; $selected: boolean }>`
  min-width: 64px;
  font-size: 0.8rem;
  font-weight: 700;
  color: ${({ $selected, $color }) => ($selected ? $color : "#ccc")};
  cursor: pointer;
  user-select: none;
`;

const TrackBar = styled.div`
  flex: 1;
  height: 28px;
  background: rgba(0,0,0,0.3);
  border-radius: 14px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ $color: string; $pct: number; $racing: boolean }>`
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 14px;
  transition: ${({ $racing }) => ($racing ? "width 0.05s linear" : "width 0.3s ease")};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 4px;
`;

const HorseEmoji = styled.span`
  font-size: 1.1rem;
  line-height: 1;
`;

const FinishFlag = styled.div`
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const RankBadge = styled.div<{ $rank: number }>`
  min-width: 28px;
  height: 22px;
  border-radius: 11px;
  background: ${({ $rank }) =>
    $rank === 1 ? "#f0c040" : $rank === 2 ? "#aaa" : $rank === 3 ? "#cd7f32" : "#555"};
  color: ${({ $rank }) => ($rank <= 3 ? "#111" : "#aaa")};
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ResultBanner = styled.div<{ $win: boolean }>`
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $win }) => ($win ? "#f0c040" : "#e74c3c")};
  min-height: 24px;
  animation: ${({ $win: _ }) => css`${fadeIn} 0.3s ease`};
  margin-top: 8px;
`;

const Section = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 0 4px;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  color: #f0c040;
  font-size: 0.8rem;
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const HorseSelectRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
`;

const HorseSelectBtn = styled.button<{ $color: string; $selected: boolean }>`
  padding: 10px 4px;
  border-radius: 10px;
  border: 2.5px solid ${({ $selected, $color }) => ($selected ? $color : "rgba(255,255,255,0.15)")};
  background: ${({ $selected, $color }) => ($selected ? `${$color}22` : "rgba(255,255,255,0.05)")};
  color: ${({ $selected, $color }) => ($selected ? $color : "#aaa")};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: border 0.15s, background 0.15s;
`;

const StartButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ $disabled }) => ($disabled ? "#555" : "linear-gradient(135deg, #f0c040 0%, #e67e22 100%)")};
  color: ${({ $disabled }) => ($disabled ? "#999" : "#1a3a1a")};
  font-size: 1.1rem;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  letter-spacing: 2px;
  margin-bottom: 16px;
  ${({ $disabled }) => !$disabled && css`&:hover { filter: brightness(1.08); }`}
`;

const RacingLabel = styled.div`
  text-align: center;
  color: #f0c040;
  font-size: 0.9rem;
  font-weight: 700;
  animation: ${pulse} 0.8s ease infinite;
  margin-bottom: 8px;
`;

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function simulateRace(winnerId: number): number[][] {
  // Returns array of [progress at each tick] for each horse
  const ticks = Math.ceil(RACE_DURATION_MS / TICK_MS);
  const positions: number[][] = HORSES.map(() => new Array(ticks + 1).fill(0));

  // Each horse gets a random speed profile
  // Winner reaches ~100% at the end, others might not
  for (let h = 0; h < 4; h++) {
    const isWinner = h === winnerId;
    // Speeds vary per "segment" (simulate natural acceleration/deceleration)
    let pos = 0;
    const baseSpeed = isWinner ? 105 : 70 + Math.random() * 28;
    const segments = 8;
    const segLen = ticks / segments;
    const speedVariations = Array.from({ length: segments }, () => 0.7 + Math.random() * 0.6);

    for (let t = 0; t < ticks; t++) {
      const seg = Math.floor(t / segLen);
      const speed = (baseSpeed / ticks) * speedVariations[Math.min(seg, segments - 1)];
      pos = Math.min(100, pos + speed);
      positions[h][t + 1] = pos;
    }
    // Ensure winner hits 100
    if (isWinner) positions[h][ticks] = 100;
  }

  return positions;
}

export default function HorseRacingGame({ balance, initialBalance, onBet, onResult, onClose }: CasinoGameProps) {
  const minBet = r100(initialBalance * HORSE_MIN_RATIO);
  const maxBet = r100(initialBalance * HORSE_MAX_RATIO);

  const [phase, setPhase] = useState<Phase>("idle");
  const [betAmount, setBetAmount] = useState(() => r100(initialBalance * HORSE_MIN_RATIO));
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [rankOrder, setRankOrder] = useState<number[]>([]);
  const [resultText, setResultText] = useState("");
  const [isWin, setIsWin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const tickRef = useRef(0);
  const simRef = useRef<number[][]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStart = () => {
    if (selectedHorse === null || phase !== "idle" || balance < betAmount) return;

    const winner = Math.floor(Math.random() * 4);
    setWinnerId(winner);
    setRankOrder([]);
    setResultText("");
    setProgress([0, 0, 0, 0]);

    simRef.current = simulateRace(winner);
    tickRef.current = 0;
    onBet(betAmount);
    setPhase("racing");
  };

  useEffect(() => {
    if (phase !== "racing") return;
    const totalTicks = Math.ceil(RACE_DURATION_MS / TICK_MS);

    intervalRef.current = setInterval(() => {
      tickRef.current++;
      const t = tickRef.current;
      const newProgress = simRef.current.map((arr) => arr[Math.min(t, arr.length - 1)]);
      setProgress(newProgress);

      if (t >= totalTicks) {
        clearInterval(intervalRef.current!);
        // Determine rank order by final progress descending
        const sorted = [0, 1, 2, 3].sort((a, b) => simRef.current[b][totalTicks] - simRef.current[a][totalTicks]);
        setRankOrder(sorted);
        setPhase("result");
      }
    }, TICK_MS);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (phase !== "result" || winnerId === null || selectedHorse === null) return;

    const win = winnerId === selectedHorse;
    setIsWin(win);
    if (win) {
      const profit = betAmount * 6; // 5:1 순이익 → delta = bet*6 (원금 반환 포함)
      setResultText(`🏆 ${HORSES[winnerId].name} 1등! +${(profit - betAmount).toLocaleString()}원 획득!`);
      onResult(profit);
    } else {
      setResultText(`😢 ${HORSES[winnerId].name} 1등... 아쉽네요!`);
      onResult(0);
    }
  }, [phase, winnerId, selectedHorse, betAmount, onResult]);

  const getRank = (horseId: number) => rankOrder.indexOf(horseId) + 1;

  return (
    <Overlay>
      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="🏇 경마 도움말">
        <HelpSection title="게임 방법">
          <HelpText>{"1~4번 말 중 1등을 예측해 베팅하세요.\nSTART를 누르면 경마가 시작됩니다.\n1등으로 예측한 말이 맞으면 승리합니다!"}</HelpText>
        </HelpSection>
        <HelpSection title="배당표">
          <HelpPayTable>
            <PayLabel>1등 예측 성공</PayLabel><PayValue>3배 (원금 포함 4배)</PayValue>
            <PayLabel>1등 예측 실패</PayLabel><PayValue>베팅금 손실</PayValue>
          </HelpPayTable>
        </HelpSection>
        <HelpSection title="확률">
          <HelpText>{"4마리 말의 기본 확률은 각 25%입니다.\n1등 적중 시 5:1 배당 (베팅금 × 6 수령)입니다."}</HelpText>
        </HelpSection>
      </GameHelpModal>

      <Header>
        <Title>🏇 경마</Title>
        <BalanceTag>💰 {balance.toLocaleString()}원</BalanceTag>
        <HelpBtn onClick={() => setShowHelp(true)}>?</HelpBtn>
        <CloseButton $disabled={phase === "racing"} onClick={phase === "racing" ? undefined : onClose}>
          닫기
        </CloseButton>
      </Header>

      <TrackArea>
        {HORSES.map((horse) => {
          const pct = progress[horse.id];
          const rank = phase === "result" ? getRank(horse.id) : 0;
          return (
            <TrackRow key={horse.id}>
              <HorseName
                $color={horse.color}
                $selected={selectedHorse === horse.id}
                onClick={() => phase === "idle" && setSelectedHorse(horse.id)}
              >
                {horse.name}
              </HorseName>
              <TrackBar>
                <ProgressFill $color={horse.color} $pct={pct} $racing={phase === "racing"}>
                  {pct > 8 && <HorseEmoji>🐎</HorseEmoji>}
                </ProgressFill>
              </TrackBar>
              <FinishFlag>🏁</FinishFlag>
              {phase === "result" && <RankBadge $rank={rank}>{rank}위</RankBadge>}
            </TrackRow>
          );
        })}

        {phase === "racing" && <RacingLabel>🏇 경주 중...</RacingLabel>}
        {phase === "result" && (
          <ResultBanner $win={isWin}>{resultText}</ResultBanner>
        )}
      </TrackArea>

      <Section>
        <SectionLabel>말 선택</SectionLabel>
        <HorseSelectRow>
          {HORSES.map((horse) => (
            <HorseSelectBtn
              key={horse.id}
              $color={horse.color}
              $selected={selectedHorse === horse.id}
              onClick={() => phase === "idle" && setSelectedHorse(horse.id)}
              disabled={phase !== "idle"}
            >
              <span style={{ fontSize: "1.3rem" }}>🐎</span>
              <span>{horse.name}</span>
            </HorseSelectBtn>
          ))}
        </HorseSelectRow>

        <SectionLabel>베팅금 설정</SectionLabel>
        <BetControls
          value={betAmount}
          onChange={setBetAmount}
          minBet={minBet}
          maxBet={maxBet}
          balance={balance}
          disabled={phase !== "idle"}
        />

        {phase !== "racing" && (
          <StartButton
            $disabled={selectedHorse === null || phase !== "idle" || balance < betAmount}
            onClick={handleStart}
          >
            {phase === "result" ? "다시 하기" : "START"}
          </StartButton>
        )}
        {phase === "result" && (
          <StartButton
            $disabled={false}
            onClick={() => {
              setPhase("idle");
              setProgress([0, 0, 0, 0]);
              setRankOrder([]);
              setResultText("");
              setWinnerId(null);
            }}
          >
            다시 하기
          </StartButton>
        )}
      </Section>
    </Overlay>
  );
}
