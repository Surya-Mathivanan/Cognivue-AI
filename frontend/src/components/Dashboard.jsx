import React, { useState } from 'react';
import ResumeUpload from './ResumeUpload';
import RoleSelection from './RoleSelection';
import InterviewSession from './InterviewSession';
import FeedbackDashboard from './FeedbackDashboard';
import SessionHistory from './SessionHistory';
import SessionDetailPage from './SessionDetailPage';
import { getApiUrl } from '../api';

function Dashboard({ user, setUser, theme, toggleTheme }) {
  const [currentView, setCurrentView] = useState('mode-selection');
  const [interviewData, setInterviewData] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const handleLogout = async () => {
    try {
      const response = await fetch(getApiUrl('/api/logout/'), {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'mode-selection':
        return (
          <div className="dashboard-main home-modern">
            {/* Hero Section */}
            <div className="home-hero">
              <div className="home-hero-content">
                <div className="home-greeting">
                  <span className="greeting-wave">👋</span>
                  <span className="greeting-text">Welcome back,</span>
                </div>
                <h1 className="home-hero-title">
                  {user?.username || 'User'}
                </h1>
                <p className="home-hero-subtitle">
                  Ready to sharpen your interview skills? Choose your preparation mode below.
                </p>
              </div>
              <div className="home-hero-decoration">
                <div className="hero-orb hero-orb-1" />
                <div className="hero-orb hero-orb-2" />
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="home-quick-stats">
              <div className="quick-stat-item">
                <div className="quick-stat-icon">🎯</div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Practice Modes</span>
                  <span className="quick-stat-value">2 Available</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon">🤖</div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">AI Engine</span>
                  <span className="quick-stat-value">Gemini Pro</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon">⚡</div>
                <div className="quick-stat-info">
                  <span className="quick-stat-label">Feedback</span>
                  <span className="quick-stat-value">Real-time</span>
                </div>
              </div>
            </div>

            {/* Mode Selection Cards */}
            <h2 className="home-section-title">Choose Your Interview Mode</h2>
            <div className="mode-selection-modern">
              <div className="mode-card-modern" onClick={() => setCurrentView('resume-upload')}>
                <div className="mode-card-shine" />
                <div className="mode-card-badge">Popular</div>
                <div className="mode-icon-modern">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <h3 className="mode-card-title">Resume-Based Interview</h3>
                <p className="mode-card-desc">Upload your resume and get AI-generated questions tailored to your experience and skills</p>
                <div className="mode-card-features">
                  <span className="mode-feature-tag">📄 Resume Analysis</span>
                  <span className="mode-feature-tag">🎯 Personalized</span>
                </div>
                <button className="btn btn-primary mode-card-btn">Get Started →</button>
              </div>

              <div className="mode-card-modern" onClick={() => setCurrentView('role-selection')}>
                <div className="mode-card-shine" />
                <div className="mode-icon-modern">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <h3 className="mode-card-title">Role-Based Interview</h3>
                <p className="mode-card-desc">Select a specific role and difficulty level for targeted practice sessions</p>
                <div className="mode-card-features">
                  <span className="mode-feature-tag">🏷️ Role Specific</span>
                  <span className="mode-feature-tag">📊 3 Difficulty Levels</span>
                </div>
                <button className="btn btn-primary mode-card-btn">Choose Role →</button>
              </div>
            </div>

            {/* How it works */}
            <div className="home-how-it-works">
              <h2 className="home-section-title">How It Works</h2>
              <div className="how-steps">
                <div className="how-step">
                  <div className="how-step-num">1</div>
                  <h4>Choose Mode</h4>
                  <p>Upload resume or select a role</p>
                </div>
                <div className="how-step-connector" />
                <div className="how-step">
                  <div className="how-step-num">2</div>
                  <h4>Answer Questions</h4>
                  <p>Respond via text or voice</p>
                </div>
                <div className="how-step-connector" />
                <div className="how-step">
                  <div className="how-step-num">3</div>
                  <h4>Get Feedback</h4>
                  <p>Detailed AI-powered analysis</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'resume-upload':
        return <ResumeUpload setCurrentView={setCurrentView} setInterviewData={setInterviewData} />;

      case 'role-selection':
        return <RoleSelection setCurrentView={setCurrentView} setInterviewData={setInterviewData} />;

      case 'interview-setup':
        return <InterviewSession interviewData={interviewData} setCurrentView={setCurrentView} setFeedbackData={setFeedbackData} />;

      case 'feedback':
        return <FeedbackDashboard feedbackData={feedbackData} setCurrentView={setCurrentView} />;

      case 'history':
        return (
          <SessionHistory
            setCurrentView={setCurrentView}
            setFeedbackData={setFeedbackData}
            onViewFullDetails={(id) => {
              setSelectedSessionId(id);
              setCurrentView('session-detail');
            }}
          />
        );

      case 'session-detail':
        return (
          <SessionDetailPage
            sessionId={selectedSessionId}
            setCurrentView={setCurrentView}
          />
        );

      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <span className="brand-name">Cognivue AI</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentView === 'mode-selection' ? 'active' : ''}`}
            onClick={() => navigateTo('mode-selection')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
          </button>

          <button
            className={`nav-item ${currentView === 'resume-upload' ? 'active' : ''}`}
            onClick={() => navigateTo('resume-upload')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>Resume Interview</span>
          </button>

          <button
            className={`nav-item ${currentView === 'role-selection' ? 'active' : ''}`}
            onClick={() => navigateTo('role-selection')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
            <span>Role Interview</span>
          </button>

          <button
            className={`nav-item ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => navigateTo('history')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>History</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar-sidebar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button className="logout-button-sidebar gradient-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="dashboard-header desktop-only">
          <div className="header-content">
            <h1 className="app-title">Interview Assistant</h1>
            <div className="header-actions">
              <button className="theme-toggle-header" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
              <button className="logout-button gradient-btn" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <main className="dashboard-content">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
