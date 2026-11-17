import styled, { css, keyframes } from "styled-components";

const ACCENT = "#9b59b6";

export const BoardWrap = styled.div`
  width: 100%;
  height: 100%;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  color: #e0e0e0;
`;

/** 입력칸 위 전부. 보통은 설명판·채팅이 남는 높이를 나눠 쓰고, 그래도 넘치면(작은 화면의 결과 등) 여기서 스크롤 */
export const BoardBody = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-top: 6px; /* 칸 모서리 밖 빨간 점·표 수가 잘리지 않게 */
  margin-top: -6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// ── 눕힌 화면 (왼쪽 진행·참가자 / 오른쪽 설명판·채팅·입력) ─────────

export const WideWrap = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  gap: 10px;
  color: #e0e0e0;
`;

export const WideLeft = styled.div`
  flex: 1 1 50%;
  min-width: 0;
  min-height: 0;
  overflow-x: hidden; /* 칸 모서리 밖으로 나온 빨간 점·표 수 때문에 가로 스크롤이 생기지 않게 */
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px 6px 0 0; /* 빨간 점(-4px)이 잘리지 않게 */
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const WideRight = styled.div`
  flex: 1 1 50%;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 24px;
  font-size: 0.8rem;
  color: #aaa;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const TimeText = styled.span<{ $urgent?: boolean }>`
  font-weight: 700;
  color: ${({ $urgent }) => ($urgent ? "#ff6b6b" : "#f0f0f0")};
`;

// ── 내 제시어 ──────────────────────────────────────────────

export const WordCard = styled.div<{ $liar?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: ${({ $liar }) => ($liar ? "rgba(231, 76, 60, 0.16)" : "rgba(155, 89, 182, 0.16)")};
  border: 1px solid ${({ $liar }) => ($liar ? "rgba(231, 76, 60, 0.5)" : "rgba(155, 89, 182, 0.5)")};
`;

export const WordTopic = styled.span`
  font-size: 0.8rem;
  color: #bbb;
  white-space: nowrap;
`;

export const WordValue = styled.span<{ $hidden?: boolean }>`
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  ${({ $hidden }) =>
    $hidden &&
    css`
      filter: blur(7px);
      user-select: none;
    `}
`;

export const PeekButton = styled.button`
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #ddd;
  font-size: 0.75rem;
  cursor: pointer;
`;

// ── 참가자 (최대 8명, 4칸 × 2줄) ──────────────────────────────

export const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.55); }
  50% { box-shadow: 0 0 0 4px rgba(241, 196, 15, 0); }
`;

export const Seat = styled.button<{
  $color: string;
  $speaking: boolean;
  $myVote: boolean;
  $clickable: boolean;
  $isMe: boolean;
  $dim?: boolean;
}>`
  position: relative;
  min-width: 0;
  min-height: 48px;
  padding: 5px 2px 4px;
  border-radius: 8px;
  border: 2px solid ${({ $color, $myVote, $speaking }) => ($myVote ? "#ff4d3d" : $speaking ? "#f1c40f" : $color)};
  /* index.css의 button:hover(파란 테두리)·포커스 테두리가 덮어써서, 휴대폰에선 누른 칸이 내 표(빨강) 대신 파랑·노랑으로 보였다 */
  &:hover {
    border-color: ${({ $color, $myVote, $speaking }) => ($myVote ? "#ff4d3d" : $speaking ? "#f1c40f" : $color)};
  }
  &:focus {
    outline: none;
  }
  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 1px;
  }
  background: ${({ $myVote, $isMe }) =>
    $myVote ? "rgba(231, 76, 60, 0.38)" : $isMe ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.04)"};
  ${({ $myVote }) =>
    $myVote &&
    css`
      box-shadow: 0 0 0 2px rgba(255, 77, 61, 0.45), 0 0 10px rgba(255, 77, 61, 0.55);
    `}
  color: #eee;
  font: inherit;
  text-align: center;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  opacity: ${({ $dim }) => ($dim ? 0.45 : 1)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  -webkit-tap-highlight-color: transparent;
  ${({ $speaking }) =>
    $speaking &&
    css`
      animation: ${pulse} 1.2s ease-in-out infinite;
    `}
`;

/**
 * 닉네임 최대 6자가 잘리지 않게: 글자 크기를 화면 폭에 맞춰 11~13px로 줄여 360px 이상이면 한 줄,
 * 그보다 좁으면 자르지 않고 두 줄로 나눈다 (4칸 × 2줄 = 최대 8명)
 */
export const SeatName = styled.span`
  max-width: 100%;
  font-size: clamp(11px, 3.1vw, 13px);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.2;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

export const SeatSub = styled.span<{ $done?: boolean }>`
  font-size: 0.7rem;
  color: ${({ $done }) => ($done ? "#4ee08a" : "#aaa")};
  font-weight: ${({ $done }) => ($done ? 700 : 400)};
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

const blink = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(0.8); }
`;

/** 설명 차례인 사람 칸 오른쪽 위에서 깜박이는 빨간 점 */
export const SpeakDot = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #ff3b30;
  border: 2px solid #1a1a1a;
  animation: ${blink} 1s ease-in-out infinite;
  pointer-events: none;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

/** 자리 오른쪽 위 작은 표시 (투표 완료 · 득표 수 · 라이어) */
export const SeatTag = styled.span<{ $tone?: "vote" | "liar" | "count" | "done" }>`
  position: absolute;
  top: -7px;
  right: -5px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 16px;
  white-space: nowrap;
  color: #fff;
  background: ${({ $tone }) =>
    $tone === "liar" ? "#e74c3c" : $tone === "count" ? "#c0392b" : $tone === "done" ? "#27ae60" : "#555"};
  pointer-events: none;
`;

/** 내가 투표한 사람 칸 왼쪽 위 "내 표" */
export const MyVoteTag = styled.span`
  position: absolute;
  top: -8px;
  left: -5px;
  padding: 0 6px;
  border-radius: 9px;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 16px;
  white-space: nowrap;
  color: #fff;
  background: #ff4d3d;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
`;

/** 투표 시간 안내의 내 투표 상태 한 줄 */
export const VoteStatus = styled.div<{ $done: boolean }>`
  margin-top: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  color: ${({ $done }) => ($done ? "#7dffb0" : "#ffd36b")};
  background: ${({ $done }) => ($done ? "rgba(39, 174, 96, 0.18)" : "rgba(241, 196, 15, 0.14)")};
  border: 1px solid ${({ $done }) => ($done ? "rgba(39, 174, 96, 0.55)" : "rgba(241, 196, 15, 0.45)")};
`;

// ── 단계 안내 ─────────────────────────────────────────────

export const StagePanel = styled.div<{ $tone?: "turn" | "alert" }>`
  padding: 8px 12px;
  border-radius: 10px;
  background: ${({ $tone }) =>
    $tone === "turn" ? "rgba(241, 196, 15, 0.16)" : $tone === "alert" ? "rgba(231, 76, 60, 0.16)" : "rgba(255, 255, 255, 0.05)"};
  border: 1px solid
    ${({ $tone }) =>
      $tone === "turn" ? "rgba(241, 196, 15, 0.5)" : $tone === "alert" ? "rgba(231, 76, 60, 0.5)" : "rgba(255, 255, 255, 0.1)"};
  font-size: 0.85rem;
  line-height: 1.5;
  text-align: center;

  b {
    color: #fff;
  }

  small {
    color: #aaa;
  }
`;

export const ResultTitle = styled.div<{ $win: "liar" | "citizens" | "none" }>`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${({ $win }) => ($win === "liar" ? "#ff7675" : $win === "citizens" ? "#55efc4" : "#ddd")};
`;

/** 이름·값을 한 줄에 두 쌍씩 (작은 화면에서 결과 안내가 너무 길어지지 않게) */
export const ResultRows = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 2px 8px;
  word-break: keep-all;
  margin-top: 4px;
  text-align: left;
  font-size: 0.85rem;

  span:nth-child(odd) {
    color: #999;
  }
`;

export const InlineButton = styled.button`
  margin-left: 6px;
  padding: 1px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #ddd;
  font-size: 0.75rem;
  cursor: pointer;
`;

// ── 설명판 (가운데, 안에서만 스크롤) ─────────────────────────

/** 설명판·채팅 기록의 최대 높이 (화면 높이 기준). 접으면 채팅이 그만큼 커진다 */
export const DESC_MAX_VH = 45;
export const LOG_MAX_VH_OPEN = 30;
export const LOG_MAX_VH_FOLDED = 55;

export const DescBoard = styled.div<{ $open: boolean }>`
  flex: ${({ $open }) => ($open ? "1 1 auto" : "0 0 auto")};
  min-height: ${({ $open }) => ($open ? "110px" : "0")};
  max-height: ${DESC_MAX_VH}vh;
  /* iOS 사파리의 vh는 주소창이 숨은 높이 기준이라 실제 보이는 높이(dvh)로. 모르는 브라우저는 위의 vh */
  max-height: ${DESC_MAX_VH}dvh;
  border-radius: 10px;
  border: 1px solid rgba(155, 89, 182, 0.35);
  background: rgba(155, 89, 182, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const DescHeader = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: #bbb;
  font: inherit;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  > span:nth-child(2) {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #f7dc6f;
  }
`;

export const DescChevron = styled.span<{ $open: boolean }>`
  flex-shrink: 0;
  display: inline-block;
  transition: transform 0.15s ease;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
`;

export const DescScroll = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DescLine = styled.div<{ $now?: boolean; $skip?: boolean }>`
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 5px 8px;
  border-radius: 7px;
  word-break: break-all;
  background: ${({ $now }) => ($now ? "rgba(241, 196, 15, 0.16)" : "rgba(255, 255, 255, 0.05)")};
  border: 1px solid ${({ $now }) => ($now ? "rgba(241, 196, 15, 0.6)" : "transparent")};
  color: ${({ $now, $skip }) => ($now ? "#f7dc6f" : $skip ? "#888" : "#fff")};
  font-size: ${({ $now }) => ($now ? "0.95rem" : "0.9rem")};
  font-style: ${({ $skip }) => ($skip ? "italic" : "normal")};

  b {
    flex-shrink: 0;
    font-size: 0.8rem;
    font-weight: 700;
    font-style: normal;
  }
`;

export const LapDivider = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: #999;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.15);
  }
`;

export const PendingLine = styled.div`
  flex-shrink: 0;
  padding: 2px 8px;
  word-break: keep-all; /* 좁은 화면에서 이름이 "유/나"로 쪼개지지 않게 */
  font-size: 0.75rem;
  color: #888;
`;

// ── 기록·입력 ─────────────────────────────────────────────

/**
 * 판 중에는 설명판과 높이를 나눠 쓴다 — 설명판을 펴면 작게(최대 30vh), 접으면 크게(최대 55vh).
 * 시작 전에는 설명판이 없으니 남는 높이를 다 쓴다
 */
export const Log = styled.div<{ $maxVh?: number }>`
  flex: 1 1 auto;
  min-height: 80px;
  ${({ $maxVh }) => ($maxVh ? `max-height: ${$maxVh}vh; max-height: ${$maxVh}dvh;` : "")}
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 0.85rem;
  line-height: 1.55;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const LogLine = styled.div<{ $tone: "chat" | "desc" | "skip" | "system" | "good" | "bad" }>`
  word-break: break-all;
  color: ${({ $tone }) =>
    $tone === "system" || $tone === "skip"
      ? "#999"
      : $tone === "good"
        ? "#55efc4"
        : $tone === "bad"
          ? "#ff7675"
          : "#e0e0e0"};
  ${({ $tone }) =>
    $tone === "desc" &&
    css`
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(155, 89, 182, 0.18);
      color: #fff;
    `}
  ${({ $tone }) =>
    $tone === "skip" &&
    css`
      padding: 3px 8px;
      font-style: italic;
    `}

  b {
    font-weight: 700;
  }
`;

export const InputBar = styled.form`
  display: flex;
  gap: 6px;
  margin: auto 0 0; /* 설명판·기록이 최대 높이에 걸려 공간이 남아도 입력칸은 맨 아래 */
`;

export const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 40px;
  box-sizing: border-box;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: #262626;
  color: #f0f0f0;
  font-size: 16px; /* 16px 미만이면 아이폰이 입력할 때 화면을 확대한다 */

  &:disabled {
    opacity: 0.55;
  }
`;

export const SendButton = styled.button<{ $highlight?: boolean }>`
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: ${({ $highlight }) => ($highlight ? "#f39c12" : ACCENT)};
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    background: #3a3a3a;
    color: #888;
  }
`;

/** 살짝 내려오기만 한다 — 투명에서 시작하면 애니메이션이 멈춘 화면(백그라운드 등)에서 안내가 안 보인다 */
const toastIn = keyframes`
  from { transform: translate(-50%, -4px); }
  to { transform: translate(-50%, 0); }
`;

export const ToastWrap = styled.div`
  position: relative;
  height: 0;
`;

export const Toast = styled.div`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 8px;
  background: #333;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 3;
  animation: ${toastIn} 0.15s ease-out;
`;
