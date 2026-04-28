import { useState, useEffect } from "react";
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
} from "../styles/pages/MyPage";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const GAME_TYPE_LABELS: Record<string, string> = {
  gang: "갱스터",
  spice: "향신료",
  skulking: "스컬킹",
  minesweeper: "지뢰찾기",
  "slide-puzzle": "슬라이드 퍼즐",
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
}

export default function MyPage() {
  const navigate = useNavigate();
  const { user, session, nickname, nicknameUpdatedAt, updateNickname } = useAuth();
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const { canChange, nextChangeDate, daysLeft } = getCooldownInfo(nicknameUpdatedAt);

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
                <HistoryItem key={`${h.sessionId}-${h.playedAt}`} $status={h.status}>
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
    </MyPageWrapper>
  );
}
