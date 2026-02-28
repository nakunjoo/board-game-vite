import React, { useEffect, useRef } from "react";
import {
  TURN_TIME,
  BoardCenterBadge,
  RoundBadge,
  PhaseBadge,
  TimerBox,
  TimerCount,
  TimerBarWrap,
  TimerBarFill,
  TimerLabel,
} from "../../../styles/game/skulking/boardCenter";
import {
  SKULKING_SUIT_LABELS,
  SKULKING_SUIT_COLORS,
  isSpecialCard,
} from "../../../utils/games/skulking";
import type { SkulkingPlayer } from "../types";
import type { TrickEntry } from "../types";

interface Props {
  round: number;
  phase: "bid" | "play" | null;
  roundEndCountdown: number | null;
  bids: Record<string, number>;
  totalPlayers: number;
  currentPlayerId: string | null;
  isMyPlayTurn: boolean;
  players: SkulkingPlayer[];
  currentTrick: TrickEntry[];
  initialTimerTimeLeft?: number | null;
}

export default function SkulkingBoardCenter({
  round,
  phase,
  roundEndCountdown,
  bids,
  totalPlayers,
  currentPlayerId,
  isMyPlayTurn,
  players,
  currentTrick,
  initialTimerTimeLeft,
}: Props) {
  const leadCard = currentTrick.find((e) => !isSpecialCard(e.card.type))?.card ?? null;
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 새로고침 시 서버에서 받은 남은 시간을 한 번만 적용하기 위한 ref
  const pendingInitialTime = useRef<number | null>(initialTimerTimeLeft ?? null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phase === "play" && currentPlayerId) {
      // 새로고침 직후라면 서버에서 받은 남은 시간으로 시작, 아니면 풀타임으로 시작
      const startTime = pendingInitialTime.current ?? TURN_TIME;
      pendingInitialTime.current = null;
      setTimeLeft(startTime);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPlayerId, phase]);

  return (
    <BoardCenterBadge>
      <RoundBadge>라운드 {round} / 10</RoundBadge>

      {phase === "bid" && (
        <PhaseBadge $phase={phase}>비드 단계</PhaseBadge>
      )}

      {phase === "play" && leadCard && (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
          <TimerLabel style={{ color: "rgba(255,255,255,0.6)" }}>리드</TimerLabel>
          <div style={{
            width: "22px",
            height: "30px",
            borderRadius: "3px",
            background: SKULKING_SUIT_COLORS[leadCard.type] ?? "#2c3e50",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
          }}>
            {SKULKING_SUIT_LABELS[leadCard.type] ?? "?"}
          </div>
        </div>
      )}

      {roundEndCountdown !== null && (
        <>
          <TimerLabel style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
            다음 라운드까지
          </TimerLabel>
          <TimerCount $urgent={roundEndCountdown <= 2} $blink={roundEndCountdown % 2 === 0}>
            {roundEndCountdown}
          </TimerCount>
        </>
      )}

      {roundEndCountdown === null && phase === "bid" && (
        <TimerLabel style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
          {Object.keys(bids).length} / {totalPlayers} 명 선택 완료
        </TimerLabel>
      )}

      {phase === "play" && currentPlayerId && (
        <TimerBox $isMyTurn={isMyPlayTurn} $urgent={timeLeft <= 5}>
          <TimerLabel>
            {isMyPlayTurn ? (
              <span style={{ color: "#ffe066", fontWeight: "bold" }}>내 차례</span>
            ) : (
              <>
                <span style={{ color: "#f39c12", fontWeight: "bold" }}>
                  {players.find((p) => p.playerId === currentPlayerId)?.nickname ?? ""}
                </span>
                <span style={{ color: "rgba(255,255,255,0.7)" }}>의 차례</span>
              </>
            )}
          </TimerLabel>
          <TimerCount $urgent={timeLeft <= 5} $blink={timeLeft % 2 === 0}>
            {timeLeft}
          </TimerCount>
          <TimerBarWrap>
            <TimerBarFill $pct={(timeLeft / TURN_TIME) * 100} $urgent={timeLeft <= 5} />
          </TimerBarWrap>
        </TimerBox>
      )}
    </BoardCenterBadge>
  );
}
