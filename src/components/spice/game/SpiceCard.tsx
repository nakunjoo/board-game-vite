import type { Card } from "../../../types/game";
import { SPICE_SUIT_COLORS } from "../../../utils/games/spice";

// 향신료 SVG 아이콘 (export: SpiceHelpModal 등 외부에서도 사용)
export function SpiceSuitIcon({
  type,
  color,
  size = 24,
}: {
  type: string;
  color: string;
  size?: number;
}) {
  if (type === "pepper") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 후추: 동그란 열매 + 줄기 */}
        <circle cx="12" cy="14" r="7" fill={color} />
        <circle cx="10" cy="12" r="2" fill="rgba(255,255,255,0.25)" />
        <path
          d="M12 7 C12 7 13 3 16 2"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M12 7 C12 4 10 2 8 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  if (type === "cinnamon") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 계피: 나선형 막대 */}
        <rect
          x="4"
          y="10"
          width="16"
          height="4"
          rx="2"
          fill={color}
          transform="rotate(-20 12 12)"
        />
        <rect
          x="4"
          y="10"
          width="16"
          height="4"
          rx="2"
          fill={color}
          transform="rotate(20 12 12)"
          opacity="0.6"
        />
        <rect
          x="7"
          y="9"
          width="10"
          height="6"
          rx="3"
          fill={color}
          opacity="0.85"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="3"
          ry="4"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  if (type === "saffron") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* 사프란: 꽃잎 6개 */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="12"
            cy="7"
            rx="2.2"
            ry="4.5"
            fill={color}
            opacity="0.85"
            transform={`rotate(${deg} 12 12)`}
          />
        ))}
        <circle cx="12" cy="12" r="3" fill={color} />
        <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.4)" />
      </svg>
    );
  }
  // wild
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon
        points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"
        fill={color}
      />
      <polygon
        points="12,5 14.2,10 19.5,10 15.5,13.5 17,18.5 12,15.5 7,18.5 8.5,13.5 4.5,10 9.8,10"
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  );
}

// 향신료 카드 뒷면
export function SpiceCardBack() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "3px",
        background: "#7B3F00",
        border: "1px solid #5a2d00",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(45deg, rgba(255,255,255,0.07) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(255,255,255,0.07) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.07) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.07) 75%)
          `,
          backgroundSize: "6px 6px",
          backgroundPosition: "0 0, 0 3px, 3px -3px, -3px 0px",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "2px",
          border: "1px solid rgba(255,200,80,0.4)",
          borderRadius: "2px",
        }}
      />
      <span
        style={{
          fontSize: "0.65rem",
          color: "rgba(255,200,80,0.85)",
          zIndex: 1,
          lineHeight: 1,
        }}
      >
        ✦
      </span>
    </div>
  );
}

// 향신료 카드 단일 렌더링
export function SpiceCard({ card, small = false }: { card: Card; small?: boolean }) {
  const color = SPICE_SUIT_COLORS[card.type] ?? "#555";
  const isWild = card.type === "wild-number" || card.type === "wild-suit";

  // small: 오픈카드용 고정 소형
  // 일반(내 손패): 모바일에서 clamp로 축소
  const width = small ? "36px" : "clamp(40px, 11vw, 56px)";
  const height = small ? "50px" : "clamp(56px, 15vw, 78px)";
  const iconSize = small ? 18 : 22;
  const valueFontSize =
    card.type === "wild-number"
      ? small
        ? "0.65rem"
        : "clamp(0.65rem, 2vw, 0.9rem)"
      : small
        ? "0.95rem"
        : "clamp(0.85rem, 3vw, 1.4rem)";

  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${color}`,
        borderRadius: small ? "4px" : "8px",
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        flexShrink: 0,
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      <SpiceSuitIcon type={card.type} color={color} size={iconSize} />
      <span
        style={{
          fontSize: valueFontSize,
          color: isWild ? "#8e44ad" : color,
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        {card.type === "wild-suit"
          ? "★"
          : card.type === "wild-number"
            ? "1~10"
            : card.value}
      </span>
    </div>
  );
}
