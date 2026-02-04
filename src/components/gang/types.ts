import type { Card } from "../../types/game";

export interface Player {
  playerId: string;
  nickname: string;
  isMe: boolean;
  order?: number;
}

export interface ChipData {
  number: number;
  state: number;
  owner: string | null; // playerId of owner
}

export interface PreviousChipsData {
  [playerId: string]: number[];
}

export interface PlayerResult {
  playerId: string;
  nickname: string;
  hand: Card[];
  chips: number[];
}
