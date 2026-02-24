import { getSeatPosition } from "../../../styles/pages/Room";
import { SpiceCardBack } from "./SpiceCard";

// 다른 플레이어 손패 fan
export default function SpiceOtherPlayerFan({
  cardCount,
  pos,
  isVertical,
}: {
  cardCount: number;
  pos: ReturnType<typeof getSeatPosition>;
  isVertical: boolean;
}) {
  const isTop = pos.top === "0" && pos.left === "50%";
  const isBottom = pos.bottom === "0" && pos.left === "50%";
  const isLeft = pos.left === "0";
  const isRight = pos.right !== undefined && pos.right === "0";

  const spreadAngle = Math.min(5 * (cardCount - 1), 40);
  const angleStep = cardCount > 1 ? spreadAngle / (cardCount - 1) : 0;
  const cardW = 16;
  const cardH = 22;
  const overlap = Math.min(10, 60 / cardCount);

  // 컨테이너 위치 결정
  let containerStyle: React.CSSProperties = { position: "absolute" };
  if (isBottom) {
    containerStyle = {
      ...containerStyle,
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginBottom: "6px",
    };
  } else if (isTop) {
    containerStyle = {
      ...containerStyle,
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "6px",
    };
  } else if (isLeft) {
    containerStyle = {
      ...containerStyle,
      top: "50%",
      left: "50%",
      transform: "translateY(-50%)",
      marginLeft: "6px",
    };
  } else if (isRight) {
    containerStyle = {
      ...containerStyle,
      top: "50%",
      right: "130%",
      transform: "translateY(-50%)",
      marginRight: "6px",
    };
  } else {
    containerStyle = {
      ...containerStyle,
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      marginTop: "6px",
    };
  }

  // 세로 배치(좌/우)는 fan을 세로 방향으로
  const baseAngle = isVertical ? 90 : 0;

  const fanW = cardW + overlap * (cardCount - 1) + 10;
  const fanH = cardH + 16;
  const containerW = isVertical ? `${fanH}px` : `${fanW}px`;
  const containerH = isVertical ? `${fanW}px` : `${fanH}px`;

  return (
    <div style={{ ...containerStyle, width: containerW, height: containerH }}>
      {Array.from({ length: cardCount }).map((_, i) => {
        const fanAngle = baseAngle + (-spreadAngle / 2 + angleStep * i);
        const xOffset = isVertical ? 0 : (i - (cardCount - 1) / 2) * overlap;
        const yOffset = isVertical ? (i - (cardCount - 1) / 2) * overlap : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${cardW}px`,
              height: `${cardH}px`,
              transform: `translate(calc(-50% + ${xOffset}px), calc(-50% + ${yOffset}px)) rotate(${fanAngle}deg)`,
              transformOrigin: "bottom center",
              zIndex: i,
            }}
          >
            <SpiceCardBack />
          </div>
        );
      })}
    </div>
  );
}
