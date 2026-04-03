export type Difficulty = "easy" | "medium" | "hard";
export type CellStatus = "hidden" | "revealed" | "exploded";
export type GamePhase = "ready" | "playing" | "won" | "lost";

export interface Cell {
  isMine: boolean;
  status: CellStatus;
  adjacentMines: number;
}

export interface DifficultyConfig {
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

export interface BestRecord {
  time: number;
}
