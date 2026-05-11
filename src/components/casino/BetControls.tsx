import { useState, useEffect } from "react";
import styled from "styled-components";

interface Props {
  value: number;
  onChange: (v: number) => void;
  minBet: number;
  maxBet: number;
  balance: number;
  disabled?: boolean;
}

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const QuickBtn = styled.button`
  padding: 7px 9px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s;
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const BetInput = styled.input<{ $invalid: boolean }>`
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.07);
  border: 1.5px solid
    ${({ $invalid }) => ($invalid ? "#e74c3c" : "rgba(255,255,255,0.2)")};
  border-radius: 8px;
  color: ${({ $invalid }) => ($invalid ? "#e74c3c" : "#f0c040")};
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  padding: 7px 4px;
  transition: border-color 0.15s;
  &:focus {
    outline: none;
    border-color: ${({ $invalid }) => ($invalid ? "#e74c3c" : "#f0c040")};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const RangeHint = styled.div`
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.32);
  text-align: center;
  letter-spacing: 0.5px;
`;

function roundTo100(v: number): number {
  return Math.max(100, Math.round(v / 100) * 100);
}

export default function BetControls({
  value,
  onChange,
  minBet,
  maxBet,
  balance,
  disabled,
}: Props) {
  const effectiveMax = Math.min(maxBet, balance);
  const [display, setDisplay] = useState(String(value));

  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  const clamp = (v: number) =>
    Math.max(minBet, Math.min(effectiveMax, roundTo100(v) || minBet));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setDisplay(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n)) {
      const clamped = Math.max(minBet, Math.min(effectiveMax, n));
      onChange(clamped);
    }
  };

  const handleBlur = () => {
    const clamped = clamp(parseInt(display, 10) || minBet);
    onChange(clamped);
    setDisplay(String(clamped));
  };

  const set = (v: number) => {
    const clamped = clamp(v);
    onChange(clamped);
    setDisplay(String(clamped));
  };

  const isInvalid = value < minBet || value > effectiveMax;

  return (
    <Wrapper>
      <Row>
        <QuickBtn disabled={disabled} onClick={() => set(minBet)}>
          MIN
        </QuickBtn>
        <QuickBtn
          disabled={disabled}
          onClick={() => set(roundTo100(maxBet * 0.25))}
        >
          ¼
        </QuickBtn>
        <BetInput
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          $invalid={isInvalid}
        />
        <QuickBtn
          disabled={disabled}
          onClick={() => set(roundTo100(maxBet * 0.5))}
        >
          ½
        </QuickBtn>
        <QuickBtn disabled={disabled} onClick={() => set(effectiveMax)}>
          MAX
        </QuickBtn>
      </Row>
      <RangeHint>
        MIN {minBet.toLocaleString()} · MAX {maxBet.toLocaleString()}
        {effectiveMax < maxBet && ` (잔액 부족: ${effectiveMax.toLocaleString()})`}
      </RangeHint>
    </Wrapper>
  );
}
