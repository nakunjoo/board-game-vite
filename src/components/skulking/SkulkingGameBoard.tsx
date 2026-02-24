import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import {
  GameBoard,
  PlayerCircle,
  MyHandArea,
  HandCard,
  StartGameButton,
} from "../../styles/game";
import {
  PlayerSeat,
  PlayerAvatar,
  PlayerAvatarWrapper,
  KickButton,
  OtherPlayerHand,
  OtherPlayerCard,
  getSeatPosition,
} from "../../styles/pages/Room";
import type { Card, PlayerHand } from "../../types/game";
import type { TrickEntry, SkulkingPlayer } from "./types";
import {
  SKULKING_SUIT_COLORS,
  SKULKING_SUIT_LABELS,
  SKULKING_SUIT_NAMES,
  isSpecialCard,
} from "../../utils/games/skulking";

// ── 스컬킹 전용 스타일 ─────────────────────────────────────────


const BoardCenterBadge = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  width: max-content;
`;

const DeckDisplay = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
  cursor: pointer;
`;

const DeckCard = styled.div`
  width: 36px;
  height: 50px;
  border-radius: 4px;
  background: #1a4d8c;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.15s;

  ${DeckDisplay}:hover & {
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

const DeckLabel = styled.span`
  font-size: 0.65rem;
  color: #7f8c8d;
`;

const StatsOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 400;
`;

const StatsModal = styled.div`
  background: #1a1a2e;
  border: 1px solid #2c3e50;
  border-radius: 10px;
  padding: 16px;
  width: 92vw;
  color: #ecf0f1;
`;

const StatsTitle = styled.div`
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #e74c3c;
  text-align: center;
`;

const StatsTable = styled.table`
  border-collapse: collapse;
  font-size: 0.72rem;
  width: 100%;

  th {
    font-weight: 700;
    padding: 3px 6px;
    text-align: center;
    border-bottom: 1px solid #2c3e50;
  }

  td {
    padding: 3px 6px;
    text-align: center;
    border-bottom: 1px solid #1e2a38;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const RoundBadge = styled.span`
  background: #e74c3c;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.8rem;
`;

const PhaseBadge = styled.span<{ $phase: string }>`
  background: ${({ $phase }) => ($phase === "bid" ? "#f39c12" : "#27ae60")};
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.8rem;
`;

const TURN_TIME = 20;

const TimerBox = styled.div<{ $isMyTurn: boolean; $urgent: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: ${({ $isMyTurn, $urgent }) =>
    $isMyTurn
      ? $urgent
        ? "rgba(231,76,60,0.92)"
        : "rgba(243,156,18,0.92)"
      : "rgba(0,0,0,0.55)"};
  box-shadow: ${({ $isMyTurn, $urgent }) =>
    $isMyTurn
      ? $urgent
        ? "0 0 16px rgba(231,76,60,0.7)"
        : "0 0 14px rgba(243,156,18,0.55)"
      : "none"};
  transition: background 0.3s, box-shadow 0.3s;
  pointer-events: none;
`;

const TimerCount = styled.div<{ $urgent: boolean; $blink: boolean }>`
  font-size: ${({ $urgent }) => ($urgent ? "2rem" : "1.6rem")};
  font-weight: bold;
  color: ${({ $urgent, $blink }) =>
    $urgent ? ($blink ? "#ffe066" : "#fff") : "#fff"};
  line-height: 1;
  transition: font-size 0.2s;
`;

const TimerBarWrap = styled.div`
  width: 120px;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
`;

const TimerBarFill = styled.div<{ $pct: number; $urgent: boolean }>`
  width: ${({ $pct }) => $pct}%;
  height: 100%;
  background: ${({ $urgent }) =>
    $urgent ? "#ffe066" : "rgba(255,255,255,0.85)"};
  transition: width 0.9s linear, background 0.3s;
`;

const TimerLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
`;

// 플레이어 앞에 놓이는 트릭 카드 슬롯
const TrickCardSlot = styled.div<{ $totalPlayers: number; $seatIndex: number }>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 15;
  pointer-events: none;

  ${({ $totalPlayers, $seatIndex }) => {
    const pos = getSeatPosition($totalPlayers, $seatIndex);
    if (pos.bottom === "0" && pos.left === "50%") {
      return `bottom: calc(100% + 36px); left: 50%; transform: translateX(-50%);`;
    }
    if (pos.top === "0" && pos.left === "50%") {
      return `top: calc(100% + 36px); left: 50%; transform: translateX(-50%);`;
    }
    if (pos.left === "0") {
      return `left: calc(100% + 36px); top: 50%; transform: translateY(-50%);`;
    }
    if (pos.right === "0") {
      return `right: calc(100% + 36px); top: 50%; transform: translateY(-50%);`;
    }
    return `bottom: calc(100% + 36px); left: 50%; transform: translateX(-50%);`;
  }}
`;

// 순번 뱃지
const OrderBadge = styled.div`
  position: absolute;
  top: -8px;
  left: -8px;
  width: 16px;
  height: 16px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  font-size: 0.6rem;
  color: #bdc3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

// 스컬킹 카드 (트릭 + 손패 공용)
const SkCard = styled.div<{
  $type: string;
  $selectable?: boolean;
  $selected?: boolean;
  $small?: boolean;
  $disabled?: boolean;
}>`
  position: relative;
  width: ${({ $small }) => ($small ? "46px" : "56px")};
  height: ${({ $small }) => ($small ? "64px" : "80px")};
  border-radius: 5px;
  border: 2px solid
    ${({ $selected }) => ($selected ? "#f1c40f" : "rgba(255,255,255,0.25)")};
  background: ${({ $type }) => SKULKING_SUIT_COLORS[$type] ?? "#2c3e50"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${({ $selectable, $disabled }) => ($disabled ? "not-allowed" : $selectable ? "pointer" : "default")};
  transform: ${({ $selected }) => ($selected ? "translateY(-10px)" : "none")};
  transition:
    transform 0.15s,
    border-color 0.15s,
    opacity 0.15s;
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};

  &:hover {
    ${({ $selectable, $disabled }) =>
      $selectable && !$disabled && "transform: translateY(-10px); border-color: #f1c40f;"}
  }

  @media (max-width: 768px) {
    width: ${({ $small }) => ($small ? "36px" : "46px")};
    height: ${({ $small }) => ($small ? "50px" : "64px")};
  }
`;

const SkCardLabel = styled.div<{ $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? "1rem" : "1.2rem")};
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
`;

const SkCardValue = styled.div<{ $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? "0.65rem" : "0.75rem")};
  color: rgba(255, 255, 255, 0.75);
`;

// 비드 모달 오버레이
const BidOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
`;

const BidModal = styled.div`
  background: #1a1a2e;
  border: 2px solid #f39c12;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(92vw, 480px);
  max-height: 90vh;
  overflow-y: auto;
`;

const BidTitle = styled.div`
  color: #f39c12;
  font-size: 0.85rem;
  font-weight: bold;
  text-align: center;
`;

const BidButtons = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
`;

const BidButton = styled.button<{ $selected?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid ${({ $selected }) => ($selected ? "#f39c12" : "#2c3e50")};
  background: ${({ $selected }) => ($selected ? "#f39c12" : "#1a1a2e")};
  color: ${({ $selected }) => ($selected ? "#1a1a2e" : "#ecf0f1")};
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  &:hover {
    border-color: #f39c12;
  }

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
`;

const BidConfirmButton = styled.button`
  padding: 6px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const ConfirmCardButton = styled.button`
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  z-index: 20;
  white-space: nowrap;

  @media (max-width: 768px) {
    bottom: 110px;
    font-size: 0.8rem;
    padding: 6px 18px;
  }
`;

// Tigress 선언 모달
const TigressOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
`;

const TigressModal = styled.div`
  background: #1a1a2e;
  border: 2px solid #e67e22;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  color: #ecf0f1;
`;

const TigressBtn = styled.button<{ $type: "escape" | "pirate" }>`
  padding: 10px 24px;
  margin: 0 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  background: ${({ $type }) => ($type === "escape" ? "#95a5a6" : "#e74c3c")};
  color: white;
`;

// 플레이어 정보 뱃지 (아바타 아래 / 비드·트릭·점수)
const PlayerInfoBadge = styled.div`
  font-size: 0.78rem;
  color: #bdc3c7;
  text-align: left;
  white-space: nowrap;
`;

// ── 인터페이스 ─────────────────────────────────────────────────

interface Props {
  round: number;
  phase: "bid" | "play" | null;
  players: SkulkingPlayer[];
  myHand: Card[];
  playerHands: PlayerHand[];
  currentTrick: TrickEntry[];
  currentBidPlayerId: string | null;
  currentPlayerId: string | null;
  myPlayerId: string;
  isHost: boolean;
  memberCount: number;
  gameStarted: boolean;
  gameOver: boolean;
  bids: Record<string, number>;
  tricks: Record<string, number>;
  scores: Record<string, number>;
  onStartGame: () => void;
  onBid: (bid: number) => void;
  onPlayCard: (
    cardIndex: number,
    tigressDeclared?: "escape" | "pirate",
  ) => void;
  roundEndCountdown: number | null;
  trickWinnerId: string | null;
  // 선뽑기
  isFirstDraw: boolean;
  myDrawnNumber: number | null;
  firstDrawResults: Record<string, number>;
  firstDrawFinished: boolean;
  firstDrawWinnerId: string | null;
  firstDrawWinnerNickname: string | null;
  firstDrawCount: number;
  onDrawFirstCard: () => void;
  onKickPlayer?: (targetPlayerId: string) => void;
}

export default function SkulkingGameBoard({
  round,
  phase,
  players,
  myHand,
  playerHands,
  currentTrick,
  currentBidPlayerId,
  currentPlayerId,
  myPlayerId,
  isHost,
  memberCount,
  gameStarted,
  gameOver,
  bids,
  tricks,
  scores,
  roundEndCountdown,
  trickWinnerId,
  isFirstDraw,
  myDrawnNumber,
  firstDrawResults,
  firstDrawFinished,
  firstDrawWinnerId,
  firstDrawWinnerNickname,
  firstDrawCount,
  onDrawFirstCard,
  onStartGame,
  onBid,
  onPlayCard,
  onKickPlayer,
}: Props) {
  const [selectedBid, setSelectedBid] = React.useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = React.useState<
    number | null
  >(null);
  const [tigressPending, setTigressPending] = React.useState<number | null>(
    null,
  );
  const [showStats, setShowStats] = React.useState(false);

  const isMyBidTurn = phase === "bid" && currentBidPlayerId === myPlayerId;
  const isMyPlayTurn = phase === "play" && currentPlayerId === myPlayerId;
  const me = players.find((p) => p.playerId === myPlayerId);

  // Follow suit 제한: 트릭에서 첫 번째로 나온 숫자 수트 카드가 리드 수트
  // (특수카드가 먼저 나왔더라도 이후에 나온 첫 번째 숫자 수트 카드가 리드)
  const leadEntry = currentTrick.find((e) => !isSpecialCard(e.card.type));
  const leadSuit = leadEntry ? leadEntry.card.type : null;
  const hasLeadSuit =
    leadSuit !== null && myHand.some((c) => c.type === leadSuit);
  const isCardDisabled = (card: Card): boolean => {
    if (!isMyPlayTurn) return false;
    if (!hasLeadSuit) return false;
    // 리드 수트 카드거나 특수 카드면 낼 수 있음
    return card.type !== leadSuit && !isSpecialCard(card.type);
  };

  // 턴 타이머 (트릭 플레이 단계에서만 동작)
  const [timeLeft, setTimeLeft] = React.useState(TURN_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phase === "play" && currentPlayerId) {
      setTimeLeft(TURN_TIME);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPlayerId, phase]);

  // 나를 기준으로 상대적 좌석 계산 (GangGameBoard 방식과 동일)
  const myOrder = me?.order ?? 0;
  const totalPlayers = players.length;

  const playerSeats = players.map((player) => {
    const playerOrder = player.order ?? 0;
    const seatIndex = (playerOrder - myOrder + totalPlayers) % totalPlayers;
    return { player, seatIndex };
  });

  const handleCardClick = (index: number) => {
    if (!isMyPlayTurn) return;
    const card = myHand[index];
    if (isCardDisabled(card)) return;
    if (card.type === "sk-tigress") {
      setTigressPending(index);
      return;
    }
    if (selectedCardIndex === index) {
      onPlayCard(index);
      setSelectedCardIndex(null);
    } else {
      setSelectedCardIndex(index);
    }
  };

  const handleConfirmCard = () => {
    if (selectedCardIndex === null) return;
    onPlayCard(selectedCardIndex);
    setSelectedCardIndex(null);
  };

  const handleTigressDeclare = (decl: "escape" | "pirate") => {
    if (tigressPending === null) return;
    onPlayCard(tigressPending, decl);
    setTigressPending(null);
  };

  const handleBidConfirm = () => {
    if (selectedBid === null) return;
    onBid(selectedBid);
    setSelectedBid(null);
  };

  return (
    <GameBoard>
      {/* 게임판 중앙: 라운드 + 페이즈 뱃지 (상단 고정) + 타이머 (중앙 고정) */}
      {gameStarted && (
        <BoardCenterBadge>
          <RoundBadge>라운드 {round} / 10</RoundBadge>
          {phase && (
            <PhaseBadge $phase={phase}>
              {phase === "bid" ? "비드 단계" : "트릭 플레이"}
            </PhaseBadge>
          )}
          {roundEndCountdown !== null && (
            <>
              <TimerLabel style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                다음 라운드까지
              </TimerLabel>
              <TimerCount $urgent={roundEndCountdown <= 2} $blink={roundEndCountdown % 2 === 0}>
                {roundEndCountdown}
              </TimerCount>
            </>
          )}
          {roundEndCountdown === null && phase === "bid" && (
            <TimerLabel style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}>
              {Object.keys(bids).length} / {totalPlayers} 명 선택 완료
            </TimerLabel>
          )}
          {phase === "play" && currentPlayerId && (
            <TimerBox $isMyTurn={isMyPlayTurn} $urgent={timeLeft <= 5}>
              <TimerLabel>
                {isMyPlayTurn ? (
                  <span style={{ color: "#ffe066", fontWeight: "bold" }}>내 차례</span>
                ) : (
                  <>
                    <span style={{ color: "#f39c12", fontWeight: "bold" }}>
                      {players.find((p) => p.playerId === currentPlayerId)?.nickname ?? ""}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>의 차례</span>
                  </>
                )}
              </TimerLabel>
              <TimerCount $urgent={timeLeft <= 5} $blink={timeLeft % 2 === 0}>
                {timeLeft}
              </TimerCount>
              <TimerBarWrap>
                <TimerBarFill $pct={(timeLeft / TURN_TIME) * 100} $urgent={timeLeft <= 5} />
              </TimerBarWrap>
            </TimerBox>
          )}
        </BoardCenterBadge>
      )}

      {/* 게임 시작 전 */}
      {!gameStarted && !gameOver && !isFirstDraw && (
        <StartGameButton
          $disabled={isHost ? memberCount < 2 : true}
          onClick={isHost ? onStartGame : undefined}
          disabled={isHost ? memberCount < 2 : true}
        >
          {isHost ? (
            <>
              게임 시작
              {memberCount < 2 && (
                <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  ({memberCount}/2명)
                </div>
              )}
            </>
          ) : (
            <>
              게임 시작 대기 중
              <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                ({memberCount}명)
              </div>
            </>
          )}
        </StartGameButton>
      )}

      {/* 선뽑기 오버레이 */}
      {isFirstDraw && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "20px", zIndex: 50,
          background: "rgba(0,0,0,0.72)", borderRadius: "12px",
        }}>
          <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold" }}>선뽑기</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
            가장 높은 숫자를 뽑은 플레이어가 먼저 비드합니다
          </div>

          {!firstDrawFinished ? (
            <>
              {myDrawnNumber === null ? (
                <div
                  onClick={onDrawFirstCard}
                  style={{
                    width: "70px", height: "100px",
                    background: "#1a4d8c",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "8px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.6rem",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                    transition: "transform 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.3)";
                  }}
                >
                  🂠
                </div>
              ) : (
                <div style={{
                  width: "70px", height: "100px",
                  background: "#fff",
                  border: "3px solid #f39c12",
                  borderRadius: "8px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(243,156,18,0.5)",
                }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: "bold", color: "#e67e22" }}>
                    {myDrawnNumber}
                  </span>
                </div>
              )}
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem" }}>
                {firstDrawCount} / {memberCount} 명 완료
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
              <div style={{ color: "#f39c12", fontSize: "1.1rem", fontWeight: "bold" }}>
                🎉 {firstDrawWinnerNickname}님이 선!
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {players.map((p) => {
                  const num = firstDrawResults[p.playerId];
                  const isFirst = p.playerId === firstDrawWinnerId;
                  return (
                    <div key={p.playerId} style={{
                      background: isFirst ? "rgba(243,156,18,0.2)" : "rgba(255,255,255,0.08)",
                      border: isFirst ? "2px solid #f39c12" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px", padding: "8px 14px",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: "4px",
                    }}>
                      <span style={{ color: "#fff", fontSize: "0.8rem" }}>{p.nickname}</span>
                      <span style={{ color: isFirst ? "#f39c12" : "#ccc", fontSize: "1.5rem", fontWeight: "bold" }}>
                        {num ?? "?"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
                곧 게임이 시작됩니다...
              </div>
            </div>
          )}
        </div>
      )}

      {/* 플레이어 원형 배치 */}
      <PlayerCircle>
        {playerSeats.map(({ player, seatIndex }) => {
          const handInfo = playerHands.find(
            (h) => h.nickname === player.nickname,
          );
          const cardCount = handInfo?.cardCount ?? player.cardCount ?? 0;
          const pos = getSeatPosition(players.length, seatIndex);
          const isVertical = pos.left === "0" || pos.right === "0";
          const isLeftSide = pos.left === "0";
          const isRightSide = pos.right === "0";
          const bidVal = bids[player.playerId];
          const trickVal = tricks[player.playerId] ?? 0;
          const scoreVal = scores[player.playerId] ?? player.score ?? 0;
          const trickEntry = currentTrick.find(
            (e) => e.playerId === player.playerId,
          );

          return (
            <PlayerSeat
              key={player.playerId}
              $totalPlayers={players.length}
              $seatIndex={seatIndex}
              $isMe={player.isMe}
            >
              {/* 위아래: [점수] [아바타] [비드]  /  좌우: [비드] [아바타] [점수] */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isVertical ? "column" : "row",
                  alignItems: isVertical ? (isLeftSide ? "flex-start" : "flex-end") : "center",
                  gap: "5px",
                  marginLeft: isLeftSide ? "5px" : undefined,
                  marginRight: isRightSide ? "5px" : undefined,
                }}
              >
                {/* 첫 번째 칸: 위아래=점수(왼쪽), 좌우=비드(위) */}
                {gameStarted && (
                  <PlayerInfoBadge>
                    {isVertical
                      ? `(${bidVal !== undefined ? bidVal : "?"}) / ${round}`
                      : `${phase === "play" ? `트릭 ${trickVal} | ` : ""}${scoreVal}점`}
                  </PlayerInfoBadge>
                )}

                <PlayerAvatarWrapper>
                  <PlayerAvatar
                    $isMe={player.isMe}
                    $colorIndex={seatIndex}
                    $isVertical={isVertical}
                    style={{
                      outline:
                        player.playerId === currentPlayerId ||
                        player.playerId === currentBidPlayerId
                          ? "2px solid #f39c12"
                          : undefined,
                    }}
                  >
                    {player.nickname}
                  </PlayerAvatar>
                  <OrderBadge>{player.order + 1}</OrderBadge>
                  {isHost && !gameStarted && !player.isMe && onKickPlayer && (
                    <KickButton
                      onClick={() => onKickPlayer(player.playerId)}
                      title="강퇴"
                    >
                      ✕
                    </KickButton>
                  )}
                </PlayerAvatarWrapper>

                {/* 두 번째 칸: 위아래=비드(오른쪽), 좌우=점수(아래) */}
                {gameStarted && (
                  <PlayerInfoBadge>
                    {isVertical
                      ? `${phase === "play" ? `트릭 ${trickVal} | ` : ""}${scoreVal}점`
                      : `(${bidVal !== undefined ? bidVal : "?"}) / ${round}`}
                  </PlayerInfoBadge>
                )}
              </div>

              {/* 플레이어 앞에 놓인 트릭 카드 */}
              {trickEntry && (() => {
                const isWinner = trickWinnerId === player.playerId;
                const isLeader = currentTrick.length > 0 && currentTrick[0].playerId === player.playerId;
                return (
                  <TrickCardSlot
                    $totalPlayers={players.length}
                    $seatIndex={seatIndex}
                  >
                    {isWinner && (
                      <div style={{ fontSize: "1.1rem", lineHeight: 1, marginBottom: "2px" }}>👑</div>
                    )}
                    <SkCard
                      $type={trickEntry.card.type}
                      $small
                      style={{
                        outline: isWinner
                          ? "2px solid #f1c40f"
                          : isLeader
                          ? "2px solid rgba(255,255,255,0.6)"
                          : undefined,
                        boxShadow: isWinner
                          ? "0 0 10px rgba(241,196,15,0.7)"
                          : undefined,
                      }}
                    >
                      {isLeader && !isWinner && (
                        <div style={{ position: "absolute", top: "-7px", right: "-7px", fontSize: "0.6rem", background: "rgba(255,255,255,0.85)", color: "#1a1a2e", borderRadius: "50%", width: "14px", height: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                          1
                        </div>
                      )}
                      <SkCardLabel $small>
                        {SKULKING_SUIT_LABELS[trickEntry.card.type] ?? "?"}
                      </SkCardLabel>
                      {!isSpecialCard(trickEntry.card.type) && (
                        <SkCardValue $small>{trickEntry.card.value}</SkCardValue>
                      )}
                      {trickEntry.tigressDeclared && (
                        <SkCardValue $small style={{ fontSize: "0.6rem" }}>
                          {trickEntry.tigressDeclared === "escape" ? "E" : "P"}
                        </SkCardValue>
                      )}
                    </SkCard>
                  </TrickCardSlot>
                );
              })()}

              {/* 다른 플레이어 손패 (뒷면) */}
              {!player.isMe && cardCount > 0 && (
                <OtherPlayerHand
                  $totalPlayers={players.length}
                  $seatIndex={seatIndex}
                >
                  {Array.from({ length: Math.min(cardCount, 10) }).map(
                    (_, i) => (
                      <OtherPlayerCard key={i} $vertical={isVertical}>
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#1a4d8c",
                            borderRadius: "2px",
                          }}
                        />
                      </OtherPlayerCard>
                    ),
                  )}
                </OtherPlayerHand>
              )}
            </PlayerSeat>
          );
        })}
      </PlayerCircle>

      {/* 덱 표시 (좌측 하단) */}
      {gameStarted && (
        <DeckDisplay onClick={() => setShowStats(true)}>
          <DeckCard />
          <DeckLabel>통계</DeckLabel>
        </DeckDisplay>
      )}

      {/* 라운드 통계 모달 */}
      {showStats && (() => {
        const COLORS = ["#646cff","#e85d75","#4caf50","#ff9800","#9c27b0","#00bcd4"];
        const sortedPlayers = [...players].sort((a, b) => a.order - b.order);
        const seatIndexMap = new Map(playerSeats.map(({ player, seatIndex }) => [player.playerId, seatIndex]));
        return (
          <StatsOverlay onClick={() => setShowStats(false)}>
            <StatsModal onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <StatsTitle style={{ margin: 0 }}>라운드 통계</StatsTitle>
                <button
                  onClick={() => setShowStats(false)}
                  style={{ background: "none", border: "none", color: "#7f8c8d", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, padding: "0 2px" }}
                >✕</button>
              </div>
              <StatsTable>
                <thead>
                  <tr>
                    <th>R</th>
                    {sortedPlayers.map((p) => {
                      const si = seatIndexMap.get(p.playerId) ?? 0;
                      return (
                        <th key={p.playerId} style={{ color: COLORS[si % COLORS.length] }}>
                          {p.nickname[0]}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 10 }, (_, i) => {
                    const r = i + 1;
                    const isCurrent = r === round;
                    const isFuture = r > round;
                    return (
                      <tr key={r} style={{ background: isCurrent ? "rgba(231,76,60,0.1)" : undefined, opacity: isFuture ? 0.3 : 1 }}>
                        <td style={{ color: isCurrent ? "#e74c3c" : "#7f8c8d", fontWeight: 600 }}>{r}</td>
                        {sortedPlayers.map((p) => {
                          if (isFuture) {
                            return <td key={p.playerId} style={{ color: "#2c3e50" }}>-</td>;
                          }
                          if (isCurrent) {
                            const bid = bids[p.playerId];
                            const trick = tricks[p.playerId] ?? 0;
                            const score = scores[p.playerId] ?? p.score ?? 0;
                            return (
                              <td key={p.playerId}>
                                <div>({bid !== undefined ? bid : "?"}) / {trick}</div>
                                <div style={{ borderTop: "1px solid #2c3e50", marginTop: "2px", paddingTop: "2px" }}>
                                  {score}
                                </div>
                              </td>
                            );
                          } else {
                            const rs = p.roundScores?.[i];
                            return (
                              <td key={p.playerId} style={{ color: "#7f8c8d" }}>
                                {rs !== undefined ? rs : "-"}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: "2px solid #2c3e50" }}>
                    <td style={{ color: "#ecf0f1", fontWeight: 700 }}>합계</td>
                    {sortedPlayers.map((p) => {
                      const total = scores[p.playerId] ?? p.score ?? 0;
                      return (
                        <td key={p.playerId} style={{ fontWeight: 700, color: "#f1c40f" }}>
                          {total}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </StatsTable>
            </StatsModal>
          </StatsOverlay>
        );
      })()}

      {/* 내 손패 - 내가 이미 카드를 낸 경우(currentTrick에 내 카드 존재) 숨김 */}
      {gameStarted && myHand.length > 0 && !currentTrick.some((e) => e.playerId === myPlayerId) && (
        <MyHandArea>
          {myHand.map((card, i) => {
            const disabled = isCardDisabled(card);
            return (
              <HandCard
                key={card.name}
                onClick={() => handleCardClick(i)}
                style={{ cursor: isMyPlayTurn && !disabled ? "pointer" : disabled ? "not-allowed" : "default" }}
                title={`${SKULKING_SUIT_NAMES[card.type] ?? card.type}${!isSpecialCard(card.type) ? ` ${card.value}` : ""}`}
              >
                <SkCard
                  $type={card.type}
                  $selectable={isMyPlayTurn && !disabled}
                  $selected={selectedCardIndex === i}
                  $disabled={disabled}
                >
                  <SkCardLabel>
                    {SKULKING_SUIT_LABELS[card.type] ?? "?"}
                  </SkCardLabel>
                  {!isSpecialCard(card.type) && (
                    <SkCardValue>{card.value}</SkCardValue>
                  )}
                </SkCard>
              </HandCard>
            );
          })}
        </MyHandArea>
      )}

      {/* 카드 확정 버튼 */}
      {isMyPlayTurn &&
        selectedCardIndex !== null &&
        myHand[selectedCardIndex]?.type !== "sk-tigress" &&
        !currentTrick.some((e) => e.playerId === myPlayerId) && (
          <ConfirmCardButton onClick={handleConfirmCard}>
            카드 내기
          </ConfirmCardButton>
        )}

      {/* 비드 입력 모달 */}
      {isMyBidTurn && me?.bid === undefined && (
        <BidOverlay>
          <BidModal onClick={(e) => e.stopPropagation()}>
            <BidTitle>이번 라운드에서 딸 트릭 수를 선언하세요</BidTitle>
            {/* 내 손패 카드 미리보기 */}
            {myHand.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {myHand.map((card) => (
                  <SkCard key={card.name} $type={card.type} $small title={`${SKULKING_SUIT_NAMES[card.type] ?? card.type}${!isSpecialCard(card.type) ? ` ${card.value}` : ""}`}>
                    <SkCardLabel $small>{SKULKING_SUIT_LABELS[card.type] ?? "?"}</SkCardLabel>
                    {!isSpecialCard(card.type) && (
                      <SkCardValue $small>{card.value}</SkCardValue>
                    )}
                  </SkCard>
                ))}
              </div>
            )}
            <BidButtons>
              {Array.from({ length: round + 1 }, (_, i) => i).map((n) => (
                <BidButton
                  key={n}
                  $selected={selectedBid === n}
                  onClick={() => setSelectedBid(n)}
                >
                  {n}
                </BidButton>
              ))}
            </BidButtons>
            <BidConfirmButton
              onClick={handleBidConfirm}
              disabled={selectedBid === null}
            >
              비드 확정
            </BidConfirmButton>
          </BidModal>
        </BidOverlay>
      )}

      {/* Tigress 선언 모달 */}
      {tigressPending !== null && (
        <TigressOverlay>
          <TigressModal>
            <div style={{ marginBottom: 16, fontSize: "1rem" }}>
              Tigress를 어떻게 사용할까요?
            </div>
            <TigressBtn
              $type="escape"
              onClick={() => handleTigressDeclare("escape")}
            >
              🏳️ 탈출
            </TigressBtn>
            <TigressBtn
              $type="pirate"
              onClick={() => handleTigressDeclare("pirate")}
            >
              ⚔️ 해적
            </TigressBtn>
          </TigressModal>
        </TigressOverlay>
      )}
    </GameBoard>
  );
}
