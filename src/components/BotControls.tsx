import { BotBar, BotButton } from "../styles/pages/BotControls";
import type { Player } from "../types/game";

/** 서버 bots/bot.util.ts의 BOT_ID_PREFIX와 같게 */
export const isBotPlayer = (playerId: string) => playerId.startsWith("bot:");

interface Props {
  roomName: string;
  players: Player[];
  maxPlayers: number;
  send: (event: string, data?: unknown) => void;
}

/**
 * 방장이 대기 중일 때 봇을 넣고 뺀다 (사람이 모자랄 때 채우기·혼자 연습).
 * 봇은 서버가 플레이어처럼 방에 넣으므로, 화면에는 userJoined/userLeft로 다른 사람과 똑같이 나타난다.
 * 보여 줄지(방장·시작 전·지원하는 게임)는 부르는 쪽이 정한다
 */
export default function BotControls({ roomName, players, maxPlayers, send }: Props) {
  const botCount = players.filter((p) => isBotPlayer(p.playerId)).length;
  const full = players.length >= maxPlayers;
  return (
    <BotBar role="group" aria-label="봇">
      <span>🤖 봇 {botCount}</span>
      <BotButton
        type="button"
        aria-label="봇 빼기"
        disabled={botCount === 0}
        onClick={() => send("removeBot", { roomName })}
      >
        −
      </BotButton>
      <BotButton type="button" aria-label="봇 넣기" disabled={full} onClick={() => send("addBot", { roomName })}>
        +
      </BotButton>
    </BotBar>
  );
}
