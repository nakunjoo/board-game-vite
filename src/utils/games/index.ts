import { GANG_CONFIG } from "./gang";
import type { GameConfig } from "../../types/game";

const GAME_CONFIGS: Record<string, GameConfig> = {
  gang: GANG_CONFIG,
};

export function getGameConfig(gameType: string): GameConfig {
  return GAME_CONFIGS[gameType] ?? GANG_CONFIG;
}
