import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Box = styled.div`
  background: linear-gradient(160deg, #0d2e17 0%, #0a1e0f 100%);
  border: 1px solid rgba(240, 192, 64, 0.35);
  border-radius: 14px;
  padding: 1.5rem;
  width: 92%;
  max-width: 420px;
  max-height: 82vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #f0c040;
  text-align: center;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const SectionTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #f0c040;
  border-bottom: 1px solid rgba(240, 192, 64, 0.2);
  padding-bottom: 4px;
  margin-bottom: 2px;
`;

const Text = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: #ccc;
  line-height: 1.65;
  white-space: pre-line;
`;

export const PayTable = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
`;

export const PayLabel = styled.span`
  font-size: 0.8rem;
  color: #ccc;
`;

export const PayValue = styled.span`
  font-size: 0.8rem;
  color: #f0c040;
  font-weight: 700;
  text-align: right;
`;

const CloseBtn = styled.button`
  align-self: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.6rem;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.18); }
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function GameHelpModal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;
  return (
    <Overlay onClick={onClose}>
      <Box onClick={(e) => e.stopPropagation()}>
        <Title>{title}</Title>
        {children}
        <CloseBtn onClick={onClose}>닫기</CloseBtn>
      </Box>
    </Overlay>
  );
}

export function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </Section>
  );
}

export { Text as HelpText };
