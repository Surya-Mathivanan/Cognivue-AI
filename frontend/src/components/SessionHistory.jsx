import React, { useState, useEffect } from 'react';
import LoadingAnimation from './LoadingAnimation';
import Loader from './Loader';
import { getApiUrl } from '../api';

function SessionHistory({ setCurrentView, setFeedbackData, onViewFullDetails }) {
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const [historyRes, analyticsRes] = await Promise.all([
          fetch(getApiUrl('/api/session-history/'), { credentials: 'include', signal: controller.signal }),
          fetch(getApiUrl('/api/analytics/'), { credentials: 'include', signal: controller.signal }),
        ]);

        if (historyRes.ok) {
          const data = await historyRes.json();
          setSessions(data.sessions || []);
        }
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const loadSessionDetail = async (sessionId) => {
    setDetailLoading(true);
    setSelectedSession(sessionId);
    try {
      const res = await fetch(getApiUrl(`/api/session/${sessionId}/`), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessionDetail(data);
      }
    } catch (err) {
      console.error('Session detail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const viewFeedback = (session) => {
    if (session.feedback && Object.keys(session.feedback).length > 0) {
      setFeedbackData(session.feedback);
      setCurrentView('feedback');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'var(--success-color, #22c55e)';
      case 'intermediate': return 'var(--warning-color, #f59e0b)';
      case 'advanced': return 'var(--danger-color, #ef4444)';
      default: return 'var(--accent-color, #6366f1)';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Interview History</h1>
        <p className="page-subtitle">Review your past sessions and track your progress</p>
      </div>

      {/* Analytics Summary */}
      {analytics && analytics.total_sessions > 0 && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-value">{analytics.total_sessions}</div>
            <div className="analytics-label">Total Sessions</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value" style={{ color: analytics.average_score ? getScoreColor(analytics.average_score) : 'inherit' }}>
              {analytics.average_score != null ? `${analytics.average_score}%` : '—'}
            </div>
            <div className="analytics-label">Average Score</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value" style={{ color: analytics.best_score ? getScoreColor(analytics.best_score) : 'inherit' }}>
              {analytics.best_score != null ? `${analytics.best_score}%` : '—'}
            </div>
            <div className="analytics-label">Best Score</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value">{analytics.resume_count}</div>
            <div className="analytics-label">Resume-Based</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value">{analytics.role_count}</div>
            <div className="analytics-label">Role-Based</div>
          </div>
        </div>
      )}

      {/* Session List */}
      {sessions.length === 0 ? (
        <div className="dashboard-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <Loader />
        </div>
      ) : (
        <div className="history-layout">
          {/* Session Cards */}
          <div className="history-list-container">
            <div className="history-list">
              {sessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((session) => (
                <div
                key={session.id}
                className={`history-card ${selectedSession === session.id ? 'selected' : ''}`}
                onClick={() => loadSessionDetail(session.id)}
              >
              <div className="history-card-header">
                  <div className="history-mode-badge" style={{ borderColor: getDifficultyColor(session.difficulty) }}>
                    {session.mode === 'resume' ? '📄 Resume' : '🎯 Role'}
                  </div>
                  {session.overall_score != null && (
                    <div className="history-total-score" style={{ background: `${getScoreColor(session.overall_score)}18`, borderColor: getScoreColor(session.overall_score) }}>
                      <span className="total-score-label">Total Score</span>
                      <span className="total-score-value" style={{ color: getScoreColor(session.overall_score) }}>
                        {session.overall_score}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="history-card-body">
                  <div className="history-role">
                    {session.role || session.experience_level || 'General Interview'}
                  </div>
                  <div className="history-meta">
                    <span className="history-difficulty" style={{ color: getDifficultyColor(session.difficulty) }}>
                      {session.difficulty}
                    </span>
                    {session.duration_minutes && (
                      <span className="history-duration">⏱ {session.duration_minutes}m</span>
                    )}
                  </div>
                  <div className="history-date">{formatDate(session.completed_at)}</div>
                </div>

                {session.feedback_summary?.strengths?.length > 0 && (
                  <div className="history-preview">
                    <span className="preview-label">Top strength:</span>
                    <span className="preview-text">{session.feedback_summary.strengths[0]}</span>
                  </div>
                )}

                <button
                  className="history-view-details-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFullDetails(session.id);
                  }}
                >
                  View Full Details →
                </button>
              </div>
            ))}
            </div>
            
            {/* Pagination Controls */}
            {Math.ceil(sessions.length / itemsPerPage) > 1 && (
              <div className="history-pagination">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </button>
                <span className="page-info">{currentPage} / {Math.ceil(sessions.length / itemsPerPage)}</span>
                <button 
                  className="page-btn" 
                  disabled={currentPage === Math.ceil(sessions.length / itemsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Session Detail */}
          <div className="history-detail">
            {detailLoading ? (
              <div className="detail-loading">
                <LoadingAnimation message="Loading details..." size="medium" />
              </div>
            ) : sessionDetail ? (
              <div className="detail-content">
                <div className="detail-header">
                  <h3 className="detail-title">
                    {sessionDetail.mode === 'resume' ? 'Resume-Based' : 'Role-Based'} Interview
                  </h3>
                  <span className="detail-difficulty" style={{ color: getDifficultyColor(sessionDetail.difficulty) }}>
                    {sessionDetail.difficulty}
                  </span>
                </div>

                {sessionDetail.overall_score != null && (
                  <div className="detail-score-row">
                    <span>Overall Score:</span>
                    <strong style={{ color: getScoreColor(sessionDetail.overall_score) }}>
                      {sessionDetail.overall_score}%
                    </strong>
                  </div>
                )}

                {sessionDetail.feedback?.strengths?.length > 0 && (
                  <div className="detail-section">
                    <h4>🌟 Strengths</h4>
                    <ul>
                      {sessionDetail.feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {sessionDetail.feedback?.improvements?.length > 0 && (
                  <div className="detail-section">
                    <h4>🎯 Areas to Improve</h4>
                    <ul>
                      {sessionDetail.feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}

                {sessionDetail.questions?.length > 0 && (
                  <div className="detail-section">
                    <h4>❓ Questions ({sessionDetail.questions.length})</h4>
                    <div className="detail-qa-list">
                      {sessionDetail.questions.map((q, i) => (
                        <div key={i} className="detail-qa-item">
                          <div className="detail-q">
                            <span className="qa-badge">{q.category}</span>
                            {q.text}
                          </div>
                          {sessionDetail.answers?.[i] && (
                            <div className="detail-a">
                              <em>{sessionDetail.answers[i]}</em>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary gradient-btn"
                  onClick={() => viewFeedback(sessionDetail)}
                  style={{ marginTop: '1rem', width: '100%' }}
                >
                  View Full Feedback Report
                </button>
              </div>
            ) : (
              <div className="detail-placeholder">
                <div className="placeholder-icon">👈</div>
                <p>Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionHistory;
