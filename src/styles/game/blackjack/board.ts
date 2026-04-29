import styled from "styled-components";

// ── 보드 컨테이너 ──────────────────────────────────────────────

export const BjBoard = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: radial-gradient(ellipse at center top, #1a6b3c 0%, #0d4a28 50%, #071e12 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 12px 0;
  overflow: hidden;
`;

// ── 딜러 존 ────────────────────────────────────────────────────

export const BjDealerZone = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 12px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  border: 1px solid rgba(180, 140, 50, 0.35);
  flex-shrink: 0;
`;

export const BjDealerLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 2px;
`;

export const BjDealerCards = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  min-height: 54px;
`;

export const BjDealerValue = styled.div<{ $bust?: boolean; $blackjack?: boolean }>`
  font-size: 15px;
  font-weight: 700;
  color: ${({ $bust, $blackjack }) =>
    $bust ? "#e74c3c" : $blackjack ? "#f1c40f" : "#fff"};
`;

// ── 타이머 + 라운드 한 줄 ─────────────────────────────────────

export const BjInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  min-height: 18px;
`;

export const BjTimerRow = BjInfoRow;

export const BjTimerBar = styled.div`
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  overflow: hidden;
`;

export const BjTimerFill = styled.div<{ $pct: number; $low: boolean }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $low }) => ($low ? "#e74c3c" : "#2ecc71")};
  border-radius: 2px;
  transition: width 0.9s linear, background 0.3s;
`;

export const BjTimerText = styled.span<{ $low: boolean }>`
  font-size: 11px;
  color: ${({ $low }) => ($low ? "#e74c3c" : "rgba(255,255,255,0.55)")};
  font-weight: ${({ $low }) => ($low ? 700 : 400)};
`;

// ── 라운드 배지 (BjInfoRow 안에서 타이머와 나란히) ──────────────

export const BjRoundBadge = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 5px;
  padding: 1px 8px;
  white-space: nowrap;
`;

// ── 상대 플레이어 영역 ─────────────────────────────────────────

export const BjOpponentsArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

export const BjOpponentRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const BjOpponentSeat = styled.div<{ $isDone: boolean; $isBust?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 5px 10px 6px;
  min-width: 76px;
  max-width: 110px;
  background: ${({ $isBust }) => $isBust ? "rgba(0,0,0,0.15)" : "rgba(0, 0, 0, 0.3)"};
  border: 1px solid
    ${({ $isDone, $isBust }) =>
      $isBust ? "rgba(255,255,255,0.08)"
      : $isDone ? "rgba(46, 204, 113, 0.5)"
      : "rgba(255, 255, 255, 0.12)"};
  border-radius: 8px;
  transition: all 0.2s;
  opacity: ${({ $isBust }) => $isBust ? 0.5 : 1};
  filter: ${({ $isBust }) => $isBust ? "grayscale(0.7)" : "none"};
`;

export const BjSeatNickname = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const BjSeatChips = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #f1c40f;
`;

export const BjSeatBet = styled.div`
  font-size: 10px;
  color: rgba(255, 165, 0, 0.85);
`;

// 완료 상태 배지
export const BjStatusBadge = styled.div<{ $type: "waiting" | "bet" | "stand" | "bust" | "blackjack" | "doubled" }>`
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ $type }) =>
    $type === "blackjack" ? "rgba(241,196,15,0.25)"
    : $type === "bust" ? "rgba(231,76,60,0.25)"
    : $type === "waiting" ? "rgba(255,255,255,0.08)"
    : "rgba(46,204,113,0.2)"};
  color: ${({ $type }) =>
    $type === "blackjack" ? "#f1c40f"
    : $type === "bust" ? "#e74c3c"
    : $type === "waiting" ? "rgba(255,255,255,0.45)"
    : "#2ecc71"};
  border: 1px solid ${({ $type }) =>
    $type === "blackjack" ? "rgba(241,196,15,0.4)"
    : $type === "bust" ? "rgba(231,76,60,0.4)"
    : $type === "waiting" ? "rgba(255,255,255,0.1)"
    : "rgba(46,204,113,0.35)"};
`;

export const BjSeatHandValue = styled.div<{ $bust?: boolean; $blackjack?: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $bust, $blackjack }) =>
    $bust ? "#e74c3c" : $blackjack ? "#f1c40f" : "#fff"};
`;

export const BjSeatMiniHand = styled.div`
  display: flex;
  gap: 3px;
  justify-content: center;
`;

export const BjMiniCard = styled.div<{ $status?: string }>`
  width: 22px;
  height: 30px;
  border-radius: 3px;
  background: ${({ $status }) =>
    $status === "bust"
      ? "#5a1a1a"
      : $status === "blackjack"
      ? "#5a4a0a"
      : "rgba(255,255,255,0.85)"};
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  color: #333;
`;

// ── 내 존 (하단 중앙) ─────────────────────────────────────────

export const BjMyZone = styled.div`
  width: 100%;
  margin-top: auto;
  padding: 8px 14px 10px;
  background: rgba(0, 0, 40, 0.45);
  border-radius: 12px 12px 0 0;
  border: 1px solid rgba(52, 152, 219, 0.4);
  border-bottom: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

export const BjMyLabel = styled.div`
  font-size: 10px;
  color: rgba(100, 180, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
`;

export const BjMyChips = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #f1c40f;
`;

export const BjMyBet = styled.div`
  font-size: 11px;
  color: rgba(255, 165, 0, 0.9);
`;

// ── 카드 ────────────────────────────────────────────────────────

export const BjMyCards = styled.div`
  display: flex;
  gap: 5px;
  align-items: flex-end;
  justify-content: center;
  flex-wrap: wrap;
  min-height: 70px;
`;

export const BjCardImg = styled.img<{ $result?: string }>`
  width: 50px;
  height: 70px;
  border-radius: 5px;
  border: 2px solid
    ${({ $result }) =>
      $result === "win"
        ? "#2ecc71"
        : $result === "lose"
        ? "#e74c3c"
        : $result === "push"
        ? "#95a5a6"
        : "rgba(255,255,255,0.3)"};
  box-shadow: ${({ $result }) =>
    $result === "win"
      ? "0 0 8px rgba(46,204,113,0.6)"
      : $result === "lose"
      ? "0 0 8px rgba(231,76,60,0.4)"
      : "0 2px 8px rgba(0,0,0,0.6)"};
  object-fit: cover;
`;

export const BjCardBack = styled.div`
  border-radius: 5px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
`;

export const BjHandValue = styled.span<{ $bust?: boolean; $blackjack?: boolean }>`
  font-size: 13px;
  font-weight: 700;
  color: ${({ $bust, $blackjack }) =>
    $bust ? "#e74c3c" : $blackjack ? "#f1c40f" : "#fff"};
`;

export const BjHandLabel = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
`;

export const BjHandSection = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => ($active ? "rgba(52,152,219,0.7)" : "transparent")};
  background: ${({ $active }) => ($active ? "rgba(52,152,219,0.1)" : "transparent")};
`;

export const BjSplitDivider = styled.div`
  width: 1px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 3px;
`;

// ── 액션 버튼 ───────────────────────────────────────────────────

export const BjActionButtons = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const BjActionBtn = styled.button<{ $variant?: "primary" | "danger" | "warning" | "info" }>`
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  background: ${({ $variant }) =>
    $variant === "danger"
      ? "#c0392b"
      : $variant === "warning"
      ? "#e67e22"
      : $variant === "info"
      ? "#2980b9"
      : "#27ae60"};
  color: #fff;

  &:hover:not(:disabled) {
    filter: brightness(1.15);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

// ── 게임 시작 전 ────────────────────────────────────────────────

export const BjPreGame = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
`;

export const BjStartBtn = styled.button`
  padding: 12px 28px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #1a6b3c 0%, #0d4a28 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const BjConfigRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

export const BjConfigLabel = styled.span`
  min-width: 90px;
`;

export const BjConfigSelect = styled.select`
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: #fff;
  padding: 5px 8px;
  font-size: 14px;
  cursor: pointer;
`;
