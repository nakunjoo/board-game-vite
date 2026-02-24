import {
  TigressOverlay,
  TigressModal,
  TigressBtn,
} from "../../../styles/game/skulking/tigressModal";

interface Props {
  onDeclare: (decl: "escape" | "pirate") => void;
}

export default function SkulkingTigressModal({ onDeclare }: Props) {
  return (
    <TigressOverlay>
      <TigressModal>
        <div style={{ marginBottom: 16, fontSize: "1rem" }}>
          Tigress를 어떻게 사용할까요?
        </div>
        <TigressBtn $type="escape" onClick={() => onDeclare("escape")}>
          🏳️ 탈출
        </TigressBtn>
        <TigressBtn $type="pirate" onClick={() => onDeclare("pirate")}>
          ⚔️ 해적
        </TigressBtn>
      </TigressModal>
    </TigressOverlay>
  );
}
