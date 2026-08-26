import type { Card, Player } from "../../../types/game";
import { SPICE_SUIT_COLORS } from "../../../utils/games/spice";
import { SpiceSuitIcon, SpiceCard, SpiceCardBack } from "./SpiceCard";

interface ChallengePhase {
  playerId: string;
  nickname: string;
  declaredSuit: string;
  declaredNumber: number;
}

interface ChallengeResult {
  challengerNickname: string;
  targetNickname: string;
  challengeType: "number" | "suit";
  challengeSuccess: boolean;
  winnerId: string;
  loserId: string;
  playedCard: Card;
  declaredSuit: string;
  declaredNumber: number;
}

interface Props {
  challengePhase: ChallengePhase | null;
  challengeResult: ChallengeResult | null;
  myPlayerId: string | undefined;
  players: Player[];
  challengeTimeLeft: number;
  challengeTime: number;
  onChallenge: (type: "number" | "suit") => void;
}

export default function SpiceChallengeOverlay({
  challengePhase,
  challengeResult,
  myPlayerId,
  players,
  challengeTimeLeft,
  challengeTime,
  onChallenge,
}: Props) {
  if (!challengePhase && !challengeResult) return null;

  return (
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
            : challengePhase!.playerId === myPlayerId
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
                      width: `${(challengeTimeLeft / challengeTime) * 100}%`,
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

            {challengePhase.playerId !== myPlayerId ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => onChallenge("number")}
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
                  onClick={() => onChallenge("suit")}
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
  );
}
