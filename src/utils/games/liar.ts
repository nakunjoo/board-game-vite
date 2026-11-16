import type { GameConfig } from "../../types/game";

export const LIAR_CONFIG: GameConfig = {
  gameType: "liar",
  displayName: "라이어",
  minPlayers: 3,
  maxPlayers: 8, // 서버 LiarHandler.MAX_PLAYERS와 같게
};

/** 서버(liar.handler.ts)가 허용하는 값과 같아야 한다 */
export const LIAR_ROUND_OPTIONS = [1, 3, 5];
export const LIAR_LAP_OPTIONS = [1, 2];
export const LIAR_DISCUSS_OPTIONS = [60, 90, 120];
export const LIAR_MAX_DESC_LENGTH = 40;
export const LIAR_WIN_POINTS = 3;
export const LIAR_CITIZEN_POINTS = 1;

/**
 * 서버 liar.handler.ts의 normalize와 같게: 띄어쓰기·기호·이모지·자모를 빼고 소문자로.
 * 보내기 전에 자기 단어가 들어갔는지 미리 확인해, 막힐 말을 보내고 입력칸만 비워지는 일이 없게 한다
 */
export function liarNormalize(s: string): string {
  return s.replace(/[\s\p{P}\p{S}ㄱ-ㆎ]/gu, "").toLowerCase();
}

/** 설명판을 접어 뒀는지 기억 ("0"이면 접힘) */
export const LIAR_DESC_OPEN_KEY = "liar:descOpen";

/** 자리 순서대로 붙는 사람별 색 (8명) */
export const LIAR_PLAYER_COLORS = [
  "#378ADD", "#D4537E", "#1D9E75", "#7F77DD", "#D85A30", "#BA7517", "#2FA8B5", "#A35BC9",
];
