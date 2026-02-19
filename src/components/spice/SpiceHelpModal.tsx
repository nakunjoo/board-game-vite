interface SpiceHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpiceHelpModal({ isOpen, onClose }: SpiceHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #2d1a0a 0%, #1a0f05 100%)",
          borderRadius: "20px",
          padding: "10px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#f39c12" }}>
            향신료 게임 설명
          </h2>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "100%",
              color: "#fff",
              width: "35px",
              height: "35px",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={onClose}
          >
            ✕
          </div>
        </div>

        <div style={{ lineHeight: "1.8", fontSize: "1.1rem" }}>
          <h3 style={{ color: "#f39c12", marginTop: "10px", marginBottom: "10px" }}>
            🌶 덱 구성 (100장)
          </h3>
          <div style={{ marginLeft: "10px", color: "#ccc" }}>
            <p>
              <strong style={{ color: "#1a1a1a", background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>후추</strong>
              {" / "}
              <strong style={{ color: "#c0392b" }}>계피</strong>
              {" / "}
              <strong style={{ color: "#f39c12" }}>사프란</strong>
              {" "}: 각 숫자 1~10, 3장씩 = 90장
            </p>
            <p>
              <strong style={{ color: "#8e44ad" }}>숫자 와일드</strong>: 어떤 숫자로도 사용 가능 = 5장
            </p>
            <p>
              <strong style={{ color: "#2980b9" }}>문양 와일드</strong>: 어떤 문양으로도 사용 가능 = 5장
            </p>
          </div>

          <h3 style={{ color: "#f39c12", marginTop: "10px", marginBottom: "10px" }}>
            📋 게임 진행 방식
          </h3>
          <div style={{ marginLeft: "10px", color: "#ccc" }}>
            <p><strong style={{ color: "#fff" }}>1단계: 손패 확인 및 칩 선택</strong></p>
            <p style={{ marginLeft: "10px", marginBottom: "10px" }}>
              • 게임이 시작되면 각자 손패 2장을 받습니다<br />
              • 자신의 손패를 보고 최종 순위를 예측하여 칩을 선택합니다<br />
              • 모든 플레이어가 칩을 선택하면 OK 버튼을 누릅니다
            </p>

            <p><strong style={{ color: "#fff" }}>2단계: 라운드 진행 (4라운드)</strong></p>
            <p style={{ marginLeft: "10px", marginBottom: "10px" }}>
              • 라운드마다 오픈카드가 공개됩니다<br />
              • 1라운드: 손패 2장만<br />
              • 2라운드: 오픈카드 3장 추가<br />
              • 3라운드: 오픈카드 5장<br />
              • 4라운드: 오픈카드 6장 (최종)
            </p>
          </div>

          <h3 style={{ color: "#f39c12", marginTop: "10px", marginBottom: "10px" }}>
            🃏 와일드 카드
          </h3>
          <div style={{ marginLeft: "10px", color: "#ccc" }}>
            • <strong style={{ color: "#8e44ad" }}>와일드-숫자</strong>: 어떤 문양으로도 사용 가능<br />
            • 숫자는 카드에 표시된 숫자 그대로
          </div>
        </div>

        <button
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "10px",
            background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
}
