import styled from "styled-components";
import { SKULKING_SUIT_COLORS } from "../../../utils/games/skulking";

// ── 공통 모달 ────────────────────────────────────────

export const HelpOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const HelpModal = styled.div`
  background: #1a1a2e;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  padding: 20px 20px 16px;
  max-width: 560px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const HelpTitle = styled.h2`
  font-size: 1.3rem;
  color: #e74c3c;
  margin: 0 0 14px;
  text-align: center;
`;

// ── 탭 ──────────────────────────────────────────────

export const TabRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 7px 0;
  border-radius: 6px;
  border: 2px solid ${({ $active }) => ($active ? "#e74c3c" : "#2c3e50")};
  background: ${({ $active }) =>
    $active ? "rgba(231,76,60,0.15)" : "transparent"};
  color: ${({ $active }) => ($active ? "#e74c3c" : "#7f8c8d")};
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.15s;
`;

// ── 규칙 탭 스타일 ───────────────────────────────────

export const Section = styled.div`
  margin-bottom: 14px;
`;

export const SectionTitle = styled.h3`
  font-size: 0.9rem;
  color: #f39c12;
  margin: 0 0 7px;
  border-bottom: 1px solid #2c3e50;
  padding-bottom: 4px;
`;

export const HelpText = styled.p`
  font-size: 0.82rem;
  line-height: 1.6;
  margin: 0 0 4px;
  color: #bdc3c7;
`;

export const CardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  margin-top: 4px;
`;

export const CardTh = styled.th`
  background: #2c3e50;
  padding: 5px 7px;
  text-align: left;
  color: #ecf0f1;
`;

export const CardTd = styled.td`
  padding: 4px 7px;
  border-bottom: 1px solid #2c3e50;
  color: #bdc3c7;
`;

// ── 족보 탭 스타일 ───────────────────────────────────

export const RankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const RankRow = styled.div<{ $isTop?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 7px;
  background: ${({ $isTop }) =>
    $isTop ? "rgba(231,76,60,0.12)" : "rgba(255,255,255,0.04)"};
  border: 1px solid
    ${({ $isTop }) =>
      $isTop ? "rgba(231,76,60,0.35)" : "rgba(255,255,255,0.07)"};
`;

export const RankNum = styled.div<{ $isTop?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $isTop }) => ($isTop ? "#e74c3c" : "#2c3e50")};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const MiniCard = styled.div<{ $type: string }>`
  width: 36px;
  height: 52px;
  border-radius: 4px;
  background: ${({ $type }) => SKULKING_SUIT_COLORS[$type] ?? "#2c3e50"};
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1;
`;

export const RankInfo = styled.div`
  flex: 1;
`;

export const RankName = styled.div`
  font-size: 0.85rem;
  font-weight: bold;
  color: #ecf0f1;
  margin-bottom: 2px;
`;

export const RankDesc = styled.div`
  font-size: 0.75rem;
  color: #7f8c8d;
  line-height: 1.4;
`;

export const HelpDivider = styled.div`
  text-align: center;
  color: #2c3e50;
  font-size: 0.75rem;
  margin: 1px 0;
  user-select: none;
`;

// ── 보너스 탭 스타일 ─────────────────────────────────

export const BonusBox = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(243, 156, 18, 0.08);
  border: 1px solid rgba(243, 156, 18, 0.25);
  border-radius: 7px;
`;

export const BonusTitle = styled.div`
  font-size: 0.82rem;
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 6px;
`;

export const BonusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

export const BonusCard = styled.div<{ $type: string }>`
  width: 28px;
  height: 40px;
  border-radius: 3px;
  background: ${({ $type }) => SKULKING_SUIT_COLORS[$type] ?? "#2c3e50"};
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

export const BonusText = styled.div`
  font-size: 0.78rem;
  color: #bdc3c7;
  line-height: 1.4;
`;

export const ScoreTag = styled.span`
  color: #f1c40f;
  font-weight: bold;
`;

// ── 닫기 버튼 ────────────────────────────────────────

export const HelpCloseButton = styled.button`
  display: block;
  margin: 14px auto 0;
  padding: 7px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  &:hover {
    background: #c0392b;
  }
`;
