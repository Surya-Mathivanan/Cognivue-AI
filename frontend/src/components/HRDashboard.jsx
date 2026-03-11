import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../api";

function HRDashboard() {
  const [hrUser, setHrUser] = useState(null);
  const [activeTab, setActiveTab] = useState("uid"); // 'uid' | 'role'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UID search state
  const [uidQuery, setUidQuery] = useState("");
  const [uidResult, setUidResult] = useState(null);

  // Role search state
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleResults, setRoleResults] = useState(null);

  // Detail view
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    // Fetch HR user info
    fetch(`${API_BASE_URL}/hr/me/`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (data.name) setHrUser(data); })
      .catch(() => {});

    // Fetch available roles
    fetch(`${API_BASE_URL}/hr/roles/`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setAvailableRoles(data.roles || []))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/hr/logout/`, { method: "POST", credentials: "include" });
    window.location.href = "/hr-login";
  };

  const handleUidSearch = async (e) => {
    e.preventDefault();
    if (!uidQuery.trim()) return;
    setError(""); setLoading(true); setUidResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/search/uid/?uid=${encodeURIComponent(uidQuery.trim())}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Search failed"); return; }
      setUidResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSearch = async () => {
    if (!selectedRole) return;
    setError(""); setLoading(true); setRoleResults(null);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/search/role/?role=${encodeURIComponent(selectedRole)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Search failed"); return; }
      setRoleResults(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSession = async (sessionId) => {
    setDetailLoading(true); setSelectedSession(sessionId); setSessionDetail(null);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/session/${sessionId}/`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setSessionDetail(data);
    } catch {}
    finally { setDetailLoading(false); }
  };

  const scoreColor = (score) => {
    if (!score) return "#64748b";
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  // Detail Modal
  if (sessionDetail) {
    const { session, candidate } = sessionDetail;
    return (
      <div className="hr-dashboard">
        <div className="hr-detail-page">
          <button className="hr-back-btn" onClick={() => setSessionDetail(null)} style={{ marginBottom: "20px" }}>
            ← Back to Results
          </button>

          <div className="hr-detail-header">
            <div className="hr-candidate-avatar-lg">
              {candidate?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2>{candidate?.name}</h2>
              <div className="hr-uid-badge">{candidate?.uid}</div>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>{candidate?.email}</p>
            </div>
            <div className="hr-score-big" style={{ color: scoreColor(session?.overall_score) }}>
              <span className="score-number">{session?.overall_score ?? "—"}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>

          <div className="hr-detail-grid">
            <div className="hr-detail-card">
              <h4>Session Info</h4>
              <div className="hr-info-rows">
                <div className="hr-info-row"><span>Role:</span><strong>{session.role || "General"}</strong></div>
                <div className="hr-info-row"><span>Mode:</span><strong className="capitalize">{session.mode}</strong></div>
                <div className="hr-info-row"><span>Difficulty:</span><strong className="capitalize">{session.difficulty}</strong></div>
                <div className="hr-info-row"><span>Duration:</span><strong>{session.duration_minutes} min</strong></div>
              </div>
            </div>

            <div className="hr-detail-card">
              <h4>Candidate Contact Info</h4>
              <div className="hr-info-rows">
                <div className="hr-info-row"><span>Phone:</span><strong>{candidate?.phone_number || "—"}</strong></div>
                <div className="hr-info-row"><span>Location:</span><strong>{candidate?.location || "—"}</strong></div>
                <div className="hr-info-row"><span>College:</span><strong>{candidate?.college_name || "—"}</strong></div>
                <div className="hr-info-row"><span>Degree:</span><strong>{candidate?.degree || "—"}</strong></div>
                <div className="hr-info-row"><span>Branch:</span><strong>{candidate?.branch || "—"}</strong></div>
                <div className="hr-info-row"><span>Skills:</span><strong>{candidate?.skills || "—"}</strong></div>
              </div>
            </div>

            {session.feedback?.category_scores && (
              <div className="hr-detail-card">
                <h4>Category Scores</h4>
                {Object.entries(session.feedback.category_scores).map(([key, val]) => (
                  <div key={key} className="hr-score-bar-row">
                    <span>{key.replace(/_/g, " ")}</span>
                    <div className="hr-score-bar-track">
                      <div className="hr-score-bar-fill" style={{ width: `${val}%`, background: scoreColor(val) }} />
                    </div>
                    <span className="hr-score-bar-val" style={{ color: scoreColor(val) }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {session.feedback?.detailed_feedback && (
            <div className="hr-detail-card" style={{ marginTop: "16px" }}>
              <h4>AI Feedback Summary</h4>
              <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>{session.feedback.detailed_feedback}</p>
            </div>
          )}

          <div className="hr-detail-card" style={{ marginTop: "16px" }}>
            <h4>Interview Q&A</h4>
            {session.questions?.map((q, i) => (
              <div key={i} className="hr-qa-item">
                <div className="hr-qa-category">{q.category}</div>
                <div className="hr-qa-question"><strong>Q{i + 1}:</strong> {q.text}</div>
                <div className="hr-qa-answer">
                  <span>A:</span> {session.answers?.[i] || <em style={{ color: "#475569" }}>No answer provided</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard">
      {/* Header */}
      <header className="hr-header">
        <div className="hr-header-left">
          <div className="hr-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#hrGrad)" strokeWidth="2">
              <defs>
                <linearGradient id="hrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <div>
              <span className="hr-brand-name">Cognivue AI</span>
              <span className="hr-brand-sub">HR Portal</span>
            </div>
          </div>
        </div>
        <div className="hr-header-right">
          {hrUser && (
            <div className="hr-user-chip">
              <div className="hr-user-avatar">{hrUser.name?.charAt(0)?.toUpperCase()}</div>
              <div>
                <div className="hr-user-name">{hrUser.name}</div>
                <div className="hr-user-company">{hrUser.company || hrUser.email}</div>
              </div>
            </div>
          )}
          <button className="hr-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="hr-content">
        <div className="hr-page-title">
          <h1>Candidate Search</h1>
          <p>Find candidates who have completed interviews in the Cognivue AI platform</p>
        </div>

        {/* Search Tabs */}
        <div className="hr-search-tabs">
          <button
            className={`hr-search-tab ${activeTab === "uid" ? "active" : ""}`}
            onClick={() => { setActiveTab("uid"); setError(""); setUidResult(null); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Search by UID
          </button>
          <button
            className={`hr-search-tab ${activeTab === "role" ? "active" : ""}`}
            onClick={() => { setActiveTab("role"); setError(""); setRoleResults(null); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search by Role
          </button>
        </div>

        {error && <div className="hr-error-msg" style={{ marginBottom: "16px" }}>⚠️ {error}</div>}

        {/* UID Search Panel */}
        {activeTab === "uid" && (
          <div className="hr-search-panel">
            <form onSubmit={handleUidSearch} className="hr-search-form">
              <div className="hr-search-input-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hr-search-icon">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  className="hr-search-input"
                  value={uidQuery}
                  onChange={e => setUidQuery(e.target.value.toUpperCase())}
                  placeholder="Enter candidate UID (e.g. 22BAD12345)"
                  maxLength={10}
                />
              </div>
              <button type="submit" className="hr-search-btn" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {uidResult && (
              <div className="hr-uid-result">
                <div className="hr-candidate-profile-card">
                  <div className="hr-candidate-avatar-lg">
                    {uidResult.candidate?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="hr-candidate-profile-info">
                    <h3>{uidResult.candidate?.name}</h3>
                    <div className="hr-uid-badge">{uidResult.candidate?.uid}</div>
                    <p><strong>Email:</strong> {uidResult.candidate?.email}</p>
                    <p><strong>Phone:</strong> {uidResult.candidate?.phone_number || "—"}</p>
                    <p><strong>Location:</strong> {uidResult.candidate?.location || "—"}</p>
                    <p><strong>College:</strong> {uidResult.candidate?.college_name || "—"}</p>
                    <p><strong>Skills:</strong> {uidResult.candidate?.skills || "—"}</p>
                    <p style={{ color: "#10b981", marginTop: "8px" }}>{uidResult.candidate?.total_sessions} completed interview(s)</p>
                  </div>
                </div>

                <h4 style={{ margin: "20px 0 12px", color: "#94a3b8" }}>Interview Sessions</h4>
                <div className="hr-results-grid">
                  {uidResult.sessions?.map((s) => (
                    <div key={s.id} className="hr-result-card" onClick={() => handleViewSession(s.id)}>
                      <div className="hr-result-card-top">
                        <div className="hr-result-role">{s.role || "General"}</div>
                        <div className="hr-result-score" style={{ color: scoreColor(s.overall_score) }}>
                          {s.overall_score ?? "—"}<span style={{ fontSize: "12px", color: "#64748b" }}>/100</span>
                        </div>
                      </div>
                      <div className="hr-result-meta">
                        <span className={`hr-difficulty-badge ${s.difficulty}`}>{s.difficulty}</span>
                        <span>{s.duration_minutes} min</span>
                      </div>
                      <div className="hr-result-date">
                        {new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="hr-result-view-btn">View Full Details →</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Role Search Panel */}
        {activeTab === "role" && (
          <div className="hr-search-panel">
            <div className="hr-role-search-form">
              <select
                className="hr-role-select"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
              >
                <option value="">— Select a Role —</option>
                {availableRoles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button className="hr-search-btn" onClick={handleRoleSearch} disabled={loading || !selectedRole}>
                {loading ? "Searching..." : "Find Candidates"}
              </button>
            </div>

            {availableRoles.length === 0 && (
              <div className="hr-empty-state">
                <p>No roles available yet. Candidates haven't completed role-based interviews.</p>
              </div>
            )}

            {roleResults && (
              <div>
                <div className="hr-results-summary">
                  <span>Found <strong>{roleResults.count}</strong> candidate(s) for <strong>{roleResults.role}</strong></span>
                </div>

                {roleResults.count === 0 ? (
                  <div className="hr-empty-state">
                    <p>No candidates found for this role yet.</p>
                  </div>
                ) : (
                  <div className="hr-results-grid">
                    {roleResults.results?.map((item) => (
                      <div key={item.session_id} className="hr-result-card" onClick={() => handleViewSession(item.session_id)}>
                        <div className="hr-result-card-top">
                          <div className="hr-candidate-mini">
                            <div className="hr-candidate-mini-avatar">
                              {item.candidate?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="hr-result-name">{item.candidate?.name}</div>
                              <div className="hr-uid-badge-sm">{item.candidate?.uid}</div>
                            </div>
                          </div>
                          <div className="hr-result-score" style={{ color: scoreColor(item.overall_score) }}>
                            {item.overall_score ?? "—"}<span style={{ fontSize: "12px", color: "#64748b" }}>/100</span>
                          </div>
                        </div>
                        <div className="hr-result-meta">
                          <span className="hr-result-role-tag">{item.role}</span>
                          <span className={`hr-difficulty-badge ${item.difficulty}`}>{item.difficulty}</span>
                        </div>
                        <div className="hr-result-date">
                          {new Date(item.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="hr-result-view-btn">View Full Details →</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {detailLoading && (
          <div className="hr-loading-overlay">
            <div className="hr-loading-spinner" />
            <p>Loading session details...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HRDashboard;
