import { useState } from "react";
import {
  GameBoard,
  PlayerCircle,
  MyHandArea,
  HandCard,
  CardImageWrapper,
  CardLabel,
  StartGameButton,
  OpenCardsArea,
  OpenCard,
  OpenCardImage,
  OpenCardLabel,
  ChipsArea,
  ChipsGrid,
  Chip,
  PlayerChip,
  WinLossIndicators,
  WinLossLight,
  NotificationToast,
  HandRankContainer,
  HandRankDisplay,
  ReadyButton,
  PreviousChips,
  PreviousChip,
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
import type { Card, GameConfig, Player, PlayerHand } from "../../types/game";
import CardDeck from "../CardDeck";
import { getCardImage, getCardName, getCardLabel } from "../../utils/cards";
import { type HandResult } from "../../utils/poker";
import type { ChipData, PreviousChipsData } from "./types";
import GangHandRankModal from "./game/GangHandRankModal";

interface GangGameBoardProps {
  // 게임 상태
  gameStarted: boolean;
  isHost: boolean;
  memberCount: number;
  currentStep: number;

  // 플레이어 정보
  players: Player[];
  playerId: string;
  playerHands: PlayerHand[];

  // 카드 정보
  deck: Card[];
  openCards: Card[];
  myHand: Card[];

  // 칩 정보
  chips: ChipData[];
  previousChips: PreviousChipsData;
  readyPlayers: string[];
  winLossRecord: Record<string, boolean[]>;

  // UI 상태
  notification: string;
  showNotification: boolean;
  myHandRank: HandResult | null;
  isReady: boolean;
  gameOver: boolean;

  // 게임 설정
  gameConfig: GameConfig;
  isAdmin?: boolean;

  // 이벤트 핸들러
  onStartGame: () => void;
  onChipClick: (chipNumber: number) => void;
  onReady: () => void;
  onKickPlayer?: (targetPlayerId: string) => void;
}

export default function GangGameBoard({
  gameStarted,
  isHost,
  memberCount,
  currentStep,
  players,
  playerId,
  playerHands,
  deck,
  openCards,
  myHand,
  chips,
  previousChips,
  readyPlayers,
  winLossRecord,
  notification,
  showNotification,
  myHandRank,
  isReady,
  gameOver,
  gameConfig,
  isAdmin = false,
  onStartGame,
  onChipClick,
  onReady,
  onKickPlayer,
}: GangGameBoardProps) {
  const [showHandRankModal, setShowHandRankModal] = useState(false);

  const totalPlayers = players.length;

  // order 기준 정렬 후 인덱스로 seatIndex 계산 (플레이어 이탈 시 겹침 방지)
  const sortedPlayers = [...players].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const myIndexInSorted = sortedPlayers.findIndex((p) => p.isMe);

  const playerSeats = sortedPlayers.map((player, idx) => {
    const seatIndex = (idx - myIndexInSorted + totalPlayers) % totalPlayers;
    return {
      player,
      seatIndex,
    };
  });

  console.log('[GangGameBoard] gameStarted:', gameStarted, 'gameOver:', gameOver, 'isHost:', isHost);

  return (
    <GameBoard>
      <NotificationToast $show={showNotification}>
        {notification}
      </NotificationToast>
      {!gameStarted ? (
        <>
          {!gameOver && (isHost ? (
            <StartGameButton
              $disabled={!isAdmin && memberCount < 3}
              onClick={onStartGame}
              disabled={!isAdmin && memberCount < 3}
            >
              게임 시작
              {!isAdmin && memberCount < 3 && (
                <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  ({memberCount}/3명)
                </div>
              )}
            </StartGameButton>
          ) : (
            <StartGameButton
              $disabled={true}
              onClick={() => {}}
              disabled={true}
            >
              게임 시작 대기 중
              <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                ({memberCount}/3명)
              </div>
            </StartGameButton>
          ))}
          <CardDeck
            cards={deck}
            cardBack={gameConfig.cardBack ?? ""}
            onClick={() => setShowHandRankModal(true)}
          />
          <WinLossIndicators style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '30px' }}>
            {/* 승리 표시등 3개 */}
            {[0, 1, 2].map((index) => {
              const myRecord = winLossRecord[playerId] || [];
              const winCount = myRecord.filter((r) => r === true).length;
              return (
                <WinLossLight
                  key={`win-${index}`}
                  $isActive={index < winCount}
                  $isWin={true}
                />
              );
            })}
            {/* 패배 표시등 3개 */}
            {[0, 1, 2].map((index) => {
              const myRecord = winLossRecord[playerId] || [];
              const lossCount = myRecord.filter((r) => r === false).length;
              return (
                <WinLossLight
                  key={`loss-${index}`}
                  $isActive={index < lossCount}
                  $isWin={false}
                />
              );
            })}
          </WinLossIndicators>
        </>
      ) : (
        <>
          {openCards.length > 0 && (
            <OpenCardsArea>
              {openCards.map((card, index) => (
                <OpenCard key={`${card.name}-${index}`}>
                  <OpenCardImage>
                    <img
                      src={getCardImage(card)}
                      alt={getCardName(card)}
                    />
                  </OpenCardImage>
                  <OpenCardLabel $suit={card.type}>
                    {getCardLabel(card)}
                  </OpenCardLabel>
                </OpenCard>
              ))}
            </OpenCardsArea>
          )}
          <CardDeck
            cards={deck}
            cardBack={gameConfig.cardBack ?? ""}
            onClick={() => setShowHandRankModal(true)}
          />
          <ChipsArea>
            {chips.length > 0 && (
              <ChipsGrid>
                {chips.map((chip) => {
                  const isLocked = chip.owner
                    ? readyPlayers.includes(chip.owner)
                    : false;
                  return (
                    <Chip
                      key={chip.number}
                      $state={chip.state}
                      $isSelected={chip.owner !== null}
                      $isLocked={isLocked}
                      onClick={() => onChipClick(chip.number)}
                    >
                      {chip.number}
                    </Chip>
                  );
                })}
              </ChipsGrid>
            )}
            <WinLossIndicators>
              {/* 승리 표시등 3개 */}
              {[0, 1, 2].map((index) => {
                const myRecord = winLossRecord[playerId] || [];
                const winCount = myRecord.filter((r) => r === true).length;
                return (
                  <WinLossLight
                    key={`win-${index}`}
                    $isActive={index < winCount}
                    $isWin={true}
                  />
                );
              })}
              {/* 패배 표시등 3개 */}
              {[0, 1, 2].map((index) => {
                const myRecord = winLossRecord[playerId] || [];
                const lossCount = myRecord.filter((r) => r === false).length;
                return (
                  <WinLossLight
                    key={`loss-${index}`}
                    $isActive={index < lossCount}
                    $isWin={false}
                  />
                );
              })}
            </WinLossIndicators>
          </ChipsArea>
        </>
      )}
      <PlayerCircle>
        {playerSeats.map(({ player, seatIndex }) => {
          const handInfo = playerHands.find(
            (h) => h.nickname === player.nickname,
          );
          const cardCount = handInfo?.cardCount ?? 0;
          // 전체 플레이어 수 기준으로 좌석 위치 계산
          const pos = getSeatPosition(players.length, seatIndex);
          const isVertical = pos.left === "0" || pos.right === "0";
          const isLeftSide = pos.left === "0";
          const playerChip = chips.find(
            (c) => c.owner === player.playerId,
          );

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
              {playerChip && (
                <PlayerChip
                  $state={playerChip.state}
                  $isVertical={isVertical}
                >
                  {playerChip.number}
                </PlayerChip>
              )}
              {previousChips[player.playerId] &&
                previousChips[player.playerId].length > 0 && (
                  <PreviousChips
                    $isVertical={isVertical}
                    $isLeftSide={isLeftSide}
                    $chipCount={previousChips[player.playerId].length}
                  >
                    {previousChips[player.playerId].map(
                      (chipNum, idx) => (
                        <PreviousChip key={idx} $state={idx}>
                          {chipNum}
                        </PreviousChip>
                      ),
                    )}
                  </PreviousChips>
                )}
              {!player.isMe && cardCount > 0 && (
                <OtherPlayerHand
                  $totalPlayers={players.length}
                  $seatIndex={seatIndex}
                >
                  {Array.from({ length: cardCount }).map((_, i) => (
                    <OtherPlayerCard key={i} $vertical={isVertical}>
                      <img src={gameConfig.cardBack} alt="카드 뒷면" />
                    </OtherPlayerCard>
                  ))}
                </OtherPlayerHand>
              )}
            </PlayerSeat>
          );
        })}
      </PlayerCircle>
      {myHand.length > 0 && (
        <MyHandArea>
          {myHand.map((card) => (
            <HandCard key={getCardName(card)}>
              <CardImageWrapper>
                <img src={getCardImage(card)} alt={getCardName(card)} />
              </CardImageWrapper>
              <CardLabel $suit={card.type}>
                {getCardLabel(card)}
              </CardLabel>
            </HandCard>
          ))}
        </MyHandArea>
      )}
      {(myHandRank || (gameStarted && currentStep <= 4)) && (
        <HandRankContainer>
          {myHandRank && (
            <HandRankDisplay>{myHandRank.detailName}</HandRankDisplay>
          )}
          {gameStarted && currentStep <= 4 && (
            <ReadyButton
              $disabled={isReady || !chips.some((c) => c.owner === playerId)}
              onClick={onReady}
              disabled={isReady || !chips.some((c) => c.owner === playerId)}
            >
              {isReady
                ? `대기중 (${readyPlayers.length}/${players.length})`
                : "OK"}
            </ReadyButton>
          )}
        </HandRankContainer>
      )}
      <GangHandRankModal
        isOpen={showHandRankModal}
        onClose={() => setShowHandRankModal(false)}
      />
    </GameBoard>
  );
}
