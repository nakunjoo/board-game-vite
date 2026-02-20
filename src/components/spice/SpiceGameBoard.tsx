import { useState, useEffect, useRef } from "react";
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
  // 선뽑기
  isFirstDraw?: boolean;
  myDrawnNumber?: number | null;
  firstDrawResults?: Record<string, number>;
  firstDrawFinished?: boolean;
  firstPlayerId?: string | null;
  firstNickname?: string | null;
  drawnCount?: number;
  onDrawFirstCard?: () => void;
  // 턴 관리
  currentTurnPlayerId?: string | null;
  currentSuit?: string | null;
  currentNumber?: number;
  tableStackSize?: number;
  onPlayCard?: (cardIndex: number, declaredSuit: string, declaredNumber: number) => void;
  onPass?: () => void;
  // 도전 페이즈
  challengePhase?: {
    playerId: string;
    nickname: string;
    declaredSuit: string;
    declaredNumber: number;
  } | null;
  challengeResult?: {
    challengerNickname: string;
    targetNickname: string;
    challengeType: 'number' | 'suit';
    challengeSuccess: boolean;
    winnerId: string;
    loserId: string;
    playedCard: Card;
    declaredSuit: string;
    declaredNumber: number;
  } | null;
  onChallenge?: (challengeType: 'number' | 'suit') => void;
  trophies?: Record<string, number>; // playerId → 트로피 수 (0~3)
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
  const suitFontSize = small ? "1rem" : "clamp(1rem, 2.5vw, 1.3rem)";
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
  isFirstDraw = false,
  myDrawnNumber = null,
  firstDrawResults = {},
  firstDrawFinished = false,
  firstPlayerId = null,
  firstNickname = null,
  drawnCount = 0,
  onDrawFirstCard,
  currentTurnPlayerId = null,
  currentSuit = null,
  currentNumber = 0,
  tableStackSize = 0,
  onPlayCard,
  onPass,
  challengePhase = null,
  challengeResult = null,
  onChallenge,
  trophies = {},
}: SpiceGameBoardProps) {
  const me = players.find((p) => p.isMe);
  const myOrder = me?.order ?? 0;
  const totalPlayers = players.length;
  const isMyTurn = !!me && currentTurnPlayerId === me.playerId;

  // step1: 선언 모달 (향신료+숫자 선택)
  // step2: 실제 낼 손패 카드 선택
  type PlayStep = "idle" | "declare" | "pick";
  const [playStep, setPlayStep] = useState<PlayStep>("idle");
  const [declaredSuit, setDeclaredSuit] = useState<string | null>(null);
  const [declaredNumber, setDeclaredNumber] = useState<number | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // 20초 타이머 (시간 초과 시 자동 패스)
  const TURN_TIME = 20;
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // onPass prop 참조를 ref로 유지 (클로저 문제 방지)
  const onPassRef = useRef(onPass);
  useEffect(() => { onPassRef.current = onPass; }, [onPass]);

  useEffect(() => {
    clearTimer();
    // 도전 페이즈 중에는 내 턴 타이머 비활성화
    if (isMyTurn && !challengePhase) {
      setTimeLeft(TURN_TIME);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            // 자동 패스
            onPassRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [isMyTurn, currentTurnPlayerId, challengePhase]);

  // 도전 페이즈 5초 카운트다운 (UI 표시용)
  const CHALLENGE_TIME = 5;
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(CHALLENGE_TIME);
  const challengeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearChallengeTimer = () => {
    if (challengeTimerRef.current) {
      clearInterval(challengeTimerRef.current);
      challengeTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearChallengeTimer();
    if (challengePhase) {
      setChallengeTimeLeft(CHALLENGE_TIME);
      challengeTimerRef.current = setInterval(() => {
        setChallengeTimeLeft((prev) => {
          if (prev <= 1) {
            clearChallengeTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearChallengeTimer;
  }, [challengePhase]);

  const isReset = currentNumber === 0 || currentNumber >= 10;
  // 현재 숫자보다 초과(strictly greater)한 숫자만 선언 가능
  const validNumbers = isReset
    ? [1, 2, 3]
    : Array.from({ length: 10 - currentNumber }, (_, i) => currentNumber + i + 1);

  // 선언 가능한 향신료 목록
  const allSuits = ["pepper", "cinnamon", "saffron"];
  const declarableSuits = isReset
    ? allSuits  // 리셋 후엔 어떤 향신료든 선언 가능
    : (currentSuit ? [currentSuit] : allSuits); // 진행 중엔 현재 향신료만

  const openDeclareModal = () => setPlayStep("declare");
  const closeDeclareModal = () => {
    setPlayStep("idle");
    setDeclaredSuit(null);
    setDeclaredNumber(null);
    setSelectedCardIndex(null);
  };

  const handleConfirmDeclare = () => {
    if (!declaredSuit || !declaredNumber) return;
    setPlayStep("pick");
  };

  const handlePickCard = (index: number) => {
    if (!onPlayCard || !declaredSuit || !declaredNumber) return;
    onPlayCard(index, declaredSuit, declaredNumber);
    closeDeclareModal();
  };

  const playerSeats = players.map((player) => {
    const playerOrder = player.order ?? 0;
    const seatIndex = (playerOrder - myOrder + totalPlayers) % totalPlayers;
    return { player, seatIndex };
  });

  return (
    <GameBoard>
      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0.4) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
      <NotificationToast $show={showNotification}>
        {notification}
      </NotificationToast>

      {!gameStarted ? (
        <>
          {/* 선뽑기 UI */}
          {isFirstDraw ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
                zIndex: 20,
                background: "rgba(0,0,0,0.6)",
                borderRadius: "12px",
              }}
            >
              <div style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "bold" }}>
                선뽑기
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
                가장 높은 숫자를 뽑은 플레이어가 선을 잡습니다
              </div>

              {!firstDrawFinished ? (
                <>
                  {/* 뽑기 버튼 또는 내 결과 */}
                  {myDrawnNumber === null ? (
                    <div
                      onClick={onDrawFirstCard}
                      style={{
                        width: "80px",
                        height: "110px",
                        cursor: "pointer",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-8px) scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "none";
                      }}
                    >
                      <SpiceCardBack />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "80px",
                        height: "110px",
                        background: "#fff",
                        border: "3px solid #f39c12",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 16px rgba(243,156,18,0.5)",
                      }}
                    >
                      <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#e67e22" }}>
                        {myDrawnNumber}
                      </span>
                    </div>
                  )}
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem" }}>
                    {drawnCount} / {memberCount} 명 완료
                  </div>
                </>
              ) : (
                /* 선뽑기 최종 결과 */
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      color: "#f39c12",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  >
                    🎉 {firstNickname}님이 선!
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {players.map((p) => {
                      const num = firstDrawResults[p.playerId];
                      const isFirst = p.playerId === firstPlayerId;
                      return (
                        <div
                          key={p.playerId}
                          style={{
                            background: isFirst ? "rgba(243,156,18,0.2)" : "rgba(255,255,255,0.1)",
                            border: isFirst ? "2px solid #f39c12" : "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            padding: "8px 14px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ color: "#fff", fontSize: "0.8rem" }}>{p.nickname}</span>
                          <span
                            style={{
                              color: isFirst ? "#f39c12" : "#ccc",
                              fontSize: "1.4rem",
                              fontWeight: "bold",
                            }}
                          >
                            {num ?? "?"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
                    곧 게임이 시작됩니다...
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 게임 시작 버튼 */
            !gameOver && (isHost ? (
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
            ))
          )}

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
          {/* 현재 턴 + 쌓인 더미 상태 (상단 중앙) */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              zIndex: 5,
            }}
          >
            {/* 현재 선언 정보 */}
            {currentSuit && (
              <div
                style={{
                  background: "rgba(0,0,0,0.55)",
                  borderRadius: "10px",
                  padding: "4px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#fff",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{SPICE_SUIT_LABELS[currentSuit] ?? currentSuit}</span>
                <span style={{ fontWeight: "bold", fontSize: "1rem" }}>{currentNumber}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>| 더미 {tableStackSize}장</span>
              </div>
            )}
            {/* 누구 턴인지 + 타이머 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: isMyTurn ? "rgba(243,156,18,0.85)" : "rgba(0,0,0,0.5)",
                borderRadius: "8px",
                padding: "3px 12px",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              {isMyTurn ? "내 차례" : `${players.find((p) => p.playerId === currentTurnPlayerId)?.nickname ?? "?"}의 차례`}
              {/* 타이머 바 */}
              <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                <div style={{
                  width: "64px",
                  height: "6px",
                  borderRadius: "3px",
                  background: "rgba(255,255,255,0.2)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: `${(timeLeft / TURN_TIME) * 100}%`,
                    height: "100%",
                    borderRadius: "3px",
                    background: timeLeft <= 5 ? "#e74c3c" : isMyTurn ? "#fff" : "rgba(255,255,255,0.7)",
                    transition: "width 0.9s linear, background 0.3s",
                  }} />
                </div>
                <span style={{
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  color: timeLeft <= 5 ? "#e74c3c" : "#fff",
                  minWidth: "16px",
                  textAlign: "right",
                }}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

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

          {/* ─── 도전 페이즈 / 도전 결과 오버레이 ─── */}
          {(challengePhase || challengeResult) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 45,
                background: "rgba(0,0,0,0.55)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* 상태 레이블 */}
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", textAlign: "center" }}>
                  {challengeResult
                    ? (challengeResult.challengeSuccess
                      ? `🎉 도전 성공! (${challengeResult.challengerNickname} → ${challengeResult.targetNickname})`
                      : `❌ 도전 실패! (${challengeResult.challengerNickname} → ${challengeResult.targetNickname})`)
                    : (challengePhase!.playerId === me?.playerId
                      ? "내가 카드를 냈습니다"
                      : `${challengePhase!.nickname}님이 카드를 냈습니다`)
                  }
                </div>

                {/* 카드 표시 영역: 선언(앞면) + 제출(뒷면 → 결과 시 앞면으로 뒤집기) */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "16px" }}>
                  {/* 선언 카드 (항상 앞면) */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>선언</div>
                    {(() => {
                      const suit = challengePhase?.declaredSuit ?? challengeResult?.declaredSuit ?? "";
                      const num = challengePhase?.declaredNumber ?? challengeResult?.declaredNumber ?? 0;
                      return (
                        <div
                          style={{
                            background: "#fff",
                            border: `2px solid ${SPICE_SUIT_COLORS[suit] ?? "#555"}`,
                            borderRadius: "8px",
                            width: "56px",
                            height: "78px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                          }}
                        >
                          <span style={{ fontSize: "1.4rem" }}>
                            {SPICE_SUIT_LABELS[suit] ?? suit}
                          </span>
                          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: SPICE_SUIT_COLORS[suit] ?? "#333" }}>
                            {num}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 제출 카드: 도전 결과 전=뒷면, 후=앞면(flip 애니메이션) */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>제출</div>
                    <div
                      style={{
                        width: "56px",
                        height: "78px",
                        perspective: "600px",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          transformStyle: "preserve-3d",
                          transition: "transform 0.5s ease",
                          transform: challengeResult ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                      >
                        {/* 뒷면 */}
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                          }}
                        >
                          <SpiceCardBack />
                        </div>
                        {/* 앞면 (뒤집힌 후 보임) */}
                        <div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                          }}
                        >
                          {challengeResult
                            ? <SpiceCard card={challengeResult.playedCard} />
                            : <SpiceCardBack />
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 도전 결과: 결과 설명 텍스트 */}
                {challengeResult && (
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", textAlign: "center", lineHeight: 1.6 }}>
                    {challengeResult.challengeSuccess
                      ? `${challengeResult.challengerNickname}이 더미 획득 · ${challengeResult.targetNickname}은 2장 드로우`
                      : `${challengeResult.challengerNickname}이 2장 드로우 · ${challengeResult.targetNickname}이 더미 획득`}
                    <br />
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem" }}>
                      {players.find(p => p.playerId === challengeResult.loserId)?.nickname ?? "?"}님부터 다음 턴 시작
                    </span>
                  </div>
                )}

                {/* 도전 페이즈: 타이머 + 도전 버튼 */}
                {!challengeResult && challengePhase && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* 도전 타이머 바 */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{
                          width: "80px",
                          height: "7px",
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.15)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}>
                          <div style={{
                            width: `${(challengeTimeLeft / CHALLENGE_TIME) * 100}%`,
                            height: "100%",
                            borderRadius: "4px",
                            background: challengeTimeLeft <= 2 ? "#e74c3c" : "#f39c12",
                            transition: "width 0.9s linear, background 0.3s",
                          }} />
                        </div>
                        <span style={{
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: challengeTimeLeft <= 2 ? "#e74c3c" : "#f39c12",
                          minWidth: "16px",
                          textAlign: "right",
                        }}>
                          {challengeTimeLeft}
                        </span>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
                        도전 가능
                      </span>
                    </div>

                    {challengePhase.playerId !== me?.playerId ? (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => onChallenge?.("number")}
                          style={{
                            padding: "10px 18px",
                            borderRadius: "12px",
                            border: "none",
                            background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(231,76,60,0.4)",
                          }}
                        >
                          숫자 도전
                        </button>
                        <button
                          onClick={() => onChallenge?.("suit")}
                          style={{
                            padding: "10px 18px",
                            borderRadius: "12px",
                            border: "none",
                            background: "linear-gradient(135deg, #8e44ad, #6c3483)",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(142,68,173,0.4)",
                          }}
                        >
                          향신료 도전
                        </button>
                      </div>
                    ) : (
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
                        상대방이 도전할 수 있습니다...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 내 턴일 때: 카드 내기 버튼 */}
          {isMyTurn && playStep === "idle" && !challengePhase && (
            <button
              onClick={openDeclareModal}
              style={{
                position: "absolute",
                bottom: "160px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "10px 28px",
                borderRadius: "24px",
                border: "none",
                background: "#f39c12",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                zIndex: 20,
                boxShadow: "0 4px 16px rgba(243,156,18,0.5)",
              }}
            >
              카드 내기
            </button>
          )}

          {/* Step 1: 선언 모달 (향신료 + 숫자 선택) */}
          {isMyTurn && playStep === "declare" && !challengePhase && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
                background: "rgba(0,0,0,0.6)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "18px",
                  minWidth: "260px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ color: "#fff", fontWeight: "bold", fontSize: "1rem" }}>
                  선언할 카드를 고르세요
                </div>

                {/* 향신료 선택 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>향신료</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {declarableSuits.map((suit) => {
                      const color = SPICE_SUIT_COLORS[suit];
                      const icon = SPICE_SUIT_LABELS[suit];
                      const selected = declaredSuit === suit;
                      return (
                        <button
                          key={suit}
                          onClick={() => setDeclaredSuit(suit)}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "12px",
                            border: selected ? `2px solid ${color}` : "1px solid rgba(255,255,255,0.15)",
                            background: selected ? `${color}22` : "rgba(255,255,255,0.05)",
                            fontSize: "1.6rem",
                            cursor: "pointer",
                            boxShadow: selected ? `0 0 12px ${color}88` : "none",
                            transition: "all 0.15s",
                          }}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 숫자 선택 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>숫자</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                    {validNumbers.map((n) => (
                      <button
                        key={n}
                        onClick={() => setDeclaredNumber(n)}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          border: declaredNumber === n ? "2px solid #f39c12" : "1px solid rgba(255,255,255,0.2)",
                          background: declaredNumber === n ? "rgba(243,156,18,0.25)" : "rgba(255,255,255,0.07)",
                          color: declaredNumber === n ? "#f39c12" : "#fff",
                          fontWeight: "bold",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                          transition: "all 0.1s",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 버튼 */}
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button
                    onClick={closeDeclareModal}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmDeclare}
                    disabled={!declaredSuit || !declaredNumber}
                    style={{
                      flex: 2,
                      padding: "8px 0",
                      borderRadius: "10px",
                      border: "none",
                      background: declaredSuit && declaredNumber ? "#f39c12" : "rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: declaredSuit && declaredNumber ? "pointer" : "not-allowed",
                      fontSize: "0.9rem",
                    }}
                  >
                    다음 →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 실제 낼 손패 카드 선택 모달 */}
          {isMyTurn && playStep === "pick" && !challengePhase && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
                background: "rgba(0,0,0,0.6)",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  maxWidth: "320px",
                  width: "90%",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ color: "#fff", fontWeight: "bold", fontSize: "1rem" }}>
                  실제로 낼 카드를 선택하세요
                </div>
                {/* 선언 요약 */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(243,156,18,0.15)",
                    border: "1px solid rgba(243,156,18,0.4)",
                    borderRadius: "8px",
                    padding: "6px 14px",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>{SPICE_SUIT_LABELS[declaredSuit!] ?? declaredSuit}</span>
                  <span style={{ color: "#f39c12", fontWeight: "bold", fontSize: "1.1rem" }}>{declaredNumber}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>로 선언</span>
                </div>

                {/* 손패 카드 목록 */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "center",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {myHand.map((card, i) => (
                    <div
                      key={`${card.name}-${i}`}
                      onClick={() => handlePickCard(i)}
                      style={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        border: selectedCardIndex === i ? "2px solid #f39c12" : "2px solid transparent",
                        transition: "transform 0.1s, border 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "none"}
                    >
                      <SpiceCard card={card} />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setPlayStep("declare")}
                  style={{
                    padding: "7px 20px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  ← 돌아가기
                </button>
              </div>
            </div>
          )}
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
                <div style={{ position: "relative", display: "inline-block" }}>
                  <PlayerAvatar
                    $isMe={player.isMe}
                    $colorIndex={seatIndex}
                    $isVertical={isVertical}
                  >
                    {player.nickname}
                  </PlayerAvatar>
                  {/* 도전 결과 표식 */}
                  {challengeResult && player.playerId === challengeResult.winnerId && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        fontSize: "1.1rem",
                        lineHeight: 1,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        pointerEvents: "none",
                        animation: "badgePop 0.3s ease",
                      }}
                    >
                      🎉
                    </div>
                  )}
                  {challengeResult && player.playerId === challengeResult.loserId && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        fontSize: "1.1rem",
                        lineHeight: 1,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                        pointerEvents: "none",
                        animation: "badgePop 0.3s ease",
                      }}
                    >
                      💀
                    </div>
                  )}
                </div>
                {/* 트로피 슬롯 (게임 중에만 표시) - 아바타 오른쪽 세로 배치 */}
                {gameStarted && (
                  <div
                    style={{
                      position: "absolute",
                      right: "-22px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => {
                      const count = trophies[player.playerId] ?? 0;
                      const filled = i < count;
                      return (
                        <div
                          key={i}
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: filled
                              ? "linear-gradient(135deg, #f39c12, #e67e22)"
                              : "rgba(255,255,255,0.1)",
                            border: filled
                              ? "1px solid rgba(255,200,80,0.8)"
                              : "1px solid rgba(255,255,255,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "8px",
                            lineHeight: 1,
                            transition: "all 0.3s ease",
                            boxShadow: filled
                              ? "0 0 6px rgba(243,156,18,0.6)"
                              : "none",
                            animation: filled && count === i + 1 ? "badgePop 0.4s ease" : "none",
                          }}
                        >
                          {filled ? "🏆" : ""}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  transition: "transform 0.15s ease",
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
