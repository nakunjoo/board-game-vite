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
import type { SkulkingPlayer } from "../types";

interface Props {
  round: number;
  phase: "bid" | "play" | null;
  roundEndCountdown: number | null;
  bids: Record<string, number>;
  totalPlayers: number;
  currentPlayerId: string | null;
  isMyPlayTurn: boolean;
  players: SkulkingPlayer[];
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
}: Props) {
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phase === "play" && currentPlayerId) {
      setTimeLeft(TURN_TIME);
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

      {phase && (
        <PhaseBadge $phase={phase}>
          {phase === "bid" ? "비드 단계" : "트릭 플레이"}
        </PhaseBadge>
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
