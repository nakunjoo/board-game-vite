import { useState } from "react";
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
} from "../styles/pages/MyPage";

const COOLDOWN_DAYS = 7;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

function getCooldownInfo(nicknameUpdatedAt: string | null): {
  canChange: boolean;
  nextChangeDate: string | null;
  daysLeft: number;
} {
  if (!nicknameUpdatedAt) return { canChange: true, nextChangeDate: null, daysLeft: 0 };

  const lastChanged = new Date(nicknameUpdatedAt).getTime();
  const elapsed = Date.now() - lastChanged;

  if (elapsed >= COOLDOWN_MS) return { canChange: true, nextChangeDate: null, daysLeft: 0 };

  const nextDate = new Date(lastChanged + COOLDOWN_MS);
  const nextChangeDate = `${nextDate.getFullYear()}.${String(nextDate.getMonth() + 1).padStart(2, "0")}.${String(nextDate.getDate()).padStart(2, "0")}`;
  const daysLeft = Math.ceil((COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));

  return { canChange: false, nextChangeDate, daysLeft };
}

export default function MyPage() {
  const navigate = useNavigate();
  const { nickname, nicknameUpdatedAt, updateNickname } = useAuth();
  const [input, setInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { canChange, nextChangeDate, daysLeft } = getCooldownInfo(nicknameUpdatedAt);

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed || trimmed === nickname) return;

    setSaving(true);
    setErrorMsg(null);

    const { error } = await updateNickname(trimmed);

    setSaving(false);
    if (error) {
      setErrorMsg(error);
    } else {
      setInput("");
    }
  };

  const isSaveDisabled =
    saving ||
    !canChange ||
    !input.trim() ||
    input.trim() === nickname;

  return (
    <MyPageWrapper>
      <MyPageHeader>
        <BackButton onClick={() => navigate("/")} aria-label="뒤로가기">
          ←
        </BackButton>
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
            onChange={(e) => {
              setInput(e.target.value.slice(0, 6));
              setErrorMsg(null);
            }}
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
            <InfoText>
              닉네임은 최대 6자이며, {COOLDOWN_DAYS}일에 한 번만 변경할 수 있습니다.
            </InfoText>
          )}

          {errorMsg && <InfoText $error>{errorMsg}</InfoText>}

          <SaveButton onClick={handleSave} disabled={isSaveDisabled}>
            {saving ? "저장 중..." : "저장"}
          </SaveButton>
        </NicknameForm>
      </Section>

      <Section>
        <SectionTitle>게임 기록</SectionTitle>
        <PlaceholderBox>준비 중입니다</PlaceholderBox>
      </Section>
    </MyPageWrapper>
  );
}
