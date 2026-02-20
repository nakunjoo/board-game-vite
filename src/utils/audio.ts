/**
 * 오디오 유틸리티 함수
 */

// Web Audio API를 사용한 AudioContext (싱글톤)
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Web Audio API를 사용하여 비프음 재생
 * @param frequency - 주파수 (Hz)
 * @param duration - 지속 시간 (ms)
 * @param volume - 볼륨 (0.0 ~ 1.0)
 */
const playBeep = (frequency: number, duration: number, volume = 0.3): void => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (error) {
    console.error('Failed to play beep:', error);
  }
};

/**
 * 효과음 재생 (파일 기반)
 * @param soundPath - 사운드 파일 경로 (public 폴더 기준)
 * @param volume - 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
 */
export const playSound = (soundPath: string, volume = 0.5): void => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume)); // 0~1 사이로 제한
    audio.play().catch((error) => {
      console.warn(`Failed to play sound: ${soundPath}`, error);
    });
  } catch (error) {
    console.error(`Error creating audio: ${soundPath}`, error);
  }
};

/**
 * 칩 빼앗김 사운드 재생
 * 사운드 파일이 없으면 Web Audio API로 생성한 비프음 재생
 */
export const playChipStolenSound = (): void => {
  // 먼저 파일 재생 시도
  const audio = new Audio('/sounds/chip-stolen.mp3');
  audio.volume = 0.5;

  audio.play().catch(() => {
    // 파일이 없으면 Web Audio API로 경고음 재생
    console.log('Playing beep sound (chip-stolen.mp3 not found)');
    // 두 번의 짧은 비프음 (삑삑)
    playBeep(800, 100, 0.3);
    setTimeout(() => playBeep(600, 150, 0.3), 120);
  });
};

/**
 * 칩 선택 사운드 재생
 */
export const playChipSelectSound = (): void => {
  // 짧은 클릭음
  playBeep(600, 50, 0.2);
};

/**
 * 알림 사운드 재생
 */
export const playNotificationSound = (): void => {
  // 부드러운 알림음
  playBeep(700, 200, 0.25);
};

/**
 * 타이머 똑딱 소리 (5초 이하 카운트다운)
 * @param isLastSecond - 마지막 1초 여부 (더 강한 소리)
 */
export const playTickSound = (isLastSecond = false): void => {
  if (isLastSecond) {
    // 마지막 1초: 높고 짧은 경고음
    playBeep(1200, 80, 0.4);
  } else {
    // 똑딱: 짧은 클릭 느낌 (고주파 짧은 음)
    playBeep(900, 60, 0.25);
  }
};
