import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
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
  max-width: 560px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: #ecf0f1;
`;

const Title = styled.h2`
  font-size: 1.4rem;
  color: #e74c3c;
  margin: 0 0 16px;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: #f39c12;
  margin: 0 0 8px;
  border-bottom: 1px solid #333;
  padding-bottom: 4px;
`;

const Text = styled.p`
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 6px;
  color: #bdc3c7;
`;

const CardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  margin-top: 6px;
`;

const Th = styled.th`
  background: #2c3e50;
  padding: 6px 8px;
  text-align: left;
  color: #ecf0f1;
`;

const Td = styled.td`
  padding: 5px 8px;
  border-bottom: 1px solid #2c3e50;
  color: #bdc3c7;
`;

const CloseButton = styled.button`
  display: block;
  margin: 16px auto 0;
  padding: 8px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { background: #c0392b; }
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkulkingHelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>☠ 스컬킹 게임 규칙</Title>

        <Section>
          <SectionTitle>게임 목표</SectionTitle>
          <Text>
            10라운드에 걸쳐 자신의 비드(예측 트릭 수)를 정확히 맞춰 가장 높은 점수를 획득하세요.
          </Text>
        </Section>

        <Section>
          <SectionTitle>진행 방식</SectionTitle>
          <Text>• 라운드 r: 플레이어마다 r장의 카드를 받습니다 (1라운드 1장 ~ 10라운드 10장)</Text>
          <Text>• 비드 단계: 순서대로 이번 라운드에서 딸 트릭 수를 선언합니다 (0 ~ r)</Text>
          <Text>• 트릭 플레이: r번의 트릭을 진행합니다. 리드 플레이어가 먼저 카드를 내고, 나머지가 차례로 냅니다</Text>
          <Text>• 리드 수트가 있으면 같은 수트를 따라가야 합니다 (없으면 자유)</Text>
        </Section>

        <Section>
          <SectionTitle>카드 구성 (66장)</SectionTitle>
          <CardTable>
            <thead>
              <tr>
                <Th>카드</Th>
                <Th>장수</Th>
                <Th>설명</Th>
              </tr>
            </thead>
            <tbody>
              <tr><Td>♠ 검정 (Jolly Roger)</Td><Td>13</Td><Td>Trump 수트 - 다른 수트에 항상 우선</Td></tr>
              <tr><Td>★ 노랑 (Treasure Chest)</Td><Td>13</Td><Td>숫자 수트</Td></tr>
              <tr><Td>♦ 보라 (Jolly Roger)</Td><Td>13</Td><Td>숫자 수트</Td></tr>
              <tr><Td>♣ 초록 (Mermaid's Crown)</Td><Td>13</Td><Td>숫자 수트</Td></tr>
              <tr><Td>E 탈출 (Escape)</Td><Td>5</Td><Td>항상 짐. 절대 트릭을 따지 않음</Td></tr>
              <tr><Td>P 해적 (Pirate)</Td><Td>5</Td><Td>Escape 제외 모든 카드를 이김 (Skull King/Mermaid 제외)</Td></tr>
              <tr><Td>M 인어 (Mermaid)</Td><Td>2</Td><Td>Pirate를 이김. Skull King에게는 짐</Td></tr>
              <tr><Td>☠ 해골왕 (Skull King)</Td><Td>1</Td><Td>모든 카드를 이김. Mermaid만 예외</Td></tr>
              <tr><Td>T 타이그레스 (Tigress)</Td><Td>1</Td><Td>낼 때 Escape 또는 Pirate로 선언</Td></tr>
            </tbody>
          </CardTable>
        </Section>

        <Section>
          <SectionTitle>트릭 승자 판정 순서</SectionTitle>
          <Text>☠ Skull King (Mermaid 없을 때) &gt; M Mermaid (Skull King 있을 때) &gt; P Pirate/Tigress(Pirate) &gt; ♠ 검정 수트(높은 숫자) &gt; 리드 수트(높은 숫자) &gt; 나머지</Text>
          <Text>* E Escape는 항상 집니다</Text>
        </Section>

        <Section>
          <SectionTitle>점수 계산</SectionTitle>
          <Text>• 비드 성공: 비드 × 20점 (비드 0 성공 시: 라운드 수 × 10점)</Text>
          <Text>• 비드 실패: |비드 - 실제| × -10점 (비드 0 실패 시: 라운드 수 × -10점)</Text>
          <Text>• 보너스: ☠ Skull King으로 P Pirate 잡을 때 +30점/마리</Text>
          <Text>• 보너스: M Mermaid가 ☠ Skull King을 잡을 때 +20점</Text>
        </Section>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </Modal>
    </Overlay>
  );
}
