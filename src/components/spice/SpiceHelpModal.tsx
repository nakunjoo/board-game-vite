import { SpiceSuitIcon } from "./game/SpiceCard";

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
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
          color: "#fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.6rem", color: "#f39c12" }}>
            🌶 향신료 게임 설명
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

        <div style={{ lineHeight: "1.7", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* 게임 목표 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>🎯 게임 목표</h3>
            <p style={{ color: "#ccc", margin: 0 }}>
              블러핑과 심리전으로 상대를 속이며 손패를 비우거나, 가장 높은 점수를 획득하면 승리합니다.
            </p>
          </section>

          {/* 덱 구성 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>🃏 덱 구성 (총 100장)</h3>
            <div style={{ color: "#ccc", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SpiceSuitIcon type="pepper" color="#27ae60" size={20} />
                <span><strong style={{ color: "#27ae60" }}>후추</strong> : 숫자 1~10, 각 3장 = 30장</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SpiceSuitIcon type="cinnamon" color="#c0392b" size={20} />
                <span><strong style={{ color: "#c0392b" }}>계피</strong> : 숫자 1~10, 각 3장 = 30장</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SpiceSuitIcon type="saffron" color="#f39c12" size={20} />
                <span><strong style={{ color: "#f39c12" }}>사프란</strong> : 숫자 1~10, 각 3장 = 30장</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SpiceSuitIcon type="wild-number" color="#8e44ad" size={20} />
                <span><strong style={{ color: "#8e44ad" }}>숫자 와일드</strong> : 어떤 숫자로도 선언 가능 = 5장</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <SpiceSuitIcon type="wild-suit" color="#2980b9" size={20} />
                <span><strong style={{ color: "#2980b9" }}>문양 와일드</strong> : 어떤 향신료로도 선언 가능 = 5장</span>
              </div>
            </div>
          </section>

          {/* 진행 방식 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>📋 진행 방식</h3>
            <div style={{ color: "#ccc", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <strong style={{ color: "#fff" }}>① 선뽑기</strong>
                <p style={{ margin: "4px 0 0 12px" }}>
                  게임 시작 전 1~10 카드를 뽑아 가장 높은 숫자를 뽑은 플레이어가 첫 턴을 가집니다.
                </p>
              </div>
              <div>
                <strong style={{ color: "#fff" }}>② 카드 내기</strong>
                <p style={{ margin: "4px 0 0 12px" }}>
                  자신의 차례에 <strong style={{ color: "#f39c12" }}>향신료와 숫자를 선언</strong>하며 카드를 뒷면으로 냅니다.<br />
                  숫자는 앞사람보다 반드시 <strong style={{ color: "#e74c3c" }}>크게</strong> 선언해야 합니다.<br />
                  숫자 10 이후에는 리셋되어 1~3부터 다시 시작하며, 이때 향신료를 바꿀 수 있습니다.<br />
                  낼 카드가 없거나 싫으면 <strong style={{ color: "#aaa" }}>패스</strong> (덱에서 카드 1장 드로우).
                </p>
              </div>
              <div>
                <strong style={{ color: "#fff" }}>③ 제한시간</strong>
                <p style={{ margin: "4px 0 0 12px" }}>
                  턴 제한시간: <strong style={{ color: "#e74c3c" }}>30초</strong>. 초과 시 자동 패스.<br />
                  도전 가능 시간: <strong style={{ color: "#f39c12" }}>5초</strong>. 초과 시 자동으로 다음 턴 진행.
                </p>
              </div>
            </div>
          </section>

          {/* 도전 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>⚔️ 도전 (Challenge)</h3>
            <div style={{ color: "#ccc", display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ margin: 0 }}>상대가 카드를 낸 후 5초 이내에 도전 가능. 두 가지 중 선택:</p>
              <div style={{ marginLeft: "12px" }}>
                <div>• <strong style={{ color: "#e74c3c" }}>숫자 도전</strong>: "향신료는 맞지만 숫자가 거짓말이다!"</div>
                <div>• <strong style={{ color: "#8e44ad" }}>향신료 도전</strong>: "숫자는 맞지만 향신료가 거짓말이다!"</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div><strong style={{ color: "#8e44ad" }}>🟣 숫자 와일드</strong>로 낸 경우</div>
                <div style={{ marginLeft: "12px" }}>숫자 도전 → 항상 실패 (숫자는 언제나 참)</div>
                <div style={{ marginLeft: "12px" }}>향신료 도전 → 항상 성공 (향신료가 없음)</div>
                <div style={{ marginTop: "4px" }}><strong style={{ color: "#2980b9" }}>🔵 문양 와일드</strong>로 낸 경우</div>
                <div style={{ marginLeft: "12px" }}>향신료 도전 → 항상 실패 (향신료는 언제나 참)</div>
                <div style={{ marginLeft: "12px" }}>숫자 도전 → 항상 성공 (숫자가 없음)</div>
                <div style={{ color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>※ 도전자는 실제 카드를 모르므로 두 도전 모두 선택 가능</div>
              </div>
              <div style={{ background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: "8px", padding: "8px 12px" }}>
                <strong style={{ color: "#e74c3c" }}>도전 성공</strong> (상대가 거짓말)<br />
                <span style={{ fontSize: "0.88rem" }}>→ 도전자: 더미 전체 획득 · 거짓말한 사람: 덱에서 2장 드로우</span>
              </div>
              <div style={{ background: "rgba(41,128,185,0.1)", border: "1px solid rgba(41,128,185,0.3)", borderRadius: "8px", padding: "8px 12px" }}>
                <strong style={{ color: "#2980b9" }}>도전 실패</strong> (상대가 진실)<br />
                <span style={{ fontSize: "0.88rem" }}>→ 도전자: 덱에서 2장 드로우 · 상대방: 더미 전체 획득</span>
              </div>
            </div>
          </section>

          {/* 트로피 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>🏆 트로피</h3>
            <p style={{ color: "#ccc", margin: 0 }}>
              손패를 모두 비우면 <strong style={{ color: "#f39c12" }}>트로피 1개</strong> 획득 (+10점).
              이후 덱에서 새 손패를 받아 계속 게임합니다.
            </p>
          </section>

          {/* 게임 종료 & 점수 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>🏁 게임 종료 & 점수</h3>
            <p style={{ color: "#ccc", margin: "0 0 8px 0" }}>한 플레이어가 손패를 비우거나, 덱이 떨어지면 종료.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", color: "#ccc" }}>
              <div>➕ 따낸 카드 1장당 <strong style={{ color: "#2ecc71" }}>+1점</strong></div>
              <div>➕ 트로피 1개당 <strong style={{ color: "#f39c12" }}>+10점</strong></div>
              <div>➖ 손에 남은 카드 1장당 <strong style={{ color: "#e74c3c" }}>-1점</strong></div>
            </div>
          </section>

          {/* 전략 팁 */}
          <section>
            <h3 style={{ color: "#f39c12", margin: "0 0 8px 0" }}>💡 전략 팁</h3>
            <div style={{ color: "#ccc", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div>• 와일드카드로 상대를 혼란시키거나 손패를 빠르게 비워라</div>
              <div>• 트로피(+10점)를 노리는 것이 점수 극대화의 핵심</div>
              <div>• 도전은 확신이 있을 때만! 실패하면 손패가 늘어난다</div>
              <div>• 10 이후 리셋 타이밍을 활용해 향신료를 바꾸며 기회를 만들어라</div>
            </div>
          </section>

        </div>

        <button
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "20px",
            background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "1rem",
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
