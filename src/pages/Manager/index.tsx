import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL as string;

// ────────────────────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────────────────────

interface AdminUser {
  userId: string;
  nickname: string;
  grantedBy: string | null;
  createdAt: string;
}

interface SearchResult {
  userId: string;
  nickname: string;
}

interface GameType {
  id: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
}

interface Report {
  id: string;
  reporterNickname: string;
  reportedNickname: string;
  reportedId: string;
  reason: string;
  description: string | null;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: string;
}

type Tab = "admin" | "gameType" | "report";

const REASON_LABELS: Record<string, string> = {
  cheating: "치팅",
  abusive: "욕설/비매너",
  afk: "자리비움",
  other: "기타",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "미처리",
  reviewed: "처리됨",
  dismissed: "기각",
};

// ────────────────────────────────────────────────────────────────
// 컴포넌트
// ────────────────────────────────────────────────────────────────

export default function Manager() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("admin");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const headers = {
    Authorization: `Bearer ${session?.access_token}`,
    "Content-Type": "application/json",
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };
  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  // ─── 관리자 탭 상태 ────────────────────────────────────────────
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchNickname, setSearchNickname] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null | "notfound">(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchAdmins = async () => {
    const res = await fetch(`${API_URL}/api/manager/admins`, { headers });
    if (res.ok) setAdmins(await res.json());
  };

  const handleSearch = async () => {
    if (!searchNickname.trim()) return;
    setSearchLoading(true);
    setSearchResult(null);
    const res = await fetch(
      `${API_URL}/api/manager/users/search?nickname=${encodeURIComponent(searchNickname.trim())}`,
      { headers },
    );
    setSearchLoading(false);
    if (!res.ok) { setSearchResult("notfound"); return; }
    const data = await res.json();
    setSearchResult(data ?? "notfound");
  };

  const handleAddAdmin = async (userId: string, nickname: string) => {
    const res = await fetch(`${API_URL}/api/manager/admins/${userId}`, { method: "POST", headers });
    if (res.ok) {
      showSuccess(`${nickname} 님을 관리자로 추가했습니다`);
      setSearchResult(null);
      setSearchNickname("");
      fetchAdmins();
    } else showError("추가에 실패했습니다");
  };

  const handleRemoveAdmin = async (userId: string, nickname: string) => {
    if (!confirm(`${nickname} 님의 관리자 권한을 제거하시겠습니까?`)) return;
    const res = await fetch(`${API_URL}/api/manager/admins/${userId}`, { method: "DELETE", headers });
    if (res.ok) {
      showSuccess(`${nickname} 님의 관리자 권한을 제거했습니다`);
      fetchAdmins();
    } else showError("제거에 실패했습니다");
  };

  // ─── 게임타입 탭 상태 ──────────────────────────────────────────
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [newTypeId, setNewTypeId] = useState("");
  const [newTypeLabel, setNewTypeLabel] = useState("");
  const [newTypeSortOrder, setNewTypeSortOrder] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("");

  const fetchGameTypes = async () => {
    const res = await fetch(`${API_URL}/api/manager/game-types`, { headers });
    if (res.ok) setGameTypes(await res.json());
  };

  const startEditGameType = (gt: GameType) => {
    setEditingTypeId(gt.id);
    setEditLabel(gt.label);
    setEditSortOrder(String(gt.sortOrder));
  };

  const handleSaveGameType = async (id: string) => {
    if (!editLabel.trim()) { showError("이름을 입력해주세요"); return; }
    const res = await fetch(`${API_URL}/api/manager/game-types/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ label: editLabel.trim(), sortOrder: Number(editSortOrder) || 0 }),
    });
    if (res.ok) {
      showSuccess("수정됐습니다");
      setEditingTypeId(null);
      fetchGameTypes();
    } else showError("수정에 실패했습니다");
  };

  const handleToggleGameType = async (gt: GameType) => {
    const res = await fetch(`${API_URL}/api/manager/game-types/${gt.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ isActive: !gt.isActive }),
    });
    if (res.ok) {
      showSuccess(`${gt.label} ${!gt.isActive ? "활성화" : "비활성화"}됨`);
      fetchGameTypes();
    } else showError("변경에 실패했습니다");
  };

  const handleAddGameType = async () => {
    if (!newTypeId.trim() || !newTypeLabel.trim()) {
      showError("ID와 이름을 모두 입력해주세요");
      return;
    }
    const res = await fetch(`${API_URL}/api/manager/game-types`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: newTypeId.trim(),
        label: newTypeLabel.trim(),
        sortOrder: Number(newTypeSortOrder) || gameTypes.length,
      }),
    });
    if (res.ok) {
      showSuccess(`${newTypeLabel} 게임 타입이 추가되었습니다`);
      setNewTypeId("");
      setNewTypeLabel("");
      setNewTypeSortOrder("");
      fetchGameTypes();
    } else showError("추가에 실패했습니다");
  };

  const handleDeleteGameType = async (gt: GameType) => {
    if (!confirm(`"${gt.label}" 게임 타입을 삭제하시겠습니까?`)) return;
    const res = await fetch(`${API_URL}/api/manager/game-types/${gt.id}`, { method: "DELETE", headers });
    if (res.ok) {
      showSuccess(`${gt.label} 삭제됨`);
      fetchGameTypes();
    } else showError("삭제에 실패했습니다");
  };

  // ─── 신고 탭 상태 ──────────────────────────────────────────────
  const [reports, setReports] = useState<Report[]>([]);
  const [reportFilter, setReportFilter] = useState<"" | "pending" | "reviewed" | "dismissed">("");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const fetchReports = async () => {
    const query = reportFilter ? `?status=${reportFilter}` : "";
    const res = await fetch(`${API_URL}/api/manager/reports${query}`, { headers });
    if (res.ok) setReports(await res.json());
  };

  const handleReportStatus = async (reportId: string, status: "reviewed" | "dismissed") => {
    const res = await fetch(`${API_URL}/api/manager/reports/${reportId}/status`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showSuccess("신고 상태가 변경됐습니다");
      fetchReports();
    } else showError("변경에 실패했습니다");
  };

  const handleBan = async (userId: string, reason: string) => {
    if (!reason.trim()) { showError("제재 사유를 입력해주세요"); return; }
    const res = await fetch(`${API_URL}/api/manager/users/${userId}/ban`, {
      method: "POST",
      headers,
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      showSuccess("계정이 제재됐습니다");
      setBanReason("");
      fetchReports();
    } else showError("제재에 실패했습니다");
  };

  const handleUnban = async (userId: string) => {
    const res = await fetch(`${API_URL}/api/manager/users/${userId}/unban`, { method: "POST", headers });
    if (res.ok) {
      showSuccess("제재가 해제됐습니다");
      fetchReports();
    } else showError("해제에 실패했습니다");
  };

  // ─── 탭별 데이터 로딩 ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "admin") fetchAdmins();
    if (activeTab === "gameType") fetchGameTypes();
    if (activeTab === "report") fetchReports();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "report") fetchReports();
  }, [reportFilter]);

  // ────────────────────────────────────────────────────────────────
  // 공통 스타일
  // ────────────────────────────────────────────────────────────────
  const s = {
    page: { maxWidth: 720, margin: "0 auto", padding: "32px 16px", color: "#fff" } as const,
    section: { background: "#1e1e2e", borderRadius: 10, padding: 20, marginBottom: 24 } as const,
    sectionTitle: { margin: "0 0 16px", fontSize: "1rem", color: "#aaa" } as const,
    input: { flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #333", background: "#12121e", color: "#fff" } as const,
    row: { display: "flex", gap: 8 } as const,
    btn: (color: string) => ({
      padding: "8px 16px", borderRadius: 6, background: color, color: "#fff", border: "none", cursor: "pointer",
    } as const),
    outlineBtn: (color: string) => ({
      padding: "4px 12px", borderRadius: 6, background: "transparent", color, border: `1px solid ${color}`, cursor: "pointer", fontSize: "0.85rem",
    } as const),
    item: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#12121e", borderRadius: 8, padding: "10px 14px" } as const,
    tag: (active: boolean) => ({
      display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: "bold",
      background: active ? "rgba(46,204,113,0.15)" : "rgba(150,150,150,0.1)",
      color: active ? "#2ecc71" : "#777",
      border: `1px solid ${active ? "rgba(46,204,113,0.4)" : "rgba(150,150,150,0.3)"}`,
    } as const),
  };

  // ────────────────────────────────────────────────────────────────
  // 렌더
  // ────────────────────────────────────────────────────────────────

  const TAB_LIST: { key: Tab; label: string }[] = [
    { key: "admin", label: "👤 관리자" },
    { key: "gameType", label: "🎮 게임타입" },
    { key: "report", label: "🚨 신고" },
  ];

  return (
    <div style={s.page}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/")} style={s.outlineBtn("#aaa")}>
          ← 로비
        </button>
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>🛠 관리자</h1>
      </div>

      {/* 토스트 */}
      {error && (
        <div style={{ background: "#5c1a1a", border: "1px solid #e74c3c", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#ff8080" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#1a3a2a", border: "1px solid #2ecc71", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#80ffb0" }}>
          {success}
        </div>
      )}

      {/* 탭 */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {TAB_LIST.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem",
              background: activeTab === t.key ? "#4a4aff" : "#2a2a3e",
              color: activeTab === t.key ? "#fff" : "#888",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 탭: 관리자 ── */}
      {activeTab === "admin" && (
        <>
          <section style={s.section}>
            <h2 style={s.sectionTitle}>관리자 추가</h2>
            <div style={s.row}>
              <input
                value={searchNickname}
                onChange={(e) => setSearchNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="닉네임으로 검색"
                style={s.input}
              />
              <button onClick={handleSearch} disabled={searchLoading} style={s.btn("#4a4aff")}>
                검색
              </button>
            </div>
            {searchResult === "notfound" && (
              <p style={{ color: "#888", marginTop: 10, fontSize: "0.9rem" }}>해당 닉네임의 유저를 찾을 수 없습니다</p>
            )}
            {searchResult && searchResult !== "notfound" && (
              <div style={{ ...s.item, marginTop: 12 }}>
                <span style={{ fontWeight: "bold" }}>{searchResult.nickname}</span>
                <button onClick={() => handleAddAdmin(searchResult.userId, searchResult.nickname)} style={s.btn("#2ecc71")}>
                  관리자 추가
                </button>
              </div>
            )}
          </section>

          <section style={s.section}>
            <h2 style={s.sectionTitle}>관리자 목록 <span style={{ color: "#646cff" }}>({admins.length}명)</span></h2>
            {admins.length === 0 ? (
              <p style={{ color: "#555", textAlign: "center", padding: "20px 0" }}>관리자가 없습니다</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {admins.map((admin) => (
                  <li key={admin.userId} style={s.item}>
                    <div>
                      <span style={{ fontWeight: "bold" }}>{admin.nickname}</span>
                      <span style={{ color: "#555", fontSize: "0.8rem", marginLeft: 8 }}>
                        {new Date(admin.createdAt).toLocaleDateString("ko-KR")} 추가
                      </span>
                    </div>
                    <button onClick={() => handleRemoveAdmin(admin.userId, admin.nickname)} style={s.outlineBtn("#e74c3c")}>
                      제거
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* ── 탭: 게임타입 ── */}
      {activeTab === "gameType" && (
        <>
          <section style={s.section}>
            <h2 style={s.sectionTitle}>게임 타입 추가</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                value={newTypeId}
                onChange={(e) => setNewTypeId(e.target.value)}
                placeholder="ID (예: newgame)"
                style={{ ...s.input, flex: "1 1 120px" }}
              />
              <input
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="이름 (예: 새게임)"
                style={{ ...s.input, flex: "1 1 120px" }}
              />
              <input
                value={newTypeSortOrder}
                onChange={(e) => setNewTypeSortOrder(e.target.value)}
                placeholder="순서"
                type="number"
                style={{ ...s.input, flex: "0 1 72px" }}
              />
              <button onClick={handleAddGameType} style={s.btn("#4a4aff")}>추가</button>
            </div>
          </section>

          <section style={s.section}>
            <h2 style={s.sectionTitle}>게임 타입 목록</h2>
            {gameTypes.length === 0 ? (
              <p style={{ color: "#555", textAlign: "center", padding: "20px 0" }}>등록된 게임 타입이 없습니다</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {gameTypes.map((gt) => (
                  <li key={gt.id} style={{ background: "#12121e", borderRadius: 10, overflow: "hidden", border: "1px solid #2a2a3e" }}>
                    {/* 일반 행 */}
                    {editingTypeId !== gt.id ? (
                      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {/* 상단: 토글 + 이름 + ID */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            onClick={() => handleToggleGameType(gt)}
                            title={gt.isActive ? "비활성화" : "활성화"}
                            style={{
                              width: 44, height: 24, borderRadius: 12, cursor: "pointer", flexShrink: 0,
                              background: gt.isActive ? "#2ecc71" : "#333",
                              position: "relative", transition: "background 0.2s",
                            }}
                          >
                            <div style={{
                              position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff",
                              left: gt.isActive ? 23 : 3, transition: "left 0.2s",
                            }} />
                          </div>
                          <span style={{ fontWeight: "bold", fontSize: "1.05rem" }}>{gt.label}</span>
                          <span style={{ color: "#555", fontSize: "0.8rem", background: "#1a1a2e", padding: "2px 8px", borderRadius: 4 }}>{gt.id}</span>
                          <span style={{ color: "#555", fontSize: "0.8rem", marginLeft: "auto" }}>순서 {gt.sortOrder}</span>
                        </div>
                        {/* 하단: 버튼 */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button onClick={() => startEditGameType(gt)} style={s.outlineBtn("#646cff")}>
                            수정
                          </button>
                          <button onClick={() => handleDeleteGameType(gt)} style={s.outlineBtn("#e74c3c")}>
                            삭제
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 편집 행 */
                      <div style={{ padding: "18px 20px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", borderTop: "2px solid #646cff" }}>
                        <span style={{ color: "#555", fontSize: "0.85rem", minWidth: 60 }}>({gt.id})</span>
                        <input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="이름"
                          style={{ ...s.input, flex: "1 1 140px" }}
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleSaveGameType(gt.id)}
                        />
                        <input
                          value={editSortOrder}
                          onChange={(e) => setEditSortOrder(e.target.value)}
                          placeholder="순서"
                          type="number"
                          style={{ ...s.input, flex: "0 1 80px" }}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveGameType(gt.id)}
                        />
                        <button onClick={() => handleSaveGameType(gt.id)} style={s.btn("#2ecc71")}>저장</button>
                        <button onClick={() => setEditingTypeId(null)} style={s.outlineBtn("#888")}>취소</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* ── 탭: 신고 ── */}
      {activeTab === "report" && (
        <>
          {/* 필터 */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["", "pending", "reviewed", "dismissed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setReportFilter(f)}
                style={{
                  padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: "0.85rem",
                  background: reportFilter === f ? "#4a4aff" : "#2a2a3e",
                  color: reportFilter === f ? "#fff" : "#888",
                }}
              >
                {f === "" ? "전체" : STATUS_LABELS[f]}
              </button>
            ))}
          </div>

          <section style={s.section}>
            <h2 style={s.sectionTitle}>신고 목록 <span style={{ color: "#646cff" }}>({reports.length}건)</span></h2>
            {reports.length === 0 ? (
              <p style={{ color: "#555", textAlign: "center", padding: "20px 0" }}>신고가 없습니다</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {reports.map((r) => (
                  <li key={r.id} style={{ background: "#12121e", borderRadius: 8, overflow: "hidden" }}>
                    {/* 요약 행 */}
                    <div
                      style={{ ...s.item, cursor: "pointer" }}
                      onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "bold", color: "#ff8080" }}>{r.reportedNickname}</span>
                        <span style={{ color: "#555", fontSize: "0.8rem" }}>← {r.reporterNickname}</span>
                        <span style={{ ...s.tag(false), color: "#e67e22", border: "1px solid rgba(230,126,34,0.4)" }}>
                          {REASON_LABELS[r.reason] ?? r.reason}
                        </span>
                        <span style={s.tag(r.status === "reviewed")}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </div>
                      <span style={{ color: "#555", fontSize: "0.8rem" }}>
                        {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>

                    {/* 상세 패널 */}
                    {expandedReport === r.id && (
                      <div style={{ padding: "12px 14px", borderTop: "1px solid #222", display: "flex", flexDirection: "column", gap: 10 }}>
                        {r.description && (
                          <p style={{ margin: 0, color: "#bbb", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{r.description}</p>
                        )}

                        {/* 신고 상태 변경 */}
                        <div style={s.row}>
                          {r.status !== "reviewed" && (
                            <button onClick={() => handleReportStatus(r.id, "reviewed")} style={s.btn("#2ecc71")}>
                              처리됨
                            </button>
                          )}
                          {r.status !== "dismissed" && (
                            <button onClick={() => handleReportStatus(r.id, "dismissed")} style={s.outlineBtn("#888")}>
                              기각
                            </button>
                          )}
                        </div>

                        {/* 계정 제재 */}
                        <div style={{ borderTop: "1px solid #2a2a3e", paddingTop: 10 }}>
                          <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#aaa" }}>
                            <strong style={{ color: "#ff8080" }}>{r.reportedNickname}</strong> 계정 제재
                          </p>
                          <div style={s.row}>
                            <input
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                              placeholder="제재 사유 입력"
                              style={s.input}
                            />
                            <button onClick={() => handleBan(r.reportedId, banReason)} style={s.btn("#e74c3c")}>
                              정지
                            </button>
                            <button onClick={() => handleUnban(r.reportedId)} style={s.outlineBtn("#aaa")}>
                              해제
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
