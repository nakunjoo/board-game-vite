import type { RoundResult, GameOverResult } from "../types";
import {
  ResultOverlay,
  ResultModal,
  ResultTitle,
  ResultTable,
  ResultTh,
  ResultTd,
  ResultButtonRow,
  ResultButton,
  RankBadge,
} from "../../../styles/game/skulking/resultModal";

interface RoundResultModalProps {
  result: RoundResult;
  players: Array<{ playerId: string; nickname: string }>;
  isHost: boolean;
  onNextRound: () => void;
}

export function SkulkingRoundResultModal({
  result,
  players,
  isHost,
  onNextRound,
}: RoundResultModalProps) {
  const { round, bids, tricks, roundScores, totalScores, isLastRound } = result;

  const sortedPlayers = [...players].sort(
    (a, b) => (totalScores[b.playerId] ?? 0) - (totalScores[a.playerId] ?? 0),
  );

  return (
    <ResultOverlay>
      <ResultModal>
        <ResultTitle>
          {isLastRound ? "🏁 게임 종료" : `라운드 ${round} 결과`}
        </ResultTitle>

        <ResultTable>
          <thead>
            <tr>
              <ResultTh>플레이어</ResultTh>
              <ResultTh>비드</ResultTh>
              <ResultTh>획득</ResultTh>
              <ResultTh>라운드 점수</ResultTh>
              <ResultTh>누적 점수</ResultTh>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((p) => {
              const bid = bids[p.playerId] ?? 0;
              const trick = tricks[p.playerId] ?? 0;
              const rs = roundScores[p.playerId] ?? 0;
              const ts = totalScores[p.playerId] ?? 0;
              const success = bid === trick;
              return (
                <tr key={p.playerId}>
                  <ResultTd>{p.nickname}</ResultTd>
                  <ResultTd>{bid}</ResultTd>
                  <ResultTd>{trick}</ResultTd>
                  <ResultTd
                    $positive={success && rs > 0}
                    $negative={!success || rs < 0}
                  >
                    {rs > 0 ? `+${rs}` : rs}
                  </ResultTd>
                  <ResultTd $highlight>{ts}</ResultTd>
                </tr>
              );
            })}
          </tbody>
        </ResultTable>

        {isHost && (
          <ResultButtonRow>
            <ResultButton $primary onClick={onNextRound}>
              {isLastRound ? "최종 결과 보기" : "다음 라운드"}
            </ResultButton>
          </ResultButtonRow>
        )}
        {!isHost && (
          <p
            style={{
              textAlign: "center",
              color: "#7f8c8d",
              fontSize: "0.85rem",
            }}
          >
            방장이 다음 라운드를 시작할 때까지 기다려주세요
          </p>
        )}
      </ResultModal>
    </ResultOverlay>
  );
}

interface GameOverModalProps {
  result: GameOverResult;
  players: Array<{ playerId: string; nickname: string }>;
  isHost: boolean;
  onRestart?: () => void;
}

export function SkulkingGameOverModal({
  result,
  isHost,
  onRestart,
}: GameOverModalProps) {
  const { ranking } = result;

  return (
    <ResultOverlay>
      <ResultModal>
        <ResultTitle>🏆 최종 결과</ResultTitle>

        <ResultTable>
          <thead>
            <tr>
              <ResultTh>순위</ResultTh>
              <ResultTh>플레이어</ResultTh>
              <ResultTh>최종 점수</ResultTh>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p) => (
              <tr key={p.playerId}>
                <ResultTd>
                  <RankBadge $rank={p.rank}>
                    {p.rank === 1
                      ? "🥇"
                      : p.rank === 2
                        ? "🥈"
                        : p.rank === 3
                          ? "🥉"
                          : p.rank}
                  </RankBadge>
                </ResultTd>
                <ResultTd $highlight={p.rank === 1}>{p.nickname}</ResultTd>
                <ResultTd
                  $highlight={p.rank === 1}
                  $positive={p.score > 0}
                  $negative={p.score < 0}
                >
                  {p.score}점
                </ResultTd>
              </tr>
            ))}
          </tbody>
        </ResultTable>

        {isHost && onRestart && (
          <ResultButtonRow>
            <ResultButton $primary onClick={onRestart}>
              다시 시작
            </ResultButton>
          </ResultButtonRow>
        )}
      </ResultModal>
    </ResultOverlay>
  );
}
