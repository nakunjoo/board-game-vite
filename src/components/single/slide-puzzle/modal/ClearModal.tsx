import {
  ModalOverlay,
  ModalBox,
  ModalCloseButton,
  ModalStats,
  ModalStatItem,
  ModalButtons,
  ModalButton,
} from "../../../../styles/single/slide-puzzle/modal";
import { formatTime } from "../utils";

interface Props {
  seconds: number;
  moves: number;
  onClose: () => void;
  onRestart: () => void;
}

export default function ClearModal({ seconds, moves, onClose, onRestart }: Props) {
  return (
    <ModalOverlay>
      <ModalBox>
        <ModalCloseButton onClick={onClose}>✕</ModalCloseButton>
        <h2>🎉 클리어!</h2>
        <ModalStats>
          <ModalStatItem>
            <span className="label">시간</span>
            <span className="value">{formatTime(seconds)}</span>
          </ModalStatItem>
          <ModalStatItem>
            <span className="label">이동 횟수</span>
            <span className="value">{moves}</span>
          </ModalStatItem>
        </ModalStats>
        <ModalButtons>
          <ModalButton $primary onClick={onRestart}>
            다시 하기
          </ModalButton>
        </ModalButtons>
      </ModalBox>
    </ModalOverlay>
  );
}
