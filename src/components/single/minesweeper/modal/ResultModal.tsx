import type { BestRecord } from "../types";
import { formatTime } from "../utils";
import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ResultEmoji,
  ResultTime,
  BestRecordBox,
  ActionButton,
  CloseButton,
} from "../../../../styles/single/minesweeper/modal";

interface Props {
  isWon: boolean;
  seconds: number;
  best: BestRecord | null;
  onRestart: () => void;
  onNewGame: () => void;
  onClose: () => void;
}

export default function ResultModal({ isWon, seconds, best, onRestart, onNewGame, onClose }: Props) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} title="닫기">✕</CloseButton>
        <ResultEmoji>{isWon ? "😎" : "😵"}</ResultEmoji>
        <ModalTitle>{isWon ? "성공!" : "실패..."}</ModalTitle>
        <ResultTime>{formatTime(seconds)}</ResultTime>
        {isWon && best && (
          <BestRecordBox>🏆 최고 기록: {formatTime(best.time)}</BestRecordBox>
        )}
        <ActionButton onClick={onRestart}>다시하기</ActionButton>
        <ActionButton $secondary onClick={onNewGame}>
          난이도 변경
        </ActionButton>
      </ModalBox>
    </ModalOverlay>
  );
}
