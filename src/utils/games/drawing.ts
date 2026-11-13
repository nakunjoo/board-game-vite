import type { GameConfig } from "../../types/game";

export const DRAWING_CONFIG: GameConfig = {
  gameType: "drawing",
  displayName: "끄적끄적",
  minPlayers: 3,
  maxPlayers: 6,
};

/** 서버(drawing.handler.ts)가 허용하는 값과 같아야 한다 */
export const DRAWING_ROUND_OPTIONS = [1, 2, 3];
export const DRAWING_TIME_OPTIONS = [60, 80, 100];
export const DRAWING_COLORS = [
  "#222222", "#e74c3c", "#f39c12", "#f1c40f", "#27ae60", "#3498db", "#8e44ad", "#ffffff",
];
/** 그림판 폭의 1/1000 단위. 얇게 / 보통 / 굵게 */
export const DRAWING_SIZES = [6, 14, 30];
/** 지우개는 고른 굵기보다 한 단계 굵게 (마지막 60은 지우개 전용) */
export const DRAWING_ERASER_SIZES: Record<number, number> = { 6: 14, 14: 30, 30: 60 };
export const DRAWING_ERASER_COLOR = "#ffffff";
export const DRAWING_CHOOSE_TIME = 10;

/** 자리 순서대로 붙는 사람별 색 (뱃지 테두리·말풍선·채팅 닉네임) */
export const DRAWING_PLAYER_COLORS = ["#378ADD", "#D4537E", "#1D9E75", "#7F77DD", "#D85A30", "#BA7517"];

export const DRAWING_VIEW_MODE_KEY = "drawing:viewMode";
