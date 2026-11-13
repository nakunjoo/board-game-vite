import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ModalNote,
  ChoiceList,
  ChoiceButton,
} from "../../../styles/game/drawing/modal";

interface Props {
  choices: string[];
  secondsLeft: number;
  onChoose: (index: number) => void;
}

export default function DrawingChoiceModal({ choices, secondsLeft, onChoose }: Props) {
  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>그릴 제시어를 고르세요</ModalTitle>
        <ChoiceList>
          {choices.map((word, i) => (
            <ChoiceButton key={word} onClick={() => onChoose(i)}>
              {word}
            </ChoiceButton>
          ))}
        </ChoiceList>
        <ModalNote>{secondsLeft}초 안에 안 고르면 자동으로 정해집니다</ModalNote>
      </ModalBox>
    </ModalOverlay>
  );
}
