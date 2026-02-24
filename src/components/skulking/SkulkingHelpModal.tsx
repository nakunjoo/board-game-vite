import React from "react";
import {
  SKULKING_SUIT_COLORS,
  SKULKING_SUIT_LABELS,
} from "../../utils/games/skulking";
import {
  HelpOverlay,
  HelpModal,
  HelpTitle,
  TabRow,
  Tab,
  Section,
  SectionTitle,
  HelpText,
  CardTable,
  CardTh,
  CardTd,
  RankList,
  RankRow,
  RankNum,
  MiniCard,
  RankInfo,
  RankName,
  RankDesc,
  HelpDivider,
  BonusBox,
  BonusTitle,
  BonusRow,
  BonusCard,
  BonusText,
  ScoreTag,
  HelpCloseButton,
} from "../../styles/game/skulking/helpModal";

// ── 족보 데이터 ──────────────────────────────────────

const RANK_DATA = [
  {
    rank: 1,
    type: "sk-skulking",
    name: "☠ 해골왕 (Skull King)",
    desc: "인어 제외 모든 카드를 이김. 해골왕으로 해적을 잡으면 보너스 +30점.",
    isTop: true,
  },
  {
    rank: 2,
    type: "sk-pirate",
    name: "⚔️ 해적 (Pirate)",
    desc: "여러 해적이 있으면 먼저 낸 사람이 이김.",
    isTop: true,
  },
  {
    rank: 3,
    type: "sk-mermaid",
    name: "💎 인어 (Mermaid)",
    desc: "해골왕이 있는 경우 해골왕을 이김. 인어로 해골왕을 잡으면 보너스 +50점",
    isTop: false,
  },
  {
    rank: 4,
    type: "sk-tigress",
    name: "🃏 타이그레스 (Tigress)",
    desc: "낼 때 해적 또는 탈출로 선언. 선언에 따라 해적·탈출과 동일하게 처리.",
    isTop: false,
  },
  {
    rank: 5,
    type: "sk-black",
    name: "♠ 검정 수트 (Trump)",
    desc: "해적·인어·해골왕 제외 모든 카드를 이김.",
    isTop: false,
  },
  {
    rank: 6,
    type: "sk-yellow",
    name: "★/♦/♣ 리드 수트 (숫자 카드)",
    desc: "선플레이어가 낸 첫 번째 수트가 리드. 리드 이외의 수트는 리드에게 짐.",
    isTop: false,
  },
  {
    rank: 7,
    type: "sk-escape",
    name: "🏳️ 탈출 (Escape)",
    desc: "항상 짐. 절대 트릭을 따지 않음. 모두 탈출이면 먼저 낸 사람이 이김.",
    isTop: false,
  },
];

// ── 컴포넌트 ─────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkulkingHelpModal({ isOpen, onClose }: Props) {
  const [tab, setTab] = React.useState<"rules" | "rank" | "cards">("rules");

  if (!isOpen) return null;

  return (
    <HelpOverlay onClick={onClose}>
      <HelpModal onClick={(e) => e.stopPropagation()}>
        <HelpTitle>☠ 스컬킹 게임 규칙</HelpTitle>

        <TabRow>
          <Tab $active={tab === "rules"} onClick={() => setTab("rules")}>
            게임 규칙
          </Tab>
          <Tab $active={tab === "rank"} onClick={() => setTab("rank")}>
            카드 족보
          </Tab>
          <Tab $active={tab === "cards"} onClick={() => setTab("cards")}>
            카드 구성
          </Tab>
        </TabRow>

        {/* ── 게임 규칙 탭 ── */}
        {tab === "rules" && (
          <>
            <Section>
              <SectionTitle>게임 목표</SectionTitle>
              <HelpText>
                10라운드에 걸쳐 자신의 비드(예측 트릭 수)를 정확히 맞춰 가장
                높은 점수를 획득하세요.
              </HelpText>
            </Section>

            <Section>
              <SectionTitle>진행 방식</SectionTitle>
              <HelpText>
                • 라운드 r: 플레이어마다 r장의 카드를 받습니다 (1라운드 1장 ~
                10라운드 10장)
              </HelpText>
              <HelpText>
                • 비드 단계: 순서대로 이번 라운드에서 딸 트릭 수를 선언합니다 (0
                ~ r)
              </HelpText>
              <HelpText>
                • 트릭 플레이: r번의 트릭을 진행합니다. 리드 플레이어가 먼저
                카드를 냅니다
              </HelpText>
              <HelpText>
                • 리드 수트를 따라야 합니다. 손패에 리드 수트가 없으면 아무
                카드나 가능
              </HelpText>
              <HelpText>
                • 특수카드(탈출·해적·인어·해골왕·타이그레스)는 리드 수트에
                상관없이 언제든 낼 수 있음
              </HelpText>
            </Section>

            <Section>
              <SectionTitle>리드 수트 결정</SectionTitle>
              <HelpText>
                • 특수카드가 먼저 나왔더라도 트릭에서 처음 나온{" "}
                <strong style={{ color: "#ecf0f1" }}>숫자 수트 카드</strong>가
                리드 수트가 됩니다
              </HelpText>
              <HelpText>
                • 예: 탈출 → 노랑 7 → 보라 3 → 보라 11 순으로 나오면, 리드는{" "}
                <strong style={{ color: "#f39c12" }}>노랑</strong>
              </HelpText>
              <HelpText>
                • 모든 플레이어가 특수카드만 냈으면 리드 수트 없음 (순위 규칙
                적용)
              </HelpText>
            </Section>

            <Section>
              <SectionTitle>점수 계산</SectionTitle>
              <HelpText>
                • 비드 성공 (비드 &gt; 0):{" "}
                <strong style={{ color: "#f1c40f" }}>비드 × 20점</strong>
              </HelpText>
              <HelpText>
                • 비드 성공 (비드 = 0):{" "}
                <strong style={{ color: "#f1c40f" }}>라운드 수 × 10점</strong>
              </HelpText>
              <HelpText>
                • 비드 실패:{" "}
                <strong style={{ color: "#e74c3c" }}>
                  |비드 - 실제| × -10점
                </strong>
              </HelpText>
              <HelpText>
                • 보너스: ☠ 해골왕으로 ⚔️ 해적 잡으면{" "}
                <strong style={{ color: "#f1c40f" }}>+30점/마리</strong>
              </HelpText>
              <HelpText>
                • 보너스: 💎 인어가 ☠ 해골왕을 잡으면{" "}
                <strong style={{ color: "#f1c40f" }}>+50점</strong>
              </HelpText>
            </Section>
          </>
        )}

        {/* ── 카드 족보 탭 ── */}
        {tab === "rank" && (
          <>
            <RankList>
              {RANK_DATA.map((item, idx) => (
                <React.Fragment key={item.rank}>
                  <RankRow $isTop={item.isTop}>
                    <RankNum $isTop={item.isTop}>{item.rank}</RankNum>
                    <MiniCard $type={item.type}>
                      {SKULKING_SUIT_LABELS[item.type] ?? "?"}
                    </MiniCard>
                    <RankInfo>
                      <RankName>{item.name}</RankName>
                      <RankDesc>{item.desc}</RankDesc>
                    </RankInfo>
                  </RankRow>
                  {idx < RANK_DATA.length - 1 && <HelpDivider>▼</HelpDivider>}
                </React.Fragment>
              ))}
            </RankList>

            <BonusBox>
              <BonusTitle>🎁 보너스 점수</BonusTitle>
              <BonusRow>
                <BonusCard $type="sk-skulking">
                  {SKULKING_SUIT_LABELS["sk-skulking"]}
                </BonusCard>
                <span style={{ fontSize: "0.75rem", color: "#7f8c8d" }}>
                  vs
                </span>
                <BonusCard $type="sk-pirate">
                  {SKULKING_SUIT_LABELS["sk-pirate"]}
                </BonusCard>
                <BonusText>
                  해골왕이 해적을 잡을 때마다 <ScoreTag>+30점</ScoreTag>
                </BonusText>
              </BonusRow>
              <BonusRow>
                <BonusCard $type="sk-mermaid">
                  {SKULKING_SUIT_LABELS["sk-mermaid"]}
                </BonusCard>
                <span style={{ fontSize: "0.75rem", color: "#7f8c8d" }}>
                  vs
                </span>
                <BonusCard $type="sk-skulking">
                  {SKULKING_SUIT_LABELS["sk-skulking"]}
                </BonusCard>
                <BonusText>
                  인어가 해골왕을 잡을 때 <ScoreTag>+50점</ScoreTag>
                </BonusText>
              </BonusRow>
            </BonusBox>
          </>
        )}

        {/* ── 카드 구성 탭 ── */}
        {tab === "cards" && (
          <>
            <Section>
              <SectionTitle>숫자 수트 (총 52장)</SectionTitle>
              <CardTable>
                <thead>
                  <tr>
                    <CardTh>카드</CardTh>
                    <CardTh>장수</CardTh>
                    <CardTh>숫자</CardTh>
                    <CardTh>특징</CardTh>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <CardTd>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "26px",
                            borderRadius: "2px",
                            background: SKULKING_SUIT_COLORS["sk-black"],
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                          }}
                        >
                          {SKULKING_SUIT_LABELS["sk-black"]}
                        </span>
                        검정 (Jolly Roger)
                      </span>
                    </CardTd>
                    <CardTd>13</CardTd>
                    <CardTd>1~13</CardTd>
                    <CardTd>Trump 수트 — 다른 수트에 항상 우선</CardTd>
                  </tr>
                  <tr>
                    <CardTd>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "26px",
                            borderRadius: "2px",
                            background: SKULKING_SUIT_COLORS["sk-yellow"],
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                          }}
                        >
                          {SKULKING_SUIT_LABELS["sk-yellow"]}
                        </span>
                        노랑 (Treasure Chest)
                      </span>
                    </CardTd>
                    <CardTd>13</CardTd>
                    <CardTd>1~13</CardTd>
                    <CardTd>숫자 수트</CardTd>
                  </tr>
                  <tr>
                    <CardTd>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "26px",
                            borderRadius: "2px",
                            background: SKULKING_SUIT_COLORS["sk-purple"],
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                          }}
                        >
                          {SKULKING_SUIT_LABELS["sk-purple"]}
                        </span>
                        보라 (Jolly Roger)
                      </span>
                    </CardTd>
                    <CardTd>13</CardTd>
                    <CardTd>1~13</CardTd>
                    <CardTd>숫자 수트</CardTd>
                  </tr>
                  <tr>
                    <CardTd>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "18px",
                            height: "26px",
                            borderRadius: "2px",
                            background: SKULKING_SUIT_COLORS["sk-green"],
                            border: "1px solid rgba(255,255,255,0.2)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                          }}
                        >
                          {SKULKING_SUIT_LABELS["sk-green"]}
                        </span>
                        초록 (Mermaid's Crown)
                      </span>
                    </CardTd>
                    <CardTd>13</CardTd>
                    <CardTd>1~13</CardTd>
                    <CardTd>숫자 수트</CardTd>
                  </tr>
                </tbody>
              </CardTable>
            </Section>

            <Section>
              <SectionTitle>특수 카드 (총 14장)</SectionTitle>
              <CardTable>
                <thead>
                  <tr>
                    <CardTh>카드</CardTh>
                    <CardTh>장수</CardTh>
                    <CardTh>설명</CardTh>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      type: "sk-escape",
                      name: "탈출 (Escape)",
                      count: 5,
                      desc: "항상 짐. 트릭을 따지 않음",
                    },
                    {
                      type: "sk-pirate",
                      name: "해적 (Pirate)",
                      count: 5,
                      desc: "강력한 특수 카드. 숫자 수트 모두 이김",
                    },
                    {
                      type: "sk-mermaid",
                      name: "인어 (Mermaid)",
                      count: 2,
                      desc: "해골왕을 이길 수 있는 유일한 카드",
                    },
                    {
                      type: "sk-skulking",
                      name: "해골왕 (Skull King)",
                      count: 1,
                      desc: "모든 카드 중 가장 강함",
                    },
                    {
                      type: "sk-tigress",
                      name: "타이그레스 (Tigress)",
                      count: 1,
                      desc: "낼 때 해적 또는 탈출로 선언",
                    },
                  ].map((item) => (
                    <tr key={item.type}>
                      <CardTd>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              width: "18px",
                              height: "26px",
                              borderRadius: "2px",
                              background: SKULKING_SUIT_COLORS[item.type],
                              border: "1px solid rgba(255,255,255,0.2)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                            }}
                          >
                            {SKULKING_SUIT_LABELS[item.type]}
                          </span>
                          {item.name}
                        </span>
                      </CardTd>
                      <CardTd>{item.count}</CardTd>
                      <CardTd>{item.desc}</CardTd>
                    </tr>
                  ))}
                </tbody>
              </CardTable>
            </Section>

            <Section>
              <SectionTitle
                style={{
                  color: "#7f8c8d",
                  fontSize: "0.78rem",
                  fontWeight: "normal",
                  border: "none",
                  paddingBottom: 0,
                  marginBottom: 0,
                }}
              >
                총 66장 (숫자 수트 52장 + 특수 카드 14장)
              </SectionTitle>
            </Section>
          </>
        )}

        <HelpCloseButton onClick={onClose}>닫기</HelpCloseButton>
      </HelpModal>
    </HelpOverlay>
  );
}
