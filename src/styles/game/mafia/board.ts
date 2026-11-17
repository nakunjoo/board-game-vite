import styled from "styled-components";

/**
 * 마피아 게임판. 큰 틀(진행 줄·참가자 칸·안내·채팅·입력, 눕힌 화면 두 칸)은 라이어와 같아서
 * styles/game/liar/board.ts를 그대로 쓰고, 여기엔 마피아에만 있는 것만 둔다
 */

export const RoleHint = styled.div`
  font-size: 0.75rem;
  color: #bbb;
  line-height: 1.35;
  margin-top: 2px;
`;

export const RoleText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const TeamLine = styled.div`
  font-size: 0.75rem;
  color: #ff7675;
  margin-top: 2px;
`;

export const MafiaLogLine = styled.div<{ $tone: "chat" | "mafia" | "dead" | "system" | "good" | "bad" }>`
  word-break: break-all;
  color: ${({ $tone }) =>
    $tone === "system"
      ? "#999"
      : $tone === "good"
        ? "#55efc4"
        : $tone === "bad"
          ? "#ff7675"
          : "#e0e0e0"};
  ${({ $tone }) =>
    $tone === "mafia"
      ? "padding: 2px 8px; border-radius: 6px; background: rgba(231, 76, 60, 0.18);"
      : $tone === "dead"
        ? "padding: 2px 8px; border-radius: 6px; background: rgba(127, 140, 141, 0.2); color: #bbb;"
        : ""}

  b {
    font-weight: 700;
  }
`;

export const ScopeTag = styled.span<{ $tone: "mafia" | "dead" }>`
  margin-right: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ $tone }) => ($tone === "mafia" ? "#ff7675" : "#aaa")};
`;
