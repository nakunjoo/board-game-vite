import React from "react";
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
import {
  DeckDisplay,
  DeckCard,
  DeckLabel,
  TrickCardSlot,
  OrderBadge,
  PlayerInfoBadge,
  ConfirmCardButton,
} from "../../styles/game/skulking/board";
import { SkCard, SkCardLabel, SkCardValue } from "../../styles/game/skulking/card";
import type { Card, PlayerHand } from "../../types/game";
import type { TrickEntry, SkulkingPlayer } from "./types";
import {
  SKULKING_SUIT_LABELS,
  SKULKING_SUIT_NAMES,
  isSpecialCard,
} from "../../utils/games/skulking";
import SkulkingBoardCenter from "./game/SkulkingBoardCenter";
import SkulkingBidModal from "./game/SkulkingBidModal";
import SkulkingTigressModal from "./game/SkulkingTigressModal";
import SkulkingFirstDrawOverlay from "./game/SkulkingFirstDrawOverlay";
import SkulkingStatsModal from "./game/SkulkingStatsModal";

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
  trickLeadPlayerId: string | null;
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
  roundHistory: Array<{ round: number; bids: Record<string, number>; tricks: Record<string, number> }>;
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
  trickLeadPlayerId,
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
  roundHistory,
}: Props) {
  const [selectedCardIndex, setSelectedCardIndex] = React.useState<number | null>(null);
  const [tigressPending, setTigressPending] = React.useState<number | null>(null);
  const [showStats, setShowStats] = React.useState(false);

  const isMyBidTurn = phase === "bid" && !(myPlayerId in bids);
  const isMyPlayTurn = phase === "play" && currentPlayerId === myPlayerId;

  const me = players.find((p) => p.playerId === myPlayerId);

  const myOrder = me?.order ?? 0;
  const totalPlayers = players.length;
  const playerSeats = players.map((player) => {
    const seatIndex = ((player.order ?? 0) - myOrder + totalPlayers) % totalPlayers;
    return { player, seatIndex };
  });

  // Follow suit 제한
  const leadEntry = currentTrick.find((e) => !isSpecialCard(e.card.type));
  const leadSuit = leadEntry ? leadEntry.card.type : null;
  const hasLeadSuit = leadSuit !== null && myHand.some((c) => c.type === leadSuit);
  const isCardDisabled = (card: Card): boolean => {
    if (!isMyPlayTurn) return false;
    if (!hasLeadSuit) return false;
    return card.type !== leadSuit && !isSpecialCard(card.type);
  };

  const handleCardClick = (index: number) => {
    const card = myHand[index];
    if (!isMyPlayTurn) {
      setSelectedCardIndex((prev) => (prev === index ? null : index));
      return;
    }
    if (isCardDisabled(card)) return;
    if (card.type === "sk-tigress") {
      setTigressPending(index);
      return;
    }
    setSelectedCardIndex((prev) => (prev === index ? null : index));
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

  return (
    <GameBoard>
      {/* 게임판 중앙 */}
      {gameStarted && (
        <SkulkingBoardCenter
          round={round}
          phase={phase}
          roundEndCountdown={roundEndCountdown}
          bids={bids}
          totalPlayers={totalPlayers}
          currentPlayerId={currentPlayerId}
          isMyPlayTurn={isMyPlayTurn}
          players={players}
          currentTrick={currentTrick}
        />
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
        <SkulkingFirstDrawOverlay
          players={players}
          myDrawnNumber={myDrawnNumber}
          firstDrawResults={firstDrawResults}
          firstDrawFinished={firstDrawFinished}
          firstDrawWinnerId={firstDrawWinnerId}
          firstDrawWinnerNickname={firstDrawWinnerNickname}
          firstDrawCount={firstDrawCount}
          memberCount={memberCount}
          onDrawFirstCard={onDrawFirstCard}
        />
      )}

      {/* 플레이어 원형 배치 */}
      <PlayerCircle>
        {playerSeats.map(({ player, seatIndex }) => {
          const handInfo = playerHands.find((h) => h.nickname === player.nickname);
          const cardCount = handInfo?.cardCount ?? player.cardCount ?? 0;
          const pos = getSeatPosition(players.length, seatIndex);
          const isVertical = pos.left === "0" || pos.right === "0";
          const isLeftSide = pos.left === "0";
          const isRightSide = pos.right === "0";
          const bidVal = bids[player.playerId];
          const trickVal = tricks[player.playerId] ?? 0;
          const scoreVal = scores[player.playerId] ?? player.score ?? 0;
          const trickEntry = currentTrick.find((e) => e.playerId === player.playerId);

          return (
            <PlayerSeat
              key={player.playerId}
              $totalPlayers={players.length}
              $seatIndex={seatIndex}
              $isMe={player.isMe}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: isVertical ? "column" : "row",
                  alignItems: isVertical
                    ? isLeftSide ? "flex-start" : "flex-end"
                    : "center",
                  gap: "5px",
                  marginLeft: isLeftSide ? "5px" : undefined,
                  marginRight: isRightSide ? "5px" : undefined,
                }}
              >
                {gameStarted && (
                  <PlayerInfoBadge>
                    {isVertical
                      ? `(${bidVal !== undefined ? bidVal : "?"}) / ${trickVal}`
                      : `${scoreVal}점`}
                  </PlayerInfoBadge>
                )}

                <PlayerAvatarWrapper>
                  <PlayerAvatar
                    $isMe={player.isMe}
                    $colorIndex={seatIndex}
                    $isVertical={isVertical}
                  >
                    {player.nickname}
                  </PlayerAvatar>
                  <OrderBadge
                    $isLead={trickLeadPlayerId === player.playerId}
                    $isActive={
                      player.playerId === currentPlayerId ||
                      player.playerId === currentBidPlayerId
                    }
                  >
                    {trickLeadPlayerId === player.playerId ? "⚓" : player.order + 1}
                  </OrderBadge>
                  {isHost && !gameStarted && !player.isMe && onKickPlayer && (
                    <KickButton
                      onClick={() => onKickPlayer(player.playerId)}
                      title="강퇴"
                    >
                      ✕
                    </KickButton>
                  )}
                </PlayerAvatarWrapper>

                {gameStarted && (
                  <PlayerInfoBadge>
                    {isVertical
                      ? `${scoreVal}점`
                      : `(${bidVal !== undefined ? bidVal : "?"}) / ${trickVal}`}
                  </PlayerInfoBadge>
                )}
              </div>

              {/* 트릭 카드 */}
              {trickEntry &&
                (() => {
                  const isWinner = trickWinnerId === player.playerId;
                  const isLeader =
                    currentTrick.length > 0 &&
                    currentTrick[0].playerId === player.playerId;
                  return (
                    <TrickCardSlot
                      $totalPlayers={players.length}
                      $seatIndex={seatIndex}
                    >
                      {isWinner && (
                        <div style={{ fontSize: "1.1rem", lineHeight: 1, marginBottom: "2px" }}>
                          👑
                        </div>
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
                          <div
                            style={{
                              position: "absolute",
                              top: "-7px",
                              right: "-7px",
                              fontSize: "0.6rem",
                              background: "rgba(255,255,255,0.85)",
                              color: "#1a1a2e",
                              borderRadius: "50%",
                              width: "14px",
                              height: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                            }}
                          >
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
                <OtherPlayerHand $totalPlayers={players.length} $seatIndex={seatIndex}>
                  {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
                    <OtherPlayerCard key={i} $vertical={isVertical}>
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#0d0d12",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 6px)",
                          border: "1.5px solid rgba(255,255,255,0.75)",
                          borderRadius: "2px",
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                        }}
                      />
                    </OtherPlayerCard>
                  ))}
                </OtherPlayerHand>
              )}
            </PlayerSeat>
          );
        })}
      </PlayerCircle>

      {/* 덱 (통계 버튼) */}
      {gameStarted && (
        <DeckDisplay onClick={() => setShowStats(true)}>
          <DeckCard />
          <DeckLabel>통계</DeckLabel>
        </DeckDisplay>
      )}

      {/* 라운드 통계 모달 */}
      {showStats && (
        <SkulkingStatsModal
          players={players}
          playerSeats={playerSeats}
          round={round}
          bids={bids}
          tricks={tricks}
          scores={scores}
          roundHistory={roundHistory}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* 내 손패 */}
      {gameStarted &&
        myHand.length > 0 && (
          <MyHandArea>
            {myHand.map((card, i) => {
              const disabled = isCardDisabled(card);
              return (
                <HandCard
                  key={card.name}
                  onClick={() => handleCardClick(i)}
                  style={{
                    cursor: isMyPlayTurn && !disabled
                      ? "pointer"
                      : disabled
                        ? "not-allowed"
                        : "default",
                  }}
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
        myHand[selectedCardIndex]?.type !== "sk-tigress" && (
          <ConfirmCardButton onClick={handleConfirmCard}>
            카드 내기
          </ConfirmCardButton>
        )}

      {/* 비드 입력 모달 */}
      {phase === "bid" && (
        <SkulkingBidModal
          round={round}
          myHand={myHand}
          onBid={onBid}
          submitted={!isMyBidTurn}
          bidCount={Object.keys(bids).length}
          totalPlayers={memberCount}
        />
      )}

      {/* Tigress 선언 모달 */}
      {tigressPending !== null && (
        <SkulkingTigressModal onDeclare={handleTigressDeclare} />
      )}
    </GameBoard>
  );
}
