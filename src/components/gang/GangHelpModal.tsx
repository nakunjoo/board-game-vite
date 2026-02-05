interface GangHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GangHelpModal({ isOpen, onClose }: GangHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: '20px',
          padding: '10px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', color: '#667eea' }}>게임 설명</h2>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              color: '#fff',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
          <h3 style={{ color: '#4caf50', marginTop: '10px', marginBottom: '10px' }}>🎯 게임 목표</h3>
          <p style={{ marginLeft: '10px', color: '#ccc' }}>
            3명의 플레이어가 협력하여 포커 족보를 순서대로 맞추는 협동 게임입니다.
            <br />
            <strong style={{ color: '#fff' }}>3번 성공하면 승리, 3번 실패하면 게임 오버!</strong>
          </p>

          <h3 style={{ color: '#4caf50', marginTop: '10px', marginBottom: '10px' }}>📋 게임 진행 방식</h3>
          <div style={{ marginLeft: '10px', color: '#ccc' }}>
            <p><strong style={{ color: '#fff' }}>1단계: 손패 확인 및 칩 선택</strong></p>
            <p style={{ marginLeft: '10px', marginBottom: '10px' }}>
              • 게임이 시작되면 각자 손패 2장을 받습니다<br />
              • 자신의 손패를 보고 최종 족보 순위를 예측합니다<br />
              • <strong style={{ color: '#fff' }}>칩 번호 = 최종 순위 (1번이 가장 낮은 족보, 3번이 가장 높은 족보)</strong><br />
              • 다른 플레이어가 선택한 칩도 다시 클릭하여 빼앗을 수 있습니다!<br />
              • 모든 플레이어가 칩을 선택하면 OK 버튼을 누릅니다
            </p>

            <p><strong style={{ color: '#fff' }}>2단계: 카드 배분 (4라운드)</strong></p>
            <p style={{ marginLeft: '10px', marginBottom: '10px' }}>
              • 라운드마다 카드가 공개되며, 손패 2장과 함께 족보를 만듭니다<br />
              • 1라운드: 손패 2장만 (오픈카드 없음)<br />
              • 2라운드: 오픈카드 3장 추가<br />
              • 3라운드: 오픈카드 5장<br />
              • 4라운드: 오픈카드 6장 (최종)
            </p>

            <p><strong style={{ color: '#fff' }}>3단계: 결과 판정</strong></p>
            <p style={{ marginLeft: '10px', marginBottom: '10px' }}>
              • 칩 번호 순서대로 족보가 낮음 → 높음으로 올라가면 <strong style={{ color: '#4caf50' }}>성공</strong><br />
              • 순서가 맞지 않으면 <strong style={{ color: '#f44336' }}>실패</strong><br />
              • 같은 족보도 성공으로 인정됩니다 (예: 원페어 ≤ 원페어 ≤ 투페어)
            </p>
          </div>

          <h3 style={{ color: '#4caf50', marginTop: '10px', marginBottom: '10px' }}>💡 전략 팁</h3>
          <div style={{ marginLeft: '10px', color: '#ccc' }}>
            • 처음 받은 손패 2장으로 최종 족보를 예측하세요<br />
            • 중간 정도의 손패라면 중간 번호 칩이 안전합니다<br />
            • 상대가 선택한 칩을 빼앗아서 순서를 조정할 수 있어요<br />
            • 예측이 빗나가도 괜찮아요! 협력해서 다시 도전하세요
          </div>

          <h3 style={{ color: '#4caf50', marginTop: '10px', marginBottom: '10px' }}>🏆 승리 조건</h3>
          <div style={{ marginLeft: '10px', color: '#ccc' }}>
            • 3번 성공: 최종 승리 🎉<br />
            • 3번 실패: 게임 오버 😢
          </div>
        </div>

        <button
          style={{
            width: '100%',
            padding: '15px',
            marginTop: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
