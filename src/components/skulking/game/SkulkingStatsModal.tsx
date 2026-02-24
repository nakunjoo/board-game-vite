import {
  StatsOverlay,
  StatsModal,
  StatsTitle,
  StatsTable,
} from "../../../styles/game/skulking/statsModal";
import type { SkulkingPlayer } from "../types";

const COLORS = ["#646cff", "#e85d75", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4"];

interface Props {
  players: SkulkingPlayer[];
  playerSeats: { player: SkulkingPlayer; seatIndex: number }[];
  round: number;
  bids: Record<string, number>;
  tricks: Record<string, number>;
  scores: Record<string, number>;
  onClose: () => void;
}

export default function SkulkingStatsModal({
  players,
  playerSeats,
  round,
  bids,
  tricks,
  scores,
  onClose,
}: Props) {
  const sortedPlayers = [...players].sort((a, b) => a.order - b.order);
  const seatIndexMap = new Map(
    playerSeats.map(({ player, seatIndex }) => [player.playerId, seatIndex]),
  );

  return (
    <StatsOverlay onClick={onClose}>
      <StatsModal onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <StatsTitle style={{ margin: 0 }}>라운드 통계</StatsTitle>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#7f8c8d",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ✕
          </button>
        </div>

        <StatsTable>
          <thead>
            <tr>
              <th>R</th>
              {sortedPlayers.map((p) => {
                const si = seatIndexMap.get(p.playerId) ?? 0;
                return (
                  <th key={p.playerId} style={{ color: COLORS[si % COLORS.length] }}>
                    {p.nickname[0]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => {
              const r = i + 1;
              const isCurrent = r === round;
              const isFuture = r > round;
              return (
                <tr
                  key={r}
                  style={{
                    background: isCurrent ? "rgba(231,76,60,0.1)" : undefined,
                    opacity: isFuture ? 0.3 : 1,
                  }}
                >
                  <td style={{ color: isCurrent ? "#e74c3c" : "#7f8c8d", fontWeight: 600 }}>
                    {r}
                  </td>
                  {sortedPlayers.map((p) => {
                    if (isFuture) {
                      return <td key={p.playerId} style={{ color: "#2c3e50" }}>-</td>;
                    }
                    if (isCurrent) {
                      const bid = bids[p.playerId];
                      const trick = tricks[p.playerId] ?? 0;
                      const score = scores[p.playerId] ?? p.score ?? 0;
                      return (
                        <td key={p.playerId}>
                          <div>({bid !== undefined ? bid : "?"}) / {trick}</div>
                          <div style={{ borderTop: "1px solid #2c3e50", marginTop: "2px", paddingTop: "2px" }}>
                            {score}
                          </div>
                        </td>
                      );
                    } else {
                      const rs = p.roundScores?.[i];
                      return (
                        <td key={p.playerId} style={{ color: "#7f8c8d" }}>
                          {rs !== undefined ? rs : "-"}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid #2c3e50" }}>
              <td style={{ color: "#ecf0f1", fontWeight: 700 }}>합계</td>
              {sortedPlayers.map((p) => {
                const total = scores[p.playerId] ?? p.score ?? 0;
                return (
                  <td key={p.playerId} style={{ fontWeight: 700, color: "#f1c40f" }}>
                    {total}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </StatsTable>
      </StatsModal>
    </StatsOverlay>
  );
}
