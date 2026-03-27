import { useRef, useState } from "react";
import {
  SubBar,
  SubBarRow,
  SubBarLeft,
  SubBarCenter,
  SubBarRight,
  HeaderImagePreview,
  SettingsTrigger,
  SettingsButton,
  SettingsPanel,
  SettingsPanelTitle,
  SettingsTabBar,
  SettingsTab,
  ColorGrid,
  ColorSwatch,
  ActionButton,
  ToggleRow,
  ToggleSwitch,
} from "../../../styles/single/slide-puzzle/subbar";
import { BG_THEMES } from "./constants";

interface Props {
  currentImage: string;
  isPreview: boolean;
  boardBg: string;
  bgTab: number;
  showNumbers: boolean;
  onRestart: () => void;
  onNewGame: () => void;
  onStartGame: () => void;
  onBgChange: (color: string) => void;
  onBgTabChange: (tab: number) => void;
  onToggleNumbers: () => void;
}

export default function SlidePuzzleSubBar({
  currentImage,
  isPreview,
  boardBg,
  bgTab,
  showNumbers,
  onRestart,
  onNewGame,
  onStartGame,
  onBgChange,
  onBgTabChange,
  onToggleNumbers,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const handleSettingsClick = () => setShowSettings((v) => !v);

  return (
    <SubBar>
      <SubBarRow>
        <SubBarLeft>
          <ActionButton onClick={onRestart}>재시작</ActionButton>
          <ActionButton $ghost onClick={onNewGame}>새 게임</ActionButton>
        </SubBarLeft>
      </SubBarRow>
      <SubBarRow>
        <SubBarLeft>
          <HeaderImagePreview $url={currentImage} />
        </SubBarLeft>
        <SubBarCenter>
          {isPreview && (
            <ActionButton onClick={onStartGame}>게임 시작</ActionButton>
          )}
        </SubBarCenter>
        <SubBarRight>
          <SettingsTrigger ref={settingsRef}>
            <SettingsButton onClick={handleSettingsClick}>
              ⚙ 설정
            </SettingsButton>
            {showSettings && (
              <SettingsPanel>
                <SettingsPanelTitle>퍼즐판 배경</SettingsPanelTitle>
                <SettingsTabBar>
                  {BG_THEMES.map((theme, i) => (
                    <SettingsTab
                      key={theme.label}
                      $active={bgTab === i}
                      onClick={() => onBgTabChange(i)}
                    >
                      {theme.label}
                    </SettingsTab>
                  ))}
                </SettingsTabBar>
                <ColorGrid>
                  {BG_THEMES[bgTab].presets.map((p) => (
                    <ColorSwatch
                      key={p.value}
                      $color={p.value}
                      $active={boardBg === p.value}
                      title={p.label}
                      onClick={() => onBgChange(p.value)}
                    />
                  ))}
                </ColorGrid>
                <ToggleRow>
                  <ToggleSwitch $on={showNumbers} onClick={onToggleNumbers} />
                  <span>순번 표시</span>
                </ToggleRow>
              </SettingsPanel>
            )}
          </SettingsTrigger>
        </SubBarRight>
      </SubBarRow>
    </SubBar>
  );
}
