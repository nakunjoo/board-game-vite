import type { Cell, GamePhase } from "./types";
import { NUMBER_COLORS } from "./constants";
import { BoardWrapper, BoardGrid, CellEl } from "../../../styles/single/minesweeper/board";

interface Props {
  board: Cell[][];
  rows: number;
  cols: number;
  cellSize: number;
  phase: GamePhase;
  flagMode: boolean;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
}

export default function MinesweeperBoard({ board, cols, cellSize, phase, flagMode, onReveal, onToggleFlag }: Props) {
  return (
    <BoardWrapper>
      <BoardGrid $cols={cols} $cellSize={cellSize}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            let content: React.ReactNode = null;
            let numColor = "";

            if (cell.status === "flagged") {
              content = "🚩";
            } else if (cell.status === "revealed") {
              if (cell.isMine) {
                content = "💣";
              } else if (cell.adjacentMines > 0) {
                content = cell.adjacentMines.toString();
                numColor = NUMBER_COLORS[cell.adjacentMines] ?? "#212121";
              }
            } else if (cell.status === "exploded") {
              content = "💥";
            }

            return (
              <CellEl
                key={`${r}-${c}`}
                $status={cell.status}
                $cellSize={cellSize}
                $numColor={numColor}
                onClick={() => {
                  if (phase === "won" || phase === "lost") return;
                  if (flagMode) {
                    // 깃발 모드: hidden ↔ flagged 토글 (revealed는 무시)
                    if (cell.status === "hidden" || cell.status === "flagged") {
                      onToggleFlag(r, c);
                    }
                  } else {
                    // 일반 모드: hidden만 열기 (flagged는 잠금)
                    if (cell.status === "hidden") onReveal(r, c);
                  }
                }}
              >
                {content}
              </CellEl>
            );
          })
        )}
      </BoardGrid>
    </BoardWrapper>
  );
}
