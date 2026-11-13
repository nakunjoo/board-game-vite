import {
  SetupPanel,
  ModalTitle,
  ModalNote,
  PrimaryButton,
  RankTable,
  RankRow,
} from "../../../styles/game/drawing/modal";
import type { DrawingSeat } from "../types";

interface Props {
  seats: DrawingSeat[];
  draws: Record<string, number>;
  /** 결과가 나왔으면 먼저 그릴 사람 */
  firstPlayerId: string | null;
  myPlayerId: string;
  onDraw: () => void;
}

/** 1~10 중 하나씩 뽑아 가장 큰 숫자가 먼저 그린다 (그림판 위에 띄움) */
export default function DrawingFirstDrawPanel({ seats, draws, firstPlayerId, myPlayerId, onDraw }: Props) {
  const first = seats.find((s) => s.playerId === firstPlayerId);
  const myNumber = draws[myPlayerId];
  return (
    <SetupPanel>
      <ModalTitle>🎴 선뽑기</ModalTitle>
      {first ? (
        <ModalNote>
          <b style={{ color: "#f1c40f" }}>{first.nickname}</b>님이 먼저 그려요!
        </ModalNote>
      ) : (
        <ModalNote>가장 큰 숫자를 뽑은 사람이 먼저 그려요</ModalNote>
      )}
      {myNumber === undefined && !first && <PrimaryButton onClick={onDraw}>카드 뽑기</PrimaryButton>}
      <RankTable>
        {seats.map((s) => (
          <RankRow key={s.playerId} $isMe={s.isMe} $top={s.playerId === firstPlayerId}>
            <span style={{ color: s.color }}>●</span>
            <span>{s.nickname}</span>
            <span>{draws[s.playerId] ?? "…"}</span>
          </RankRow>
        ))}
      </RankTable>
    </SetupPanel>
  );
}
