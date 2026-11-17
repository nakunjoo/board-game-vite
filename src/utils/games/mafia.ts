import type { GameConfig } from "../../types/game";

export const MAFIA_CONFIG: GameConfig = {
  gameType: "mafia",
  displayName: "마피아",
  minPlayers: 4,
  maxPlayers: 8, // 서버 MafiaHandler.MAX_PLAYERS와 같게
};

/** 서버(mafia.handler.ts)가 허용하는 토론 시간 (초) */
export const MAFIA_DISCUSS_OPTIONS = [90, 120, 180];

export type MafiaRole = "mafia" | "police" | "doctor" | "citizen";

export const MAFIA_ROLE_LABEL: Record<MafiaRole, string> = {
  mafia: "마피아",
  police: "경찰",
  doctor: "의사",
  citizen: "시민",
};

export const MAFIA_ROLE_EMOJI: Record<MafiaRole, string> = {
  mafia: "🔪",
  police: "🚓",
  doctor: "💉",
  citizen: "🙂",
};

/** 역할 카드 아래 한 줄 설명 */
export const MAFIA_ROLE_HINT: Record<MafiaRole, string> = {
  mafia: "밤마다 동료와 한 명을 골라 없애요. 들키지 마세요",
  police: "밤마다 한 명이 마피아인지 조사해요",
  doctor: "밤마다 한 명을 살려요 (나 자신도 가능)",
  citizen: "토론과 투표로 마피아를 찾아요",
};

/** 사람별 색 (라이어와 같은 8색) */
export { LIAR_PLAYER_COLORS as MAFIA_PLAYER_COLORS } from "./liar";
