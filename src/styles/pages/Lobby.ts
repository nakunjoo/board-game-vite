import styled from "styled-components";

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
