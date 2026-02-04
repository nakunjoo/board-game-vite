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
├── assets/          # 정적 리소스 (이미지, SVG 등)
├── components/      # 재사용 가능한 컴포넌트
│   ├── gang/        # Gang 게임 타입별 컴포넌트
│   │   ├── GangGameBoard.tsx    # 게임판 컴포넌트
│   │   ├── GangResultModal.tsx  # 결과 모달 컴포넌트
│   │   ├── types.ts             # 공통 타입 정의
│   │   └── index.ts             # Export 파일
│   └── CardDeck.tsx # 카드 덱 컴포넌트
├── contexts/        # React Context (WebSocketContext 등)
├── pages/           # 페이지 컴포넌트
│   ├── Lobby.tsx    # 로비 페이지
│   └── Room.tsx     # 게임 룸 페이지 (게임 타입 선택 및 라우팅)
├── styles/          # styled-components 스타일 정의
│   ├── pages/       # 페이지별 스타일
│   ├── game/        # 게임 관련 스타일
│   ├── chat/        # 채팅 관련 스타일
│   └── index.ts     # 스타일 export
├── types/           # TypeScript 타입 정의
│   └── game.ts      # 게임 관련 타입 (Card, GameConfig, PlayerHand 등)
├── utils/           # 유틸리티 및 상수
│   ├── cards.ts     # 카드 관련 유틸
│   ├── poker.ts     # 포커 족보 계산
│   ├── games/       # 게임별 설정
│   │   ├── gang.ts  # Gang 게임 설정
│   │   └── index.ts # 게임 설정 export
│   └── constants.ts # 상수 값
├── App.tsx          # 메인 앱 컴포넌트
└── main.tsx         # 엔트리 포인트
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

## WebSocket

서버 주소: `ws://localhost:9030/ws`

이벤트 기반 통신 구조:
```typescript
// 메시지 전송
send(event: string, data?: unknown)

// 메시지 구독
subscribe(callback: (event: string, data: unknown) => void)
```

### 주요 WebSocket 이벤트

**클라이언트 → 서버:**
- `createRoom` - 방 생성 (password 옵션으로 비밀방 생성 가능)
- `joinRoom` - 방 참가 / 재연결 (비밀방인 경우 password 필요)
- `leaveRoom` - 방 퇴장
- `startGame` - 게임 시작
- `drawCard` - 카드 뽑기
- `selectChip` - 칩 선택 (준비 완료 전까지 언제든 변경 가능)
- `playerReady` - 플레이어 준비 완료
- `readyNextRound` - 다음 라운드 준비
- `getRooms` - 방 목록 조회
- `getPlayerList` - 플레이어 목록 조회
- `roomMessage` - 채팅 메시지
- `kickPlayer` - 플레이어 강퇴 (방장 전용, 게임 시작 전)

**서버 → 클라이언트:**
- `roomCreated` - 방 생성 완료
- `roomJoined` - 방 참가 완료 (재연결 시 전체 상태 포함)
- `roomLeft` - 방 퇴장 완료
- `userJoined` - 다른 플레이어 참가 (재연결 포함)
- `userLeft` - 다른 플레이어 퇴장
- `gameStarted` - 게임 시작 (덱, 손패, 오픈 카드, 칩 초기화)
- `cardDrawn` - 카드 뽑기 완료
- `chipSelected` - 칩 선택 완료
- `playerReadyUpdate` - 플레이어 준비 상태 업데이트
- `nextStep` - 다음 스텝 진행
- `gameFinished` - 게임 종료 (결과 데이터 포함)
- `nextRoundReadyUpdate` - 다음 라운드 준비 상태 업데이트
- `roomList` - 방 목록 (isPrivate 필드로 비밀방 여부 표시)
- `playerList` - 플레이어 목록
- `roomMessage` - 채팅 메시지
- `kicked` - 강퇴 알림 (강퇴당한 플레이어에게 전송)
- `error` - 에러 메시지

## 게임 로직

### Gang 게임 규칙

1. **플레이어**: 최소 3명 필요
2. **카드**: 각 플레이어는 2장의 카드를 받음
3. **오픈 카드**: 공개 카드가 3단계에 걸쳐 공개됨
   - 스텝 1: 0장
   - 스텝 2: 3장
   - 스텝 3: 4장
   - 스텝 4: 5장 (최종)
4. **칩 선택**: 각 스텝마다 플레이어는 칩을 선택
   - 칩은 언제든 변경 가능 (준비 완료 전까지)
   - 다른 플레이어의 칩도 빼앗을 수 있음
   - 칩을 변경하거나 빼앗기면 준비 상태 자동 해제
5. **준비 시스템**: 모든 플레이어가 준비해야 다음 스텝 진행
6. **승리 조건**: 마지막 칩 번호 순서대로 족보가 올라가야 성공
   - 예: 1번 칩 < 2번 칩 < 3번 칩 (족보 기준)

### 재연결 시스템

- 연결 끊김 후 5초 grace period
- Grace period 내 재연결 시:
  - 기존 상태(손패, 칩, 순서) 유지
  - 다른 플레이어들에게 `userJoined` 이벤트 전송
  - 재연결한 플레이어는 전체 게임 상태 수신

### 다음 라운드 시스템

- 게임 종료 후 모든 플레이어가 "다음 라운드 진행" 클릭 필요
- 전원 준비 시 자동으로 새 게임 시작
- 모든 상태 초기화:
  - 덱, 오픈 카드, 손패, 칩, 이전 칩 기록
  - 준비 상태, 현재 스텝

### 비밀방 시스템

- 방 생성 시 "비밀방" 체크박스로 비밀방 설정 가능
- 비밀방 생성 시 비밀번호 입력 필수
- 방 목록에서 비밀방은 🔒 아이콘으로 표시
- 비밀방 입장 시 비밀번호 입력 필요
- 비밀번호가 일치하지 않으면 입장 불가

### 강퇴 시스템

- 방장만 강퇴 기능 사용 가능
- 게임 시작 전에만 강퇴 가능
- 플레이어 아바타에 X 버튼으로 강퇴
- 강퇴 시 확인 다이얼로그 표시
- 강퇴당한 플레이어는 자동으로 로비로 이동

## 게임 타입별 컴포넌트 구조

새로운 게임 타입을 추가하려면:

1. `src/components/[게임타입]/` 폴더 생성
2. 필요한 컴포넌트 작성:
   - `[게임타입]GameBoard.tsx` - 게임판 컴포넌트
   - `[게임타입]ResultModal.tsx` - 결과 모달 컴포넌트
   - `types.ts` - 게임별 타입 정의
   - `index.ts` - Export 파일
3. `src/pages/Room.tsx`에서 게임 타입에 따라 조건부 렌더링

예시:
```typescript
// src/components/holdem/HoldemGameBoard.tsx
// src/components/holdem/HoldemResultModal.tsx
// src/components/holdem/types.ts
// src/components/holdem/index.ts

// Room.tsx에서
{gameType === 'gang' && <GangGameBoard {...props} />}
{gameType === 'holdem' && <HoldemGameBoard {...props} />}
```
