export type GridSize = 3 | 4 | 5 | 6 | 7;
export type TileShape = "fit" | "square";

export interface BestRecord {
  time: number;
  moves: number;
}

export interface DefaultImage {
  label: string;
  url: string;
}
