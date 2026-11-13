import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ModalNote,
  RankTable,
  RankRow,
  PrimaryButton,
  SecondaryButton,
} from "../../../styles/game/drawing/modal";
import type { DrawingGameOver } from "../types";

interface Props {
  result: DrawingGameOver;
  myPlayerId: string;
  isHost: boolean;
  onRestart: () => void;
  onClose: () => void;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function DrawingResultModal({ result, myPlayerId, isHost, onRestart, onClose }: Props) {
  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>🏆 최종 결과</ModalTitle>
        {result.reason === "notEnough" && <ModalNote>인원이 부족해 게임이 일찍 끝났습니다.</ModalNote>}
        <RankTable>
          {result.ranking.map((r) => (
            <RankRow key={r.playerId} $isMe={r.playerId === myPlayerId} $top={r.rank === 1}>
              <span>{MEDALS[r.rank - 1] ?? `${r.rank}위`}</span>
              <span>{r.nickname}</span>
              <span>{r.score}점</span>
            </RankRow>
          ))}
        </RankTable>
        {isHost && <PrimaryButton onClick={onRestart}>다시 시작</PrimaryButton>}
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </ModalBox>
    </ModalOverlay>
  );
}
