// 테스트 전용 컴포넌트 - dev 환경에서만 사용, 언제든지 삭제 가능
import { useState } from "react";
import type { Card } from "../../types/game";

interface PlayerInfo {
  playerId: string;
  nickname: string;
}

interface SkulkingTestPanelProps {
  roomName: string;
  players: PlayerInfo[];
  onSend: (event: string, data: unknown) => void;
}

type SuitType = "sk-black" | "sk-yellow" | "sk-purple" | "sk-green";
type SpecialType = "sk-escape" | "sk-pirate" | "sk-mermaid" | "sk-skulking" | "sk-tigress";

const NUMBER_SUITS: SuitType[] = ["sk-black", "sk-yellow", "sk-purple", "sk-green"];
const SPECIAL_TYPES: SpecialType[] = ["sk-escape", "sk-pirate", "sk-mermaid", "sk-skulking", "sk-tigress"];

const SUIT_LABELS: Record<SuitType, string> = {
  "sk-black": "♠ 검정",
  "sk-yellow": "★ 노랑",
  "sk-purple": "♦ 보라",
  "sk-green": "♣ 초록",
};

const SPECIAL_LABELS: Record<SpecialType, string> = {
  "sk-escape": "E 탈출",
  "sk-pirate": "P 해적",
  "sk-mermaid": "M 인어",
  "sk-skulking": "☠ 해골왕",
  "sk-tigress": "T 타이그레스",
};

// 특수 카드의 최대 장수
const SPECIAL_MAX: Record<SpecialType, number> = {
  "sk-escape": 5,
  "sk-pirate": 5,
  "sk-mermaid": 2,
  "sk-skulking": 1,
  "sk-tigress": 1,
};

interface CardEntry {
  id: string;
  type: string;
  value: number;
}

function makeCard(type: string, value: number): Card {
  return { type, value, image: "", name: `${type}-${value}` };
}

export default function SkulkingTestPanel({ roomName, players, onSend }: SkulkingTestPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [round, setRound] = useState(3);
  const [handMap, setHandMap] = useState<Record<string, CardEntry[]>>({});

  // dev 환경에서만 렌더링 (훅은 항상 먼저 호출해야 함)
  if (!import.meta.env.DEV) return null;

  const getHand = (pid: string): CardEntry[] => handMap[pid] ?? [];

  const addCard = (pid: string, type: string, value: number) => {
    const entry: CardEntry = { id: `${type}-${value}-${Date.now()}`, type, value };
    setHandMap((prev) => ({ ...prev, [pid]: [...(prev[pid] ?? []), entry] }));
  };

  const removeCard = (pid: string, id: string) => {
    setHandMap((prev) => ({ ...prev, [pid]: (prev[pid] ?? []).filter((c) => c.id !== id) }));
  };

  const clearAll = () => setHandMap({});

  const handleStart = () => {
    const hands: Record<string, Card[]> = {};
    for (const p of players) {
      hands[p.playerId] = getHand(p.playerId).map((c) => makeCard(c.type, c.value));
    }
    console.log("[TestPanel] skulkingTestStart", { roomName, round, hands });
    onSend("skulkingTestStart", { roomName, round, hands });
    setIsOpen(false);
  };

  return (
    <div style={styles.wrapper}>
      <button onClick={() => setIsOpen((v) => !v)} style={styles.toggleBtn}>
        🧪 테스트
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span style={styles.title}>스컬킹 테스트 모드</span>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>라운드</label>
            <input
              type="number"
              min={1}
              max={10}
              value={round}
              onChange={(e) => setRound(Number(e.target.value))}
              style={styles.roundInput}
            />
            <span style={styles.hint}>(각 플레이어에게 {round}장 배분)</span>
          </div>

          <div style={styles.playerSection}>
            {players.map((p) => (
              <PlayerHandEditor
                key={p.playerId}
                player={p}
                hand={getHand(p.playerId)}
                round={round}
                onAdd={addCard}
                onRemove={removeCard}
              />
            ))}
          </div>

          <div style={styles.footer}>
            <button onClick={clearAll} style={styles.clearBtn}>전체 초기화</button>
            <button onClick={handleStart} style={styles.startBtn}>
              테스트 시작
            </button>
          </div>

          <div style={styles.devBadge}>DEV ONLY</div>
        </div>
      )}
    </div>
  );
}

interface PlayerHandEditorProps {
  player: PlayerInfo;
  hand: CardEntry[];
  round: number;
  onAdd: (pid: string, type: string, value: number) => void;
  onRemove: (pid: string, id: string) => void;
}

function PlayerHandEditor({ player, hand, round, onAdd, onRemove }: PlayerHandEditorProps) {
  const [selectedType, setSelectedType] = useState<string>("sk-black");
  const [selectedValue, setSelectedValue] = useState<number>(1);

  const isSpecial = SPECIAL_TYPES.includes(selectedType as SpecialType);

  const handleAdd = () => {
    if (hand.length >= round) return;
    onAdd(player.playerId, selectedType, isSpecial ? 0 : selectedValue);
  };

  return (
    <div style={styles.playerBox}>
      <div style={styles.playerName}>{player.nickname} <span style={styles.cardCount}>({hand.length}/{round}장)</span></div>

      <div style={styles.cardList}>
        {hand.map((c) => (
          <span key={c.id} style={styles.cardTag}>
            {getCardLabel(c.type, c.value)}
            <button onClick={() => onRemove(player.playerId, c.id)} style={styles.removeBtn}>×</button>
          </span>
        ))}
        {hand.length === 0 && <span style={styles.emptyHint}>카드 없음 (서버가 랜덤 배분)</span>}
      </div>

      {hand.length < round && (
        <div style={styles.addRow}>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setSelectedValue(1);
            }}
            style={styles.select}
          >
            <optgroup label="숫자 수트">
              {NUMBER_SUITS.map((s) => (
                <option key={s} value={s}>{SUIT_LABELS[s]}</option>
              ))}
            </optgroup>
            <optgroup label="특수 카드">
              {SPECIAL_TYPES.map((s) => (
                <option key={s} value={s}>{SPECIAL_LABELS[s]}</option>
              ))}
            </optgroup>
          </select>

          {!isSpecial && (
            <input
              type="number"
              min={1}
              max={13}
              value={selectedValue}
              onChange={(e) => setSelectedValue(Number(e.target.value))}
              style={styles.valueInput}
            />
          )}

          <button onClick={handleAdd} style={styles.addBtn}>추가</button>
        </div>
      )}
    </div>
  );
}

function getCardLabel(type: string, value: number): string {
  if (type in SUIT_LABELS) return `${SUIT_LABELS[type as SuitType]} ${value}`;
  if (type in SPECIAL_LABELS) return SPECIAL_LABELS[type as SpecialType];
  return `${type} ${value}`;
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    bottom: 16,
    left: 16,
    zIndex: 9999,
  },
  toggleBtn: {
    padding: "6px 12px",
    background: "#1a1a2e",
    color: "#e94560",
    border: "1px solid #e94560",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: "bold",
  },
  panel: {
    position: "absolute",
    bottom: 40,
    left: 0,
    width: 420,
    maxHeight: "80vh",
    overflowY: "auto",
    background: "#0f0f1a",
    border: "1px solid #333",
    borderRadius: 10,
    padding: 16,
    boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
    color: "#eee",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#e94560",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#aaa",
    cursor: "pointer",
    fontSize: 16,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#aaa",
    minWidth: 48,
  },
  roundInput: {
    width: 60,
    padding: "4px 8px",
    background: "#1a1a2e",
    border: "1px solid #444",
    borderRadius: 4,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  hint: {
    fontSize: 12,
    color: "#666",
  },
  playerSection: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  playerBox: {
    background: "#1a1a2e",
    border: "1px solid #2a2a4a",
    borderRadius: 8,
    padding: 10,
  },
  playerName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ccc",
    marginBottom: 6,
  },
  cardCount: {
    fontSize: 11,
    color: "#777",
    fontWeight: "normal",
  },
  cardList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
    minHeight: 24,
  },
  cardTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    background: "#2a2a4a",
    border: "1px solid #444",
    borderRadius: 4,
    padding: "2px 6px",
    fontSize: 12,
    color: "#ddd",
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#e94560",
    cursor: "pointer",
    fontSize: 13,
    padding: "0 2px",
    lineHeight: 1,
  },
  emptyHint: {
    fontSize: 11,
    color: "#555",
    fontStyle: "italic",
  },
  addRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  select: {
    flex: 1,
    padding: "4px 6px",
    background: "#0f0f1a",
    border: "1px solid #444",
    borderRadius: 4,
    color: "#eee",
    fontSize: 12,
  },
  valueInput: {
    width: 52,
    padding: "4px 6px",
    background: "#0f0f1a",
    border: "1px solid #444",
    borderRadius: 4,
    color: "#eee",
    fontSize: 12,
    textAlign: "center",
  },
  addBtn: {
    padding: "4px 10px",
    background: "#2a3a6a",
    border: "1px solid #4a5a9a",
    borderRadius: 4,
    color: "#eee",
    cursor: "pointer",
    fontSize: 12,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  clearBtn: {
    flex: 1,
    padding: "8px",
    background: "#2a1a1a",
    border: "1px solid #5a2a2a",
    borderRadius: 6,
    color: "#e08080",
    cursor: "pointer",
    fontSize: 13,
  },
  startBtn: {
    flex: 2,
    padding: "8px",
    background: "#e94560",
    border: "none",
    borderRadius: 6,
    color: "#fff",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: "bold",
  },
  devBadge: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 10,
    color: "#444",
    letterSpacing: 2,
  },
};
