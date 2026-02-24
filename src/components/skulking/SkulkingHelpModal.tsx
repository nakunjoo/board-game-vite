import React from "react";
import styled from "styled-components";
import { SKULKING_SUIT_COLORS, SKULKING_SUIT_LABELS } from "../../utils/games/skulking";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #1a1a2e;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  padding: 20px 20px 16px;
  max-width: 560px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  color: #e74c3c;
  margin: 0 0 14px;
  text-align: center;
`;

// ── 탭 ──────────────────────────────────────────────

const TabRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 7px 0;
  border-radius: 6px;
  border: 2px solid ${({ $active }) => ($active ? "#e74c3c" : "#2c3e50")};
  background: ${({ $active }) => ($active ? "rgba(231,76,60,0.15)" : "transparent")};
  color: ${({ $active }) => ($active ? "#e74c3c" : "#7f8c8d")};
  font-size: 0.85rem;
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.15s;
`;

// ── 규칙 탭 스타일 ───────────────────────────────────

const Section = styled.div`
  margin-bottom: 14px;
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  color: #f39c12;
  margin: 0 0 7px;
  border-bottom: 1px solid #2c3e50;
  padding-bottom: 4px;
`;

const Text = styled.p`
  font-size: 0.82rem;
  line-height: 1.6;
  margin: 0 0 4px;
  color: #bdc3c7;
`;

const CardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  margin-top: 4px;
`;

const Th = styled.th`
  background: #2c3e50;
  padding: 5px 7px;
  text-align: left;
  color: #ecf0f1;
`;

const Td = styled.td`
  padding: 4px 7px;
  border-bottom: 1px solid #2c3e50;
  color: #bdc3c7;
`;

// ── 족보 탭 스타일 ───────────────────────────────────

const RankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RankRow = styled.div<{ $isTop?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 7px;
  background: ${({ $isTop }) => ($isTop ? "rgba(231,76,60,0.12)" : "rgba(255,255,255,0.04)")};
  border: 1px solid ${({ $isTop }) => ($isTop ? "rgba(231,76,60,0.35)" : "rgba(255,255,255,0.07)")};
`;

const RankNum = styled.div<{ $isTop?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${({ $isTop }) => ($isTop ? "#e74c3c" : "#2c3e50")};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MiniCard = styled.div<{ $type: string }>`
  width: 36px;
  height: 52px;
  border-radius: 4px;
  background: ${({ $type }) => SKULKING_SUIT_COLORS[$type] ?? "#2c3e50"};
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1;
`;

const RankInfo = styled.div`
  flex: 1;
`;

const RankName = styled.div`
  font-size: 0.85rem;
  font-weight: bold;
  color: #ecf0f1;
  margin-bottom: 2px;
`;

const RankDesc = styled.div`
  font-size: 0.75rem;
  color: #7f8c8d;
  line-height: 1.4;
`;

const Divider = styled.div`
  text-align: center;
  color: #2c3e50;
  font-size: 0.75rem;
  margin: 1px 0;
  user-select: none;
`;

const BonusBox = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(243,156,18,0.08);
  border: 1px solid rgba(243,156,18,0.25);
  border-radius: 7px;
`;

const BonusTitle = styled.div`
  font-size: 0.82rem;
  font-weight: bold;
  color: #f39c12;
  margin-bottom: 6px;
`;

const BonusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const BonusCard = styled.div<{ $type: string }>`
  width: 28px;
  height: 40px;
  border-radius: 3px;
  background: ${({ $type }) => SKULKING_SUIT_COLORS[$type] ?? "#2c3e50"};
  border: 1.5px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

const BonusText = styled.div`
  font-size: 0.78rem;
  color: #bdc3c7;
  line-height: 1.4;
`;

const ScoreTag = styled.span`
  color: #f1c40f;
  font-weight: bold;
`;

// ── 닫기 버튼 ────────────────────────────────────────

const CloseButton = styled.button`
  display: block;
  margin: 14px auto 0;
  padding: 7px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  &:hover { background: #c0392b; }
`;

// ── 족보 데이터 ──────────────────────────────────────

const RANK_DATA = [
  {
    rank: 1,
    type: "sk-skulking",
    name: "☠ 해골왕 (Skull King)",
    desc: "모든 카드를 이김. 단, 인어(Mermaid)가 있으면 인어에게 짐.",
    isTop: true,
  },
  {
    rank: 2,
    type: "sk-mermaid",
    name: "💎 인어 (Mermaid)",
    desc: "해골왕이 있을 때: 해골왕을 이김. 해골왕이 없을 때: 해적에게 짐.",
    isTop: true,
  },
  {
    rank: 3,
    type: "sk-pirate",
    name: "⚔️ 해적 (Pirate)",
    desc: "탈출·숫자 수트 카드를 모두 이김. 여러 해적이 있으면 먼저 낸 사람이 이김.",
    isTop: false,
  },
  {
    rank: 4,
    type: "sk-tigress",
    name: "⚔️/🏳️ 타이그레스 (Tigress)",
    desc: "낼 때 해적(Pirate) 또는 탈출(Escape)로 선언. 선언에 따라 동일하게 처리.",
    isTop: false,
  },
  {
    rank: 5,
    type: "sk-black",
    name: "♠ 검정 수트 (Trump)",
    desc: "해적·인어·해골왕 제외 모든 카드를 이김. 검정끼리는 숫자가 높을수록 강함.",
    isTop: false,
  },
  {
    rank: 6,
    type: "sk-yellow",
    name: "★/♦/♣ 리드 수트 (숫자 카드)",
    desc: "선플레이어가 낸 첫 번째 숫자 수트가 리드. 리드 수트끼리는 숫자가 높을수록 강함.",
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
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>☠ 스컬킹 게임 규칙</Title>

        <TabRow>
          <Tab $active={tab === "rules"} onClick={() => setTab("rules")}>게임 규칙</Tab>
          <Tab $active={tab === "rank"} onClick={() => setTab("rank")}>카드 족보</Tab>
          <Tab $active={tab === "cards"} onClick={() => setTab("cards")}>카드 구성</Tab>
        </TabRow>

        {/* ── 게임 규칙 탭 ── */}
        {tab === "rules" && (
          <>
            <Section>
              <SectionTitle>게임 목표</SectionTitle>
              <Text>10라운드에 걸쳐 자신의 비드(예측 트릭 수)를 정확히 맞춰 가장 높은 점수를 획득하세요.</Text>
            </Section>

            <Section>
              <SectionTitle>진행 방식</SectionTitle>
              <Text>• 라운드 r: 플레이어마다 r장의 카드를 받습니다 (1라운드 1장 ~ 10라운드 10장)</Text>
              <Text>• 비드 단계: 순서대로 이번 라운드에서 딸 트릭 수를 선언합니다 (0 ~ r)</Text>
              <Text>• 트릭 플레이: r번의 트릭을 진행합니다. 리드 플레이어가 먼저 카드를 냅니다</Text>
              <Text>• 리드 수트를 따라야 합니다. 손패에 리드 수트가 없으면 아무 카드나 가능</Text>
              <Text>• 특수카드(탈출·해적·인어·해골왕·타이그레스)는 리드 수트에 상관없이 언제든 낼 수 있음</Text>
            </Section>

            <Section>
              <SectionTitle>리드 수트 결정</SectionTitle>
              <Text>• 특수카드가 먼저 나왔더라도 트릭에서 처음 나온 <strong style={{color:"#ecf0f1"}}>숫자 수트 카드</strong>가 리드 수트가 됩니다</Text>
              <Text>• 예: 탈출 → 노랑 7 → 보라 3 → 보라 11 순으로 나오면, 리드는 <strong style={{color:"#f39c12"}}>노랑</strong></Text>
              <Text>• 모든 플레이어가 특수카드만 냈으면 리드 수트 없음 (순위 규칙 적용)</Text>
            </Section>

            <Section>
              <SectionTitle>점수 계산</SectionTitle>
              <Text>• 비드 성공 (비드 &gt; 0): <strong style={{color:"#f1c40f"}}>비드 × 20점</strong></Text>
              <Text>• 비드 성공 (비드 = 0): <strong style={{color:"#f1c40f"}}>라운드 수 × 10점</strong></Text>
              <Text>• 비드 실패: <strong style={{color:"#e74c3c"}}>|비드 - 실제| × -10점</strong></Text>
              <Text>• 보너스: ☠ 해골왕으로 ⚔️ 해적 잡으면 <strong style={{color:"#f1c40f"}}>+30점/마리</strong></Text>
              <Text>• 보너스: 💎 인어가 ☠ 해골왕을 잡으면 <strong style={{color:"#f1c40f"}}>+20점</strong></Text>
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
                  {idx < RANK_DATA.length - 1 && <Divider>▼</Divider>}
                </React.Fragment>
              ))}
            </RankList>

            <BonusBox>
              <BonusTitle>🎁 보너스 점수</BonusTitle>
              <BonusRow>
                <BonusCard $type="sk-skulking">
                  {SKULKING_SUIT_LABELS["sk-skulking"]}
                </BonusCard>
                <span style={{fontSize:"0.75rem",color:"#7f8c8d"}}>vs</span>
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
                <span style={{fontSize:"0.75rem",color:"#7f8c8d"}}>vs</span>
                <BonusCard $type="sk-skulking">
                  {SKULKING_SUIT_LABELS["sk-skulking"]}
                </BonusCard>
                <BonusText>
                  인어가 해골왕을 잡을 때 <ScoreTag>+20점</ScoreTag>
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
                    <Th>카드</Th>
                    <Th>장수</Th>
                    <Th>숫자</Th>
                    <Th>특징</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>
                      <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                        <span style={{width:"18px",height:"26px",borderRadius:"2px",background:SKULKING_SUIT_COLORS["sk-black"],border:"1px solid rgba(255,255,255,0.2)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem"}}>
                          {SKULKING_SUIT_LABELS["sk-black"]}
                        </span>
                        검정 (Jolly Roger)
                      </span>
                    </Td>
                    <Td>13</Td><Td>1~13</Td><Td>Trump 수트 — 다른 수트에 항상 우선</Td>
                  </tr>
                  <tr>
                    <Td>
                      <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                        <span style={{width:"18px",height:"26px",borderRadius:"2px",background:SKULKING_SUIT_COLORS["sk-yellow"],border:"1px solid rgba(255,255,255,0.2)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem"}}>
                          {SKULKING_SUIT_LABELS["sk-yellow"]}
                        </span>
                        노랑 (Treasure Chest)
                      </span>
                    </Td>
                    <Td>13</Td><Td>1~13</Td><Td>숫자 수트</Td>
                  </tr>
                  <tr>
                    <Td>
                      <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                        <span style={{width:"18px",height:"26px",borderRadius:"2px",background:SKULKING_SUIT_COLORS["sk-purple"],border:"1px solid rgba(255,255,255,0.2)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem"}}>
                          {SKULKING_SUIT_LABELS["sk-purple"]}
                        </span>
                        보라 (Jolly Roger)
                      </span>
                    </Td>
                    <Td>13</Td><Td>1~13</Td><Td>숫자 수트</Td>
                  </tr>
                  <tr>
                    <Td>
                      <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                        <span style={{width:"18px",height:"26px",borderRadius:"2px",background:SKULKING_SUIT_COLORS["sk-green"],border:"1px solid rgba(255,255,255,0.2)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem"}}>
                          {SKULKING_SUIT_LABELS["sk-green"]}
                        </span>
                        초록 (Mermaid's Crown)
                      </span>
                    </Td>
                    <Td>13</Td><Td>1~13</Td><Td>숫자 수트</Td>
                  </tr>
                </tbody>
              </CardTable>
            </Section>

            <Section>
              <SectionTitle>특수 카드 (총 14장)</SectionTitle>
              <CardTable>
                <thead>
                  <tr>
                    <Th>카드</Th>
                    <Th>장수</Th>
                    <Th>설명</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type:"sk-escape", name:"탈출 (Escape)", count:5, desc:"항상 짐. 트릭을 따지 않음" },
                    { type:"sk-pirate", name:"해적 (Pirate)", count:5, desc:"강력한 특수 카드. 숫자 수트 모두 이김" },
                    { type:"sk-mermaid", name:"인어 (Mermaid)", count:2, desc:"해골왕을 이길 수 있는 유일한 카드" },
                    { type:"sk-skulking", name:"해골왕 (Skull King)", count:1, desc:"모든 카드 중 가장 강함" },
                    { type:"sk-tigress", name:"타이그레스 (Tigress)", count:1, desc:"낼 때 해적 또는 탈출로 선언" },
                  ].map((item) => (
                    <tr key={item.type}>
                      <Td>
                        <span style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                          <span style={{width:"18px",height:"26px",borderRadius:"2px",background:SKULKING_SUIT_COLORS[item.type],border:"1px solid rgba(255,255,255,0.2)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem"}}>
                            {SKULKING_SUIT_LABELS[item.type]}
                          </span>
                          {item.name}
                        </span>
                      </Td>
                      <Td>{item.count}</Td>
                      <Td>{item.desc}</Td>
                    </tr>
                  ))}
                </tbody>
              </CardTable>
            </Section>

            <Section>
              <SectionTitle style={{color:"#7f8c8d", fontSize:"0.78rem", fontWeight:"normal", border:"none", paddingBottom:0, marginBottom:0}}>
                총 66장 (숫자 수트 52장 + 특수 카드 14장)
              </SectionTitle>
            </Section>
          </>
        )}

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </Modal>
    </Overlay>
  );
}
