import { GANG_CONFIG } from "./gang";
import { SPICE_CONFIG } from "./spice";
import { SKULKING_CONFIG } from "./skulking";
import { CASINO_CONFIG } from "./casino";
import { DRAWING_CONFIG } from "./drawing";
import type { GameConfig } from "../../types/game";

const GAME_CONFIGS: Record<string, GameConfig> = {
  gang: GANG_CONFIG,
  spice: SPICE_CONFIG,
  skulking: SKULKING_CONFIG,
  casino: CASINO_CONFIG,
  drawing: DRAWING_CONFIG,
};

export function getGameConfig(gameType: string): GameConfig {
  return GAME_CONFIGS[gameType] ?? GANG_CONFIG;
}
