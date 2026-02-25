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
  border: ${({ $selected }) => ($selected ? "3px solid #fff" : "2px solid rgba(255,255,255,0.25)")};
  box-shadow: ${({ $selected }) => ($selected ? "0 0 0 2px #f1c40f, 0 0 12px rgba(241,196,15,0.8)" : "none")};
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
    box-shadow 0.15s,
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
    transform: none;

    &:hover {
      transform: none;
    }
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
