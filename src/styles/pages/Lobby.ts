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

  label {
    font-size: 0.95rem;
    color: #aaa;
    margin-bottom: 0.25rem;
  }
`;

// 라디오 옵션
export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  color: #e0e0e0;
  font-size: 0.95rem;

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
