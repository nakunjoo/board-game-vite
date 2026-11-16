import styled from "styled-components";

/** 헤더와 게임판 사이 한 줄에 놓는 봇 넣기/빼기 (방장·시작 전만) */
export const BotBar = styled.div`
  align-self: center;
  flex-shrink: 0;
  width: fit-content;
  margin: 0 auto 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 10px;
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ddd;
  font-size: 0.8rem;
  white-space: nowrap;
`;

export const BotButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;
