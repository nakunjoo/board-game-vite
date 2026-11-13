import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  HelpSection,
  SecondaryButton,
} from "../../styles/game/drawing/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawingHelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>🎨 그림 맞히기 규칙</ModalTitle>
        <HelpSection>
          <h3>진행</h3>
          <ul>
            <li>3~6명. 돌아가며 한 명씩 그리고, 모두 한 번씩 그리면 한 바퀴입니다.</li>
            <li>그리는 사람은 제시어 3개 중 하나를 10초 안에 고릅니다.</li>
            <li>나머지는 아래 입력칸에 정답을 칩니다. 맞히면 답은 다른 사람에게 보이지 않습니다.</li>
            <li>시간이 절반 지나면 초성, 10초 남으면 한 글자가 공개됩니다.</li>
            <li>모두 맞히거나 시간이 끝나면 정답을 공개하고 다음 사람 차례입니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>점수</h3>
          <ul>
            <li>맞힌 사람: 빨리 맞힐수록 많이 받습니다 (100점 → 40점). 첫 정답은 +20점.</li>
            <li>그린 사람: 한 명이 맞힐 때마다 +30점.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>알아두기</h3>
          <ul>
            <li>한 글자만 틀리면 나에게만 "거의 맞았어요"가 보입니다.</li>
            <li>이미 맞힌 사람의 말은 맞힌 사람과 그리는 사람에게만 보입니다.</li>
            <li>그리는 사람이 10초 넘게 연결이 끊기면 그 차례는 넘어갑니다.</li>
            <li>오른쪽 위 버튼으로 말풍선 모드와 채팅창 모드를 바꿀 수 있습니다.</li>
          </ul>
        </HelpSection>
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </ModalBox>
    </ModalOverlay>
  );
}
