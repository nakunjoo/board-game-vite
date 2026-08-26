export interface ChipData {
  number: number;
  state: number;
  owner: string | null; // playerId of owner
}

export interface PreviousChipsData {
  [playerId: string]: number[];
}
