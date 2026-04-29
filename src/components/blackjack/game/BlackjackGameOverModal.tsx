import {
  BjModalOverlay,
  BjModalBox,
  BjModalTitle,
  BjResultSection,
  BjConfirmBtn,
} from "../../../styles/game/blackjack/modal";

interface RankEntry {
  playerId: string;
  nickname: string;
  chips: number;
  rank: number;
}

interface Props {
  ranking: RankEntry[];
  finalChips: Record<string, number>;
  myPlayerId: string;
  onClose: () => void;
}

const RANK_EMOJI = ["🥇", "🥈", "🥉", "4️⃣"];

export default function BlackjackGameOverModal({ ranking, myPlayerId, onClose }: Props) {
  return (
    <BjModalOverlay>
      <BjModalBox>
        <BjModalTitle>🃏 게임 종료</BjModalTitle>

        <BjResultSection>
          {ranking.map((r, i) => {
            const isMe = r.playerId === myPlayerId;
            return (
              <div
                key={r.playerId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 0",
                  borderBottom: i < ranking.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                  background: isMe ? "rgba(52,152,219,0.1)" : "transparent",
                  borderRadius: 4,
                  paddingLeft: isMe ? 6 : 0,
                }}
              >
                <span style={{ fontSize: 20 }}>{RANK_EMOJI[i] ?? `${r.rank}.`}</span>
                <span style={{ flex: 1, fontSize: 14, color: isMe ? "#fff" : "rgba(255,255,255,0.8)" }}>
                  {isMe ? `나 (${r.nickname})` : r.nickname}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#f1c40f" }}>
                  {r.chips} 칩
                </span>
              </div>
            );
          })}
        </BjResultSection>

        <BjConfirmBtn onClick={onClose}>로비로</BjConfirmBtn>
      </BjModalBox>
    </BjModalOverlay>
  );
}
