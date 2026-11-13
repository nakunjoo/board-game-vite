import styled, { css, keyframes } from "styled-components";

const MOBILE = "@media (max-width: 1080px)";

export const BoardWrap = styled.div`
  width: 100%;
  height: 100%;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
  color: #e0e0e0;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 26px;
  font-size: 0.8rem;
  color: #aaa;
`;

export const TopInfo = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

export const TimeText = styled.span<{ $urgent?: boolean }>`
  font-weight: 700;
  color: ${({ $urgent }) => ($urgent ? "#ff6b6b" : "#f0f0f0")};
`;

export const ModeToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #ddd;
  font-size: 0.75rem;
  cursor: pointer;
  white-space: nowrap;
`;

/** 그림판 오른쪽 위에 겹쳐 띄우는 제시어 (터치는 통과해 그 아래도 그릴 수 있다) */
export const WordChip = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  pointer-events: none;
  opacity: 0.92;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  padding: 2px 10px;
  border-radius: 6px;
  background: #f1c40f;
  color: #3d2c00;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;

  small {
    font-size: 0.7rem;
    font-weight: 500;
  }
`;

// ── 좌석 (말풍선 모드) ─────────────────────────────────────

export const SeatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  position: relative;
  z-index: 5;
`;

export const SeatCell = styled.div`
  position: relative;
  min-width: 0;
`;

type BadgeState = "drawer" | "guessed" | null;

const badgeBg = (state: BadgeState) =>
  state === "drawer" ? "#FAEEDA" : state === "guessed" ? "#E1F5EE" : "#262626";
const badgeText = (state: BadgeState) =>
  state === "drawer" ? "#633806" : state === "guessed" ? "#04342C" : "#f0f0f0";
const badgeSub = (state: BadgeState) =>
  state === "drawer" ? "#854F0B" : state === "guessed" ? "#0F6E56" : "#aaa";

export const Badge = styled.div<{ $color: string; $state: BadgeState; $isMe?: boolean }>`
  height: 40px;
  box-sizing: border-box;
  border: 1.5px solid ${({ $color, $state }) => ($state === "drawer" ? "#EF9F27" : $state === "guessed" ? "#1D9E75" : $color)};
  border-radius: 8px;
  padding: 2px 7px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ $state }) => badgeBg($state)};
  box-shadow: ${({ $isMe }) => ($isMe ? "0 0 0 2px rgba(255,255,255,0.35)" : "none")};
`;

export const BadgeName = styled.div<{ $state: BadgeState }>`
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $state }) => badgeText($state)};
`;

export const BadgeSub = styled.div<{ $state: BadgeState }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  line-height: 1.2;
  color: ${({ $state }) => badgeSub($state)};
  font-variant-numeric: tabular-nums;
`;

export const EmptySeat = styled.div`
  height: 40px;
`;

const bubbleIn = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
`;

export const Bubble = styled.div<{ $color: string; $placement: "below" | "above"; $kind: "chat" | "correct" | "insider" }>`
  position: absolute;
  left: 0;
  right: 0;
  ${({ $placement }) => ($placement === "below" ? "top: calc(100% + 4px);" : "bottom: calc(100% + 4px);")}
  box-sizing: border-box;
  border: 1.5px solid ${({ $color, $kind }) => ($kind === "correct" ? "#1D9E75" : $color)};
  border-radius: 8px;
  padding: 3px 7px;
  font-size: 0.75rem;
  line-height: 1.35;
  word-break: break-all;
  background: ${({ $kind }) => ($kind === "correct" ? "#E1F5EE" : $kind === "insider" ? "#2d2a40" : "#ffffff")};
  color: ${({ $kind }) => ($kind === "correct" ? "#085041" : $kind === "insider" ? "#d9d4ff" : "#1a1a1a")};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  pointer-events: none;
  z-index: 6;
  animation: ${bubbleIn} 0.15s ease-out;
`;

// ── 작은 이름표 (채팅 모드·그리는 사람) ────────────────────

export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

export const Chip = styled.span<{ $color: string; $state: BadgeState; $isMe?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 22px;
  padding: 0 6px;
  border: 1.5px solid ${({ $color, $state }) => ($state === "drawer" ? "#EF9F27" : $state === "guessed" ? "#1D9E75" : $color)};
  border-radius: 6px;
  font-size: 0.72rem;
  white-space: nowrap;
  background: ${({ $state }) => badgeBg($state)};
  color: ${({ $state }) => badgeText($state)};
  font-weight: ${({ $isMe }) => ($isMe ? 700 : 400)};
  font-variant-numeric: tabular-nums;
`;

export const AwayIcon = styled.span`
  color: #ff6b6b;
  font-size: 0.7rem;
`;

// ── 그림판 ─────────────────────────────────────────────────

export const CanvasFrame = styled.div`
  flex: 1 1 auto;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const CanvasBox = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
`;

export const CanvasOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  text-align: center;
  font-size: 0.95rem;
  z-index: 2;
`;

export const RevealWord = styled.div`
  font-size: 1.4rem;
  font-weight: 800;
  color: #f1c40f;
`;

/** 정답이 나온 뒤 그림을 가리지 않게 아래쪽에만 띄우는 안내 */
export const RevealBanner = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 0.85rem;
  text-align: center;
  z-index: 2;
`;

export const DrawerNote = styled.div`
  flex: 1;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #bbb;
  font-size: 0.82rem;
  text-align: center;
`;

const rouletteStop = keyframes`
  0% { transform: scale(1); }
  40% { transform: scale(1.25); }
  100% { transform: scale(1); }
`;

/** 제시어 룰렛: 돌 때는 흐리게, 멈추면 노랗게 튀어나온다 */
export const RouletteWord = styled.div<{ $done: boolean }>`
  min-width: 140px;
  padding: 6px 16px;
  border-radius: 10px;
  border: 2px solid ${({ $done }) => ($done ? "#f1c40f" : "rgba(255, 255, 255, 0.35)")};
  background: ${({ $done }) => ($done ? "rgba(241, 196, 15, 0.18)" : "rgba(255, 255, 255, 0.08)")};
  color: ${({ $done }) => ($done ? "#f1c40f" : "#ddd")};
  font-size: 1.6rem;
  font-weight: 800;
  text-align: center;
  animation: ${({ $done }) => ($done ? css`${rouletteStop} 0.35s ease-out` : "none")};
`;

export const GainList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8rem;
  color: #ddd;
  font-variant-numeric: tabular-nums;
`;

const toastIn = keyframes`
  from { opacity: 0; transform: translate(-50%, -6px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

export const Toast = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 10px;
  border-radius: 8px;
  border: 1.5px solid #1D9E75;
  background: #E1F5EE;
  color: #085041;
  font-size: 0.8rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 3;
  animation: ${toastIn} 0.15s ease-out;
`;

/** 힌트 글자 (_ _ _, ㄱ ㅇ ㅇ) 사이를 띄운다 */
export const HintLetters = styled.span`
  letter-spacing: 0.3em;
`;

// ── 입력·기록 ──────────────────────────────────────────────

/** 휴대폰에서 오른쪽 아래 채팅 버튼 자리를 비워 둔다 */
const reserveRight = ($reserve: number) => css`
  ${MOBILE} {
    padding-right: ${$reserve}px;
  }
`;

export const InputBar = styled.form<{ $reserve: number }>`
  display: flex;
  gap: 6px;
  margin: 0;
  ${({ $reserve }) => reserveRight($reserve)}
`;

export const GuessInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 38px;
  box-sizing: border-box;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: #262626;
  color: #f0f0f0;
  font-size: 16px; /* 16px 미만이면 아이폰이 입력할 때 화면을 확대한다 */
`;

export const SendButton = styled.button`
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: none;
  background: #3498db;
  color: #fff;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    background: #3a3a3a;
    color: #888;
  }
`;

export const ChatLog = styled.div<{ $fill?: boolean }>`
  flex: ${({ $fill }) => ($fill ? "1 1 auto" : "0 0 auto")};
  height: ${({ $fill }) => ($fill ? "auto" : "130px")};
  min-height: 60px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 0.8rem;
  line-height: 1.55;
  overscroll-behavior: contain;
`;

export const LogLine = styled.div<{ $tone?: "system" | "success" | "insider" }>`
  color: ${({ $tone }) =>
    $tone === "system" ? "#999" : $tone === "success" ? "#2ecc71" : $tone === "insider" ? "#c8c0ff" : "#e0e0e0"};
  word-break: break-all;

  b {
    font-weight: 700;
  }
`;

export const LastLine = styled.div`
  font-size: 0.75rem;
  color: #bbb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 18px;

  b {
    font-weight: 700;
  }
`;

// ── 그림 도구 ──────────────────────────────────────────────

export const ColorRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

export const ColorSwatch = styled.button<{ $color: string; $selected: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: ${({ $color }) => $color};
  outline: ${({ $selected }) => ($selected ? "2px solid #3498db" : "none")};
  outline-offset: 2px;
  cursor: pointer;
`;

export const ToolRow = styled.div<{ $reserve: number }>`
  display: flex;
  gap: 6px;
  ${({ $reserve }) => reserveRight($reserve)}
`;

export const ToolButton = styled.button<{ $active?: boolean }>`
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  border-radius: 8px;
  border: 1px solid ${({ $active }) => ($active ? "#3498db" : "rgba(255, 255, 255, 0.25)")};
  background: ${({ $active }) => ($active ? "rgba(52, 152, 219, 0.2)" : "transparent")};
  color: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const SizeDot = styled.span<{ $px: number }>`
  width: ${({ $px }) => $px}px;
  height: ${({ $px }) => $px}px;
  border-radius: 50%;
  background: currentColor;
`;

// ── 가로로 넓은 화면 (폴드 펼침·가로 모드): 그림판 왼쪽, 나머지 오른쪽 ──

export const WideWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 10px;
  min-height: 0;
  color: #e0e0e0;
`;

export const WideCanvasCol = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
`;

export const WideSide = styled.div`
  flex: 0 0 min(42%, 340px);
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
