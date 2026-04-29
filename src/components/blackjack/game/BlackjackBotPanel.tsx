interface Props {
  roomName: string;
  isHost: boolean;
  gameStarted: boolean;
  memberCount: number;
  send: (event: string, data?: unknown) => void;
}

export default function BlackjackBotPanel({ roomName, isHost, gameStarted, memberCount, send }: Props) {
  if (!isHost) return null;

  const canAdd = !gameStarted && memberCount < 5;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: 8,
        zIndex: 200,
        background: "rgba(0,0,0,0.75)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: "6px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>DEV</div>
      <button
        onClick={() => send("bjAddBot", { roomName })}
        disabled={!canAdd}
        style={{
          padding: "4px 10px",
          fontSize: 12,
          borderRadius: 5,
          border: "none",
          background: canAdd ? "#2980b9" : "#555",
          color: "#fff",
          cursor: canAdd ? "pointer" : "not-allowed",
          opacity: canAdd ? 1 : 0.5,
        }}
      >
        봇 추가 ({memberCount}/5)
      </button>
    </div>
  );
}
