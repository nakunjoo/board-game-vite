import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
`;

const Box = styled.div`
  background: linear-gradient(160deg, #0d2e17 0%, #0a1e0f 100%);
  border: 1px solid rgba(240, 192, 64, 0.35);
  border-radius: 14px;
  padding: 2rem;
  width: 92%;
  max-width: 440px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f0c040;
  text-align: center;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const SectionTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #f0c040;
`;

const Text = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #ccc;
  line-height: 1.6;
`;

const CloseBtn = styled.button`
  align-self: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ccc;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.6rem 1.6rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;

interface CasinoHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CasinoHelpModal({ isOpen, onClose }: CasinoHelpModalProps) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <Title>🎰 카지노 게임 안내</Title>

        <Section>
          <SectionTitle>게임 목표</SectionTitle>
          <Text>
            정해진 시간 동안 다양한 카지노 게임을 즐기며 초기 자금을 최대한 불려 최종 순위에서 높은 자리를 차지하세요.
          </Text>
        </Section>

        <Section>
          <SectionTitle>게임 진행</SectionTitle>
          <Text>
            방장이 게임 시간과 초기 자금을 설정하고 시작합니다.
            게임 허브에서 원하는 카지노 게임을 자유롭게 선택해 플레이할 수 있습니다.
            다른 플레이어들의 실시간 잔액 순위는 우측 리더보드에서 확인하세요.
          </Text>
        </Section>

        <Section>
          <SectionTitle>제공 게임</SectionTitle>
          <Text>
            🎡 룰렛 — 숫자/색상에 베팅{"\n"}
            🎰 슬롯머신 — 릴 스핀{"\n"}
            🃏 바카라 — 플레이어/뱅커 선택{"\n"}
            ♠ 블랙잭 — 21에 가까운 패{"\n"}
            🎲 비디오 포커 — 포커 족보 완성
          </Text>
        </Section>

        <Section>
          <SectionTitle>게임 종료</SectionTitle>
          <Text>
            설정된 시간이 지나면 자동으로 종료됩니다.
            과반수 이상이 "게임 종료 투표"에 동의하면 즉시 종료할 수 있습니다.
          </Text>
        </Section>

        <CloseBtn onClick={onClose}>닫기</CloseBtn>
      </Box>
    </Overlay>
  );
}
