import type { Card } from "../../types/game";

export interface Player {
  nickname: string;
  isMe: boolean;
  order?: number;
}

export interface ChipData {
  number: number;
  state: number;
  owner: string | null;
}

export interface PreviousChipsData {
  [nickname: string]: number[];
}

export interface PlayerResult {
  nickname: string;
  hand: Card[];
  chips: number[];
}
