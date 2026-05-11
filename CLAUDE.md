# The Gang - Frontend

React 19 + TypeScript 기반 멀티플레이어 카드 게임 웹 애플리케이션

## Supabase

DB 스키마, RLS 정책, 트리거 SQL → [SUPABASE_SCHEMA.md](../SUPABASE_SCHEMA.md) 참조

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-11 | **카지노 버그 수정 및 UI 개선** |
| 2026-05-11 | `components/casino/CasinoSetupModal.tsx`: 게임 시간 옵션 5분 / 10분 / 무제한 3가지로 축소 (30분·60분 제거). 기본값 10분 |
| 2026-05-11 | `components/casino/games/VideoPokerGame.tsx`: 블랙잭 스타일 레이아웃으로 전면 재구성 — 초록 테이블 배경, 족보 테이블 화면에서 제거(? 도움말로만 확인), 카드 존 + 현재 족보 뱃지(알약형), "전부 버리기" 버튼 제거, DRAW 버튼만 유지 |
| 2026-05-11 | `components/casino/games/BlackjackGame.tsx`, `VideoPokerGame.tsx`: `CardFace`에 `overflow: hidden` 추가 — 뒤집힌 하단 코너 숫자가 카드 밖으로 삐져나오는 버그 수정 |
| 2026-05-11 | `components/casino/games/RouletteGame.tsx`: 멀티베팅 지원 — 여러 칸에 동시 배팅 가능. 좌클릭=칩 추가, 우클릭=해당 칸 취소, 전체 초기화 버튼. 칩 뱃지(노란색, 1k/10k 단위 표기). 총 베팅액 표시. 휠 160px로 축소, 전체 세로 간격 압축 |
| 2026-05-11 | `components/casino/games/SlotsGame.tsx`: 스핀 애니메이션 전면 재작성 — `animation: infinite` → 결과가 심어진 긴 스트립(31개 심볼) CSS `transition` 방식으로 변경. `key` prop으로 리마운트 후 double rAF로 전환. 릴 1→1.8s, 릴 2→2.3s, 릴 3→2.8s 순차 정지. 중간에 빈 화면 나타나는 버그 수정 |
| 2026-05-11 | `components/casino/games/HorseRacingGame.tsx`: 경마 결과 불일치 버그 수정 — 비우승 말 최종 거리를 70~97%로 사전 확정(절대 100% 도달 불가), 시각적 우승자 = 실제 우승자 보장 |
| 2026-05-11 | **카지노 대출 시스템 추가** |
| 2026-05-11 | `components/casino/CasinoHub.tsx`: 잔액이 초기금의 5% 미만일 때 깜빡이는 대출 배너 표시. 클릭 시 대출 모달 (최소 10 / 최대 초기금의 절반, 이자 10%). 누적 대출금 + 예상 상환액 표시. 대출 시 채팅 시스템 메시지 기록 |
| 2026-05-11 | `pages/Room/casino/index.tsx`: `totalLoan` 상태 추가. `casinoLoanConfirmed` 이벤트 구독 (누적 대출 갱신 + 채팅 로그). `handleLoan` 핸들러 → `casinoLoan` 이벤트 전송. 게임 시작 시 `totalLoan` 초기화 |
| 2026-05-11 | **카지노 게임 추가** |
| 2026-05-11 | `pages/Room/casino/index.tsx` 신규 생성 — 카지노 Room 페이지. `casinoStarted`/`casinoBalanceUpdate`/`casinoPlayerUpdate`/`casinoVoteStatus`/`casinoGameOver` 이벤트 구독. 게임 선택 오버레이(`renderCurrentGameOverlay`) 방식으로 개별 게임 컴포넌트 렌더링 |
| 2026-05-11 | `components/casino/CasinoHub.tsx` 신규 생성 — 게임 허브 UI. 7개 게임 카드 그리드, 잔액/타이머 상단 표시, 종료 투표 버튼 |
| 2026-05-11 | `components/casino/CasinoLeaderboard.tsx` 신규 생성 — 실시간 플레이어 잔액 순위표 |
| 2026-05-11 | `components/casino/CasinoSetupModal.tsx` 신규 생성 — 게임 시작 설정 모달 (초기 잔액, 시간 제한) |
| 2026-05-11 | `components/casino/CasinoResultModal.tsx` 신규 생성 — 게임 종료 결과 모달 |
| 2026-05-11 | `components/casino/CasinoHelpModal.tsx` 신규 생성 — 카지노 도움말 모달 |
| 2026-05-11 | `components/casino/BetControls.tsx` 신규 생성 — 공통 베팅 컨트롤 (텍스트 입력 + MIN/¼/½/MAX 버튼). 입력값 min/max 클램핑 처리 |
| 2026-05-11 | `components/casino/games/GameHelpModal.tsx` 신규 생성 — 게임별 도움말 공통 모달 (`HelpSection`, `HelpText`, `PayTable`, `PayLabel`, `PayValue` export) |
| 2026-05-11 | `components/casino/games/RouletteGame.tsx` 신규 생성 — 룰렛 (MIN 1%/MAX 5%, straight 35배, red/black 1배, dozen 2배 등) |
| 2026-05-11 | `components/casino/games/SlotsGame.tsx` 신규 생성 — 슬롯머신 (MIN 1%/MAX 2%) |
| 2026-05-11 | `components/casino/games/BaccaratGame.tsx` 신규 생성 — 바카라 (MIN 1%/MAX 10%, Player 1:1, Banker 0.95:1, Tie 8:1) |
| 2026-05-11 | `components/casino/games/BlackjackGame.tsx` 신규 생성 — 블랙잭 (MIN 1%/MAX 10%, 히트/스탠드/더블 지원) |
| 2026-05-11 | `components/casino/games/VideoPokerGame.tsx` 신규 생성 — 비디오 포커 잭스오어베터 (MIN 1%/MAX 5%) |
| 2026-05-11 | `components/casino/games/HorseRacingGame.tsx` 신규 생성 — 경마 (MIN 5%/MAX 30%, 4마리, 1등 적중 시 5:1 배당 × 6 수령) |
| 2026-05-11 | `components/casino/games/MinesGame.tsx` 신규 생성 — 지뢰찾기 (MIN 1%/MAX 10%, 25칸/지뢰 10개, 고정 배율표: 1칸×0.7 ~ 15칸×1000, 첫 클릭도 지뢰 가능) |
| 2026-05-11 | `styles/game/casino/` 신규 생성 — 카지노 전용 styled-components |
| 2026-05-11 | `utils/games/index.ts`: `casino` 게임 설정 등록 |
| 2026-05-11 | `pages/Room/index.tsx`: casino 라우팅 추가 |
| 2026-04-29 | **Manager 페이지 3탭 구조로 확장**: 관리자 관리 / 게임타입 관리 / 신고 관리 탭 추가 |
| 2026-04-29 | `pages/Manager/index.tsx`: 게임타입 탭 — `GET/POST /api/manager/game-types` 호출, 타입 추가(id·이름·순서)·활성화 토글·인라인 수정(이름·순서)·삭제 |
| 2026-04-29 | `pages/Manager/index.tsx`: 신고 탭 — 전체/미처리/처리됨/기각 필터, 신고 상세 펼치기, 신고 상태 변경(처리됨/기각), 피신고자 계정 정지/해제 |
| 2026-04-29 | `Lobby.tsx`: 하드코딩 `GAME_TYPES` 배열 제거 → `GET /api/game-types` 공개 API 호출로 교체. 실패 시 기본값(gang/spice/skulking) fallback. 방 목록 게임타입 레이블도 API 데이터 기준으로 표시 |
| 2026-04-29 | **관리자 페이지 추가**: `pages/Manager/index.tsx` 신규 생성 — 닉네임 검색으로 관리자 추가, 관리자 목록 조회/제거 |
| 2026-04-29 | `components/AdminGuard.tsx` 신규 생성 — `isAdmin` 체크, 비관리자는 `/` 리다이렉트 |
| 2026-04-29 | `App.tsx`: `/manager` 라우트 추가 (`AdminGuard` 래핑) |
| 2026-04-29 | `Lobby.tsx`: 프로필 드롭다운에 `isAdmin`일 때만 🛠 관리자 버튼 표시 |
| 2026-04-29 | `AuthContext.tsx`: `isAdmin: boolean` 상태 추가 — `GET /api/profile` 응답의 `isAdmin` 필드에서 읽음. 로그아웃 시 `false` 리셋 |
| 2026-04-28 | **인증 기반 플레이어 식별 전환**: 랜덤 `playerId` 생성(sessionStorage) 제거 → Supabase `user.id`(UUID)를 `playerId`로 사용 |
| 2026-04-28 | `WebSocketContext.tsx`: 랜덤 id 생성 함수(`generateCardName`, `getPlayerIdForRoom`, `clearNicknameForRoom`) 전체 제거. WS 연결 시 `?token=ACCESS_TOKEN` 쿼리파람 추가 (Supabase `session.access_token`). `loading` / `session.access_token` 변경 시 재연결 |
| 2026-04-28 | `Lobby.tsx`: `createRoom`/`joinRoom` payload에서 `playerId`/`userId` 필드 제거 — 서버가 토큰 검증 후 직접 userId 결정. `setNicknameForRoom` 호출 제거 |
| 2026-04-28 | `useRoomBase.ts`: `playerId = user?.id ?? ""`, `nickname = authNickname ?? user?.email ?? ""` 로 변경. `getPlayerIdForRoom`, `getNicknameForRoom`, `clearNicknameForRoom` 의존성 제거. 재연결 `joinRoom` payload에서 `playerId`/`userId` 제거 |
| 2026-04-28 | 음성 통화 기능 추가 (WebRTC P2P): `pages/Room/common/useVoice.ts` 신규 생성 |
| 2026-04-28 | `styles/chat/index.ts`: `VoiceToggleButton`, `VoicePanel`, `VoiceParticipantList`, `VoiceConnectButton` 등 음성 스타일 컴포넌트 추가 |
| 2026-04-28 | `RoomLayout.tsx`: 채팅 버튼 위 마이크 아이콘 버튼 추가, 하단 슬라이드 음성 패널 추가. 음성 패널은 참여자 목록 + 연결하기/연결끊기 버튼으로 구성. `send`, `subscribe`, `playerId` optional props 추가 |
| 2026-04-28 | `gang/index.tsx`, `spice/index.tsx`, `skulking/index.tsx`: `RoomLayout`에 `send`, `subscribe`, `playerId` prop 전달 |
| 2026-04-03 | 지뢰찾기 싱글게임 추가: `components/single/minesweeper/`, `pages/Single/Minesweeper/`, `styles/single/minesweeper/` 신규 생성 |
| 2026-04-03 | `App.tsx`: `/single/minesweeper` 라우트 추가. `Lobby.tsx`: SINGLE_GAMES에 지뢰찾기 추가 |
| 2026-04-03 | 지뢰찾기 구조: `types.ts`(Difficulty, CellStatus, GamePhase, Cell, BestRecord), `constants.ts`(DIFFICULTIES, NUMBER_COLORS), `utils.ts`(보드 로직·localStorage), `MinesweeperBoard.tsx`, `modal/SetupModal.tsx`, `modal/ResultModal.tsx` |
| 2026-04-03 | 지뢰찾기 난이도: 초급(9×9, 10개), 중급(16×16, 40개), 고급(22행×16열, 99개) — 행×열 순서로 표기 |
| 2026-04-03 | 지뢰찾기 게임 흐름: SetupModal(난이도 선택) → 보드 표시(지뢰 미배치) → 첫 클릭 시 지뢰 배치(첫 클릭 주변 3×3 안전 보장) + 타이머 시작 → 클리어/폭발 시 ResultModal |
| 2026-04-03 | 지뢰찾기 깃발 없음: 깃발 기능 미구현. 지뢰 제외한 모든 칸 공개 시 승리 |
| 2026-04-03 | 지뢰찾기 셀 크기: `calcCellSize(containerW, containerH, rows, cols)` → `Math.max(Math.min(byW, byH), 20)` — 최소 20px, 최대 제한 없음. 화면을 항상 꽉 채우도록 자동 계산 (스크롤 없음) |
| 2026-04-03 | 지뢰찾기 GameBar: 여백 \| 😊 재시작 버튼(중앙) \| 타이머(우측). 높이 최소화(padding 4px) |
| 2026-04-03 | 지뢰찾기 최고 기록: localStorage(`minesweeper-best-{difficulty}`)에 난이도별 최고 시간 저장 |
| 2026-04-03 | 지뢰찾기 연쇄 공개: 빈 칸(adjacentMines=0) 클릭 시 BFS로 인접 빈 칸 자동 공개 |
| 2026-03-27 | 슬라이드 퍼즐 싱글게임 추가: `components/single/slide-puzzle/`, `pages/Single/SlidePuzzle/`, `styles/single/slide-puzzle/` 신규 생성 |
| 2026-03-27 | `App.tsx`: WebSocketProvider를 멀티플레이어 라우트(/,/room/:roomName)에만 스코프, `/single/slide-puzzle` 라우트 추가 |
| 2026-03-27 | `Lobby.tsx`: 방만들기 모달에 멀티/싱글 탭 추가. 싱글 탭 선택 시 바로 해당 게임 페이지로 이동. 방만들기 버튼은 서버 연결 여부와 무관하게 항상 활성화 |
| 2026-03-27 | 슬라이드 퍼즐 구조 분리: `types.ts`(GridSize 3~7, BestRecord, DefaultImage), `utils.ts`(보드 로직·이미지 생성·localStorage), `constants.ts`(BG_THEMES), `SlidePuzzleBoard.tsx`, `SlidePuzzleSubBar.tsx`, `modal/SetupModal.tsx`, `modal/ClearModal.tsx`, `modal/CropModal.tsx` |
| 2026-03-27 | 슬라이드 퍼즐 스타일 분리: `layout.ts`(헤더·페이지), `board.ts`(보드·타일), `subbar.ts`(서브바·설정패널), `modal.ts`(모달), `cropModal.ts`(크롭 모달) |
| 2026-03-27 | 슬라이드 퍼즐 보드: N cols × (N+1) rows 구조. 이미지 타일 N×N + 하단 행(빈칸 1개 + 막힘 N-1개). 타일 슬라이딩은 같은 행/열 내에서만 허용, 대각선 불가. CSS transition(top/left 0.13s)으로 이동 애니메이션 |
| 2026-03-27 | 슬라이드 퍼즐 타일 크기: `calcTileDims(containerW, containerH, size)` → `{ tileW, tileH }` 각각 독립 계산. Main 요소를 ResizeObserver로 측정하여 화면을 꽉 채우도록 자동 계산. 타일은 직사각형 허용(정사각형 강제 없음) |
| 2026-03-27 | 슬라이드 퍼즐 이미지: canvas API로 생성된 기본 이미지 4종 + 커스텀 업로드. 타일별 `background-image` + `backgroundSize: tileW*N x tileH*N` + `backgroundPosition: -origCol*tileW -origRow*tileH`로 슬라이싱 |
| 2026-03-27 | 슬라이드 퍼즐 이미지 크롭: 업로드 시 SetupModal 닫히고 CropModal 표시. SVG 마스크 오버레이로 선택 영역 외 어둡게 처리. tileW/tileH 비율 고정, 드래그로 위치만 조절. 확인 시 canvas로 크롭 후 JPEG dataURL 저장 |
| 2026-03-27 | 슬라이드 퍼즐 게임 흐름: SetupModal(크기+이미지 선택) → 정렬된 미리보기 표시 → 서브바 "게임 시작" 버튼 클릭 → 셔플 후 게임 시작. 재시작 버튼은 미리보기 상태로 복귀 |
| 2026-03-27 | 슬라이드 퍼즐 일시정지: 헤더 우측 ⏸/▶ 버튼. 일시정지 시 타이머 정지 + 타일 클릭 차단 |
| 2026-03-27 | 슬라이드 퍼즐 클리어 모달: 로비 버튼 제거 → 우상단 ✕ 닫기 버튼. 클리어 시간/이동횟수 표시 |
| 2026-03-27 | 슬라이드 퍼즐 이전 기록: localStorage(`slide-puzzle-best-{size}`)에 최고 시간/최소 이동 저장. 막힘 영역(하단 행 wall tiles) 위에 오버레이로 표시. 반투명 검정 배경 + 흰 글자 |
| 2026-03-27 | 슬라이드 퍼즐 순번 표시: 설정 패널(⚙ 설정)의 토글 스위치로 on/off. 타일 좌상단에 반투명 검정 배경 + 흰 글자로 표시 |
| 2026-03-27 | 슬라이드 퍼즐 설정 패널: ⚙ 설정 버튼(서브바 우측)에서 드롭다운으로 표시. 퍼즐판 배경색(다크/파스텔/라이트 탭, 각 12색)과 순번 표시 토글 포함. 배경색 변경 시 막힘 영역도 동일색으로 변경 |
| 2026-03-27 | 슬라이드 퍼즐 서브바 레이아웃: 1행(재시작/새게임 버튼), 2행(이미지 미리보기 왼쪽 / 게임시작 버튼 가운데 / 설정 버튼 오른쪽) |
| 2026-03-27 | `styles/single/slide-puzzle/subbar.ts`: `ColorSwatch` — `border-radius: 50%` → `border-radius: 6px`(사각형), `width: 28px` → `width: 38px`(크기 증가) |
| 2026-03-27 | `styles/single/slide-puzzle/board.ts`: `Tile` — `border` 및 `box-shadow` 제거. correct 강조 border/shadow, hover border 변경 모두 제거 |
| 2026-03-27 | 슬라이드 퍼즐 타일 비율 선택: `TileShape` 타입(`"fit"` \| `"square"`) 추가. `calcTileDims`에 `tileShape` 파라미터 추가 — `"square"` 시 `Math.min(tileW, tileH)`로 정사각형 강제. `SetupModal`에 "화면 맞춤 / 정사각형" 버튼 그룹 추가. `setupSnapshot`에 `tileShape` 포함(취소 시 복원). 크롭 박스 비율은 `aspectRatio`(tileW/tileH)에서 자동 반영 |
| 2026-03-27 | `CropModal.tsx`: 크롭 박스 4 코너 리사이즈 핸들 추가 — 드래그 시 `aspectRatio` 고정 유지, 이미지 영역 내로 클램핑. `ActionState` 유니온 타입(`move`/`resize`)으로 이동·리사이즈 단일 포인터 핸들러로 통합. `cropModal.ts`에 `CropHandle` styled component 추가 |
| 2026-02-28 | `SkulkingHelpModal.tsx`: 점수 계산 규칙에 "비드 실패 (비드 = 0): 라운드 수 × -10점" 항목 추가 |
| 2026-02-28 | `skulking/index.tsx`: 채팅창 게임 로그 추가 — `skulkingRoundStarted`(라운드 시작), `skulkingCardPlayed`(카드 정보), `skulkingTrickResult`(트릭 승자+카드 목록+보너스), `skulkingRoundResult`(라운드 결과 요약) 이벤트 수신 시 `addGameLog()`로 시스템 메시지 추가 |
| 2026-02-28 | `styles/chat/index.ts`: `ChatMessage` — `white-space: pre-wrap` 추가(게임 로그 줄바꿈), `text-align: left` 고정(기존 시스템 메시지 center 제거) |
| 2026-02-28 | `skulking/index.tsx`: `roomJoined` 수신 시 `skulkingTrickOrder` → `setTrickOrder`, `skulkingLeadPlayerId` → `setTrickLeadPlayerId` 복원 — 새로고침 후 턴 순서/선 플레이어 표시 정상화 |
| 2026-02-28 | `skulking/index.tsx`: `roomJoined` 수신 시 `roundScores` → `setRoundScores`, `roundBidTrickHistory` → `setRoundHistory` 복원 — 새로고침 후 통계 정보 유지 |
| 2026-02-28 | `skulking/index.tsx`: `roomJoined` 수신 시 `skulkingTimerTimeLeft` → `setInitialTimerTimeLeft` 복원, `SkulkingBoardCenter`/`SkulkingBidModal`에 `initialTimerTimeLeft` prop 전달 — 새로고침 후 타이머 동기화 |
| 2026-02-28 | `SkulkingBoardCenter.tsx`: `initialTimerTimeLeft` prop 추가 — `pendingInitialTime` ref로 새로고침 직후 1회만 서버 남은 시간으로 타이머 초기화, 이후 턴 변경 시 풀타임(20초) 리셋 |
| 2026-02-28 | `SkulkingBidModal.tsx`: `initialTimerTimeLeft` prop 추가 — `useState(initialTimerTimeLeft ?? BID_TIME_LIMIT)`로 초기값, 라운드 시작 시 `setTimeLeft(initialTimerTimeLeft ?? BID_TIME_LIMIT)` |
| 2026-02-28 | `styles/game/skulking/board.ts`: `OrderBadge`에 `$isTop` prop 추가 — 12시 위치 플레이어(`top: "0" && left: "50%"`) 뱃지를 오른쪽 하단(`bottom: -10px`)으로 이동 |
| 2026-02-28 | `styles/game/skulking/board.ts`: `OrderBadge`에 `$isRightSide` prop 추가 — 오른쪽 위치 플레이어(`right: "0"`) 뱃지를 왼쪽 상단(`left: -10px`)으로 이동 |
| 2026-02-28 | `SkulkingGameBoard.tsx`: `isTopCenter` 변수 추가(`pos.top === "0" && pos.left === "50%"`), `OrderBadge`에 `$isTop={isTopCenter}` / `$isRightSide={isRightSide}` prop 전달 |
| 2026-02-27 | `skulking/index.tsx`: `trickLeadPlayerId` 상태 분리 — `skulkingPlayPhase`/`skulkingTurnUpdate(isNewTrick:true)` 수신 시 갱신, 리드 플레이어 아이콘이 트릭 시작부터 항상 표시 |
| 2026-02-27 | `skulking/index.tsx`: `trickOrder` 상태 추가 — 서버 `skulkingPlayPhase`/`skulkingTurnUpdate(isNewTrick:true)` 이벤트에서 수신, `skulkingPlayers` 조립 시 `trickOrderIndex` 기반으로 `order` 재계산 (리드 플레이어=0번, 표시는 +1) |
| 2026-02-27 | `skulking/index.tsx`: `roundScores` 상태 추가 — `skulkingRoundResult`/`skulkingRoundStarted`에서 갱신, `skulkingPlayers`에 `roundScores` 포함 |
| 2026-02-27 | `SkulkingGameBoard.tsx`: `trickLeadPlayerId` prop 추가 (내부 `currentTrick[0]` 기반 계산 제거) |
| 2026-02-27 | `SkulkingGameBoard.tsx`: `OrderBadge`와 `LeadBadge` 통합 — 선 플레이어면 ⚓, 아닐 때는 순서 번호 표시 (하나의 뱃지로 통합) |
| 2026-02-27 | `styles/game/skulking/board.ts`: `OrderBadge` 위치 `left: -10px` → `right: -10px` (오른쪽 상단으로 이동), `$isLead` prop 추가 (선 플레이어일 때 파란색 배경), `LeadBadge` 스타일 제거 |
| 2026-02-27 | `SkulkingStatsModal.tsx`: 현재 라운드 셀 점수 항상 `-` 표시 (진행 중), 과거 라운드 셀에 `p.roundScores?.[i]` 기반 라운드별 획득 점수 표시 (양수 `+N` 초록, 음수 빨강) |
| 2026-02-27 | `SkulkingTestPanel.tsx`: DEV 전용 테스트 패널 신규 생성 — `position: fixed` 좌하단, 라운드(1~10) 선택 + 플레이어별 카드 조합 구성, `skulkingTestStart` 이벤트 전송 |
| 2026-02-27 | `skulking/index.tsx`: `SkulkingTestPanel` import 및 `modals` prop에 DEV 조건부 마운트 |
| 2026-02-27 | `skulking/index.tsx`: 트릭 승자 판정 버그 수정 (탈출카드 리드 + 숫자카드 상황) — 서버 `skulking.handler.ts` `determineTrickWinner`에서 `firstNonEscapeEntry` 로직으로 처음 나온 숫자 수트 카드 기준으로 승자 판정 |
| 2026-02-26 | `styles/game/index.ts`: 모바일 손패(MyHandArea) 가로 스크롤 — `max-width: 67vw`, `overflow-x: auto`, `flex-wrap: nowrap`, 반투명 배경 + 스크롤바 스타일 |
| 2026-02-26 | `styles/game/index.ts`: HandCard PC `margin-left: 0` (카드 간격 제거), 모바일 `margin-left: 4px` + `flex-shrink: 0` |
| 2026-02-26 | `styles/pages/Room.ts`: OtherPlayerCard 겹침 표시 — 가로 `margin-left: -12px`, 세로 `margin-top: -12px`, 모바일 `-9px` |
| 2026-02-26 | `styles/game/skulking/boardCenter.ts`: BoardCenterBadge `top: 40%`로 위로 이동 |
| 2026-02-26 | `SkulkingBoardCenter.tsx`: "트릭 플레이" PhaseBadge 제거 → 리드 카드(첫 번째 숫자 카드) 표시 — 같은 줄 "리드" 텍스트 + 22×30px 수트 색상 박스 |
| 2026-02-26 | `skulking/index.tsx`: 라운드 마지막 트릭 후 **3초 딜레이** → currentTrick/trickWinnerId 초기화 + 5초 카운트다운 시작 (결과 화면 카드 유지) |
| 2026-02-26 | `SkulkingGameBoard.tsx`: 내 차례 외에도 카드 선택/해제 가능, 카드 제출은 반드시 "카드 내기" 버튼으로만 가능 (재클릭 제출 제거) |
| 2026-02-26 | `styles/game/skulking/card.ts`: SkCard 선택 강조 강화 — `border: 3px solid #fff` + `box-shadow: 0 0 0 2px #f1c40f, 0 0 12px rgba(241,196,15,0.8)`, 모바일 `transform: none` (카드 잘림 방지) |
| 2026-02-26 | `styles/game/skulking/bidModal.ts`: BidButton `box-sizing: border-box` 추가, BidButtons max-width 계산식 수정 — PC `perRow*40+(perRow-1)*5`, 모바일 `perRow*34+(perRow-1)*5` (6라운드+ 3줄 버그 수정) |
| 2026-02-26 | `SkulkingStatsModal.tsx`: `roundHistory` prop 추가 — 과거 라운드 셀에 `(bid)/trick` + 점수 모두 표시 |
| 2026-02-26 | `skulking/index.tsx`: `roundHistory` 상태 추가 — `ls?.roundBidTrickHistory ?? []`로 초기화, `skulkingRoundResult` 수신 시 갱신 (새로고침 후 통계 유지) |
| 2026-02-26 | `types.ts` (Skulking): `RoundResult`에 `roundBidTrickHistory` 필드 추가 |
| 2026-02-25 | `SkulkingBidModal.tsx`: 20초 타이머 바 UI 추가 (5초 이하 빨간색), `submitted` prop으로 제출 후 대기 화면 전환, 타이머 만료 시 자동 0 제출 |
| 2026-02-25 | `SkulkingGameBoard.tsx`: 비드 모달 표시 조건 `phase === "bid"`로 변경 (동시 선언 방식), 손패 숨김 조건 제거 (항상 표시) |
| 2026-02-25 | `skulking/index.tsx`: `skulkingTurnUpdate`에서 `isNewTrick: true`일 때만 `currentTrick` 초기화 |
| 2026-02-25 | `styles/game/skulking/board.ts`: 내 플레이어(seatIndex 0) TrickCardSlot을 손패 위로 올림 (`bottom: calc(100% + 140px)`) |
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
│   │   ├── GangHelpModal.tsx       # 게임 규칙 설명 모달
│   │   ├── types.ts                # Gang 전용 타입 정의
│   │   ├── index.ts
│   │   └── game/
│   │       └── GangHandRankModal.tsx   # 포커 족보 설명 모달
│   ├── spice/                      # Spice 게임 전용 컴포넌트
│   │   ├── SpiceGameBoard.tsx      # 게임판 메인 UI (턴/도전/타이머 바)
│   │   ├── SpiceResultModal.tsx    # 점수 기반 결과 모달
│   │   ├── SpiceHelpModal.tsx      # 게임 규칙 설명 모달
│   │   └── game/
│   │       ├── SpiceCard.tsx
│   │       ├── SpiceChallengeOverlay.tsx
│   │       ├── SpiceDeclareModal.tsx
│   │       └── SpiceOtherPlayerFan.tsx
│   └── skulking/                   # Skulking 게임 전용 컴포넌트
│       ├── SkulkingGameBoard.tsx   # 게임판 메인 UI (트릭/비드/Tigress)
│       ├── SkulkingCard.tsx        # 카드 컴포넌트
│       ├── SkulkingHelpModal.tsx   # 게임 규칙 설명 모달 (isOpen prop 패턴)
│       ├── types.ts                # Skulking 전용 타입 (TrickEntry, RoundResult, GameOverResult)
│       └── game/
│           ├── SkulkingBidModal.tsx        # 비드 입력 모달 (20초 타이머)
│           ├── SkulkingBoardCenter.tsx     # 게임판 중앙 상태 표시
│           ├── SkulkingFirstDrawOverlay.tsx # 선뽑기 오버레이
│           ├── SkulkingResultModal.tsx     # 라운드/최종 결과 모달
│           ├── SkulkingStatsModal.tsx      # 라운드별 통계 모달
│           └── SkulkingTigressModal.tsx    # Tigress E/P 선언 모달
├── pages/
│   ├── Lobby.tsx                   # 로비 (방 목록, 생성, 입장)
│   └── Room/
│       ├── index.tsx               # Room 메인 (gameType별 라우팅)
│       ├── common/
│       │   ├── useRoomBase.ts      # Room 공통 로직 훅 (Gang/Spice/Skulking 공유)
│       │   └── RoomLayout.tsx      # Room 공통 UI (헤더, 채팅, 나가기)
│       ├── gang/index.tsx          # Gang Room (게임 전용 상태 관리)
│       ├── spice/index.tsx         # Spice Room (게임 전용 상태 관리)
│       └── skulking/index.tsx      # Skulking Room (게임 전용 상태 관리)
├── pages/Single/
│   └── SlidePuzzle/
│       └── index.tsx               # 슬라이드 퍼즐 (상태 관리 + 핸들러)
├── components/single/
│   └── slide-puzzle/
│       ├── types.ts                # GridSize(3~7), TileShape("fit"|"square"), BestRecord, DefaultImage
│       ├── utils.ts                # 보드 로직, 이미지 생성, localStorage, calcTileDims(tileShape 지원)
│       ├── constants.ts            # BG_THEMES (다크/파스텔/라이트 각 12색)
│       ├── SlidePuzzleBoard.tsx    # 보드 + 타일 렌더링 + 이전 기록 오버레이
│       ├── SlidePuzzleSubBar.tsx   # 서브바 + 설정 패널 (배경색·순번 표시)
│       └── modal/
│           ├── SetupModal.tsx      # 게임 설정 (크기 3~7 + 타일 비율 + 이미지 선택)
│           ├── ClearModal.tsx      # 클리어 결과 (✕ 닫기 + 다시하기)
│           └── CropModal.tsx       # 이미지 크롭 (SVG 마스크, 이동+비율고정 리사이즈)
├── styles/
│   ├── index.ts
│   ├── pages/
│   │   ├── index.ts
│   │   ├── Lobby.ts
│   │   └── Room.ts
│   ├── chat/index.ts
│   ├── game/
│   │   ├── index.ts                # 공통 게임 스타일 (GameBoard, PlayerCircle 등)
│   │   ├── gang/
│   │   │   └── handRankModal.ts
│   │   └── skulking/
│   │       ├── bidModal.ts
│   │       ├── board.ts
│   │       ├── boardCenter.ts
│   │       ├── card.ts
│   │       ├── helpModal.ts
│   │       ├── resultModal.ts
│   │       ├── statsModal.ts
│   │       └── tigressModal.ts
│   └── single/
│       └── slide-puzzle/
│           ├── index.ts            # re-export (하위 4개 파일)
│           ├── layout.ts           # PageWrapper, Header, PauseButton, Main 등
│           ├── board.ts            # Board, Tile, TileNumber, WallRecord 등
│           ├── subbar.ts           # SubBar, ActionButton, SettingsPanel, ColorSwatch 등
│           ├── modal.ts            # ModalOverlay, ModalBox, SetupModalBox 등
│           └── cropModal.ts        # CropModalBox, CropArea, CropBox, CropHandle, CropOverlaySvg 등
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

## 슬라이드 퍼즐 (싱글플레이어)

### 게임 흐름
1. 로비 → 방만들기 → 싱글 탭 → 슬라이드 퍼즐 선택 → `/single/slide-puzzle` 이동
2. **SetupModal**: 그리드 크기(3~7) + 타일 비율(화면 맞춤/정사각형) + 이미지 선택
3. 이미지 업로드 시 SetupModal 닫힘 → **CropModal** 표시 (비율 고정, 이동+리사이즈)
4. 크롭 확인 → SetupModal 다시 열림 → "시작" → 정렬된 미리보기 표시
5. 서브바 "게임 시작" 버튼 → 셔플 후 타이머 시작
6. 클리어 → ClearModal (✕ 닫기 / 다시하기)

### 보드 구조
- **N cols × (N+1) rows**: 상단 N×N = 이미지 타일, 하단 행 = 빈칸(0) 1개 + 막힘(-1) N-1개
- 타일 슬라이딩: 같은 행 또는 같은 열 내에서만 허용 (대각선 불가)
- CSS `transition: top 0.13s ease, left 0.13s ease`으로 이동 애니메이션
- 타일은 `position: absolute`로 배치, key=셀 값으로 DOM 재사용

### 타일 크기 계산 (`calcTileDims`)
```typescript
calcTileDims(containerW, containerH, size, tileShape) → { tileW, tileH }
```
- `"fit"`: tileW/tileH 독립 계산 → 직사각형 타일 (화면 꽉 채움)
- `"square"`: `Math.min(tileW, tileH)`로 통일 → 정사각형 타일
- Main 요소 ResizeObserver(`contentRect`) → mainSize → calcTileDims

### 이미지 처리
- 기본 이미지 4종: canvas API로 생성 (노을·밤하늘·오로라·바다)
- 커스텀 업로드: SetupModal에서 + 버튼 → CropModal
- 타일 이미지 슬라이싱: `backgroundSize: ${tileW*N}px ${tileH*N}px` + `backgroundPosition: -${origCol*tileW}px -${origRow*tileH}px`

### CropModal
- SVG mask 오버레이로 크롭 영역 외 어둡게 처리 (z-index: img=1, svg=2, cropbox=3, handle=4)
- **이동**: CropBox 본체 드래그
- **리사이즈**: 4 코너 CropHandle 드래그 — 반대 코너를 anchor로 고정, `Math.min(rawW, rawH * aspectRatio)`로 비율 유지, 이미지 영역 내 클램핑, 최소 크기 40px
- `ActionState` 유니온(`move`/`resize`)으로 단일 포인터 핸들러 처리
- `aspectRatio = tileW / tileH` (tileShape 반영됨)

### 설정
- **타일 비율**: SetupModal에서 선택 ("화면 맞춤" / "정사각형"), setupSnapshot에 포함되어 취소 시 복원
- **배경색**: 서브바 ⚙ 설정 패널 — 다크/파스텔/라이트 탭, 각 12색 swatch (38×28px, border-radius: 6px)
- **순번 표시**: 설정 패널 토글 — 타일 좌상단 반투명 검정 배경 + 흰 글자
- **일시정지**: 헤더 ⏸/▶ 버튼 — 타이머 정지 + 타일 클릭 차단

### 이전 기록
- `localStorage` 키: `slide-puzzle-best-{size}`
- 저장: `{ time: number, moves: number }` (최고 시간, 최소 이동)
- 표시: 하단 막힘 영역(wall tiles) 위에 절대위치 오버레이 — "최고 시간 / 최소 이동" 반투명 배경 + 흰 글자

---

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

**멀티플레이어 (WebSocketProvider 포함)**
- `/` - 로비
- `/room/gang/:roomName` - Gang 게임 룸
- `/room/spice/:roomName` - Spice 게임 룸
- `/room/skulking/:roomName` - Skulking 게임 룸

**싱글플레이어 (WebSocket 없음)**
- `/single/slide-puzzle` - 슬라이드 퍼즐

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

**클라이언트 → 서버:** `startGame`, `skulkingDrawFirstCard`, `skulkingBid`, `skulkingPlayCard`, `skulkingNextRound`, `skulkingTestStart`(DEV 전용, 라운드+손패 지정 테스트 시작)

**서버 → 클라이언트:** `skulkingFirstDrawStarted`, `skulkingFirstDrawResult`, `skulkingFirstDrawProgress`, `skulkingFirstDrawFinished`, `skulkingRoundStarted`, `skulkingBidPhase`, `skulkingBidUpdate`, `skulkingPlayPhase`(trickOrder 포함), `skulkingCardPlayed`, `myHandUpdate`(개인), `skulkingTurnUpdate`(isNewTrick, trickOrder), `skulkingTrickResult`, `skulkingRoundResult`(roundBidTrickHistory, roundScoreHistory 포함), `skulkingGameOver`

## Skulking 게임 UI 구조 (SkulkingGameBoard)

- 기존 `GameBoard`, `PlayerCircle`, `PlayerSeat`, `PlayerAvatar` 등 Gang/Spice와 동일한 스타일 컴포넌트 사용
- **게임판 정중앙** (BoardCenterBadge, `top: 40%`): 라운드 뱃지, 리드 카드("리드" + 수트 색상 박스), 타이머(20초 카운트다운 바) 표시
  - "트릭 플레이" 페이즈 뱃지 제거됨
  - 리드 카드: 첫 번째 숫자 카드 기준 (`currentTrick.find(e => !isSpecialCard(e.card.type))`)
- **플레이어 원형 배치**: GangGameBoard와 동일한 seatIndex 계산 방식
  - `seatIndex = (playerOrder - myOrder + totalPlayers) % totalPlayers`
  - `getSeatPosition(totalPlayers, seatIndex)` → `{top?, bottom?, left?, right?}`
  - `isVertical = pos.left === "0" || pos.right === "0"` (좌우 플레이어)
  - **OrderBadge** 위치: `$isTop`(12시 위치) → 오른쪽 하단, `$isRightSide`(오른쪽 위치) → 왼쪽 상단, 나머지 → 오른쪽 상단(기본)
  - **OrderBadge** (위치 가변): 선 플레이어면 ⚓ (파란색 배경), 아닐 때는 순서 번호 표시 (리드 플레이어=1번). 차례인 플레이어는 주황 강조 (`$isActive`). `trickLeadPlayerId` prop 기반 (내부 계산 없음)
  - **점수 뱃지**: 수평 플레이어는 좌측/위, 수직 플레이어는 아래 배치
  - **비드 뱃지**: 수평 플레이어는 우측/위, 수직 플레이어는 아래 배치, 형식 `(N) / 라운드`
  - 차례인 플레이어 아바타에 `outline: 2px solid #f39c12` 강조
- **트릭 카드** (TrickCardSlot): 각 플레이어 좌석 앞에 절대위치로 표시
  - 승자 카드: 👑 아이콘 + 금테두리 + glow
  - 리드 카드(첫 번째): 흰 테두리 + "1" 뱃지
- **손패** (MyHandArea + SkCard): 배경색 = 수트 색상
  - 카드 클릭 → 선택/해제 (내 차례 아닐 때도 선택 가능)
  - 제출은 반드시 "카드 내기" 확정 버튼으로만 가능 (재클릭 제출 없음)
  - 선택된 카드: 두꺼운 흰 테두리 + 노란 글로우로 강조, 모바일 transform 없음
  - Tigress 클릭 시 Escape/Pirate 선언 모달 표시
  - **Follow suit 제한**: 리드 수트(`leadEntry = currentTrick.find(e => !isSpecialCard(e.card.type))`) 손패에 있으면 리드 수트/특수 카드만 활성화, 나머지는 `opacity: 0.3` + `cursor: not-allowed`
- **비드 입력** (`SkulkingBidModal`): 풀스크린 오버레이, 20초 타이머 바(5초 이하 빨간색) + 내 손패 미리보기 + 0~round 버튼 + 확정 버튼
  - 확정 후: "비드 제출 완료 / N명 완료" 대기 화면으로 전환 (`submitted` prop)
  - 타이머 만료 시 자동으로 0 제출
  - 비드는 동시 선언 방식 (`phase === "bid"`이면 모달 항상 표시)
- **손패** (MyHandArea): 항상 표시. 카드를 내면 해당 카드만 손패에서 제거됨 (`myHandUpdate` 개인 수신)
- **TrickCardSlot** (내 플레이어): 손패와 겹치지 않도록 `bottom: calc(100% + 140px)`으로 위로 올려 표시
- **skulkingTurnUpdate `isNewTrick` 플래그**: `true`면 새 트릭 시작(currentTrick 초기화), `false`면 같은 트릭 내 차례 변경(currentTrick 유지)
- **선뽑기 오버레이**: 카드 뒷면 클릭 → 숫자 공개 → 전원 완료 시 결과 표시 + 2초 후 게임 시작
- **좌하단 통계 버튼** (DeckDisplay): 클릭 → StatsModal
  - 행=라운드(1~10), 열=플레이어(첫 글자+색), 셀=(비드)/트릭 + 점수, 합계 행
  - 현재 라운드: (비드)/트릭 표시, 점수는 `-` (진행 중)
  - 과거 라운드: (bid)/trick + 해당 라운드 획득 점수 (`p.roundScores?.[i]`, 양수 초록/음수 빨강)
  - `roundHistory` prop으로 과거 비드/트릭 복원, `roundScores` 상태로 라운드별 획득 점수 관리
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
  - 점수 계산: 비드 성공(>0): ×20점 / 성공(=0): 라운드×10점 / 실패(>0): |차이|×-10점 / 실패(=0): 라운드×-10점
- **카드 족보 탭**: 1위(해골왕)~7위(탈출) 세로 카드 아이콘 + 설명, 하단 보너스 점수 박스
- **카드 구성 탭**: 숫자 수트 4종 + 특수 카드 5종 테이블, 카드 색상 아이콘 인라인 표시

## 채팅 게임 로그 (skulking/index.tsx)

- `addGameLog(message)`: `setMessages((prev) => [...prev, { message, isSystem: true }])`로 시스템 메시지 추가
- `cardLabel(card, tigressDeclared)`: 카드를 `"♠ 7"` / `"💀 해골왕"` 형태 문자열로 변환 (`SKULKING_SUIT_LABELS`, `SKULKING_SUIT_NAMES` 활용)
- **로그 발생 이벤트**:
  - `skulkingRoundStarted` → `━━━ 🃏 라운드 N 시작 ━━━`
  - `skulkingCardPlayed` → `닉네임: ♠ 7` (카드 타입별 emoji + 숫자/이름)
  - `skulkingTrickResult` → `🏆 닉네임 트릭 획득 (+보너스) [트릭수/전체]\n  닉네임: 카드 ...`
  - `skulkingRoundResult` → `📊 라운드 N 결과\n  ✅/❌ 닉네임: 비드 N / 트릭 N (+/-점)`
- `ChatMessage` (`styles/chat/index.ts`): `white-space: pre-wrap` + `text-align: left` → 줄바꿈(`\n`) 렌더링 지원

## Skulking 재연결 복원 항목 (roomJoined 수신 시)

`skulking/index.tsx` `roomJoined` 케이스에서 처리:
- `skulkingTrickOrder` → `setTrickOrder` (턴 순서 복원)
- `skulkingLeadPlayerId` → `setTrickLeadPlayerId` (선 플레이어 표시 복원)
- `roundScores` → `setRoundScores` (통계 모달 라운드별 점수 복원)
- `roundBidTrickHistory` → `setRoundHistory` (통계 모달 비드/트릭 기록 복원)
- `skulkingTimerTimeLeft` → `setInitialTimerTimeLeft` → `SkulkingBoardCenter`/`SkulkingBidModal`의 `initialTimerTimeLeft` prop으로 전달

## Skulking 타이머 동기화 (재연결 시)

- 서버 `buildSkulkingState`에서 `skulkingTimerTimeLeft` 계산: `Date.now() - skulkingBidTimerStartedAt` (또는 Play) 기반 남은 초
- `SkulkingBoardCenter`: `pendingInitialTime` ref에 저장 → `currentPlayerId` 변경 effect에서 첫 실행 시 소비 후 null, 이후는 `TURN_TIME`(20초)으로 리셋
- `SkulkingBidModal`: `useState(initialTimerTimeLeft ?? BID_TIME_LIMIT)` 초기값, 의존성 없는 effect에서 한 번만 `setTimeLeft`

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
