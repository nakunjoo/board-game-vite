import type { Cell, BestRecord } from "./types";

export function createEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      status: "hidden" as const,
      adjacentMines: 0,
    }))
  );
}

export function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mines: number,
  firstRow: number,
  firstCol: number
): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  // 첫 클릭 위치와 인접 셀은 지뢰 배치 금지
  const safeSet = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = firstRow + dr;
      const c = firstCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) safeSet.add(`${r},${c}`);
    }
  }

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !safeSet.has(`${r},${c}`)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  // 인접 지뢰 수 계산
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newBoard[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) count++;
          }
        }
        newBoard[r][c].adjacentMines = count;
      }
    }
  }

  return newBoard;
}

export function revealCells(
  board: Cell[][],
  rows: number,
  cols: number,
  startRow: number,
  startCol: number
): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[startRow, startCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = newBoard[r][c];
    if (cell.status === "revealed" || cell.isMine) continue;

    cell.status = "revealed";

    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].status === "hidden") {
            queue.push([nr, nc]);
          }
        }
      }
    }
  }

  return newBoard;
}

export function checkWin(board: Cell[][], rows: number, cols: number): boolean {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.isMine && cell.status !== "revealed") return false;
    }
  }
  return true;
}

export function revealAllMines(
  board: Cell[][],
  rows: number,
  cols: number,
  explodedRow: number,
  explodedCol: number
): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = newBoard[r][c];
      if (r === explodedRow && c === explodedCol) {
        cell.status = "exploded";
      } else if (cell.isMine) {
        cell.status = "revealed";
      }
    }
  }
  return newBoard;
}

export function calcCellSize(
  containerW: number,
  containerH: number,
  rows: number,
  cols: number
): number {
  const byW = Math.floor(containerW / cols);
  const byH = Math.floor(containerH / rows);
  return Math.max(Math.min(byW, byH), 20);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const LS_KEY = (d: string) => `minesweeper-best-${d}`;

export function loadBest(difficulty: string): BestRecord | null {
  try {
    const raw = localStorage.getItem(LS_KEY(difficulty));
    return raw ? (JSON.parse(raw) as BestRecord) : null;
  } catch {
    return null;
  }
}

export function saveBest(difficulty: string, record: BestRecord): void {
  localStorage.setItem(LS_KEY(difficulty), JSON.stringify(record));
}
