import styled from "styled-components";
import type { CellStatus } from "../../../components/single/minesweeper/types";

export const BoardWrapper = styled.div`
  display: inline-block;
  border: 4px ridge #888;
  background: #c0c0c0;
  flex-shrink: 0;
`;

export const BoardGrid = styled.div<{ $cols: number; $cellSize: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, ${(p) => p.$cellSize}px);
`;

const BORDER_SIZE = (cellSize: number) => Math.max(2, Math.floor(cellSize * 0.1));

export const CellEl = styled.div<{
  $status: CellStatus;
  $cellSize: number;
  $numColor: string;
}>`
  width: ${(p) => p.$cellSize}px;
  height: ${(p) => p.$cellSize}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${(p) => Math.floor(p.$cellSize * 0.58)}px;
  font-weight: bold;
  color: ${(p) => p.$numColor || "inherit"};
  box-sizing: border-box;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;

  ${(p) =>
    p.$status === "hidden"
      ? `
    background: #bdbdbd;
    border-top: ${BORDER_SIZE(p.$cellSize)}px solid #f5f5f5;
    border-left: ${BORDER_SIZE(p.$cellSize)}px solid #f5f5f5;
    border-bottom: ${BORDER_SIZE(p.$cellSize)}px solid #7d7d7d;
    border-right: ${BORDER_SIZE(p.$cellSize)}px solid #7d7d7d;
    &:hover { filter: brightness(1.06); }
  `
      : p.$status === "exploded"
        ? `
    background: #ff4444;
    border: 1px solid #9e9e9e;
  `
        : `
    background: #c0c0c0;
    border: 1px solid #9e9e9e;
  `}
`;
