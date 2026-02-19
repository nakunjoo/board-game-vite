import {
  GameFinishContainer,
  GameFinishHeader,
  GameFinishTitle,
  GameFinishCloseButton,
  GameFinishActions,
  GameFinishActionButton,
  GameFinishBottomButton,
} from "../../styles/game";
import {
  PlayerResultItem,
  PlayerResultHeader,
  PlayerResultNickname,
  PlayerResultCards,
} from "../../styles/game";
import type { Card } from "../../types/game";
import { SPICE_SUIT_COLORS, SPICE_SUIT_LABELS } from "../../utils/games/spice";
import type { PlayerResult } from "../gang/types";

interface SpiceResultModalProps {
  playerResults: PlayerResult[];
  openCards: Card[];
  showResults: boolean;
  isNextRoundReady: boolean;
  nextRoundReadyPlayers: string[];
  memberCount: number;
  gameOver: boolean;
  gameOverResult: "victory" | "defeat" | null;
  isHost: boolean;
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

  return (
    <GameFinishContainer>
      <GameFinishHeader>
        <GameFinishTitle $isSuccess={gameOverResult !== "defeat"}>
          {gameOver
            ? gameOverResult === "victory"
              ? "최종 승리!"
              : "최종 패배..."
            : "라운드 종료"}
        </GameFinishTitle>
        <GameFinishCloseButton onClick={onClose}>✕</GameFinishCloseButton>
      </GameFinishHeader>

      {openCards.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "8px 0",
          }}
        >
          {openCards.map((card, index) => (
            <SpiceCardSmall key={index} card={card} />
          ))}
        </div>
      )}

      {playerResults.map((result, index) => (
        <PlayerResultItem key={index} $isWinner={false} $isLoser={false}>
          <PlayerResultHeader>
            <PlayerResultNickname>{result.nickname}</PlayerResultNickname>
          </PlayerResultHeader>
          <PlayerResultCards style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {result.hand.map((card, cardIndex) => (
              <SpiceCardSmall key={cardIndex} card={card} />
            ))}
          </PlayerResultCards>
        </PlayerResultItem>
      ))}

      <GameFinishBottomButton onClick={onClose}>닫기</GameFinishBottomButton>
    </GameFinishContainer>
  );
}
