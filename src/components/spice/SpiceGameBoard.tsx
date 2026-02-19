import {
  GameBoard,
  PlayerCircle,
  StartGameButton,
  NotificationToast,
} from "../../styles/game";
import {
  PlayerSeat,
  PlayerAvatar,
  PlayerAvatarWrapper,
  KickButton,
  getSeatPosition,
} from "../../styles/pages/Room";
import type { Card, GameConfig, PlayerHand } from "../../types/game";
import { SPICE_SUIT_COLORS, SPICE_SUIT_LABELS } from "../../utils/games/spice";
import type { Player } from "../gang/types";

interface SpiceGameBoardProps {
  gameStarted: boolean;
  isHost: boolean;
  memberCount: number;
  players: Player[];
  playerId: string;
  playerHands: PlayerHand[];
  deck: Card[];
  openCards: Card[];
  myHand: Card[];
  notification: string;
  showNotification: boolean;
  gameOver: boolean;
  gameConfig: GameConfig;
  onStartGame: () => void;
  onKickPlayer?: (targetPlayerId: string) => void;
}

// 향신료 카드 뒷면
function SpiceCardBack() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "3px",
        background: "#7B3F00",
        border: "1px solid #5a2d00",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(45deg, rgba(255,255,255,0.07) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255,255,255,0.07) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.07) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.07) 75%)
          `,
          backgroundSize: "6px 6px",
          backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "2px",
          border: "1px solid rgba(255,200,80,0.4)",
          borderRadius: "2px",
        }}
      />
      <span
        style={{
          fontSize: "0.65rem",
          color: "rgba(255,200,80,0.85)",
          zIndex: 1,
          lineHeight: 1,
        }}
      >
        ✦
      </span>
    </div>
  );
}

// 다른 플레이어 손패 fan
function OtherPlayerFan({
  cardCount,
  pos,
  isVertical,
}: {
  cardCount: number;
  pos: ReturnType<typeof getSeatPosition>;
  isVertical: boolean;
}) {
  const isTop = pos.top === "0" && pos.left === "50%";
  const isBottom = pos.bottom === "0" && pos.left === "50%";
  const isLeft = pos.left === "0";
  const isRight = pos.right !== undefined && pos.right === "0";

  const spreadAngle = Math.min(5 * (cardCount - 1), 40);
  const angleStep = cardCount > 1 ? spreadAngle / (cardCount - 1) : 0;
  const cardW = 16;
  const cardH = 22;
  const overlap = Math.min(10, 60 / cardCount);

  // 컨테이너 위치 결정
  let containerStyle: React.CSSProperties = { position: "absolute" };
  if (isBottom) {
    containerStyle = { ...containerStyle, bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: "6px" };
  } else if (isTop) {
    containerStyle = { ...containerStyle, top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "6px" };
  } else if (isLeft) {
    containerStyle = { ...containerStyle, top: "50%", left: "100%", transform: "translateY(-50%)", marginLeft: "6px" };
  } else if (isRight) {
    containerStyle = { ...containerStyle, top: "50%", right: "100%", transform: "translateY(-50%)", marginRight: "6px" };
  } else {
    containerStyle = { ...containerStyle, top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "6px" };
  }

  // 세로 배치(좌/우)는 fan을 세로 방향으로
  const baseAngle = isVertical ? 90 : 0;

  return (
    <div style={{ ...containerStyle, width: `${cardW + overlap * (cardCount - 1) + 10}px`, height: `${cardH + 16}px` }}>
      {Array.from({ length: cardCount }).map((_, i) => {
        const fanAngle = baseAngle + (-spreadAngle / 2 + angleStep * i);
        const xOffset = isVertical ? 0 : (i - (cardCount - 1) / 2) * overlap;
        const yOffset = isVertical ? (i - (cardCount - 1) / 2) * overlap : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${cardW}px`,
              height: `${cardH}px`,
              transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px)) rotate(${fanAngle}deg)`,
              transformOrigin: "bottom center",
              zIndex: i,
            }}
          >
            <SpiceCardBack />
          </div>
        );
      })}
    </div>
  );
}

// 향신료 카드 단일 렌더링
function SpiceCard({ card, small = false }: { card: Card; small?: boolean }) {
  const color = SPICE_SUIT_COLORS[card.type] ?? "#555";
  const suitLabel = SPICE_SUIT_LABELS[card.type] ?? card.type;
  const isWild = card.type === "wild-number" || card.type === "wild-suit";

  // small: 오픈카드용 고정 소형
  // 일반(내 손패): 모바일에서 clamp로 축소
  const width = small ? "36px" : "clamp(40px, 11vw, 56px)";
  const height = small ? "50px" : "clamp(56px, 15vw, 78px)";
  const suitFontSize = small ? "0.6rem" : "clamp(0.55rem, 1.6vw, 0.75rem)";
  const valueFontSize = card.type === "wild-number"
    ? (small ? "0.65rem" : "clamp(0.65rem, 2vw, 0.9rem)")
    : (small ? "1rem" : "clamp(0.85rem, 3vw, 1.4rem)");

  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${color}`,
        borderRadius: small ? "4px" : "8px",
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        flexShrink: 0,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      <span
        style={{
          fontSize: suitFontSize,
          color,
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        {suitLabel}
      </span>
      <span
        style={{
          fontSize: valueFontSize,
          color: isWild ? "#8e44ad" : color,
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        {card.type === "wild-suit" ? "★" : card.type === "wild-number" ? "1~10" : card.value}
      </span>
    </div>
  );
}

export default function SpiceGameBoard({
  gameStarted,
  isHost,
  memberCount,
  players,
  playerId,
  playerHands,
  deck,
  openCards,
  myHand,
  notification,
  showNotification,
  gameOver,
  gameConfig,
  onStartGame,
  onKickPlayer,
}: SpiceGameBoardProps) {
  const me = players.find((p) => p.isMe);
  const myOrder = me?.order ?? 0;
  const totalPlayers = players.length;

  const playerSeats = players.map((player) => {
    const playerOrder = player.order ?? 0;
    const seatIndex = (playerOrder - myOrder + totalPlayers) % totalPlayers;
    return { player, seatIndex };
  });

  return (
    <GameBoard>
      <NotificationToast $show={showNotification}>
        {notification}
      </NotificationToast>

      {!gameStarted ? (
        <>
          {!gameOver && (isHost ? (
            <StartGameButton $disabled={false} onClick={onStartGame} disabled={false}>
              게임 시작
            </StartGameButton>
          ) : (
            <StartGameButton $disabled={true} onClick={() => {}} disabled={true}>
              게임 시작 대기 중
              <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                ({memberCount}명)
              </div>
            </StartGameButton>
          ))}

          {/* 덱 카드 수 표시 */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              width: "clamp(40px, 11vw, 56px)",
              height: "clamp(56px, 15vw, 78px)",
            }}
          >
            <SpiceCardBack />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,200,80,0.95)",
                fontWeight: "bold",
                fontSize: "0.8rem",
                gap: "2px",
                zIndex: 2,
              }}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{deck.length}</span>
              <span style={{ lineHeight: 1 }}>장</span>
            </div>
          </div>

        </>
      ) : (
        <>
          {/* 오픈 카드 */}
          {openCards.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxWidth: "280px",
              }}
            >
              {openCards.map((card, index) => (
                <SpiceCard key={`${card.name}-${index}`} card={card} small />
              ))}
            </div>
          )}

          {/* 덱 카드 수 */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              width: "clamp(40px, 11vw, 56px)",
              height: "clamp(56px, 15vw, 78px)",
            }}
          >
            <SpiceCardBack />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,200,80,0.95)",
                fontWeight: "bold",
                fontSize: "0.8rem",
                gap: "2px",
                zIndex: 2,
              }}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{deck.length}</span>
              <span style={{ lineHeight: 1 }}>장</span>
            </div>
          </div>

        </>
      )}

      {/* 플레이어 자리 */}
      <PlayerCircle>
        {playerSeats.map(({ player, seatIndex }) => {
          const handInfo = playerHands.find((h) => h.nickname === player.nickname);
          const cardCount = handInfo?.cardCount ?? 0;
          const pos = getSeatPosition(players.length, seatIndex);
          const isVertical = pos.left === "0" || pos.right === "0";

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
                  <KickButton onClick={() => onKickPlayer(player.playerId)} title="강퇴">
                    ✕
                  </KickButton>
                )}
              </PlayerAvatarWrapper>
              {!player.isMe && cardCount > 0 && (
                <OtherPlayerFan
                  cardCount={cardCount}
                  pos={pos}
                  isVertical={isVertical}
                />
              )}
            </PlayerSeat>
          );
        })}
      </PlayerCircle>

      {/* 내 손패 - 반원형 fan */}
      {myHand.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            height: "120px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {myHand.map((card, i) => {
            const total = myHand.length;
            const spreadAngle = Math.min(6 * (total - 1), 60);
            const angleStep = total > 1 ? spreadAngle / (total - 1) : 0;
            const angle = -spreadAngle / 2 + angleStep * i;
            const overlapOffset = Math.min(28, 180 / total);
            const xOffset = (i - (total - 1) / 2) * overlapOffset;
            return (
              <div
                key={card.name}
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "50%",
                  transform: `translateX(calc(-50% + ${xOffset}px)) rotate(${angle}deg)`,
                  transformOrigin: "bottom center",
                  transition: "transform 0.15s ease, z-index 0s",
                  zIndex: 10 + i,
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = `translateX(calc(-50% + ${xOffset}px)) rotate(${angle}deg) translateY(-18px)`;
                  (e.currentTarget as HTMLElement).style.zIndex = "99";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = `translateX(calc(-50% + ${xOffset}px)) rotate(${angle}deg)`;
                  (e.currentTarget as HTMLElement).style.zIndex = String(10 + i);
                }}
              >
                <SpiceCard card={card} />
              </div>
            );
          })}
        </div>
      )}
    </GameBoard>
  );
}
