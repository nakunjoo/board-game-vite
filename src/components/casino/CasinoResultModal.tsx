import { useEffect, useRef } from "react";
import type { CasinoGameOverData } from "./types";
import {
  ResultModalOverlay,
  ResultModalBox,
  ResultTitle,
  ResultTable,
  ResultProfitCell,
  ChartWrapper,
  CloseButton,
} from "../../styles/game/casino";

// 플레이어별 고정 색상 팔레트
const PLAYER_COLORS = [
  "#f0c040",
  "#2ecc71",
  "#3498db",
  "#e74c3c",
  "#9b59b6",
  "#1abc9c",
];

interface CasinoResultModalProps {
  result: CasinoGameOverData;
  myPlayerId: string;
  onClose: () => void;
}

export default function CasinoResultModal({
  result,
  myPlayerId,
  onClose,
}: CasinoResultModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 24, right: 24, bottom: 16, left: 56 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // 플레이어별 history 수집
    const allPoints = result.players.flatMap((p) => p.history);
    if (allPoints.length === 0) return;

    const allT = allPoints.map((p) => p.t);
    const allB = allPoints.map((p) => p.b);
    const minT = Math.min(...allT);
    const maxT = Math.max(...allT);
    const minB = Math.min(...allB);
    const maxB = Math.max(...allB);
    const rangeT = maxT - minT || 1;
    const rangeB = maxB - minB || 1;

    const toX = (t: number) => PAD.left + ((t - minT) / rangeT) * chartW;
    const toY = (b: number) => PAD.top + chartH - ((b - minB) / rangeB) * chartH;

    // 그리드 라인
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();
    }

    // Y축 레이블
    ctx.fillStyle = "#aaa";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = Math.round(minB + (rangeB / 4) * (4 - i));
      const y = PAD.top + (chartH / 4) * i;
      ctx.fillText(val.toLocaleString(), PAD.left - 6, y + 5);
    }

    // 각 플레이어 라인 그리기
    result.players.forEach((player, idx) => {
      if (player.history.length < 2) return;
      const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
      const isMe = player.playerId === myPlayerId;

      ctx.strokeStyle = color;
      ctx.lineWidth = isMe ? 3 : 1.5;
      ctx.globalAlpha = isMe ? 1 : 0.6;
      ctx.beginPath();
      player.history.forEach((pt, i) => {
        const x = toX(pt.t);
        const y = toY(pt.b);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

  }, [result, myPlayerId]);

  const sorted = [...result.players].sort((a, b) => a.rank - b.rank);

  return (
    <ResultModalOverlay onClick={onClose}>
      <ResultModalBox onClick={(e) => e.stopPropagation()}>
        <ResultTitle>🎰 게임 종료</ResultTitle>

        <ResultTable>
          <thead>
            <tr>
              <th>순위</th>
              <th>닉네임</th>
              <th>최종 잔액</th>
              <th>손익</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const isMe = p.playerId === myPlayerId;
              return (
                <tr key={p.playerId} style={{ fontWeight: isMe ? 700 : 400 }}>
                  <td>{p.rank}</td>
                  <td>{p.nickname}{isMe ? " (나)" : ""}</td>
                  <td>{p.finalBalance.toLocaleString()}</td>
                  <ResultProfitCell $positive={p.profit > 0} $negative={p.profit < 0}>
                    {p.profit > 0 ? `+${p.profit.toLocaleString()}` : p.profit === 0 ? "±0" : p.profit.toLocaleString()}
                  </ResultProfitCell>
                </tr>
              );
            })}
          </tbody>
        </ResultTable>

        <ChartWrapper>
          <canvas
            ref={canvasRef}
            width={540}
            height={320}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </ChartWrapper>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", padding: "4px 4px" }}>
          {result.players.map((player, idx) => (
            <div key={player.playerId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 4, borderRadius: 2, background: PLAYER_COLORS[idx % PLAYER_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: "0.9rem", color: player.playerId === myPlayerId ? "#f0c040" : "#ccc", fontWeight: player.playerId === myPlayerId ? 700 : 400 }}>
                {player.nickname}
              </span>
            </div>
          ))}
        </div>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ResultModalBox>
    </ResultModalOverlay>
  );
}
