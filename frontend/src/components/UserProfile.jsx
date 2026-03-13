import React, { useState, useEffect } from "react";
import { getApiUrl, updateUserProfile, getAuthHeaders } from "../api";

function UserProfile({ user, setCurrentView }) {
  const [analytics, setAnalytics] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Local profile state to avoid needing App.jsx refresh immediately
  const [profileData, setProfileData] = useState({
    college_name: user?.college_name || "",
    degree: user?.degree || "",
    branch: user?.branch || "",
    address: user?.address || "",
    phone_number: user?.phone_number || "",
    skills: user?.skills || "",
    location: user?.location || "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        college_name: user.college_name || "",
        degree: user.degree || "",
        branch: user.branch || "",
        address: user.address || "",
        phone_number: user.phone_number || "",
        skills: user.skills || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(profileData);
      setIsEditing(false);
      // Ideally trigger a global user refresh, but for now local state acts as truth
    } catch (err) {
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetch(getApiUrl("/api/analytics/"), { credentials: "include", headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setAnalytics(data); })
      .catch(() => {});
  }, []);

  const copyUID = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const scoreColor = (score) => {
    if (!score) return "#64748b";
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="profile-page">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-hero-bg">
          <div className="profile-orb profile-orb-1" />
          <div className="profile-orb profile-orb-2" />
        </div>

        <div className="profile-avatar-ring">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-placeholder">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <div className="profile-avatar-status" />
        </div>

        <div className="profile-hero-info">
          <h1 className="profile-name">{user?.username || "User"}</h1>
          <p className="profile-email">{user?.email}</p>

          {/* UID Badge */}
          <div className="profile-uid-section">
            <span className="profile-uid-label">Candidate UID</span>
            <div className="profile-uid-card">
              <span className="profile-uid-value">{user?.uid || "Generating..."}</span>
              <button
                className="profile-uid-copy-btn"
                onClick={copyUID}
                title="Copy UID"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="profile-uid-hint">
              Share your UID with HR recruiters to let them view your interview performance
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="profile-stats-section">
        <h2 className="profile-section-title">Performance Overview</h2>

        {analytics ? (
          <>
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <div className="profile-stat-icon">🎯</div>
                <div className="profile-stat-value">{analytics.total_sessions}</div>
                <div className="profile-stat-label">Total Interviews</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">⭐</div>
                <div className="profile-stat-value" style={{ color: scoreColor(analytics.best_score) }}>
                  {analytics.best_score ?? "—"}
                </div>
                <div className="profile-stat-label">Best Score</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">📊</div>
                <div className="profile-stat-value" style={{ color: scoreColor(analytics.average_score) }}>
                  {analytics.average_score ?? "—"}
                </div>
                <div className="profile-stat-label">Avg Score</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">📄</div>
                <div className="profile-stat-value">{analytics.resume_count}</div>
                <div className="profile-stat-label">Resume Interviews</div>
              </div>
              <div className="profile-stat-card">
                <div className="profile-stat-icon">🏷️</div>
                <div className="profile-stat-value">{analytics.role_count}</div>
                <div className="profile-stat-label">Role Interviews</div>
              </div>
            </div>

            {/* Difficulty breakdown */}
            {analytics.by_difficulty && (
              <div className="profile-difficulty-breakdown">
                <h3>Performance by Difficulty</h3>
                <div className="profile-difficulty-grid">
                  {Object.entries(analytics.by_difficulty).map(([level, data]) => (
                    <div key={level} className={`profile-difficulty-card difficulty-${level}`}>
                      <div className="profile-difficulty-label capitalize">{level}</div>
                      <div className="profile-difficulty-count">{data.count} sessions</div>
                      {data.average_score !== null && (
                        <div className="profile-difficulty-score" style={{ color: scoreColor(data.average_score) }}>
                          Avg: {data.average_score}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="profile-empty">
            <div className="profile-empty-icon">📋</div>
            <p>No interviews completed yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentView("mode-selection")}
            >
              Start Your First Interview →
            </button>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="profile-account-section">
        <h2 className="profile-section-title">Account Info</h2>
        <div className="profile-info-card">
          <div className="profile-info-row">
            <span className="profile-info-label">Name</span>
            <span className="profile-info-value">{user?.username || "—"}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Candidate ID</span>
            <span className="profile-info-value" style={{ fontFamily: "monospace", fontWeight: 700, color: "#8b5cf6" }}>
              {user?.uid || "—"}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Login Method</span>
            <div className="profile-info-value google-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google OAuth
            </div>
          </div>
        </div>
      </div>

      {/* Professional & Contact Info */}
      <div className="profile-account-section" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="profile-section-title" style={{ margin: 0 }}>Contact & Professional Info</h2>
          {!isEditing ? (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              Edit Details
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="profile-info-card">
          <div className="profile-info-row">
            <span className="profile-info-label">Phone Number</span>
            {isEditing ? (
              <input type="text" name="phone_number" value={profileData.phone_number} onChange={handleInputChange} className="hr-input" placeholder="+1 234 567 890" />
            ) : (
              <span className="profile-info-value">{profileData.phone_number || "—"}</span>
            )}
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Location</span>
            {isEditing ? (
              <input type="text" name="location" value={profileData.location} onChange={handleInputChange} className="hr-input" placeholder="City, Country" />
            ) : (
              <span className="profile-info-value">{profileData.location || "—"}</span>
            )}
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Address</span>
            {isEditing ? (
              <textarea name="address" value={profileData.address} onChange={handleInputChange} className="hr-input" rows="2" placeholder="Full Address" />
            ) : (
              <span className="profile-info-value">{profileData.address || "—"}</span>
            )}
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">College / University</span>
            {isEditing ? (
              <input type="text" name="college_name" value={profileData.college_name} onChange={handleInputChange} className="hr-input" placeholder="University Name" />
            ) : (
              <span className="profile-info-value">{profileData.college_name || "—"}</span>
            )}
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Degree</span>
            {isEditing ? (
              <input type="text" name="degree" value={profileData.degree} onChange={handleInputChange} className="hr-input" placeholder="e.g. B.Tech, M.S." />
            ) : (
              <span className="profile-info-value">{profileData.degree || "—"}</span>
            )}
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Branch / Major</span>
            {isEditing ? (
              <input type="text" name="branch" value={profileData.branch} onChange={handleInputChange} className="hr-input" placeholder="e.g. Computer Science" />
            ) : (
              <span className="profile-info-value">{profileData.branch || "—"}</span>
            )}
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Skills</span>
            {isEditing ? (
              <input type="text" name="skills" value={profileData.skills} onChange={handleInputChange} className="hr-input" placeholder="React, Python, Django..." />
            ) : (
              <span className="profile-info-value">{profileData.skills || "—"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
