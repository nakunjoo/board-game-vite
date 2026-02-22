# The Gang - Frontend

React 19 + TypeScript 기반 멀티플레이어 카드 게임 웹 애플리케이션

## 기술 스택

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7
- **Styling**: styled-components 6
- **Routing**: react-router-dom v7
- **Communication**: WebSocket

## 프로젝트 구조

```
src/
├── contexts/
│   └── WebSocketContext.tsx        # 전역 WebSocket 연결 관리
├── components/
│   ├── CardDeck.tsx                # 카드덱 공통 컴포넌트
│   ├── gang/                       # Gang 게임 전용 컴포넌트
│   │   ├── GangGameBoard.tsx       # 게임판 메인 UI (칩, 카드, 플레이어 상태)
│   │   ├── GangResultModal.tsx     # 라운드 결과 모달
│   │   ├── GangHandRankModal.tsx   # 포커 족보 설명 모달
│   │   ├── GangHelpModal.tsx       # 게임 규칙 설명 모달
│   │   ├── types.ts                # Gang 전용 타입 정의
│   │   └── index.ts
│   └── spice/                      # Spice 게임 전용 컴포넌트
│       ├── SpiceGameBoard.tsx      # 게임판 메인 UI (턴/도전/타이머 바)
│       ├── SpiceResultModal.tsx    # 점수 기반 결과 모달
│       └── SpiceHelpModal.tsx      # 게임 규칙 설명 모달
├── pages/
│   ├── Lobby.tsx                   # 로비 (방 목록, 생성, 입장)
│   └── Room/
│       ├── index.tsx               # Room 메인
│       ├── common/
│       │   └── useRoomBase.ts      # Room 공통 로직 훅 (Gang/Spice 공유)
│       ├── gang/index.tsx          # Gang Room 래퍼
│       └── spice/index.tsx         # Spice Room 래퍼 (Spice 전용 상태 관리)
├── styles/
│   ├── pages/Lobby.ts
│   ├── pages/Room.ts
│   ├── game/index.ts
│   └── chat/index.ts
├── types/
│   └── game.ts                     # 공통 게임 타입 (Card, Room, GameConfig 등)
└── utils/
    ├── cards.ts
    ├── poker.ts                    # 포커 족보 계산
    ├── audio.ts
    ├── constants.ts
    └── games/
        ├── gang.ts                 # Gang 설정 (MIN_PLAYERS, CHIP_COLORS, STEP_CARDS)
        ├── spice.ts                # Spice 설정 (SPICE_SUIT_COLORS, SPICE_SUIT_LABELS)
        └── index.ts
```

## 코드 컨벤션

- 타입/인터페이스는 `src/types/` 또는 각 게임 폴더의 `types.ts`에 정의
- 상수명은 UPPER_SNAKE_CASE
- styled-components transient props는 `$` 접두사 (예: `$isMe`, `$totalPlayers`)
- 게임별 컴포넌트는 `src/components/[게임타입]/` 폴더에 분리

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
npm run preview  # 빌드된 결과물 미리보기
```

## 라우팅

- `/` - 로비
- `/room/gang/:roomName` - Gang 게임 룸
- `/room/spice/:roomName` - Spice 게임 룸

## WebSocket 통신

**서버 주소**:
- 개발: `ws://localhost:9030/ws`
- 프로덕션: `wss://your-domain.com/ws`

**구현 위치**: `src/contexts/WebSocketContext.tsx`

```typescript
const { send, subscribe, isConnected } = useWebSocket();

useEffect(() => {
  const unsubscribe = subscribe((event, data) => {
    if (event === 'gameStarted') { ... }
  });
  return unsubscribe;
}, [subscribe]);
```

## 주요 이벤트 (공통)

**클라이언트 → 서버:**
| 이벤트 | 설명 |
|--------|------|
| `createRoom` | 방 생성 (`name, playerId, nickname, gameType?, password?`) |
| `joinRoom` | 방 참가/재연결 (`name, playerId, nickname, password?`) |
| `leaveRoom` | 방 퇴장 |
| `getRooms` | 방 목록 조회 |
| `roomMessage` | 채팅 메시지 |
| `kickPlayer` | 플레이어 강퇴 (방장 전용) |

**서버 → 클라이언트:**
| 이벤트 | 설명 |
|--------|------|
| `roomJoined` | 방 참가 완료 (재연결 시 전체 게임 상태 복원 포함) |
| `userJoined` / `userLeft` | 플레이어 입/퇴장 |
| `roomList` | 방 목록 |
| `roomMessage` | 채팅 |
| `kicked` | 강퇴 알림 |
| `error` | 에러 메시지 |

## Gang 게임 이벤트

**클라이언트 → 서버:** `startGame`, `drawCard`, `selectChip`, `playerReady`, `readyNextRound`

**서버 → 클라이언트:** `gameStarted`, `cardDrawn`, `chipSelected`, `playerReadyUpdate`, `nextStep`, `gameFinished`, `nextRoundReadyUpdate`

## Spice 게임 이벤트

**클라이언트 → 서버:** `startGame`, `drawFirstCard`, `playCard`, `pass`, `challenge`, `readyNextRound`

**서버 → 클라이언트:** `firstDrawStarted`, `firstDrawResult`, `firstDrawProgress`, `firstDrawFinished`, `gameStarted`, `cardPlayed`, `cardPassed`, `myHandUpdate`, `challengePhase`, `challengeExpired`, `challengeResult`, `spiceGameOver`

## SpiceGameBoard UI 구조

- **상단 중앙**: 현재 선언(향신료+숫자+더미 장수) + 누구 턴인지 + 타이머 바
- **타이머 바**: 가로 바 형태 (원형 SVG 아님)
  - 턴 타이머: 30초, 5초 이하 빨강, 0초에 강조 틱음
  - 도전 타이머: 5초, 2초 이하 빨강
  - 초 숫자 바 오른쪽에 함께 표시
- **좌하단**: 덱 카드 수 (카드 뒷면 이미지 + 장수)
- **내 턴**: "카드 내기" 버튼 (하단 중앙, bottom: 160px)
- **플레이어 아바타**: 트로피 슬롯이 아바타 오른쪽에 세로 배치 (position: absolute, right: -22px)
- **도전 페이즈 오버레이**: 선언 카드(앞면) + 제출 카드(뒷면→도전 시 플립 애니메이션)

## 타이머 동작 방식

### 턴 타이머 (SpiceGameBoard.tsx)
- `currentTurnPlayerId` 변경 또는 `challengePhase` 해제 시 리셋
- **재연결 시**: `reconnectTurnTimeLeft` prop → `reconnectTurnTimeLeftRef`에 저장 → 타이머 effect에서 한 번만 소비
- 카운트다운 로직: `next < 0`일 때 패스 실행 → 0을 1초 표시한 뒤 패스

### 도전 타이머 (SpiceGameBoard.tsx)
- `challengePhase` 설정 시 5초 카운트다운 시작
- **재연결 시**: `reconnectChallengeTimeLeft` prop → 남은 시간부터 카운트다운
- 카운트다운 로직: `prev <= 0`일 때 타이머 정지 → 0을 1초 표시한 뒤 정지
- **race condition 방지**: `challengeExpired` 수신 시 `setChallengePhase(null)`을 **1100ms 지연** → 도전 타이머가 0을 표시할 시간 확보

## 재연결 (Spice)

### 새로고침 감지 (`useRoomBase.ts`)
```typescript
const isRefresh = (() => {
  const navEntry = performance.getEntriesByType("navigation")[0];
  return navEntry?.type === "reload" || !locationState;
})();
```
- `isRefresh === true`이면 WebSocket 연결 후 500ms 뒤 `joinRoom` 재전송
- 서버 Case 2가 같은 소켓 중복 `joinRoom`을 안전하게 처리 (room 상태 변경 없이 `roomJoined` 재전송)

### roomJoined 수신 시 복원 항목 (`spice/index.tsx`)
- 게임 상태: `gameStarted`, `gameFinished`, `gameOver`, `deck`, `myHand`, `playerHands`
- Spice 진행 상태: `currentTurnPlayerId`, `currentSuit`, `currentNumber`, `tableStackSize`, `trophies`, `wonCardCounts`, `challengePhase`
- 타이머 복원: `turnTimeLeft` → `reconnectTurnTimeLeft` state, `challengeTimeLeft` → `reconnectChallengeTimeLeft` state
- 선뽑기 상태: `isFirstDraw`, `myDrawnNumber`, `drawnCount`, `firstDrawFinished`, `firstDrawResults`, `firstPlayerId`, `firstNickname`

## SpiceSuitIcon 공유

`SpiceGameBoard.tsx`에서 `export function SpiceSuitIcon(...)` 로 export하여
`SpiceHelpModal.tsx`에서 import해 실제 카드 아이콘을 모달에서도 동일하게 표시.

```typescript
// SpiceGameBoard.tsx
export function SpiceSuitIcon({ type, color, size = 24 }) { ... }

// SpiceHelpModal.tsx
import { SpiceSuitIcon } from "./SpiceGameBoard";
```
