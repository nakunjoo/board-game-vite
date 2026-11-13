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
        <ModalTitle>🎨 끄적끄적 규칙</ModalTitle>
        <HelpSection>
          <h3>진행</h3>
          <ul>
            <li>2~6명. 처음엔 선뽑기로 가장 큰 숫자를 뽑은 사람이 그립니다.</li>
            <li>그리는 사람은 제시어 3개 중 하나를 10초 안에 고릅니다.</li>
            <li>나머지는 아래 입력칸에 정답을 칩니다. 가장 먼저 맞힌 사람이 다음에 그립니다.</li>
            <li>그리는 시간이 끝나면 그림은 그대로 두고 30초 더 맞힐 수 있습니다.</li>
            <li>시간이 절반 지나면 초성, 그리기가 끝나면 한 글자가 공개됩니다.</li>
            <li>아무도 못 맞히면 바로 다음 그림으로 넘어가고, 차례는 자리 순서로 다음 사람에게 갑니다.</li>
            <li>그림 수는 (시작 인원 × 바퀴 수)개입니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>점수</h3>
          <ul>
            <li>빨리 맞힐수록 많이 받습니다 (100점 → 40점).</li>
            <li>맞힌 사람과 그린 사람이 같은 점수를 받습니다. 알아보기 쉽게 그릴수록 이득입니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>알아두기</h3>
          <ul>
            <li>한 글자만 틀리면 나에게만 "거의 맞았어요"가 보입니다.</li>
            <li>그리는 사람이 10초 넘게 연결이 끊기면 그 차례는 넘어갑니다.</li>
            <li>오른쪽 위 버튼으로 말풍선 모드와 채팅창 모드를 바꿀 수 있습니다.</li>
          </ul>
        </HelpSection>
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </ModalBox>
    </ModalOverlay>
  );
}
