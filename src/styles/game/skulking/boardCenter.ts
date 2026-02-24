import styled from "styled-components";

export const TURN_TIME = 20;

export const BoardCenterBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  width: max-content;
`;

export const RoundBadge = styled.span`
  background: #e74c3c;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.8rem;
`;

export const PhaseBadge = styled.span<{ $phase: string }>`
  background: ${({ $phase }) => ($phase === "bid" ? "#f39c12" : "#27ae60")};
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.8rem;
`;

export const TimerBox = styled.div<{ $isMyTurn: boolean; $urgent: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: ${({ $isMyTurn, $urgent }) =>
    $isMyTurn
      ? $urgent
        ? "rgba(231,76,60,0.92)"
        : "rgba(243,156,18,0.92)"
      : "rgba(0,0,0,0.55)"};
  box-shadow: ${({ $isMyTurn, $urgent }) =>
    $isMyTurn
      ? $urgent
        ? "0 0 16px rgba(231,76,60,0.7)"
        : "0 0 14px rgba(243,156,18,0.55)"
      : "none"};
  transition:
    background 0.3s,
    box-shadow 0.3s;
  pointer-events: none;
`;

export const TimerCount = styled.div<{ $urgent: boolean; $blink: boolean }>`
  font-size: ${({ $urgent }) => ($urgent ? "2rem" : "1.6rem")};
  font-weight: bold;
  color: ${({ $urgent, $blink }) =>
    $urgent ? ($blink ? "#ffe066" : "#fff") : "#fff"};
  line-height: 1;
  transition: font-size 0.2s;
`;

export const TimerBarWrap = styled.div`
  width: 120px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

export const TimerBarFill = styled.div<{ $pct: number; $urgent: boolean }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background: ${({ $urgent }) =>
    $urgent ? "#ffe066" : "rgba(255,255,255,0.85)"};
  transition:
    width 0.9s linear,
    background 0.3s;
`;

export const TimerLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
`;
