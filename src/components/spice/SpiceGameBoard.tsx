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
import type { Card, GameConfig, Player, PlayerHand } from "../../types/game";
import { SPICE_SUIT_COLORS } from "../../utils/games/spice";
import { playTickSound } from "../../utils/audio";
import { SpiceSuitIcon, SpiceCard, SpiceCardBack } from "./game/SpiceCard";
import SpiceOtherPlayerFan from "./game/SpiceOtherPlayerFan";
import {
  SpiceDeclareModal,
  SpiceCardPickModal,
} from "./game/SpiceDeclareModal";
import SpiceChallengeOverlay from "./game/SpiceChallengeOverlay";

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
  isAdmin?: boolean;
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
  isAdmin = false,
}: SpiceGameBoardProps) {
  const me = players.find((p) => p.isMe);
  const totalPlayers = players.length;
  const isMyTurn = !!me && currentTurnPlayerId === me.playerId;

  const sortedPlayers = [...players].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const myIndexInSorted = sortedPlayers.findIndex((p) => p.isMe);

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

  const playerSeats = sortedPlayers.map((player, idx) => {
    const seatIndex = (idx - myIndexInSorted + totalPlayers) % totalPlayers;
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
                $disabled={!isAdmin && memberCount < 2}
                onClick={isAdmin || memberCount >= 2 ? onStartGame : undefined}
                disabled={!isAdmin && memberCount < 2}
              >
                {!isAdmin && memberCount < 2 ? (
                  <>
                    게임 시작 불가
                    <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      (최소 2명 필요)
                    </div>
                  </>
                ) : (
                  "게임 시작"
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
                ? (sortedPlayers.findIndex((p) => p.playerId === currentPlayer.playerId) - myIndexInSorted + totalPlayers) %
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
            <SpiceChallengeOverlay
              challengePhase={challengePhase}
              challengeResult={challengeResult}
              myPlayerId={me?.playerId}
              players={players}
              challengeTimeLeft={challengeTimeLeft}
              challengeTime={CHALLENGE_TIME}
              onChallenge={(type) => onChallenge?.(type)}
            />
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
            <SpiceDeclareModal
              declarableSuits={declarableSuits}
              validNumbers={validNumbers}
              declaredSuit={declaredSuit}
              declaredNumber={declaredNumber}
              setDeclaredSuit={setDeclaredSuit}
              setDeclaredNumber={setDeclaredNumber}
              onCancel={closeDeclareModal}
              onConfirm={handleConfirmDeclare}
            />
          )}

          {/* Step 2: 실제 낼 손패 카드 선택 모달 */}
          {isMyTurn && playStep === "pick" && !challengePhase && (
            <SpiceCardPickModal
              myHand={myHand}
              declaredSuit={declaredSuit}
              declaredNumber={declaredNumber}
              selectedCardIndex={selectedCardIndex}
              onPickCard={handlePickCard}
              onBack={() => setPlayStep("declare")}
            />
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
                <SpiceOtherPlayerFan
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
