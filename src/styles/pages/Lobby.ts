import styled from "styled-components";

export const LobbyHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #2a2a2a;

  .title {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: 2px;
    color: #e0e0e0;
    margin: 0;
  }
`;

export const ProfileButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 5px 12px 5px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .avatar-img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-fallback {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #646cff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #fff;
    font-weight: 700;
    flex-shrink: 0;
  }

  .name {
    color: #eee;
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

export const ProfileDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #1e1e2e;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 6px 0;
  min-width: 130px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 200;

  button {
    width: 100%;
    background: none;
    border: none;
    color: #ff6b6b;
    padding: 10px 16px;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;

    &:hover {
      background: rgba(255, 107, 107, 0.08);
    }
  }
`;

// 모달 오버레이
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

// 모달 컨텐츠
export const ModalContent = styled.div`
  background-color: #2a2a2a;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    color: #e0e0e0;
  }
`;

// 모달 입력 필드
export const ModalInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #4a4a4a;
  border-radius: 6px;
  background-color: #1a1a1a;
  color: #e0e0e0;
  font-size: 1rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #646cff;
  }
`;

// 라디오 그룹
export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label:first-child {
    font-size: 0.95rem;
    color: #aaa;
    margin-bottom: 0.25rem;
  }
`;

// 라디오 옵션 컨테이너 (3개씩 한 줄)
export const RadioOptions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.4rem;
`;

// 라디오 옵션
export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #e0e0e0;
  font-size: 0.9rem;
  flex: 1;

  &:hover {
    background-color: #333;
  }

  input[type="radio"] {
    accent-color: #646cff;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

// 모달 버튼 영역
export const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

// 모달 버튼
export const ModalButton = styled.button<{ $primary?: boolean }>`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  background-color: ${({ $primary }) => ($primary ? "#646cff" : "#3a3a3a")};
  color: ${({ $primary }) => ($primary ? "white" : "#ccc")};

  &:hover {
    background-color: ${({ $primary }) => ($primary ? "#535bf2" : "#4a4a4a")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 모달 탭
export const ModalTabs = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid #3a3a3a;
  margin-bottom: -0.5rem;
`;

export const ModalTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.55rem 0;
  border: none;
  background: none;
  color: ${({ $active }) => ($active ? "#e0e0e0" : "#666")};
  font-size: 0.95rem;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  cursor: pointer;
  border-bottom: 2px solid ${({ $active }) => ($active ? "#646cff" : "transparent")};
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: #ccc;
  }
`;

// 싱글 게임 선택 목록
export const SingleGameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const SingleGameItem = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  background: #1e1e1e;
  color: #e0e0e0;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: #646cff;
    background: #252535;
  }

  .icon {
    font-size: 1.4rem;
    width: 2rem;
    text-align: center;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .name {
    font-weight: 600;
  }

  .desc {
    font-size: 0.8rem;
    color: #888;
  }
`;

// 체크박스 옵션
export const CheckboxOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  cursor: pointer;
  color: #e0e0e0;
  font-size: 0.95rem;

  input[type="checkbox"] {
    accent-color: #646cff;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;
