import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import BetControls from "../BetControls";
import type { CoPlayer } from "../types";
import GameHelpModal, { HelpSection, HelpText, PayTable as HelpPayTable, PayLabel, PayValue } from "./GameHelpModal";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface CasinoGameProps {
  balance: number;
  initialBalance: number;
  coPlayers: CoPlayer[];
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
  overflow: hidden;
  padding-bottom: 0;
  box-sizing: border-box;
`;

const ScrollBody = styled.div`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
`;

const BottomBar = styled.div`
  flex-shrink: 0;
  width: 100%;
  max-width: 500px;
  padding: 10px 20px 16px;
  box-sizing: border-box;
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
  overflow: visible;
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
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  min-width: 26px;
  height: 20px;
  border-radius: 10px;
  background: ${({ $rank }) =>
    $rank === 1 ? "#f0c040" : $rank === 2 ? "#aaa" : $rank === 3 ? "#cd7f32" : "#555"};
  color: ${({ $rank }) => ($rank <= 3 ? "#111" : "#eee")};
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease;
`;

const StatusBox = styled.div<{ $type: "idle" | "racing" | "win" | "lose" }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: ${({ $type }) =>
    $type === "win" ? "rgba(240,192,64,0.15)" :
    $type === "lose" ? "rgba(231,76,60,0.12)" :
    $type === "racing" ? "rgba(255,255,255,0.06)" :
    "rgba(255,255,255,0.04)"};
  border: 1px solid ${({ $type }) =>
    $type === "win" ? "rgba(240,192,64,0.4)" :
    $type === "lose" ? "rgba(231,76,60,0.3)" :
    "rgba(255,255,255,0.1)"};
  color: ${({ $type }) =>
    $type === "win" ? "#f0c040" :
    $type === "lose" ? "#e74c3c" :
    $type === "racing" ? "#aaa" :
    "rgba(255,255,255,0.35)"};
  animation: ${({ $type }) => $type === "racing" ? css`${pulse} 0.8s ease infinite` : "none"};
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

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

function simulateRace(winnerId: number): number[][] {
  const ticks = Math.ceil(RACE_DURATION_MS / TICK_MS);
  const positions: number[][] = HORSES.map(() => new Array(ticks + 1).fill(0));

  // 비우승 말의 최종 도달 거리를 70~97% 사이로 사전 확정
  // → 절대로 100%에 도달하지 않으므로 시각적 우승자 = 실제 우승자
  const loserFinals = [0, 1, 2, 3]
    .filter((h) => h !== winnerId)
    .map(() => 70 + Math.random() * 27);

  let loserIdx = 0;
  const finalPos = HORSES.map((_, h) =>
    h === winnerId ? 100 : loserFinals[loserIdx++]
  );

  for (let h = 0; h < 4; h++) {
    const target = finalPos[h];
    const segments = 8;
    const segLen = ticks / segments;
    const rawVar = Array.from({ length: segments }, () => 0.7 + Math.random() * 0.6);
    const avgVar = rawVar.reduce((a, b) => a + b, 0) / segments;

    let pos = 0;
    for (let t = 0; t < ticks; t++) {
      const seg = Math.min(Math.floor(t / segLen), segments - 1);
      const speed = (target / ticks) * (rawVar[seg] / avgVar);
      pos = Math.min(target, pos + speed);
      positions[h][t + 1] = pos;
    }
    positions[h][ticks] = target;
  }

  return positions;
}

export default function HorseRacingGame({ balance, initialBalance, coPlayers, onBet, onResult, onClose }: CasinoGameProps) {
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
  const resultCalledRef = useRef(false);

  const handleStart = () => {
    if (selectedHorse === null || phase !== "idle" || balance < betAmount) return;

    const winner = Math.floor(Math.random() * 4);
    setWinnerId(winner);
    setRankOrder([]);
    setResultText("");
    setProgress([0, 0, 0, 0]);
    resultCalledRef.current = false;

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
    if (resultCalledRef.current) return;
    resultCalledRef.current = true;

    const win = winnerId === selectedHorse;
    setIsWin(win);
    if (win) {
      const profit = betAmount * 4;
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
          <HelpText>{"4마리 말의 기본 확률은 각 25%입니다.\n1등 적중 시 3:1 배당 (베팅금 × 4 수령)입니다."}</HelpText>
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

      <ScrollBody>
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
                  {phase === "result" && <RankBadge $rank={rank}>{rank}위</RankBadge>}
                  <ProgressFill $color={horse.color} $pct={pct} $racing={phase === "racing"}>
                    {pct > 8 && <HorseEmoji>🐎</HorseEmoji>}
                  </ProgressFill>
                </TrackBar>
                <FinishFlag>🏁</FinishFlag>
              </TrackRow>
            );
          })}

        </TrackArea>

        <Section>
          <StatusBox $type={phase === "racing" ? "racing" : phase === "result" ? (isWin ? "win" : "lose") : "idle"}>
            {phase === "idle" && "말을 선택하고 START를 눌러주세요"}
            {phase === "racing" && "🏇 경주 중..."}
            {phase === "result" && resultText}
          </StatusBox>
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
        </Section>
      </ScrollBody>

      <BottomBar>
        {phase === "idle" && (
          <StartButton
            $disabled={selectedHorse === null || balance < betAmount}
            onClick={handleStart}
          >
            START
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
        {phase === "racing" && (
          <StartButton $disabled={true}>경주 중...</StartButton>
        )}
      </BottomBar>
    </Overlay>
  );
}
