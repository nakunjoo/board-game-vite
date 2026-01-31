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
├── contexts/        # React Context (WebSocketContext 등)
├── pages/           # 페이지 컴포넌트
│   ├── Lobby.tsx    # 로비 페이지
│   └── Room.tsx     # 게임 룸 페이지
├── styles/          # styled-components 스타일 정의
│   ├── pages/       # 페이지별 스타일
│   ├── game/        # 게임 관련 스타일
│   ├── chat/        # 채팅 관련 스타일
│   └── index.ts     # 스타일 export
├── types/           # TypeScript 타입 정의
│   └── game.ts      # 게임 관련 타입 (SeatPosition, Player 등)
├── utils/           # 유틸리티 및 상수
│   └── constants.ts # 상수 값 (SEAT_POSITIONS 등)
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

서버 주소: `ws://localhost:3000/ws`

이벤트 기반 통신 구조:
```typescript
// 메시지 전송
send(event: string, data?: unknown)

// 메시지 구독
subscribe(callback: (event: string, data: unknown) => void)
```
