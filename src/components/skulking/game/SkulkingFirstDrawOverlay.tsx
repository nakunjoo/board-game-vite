import type { SkulkingPlayer } from "../types";

interface Props {
  players: SkulkingPlayer[];
  myDrawnNumber: number | null;
  firstDrawResults: Record<string, number>;
  firstDrawFinished: boolean;
  firstDrawWinnerId: string | null;
  firstDrawWinnerNickname: string | null;
  firstDrawCount: number;
  memberCount: number;
  onDrawFirstCard: () => void;
}

export default function SkulkingFirstDrawOverlay({
  players,
  myDrawnNumber,
  firstDrawResults,
  firstDrawFinished,
  firstDrawWinnerId,
  firstDrawWinnerNickname,
  firstDrawCount,
  memberCount,
  onDrawFirstCard,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        zIndex: 50,
        background: "rgba(0,0,0,0.72)",
        borderRadius: "12px",
      }}
    >
      <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold" }}>
        선뽑기
      </div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
        가장 높은 숫자를 뽑은 플레이어가 먼저 비드합니다
      </div>

      {!firstDrawFinished ? (
        <>
          {myDrawnNumber === null ? (
            <div
              onClick={onDrawFirstCard}
              style={{
                width: "70px",
                height: "100px",
                background: "#0d0d12",
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 10px)",
                border: "2px solid rgba(255,255,255,0.85)",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                boxShadow:
                  "inset 0 0 0 1.5px rgba(255,255,255,0.12), 0 6px 20px rgba(0,0,0,0.6)",
                transition:
                  "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-8px) scale(1.04)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(255,255,255,1)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "inset 0 0 0 1.5px rgba(255,255,255,0.2), 0 10px 28px rgba(0,0,0,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "rgba(255,255,255,0.85)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "inset 0 0 0 1.5px rgba(255,255,255,0.12), 0 6px 20px rgba(0,0,0,0.6)";
              }}
            >
              🂠
            </div>
          ) : (
            <div
              style={{
                width: "70px",
                height: "100px",
                background: "#fff",
                border: "3px solid #f39c12",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(243,156,18,0.5)",
              }}
            >
              <span
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "bold",
                  color: "#e67e22",
                }}
              >
                {myDrawnNumber}
              </span>
            </div>
          )}
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>
            {firstDrawCount} / {memberCount} 명 완료
          </div>
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{ color: "#f39c12", fontSize: "1.1rem", fontWeight: "bold" }}
          >
            🎉 {firstDrawWinnerNickname}님이 선!
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {players.map((p) => {
              const num = firstDrawResults[p.playerId];
              const isFirst = p.playerId === firstDrawWinnerId;
              return (
                <div
                  key={p.playerId}
                  style={{
                    background: isFirst
                      ? "rgba(243,156,18,0.2)"
                      : "rgba(255,255,255,0.08)",
                    border: isFirst
                      ? "2px solid #f39c12"
                      : "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: "0.8rem" }}>
                    {p.nickname}
                  </span>
                  <span
                    style={{
                      color: isFirst ? "#f39c12" : "#ccc",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {num ?? "?"}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}
          >
            곧 게임이 시작됩니다...
          </div>
        </div>
      )}
    </div>
  );
}
