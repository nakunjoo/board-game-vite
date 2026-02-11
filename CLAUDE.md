# The Gang

멀티플레이어 카드 게임 웹 애플리케이션

## 기술 스택

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: styled-components
- **Routing**: react-router-dom v7
- **Communication**: WebSocket

## 프로젝트 구조

```
src/
├── assets/                         # 정적 리소스 (이미지, SVG 등)
├── components/                     # 재사용 가능한 컴포넌트
│   ├── gang/                       # Gang 게임 타입별 컴포넌트
│   │   ├── GangGameBoard.tsx       # 게임판 메인 컴포넌트 (칩, 카드, 플레이어 상태 관리)
│   │   ├── GangResultModal.tsx     # 게임 결과 모달 (승리/패배 표시)
│   │   ├── GangHandRankModal.tsx   # 족보 확인 모달
│   │   ├── GangHelpModal.tsx       # 게임 도움말 모달
│   │   ├── types.ts                # Gang 게임 전용 타입 정의
│   │   └── index.ts                # Export 파일
│   └── CardDeck.tsx                # 카드 덱 컴포넌트
├── contexts/                       # React Context API
│   └── WebSocketContext.tsx        # WebSocket 연결 관리 (연결, 메시지 송수신, 이벤트 구독)
├── pages/                          # 페이지 컴포넌트 (라우팅)
│   ├── Lobby.tsx                   # 로비 페이지 (방 목록, 방 생성, 방 입장, 비밀방)
│   └── Room.tsx                    # 게임 룸 페이지 (게임 진행, 채팅, 플레이어 관리, 강퇴)
├── styles/                         # styled-components 스타일 정의
│   ├── pages/                      # 페이지별 스타일
│   │   ├── Lobby.ts                # 로비 스타일
│   │   └── Room.ts                 # 게임 룸 스타일
│   ├── game/                       # 게임 관련 스타일 (카드, 칩, 플레이어 등)
│   ├── chat/                       # 채팅 관련 스타일
│   └── index.ts                    # 전체 스타일 export
├── types/                          # TypeScript 공통 타입 정의
│   └── game.ts                     # 게임 관련 타입 (Card, GameConfig, PlayerHand, Room 등)
├── utils/                          # 유틸리티 함수 및 상수
│   ├── cards.ts                    # 카드 관련 유틸 함수
│   ├── poker.ts                    # 포커 족보 계산 로직 (isFlush, isStraight, getHandRank 등)
│   ├── games/                      # 게임별 설정 파일
│   │   ├── gang.ts                 # Gang 게임 설정 (MIN_PLAYERS, CHIP_COLORS, STEP_CARDS 등)
│   │   └── index.ts                # 게임 설정 export
│   └── constants.ts                # 전역 상수 값 (CARD_BACK_IMAGE, SUITS_KR 등)
├── App.tsx                         # 메인 앱 컴포넌트 (라우팅 설정)
├── App.css                         # 전역 CSS 스타일
├── main.tsx                        # 엔트리 포인트 (React 렌더링)
└── env.d.ts                        # 환경 변수 타입 정의
```

## 코드 컨벤션

### 타입 정의
- 모든 타입/인터페이스는 `src/types/` 폴더에 정의
- 파일명은 도메인별로 구분 (예: `game.ts`, `chat.ts`)

### 상수
- 고정 값 상수는 `src/utils/constants.ts`에 정의
- 상수명은 UPPER_SNAKE_CASE 사용

### 스타일
- styled-components 사용
- 페이지별 스타일은 `src/styles/pages/` 폴더에 분리
- transient props는 `$` 접두사 사용 (예: `$isMe`, `$totalPlayers`)

### 컴포넌트
- 페이지 컴포넌트는 `src/pages/` 폴더에 위치
- 재사용 가능한 컴포넌트는 `src/components/` 폴더에 위치
- 게임 타입별 컴포넌트는 `src/components/[게임타입]/` 폴더에 분리
  - 예: `src/components/gang/GangGameBoard.tsx`
  - 각 게임 타입은 자체 타입 정의(`types.ts`)와 export 파일(`index.ts`)을 포함
- Context는 `src/contexts/` 폴더에 위치

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
npm run preview  # 빌드된 결과물 미리보기
```

## 라우팅

- `/` - 로비 페이지
- `/room/:roomName` - 게임 룸 페이지

## WebSocket 통신

**서버 주소**:
- 개발: `ws://localhost:9030/ws` (env.d.ts에서 VITE_WS_URL로 설정)
- 프로덕션: `wss://your-domain.com/ws`

**구현 위치**: `src/contexts/WebSocketContext.tsx`

**이벤트 기반 통신 구조:**
```typescript
// 메시지 전송
send(event: string, data?: unknown)

// 메시지 구독
subscribe(callback: (event: string, data: unknown) => void)

// 연결 상태 확인
isConnected: boolean
```

### WebSocket 이벤트 명세

**클라이언트 → 서버:**

| 이벤트 | 설명 | 파라미터 | 사용 컴포넌트 |
|--------|------|----------|--------------|
| `createRoom` | 방 생성 | `{ name, playerId, nickname, gameType?, password? }` | Lobby.tsx |
| `joinRoom` | 방 참가/재연결 | `{ name, playerId, nickname, password? }` | Lobby.tsx |
| `leaveRoom` | 방 퇴장 | `{ name }` | Room.tsx |
| `startGame` | 게임 시작 (방장 전용) | `{ roomName }` | Room.tsx |
| `drawCard` | 카드 뽑기 | `{ roomName, playerId }` | GangGameBoard.tsx |
| `selectChip` | 칩 선택 | `{ roomName, playerId, chipNumber }` | GangGameBoard.tsx |
| `playerReady` | 준비 완료 | `{ roomName, playerId }` | GangGameBoard.tsx |
| `readyNextRound` | 다음 라운드 준비 | `{ roomName, playerId }` | GangResultModal.tsx |
| `getRooms` | 방 목록 조회 | 없음 | Lobby.tsx |
| `getPlayerList` | 플레이어 목록 조회 | `{ roomName }` | Room.tsx |
| `roomMessage` | 채팅 메시지 | `{ roomName, nickname, message }` | Room.tsx |
| `kickPlayer` | 플레이어 강퇴 | `{ roomName, targetPlayerId }` | Room.tsx |

**서버 → 클라이언트:**

| 이벤트 | 설명 | 데이터 | 처리 위치 |
|--------|------|--------|----------|
| `roomCreated` | 방 생성 완료 | `{ name }` | Lobby.tsx |
| `roomJoined` | 방 참가 완료 | 전체 게임 상태 (재연결 시 포함) | Room.tsx |
| `userJoined` | 다른 플레이어 참가 | `{ playerId, nickname }` | Room.tsx |
| `userLeft` | 플레이어 퇴장 | `{ playerId, nickname }` | Room.tsx |
| `gameStarted` | 게임 시작 | `{ deck, hand, openCards, chips }` | Room.tsx |
| `cardDrawn` | 카드 뽑기 완료 | `{ playerId, cardCount }` | GangGameBoard.tsx |
| `chipSelected` | 칩 선택 완료 | `{ chips, playerId }` | GangGameBoard.tsx |
| `playerReadyUpdate` | 준비 상태 업데이트 | `{ readyPlayers }` | GangGameBoard.tsx |
| `nextStep` | 다음 스텝 진행 | `{ currentStep, openCards, playerReady }` | GangGameBoard.tsx |
| `gameFinished` | 게임 종료 | `{ result, players, gameOver?, gameOverResult? }` | GangResultModal.tsx |
| `nextRoundReadyUpdate` | 다음 라운드 준비 | `{ readyPlayers }` | GangResultModal.tsx |
| `roomList` | 방 목록 | `[{ name, playerCount, isPrivate }]` | Lobby.tsx |
| `playerList` | 플레이어 목록 | `[{ playerId, nickname }]` | Room.tsx |
| `roomMessage` | 채팅 메시지 | `{ nickname, message }` | Room.tsx |
| `kicked` | 강퇴 알림 | 없음 | Room.tsx |
| `error` | 에러 메시지 | `{ message }` | 전역 |

## 게임 로직

### Gang 게임 규칙

**기본 규칙:**
1. **플레이어**: 최소 3명 필요 (MIN_PLAYERS = 3)
2. **카드**: 각 플레이어는 2장의 카드를 받음
3. **덱**: 표준 52장 카드 (하트, 다이아, 스페이드, 클럽 각 13장)

**게임 진행 단계 (4단계):**
- **스텝 1**: 오픈 카드 0장 (손패 2장만으로 판단)
- **스텝 2**: 오픈 카드 3장 (총 5장으로 족보 계산)
- **스텝 3**: 오픈 카드 4장 (총 6장으로 족보 계산)
- **스텝 4**: 오픈 카드 5장 (총 7장으로 족보 계산, 최종)

**칩 시스템:**
- 플레이어 수만큼 칩이 생성됨 (예: 3명이면 1, 2, 3번 칩)
- 칩 색상: white → yellow → orange → red (4단계 변화)
- 칩 선택 규칙:
  - 아무도 선택하지 않은 칩 선택 가능
  - 다른 플레이어가 선택한 칩도 빼앗기 가능
  - 칩을 변경하거나 빼앗기면 준비 상태 자동 해제
  - 준비 완료 전까지 언제든 변경 가능

**준비 시스템:**
- 모든 플레이어가 칩을 선택하고 준비 완료해야 다음 스텝 진행
- 준비 완료 상태에서 칩을 변경하면 자동으로 준비 해제
- 다른 플레이어가 내 칩을 빼앗으면 자동으로 준비 해제

**승리 조건:**
- 마지막 스텝에서 칩 번호 순서대로 족보가 올라가야 성공
- 예: 1번 칩의 족보 < 2번 칩의 족보 < 3번 칩의 족보
- 족보 순위: (높음) Royal Straight Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card (낮음)

**족보 계산 (poker.ts):**
- 손패(2장) + 오픈 카드(0~5장) 조합으로 최고 족보 계산
- 주요 함수:
  - `isFlush()`: 플러시 판정
  - `isStraight()`: 스트레이트 판정
  - `getHandRank()`: 족보 순위 반환 (0-9)
  - `compareHands()`: 두 손의 족보 비교

### 재연결 시스템

**서버 측 재연결 로직:**
- 연결 끊김 후 **5초 grace period** (DISCONNECT_GRACE_MS)
- Grace period 내 재연결 시:
  - playerId로 기존 플레이어 식별
  - 손패, 칩, 플레이어 순서 그대로 유지
  - 재연결 타이머 자동 취소
  - 다른 플레이어들에게 `userJoined` 이벤트 전송

**클라이언트 측 재연결:**
- `joinRoom` 이벤트로 재연결 요청
- `roomJoined` 이벤트로 전체 게임 상태 수신:
  - 손패, 오픈 카드, 칩, 현재 스텝
  - 플레이어 목록, 준비 상태
  - 게임 진행 상황 (gameStarted, gameFinished 등)

### 다음 라운드 시스템

**라운드 종료 후:**
- 게임 결과 표시 (승리/패배)
- 모든 플레이어가 "다음 라운드 진행" 버튼 클릭 필요
- 전원 준비 완료 시 자동으로 새 게임 시작

**라운드 초기화 항목:**
- 덱 재생성
- 오픈 카드 초기화
- 손패 초기화
- 칩 상태 초기화 (이전 칩 기록은 유지)
- 준비 상태 초기화
- 현재 스텝 1로 리셋

**승패 기록:**
- 최대 5개까지 승패 기록 유지 (winLossRecord)
- 플레이어 아바타에 ○(승리) / ×(패배) 표시

### 비밀방 시스템

**방 생성:**
- "비밀방" 체크박스로 비밀방 설정
- 비밀방 체크 시 비밀번호 입력 필수
- 서버에 `password` 파라미터 전송

**방 목록:**
- 비밀방은 🔒 아이콘으로 표시
- `isPrivate` 필드로 비밀방 여부 확인

**방 입장:**
- 비밀방 클릭 시 비밀번호 입력 프롬프트 표시
- 비밀번호 일치 시에만 입장 가능
- 비밀번호 불일치 시 에러 메시지

### 강퇴 시스템

**사용 조건:**
- 방장(hostPlayerId)만 사용 가능
- 게임 시작 전에만 강퇴 가능
- 자기 자신은 강퇴 불가

**UI:**
- 플레이어 아바타에 X 버튼 표시 (방장에게만 보임)
- 강퇴 버튼 클릭 시 확인 다이얼로그
- `window.confirm()` 사용

**강퇴 처리:**
- 서버에 `kickPlayer` 이벤트 전송
- 강퇴당한 플레이어는 `kicked` 이벤트 수신
- 자동으로 로비로 리다이렉트
- 다른 플레이어들에게 `userLeft` 이벤트 전송

## 주요 컴포넌트 상세

### 1. WebSocketContext (`src/contexts/WebSocketContext.tsx`)

**역할**: 전역 WebSocket 연결 관리

**제공하는 값:**
- `ws: WebSocket | null` - WebSocket 인스턴스
- `isConnected: boolean` - 연결 상태
- `send(event: string, data?: unknown)` - 메시지 전송 함수
- `subscribe(callback)` - 메시지 구독 함수

**사용 예시:**
```typescript
const { send, subscribe, isConnected } = useWebSocket();

useEffect(() => {
  const unsubscribe = subscribe((event, data) => {
    if (event === 'gameStarted') {
      // 게임 시작 처리
    }
  });
  return unsubscribe;
}, [subscribe]);
```

### 2. Lobby.tsx (`src/pages/Lobby.tsx`)

**주요 기능:**
- 닉네임 입력 및 로컬 스토리지 저장
- 방 생성 (일반방/비밀방)
- 방 목록 조회 및 입장
- 비밀방 비밀번호 입력

**주요 상태:**
- `rooms: { name, playerCount, isPrivate }[]` - 방 목록
- `nickname: string` - 사용자 닉네임
- `playerId: string` - 고유 식별자 (UUID)

**WebSocket 이벤트:**
- 송신: `getRooms`, `createRoom`, `joinRoom`
- 수신: `roomList`, `roomCreated`, `roomJoined`, `error`

### 3. Room.tsx (`src/pages/Room.tsx`)

**주요 기능:**
- 게임 진행 관리
- 채팅 시스템
- 플레이어 목록 표시
- 강퇴 기능 (방장 전용)
- 게임 시작 버튼 (방장 전용)

**주요 상태:**
- `players: PlayerHand[]` - 플레이어 목록
- `hand: Card[]` - 내 손패
- `openCards: Card[]` - 공개 카드
- `chips: Chip[]` - 칩 목록
- `currentStep: number` - 현재 스텝 (1-4)
- `gameStarted: boolean` - 게임 시작 여부
- `messages: ChatMessage[]` - 채팅 메시지

**WebSocket 이벤트:**
- 송신: `startGame`, `leaveRoom`, `roomMessage`, `kickPlayer`
- 수신: `gameStarted`, `userJoined`, `userLeft`, `roomMessage`, `kicked`

### 4. GangGameBoard.tsx (`src/components/gang/GangGameBoard.tsx`)

**주요 기능:**
- 칩 선택 UI
- 카드 뽑기 버튼
- 준비 완료 버튼
- 플레이어 상태 표시 (칩, 카드 수, 준비 여부)

**주요 Props:**
- `players`, `hand`, `openCards`, `chips`, `currentStep`
- `playerId`, `nickname`
- `send: (event, data) => void`

**WebSocket 이벤트:**
- 송신: `drawCard`, `selectChip`, `playerReady`
- 수신: `cardDrawn`, `chipSelected`, `playerReadyUpdate`, `nextStep`

### 5. GangResultModal.tsx (`src/components/gang/GangResultModal.tsx`)

**주요 기능:**
- 게임 결과 표시 (승리/패배)
- 각 플레이어의 족보와 카드 표시
- 다음 라운드 진행 버튼
- 최종 게임 오버 표시

**주요 Props:**
- `gameResult: 'victory' | 'defeat' | null`
- `players: PlayerResult[]`
- `nextRoundReady: Set<string>`
- `gameOver: boolean`
- `send: (event, data) => void`

**WebSocket 이벤트:**
- 송신: `readyNextRound`
- 수신: `nextRoundReadyUpdate`, `gameStarted`

### 6. CardDeck.tsx (`src/components/CardDeck.tsx`)

**주요 기능:**
- 카드 이미지 표시
- 카드 뒷면 표시
- 애니메이션 효과

**Props:**
- `cards: Card[]` - 표시할 카드 배열
- `faceDown?: boolean` - 뒷면 표시 여부

## 게임 타입별 컴포넌트 구조

**현재 구현된 게임:**
- Gang (`src/components/gang/`)

**새로운 게임 타입 추가 방법:**

1. **게임 컴포넌트 폴더 생성**
   ```
   src/components/[게임타입]/
   ├── [게임타입]GameBoard.tsx    # 게임판 메인 컴포넌트
   ├── [게임타입]ResultModal.tsx  # 결과 모달
   ├── types.ts                   # 게임별 타입 정의
   └── index.ts                   # Export 파일
   ```

2. **게임 설정 파일 추가**
   ```typescript
   // src/utils/games/[게임타입].ts
   export const MIN_PLAYERS = 2;
   export const MAX_PLAYERS = 10;
   // 게임별 상수 정의
   ```

3. **Room.tsx에서 게임 타입에 따라 조건부 렌더링**
   ```typescript
   {gameType === 'gang' && <GangGameBoard {...props} />}
   {gameType === 'holdem' && <HoldemGameBoard {...props} />}
   ```

4. **서버 측 게임 엔진 추가**
   - `the-gang-server/src/game/engines/[게임타입].engine.ts` 생성
   - `GameEngine` 인터페이스 구현
   - `game.module.ts`에 등록

**예시 (Texas Hold'em 추가 시):**
```typescript
// src/components/holdem/HoldemGameBoard.tsx
export const HoldemGameBoard = (props) => {
  // Hold'em 게임 로직
};

// src/components/holdem/types.ts
export interface HoldemGameState {
  pot: number;
  currentBet: number;
  // ...
}

// src/utils/games/holdem.ts
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 9;
export const BLINDS = { small: 10, big: 20 };

// Room.tsx
{gameType === 'holdem' && <HoldemGameBoard {...props} />}
```

## 환경 변수 설정

**파일**: `src/env.d.ts`

```typescript
interface ImportMetaEnv {
  readonly VITE_WS_URL: string
}
```

**사용법**:
- 개발: `.env` 파일에 `VITE_WS_URL=ws://localhost:9030/ws` 설정
- 프로덕션: `.env.production` 파일에 `VITE_WS_URL=wss://your-domain.com/ws` 설정
