import styled, { keyframes } from "styled-components";

/** 단계가 바뀔 때 화면 가운데 뜨는 팝업 (라이어·마피아) */

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.82); }
  70% { opacity: 1; transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
`;

export type PopupTone = "neutral" | "good" | "bad" | "night" | "day";

const TONE: Record<PopupTone, { border: string; glow: string; bg: string }> = {
  neutral: { border: "#9b59b6", glow: "rgba(155, 89, 182, 0.55)", bg: "linear-gradient(160deg, #2e2438 0%, #1d1a22 100%)" },
  good: { border: "#2ecc71", glow: "rgba(46, 204, 113, 0.5)", bg: "linear-gradient(160deg, #1f3328 0%, #18201b 100%)" },
  bad: { border: "#e74c3c", glow: "rgba(231, 76, 60, 0.55)", bg: "linear-gradient(160deg, #3a1f1d 0%, #221616 100%)" },
  night: { border: "#5b6ee1", glow: "rgba(91, 110, 225, 0.55)", bg: "linear-gradient(160deg, #1b2040 0%, #12131f 100%)" },
  day: { border: "#f1c40f", glow: "rgba(241, 196, 15, 0.5)", bg: "linear-gradient(160deg, #3a3218 0%, #211e14 100%)" },
};

export const PopupOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 450;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
  animation: ${fadeIn} 0.2s ease-out;
  -webkit-tap-highlight-color: transparent;
`;

export const PopupCard = styled.div<{ $tone: PopupTone }>`
  width: 100%;
  max-width: 320px;
  max-height: 80dvh;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 18px 16px;
  border-radius: 16px;
  border: 2px solid ${({ $tone }) => TONE[$tone].border};
  background: ${({ $tone }) => TONE[$tone].bg};
  box-shadow: 0 0 28px ${({ $tone }) => TONE[$tone].glow};
  color: #eee;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: ${popIn} 0.35s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const PopupEmoji = styled.div`
  font-size: 2.6rem;
  line-height: 1;
`;

export const PopupTitle = styled.div`
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  word-break: keep-all;
`;

export const PopupBody = styled.div`
  font-size: 0.9rem;
  line-height: 1.5;
  color: #ddd;
  word-break: keep-all;

  b {
    color: #fff;
  }
`;

/** 이름·값 두 줄짜리 표 */
export const PopupRows = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  width: 100%;
  padding: 8px 10px;
  box-sizing: border-box;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  font-size: 0.88rem;
  text-align: left;

  span:nth-child(odd) {
    color: #aaa;
  }
  span:nth-child(even) {
    color: #fff;
    font-weight: 700;
  }
`;

export const PopupCount = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
  font-size: 0.85rem;
  color: #bbb;

  strong {
    font-size: 1.9rem;
    font-weight: 800;
    color: #fff;
    font-variant-numeric: tabular-nums;

    small {
      margin-left: 1px;
      font-size: 0.95rem;
      font-weight: 700;
    }
  }
`;

export const PopupHint = styled.div`
  font-size: 0.72rem;
  color: #888;
`;
