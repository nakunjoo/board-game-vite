const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function recordSingleGame(
  accessToken: string,
  gameType: "minesweeper" | "slide-puzzle",
  isWinner: boolean,
  durationSec: number,
  extra?: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/profile/history/single`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ gameType, isWinner, durationSec, extra }),
    });
  } catch {
    // fire-and-forget, 실패해도 게임 진행에 영향 없음
  }
}
