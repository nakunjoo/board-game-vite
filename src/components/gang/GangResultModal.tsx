import {
  GameFinishContainer,
  GameFinishHeader,
  GameFinishTitle,
  GameFinishCloseButton,
  GameFinishActions,
  GameFinishActionButton,
  GameFinishBottomButton,
  PreviousChip,
} from "../../styles/game";
import {
  OpenCardsDisplay,
  OpenCardDisplayImage,
  PlayerResultItem,
  PlayerResultHeader,
  PlayerResultNickname,
  PlayerResultChips,
  PlayerResultCards,
  PlayerResultCard,
  PlayerResultRank,
  ResultStatus,
} from "../../styles/game";
import type { Card } from "../../types/game";
import { evaluateHand, type HandResult } from "../../utils/poker";
import type { PlayerResult } from "./types";

interface GangResultModalProps {
  // 결과 데이터
  playerResults: PlayerResult[];
  openCards: Card[];

  // UI 상태
  showResults: boolean;
  isNextRoundReady: boolean;
  nextRoundReadyPlayers: string[];
  memberCount: number;
  gameOver: boolean;
  gameOverResult: 'victory' | 'defeat' | null;
  isHost: boolean;

  // 이벤트 핸들러
  onClose: () => void;
  onShowResults: () => void;
  onNextRound: () => void;
  onRestart: () => void;
}

export default function GangResultModal({
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
}: GangResultModalProps) {
  if (!showResults) {
    return (
      <GameFinishActions>
        <GameFinishActionButton onClick={onShowResults}>
          결과 보기
        </GameFinishActionButton>
        {gameOver ? (
          isHost && (
            <GameFinishActionButton
              $variant="secondary"
              onClick={onRestart}
            >
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
              : '다음 라운드 진행'}
          </GameFinishActionButton>
        )}
      </GameFinishActions>
    );
  }

  // chips 배열의 마지막 숫자를 기준으로 정렬
  const sortedResults = [...playerResults].sort((a, b) => {
    const aLastChip = a.chips.length > 0 ? a.chips[a.chips.length - 1] : 0;
    const bLastChip = b.chips.length > 0 ? b.chips[b.chips.length - 1] : 0;
    return aLastChip - bLastChip;
  });

  // 모든 플레이어의 족보 계산 (정렬된 순서대로)
  const allRanks = sortedResults.map((r) => evaluateHand(r.hand, openCards));

  // 족보 비교 함수 (a가 b보다 낮거나 같으면 true)
  const isLowerOrEqualRank = (a: HandResult, b: HandResult): boolean => {
    if (a.score !== b.score) return a.score < b.score;

    // 같은 족보일 때 tiebreakers로 비교
    for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
      const aVal = a.tiebreakers[i] || 0;
      const bVal = b.tiebreakers[i] || 0;
      if (aVal !== bVal) return aVal < bVal;
    }
    return true; // 완전히 같으면 true (이하 조건)
  };

  // 전체 게임 성공 여부: 모든 플레이어가 순서대로 족보가 올라가야 함 (1 <= 2 <= 3)
  let isGameSuccess = true;
  for (let i = 0; i < allRanks.length - 1; i++) {
    if (!isLowerOrEqualRank(allRanks[i], allRanks[i + 1])) {
      isGameSuccess = false;
      break;
    }
  }

  return (
    <GameFinishContainer>
      <GameFinishHeader>
        <GameFinishTitle $isSuccess={isGameSuccess}>
          {gameOver
            ? gameOverResult === 'victory'
              ? '최종 승리!'
              : '최종 패배...'
            : `게임 종료 - ${isGameSuccess ? '성공' : '실패'}`}
        </GameFinishTitle>
        <GameFinishCloseButton onClick={onClose}>
          ✕
        </GameFinishCloseButton>
      </GameFinishHeader>
      <OpenCardsDisplay>
        {openCards.map((card, index) => (
          <OpenCardDisplayImage
            key={index}
            src={card.image}
            alt={card.name}
          />
        ))}
      </OpenCardsDisplay>
      {sortedResults.map((result, index) => {
        const handRank = evaluateHand(result.hand, openCards);

        let isWinner = false;
        let isLoser = false;

        // 각 플레이어는 이전 플레이어보다 높거나 같은 족보를 가져야 성공
        if (index === 0) {
          // 첫 번째 플레이어: 다음 플레이어보다 낮거나 같으면 성공
          if (index < allRanks.length - 1) {
            isWinner = isLowerOrEqualRank(allRanks[index], allRanks[index + 1]);
            isLoser = !isWinner;
          } else {
            isWinner = isGameSuccess;
          }
        } else {
          // 나머지 플레이어: 이전 플레이어보다 높거나 같고, 다음 플레이어보다 낮거나 같으면 성공
          const higherOrEqualThanPrev = isLowerOrEqualRank(allRanks[index - 1], allRanks[index]);
          const lowerOrEqualThanNext = index < allRanks.length - 1 ? isLowerOrEqualRank(allRanks[index], allRanks[index + 1]) : true;
          isWinner = higherOrEqualThanPrev && lowerOrEqualThanNext;
          isLoser = !isWinner;
        }

        return (
          <PlayerResultItem key={index} $isWinner={isWinner} $isLoser={isLoser}>
            <PlayerResultHeader>
              <PlayerResultNickname>
                {result.nickname}
              </PlayerResultNickname>
              <PlayerResultChips>
                {result.chips.map((chip, chipIndex) => (
                  <PreviousChip key={chipIndex} $state={chipIndex}>
                    {chip}
                  </PreviousChip>
                ))}
              </PlayerResultChips>
            </PlayerResultHeader>
            <PlayerResultCards>
              {result.hand.map((card, cardIndex) => (
                <PlayerResultCard
                  key={cardIndex}
                  src={card.image}
                  alt={card.name}
                />
              ))}
            </PlayerResultCards>
            <PlayerResultRank $isWinner={isWinner} $isLoser={isLoser}>
              {handRank.detailName}
              <ResultStatus $isWinner={isWinner}>
                {isLoser ? ' (실패)' : ' (성공)'}
              </ResultStatus>
            </PlayerResultRank>
          </PlayerResultItem>
        );
      })}
      <GameFinishBottomButton onClick={onClose}>
        닫기
      </GameFinishBottomButton>
    </GameFinishContainer>
  );
}
