import React from "react";
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

const TopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  z-index: 20;
  flex-wrap: wrap;
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

const TurnLabel = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 0.8rem;
`;

// 트릭 영역 (보드 중앙)
const TrickArea = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  z-index: 5;
  max-width: 60%;
`;

const TrickCardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
`;

const TrickPlayerName = styled.span`
  font-size: 0.65rem;
  color: #bdc3c7;
`;

// 스컬킹 카드 (트릭 + 손패 공용)
const SkCard = styled.div<{
  $type: string;
  $selectable?: boolean;
  $selected?: boolean;
  $small?: boolean;
}>`
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
  cursor: ${({ $selectable }) => ($selectable ? "pointer" : "default")};
  transform: ${({ $selected }) => ($selected ? "translateY(-10px)" : "none")};
  transition: transform 0.15s, border-color 0.15s;

  &:hover {
    ${({ $selectable }) =>
      $selectable && "transform: translateY(-10px); border-color: #f1c40f;"}
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

// 비드 입력 영역 (보드 하단 중앙)
const BidArea = styled.div`
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 20;
  white-space: nowrap;

  @media (max-width: 768px) {
    bottom: 110px;
  }
`;

const BidTitle = styled.div`
  color: #f39c12;
  font-size: 0.85rem;
  font-weight: bold;
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
  background: ${({ $type }) =>
    $type === "escape" ? "#95a5a6" : "#e74c3c"};
  color: white;
`;

// 플레이어 정보 뱃지 (아바타 아래 / 비드·트릭·점수)
const PlayerInfoBadge = styled.div`
  font-size: 0.65rem;
  color: #bdc3c7;
  text-align: center;
  margin-top: 3px;
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
  onPlayCard: (cardIndex: number, tigressDeclared?: "escape" | "pirate") => void;
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
  onStartGame,
  onBid,
  onPlayCard,
  onKickPlayer,
}: Props) {
  const [selectedBid, setSelectedBid] = React.useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = React.useState<number | null>(null);
  const [tigressPending, setTigressPending] = React.useState<number | null>(null);

  const isMyBidTurn = phase === "bid" && currentBidPlayerId === myPlayerId;
  const isMyPlayTurn = phase === "play" && currentPlayerId === myPlayerId;
  const me = players.find((p) => p.playerId === myPlayerId);

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
      {/* 상단 바: 라운드·페이즈·차례 표시 */}
      {gameStarted && (
        <TopBar>
          <RoundBadge>라운드 {round} / 10</RoundBadge>
          {phase && (
            <PhaseBadge $phase={phase}>
              {phase === "bid" ? "비드 단계" : "트릭 플레이"}
            </PhaseBadge>
          )}
          {phase === "bid" && currentBidPlayerId && (
            <TurnLabel $color="#f39c12">
              비드 차례:{" "}
              {players.find((p) => p.playerId === currentBidPlayerId)?.nickname ?? ""}
            </TurnLabel>
          )}
          {phase === "play" && currentPlayerId && (
            <TurnLabel $color="#2ecc71">
              플레이 차례:{" "}
              {players.find((p) => p.playerId === currentPlayerId)?.nickname ?? ""}
            </TurnLabel>
          )}
        </TopBar>
      )}

      {/* 게임 시작 전 */}
      {!gameStarted && !gameOver && (
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

      {/* 트릭 영역 (보드 중앙) */}
      {gameStarted && currentTrick.length > 0 && (
        <TrickArea>
          {currentTrick.map((entry) => (
            <TrickCardWrapper key={entry.playerId}>
              <TrickPlayerName>{entry.nickname}</TrickPlayerName>
              <SkCard $type={entry.card.type} $small>
                <SkCardLabel $small>
                  {SKULKING_SUIT_LABELS[entry.card.type] ?? "?"}
                </SkCardLabel>
                {!isSpecialCard(entry.card.type) && (
                  <SkCardValue $small>{entry.card.value}</SkCardValue>
                )}
                {entry.tigressDeclared && (
                  <SkCardValue $small style={{ fontSize: "0.6rem" }}>
                    {entry.tigressDeclared === "escape" ? "E" : "P"}
                  </SkCardValue>
                )}
              </SkCard>
            </TrickCardWrapper>
          ))}
        </TrickArea>
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
          const bidVal = bids[player.playerId];
          const trickVal = tricks[player.playerId] ?? 0;
          const scoreVal = scores[player.playerId] ?? player.score ?? 0;

          return (
            <PlayerSeat
              key={player.playerId}
              $totalPlayers={players.length}
              $seatIndex={seatIndex}
              $isMe={player.isMe}
            >
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
                {isHost && !gameStarted && !player.isMe && onKickPlayer && (
                  <KickButton
                    onClick={() => onKickPlayer(player.playerId)}
                    title="강퇴"
                  >
                    ✕
                  </KickButton>
                )}
              </PlayerAvatarWrapper>

              {/* 비드·트릭·점수 정보 뱃지 */}
              {gameStarted && (
                <PlayerInfoBadge>
                  {bidVal !== undefined ? `비드 ${bidVal}` : "비드 ?"}
                  {phase === "play" && ` | 트릭 ${trickVal}`}
                  {` | ${scoreVal}점`}
                </PlayerInfoBadge>
              )}

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

      {/* 내 손패 */}
      {gameStarted && myHand.length > 0 && (
        <MyHandArea>
          {myHand.map((card, i) => (
            <HandCard
              key={card.name}
              onClick={() => handleCardClick(i)}
              style={{ cursor: isMyPlayTurn ? "pointer" : "default" }}
              title={`${SKULKING_SUIT_NAMES[card.type] ?? card.type}${!isSpecialCard(card.type) ? ` ${card.value}` : ""}`}
            >
              <SkCard
                $type={card.type}
                $selectable={isMyPlayTurn}
                $selected={selectedCardIndex === i}
              >
                <SkCardLabel>
                  {SKULKING_SUIT_LABELS[card.type] ?? "?"}
                </SkCardLabel>
                {!isSpecialCard(card.type) && (
                  <SkCardValue>{card.value}</SkCardValue>
                )}
              </SkCard>
            </HandCard>
          ))}
        </MyHandArea>
      )}

      {/* 카드 확정 버튼 */}
      {isMyPlayTurn &&
        selectedCardIndex !== null &&
        myHand[selectedCardIndex]?.type !== "sk-tigress" && (
          <ConfirmCardButton onClick={handleConfirmCard}>
            카드 내기
          </ConfirmCardButton>
        )}

      {/* 비드 입력 */}
      {isMyBidTurn && me?.bid === undefined && (
        <BidArea>
          <BidTitle>이번 라운드에서 딸 트릭 수를 선언하세요</BidTitle>
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
        </BidArea>
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
              E 탈출 (Escape)
            </TigressBtn>
            <TigressBtn
              $type="pirate"
              onClick={() => handleTigressDeclare("pirate")}
            >
              P 해적 (Pirate)
            </TigressBtn>
          </TigressModal>
        </TigressOverlay>
      )}
    </GameBoard>
  );
}
