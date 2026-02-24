# The Gang - Frontend

React 19 + TypeScript 기반 멀티플레이어 카드 게임 웹 애플리케이션

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02-24 | `SkulkingHelpModal.tsx`: 탭 3개(게임 규칙 / 카드 족보 / 카드 구성)로 재구성, 카드 족보 탭에 세로 카드 아이콘 + 보너스 점수 박스 추가 |
| 2026-02-24 | `SkulkingGameBoard.tsx`: Follow suit UI 제한 추가 — 리드 수트가 손패에 있으면 리드 수트/특수카드만 클릭 가능, 나머지는 opacity 0.3 + cursor not-allowed |
| 2026-02-24 | `SkulkingGameBoard.tsx`: 리드 수트 결정 로직 수정 — `currentTrick[0]` 기준이 아닌 트릭에서 처음 나온 숫자 수트 카드 기준으로 변경 |
| 2026-02-24 | `skulking/index.tsx`: 선뽑기(`skulkingDrawFirstCard`) 추가, `skulkingFirstDrawStarted/Result/Progress/Finished` 이벤트 처리, `trickWinnerId` 상태 추가 |
| 2026-02-24 | `SkulkingGameBoard.tsx`: 비드 입력을 BidOverlay+BidModal(손패 카드 미리보기 포함) 방식으로 변경 |
| 2026-02-24 | `SkulkingGameBoard.tsx`: 트릭 승자 아이콘(👑), 리드 카드 흰 테두리+"1" 뱃지 추가 |
| 2026-02-23 | 스컬킹(Skull King) 게임 추가: `components/skulking/`, `pages/Room/skulking/`, `utils/games/skulking.ts` 신규 생성 |
| 2026-02-23 | `SkulkingGameBoard.tsx`: `GameBoard`, `PlayerCircle`, `PlayerSeat`, `PlayerAvatar` 등 기존 스타일 컴포넌트 기반으로 작성 (Gang/Spice와 동일한 보드 UI 구조) |
| 2026-02-23 | `SkulkingHelpModal.tsx`: `isOpen: boolean` prop 추가, `if (!isOpen) return null` 패턴 적용 |
| 2026-02-23 | `Lobby.tsx`: GAME_TYPES에 skulking 추가 |
| 2026-02-23 | `pages/Room/index.tsx`: skulking 라우팅 추가 |
| 2026-02-23 | `utils/games/index.ts`: SKULKING_CONFIG 등록 |
| 2026-02-23 | `Lobby.tsx`: 방 목록 게임타입 표시 3중 조건으로 수정 (skulking→스컬킹, spice→향신료, 나머지→갱스터) |
| 2026-02-23 | `Lobby.tsx`: 방 생성 시 방제목 미입력이면 `{닉네임}의방` 자동 설정 |
| 2026-02-23 | `skulking/index.tsx`: `skulkingRoundStarted` 케이스에 `setGameStarted(true)` 추가 (방장 외 플레이어도 게임 보드 진입) |
| 2026-02-23 | `SkulkingGameBoard.tsx`: 트릭 카드 각 플레이어 앞에 표시 (TrickCardSlot 절대위치) |
| 2026-02-23 | `SkulkingGameBoard.tsx`: 플레이어 순번 뱃지 추가 (OrderBadge, 아바타 좌상단) |
| 2026-02-23 | `SkulkingGameBoard.tsx`: 비드 표시 `(N) / 라운드` 형식으로 변경 |
| 2026-02-23 | `SkulkingGameBoard.tsx`: 점수 뱃지(위/좌)와 비드 뱃지(아래/우) 자리 분리, 좌석 위치에 따라 정렬 방향 변경 |
| 2026-02-23 | `SkulkingGameBoard.tsx`: 라운드 표시를 게임판 정중앙으로 이동 (BoardCenterBadge, position absolute 50%/50%) |
| 2026-02-23 | `SkulkingGameBoard.tsx`: TopBar는 `gameStarted && phase` 조건일 때만 렌더링 (빈 검정 영역 제거) |
| 2026-02-23 | `SkulkingGameBoard.tsx`: 좌하단 DeckDisplay 버튼 추가 → 클릭 시 라운드 통계 모달 표시 |
| 2026-02-23 | `SkulkingGameBoard.tsx`: StatsModal — 행=라운드(1~10), 열=플레이어, 셀=(비드)/트릭/점수, 합계 행, 92vw, 닫기 버튼 |
| 2026-02-22 | `useRoomBase.ts`: 새로고침 감지 방식을 `performance.getEntriesByType('navigation')` 기반으로 변경 |
| 2026-02-22 | `spice/index.tsx`: `roomJoined`에서 firstDraw 상태 복원, `reconnectTurnTimeLeft` / `reconnectChallengeTimeLeft` 상태 추가 |
| 2026-02-22 | `spice/index.tsx`: `challengeExpired` 수신 시 `setChallengePhase(null)` 1100ms 지연 (도전 타이머 0초 표시 race condition 수정) |
| 2026-02-22 | `SpiceGameBoard.tsx`: 턴 타이머 `next < 0` 조건으로 변경 (0초 1초 표시 후 패스), 도전 타이머 `prev <= 0` 조건으로 변경 (0초 표시 후 정지) |
| 2026-02-22 | `SpiceGameBoard.tsx`: `reconnectTurnTimeLeft` / `reconnectChallengeTimeLeft` prop 추가 (재연결 시 타이머 남은 시간 복원) |
| 2026-02-22 | `SpiceSuitIcon` export 추가, `SpiceHelpModal`에서 실제 SVG 아이콘 사용 (이모지 → 실제 카드 문양) |
| 2026-02-22 | `SpiceHelpModal`: 턴 제한시간 20초 → 30초 수정 |
| 2026-02-22 | `SpiceGameBoard`: 향신료 게임 시작 최소 인원 2명으로 제한 (혼자면 버튼 비활성화) |

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
│   ├── spice/                      # Spice 게임 전용 컴포넌트
│   │   ├── SpiceGameBoard.tsx      # 게임판 메인 UI (턴/도전/타이머 바)
│   │   ├── SpiceResultModal.tsx    # 점수 기반 결과 모달
│   │   └── SpiceHelpModal.tsx      # 게임 규칙 설명 모달
│   └── skulking/                   # Skulking 게임 전용 컴포넌트
│       ├── SkulkingGameBoard.tsx   # 게임판 메인 UI (트릭/비드/Tigress)
│       ├── SkulkingResultModal.tsx # 라운드/최종 결과 모달
│       ├── SkulkingHelpModal.tsx   # 게임 규칙 설명 모달 (isOpen prop 패턴)
│       └── types.ts                # Skulking 전용 타입 (TrickEntry, SkulkingPlayer, RoundResult, GameOverResult)
├── pages/
│   ├── Lobby.tsx                   # 로비 (방 목록, 생성, 입장)
│   └── Room/
│       ├── index.tsx               # Room 메인
│       ├── common/
│       │   └── useRoomBase.ts      # Room 공통 로직 훅 (Gang/Spice 공유)
│       ├── gang/index.tsx          # Gang Room 래퍼
│       ├── spice/index.tsx         # Spice Room 래퍼 (Spice 전용 상태 관리)
│       └── skulking/index.tsx      # Skulking Room 래퍼 (Skulking 전용 상태 관리)
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
        ├── skulking.ts             # Skulking 설정 (SKULKING_SUIT_COLORS/LABELS/NAMES, isSpecialCard, SKULKING_CONFIG)
        └── index.ts
```

## 코드 컨벤션

- 타입/인터페이스는 `src/types/` 또는 각 게임 폴더의 `types.ts`에 정의
- 상수명은 UPPER_SNAKE_CASE
- styled-components transient props는 `$` 접두사 (예: `$isMe`, `$totalPlayers`)
- 게임별 컴포넌트는 `src/components/[게임타입]/` 폴더에 분리

## 컴포넌트 폴더 구조 컨벤션

게임 보드에서 분리한 서브 컴포넌트/모달은 역할별 서브폴더로 구분한다.

```
components/[게임이름]/
├── [게임이름]GameBoard.tsx       # 게임판 메인 (최상위)
├── [게임이름]HelpModal.tsx       # 도움말 최상위 (help에서 분리한 게 있으면 help/ 하위)
├── types.ts
├── game/                         # 게임 보드에서 분리된 서브 컴포넌트/모달
│   ├── [게임이름]BidModal.tsx
│   ├── [게임이름]ResultModal.tsx
│   └── ...
└── help/                         # 도움말 모달에서 분리된 서브 컴포넌트
    └── ...
```

스타일은 `src/styles/game/[게임이름]/` 하위에 역할별로 파일을 나눈다.

```
styles/game/[게임이름]/
├── card.ts          # 카드 스타일
├── board.ts         # 게임판 스타일
├── boardCenter.ts   # 중앙 상태 표시
├── bidModal.ts      # 비드 모달
├── resultModal.ts   # 결과 모달
├── helpModal.ts     # 도움말 모달
└── ...
```

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
- `/room/skulking/:roomName` - Skulking 게임 룸

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

## Skulking 게임 이벤트

**클라이언트 → 서버:** `startGame`, `skulkingBid`, `skulkingPlayCard`, `skulkingNextRound`

**서버 → 클라이언트:** `skulkingRoundStarted`, `skulkingBidPhase`, `skulkingBidUpdate`, `skulkingPlayPhase`, `skulkingCardPlayed`, `skulkingTurnUpdate`, `skulkingTrickResult`, `skulkingRoundResult`, `skulkingGameOver`

## Skulking 게임 UI 구조 (SkulkingGameBoard)

- 기존 `GameBoard`, `PlayerCircle`, `PlayerSeat`, `PlayerAvatar` 등 Gang/Spice와 동일한 스타일 컴포넌트 사용
- **게임판 정중앙** (BoardCenterBadge): 라운드 뱃지, 페이즈 뱃지, 타이머(20초 카운트다운 바) 표시
- **플레이어 원형 배치**: GangGameBoard와 동일한 seatIndex 계산 방식
  - `seatIndex = (playerOrder - myOrder + totalPlayers) % totalPlayers`
  - `getSeatPosition(totalPlayers, seatIndex)` → `{top?, bottom?, left?, right?}`
  - `isVertical = pos.left === "0" || pos.right === "0"` (좌우 플레이어)
  - **OrderBadge**: 아바타 좌상단에 순번(player.order + 1) 표시
  - **점수 뱃지**: 수평 플레이어는 좌측/위, 수직 플레이어는 아래 배치
  - **비드 뱃지**: 수평 플레이어는 우측/위, 수직 플레이어는 아래 배치, 형식 `(N) / 라운드`
  - 차례인 플레이어 아바타에 `outline: 2px solid #f39c12` 강조
- **트릭 카드** (TrickCardSlot): 각 플레이어 좌석 앞에 절대위치로 표시
  - 승자 카드: 👑 아이콘 + 금테두리 + glow
  - 리드 카드(첫 번째): 흰 테두리 + "1" 뱃지
- **손패** (MyHandArea + SkCard): 배경색 = 수트 색상
  - 내 플레이 차례: 카드 클릭 → 선택 강조 → "카드 내기" 확정 버튼
  - Tigress 클릭 시 Escape/Pirate 선언 모달 표시
  - **Follow suit 제한**: 리드 수트(`leadEntry = currentTrick.find(e => !isSpecialCard(e.card.type))`) 손패에 있으면 리드 수트/특수 카드만 활성화, 나머지는 `opacity: 0.3` + `cursor: not-allowed`
- **비드 입력** (BidOverlay + BidModal): 풀스크린 오버레이, 내 손패 카드 미리보기 + 0~round 버튼 + 확정 버튼
- **선뽑기 오버레이**: 카드 뒷면 클릭 → 숫자 공개 → 전원 완료 시 결과 표시 + 2초 후 게임 시작
- **좌하단 통계 버튼** (DeckDisplay): 클릭 → StatsModal
  - 행=라운드(1~10), 열=플레이어(첫 글자+색), 셀=(비드)/트릭 + 점수, 합계 행
- **결과 모달**: `SkulkingResultModal` (라운드/최종 모두 처리)

## Skulking 리드 수트 결정 규칙

- 트릭에서 **처음으로 나온 숫자 수트 카드**(sk-black/yellow/purple/green)가 리드 수트
- 특수 카드(sk-escape/pirate/mermaid/skulking/tigress)가 먼저 나와도 리드 수트가 되지 않음
- 리드 수트가 결정되면 이후 플레이어는 해당 수트 또는 특수 카드만 낼 수 있음
- 손패에 리드 수트가 없으면 아무 카드나 가능
- 모든 플레이어가 특수 카드만 냈으면 리드 수트 없음

```typescript
// 클라이언트 (SkulkingGameBoard.tsx)
const leadEntry = currentTrick.find((e) => !isSpecialCard(e.card.type));
const leadSuit = leadEntry ? leadEntry.card.type : null;

// 서버 (skulking.handler.ts)
const leadEntry = currentTrick.find((e) => this.isNumberSuit(this.getEffectiveType(e)));
```

## Skulking 선뽑기 (skulkingFirstDraw)

- 게임 시작 시 먼저 선뽑기 진행 (Spice 게임과 동일한 패턴)
- 이벤트: `skulkingDrawFirstCard` → `skulkingFirstDrawStarted` / `skulkingFirstDrawResult` / `skulkingFirstDrawProgress` / `skulkingFirstDrawFinished`
- 가장 높은 숫자를 뽑은 플레이어가 첫 번째 비드 플레이어
- 마지막 트릭 승자가 다음 트릭/라운드 리드 플레이어 (`skulkingLeadPlayerId` 유지)

## SkulkingHelpModal 구조 (3탭)

- **게임 규칙 탭**: 목표, 진행 방식, 리드 수트 결정, 점수 계산
- **카드 족보 탭**: 1위(해골왕)~7위(탈출) 세로 카드 아이콘 + 설명, 하단 보너스 점수 박스
- **카드 구성 탭**: 숫자 수트 4종 + 특수 카드 5종 테이블, 카드 색상 아이콘 인라인 표시

## Skulking 카드 구성 (66장)

| 카드 | type | 장수 |
|------|------|------|
| 검정 수트 (Jolly Roger) | `sk-black` | 13 |
| 노랑 수트 (Treasure Chest) | `sk-yellow` | 13 |
| 보라 수트 (Jolly Roger) | `sk-purple` | 13 |
| 초록 수트 (Mermaid's Crown) | `sk-green` | 13 |
| 탈출 (Escape) | `sk-escape` | 5 |
| 해적 (Pirate) | `sk-pirate` | 5 |
| 인어 (Mermaid) | `sk-mermaid` | 2 |
| 해골왕 (Skull King) | `sk-skulking` | 1 |
| 타이그레스 (Tigress) | `sk-tigress` | 1 |

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
