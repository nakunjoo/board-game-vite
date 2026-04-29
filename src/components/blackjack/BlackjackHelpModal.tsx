import {
  BjModalOverlay,
  BjModalBox,
  BjModalTitle,
  BjResultSection,
  BjCancelBtn,
} from "../../styles/game/blackjack/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlackjackHelpModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <BjModalOverlay onClick={onClose}>
      <BjModalBox onClick={(e) => e.stopPropagation()}>
        <BjModalTitle>블랙잭 규칙</BjModalTitle>

        <BjResultSection>
          <div style={{ color: "#f1c40f", fontWeight: 700, marginBottom: 6 }}>🎯 목표</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            딜러보다 높되 21을 넘지 않는 패를 만들어 이기세요.<br />
            <strong>블랙잭(A + 10계열)</strong>은 1.5배 배당을 받습니다.
          </div>
        </BjResultSection>

        <BjResultSection>
          <div style={{ color: "#f1c40f", fontWeight: 700, marginBottom: 6 }}>🃏 카드 계산</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            • 숫자 카드: 표시 숫자 그대로<br />
            • J, Q, K: 10점<br />
            • A: 1 또는 11 (유리한 쪽으로 자동 계산)
          </div>
        </BjResultSection>

        <BjResultSection>
          <div style={{ color: "#f1c40f", fontWeight: 700, marginBottom: 6 }}>⚡ 액션</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            • <strong>히트(Hit)</strong>: 카드 한 장 더 받기<br />
            • <strong>스탠드(Stand)</strong>: 현재 패로 멈추기<br />
            • <strong>더블다운</strong>: 베팅 2배 + 카드 1장만 더 받기<br />
            • <strong>스플릿</strong>: 같은 값 카드 2장을 2개 핸드로 분리
          </div>
        </BjResultSection>

        <BjResultSection>
          <div style={{ color: "#f1c40f", fontWeight: 700, marginBottom: 6 }}>🏦 딜러 규칙</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            딜러는 17 이상이 될 때까지 반드시 히트합니다.
          </div>
        </BjResultSection>

        <BjResultSection>
          <div style={{ color: "#f1c40f", fontWeight: 700, marginBottom: 6 }}>💰 배당</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            • 일반 승리: 베팅액 × 2 (1배 수익)<br />
            • 블랙잭 승리: 베팅액 + 베팅액 × 1.5<br />
            • 무승부(Push): 베팅액 반환<br />
            • 패배: 베팅액 몰수<br />
            • 버스트(21 초과): 즉시 패배
          </div>
        </BjResultSection>

        <BjResultSection>
          <div style={{ color: "#f1c40f", fontWeight: 700, marginBottom: 6 }}>⏱ 타이머</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            액션 제한 시간은 30초입니다.<br />
            시간 내 선택하지 않으면 자동으로 스탠드 처리됩니다.
          </div>
        </BjResultSection>

        <BjCancelBtn onClick={onClose}>닫기</BjCancelBtn>
      </BjModalBox>
    </BjModalOverlay>
  );
}
