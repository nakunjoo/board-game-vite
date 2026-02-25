import styled from "styled-components";
import { SKULKING_SUIT_COLORS } from "../../../utils/games/skulking";

export const SkCard = styled.div<{
  $type: string;
  $selectable?: boolean;
  $selected?: boolean;
  $small?: boolean;
  $disabled?: boolean;
}>`
  position: relative;
  width: ${({ $small }) => ($small ? "46px" : "56px")};
  height: ${({ $small }) => ($small ? "64px" : "80px")};
  border-radius: 5px;
  border: 2px solid
    ${({ $selected }) => ($selected ? "#f1c40f" : "rgba(255,255,255,0.25)")};
  background: ${({ $type }) => SKULKING_SUIT_COLORS[$type] ?? "#2c3e50"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${({ $selectable, $disabled }) =>
    $disabled ? "not-allowed" : $selectable ? "pointer" : "default"};
  transform: ${({ $selected }) => ($selected ? "translateY(-10px)" : "none")};
  transition:
    transform 0.15s,
    border-color 0.15s,
    opacity 0.15s;
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};

  &:hover {
    ${({ $selectable, $disabled }) =>
      $selectable &&
      !$disabled &&
      "transform: translateY(-10px); border-color: #f1c40f;"}
  }

  @media (max-width: 768px) {
    width: ${({ $small }) => ($small ? "36px" : "46px")};
    height: ${({ $small }) => ($small ? "50px" : "64px")};
  }
`;

export const SkCardLabel = styled.div<{ $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? "1rem" : "1.2rem")};
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
  /* text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; */
`;

export const SkCardValue = styled.div<{ $small?: boolean }>`
  font-size: ${({ $small }) => ($small ? "14px" : "14px")};
  color: rgba(255, 255, 255, 0.75);
  font-weight: bold;
  /* text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black; */
`;
