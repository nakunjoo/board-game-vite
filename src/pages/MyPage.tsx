import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  MyPageWrapper,
  MyPageHeader,
  BackButton,
  MyPageTitle,
  Section,
  SectionTitle,
  AvatarInfo,
  NicknameForm,
  NicknameInput,
  InfoText,
  SaveButton,
  PlaceholderBox,
  HistoryList,
  HistoryItem,
  HistoryBadge,
  HistoryInfo,
  HistoryResult,
  DetailOverlay,
  DetailBox,
  DetailHeader,
  DetailTitle,
  DetailClose,
  DetailMeta,
  DetailRow,
  DetailSectionTitle,
  WinLossDots,
  WinLossDot,
  GamePlayedTable,
  GamePlayedRow,
  PlayersTableWrap,
  PlayerRow,
  MeTag,
  SkulkingRoundTable,
} from "../styles/pages/MyPage";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const COOLDOWN_DAYS = 1;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const GAME_TYPE_LABELS: Record<string, string> = {
  gang: "갱스터",
  spice: "향신료",
  skulking: "스컬킹",
  casino: "카지노",
  minesweeper: "지뢰찾기",
  "slide-puzzle": "슬라이드 퍼즐",
};

const CASINO_GAME_LABELS: Record<string, string> = {
  roulette: "룰렛", slots: "슬롯머신", baccarat: "바카라",
  blackjack: "블랙잭", videopoker: "비디오 포커", horseracing: "경마", mines: "지뢰찾기",
};

function getCooldownInfo(nicknameUpdatedAt: string | null) {
  if (!nicknameUpdatedAt) return { canChange: true, nextChangeDate: null, daysLeft: 0 };
  const lastChanged = new Date(nicknameUpdatedAt).getTime();
  const elapsed = Date.now() - lastChanged;
  if (elapsed >= COOLDOWN_MS) return { canChange: true, nextChangeDate: null, daysLeft: 0 };
  const nextDate = new Date(lastChanged + COOLDOWN_MS);
  const nextChangeDate = `${nextDate.getFullYear()}.${String(nextDate.getMonth() + 1).padStart(2, "0")}.${String(nextDate.getDate()).padStart(2, "0")}`;
  const daysLeft = Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
  return { canChange: false, nextChangeDate, daysLeft };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

interface HistoryPlayer {
  nickname: string;
  isWinner: boolean | null;
  score: number | null;
  rank: number | null;
  isMe: boolean;
}

interface HistoryEntry {
  sessionId: string;
  gameType: string;
  playedAt: string;
  playerCount: number;
  totalRounds: number | null;
  durationSec: number | null;
  status: "completed" | "abandoned_voluntary" | "abandoned_disconnected";
  isWinner: boolean | null;
  score: number | null;
  rank: number | null;
  extra: Record<string, unknown> | null;
  players: HistoryPlayer[];
}

const CHART_COLORS = ["#f0c040", "#2ecc71", "#3498db", "#e74c3c", "#9b59b6", "#1abc9c"];

interface ChartPlayer {
  playerId: string;
  nickname: string;
  history: { t: number; b: number }[];
  rank: number;
}

function BalanceChart({ players, myPlayerId }: { players: ChartPlayer[]; myPlayerId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validPlayers = players.filter(p => p.history.length >= 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || validPlayers.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 24, right: 24, bottom: 16, left: 56 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    const allPoints = validPlayers.flatMap(p => p.history);
    const allT = allPoints.map(p => p.t);
    const allB = allPoints.map(p => p.b);
    const minT = Math.min(...allT);
    const maxT = Math.max(...allT);
    const minB = Math.min(...allB);
    const maxB = Math.max(...allB);
    const rangeT = maxT - minT || 1;
    const rangeB = maxB - minB || 1;

    const toX = (t: number) => PAD.left + ((t - minT) / rangeT) * chartW;
    const toY = (b: number) => PAD.top + chartH - ((b - minB) / rangeB) * chartH;

    // 그리드
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

    // 순위 기준 정렬 (내 라인이 위에 그려지도록 마지막)
    const sorted = [...validPlayers].sort((a, b) => {
      if (a.playerId === myPlayerId) return 1;
      if (b.playerId === myPlayerId) return -1;
      return a.rank - b.rank;
    });

    sorted.forEach((player) => {
      const idx = players.indexOf(player);
      const color = CHART_COLORS[idx % CHART_COLORS.length];
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
  }, [validPlayers, myPlayerId, players]);

  if (validPlayers.length === 0) return null;
  return (
    <>
      <canvas
        ref={canvasRef}
        width={540}
        height={280}
        style={{ width: "100%", height: "auto", display: "block", background: "rgba(0,0,0,0.3)", borderRadius: 8 }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", padding: "8px 4px" }}>
        {players.map((player, idx) => (
          <div key={player.playerId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 4, borderRadius: 2, background: CHART_COLORS[idx % CHART_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: "0.9rem", color: player.playerId === myPlayerId ? "#f0c040" : "#ccc", fontWeight: player.playerId === myPlayerId ? 700 : 400 }}>
              {player.nickname}{player.playerId === myPlayerId ? " (나)" : ""}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── 참가자 표 ────────────────────────────────────────────────────────
function PlayersTable({ entry }: { entry: HistoryEntry }) {
  if (!entry.players || entry.players.length === 0) return null;

  const showRank = entry.players.some((p) => p.rank !== null);
  const showScore = entry.players.some((p) => p.score !== null);
  const showWin = !showScore && entry.players.some((p) => p.isWinner !== null);

  return (
    <>
      <DetailSectionTitle>참가자</DetailSectionTitle>
      <PlayersTableWrap>
        <thead>
          <tr>
            {showRank && <th>순위</th>}
            <th style={{ textAlign: "left" }}>닉네임</th>
            {showScore && <th>점수</th>}
            {showWin && <th>결과</th>}
          </tr>
        </thead>
        <tbody>
          {entry.players.map((p, i) => (
            <PlayerRow key={i} $isMe={p.isMe}>
              {showRank && <td>{p.rank ? `${p.rank}위` : "-"}</td>}
              <td style={{ textAlign: "left" }}>
                {p.nickname}{p.isMe && <MeTag>나</MeTag>}
              </td>
              {showScore && (
                <td>{p.score !== null ? `${p.score}점` : "-"}</td>
              )}
              {showWin && (
                <td style={{ color: p.isWinner === true ? "#22c55e" : p.isWinner === false ? "#ef4444" : "#666" }}>
                  {p.isWinner === true ? "승리" : p.isWinner === false ? "패배" : "-"}
                </td>
              )}
            </PlayerRow>
          ))}
        </tbody>
      </PlayersTableWrap>
    </>
  );
}

// ── 게임별 상세 내용 ─────────────────────────────────────────────────
function DetailContent({ entry }: { entry: HistoryEntry }) {
  const ex = entry.extra as Record<string, unknown> | null;

  if (entry.gameType === "casino") {
    const init = (ex?.initialBalance as number) ?? 0;
    const profit = (ex?.profit as number) ?? 0;
    const final = init + profit;
    const gamesPlayed = (ex?.gamesPlayed as Record<string, number>) ?? {};
    const myPlayerId = (ex?.myPlayerId as string) ?? "";
    const rawPlayersHistory = (ex?.playersHistory as ChartPlayer[]) ?? [];
    const history = (ex?.history as { t: number; b: number }[]) ?? [];

    // 히스토리 마지막 포인트가 실제 최종 잔액과 다르면 끝점 추가 (구버전 기록 보정)
    const patchHistory = (hist: { t: number; b: number }[], finalScore: number | null) => {
      if (finalScore === null || hist.length === 0) return hist;
      const last = hist[hist.length - 1];
      if (last.b === finalScore) return hist;
      return [...hist, { t: last.t + 1, b: finalScore }];
    };

    // 구버전 기록 폴백: playersHistory 없으면 본인 history로 단일 라인
    const playersHistory: ChartPlayer[] = rawPlayersHistory.length > 0
      ? rawPlayersHistory
      : history.length >= 2
        ? [{ playerId: myPlayerId || "me", nickname: "나", history: patchHistory(history, final), rank: entry.rank ?? 1 }]
        : [];
    const totalGames = Object.values(gamesPlayed).reduce((a, b) => a + b, 0);
    return (
      <>
        <DetailSectionTitle>결과</DetailSectionTitle>
        <DetailRow><span>초기 자금</span><span>{init.toLocaleString()}</span></DetailRow>
        <DetailRow><span>최종 잔액</span><span>{final.toLocaleString()}</span></DetailRow>
        <DetailRow>
          <span>손익</span>
          <span style={{ color: profit >= 0 ? "#22c55e" : "#ef4444" }}>
            {profit >= 0 ? "+" : ""}{profit.toLocaleString()}
          </span>
        </DetailRow>
        {entry.rank && <DetailRow><span>순위</span><span>{entry.rank}위</span></DetailRow>}
        {totalGames > 0 && (
          <>
            <DetailSectionTitle>게임별 플레이 수</DetailSectionTitle>
            <GamePlayedTable>
              {Object.entries(gamesPlayed).map(([g, cnt]) => (
                <GamePlayedRow key={g}>
                  <span>{CASINO_GAME_LABELS[g] ?? g}</span>
                  <span>{cnt}회</span>
                </GamePlayedRow>
              ))}
            </GamePlayedTable>
          </>
        )}
        {playersHistory.length > 0 && (
          <>
            <DetailSectionTitle>잔액 변동</DetailSectionTitle>
            <BalanceChart players={playersHistory} myPlayerId={myPlayerId} />
          </>
        )}
        <PlayersTable entry={entry} />
      </>
    );
  }

  if (entry.gameType === "gang") {
    const winLoss = (ex?.winLossRecord as boolean[]) ?? [];
    const gameOverResult = ex?.gameOverResult as string | null;
    return (
      <>
        <DetailSectionTitle>게임 결과</DetailSectionTitle>
        <DetailRow>
          <span>최종 결과</span>
          <span style={{ color: gameOverResult === "victory" ? "#22c55e" : "#ef4444" }}>
            {gameOverResult === "victory" ? "🏆 승리" : gameOverResult === "defeat" ? "💀 패배" : "-"}
          </span>
        </DetailRow>
        {winLoss.length > 0 && (
          <>
            <DetailSectionTitle>라운드 기록</DetailSectionTitle>
            <WinLossDots>
              {winLoss.map((w, i) => (
                <WinLossDot key={i} $win={w}>{w ? "✓" : "✗"}</WinLossDot>
              ))}
            </WinLossDots>
          </>
        )}
        <PlayersTable entry={entry} />
      </>
    );
  }

  if (entry.gameType === "spice") {
    return (
      <>
        <DetailSectionTitle>결과</DetailSectionTitle>
        {entry.score !== null && <DetailRow><span>최종 점수</span><span>{entry.score}점</span></DetailRow>}
        {entry.rank && <DetailRow><span>순위</span><span>{entry.rank}위</span></DetailRow>}
        {ex?.trophyCount !== undefined && <DetailRow><span>트로피</span><span>{String(ex.trophyCount)}개 🏆</span></DetailRow>}
        {ex?.wonCardCount !== undefined && <DetailRow><span>따낸 카드</span><span>{String(ex.wonCardCount)}장</span></DetailRow>}
        {ex?.remainingHand !== undefined && <DetailRow><span>남은 패</span><span>{String(ex.remainingHand)}장</span></DetailRow>}
        <PlayersTable entry={entry} />
      </>
    );
  }

  if (entry.gameType === "skulking") {
    type RoundRow = { round: number; bid: number; tricks: number; score: number };
    const roundHistory = (ex?.roundHistory as RoundRow[]) ?? [];
    const totalScore = roundHistory.reduce((s, r) => s + r.score, 0);
    return (
      <>
        <DetailSectionTitle>라운드별 기록</DetailSectionTitle>
        <SkulkingRoundTable>
          <thead>
            <tr>
              <th>라운드</th>
              <th>비드</th>
              <th>트릭</th>
              <th>점수</th>
            </tr>
          </thead>
          <tbody>
            {roundHistory.map((r) => (
              <tr key={r.round}>
                <td>{r.round}R</td>
                <td>{r.bid}</td>
                <td style={{ color: r.tricks === r.bid ? "#22c55e" : "#ef4444" }}>{r.tricks}</td>
                <td style={{ color: r.score >= 0 ? "#22c55e" : "#ef4444" }}>
                  {r.score >= 0 ? "+" : ""}{r.score}
                </td>
              </tr>
            ))}
            {roundHistory.length > 0 && (
              <tr className="total-row">
                <td colSpan={3}>합계</td>
                <td style={{ color: totalScore >= 0 ? "#22c55e" : "#ef4444" }}>
                  {totalScore >= 0 ? "+" : ""}{totalScore}
                </td>
              </tr>
            )}
          </tbody>
        </SkulkingRoundTable>
        <PlayersTable entry={entry} />
      </>
    );
  }

  // 기타 (minesweeper, slide-puzzle 등)
  return (
    <>
      {entry.score !== null && <DetailRow><span>점수</span><span>{entry.score}</span></DetailRow>}
      {entry.rank && <DetailRow><span>순위</span><span>{entry.rank}위</span></DetailRow>}
      <PlayersTable entry={entry} />
    </>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const { session, nickname, nicknameUpdatedAt, updateNickname } = useAuth();
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const { canChange, nextChangeDate, daysLeft } = getCooldownInfo(nicknameUpdatedAt ?? null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`${API_URL}/api/profile/history`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [session?.access_token]);

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === nickname) return;
    setSaving(true);
    setErrorMsg(null);
    const { error } = await updateNickname(trimmed);
    setSaving(false);
    if (error) setErrorMsg(error);
    else setInput("");
  };

  const isSaveDisabled = saving || !canChange || !input.trim() || input.trim() === nickname;

  return (
    <MyPageWrapper>
      <MyPageHeader>
        <BackButton onClick={() => navigate("/")} aria-label="뒤로가기">←</BackButton>
        <MyPageTitle>마이페이지</MyPageTitle>
      </MyPageHeader>

      <Section>
        <SectionTitle>프로필</SectionTitle>
        <AvatarInfo>
          <span className="current-nickname">{nickname || "..."}</span>
          <span className="sub">현재 닉네임</span>
        </AvatarInfo>

        <NicknameForm>
          <NicknameInput
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.slice(0, 6)); setErrorMsg(null); }}
            placeholder={canChange ? "새 닉네임 입력 (최대 6자)" : "변경 불가 기간입니다"}
            maxLength={6}
            $disabled={!canChange}
            disabled={!canChange}
            onKeyDown={(e) => e.key === "Enter" && !isSaveDisabled && handleSave()}
          />
          {!canChange && (
            <InfoText $warning>
              닉네임은 {COOLDOWN_DAYS}일에 한 번만 변경할 수 있습니다.
              다음 변경 가능일: <strong>{nextChangeDate}</strong> ({daysLeft}일 후)
            </InfoText>
          )}
          {canChange && (
            <InfoText>닉네임은 최대 6자이며, {COOLDOWN_DAYS}일에 한 번만 변경할 수 있습니다.</InfoText>
          )}
          {errorMsg && <InfoText $error>{errorMsg}</InfoText>}
          <SaveButton onClick={handleSave} disabled={isSaveDisabled}>
            {saving ? "저장 중..." : "저장"}
          </SaveButton>
        </NicknameForm>
      </Section>

      <Section>
        <SectionTitle>게임 기록</SectionTitle>
        {historyLoading ? (
          <PlaceholderBox>불러오는 중...</PlaceholderBox>
        ) : history.length === 0 ? (
          <PlaceholderBox>아직 게임 기록이 없습니다</PlaceholderBox>
        ) : (
          <HistoryList>
            {history.map((h) => {
              const label = GAME_TYPE_LABELS[h.gameType] ?? h.gameType;
              const duration = formatDuration(h.durationSec);
              const sub = [
                formatDate(h.playedAt),
                `${h.playerCount}명`,
                h.totalRounds ? `${h.totalRounds}라운드` : null,
                duration,
              ].filter(Boolean).join(" · ");

              const resultText = h.status === "abandoned_voluntary"
                ? "자진 이탈"
                : h.status === "abandoned_disconnected"
                  ? "연결 끊김"
                  : h.isWinner === true
                  ? "승리"
                  : h.isWinner === false
                    ? "패배"
                    : h.score !== null
                      ? `${h.score}점`
                      : "-";

              return (
                <HistoryItem key={`${h.sessionId}-${h.playedAt}`} $status={h.status}
                  onClick={() => setSelectedEntry(h)}>
                  <HistoryBadge $gameType={h.gameType} $abandoned={h.status !== "completed"}>
                    {label}
                  </HistoryBadge>
                  <HistoryInfo>
                    <div className="title">{label} · {h.playerCount}인</div>
                    <div className="sub">{sub}</div>
                  </HistoryInfo>
                  <HistoryResult $isWinner={h.status === "completed" ? h.isWinner : null}>
                    {resultText}
                  </HistoryResult>
                </HistoryItem>
              );
            })}
          </HistoryList>
        )}
      </Section>

      {selectedEntry && (
        <DetailOverlay onClick={() => setSelectedEntry(null)}>
          <DetailBox onClick={(e) => e.stopPropagation()}>
            <DetailHeader>
              <div>
                <DetailTitle>
                  {GAME_TYPE_LABELS[selectedEntry.gameType] ?? selectedEntry.gameType} 상세 기록
                </DetailTitle>
                <DetailMeta>
                  {formatDate(selectedEntry.playedAt)} · {selectedEntry.playerCount}명
                  {selectedEntry.durationSec ? ` · ${formatDuration(selectedEntry.durationSec)}` : ""}
                </DetailMeta>
              </div>
              <DetailClose onClick={() => setSelectedEntry(null)}>✕</DetailClose>
            </DetailHeader>
            <DetailContent entry={selectedEntry} />
          </DetailBox>
        </DetailOverlay>
      )}
    </MyPageWrapper>
  );
}
