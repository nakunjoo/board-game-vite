import { useState } from "react";
import type { Difficulty } from "../types";
import { DIFFICULTIES } from "../constants";
import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  DifficultyList,
  DifficultyBtn,
  DifficultyDesc,
  StartButton,
} from "../../../../styles/single/minesweeper/modal";

interface Props {
  initialDifficulty: Difficulty;
  onStart: (difficulty: Difficulty) => void;
}

export default function SetupModal({ initialDifficulty, onStart }: Props) {
  const [selected, setSelected] = useState<Difficulty>(initialDifficulty);

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>💣지뢰찾기</ModalTitle>
        <DifficultyList>
          {(
            Object.entries(DIFFICULTIES) as [
              Difficulty,
              (typeof DIFFICULTIES)[string],
            ][]
          ).map(([key, cfg]) => (
            <DifficultyBtn
              key={key}
              $active={selected === key}
              onClick={() => setSelected(key)}
            >
              <span>{cfg.label}</span>
              <DifficultyDesc>
                {cfg.rows}×{cfg.cols} · 지뢰 {cfg.mines}개
              </DifficultyDesc>
            </DifficultyBtn>
          ))}
        </DifficultyList>
        <StartButton onClick={() => onStart(selected)}>시작</StartButton>
      </ModalBox>
    </ModalOverlay>
  );
}
