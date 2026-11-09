import type { KeyboardEvent } from "react";

/** 버튼이 아닌 요소를 클릭·Enter·Space로 누를 수 있게 한다 */
export function pressable(onPress: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: onPress,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onPress();
      }
    },
  };
}
