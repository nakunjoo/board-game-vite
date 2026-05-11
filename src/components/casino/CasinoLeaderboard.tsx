import type { CasinoPlayer } from "./types";
import {
  LeaderboardWrapper,
  LeaderboardTitle,
  LeaderboardRow,
  RankBadge,
  PlayerNick,
  BalanceCell,
  ProfitCell,
  CurrentGameIcon,
} from "../../styles/game/casino";

const GAME_ICONS: Record<string, string> = {
  roulette: "🎡",
  slots: "🎰",
  baccarat: "🃏",
  blackjack: "♠",
  videopoker: "🎲",
  horseracing: "🏇",
  mines: "💣",
};

interface CasinoLeaderboardProps {
  players: CasinoPlayer[];
  myPlayerId: string;
  initialBalance: number;
}

export default function CasinoLeaderboard({
  players,
  myPlayerId,
  initialBalance,
}: CasinoLeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.balance - a.balance);

  return (
    <LeaderboardWrapper>
      <LeaderboardTitle>순위</LeaderboardTitle>
      {sorted.map((p, i) => {
        const profit = p.balance - initialBalance;
        return (
          <LeaderboardRow key={p.playerId} $isMe={p.playerId === myPlayerId}>
            <RankBadge>{i + 1}</RankBadge>
            <CurrentGameIcon>
              {p.currentGame ? (GAME_ICONS[p.currentGame] ?? "🎮") : "💤"}
            </CurrentGameIcon>
            <PlayerNick title={p.nickname}>{p.nickname}</PlayerNick>
            <BalanceCell>{p.balance.toLocaleString()}</BalanceCell>
            <ProfitCell $positive={profit > 0} $negative={profit < 0}>
              {profit > 0 ? `+${profit.toLocaleString()}` : profit === 0 ? "±0" : profit.toLocaleString()}
            </ProfitCell>
          </LeaderboardRow>
        );
      })}
    </LeaderboardWrapper>
  );
}
