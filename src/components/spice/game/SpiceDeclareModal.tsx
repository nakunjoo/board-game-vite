import type { Card } from "../../../types/game";
import { SPICE_SUIT_COLORS } from "../../../utils/games/spice";
import { SpiceSuitIcon, SpiceCard } from "./SpiceCard";

// ── Step 1: 선언 모달 (향신료 + 숫자 선택) ──────────────

interface SpiceDeclareModalProps {
  declarableSuits: string[];
  validNumbers: number[];
  declaredSuit: string | null;
  declaredNumber: number | null;
  setDeclaredSuit: (suit: string) => void;
  setDeclaredNumber: (num: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SpiceDeclareModal({
  declarableSuits,
  validNumbers,
  declaredSuit,
  declaredNumber,
  setDeclaredSuit,
  setDeclaredNumber,
  onCancel,
  onConfirm,
}: SpiceDeclareModalProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
        background: "rgba(0,0,0,0.6)",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "16px",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          minWidth: "260px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          선언할 카드를 고르세요
        </div>

        {/* 향신료 선택 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
            }}
          >
            향신료
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {declarableSuits.map((suit) => {
              const color = SPICE_SUIT_COLORS[suit];
              const selected = declaredSuit === suit;
              return (
                <button
                  key={suit}
                  onClick={() => setDeclaredSuit(suit)}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    border: selected
                      ? `2px solid ${color}`
                      : "1px solid rgba(255,255,255,0.15)",
                    background: selected
                      ? `${color}22`
                      : "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: selected
                      ? `0 0 12px ${color}88`
                      : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <SpiceSuitIcon type={suit} color={color} size={28} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 숫자 선택 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.75rem",
            }}
          >
            숫자
          </div>
          <div
            style={{
              display: "flex",
              gap: "6px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {validNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setDeclaredNumber(n)}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "8px",
                  border:
                    declaredNumber === n
                      ? "2px solid #f39c12"
                      : "1px solid rgba(255,255,255,0.2)",
                  background:
                    declaredNumber === n
                      ? "rgba(243,156,18,0.25)"
                      : "rgba(255,255,255,0.07)",
                  color: declaredNumber === n ? "#f39c12" : "#fff",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.1s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={!declaredSuit || !declaredNumber}
            style={{
              flex: 2,
              padding: "8px 0",
              borderRadius: "10px",
              border: "none",
              background:
                declaredSuit && declaredNumber
                  ? "#f39c12"
                  : "rgba(255,255,255,0.15)",
              color: "#fff",
              fontWeight: "bold",
              cursor:
                declaredSuit && declaredNumber
                  ? "pointer"
                  : "not-allowed",
              fontSize: "0.9rem",
            }}
          >
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: 실제 낼 손패 카드 선택 모달 ────────────────

interface SpiceCardPickModalProps {
  myHand: Card[];
  declaredSuit: string | null;
  declaredNumber: number | null;
  selectedCardIndex: number | null;
  onPickCard: (index: number) => void;
  onBack: () => void;
}

export function SpiceCardPickModal({
  myHand,
  declaredSuit,
  declaredNumber,
  selectedCardIndex,
  onPickCard,
  onBack,
}: SpiceCardPickModalProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
        background: "rgba(0,0,0,0.6)",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "16px",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          maxWidth: "320px",
          width: "90%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          실제로 낼 카드를 선택하세요
        </div>
        {/* 선언 요약 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(243,156,18,0.15)",
            border: "1px solid rgba(243,156,18,0.4)",
            borderRadius: "8px",
            padding: "6px 14px",
          }}
        >
          <SpiceSuitIcon
            type={declaredSuit!}
            color={SPICE_SUIT_COLORS[declaredSuit!] ?? "#555"}
            size={24}
          />
          <span
            style={{
              color: "#f39c12",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            {declaredNumber}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.8rem",
            }}
          >
            로 선언
          </span>
        </div>

        {/* 손패 카드 목록 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            justifyContent: "center",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {myHand.map((card, i) => (
            <div
              key={`${card.name}-${i}`}
              onClick={() => onPickCard(i)}
              style={{
                cursor: "pointer",
                borderRadius: "8px",
                border:
                  selectedCardIndex === i
                    ? "2px solid #f39c12"
                    : "2px solid transparent",
                transition: "transform 0.1s, border 0.1s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.transform =
                  "translateY(-6px)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.transform = "none")
              }
            >
              <SpiceCard card={card} />
            </div>
          ))}
        </div>

        <button
          onClick={onBack}
          style={{
            padding: "7px 20px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          ← 돌아가기
        </button>
      </div>
    </div>
  );
}
