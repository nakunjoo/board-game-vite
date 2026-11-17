import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  ModalNote,
  RankTable,
  RankRow,
  PrimaryButton,
  SecondaryButton,
} from "../../../styles/game/liar/modal";
import type { MafiaGameOver } from "../types";
import { MAFIA_ROLE_EMOJI, MAFIA_ROLE_LABEL } from "../../../utils/games/mafia";
import type { MafiaRole } from "../../../utils/games/mafia";

interface Props {
  result: MafiaGameOver;
  myPlayerId: string;
  isHost: boolean;
  onRestart: () => void;
  onClose: () => void;
}

const ROLE_ORDER: MafiaRole[] = ["mafia", "police", "doctor", "citizen"];

export function winnerText(w: MafiaGameOver["winner"]): string {
  return w === "mafia" ? "🔪 마피아 승리" : w === "citizens" ? "🙂 시민 승리" : "게임 무효";
}

export default function MafiaResultModal({ result, myPlayerId, isHost, onRestart, onClose }: Props) {
  const myRole = result.roles[myPlayerId];
  const iWon =
    myRole !== undefined &&
    result.winner !== "none" &&
    (result.winner === "mafia") === (myRole === "mafia");
  const rows = Object.keys(result.roles).sort(
    (a, b) => ROLE_ORDER.indexOf(result.roles[a]) - ROLE_ORDER.indexOf(result.roles[b]),
  );
  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>{winnerText(result.winner)}</ModalTitle>
        <ModalNote>
          {result.winner === "none"
            ? "인원이 부족해 게임이 일찍 끝났습니다."
            : myRole
              ? iWon
                ? "이겼어요! 🎉"
                : "졌어요"
              : ""}
          {result.winner !== "none" && ` · ${result.day}일째`}
        </ModalNote>
        <RankTable>
          {rows.map((pid) => {
            const role = result.roles[pid];
            const alive = result.alive.includes(pid);
            return (
              <RankRow key={pid} $isMe={pid === myPlayerId} $top={role === "mafia"}>
                <span>{MAFIA_ROLE_EMOJI[role]}</span>
                <span>
                  {result.nicknames[pid] ?? "나간 사람"}
                  {alive ? "" : " 💀"}
                </span>
                <span>{MAFIA_ROLE_LABEL[role]}</span>
              </RankRow>
            );
          })}
        </RankTable>
        {isHost && <PrimaryButton onClick={onRestart}>다시 시작</PrimaryButton>}
        <SecondaryButton onClick={onClose}>닫기</SecondaryButton>
      </ModalBox>
    </ModalOverlay>
  );
}
