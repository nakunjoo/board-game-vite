import styled from "styled-components";
import type { RoundResult, GameOverResult } from "./types";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #1a1a2e;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  padding: 24px;
  max-width: 540px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
  color: #ecf0f1;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  color: #e74c3c;
  margin: 0 0 16px;
  text-align: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 16px;
`;

const Th = styled.th`
  background: #2c3e50;
  padding: 8px;
  text-align: center;
  color: #ecf0f1;
  font-size: 0.8rem;
`;

const Td = styled.td<{ $highlight?: boolean; $positive?: boolean; $negative?: boolean }>`
  padding: 7px 8px;
  text-align: center;
  border-bottom: 1px solid #2c3e50;
  color: ${({ $positive, $negative }) =>
    $positive ? "#2ecc71" : $negative ? "#e74c3c" : "#bdc3c7"};
  font-weight: ${({ $highlight }) => ($highlight ? "bold" : "normal")};
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 9px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  background: ${({ $primary }) => ($primary ? "#e74c3c" : "#2c3e50")};
  color: white;
  &:hover {
    opacity: 0.85;
  }
`;

const RankBadge = styled.span<{ $rank: number }>`
  font-weight: bold;
  color: ${({ $rank }) => ($rank === 1 ? "#f39c12" : $rank === 2 ? "#bdc3c7" : $rank === 3 ? "#cd7f32" : "#7f8c8d")};
`;

interface RoundResultModalProps {
  result: RoundResult;
  players: Array<{ playerId: string; nickname: string }>;
  isHost: boolean;
  onNextRound: () => void;
}

export function SkulkingRoundResultModal({ result, players, isHost, onNextRound }: RoundResultModalProps) {
  const { round, bids, tricks, roundScores, totalScores, isLastRound } = result;

  const sortedPlayers = [...players].sort(
    (a, b) => (totalScores[b.playerId] ?? 0) - (totalScores[a.playerId] ?? 0)
  );

  return (
    <Overlay>
      <Modal>
        <Title>{isLastRound ? "🏁 게임 종료" : `라운드 ${round} 결과`}</Title>

        <Table>
          <thead>
            <tr>
              <Th>플레이어</Th>
              <Th>비드</Th>
              <Th>획득</Th>
              <Th>라운드 점수</Th>
              <Th>누적 점수</Th>
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
                  <Td>{p.nickname}</Td>
                  <Td>{bid}</Td>
                  <Td>{trick}</Td>
                  <Td $positive={success && rs > 0} $negative={!success || rs < 0}>
                    {rs > 0 ? `+${rs}` : rs}
                  </Td>
                  <Td $highlight>{ts}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {isHost && (
          <ButtonRow>
            <Button $primary onClick={onNextRound}>
              {isLastRound ? "최종 결과 보기" : "다음 라운드"}
            </Button>
          </ButtonRow>
        )}
        {!isHost && (
          <p style={{ textAlign: "center", color: "#7f8c8d", fontSize: "0.85rem" }}>
            방장이 다음 라운드를 시작할 때까지 기다려주세요
          </p>
        )}
      </Modal>
    </Overlay>
  );
}

interface GameOverModalProps {
  result: GameOverResult;
  players: Array<{ playerId: string; nickname: string }>;
  isHost: boolean;
  onRestart?: () => void;
}

export function SkulkingGameOverModal({ result, players, isHost, onRestart }: GameOverModalProps) {
  const { ranking } = result;

  return (
    <Overlay>
      <Modal>
        <Title>🏆 최종 결과</Title>

        <Table>
          <thead>
            <tr>
              <Th>순위</Th>
              <Th>플레이어</Th>
              <Th>최종 점수</Th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((p) => (
              <tr key={p.playerId}>
                <Td>
                  <RankBadge $rank={p.rank}>
                    {p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : p.rank}
                  </RankBadge>
                </Td>
                <Td $highlight={p.rank === 1}>{p.nickname}</Td>
                <Td $highlight={p.rank === 1} $positive={p.score > 0} $negative={p.score < 0}>
                  {p.score}점
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>

        {isHost && onRestart && (
          <ButtonRow>
            <Button $primary onClick={onRestart}>다시 시작</Button>
          </ButtonRow>
        )}
      </Modal>
    </Overlay>
  );
}
