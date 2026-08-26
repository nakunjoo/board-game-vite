import {
  GameFinishContainer,
  GameFinishHeader,
  GameFinishTitle,
  GameFinishCloseButton,
  GameFinishActions,
  GameFinishActionButton,
  GameFinishBottomButton,
} from "../../styles/game";
import type { Card, PlayerResult } from "../../types/game";
import { SPICE_SUIT_COLORS, SPICE_SUIT_LABELS } from "../../utils/games/spice";

interface SpiceResultModalProps {
  playerResults: (PlayerResult & {
    trophyCount?: number;
    wonCardCount?: number;
    score?: number;
  })[];
  openCards: Card[];
  showResults: boolean;
  isNextRoundReady: boolean;
  nextRoundReadyPlayers: string[];
  memberCount: number;
  gameOver: boolean;
  gameOverResult: "victory" | "defeat" | null;
  isHost: boolean;
  spiceGameOverMeta?: {
    reason: 'trophy' | 'deck';
    winnerIds: string[];
    winnerNicknames: string[];
    maxScore: number;
  } | null;
  onClose: () => void;
  onShowResults: () => void;
  onNextRound: () => void;
  onRestart: () => void;
}

function SpiceCardSmall({ card }: { card: Card }) {
  const color = SPICE_SUIT_COLORS[card.type] ?? "#555";
  const suitLabel = SPICE_SUIT_LABELS[card.type] ?? card.type;

  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${color}`,
        borderRadius: "4px",
        width: "32px",
        height: "44px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: "0.5rem", color, fontWeight: "bold", lineHeight: 1 }}>
        {suitLabel}
      </span>
      <span style={{ fontSize: card.type === "wild-number" ? "0.6rem" : "0.9rem", color, fontWeight: "bold", lineHeight: 1 }}>
        {card.type === "wild-suit" ? "★" : card.type === "wild-number" ? "1~10" : card.value}
      </span>
    </div>
  );
}

export default function SpiceResultModal({
  playerResults,
  openCards,
  showResults,
  isNextRoundReady,
  nextRoundReadyPlayers,
  memberCount,
  gameOver,
  gameOverResult,
  isHost,
  spiceGameOverMeta,
  onClose,
  onShowResults,
  onNextRound,
  onRestart,
}: SpiceResultModalProps) {
  if (!showResults) {
    return (
      <GameFinishActions>
        <GameFinishActionButton onClick={onShowResults}>
          결과 보기
        </GameFinishActionButton>
        {gameOver ? (
          isHost && (
            <GameFinishActionButton $variant="secondary" onClick={onRestart}>
              다시 시작
            </GameFinishActionButton>
          )
        ) : (
          <GameFinishActionButton
            $variant="secondary"
            onClick={onNextRound}
            disabled={isNextRoundReady}
          >
            {isNextRoundReady
              ? `대기중 (${nextRoundReadyPlayers.length}/${memberCount})`
              : "다음 라운드 진행"}
          </GameFinishActionButton>
        )}
      </GameFinishActions>
    );
  }

  // 점수 기반 결과인지 확인
  const isSpiceGameOver = !!spiceGameOverMeta;
  // 점수순 정렬 (높은 순)
  const sortedResults = isSpiceGameOver
    ? [...playerResults].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    : playerResults;

  const reasonLabel =
    spiceGameOverMeta?.reason === 'trophy' ? '트로피 조건 달성' :
    spiceGameOverMeta?.reason === 'deck' ? '덱 소진' : '';

  return (
    <GameFinishContainer>
      <GameFinishHeader>
        <GameFinishTitle $isSuccess={gameOverResult !== "defeat"}>
          {isSpiceGameOver
            ? "🏆 게임 종료"
            : gameOver
              ? gameOverResult === "victory" ? "최종 승리!" : "최종 패배..."
              : "라운드 종료"}
        </GameFinishTitle>
        <GameFinishCloseButton onClick={onClose}>✕</GameFinishCloseButton>
      </GameFinishHeader>

      {/* 종료 사유 */}
      {isSpiceGameOver && (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", marginBottom: "4px" }}>
          {reasonLabel}으로 종료
        </div>
      )}

      {/* 승자 표시 */}
      {isSpiceGameOver && spiceGameOverMeta && (
        <div
          style={{
            textAlign: "center",
            color: "#f39c12",
            fontWeight: "bold",
            fontSize: "1rem",
            marginBottom: "12px",
          }}
        >
          🥇 {spiceGameOverMeta.winnerNicknames.join(", ")}
          <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: "normal", fontSize: "0.82rem", marginLeft: "6px" }}>
            ({spiceGameOverMeta.maxScore}점)
          </span>
        </div>
      )}

      {/* 플레이어 점수 목록 */}
      {isSpiceGameOver ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
          {sortedResults.map((result, index) => {
            const isWinner = spiceGameOverMeta?.winnerIds.includes(result.playerId ?? "") ?? false;
            const trophyCount = result.trophyCount ?? 0;
            const wonCardCount = result.wonCardCount ?? 0;
            const handCount = result.hand.length;
            const score = result.score ?? 0;

            return (
              <div
                key={index}
                style={{
                  background: isWinner ? "rgba(243,156,18,0.12)" : "rgba(255,255,255,0.05)",
                  border: isWinner ? "1px solid rgba(243,156,18,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                {/* 순위 */}
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: index === 0 ? "#f39c12" : "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: index === 0 ? "#fff" : "rgba(255,255,255,0.6)",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>

                {/* 닉네임 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: isWinner ? "#f39c12" : "#fff",
                    fontWeight: isWinner ? "bold" : "normal",
                    fontSize: "0.9rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {isWinner && "🥇 "}{result.nickname}
                  </div>
                  {/* 점수 세부 내역 */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>
                      따낸 카드 <span style={{ color: "#5dade2" }}>+{wonCardCount}</span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>
                      트로피 <span style={{ color: "#f39c12" }}>+{trophyCount * 10}</span>
                      {trophyCount > 0 && <span style={{ color: "rgba(255,255,255,0.3)" }}> ({trophyCount}개)</span>}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem" }}>
                      잔여 패 <span style={{ color: "#e74c3c" }}>-{handCount}</span>
                    </span>
                  </div>
                </div>

                {/* 총점 */}
                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: score >= 0 ? "#2ecc71" : "#e74c3c",
                    flexShrink: 0,
                    minWidth: "40px",
                    textAlign: "right",
                  }}
                >
                  {score > 0 ? `+${score}` : score}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 기존 라운드 결과 (spiceGameOver 아닌 경우) */
        <>
          {openCards.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", padding: "8px 0" }}>
              {openCards.map((card, index) => (
                <SpiceCardSmall key={index} card={card} />
              ))}
            </div>
          )}
          {playerResults.map((result, index) => (
            <div key={index} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px 12px", marginBottom: "6px" }}>
              <div style={{ color: "#fff", fontWeight: "bold", marginBottom: "4px" }}>{result.nickname}</div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {result.hand.map((card, cardIndex) => (
                  <SpiceCardSmall key={cardIndex} card={card} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <div style={{ marginTop: "12px", display: "flex", gap: "8px", width: "100%" }}>
        {gameOver ? (
          isHost && (
            <GameFinishActionButton $variant="secondary" onClick={onRestart} style={{ flex: 1 }}>
              다시 시작
            </GameFinishActionButton>
          )
        ) : (
          <GameFinishActionButton
            $variant="secondary"
            onClick={onNextRound}
            disabled={isNextRoundReady}
            style={{ flex: 1 }}
          >
            {isNextRoundReady
              ? `대기중 (${nextRoundReadyPlayers.length}/${memberCount})`
              : "다음 라운드 진행"}
          </GameFinishActionButton>
        )}
        <GameFinishBottomButton onClick={onClose} style={{ flex: 1 }}>닫기</GameFinishBottomButton>
      </div>
    </GameFinishContainer>
  );
}
