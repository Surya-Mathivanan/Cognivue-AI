import React, { useState, useEffect } from 'react';
import LoadingAnimation from './LoadingAnimation';
import { getApiUrl } from '../api';

function SessionDetailPage({ sessionId, setCurrentView }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(getApiUrl(`/api/session/${sessionId}/`), { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          setError('Failed to load session details.');
        }
      } catch (err) {
        setError('An error occurred while loading session details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6366f1';
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-main">
        <LoadingAnimation message="Loading full session details..." size="large" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="dashboard-main">
        <div className="sdp-error">
          <div className="sdp-error-icon">⚠️</div>
          <h3>{error || 'Session not found'}</h3>
          <button className="btn btn-secondary" onClick={() => setCurrentView('history')}>
            ← Back to History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main sdp-container">
      {/* Back Button */}
      <button className="sdp-back-btn" onClick={() => setCurrentView('history')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to History
      </button>

      {/* Header Card */}
      <div className="sdp-header-card">
        <div className="sdp-header-top">
          <div className="sdp-header-info">
            <div className="sdp-mode-badge">
              {session.mode === 'resume' ? '📄 Resume-Based' : '🎯 Role-Based'} Interview
            </div>
            <h1 className="sdp-title">
              {session.role || session.experience_level || 'General'} Interview
            </h1>
            <div className="sdp-meta-row">
              <span className="sdp-difficulty-tag" style={{ color: getDifficultyColor(session.difficulty) }}>
                {session.difficulty}
              </span>
              {session.duration_minutes && (
                <span className="sdp-duration">⏱ {session.duration_minutes} min</span>
              )}
              <span className="sdp-date">{formatDate(session.completed_at)}</span>
            </div>
          </div>
          {session.overall_score != null && (
            <div className="sdp-score-circle" style={{ borderColor: getScoreColor(session.overall_score) }}>
              <span className="sdp-score-value" style={{ color: getScoreColor(session.overall_score) }}>
                {session.overall_score}%
              </span>
              <span className="sdp-score-label">{getScoreLabel(session.overall_score)}</span>
            </div>
          )}
        </div>

        {/* Category Scores */}
        {session.feedback?.category_scores && (
          <div className="sdp-category-scores">
            {Object.entries(session.feedback.category_scores).map(([key, value]) => (
              <div key={key} className="sdp-cat-score-item">
                <span className="sdp-cat-label">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                <div className="sdp-cat-bar-track">
                  <div
                    className="sdp-cat-bar-fill"
                    style={{ width: `${value}%`, background: getScoreColor(value) }}
                  />
                </div>
                <span className="sdp-cat-value" style={{ color: getScoreColor(value) }}>{value}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strengths & Improvements */}
      {(session.feedback?.strengths?.length > 0 || session.feedback?.improvements?.length > 0) && (
        <div className="sdp-feedback-grid">
          {session.feedback?.strengths?.length > 0 && (
            <div className="sdp-feedback-card sdp-strengths">
              <h3 className="sdp-feedback-title">
                <span>🌟</span> Strengths
              </h3>
              <ul className="sdp-feedback-list">
                {session.feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          {session.feedback?.improvements?.length > 0 && (
            <div className="sdp-feedback-card sdp-improvements">
              <h3 className="sdp-feedback-title">
                <span>🎯</span> Areas to Improve
              </h3>
              <ul className="sdp-feedback-list">
                {session.feedback.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Questions & Answers Section */}
      {session.questions?.length > 0 && (
        <div className="sdp-qa-section">
          <h2 className="sdp-section-heading">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Interview Questions & Answers
            <span className="sdp-qa-count">{session.questions.length} questions</span>
          </h2>

          <div className="sdp-qa-list">
            {session.questions.map((q, i) => (
              <div key={i} className="sdp-qa-card">
                <div className="sdp-qa-header">
                  <span className="sdp-qa-number">Q{i + 1}</span>
                  <span className="sdp-qa-category">{q.category}</span>
                </div>
                <div className="sdp-question-text">{q.text}</div>
                <div className="sdp-answer-section">
                  <div className="sdp-answer-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Your Answer
                  </div>
                  <div className="sdp-answer-text">
                    {session.answers?.[i] || (
                      <span className="sdp-no-answer">No answer provided</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Feedback */}
      {session.feedback?.detailed_feedback && (
        <div className="sdp-detailed-feedback">
          <h3 className="sdp-feedback-title">
            <span>📝</span> Detailed Analysis
          </h3>
          <p className="sdp-detailed-text">{session.feedback.detailed_feedback}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="sdp-bottom-actions">
        <button className="btn btn-secondary" onClick={() => setCurrentView('history')}>
          ← Back to History
        </button>
        <button className="btn btn-primary gradient-btn" onClick={() => setCurrentView('mode-selection')}>
          Start New Interview
        </button>
      </div>
    </div>
  );
}

export default SessionDetailPage;
