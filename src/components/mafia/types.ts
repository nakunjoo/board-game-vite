import type { MafiaRole } from "../../utils/games/mafia";

/** waiting: 시작 전 · over: 결과 (나머지는 서버 phase와 같다) */
export type MafiaPhase = "waiting" | "role" | "night" | "day" | "over";

export interface MafiaGameOver {
  winner: "mafia" | "citizens" | "none";
  roles: Record<string, MafiaRole>;
  nicknames: Record<string, string>;
  alive: string[];
  day: number;
}

export interface PoliceLogEntry {
  targetId: string;
  isMafia: boolean;
  day: number;
}

/** roomJoined.mafia — 새로고침·재연결 때 복원 (내가 알아도 되는 것만) */
export interface MafiaRestoreState {
  discussTimeSec: number;
  day: number;
  phase: "role" | "night" | "day";
  role: MafiaRole | null;
  mafiaTeam: string[];
  alive: string[];
  players: string[];
  kills: Record<string, string>;
  policeLog: PoliceLogEntry[];
  investigatedTonight: string | null;
  healedTonight: string | null;
  voted: string[];
  myVote: string | null;
  lastNight: { killedId: string | null; day: number } | null;
  lastExecution: { executedId: string | null; day: number; tally: Record<string, number> } | null;
  timeLeftMs: number;
  away: string[];
  /** 이번 게임 참가자 닉네임 (나간 사람 자리 표시용, 예전 서버는 없음) */
  nicknames?: Record<string, string>;
}

export interface MafiaSeat {
  playerId: string;
  nickname: string;
  color: string;
  isMe: boolean;
  alive: boolean;
  away: boolean;
  /** 게임 중에 방을 나감 (자리는 그대로 두고 표시만) */
  left: boolean;
  /** 마피아에게만: 동료 표시 */
  teammate: boolean;
  voted: boolean;
}

export interface MafiaLogEntry {
  key: number;
  tone: "chat" | "mafia" | "dead" | "system" | "good" | "bad";
  nickname?: string;
  color?: string;
  text: string;
}
