import styled, { keyframes } from "styled-components";

export const BoardWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const Board = styled.div<{ $w: number; $h: number; $bg?: string }>`
  position: relative;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  background: ${({ $bg }) => $bg ?? "#161616"};
  --board-bg: ${({ $bg }) => $bg ?? "#161616"};
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  flex-shrink: 0;
`;

const pop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(0.92); }
  100% { transform: scale(1); }
`;

export const Tile = styled.button<{
  $empty?: boolean;
  $wall?: boolean;
  $correct?: boolean;
}>`
  position: absolute;
  border-radius: 0;
  border: none;
  background: ${({ $empty, $wall }) =>
    $wall
      ? "var(--board-bg, #161616)"
      : $empty
      ? "#2a2a2a"
      : "#2e2e2e"};
  padding: 0;
  overflow: hidden;
  cursor: ${({ $empty, $wall }) => ($empty || $wall ? "default" : "pointer")};
  pointer-events: ${({ $wall }) => ($wall ? "none" : "auto")};
  transition: top 0.13s ease, left 0.13s ease;

  &:not(:disabled):active {
    animation: ${pop} 0.14s ease;
  }
`;

export const TileNumber = styled.span`
  position: absolute;
  top: 3px;
  left: 3px;
  color: #fff;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 3px;
  padding: 1px 3px;
  pointer-events: none;
  line-height: 1;
`;

// 막힘 영역 위에 표시되는 이전 기록 오버레이
export const WallRecord = styled.div<{ $x: number; $y: number; $w: number; $h: number }>`
  position: absolute;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2em;
  pointer-events: none;
  z-index: 1;
`;

export const WallRecordItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05em;
  line-height: 1.2;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 4px;
  padding: 0.15em 0.4em;

  .label {
    font-size: 0.6em;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 0.75em;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }
`;

export const RecordBar = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

export const RecordItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.45rem 0.9rem;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;

  .label {
    font-size: 0.68rem;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #a5aaff;
    font-variant-numeric: tabular-nums;
  }
`;
