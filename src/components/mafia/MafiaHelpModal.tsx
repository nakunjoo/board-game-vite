import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  HelpSection,
  SecondaryButton,
} from "../../styles/game/liar/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MafiaHelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>🔪 마피아 규칙</ModalTitle>
        <HelpSection>
          <h3>역할</h3>
          <ul>
            <li>4~5명: 마피아 1명, 경찰 1명, 나머지는 시민입니다.</li>
            <li>6~8명: 마피아 2명, 경찰 1명, 의사 1명, 나머지는 시민입니다.</li>
            <li>내 역할은 나만 압니다. 마피아끼리는 서로를 압니다.</li>
            <li>죽어도 역할은 공개되지 않고, 게임이 끝날 때 모두 공개됩니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>밤 (30초)</h3>
          <ul>
            <li>🔪 마피아: 마피아끼리만 채팅하며 없앨 사람을 누릅니다. 둘이 다르게 고르면 먼저 고른 사람이 대상이 됩니다.</li>
            <li>🚓 경찰: 한 명을 눌러 마피아인지 조사합니다. 결과는 경찰에게만 바로 보입니다.</li>
            <li>💉 의사(6명 이상): 살릴 사람을 누릅니다. 나 자신도 언제든 고를 수 있어요. 마피아가 고른 사람과 같으면 살아납니다.</li>
            <li>🙂 시민과 다른 사람들은 밤에 말할 수 없습니다. 할 일이 다 끝나면 밤이 바로 끝납니다.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>낮</h3>
          <ul>
            <li>밤사이 누가 죽었는지 발표하고, 살아 있는 사람끼리 자유롭게 채팅하며 의심되는 사람을 눌러 투표합니다.</li>
            <li>투표는 시간 안에 바꾸거나 취소할 수 있고, 모두 투표하면 바로 마감됩니다.</li>
            <li>가장 많은 표를 받은 한 명이 처형됩니다. 동점이거나 아무도 투표하지 않으면 아무도 처형되지 않아요.</li>
          </ul>
        </HelpSection>
        <HelpSection>
          <h3>승리</h3>
          <ul>
            <li>시민 팀(경찰·의사 포함): 마피아를 모두 찾아내면 승리.</li>
            <li>마피아: 살아 있는 마피아 수가 나머지와 같아지면 승리.</li>
            <li>죽은 사람은 죽은 사람끼리만 채팅할 수 있고, 산 사람의 대화는 계속 볼 수 있습니다.</li>
            <li>게임 중에 나간 사람은 죽은 것으로 칩니다. 4명보다 적어지면 게임은 무효입니다.</li>
          </ul>
        </HelpSection>
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </ModalBox>
    </ModalOverlay>
  );
}
