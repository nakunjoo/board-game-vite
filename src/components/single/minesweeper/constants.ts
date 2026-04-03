import type { DifficultyConfig } from "./types";

export const DIFFICULTIES: Record<string, DifficultyConfig> = {
  easy:   { label: "초급", rows: 9,  cols: 9,  mines: 10 },
  medium: { label: "중급", rows: 16, cols: 16, mines: 40 },
  hard:   { label: "고급", rows: 22, cols: 16, mines: 99 },
};

export const NUMBER_COLORS: Record<number, string> = {
  1: "#1565c0",
  2: "#2e7d32",
  3: "#c62828",
  4: "#1a237e",
  5: "#6a1b1b",
  6: "#006064",
  7: "#212121",
  8: "#546e7a",
};
