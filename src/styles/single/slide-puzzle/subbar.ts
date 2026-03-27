import styled, { keyframes } from "styled-components";

export const SubBar = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #222;
  background: #161616;
  flex-shrink: 0;
`;

export const SubBarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 1.25rem;
  gap: 0.75rem;

  & + & {
    border-top: 1px solid #1e1e1e;
  }
`;

export const SubBarLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

export const SubBarCenter = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const SubBarRight = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export const HeaderImagePreview = styled.div<{ $url: string }>`
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1px solid #3a3a3a;
  background-image: url(${({ $url }) => $url});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

export const SettingsTrigger = styled.div`
  position: relative;
`;

export const SettingsButton = styled.button`
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: 1px solid #3a3a3a;
  background: transparent;
  color: #aaa;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: #2a2a2a;
    color: #e0e0e0;
    border-color: #555;
  }
`;

export const SettingsPanel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 10px;
  padding: 0.75rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 160px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
`;

export const SettingsPanelTitle = styled.div`
  font-size: 0.68rem;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const SettingsTabBar = styled.div`
  display: flex;
  gap: 2px;
  background: #111;
  border-radius: 6px;
  padding: 2px;
`;

export const SettingsTab = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.22rem 0.5rem;
  border-radius: 4px;
  border: none;
  background: ${({ $active }) => ($active ? "#2e2e2e" : "transparent")};
  color: ${({ $active }) => ($active ? "#e0e0e0" : "#555")};
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;

  &:hover {
    color: #aaa;
  }
`;

export const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ColorSwatch = styled.button<{ $color: string; $active?: boolean }>`
  width: 38px;
  height: 28px;
  border-radius: 6px;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $active }) => ($active ? "#646cff" : "transparent")};
  box-shadow: ${({ $active }) =>
    $active
      ? "0 0 0 1px rgba(100,108,255,0.5)"
      : "inset 0 0 0 1px rgba(255,255,255,0.12)"};
  cursor: pointer;
  transition: border-color 0.12s, box-shadow 0.12s, transform 0.1s;

  &:hover {
    border-color: #646cff;
    transform: scale(1.05);
  }
`;

export const ActionButton = styled.button<{ $ghost?: boolean }>`
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ $ghost }) => ($ghost ? "#444" : "transparent")};
  background: ${({ $ghost }) => ($ghost ? "transparent" : "#646cff")};
  color: ${({ $ghost }) => ($ghost ? "#aaa" : "#fff")};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    background: ${({ $ghost }) => ($ghost ? "#2a2a2a" : "#535bf2")};
    color: ${({ $ghost }) => ($ghost ? "#e0e0e0" : "#fff")};
    border-color: ${({ $ghost }) => ($ghost ? "#555" : "transparent")};
  }
`;

export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
`;

export const ToggleSwitch = styled.button<{ $on?: boolean }>`
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  border: none;
  background: ${({ $on }) => ($on ? "#646cff" : "#3a3a3a")};
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.15s;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ $on }) => ($on ? "19px" : "3px")};
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s;
  }
`;

// keyframes re-export for consistency
export { keyframes };
