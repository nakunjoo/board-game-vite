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
import { SPICE_SUIT_COLORS } from "../../utils/games/spice";
import { playTickSound } from "../../utils/audio";
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
  onPlayCard?: (
    cardIndex: number,
    declaredSuit: string,
    declaredNumber: number,
  ) => void;
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
    challengeType: "number" | "suit";
    challengeSuccess: boolean;
    winnerId: string;
    loserId: string;
    playedCard: Card;
    declaredSuit: string;
    declaredNumber: number;
  } | null;
  onChallenge?: (challengeType: "number" | "suit") => void;
  trophies?: Record<string, number>; // playerId → 트로피 수 (0~2)
  wonCardCounts?: Record<string, number>; // playerId → 획득 카드 수
  // 재연결 시 타이머 복원
  reconnectTurnTimeLeft?: number | null;
  reconnectChallengeTimeLeft?: number | null;
  onReconnectTimeLeftConsumed?: () => void;
}

// 향신료 SVG 아이콘 (export: SpiceHelpModal 등 외부에서도 사용)
export function SpiceSuitIcon({
  type,
  color,
  size = 24,
}: {
  type: string;
  color: string;
  size?: number;
}) {
  if (type === "pepper") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 후추: 동그란 열매 + 줄기 */}
        <circle cx="12" cy="14" r="7" fill={color} />
        <circle cx="10" cy="12" r="2" fill="rgba(255,255,255,0.25)" />
        <path
          d="M12 7 C12 7 13 3 16 2"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M12 7 C12 4 10 2 8 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  if (type === "cinnamon") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 계피: 나선형 막대 */}
        <rect
          x="4"
          y="10"
          width="16"
          height="4"
          rx="2"
          fill={color}
          transform="rotate(-20 12 12)"
        />
        <rect
          x="4"
          y="10"
          width="16"
          height="4"
          rx="2"
          fill={color}
          transform="rotate(20 12 12)"
          opacity="0.6"
        />
        <rect
          x="7"
          y="9"
          width="10"
          height="6"
          rx="3"
          fill={color}
          opacity="0.85"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="3"
          ry="4"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (type === "saffron") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 사프란: 꽃잎 6개 */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="12"
            cy="7"
            rx="2.2"
            ry="4.5"
            fill={color}
            opacity="0.85"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="3" fill={color} />
        <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.4)" />
      </svg>
    );
  }
  // wild
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon
        points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"
        fill={color}
      />
      <polygon
        points="12,5 14.2,10 19.5,10 15.5,13.5 17,18.5 12,15.5 7,18.5 8.5,13.5 4.5,10 9.8,10"
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  );
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
    containerStyle = {
      ...containerStyle,
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: "6px",
    };
  } else if (isTop) {
    containerStyle = {
      ...containerStyle,
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "6px",
    };
  } else if (isLeft) {
    containerStyle = {
      ...containerStyle,
      top: "50%",
      left: "50%",
      transform: "translateY(-50%)",
      marginLeft: "6px",
    };
  } else if (isRight) {
    containerStyle = {
      ...containerStyle,
      top: "50%",
      right: "130%",
      transform: "translateY(-50%)",
      marginRight: "6px",
    };
  } else {
    containerStyle = {
      ...containerStyle,
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "6px",
    };
  }

  // 세로 배치(좌/우)는 fan을 세로 방향으로
  const baseAngle = isVertical ? 90 : 0;

  const fanW = cardW + overlap * (cardCount - 1) + 10;
  const fanH = cardH + 16;
  const containerW = isVertical ? `${fanH}px` : `${fanW}px`;
  const containerH = isVertical ? `${fanW}px` : `${fanH}px`;

  return (
    <div style={{ ...containerStyle, width: containerW, height: containerH }}>
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
  const isWild = card.type === "wild-number" || card.type === "wild-suit";

  // small: 오픈카드용 고정 소형
  // 일반(내 손패): 모바일에서 clamp로 축소
  const width = small ? "36px" : "clamp(40px, 11vw, 56px)";
  const height = small ? "50px" : "clamp(56px, 15vw, 78px)";
  const iconSize = small ? 18 : 22;
  const valueFontSize =
    card.type === "wild-number"
      ? small
        ? "0.65rem"
        : "clamp(0.65rem, 2vw, 0.9rem)"
      : small
        ? "0.95rem"
        : "clamp(0.85rem, 3vw, 1.4rem)";

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
      <SpiceSuitIcon type={card.type} color={color} size={iconSize} />
      <span
        style={{
          fontSize: valueFontSize,
          color: isWild ? "#8e44ad" : color,
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        {card.type === "wild-suit"
          ? "★"
          : card.type === "wild-number"
            ? "1~10"
            : card.value}
      </span>
    </div>
  );
}

export default function SpiceGameBoard({
  gameStarted,
  isHost,
  memberCount,
  players,
  playerHands,
  deck,
  myHand,
  notification,
  showNotification,
  gameOver,
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
  wonCardCounts = {},
  reconnectTurnTimeLeft = null,
  reconnectChallengeTimeLeft = null,
  onReconnectTimeLeftConsumed,
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
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null,
  );

  // 30초 타이머 (시간 초과 시 자동 패스)
  const TURN_TIME = 30;
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 재연결 시 서버에서 받은 남은 시간을 한 번만 사용하기 위한 ref
  const reconnectTurnTimeLeftRef = useRef<number | null>(reconnectTurnTimeLeft);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // prop으로 새 값이 들어오면 ref 업데이트
  useEffect(() => {
    if (reconnectTurnTimeLeft != null) {
      reconnectTurnTimeLeftRef.current = reconnectTurnTimeLeft;
    }
  }, [reconnectTurnTimeLeft]);

  // onPass prop 참조를 ref로 유지 (클로저 문제 방지)
  const onPassRef = useRef(onPass);
  useEffect(() => {
    onPassRef.current = onPass;
  }, [onPass]);

  useEffect(() => {
    clearTimer();
    // 재연결 시 서버에서 받은 남은 시간 사용, 없으면 TURN_TIME으로 초기화
    const initialTime = reconnectTurnTimeLeftRef.current ?? TURN_TIME;
    reconnectTurnTimeLeftRef.current = null; // 소비
    if (initialTime === TURN_TIME) {
      // 재연결이 아닌 일반 턴 전환이면 부모에게 소비 완료 알림
    } else {
      onReconnectTimeLeftConsumed?.();
    }
    setTimeLeft(initialTime);
    // 도전 페이즈 중이거나 게임 종료 시 타이머 비활성화
    if (gameStarted && currentTurnPlayerId && !challengePhase) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          // 0을 1초 표시한 뒤 다음 틱(-1)에서 패스 실행
          if (next < 0) {
            clearTimer();
            // 내 턴일 때만 자동 패스
            if (isMyTurn) onPassRef.current?.();
            return 0;
          }
          // 내 턴일 때만 5초 이하 똑딱 소리 (0초가 마지막 강조 틱)
          if (isMyTurn && next <= 5) {
            playTickSound(next === 0);
          }
          return next;
        });
      }, 1000);
    }
    return clearTimer;
  }, [currentTurnPlayerId, challengePhase, gameStarted]);

  // 도전 페이즈 5초 카운트다운 (UI 표시용)
  const CHALLENGE_TIME = 5;
  const [challengeTimeLeft, setChallengeTimeLeft] = useState(CHALLENGE_TIME);
  const challengeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // 재연결 시 서버에서 받은 도전 페이즈 남은 시간
  const reconnectChallengeTimeLeftRef = useRef<number | null>(
    reconnectChallengeTimeLeft,
  );

  useEffect(() => {
    if (reconnectChallengeTimeLeft != null) {
      reconnectChallengeTimeLeftRef.current = reconnectChallengeTimeLeft;
    }
  }, [reconnectChallengeTimeLeft]);

  const clearChallengeTimer = () => {
    if (challengeTimerRef.current) {
      clearInterval(challengeTimerRef.current);
      challengeTimerRef.current = null;
    }
  };

  useEffect(() => {
    clearChallengeTimer();
    if (challengePhase) {
      const initialChallengeTime =
        reconnectChallengeTimeLeftRef.current ?? CHALLENGE_TIME;
      reconnectChallengeTimeLeftRef.current = null; // 소비
      setChallengeTimeLeft(initialChallengeTime);
      challengeTimerRef.current = setInterval(() => {
        setChallengeTimeLeft((prev) => {
          // 0을 1초 표시한 뒤 다음 틱에서 정지
          if (prev <= 0) {
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
    : Array.from(
        { length: 10 - currentNumber },
        (_, i) => currentNumber + i + 1,
      );

  // 선언 가능한 향신료 목록
  const allSuits = ["pepper", "cinnamon", "saffron"];
  const declarableSuits = isReset
    ? allSuits // 리셋 후엔 어떤 향신료든 선언 가능
    : currentSuit
      ? [currentSuit]
      : allSuits; // 진행 중엔 현재 향신료만

  const openDeclareModal = () => {
    // 리셋 상태가 아닐 때(향신료가 고정된 경우) 자동 선택
    if (!isReset && declarableSuits.length === 1) {
      setDeclaredSuit(declarableSuits[0]);
    }
    setPlayStep("declare");
  };
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
              <div
                style={{
                  color: "#fff",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                선뽑기
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}
              >
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
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-8px) scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform =
                          "none";
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
                      <span
                        style={{
                          fontSize: "2rem",
                          fontWeight: "bold",
                          color: "#e67e22",
                        }}
                      >
                        {myDrawnNumber}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.85rem",
                    }}
                  >
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
                            background: isFirst
                              ? "rgba(243,156,18,0.2)"
                              : "rgba(255,255,255,0.1)",
                            border: isFirst
                              ? "2px solid #f39c12"
                              : "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            padding: "8px 14px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span style={{ color: "#fff", fontSize: "0.8rem" }}>
                            {p.nickname}
                          </span>
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
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.8rem",
                    }}
                  >
                    곧 게임이 시작됩니다...
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 게임 시작 버튼 */
            !gameOver &&
            (isHost ? (
              <StartGameButton
                $disabled={memberCount < 2}
                onClick={memberCount >= 2 ? onStartGame : undefined}
                disabled={memberCount < 2}
              >
                {memberCount < 2 ? (
                  <>
                    게임 시작 불가
                    <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      (최소 2명 필요)
                    </div>
                  </>
                ) : "게임 시작"}
              </StartGameButton>
            ) : (
              <StartGameButton
                $disabled={true}
                onClick={() => {}}
                disabled={true}
              >
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
              <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>
                {deck.length}
              </span>
              <span style={{ lineHeight: 1 }}>장</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 중앙: 타이머 / 선언 / 덱+더미 세로 배치 */}
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              zIndex: 5,
              pointerEvents: "none",
            }}
          >
            {/* ① 덱 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem" }}
              >
                덱
              </span>
              <div
                style={{
                  position: "relative",
                  width: "clamp(40px, 9vw, 52px)",
                  height: "clamp(56px, 12vw, 72px)",
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
                    gap: "1px",
                    zIndex: 2,
                  }}
                >
                  <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>
                    {deck.length}
                  </span>
                  <span style={{ fontSize: "0.6rem", lineHeight: 1 }}>장</span>
                </div>
              </div>
            </div>

            {/* ② 선언 + 더미 가로 배치 */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              {/* 선언 카드(앞면) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "0.65rem",
                  }}
                >
                  선언
                </span>
                {currentSuit ? (
                  (() => {
                    const color = SPICE_SUIT_COLORS[currentSuit] ?? "#555";
                    return (
                      <div
                        style={{
                          background: "#fff",
                          border: `2px solid ${color}`,
                          borderRadius: "8px",
                          width: "clamp(40px, 9vw, 52px)",
                          height: "clamp(56px, 12vw, 72px)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2px",
                          boxShadow: `0 4px 14px ${color}55`,
                        }}
                      >
                        <SpiceSuitIcon
                          type={currentSuit}
                          color={color}
                          size={22}
                        />
                        <span
                          style={{
                            fontSize: "clamp(0.85rem, 2.5vw, 1.3rem)",
                            color,
                            fontWeight: "bold",
                            lineHeight: 1,
                          }}
                        >
                          {currentNumber}
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <div
                    style={{
                      width: "clamp(40px, 9vw, 52px)",
                      height: "clamp(56px, 12vw, 72px)",
                      borderRadius: "8px",
                      border: "1px dashed rgba(255,255,255,0.2)",
                    }}
                  />
                )}
              </div>

              {/* 더미(뒷면 스택) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: "0.65rem",
                  }}
                >
                  더미
                </span>
                <div
                  style={{
                    position: "relative",
                    width: "clamp(40px, 9vw, 52px)",
                    height: "clamp(56px, 12vw, 72px)",
                  }}
                >
                  {[2, 1, 0].map(
                    (offset) =>
                      tableStackSize > offset && (
                        <div
                          key={offset}
                          style={{
                            position: "absolute",
                            top: `${-offset * 2}px`,
                            left: `${offset * 1}px`,
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <SpiceCardBack />
                        </div>
                      ),
                  )}
                  {tableStackSize === 0 && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        border: "1px dashed rgba(255,255,255,0.2)",
                      }}
                    />
                  )}
                  {tableStackSize > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-6px",
                        right: "-6px",
                        background: "rgba(0,0,0,0.75)",
                        border: "1px solid rgba(255,200,80,0.6)",
                        borderRadius: "8px",
                        padding: "1px 5px",
                        color: "rgba(255,200,80,0.95)",
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                        lineHeight: 1.4,
                        zIndex: 5,
                      }}
                    >
                      {tableStackSize}장
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ③ 타이머 */}
            {(() => {
              const PLAYER_COLORS = [
                "#646cff",
                "#e85d75",
                "#4caf50",
                "#ff9800",
                "#9c27b0",
                "#00bcd4",
              ];
              const currentPlayer = players.find(
                (p) => p.playerId === currentTurnPlayerId,
              );
              const currentPlayerSeatIndex = currentPlayer
                ? ((currentPlayer.order ?? 0) - myOrder + totalPlayers) %
                  totalPlayers
                : 0;
              const nameColor = isMyTurn
                ? "#ffe066"
                : PLAYER_COLORS[currentPlayerSeatIndex % PLAYER_COLORS.length];
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    background: isMyTurn
                      ? timeLeft <= 5
                        ? "rgba(231,76,60,0.9)"
                        : "rgba(243,156,18,0.9)"
                      : "rgba(0,0,0,0.6)",
                    borderRadius: "12px",
                    padding: "10px 18px",
                    color: "#fff",
                    fontWeight: "bold",
                    minWidth: "140px",
                    boxShadow: isMyTurn
                      ? timeLeft <= 5
                        ? "0 0 16px rgba(231,76,60,0.6)"
                        : "0 0 14px rgba(243,156,18,0.5)"
                      : "none",
                    transition: "background 0.3s, box-shadow 0.3s",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                    {isMyTurn ? (
                      <span style={{ color: nameColor, fontWeight: "bold" }}>
                        내 차례
                      </span>
                    ) : (
                      <>
                        <span style={{ color: nameColor, fontWeight: "bold" }}>
                          {currentPlayer?.nickname ?? "?"}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>
                          의 차례
                        </span>
                      </>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: timeLeft <= 5 ? "2rem" : "1.6rem",
                      fontWeight: "bold",
                      color:
                        timeLeft <= 5
                          ? timeLeft % 2 === 0
                            ? "#ffe066"
                            : "#fff"
                          : "#fff",
                      lineHeight: 1,
                      transition: "font-size 0.2s",
                      textShadow:
                        timeLeft <= 5
                          ? "0 0 10px rgba(255,255,255,0.8)"
                          : "none",
                    }}
                  >
                    {timeLeft}
                  </span>
                  <div
                    style={{
                      width: "120px",
                      height: "8px",
                      borderRadius: "4px",
                      background: "rgba(255,255,255,0.2)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${(timeLeft / TURN_TIME) * 100}%`,
                        height: "100%",
                        borderRadius: "4px",
                        background:
                          timeLeft <= 5 ? "#ffe066" : "rgba(255,255,255,0.85)",
                        transition: "width 0.9s linear, background 0.3s",
                      }}
                    />
                  </div>
                </div>
              );
            })()}
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
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.85rem",
                    textAlign: "center",
                  }}
                >
                  {challengeResult
                    ? challengeResult.challengeSuccess
                      ? `🎉 도전 성공! (${challengeResult.challengerNickname} → ${challengeResult.targetNickname})`
                      : `❌ 도전 실패! (${challengeResult.challengerNickname} → ${challengeResult.targetNickname})`
                    : challengePhase!.playerId === me?.playerId
                      ? "내가 카드를 냈습니다"
                      : `${challengePhase!.nickname}님이 카드를 냈습니다`}
                </div>

                {/* 카드 표시 영역: 선언(앞면) + 제출(뒷면 → 결과 시 앞면으로 뒤집기) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "16px",
                  }}
                >
                  {/* 선언 카드 (항상 앞면) */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.7rem",
                      }}
                    >
                      선언
                    </div>
                    {(() => {
                      const suit =
                        challengePhase?.declaredSuit ??
                        challengeResult?.declaredSuit ??
                        "";
                      const num =
                        challengePhase?.declaredNumber ??
                        challengeResult?.declaredNumber ??
                        0;
                      return (
                        <div
                          style={{
                            background: "#fff",
                            border: `2px solid ${SPICE_SUIT_COLORS[suit] ?? "#555"}`,
                            borderRadius: "8px",
                            width: "clamp(40px, 11vw, 56px)",
                            height: "clamp(56px, 15vw, 78px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "2px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                          }}
                        >
                          <SpiceSuitIcon
                            type={suit}
                            color={SPICE_SUIT_COLORS[suit] ?? "#333"}
                            size={26}
                          />
                          <span
                            style={{
                              fontSize: "clamp(0.85rem, 3vw, 1.2rem)",
                              fontWeight: "bold",
                              color: SPICE_SUIT_COLORS[suit] ?? "#333",
                            }}
                          >
                            {num}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 제출 카드: 도전 결과 전=뒷면, 후=앞면(flip 애니메이션) */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.7rem",
                      }}
                    >
                      제출
                    </div>
                    <div
                      style={{
                        width: "clamp(40px, 11vw, 56px)",
                        height: "clamp(56px, 15vw, 78px)",
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
                          transform: challengeResult
                            ? "rotateY(180deg)"
                            : "rotateY(0deg)",
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
                          {challengeResult ? (
                            <SpiceCard card={challengeResult.playedCard} />
                          ) : (
                            <SpiceCardBack />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 도전 결과: 결과 설명 텍스트 */}
                {challengeResult && (
                  <div
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "0.78rem",
                      textAlign: "center",
                      lineHeight: 1.6,
                    }}
                  >
                    {challengeResult.challengeSuccess
                      ? `${challengeResult.challengerNickname}이 더미 획득 · ${challengeResult.targetNickname}은 2장 드로우`
                      : `${challengeResult.challengerNickname}이 2장 드로우 · ${challengeResult.targetNickname}이 더미 획득`}
                    <br />
                    <span
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "0.72rem",
                      }}
                    >
                      {players.find(
                        (p) => p.playerId === challengeResult.loserId,
                      )?.nickname ?? "?"}
                      님부터 다음 턴 시작
                    </span>
                  </div>
                )}

                {/* 도전 페이즈: 타이머 + 도전 버튼 */}
                {!challengeResult && challengePhase && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {/* 도전 타이머 바 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "7px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.15)",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              width: `${(challengeTimeLeft / CHALLENGE_TIME) * 100}%`,
                              height: "100%",
                              borderRadius: "4px",
                              background:
                                challengeTimeLeft <= 2 ? "#e74c3c" : "#f39c12",
                              transition: "width 0.9s linear, background 0.3s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            color:
                              challengeTimeLeft <= 2 ? "#e74c3c" : "#f39c12",
                            minWidth: "16px",
                            textAlign: "right",
                          }}
                        >
                          {challengeTimeLeft}
                        </span>
                      </div>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "0.8rem",
                        }}
                      >
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
                            background:
                              "linear-gradient(135deg, #e74c3c, #c0392b)",
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
                            background:
                              "linear-gradient(135deg, #8e44ad, #6c3483)",
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
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.8rem",
                        }}
                      >
                        상대방이 도전할 수 있습니다...
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 내 턴일 때: 카드 내기 + 패스 버튼 */}
          {isMyTurn && playStep === "idle" && !challengePhase && (
            <div
              style={{
                position: "absolute",
                bottom: "160px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                zIndex: 20,
              }}
            >
              <button
                onClick={openDeclareModal}
                style={{
                  padding: "10px 28px",
                  borderRadius: "24px",
                  border: "none",
                  background: "#f39c12",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(243,156,18,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                카드 내기
              </button>
              <button
                onClick={() => onPass?.()}
                style={{
                  padding: "10px 22px",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  whiteSpace: "nowrap",
                }}
              >
                패스
              </button>
            </div>
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
                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
                  선언할 카드를 고르세요
                </div>

                {/* 향신료 선택 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.75rem",
                    }}
                  >
                    향신료
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {declarableSuits.map((suit) => {
                      const color = SPICE_SUIT_COLORS[suit];
                      const selected = declaredSuit === suit;
                      return (
                        <button
                          key={suit}
                          onClick={() => setDeclaredSuit(suit)}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "12px",
                            border: selected
                              ? `2px solid ${color}`
                              : "1px solid rgba(255,255,255,0.15)",
                            background: selected
                              ? `${color}22`
                              : "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: selected
                              ? `0 0 12px ${color}88`
                              : "none",
                            transition: "all 0.15s",
                          }}
                        >
                          <SpiceSuitIcon type={suit} color={color} size={28} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 숫자 선택 */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.75rem",
                    }}
                  >
                    숫자
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {validNumbers.map((n) => (
                      <button
                        key={n}
                        onClick={() => setDeclaredNumber(n)}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "8px",
                          border:
                            declaredNumber === n
                              ? "2px solid #f39c12"
                              : "1px solid rgba(255,255,255,0.2)",
                          background:
                            declaredNumber === n
                              ? "rgba(243,156,18,0.25)"
                              : "rgba(255,255,255,0.07)",
                          color: declaredNumber === n ? "#f39c12" : "#fff",
                          fontWeight: "bold",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                          transition: "all 0.1s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
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
                      background:
                        declaredSuit && declaredNumber
                          ? "#f39c12"
                          : "rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor:
                        declaredSuit && declaredNumber
                          ? "pointer"
                          : "not-allowed",
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
                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "1rem",
                  }}
                >
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
                  <SpiceSuitIcon
                    type={declaredSuit!}
                    color={SPICE_SUIT_COLORS[declaredSuit!] ?? "#555"}
                    size={24}
                  />
                  <span
                    style={{
                      color: "#f39c12",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {declaredNumber}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    로 선언
                  </span>
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
                        border:
                          selectedCardIndex === i
                            ? "2px solid #f39c12"
                            : "2px solid transparent",
                        transition: "transform 0.1s, border 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform =
                          "translateY(-6px)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.transform =
                          "none")
                      }
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
          const handInfo = playerHands.find(
            (h) => h.nickname === player.nickname,
          );
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
                  {challengeResult &&
                    player.playerId === challengeResult.winnerId && (
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
                  {challengeResult &&
                    player.playerId === challengeResult.loserId && (
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
                {/* 트로피 슬롯 (게임 중에만 표시) - 좌우: 아바타 위, 상하: 아바타 오른쪽 */}
                {gameStarted && (
                  <div
                    style={
                      isVertical
                        ? {
                            position: "absolute",
                            bottom: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            marginBottom: "6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                            alignItems: "center",
                          }
                        : {
                            position: "absolute",
                            left: "100%",
                            top: "50%",
                            transform: "translateY(-50%)",
                            marginLeft: "10px",
                            display: "flex",
                            flexDirection: "row",
                            gap: "3px",
                            alignItems: "center",
                          }
                    }
                  >
                    {[0, 1].map((i) => {
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
                            animation:
                              filled && count === i + 1
                                ? "badgePop 0.4s ease"
                                : "none",
                          }}
                        >
                          {filled ? "🏆" : ""}
                        </div>
                      );
                    })}
                  </div>
                )}
                {isHost && !gameStarted && !player.isMe && onKickPlayer && (
                  <KickButton
                    onClick={() => onKickPlayer(player.playerId)}
                    title="강퇴"
                  >
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

      {/* 내 획득 더미 - 왼쪽 하단 */}
      {gameStarted && me && (wonCardCounts[me.playerId] ?? 0) > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "4px",
            left: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            zIndex: 8,
          }}
        >
          <span
            style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.55rem" }}
          >
            획득
          </span>
          <div style={{ position: "relative", width: "28px", height: "38px" }}>
            {[2, 1, 0].map((offset) => {
              const count = wonCardCounts[me.playerId] ?? 0;
              return count > offset ? (
                <div
                  key={offset}
                  style={{
                    position: "absolute",
                    top: `${-offset * 2}px`,
                    left: `${offset * 1}px`,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <SpiceCardBack />
                </div>
              ) : null;
            })}
            <div
              style={{
                position: "absolute",
                bottom: "-6px",
                right: "-6px",
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,200,80,0.7)",
                borderRadius: "8px",
                padding: "1px 5px",
                color: "rgba(255,200,80,0.95)",
                fontSize: "0.65rem",
                fontWeight: "bold",
                lineHeight: 1.4,
                zIndex: 5,
              }}
            >
              {wonCardCounts[me.playerId]}장
            </div>
          </div>
        </div>
      )}

      {/* 내 손패 - 반원형 fan */}
      {myHand.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "50px",
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
                  (e.currentTarget as HTMLElement).style.transform =
                    `translateX(calc(-50% + ${xOffset}px)) rotate(${angle}deg) translateY(-18px)`;
                  (e.currentTarget as HTMLElement).style.zIndex = "99";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    `translateX(calc(-50% + ${xOffset}px)) rotate(${angle}deg)`;
                  (e.currentTarget as HTMLElement).style.zIndex = String(
                    10 + i,
                  );
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
