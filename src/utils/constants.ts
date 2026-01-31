import type { SeatPosition } from "../types/game";

// 플레이어 수에 따른 좌석 위치 설정
export const SEAT_POSITIONS: Record<number, SeatPosition[]> = {
  1: [{ bottom: "0", left: "50%" }],
  2: [
    { bottom: "0", left: "50%" },
    { top: "0", left: "50%" },
  ],
  3: [
    { bottom: "0", left: "50%" },
    { top: "25%", left: "0" },
    { top: "25%", right: "0" },
  ],
  4: [
    { bottom: "0", left: "50%" },
    { top: "50%", left: "0" },
    { top: "0", left: "50%" },
    { top: "50%", right: "0" },
  ],
  5: [
    { bottom: "0", left: "50%" },
    { bottom: "25%", left: "0" },
    { top: "20%", left: "0" },
    { top: "20%", right: "0" },
    { bottom: "25%", right: "0" },
  ],
  6: [
    { bottom: "0", left: "50%" },
    { bottom: "20%", left: "0" },
    { top: "15%", left: "0" },
    { top: "0", left: "50%" },
    { top: "15%", right: "0" },
    { bottom: "20%", right: "0" },
  ],
};
