import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  HelpSection,
  SecondaryButton,
} from "../../styles/game/liar/modal";
import { LIAR_CITIZEN_POINTS, LIAR_WIN_POINTS } from "../../utils/games/liar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiarHelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>🤥 라이어 규칙</ModalTitle>
        <HelpSection>
          <h3>진행</h3>
          <ul>
            <li>3~8명. 모두 같은 주제와 제시어를 받는데, 한 명(라이어)만 같은 주제의 다른 단어를 받습니다.</li>
            <li>라이어에게도 라이어라고 알려주지 않습니다. 남들 설명이 내 단어와 묘하게 안 맞으면 내가 라이어일 수 있어요.</li>
            <li>정해진 순서대로 한 사람씩 30초 안에 제시어를 한 줄로 설명합니다. 너무 자세하면 라이어가 눈치채고, 너무 애매하면 라이어로 의심받습니다.</li>
            <li>설명이 끝나면 자유롭게 채팅하며 라이어로 의심되는 사람의 이름을 눌러 투표합니다. 시간 안에는 몇 번이든 바꿀 수 있고, 모두 투표하면 바로 마감됩니다.</li>
            <li>가장 많이 지목된 사람이 라이어면, 라이어에게 20초 동안 시민들의 제시어를 맞힐 기회가 한 번 있습니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>승패와 점수</h3>
          <ul>
            <li>라이어 승리 (+{LIAR_WIN_POINTS}점): 표가 갈리거나 아무도 투표하지 않음, 엉뚱한 사람을 지목, 지목된 라이어가 제시어를 맞힘.</li>
            <li>시민 승리: 라이어를 지목했고 라이어가 제시어를 못 맞힘. 이때 라이어에게 투표한 시민만 +{LIAR_CITIZEN_POINTS}점 (엉뚱한 사람을 찍었거나 투표하지 않았으면 0점).</li>
            <li>정해진 판 수가 끝나면 점수가 가장 높은 사람이 1등입니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>알아두기</h3>
          <ul>
            <li>자기 제시어가 그대로 들어간 말은 보낼 수 없습니다.</li>
            <li>설명은 가운데 설명판에 쌓이고, 차례가 아닌 사람은 그동안에도 아래 채팅으로 이야기할 수 있습니다.</li>
            <li>설명 차례에 연결이 끊기면 그 차례는 넘어가고, 라이어가 나가면 그 판은 무효입니다.</li>
          </ul>
        </HelpSection>
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </ModalBox>
    </ModalOverlay>
  );
}
