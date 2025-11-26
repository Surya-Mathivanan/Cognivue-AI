import React from "react";
import { useNavigate } from "react-router-dom";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="terms-container">
      <button
        className="back-button gradient-btn"
        onClick={() => navigate("/")}
        aria-label="Back to login"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>

      <div className="terms-content">
        <div className="terms-header">
          <h1 className="terms-title">Privacy Policy</h1>
          <p className="terms-subtitle">How Cognivue AI safeguards your data</p>
        </div>

        <section className="project-section">
          <h2 className="section-heading">
            <span className="section-icon">🔒</span>
            Overview
          </h2>
          <div className="project-description">
            <p>
              Cognivue AI authenticates only through Google OAuth; we never see
              your password. We request basic profile details (name, email,
              avatar) strictly to personalize the dashboard experience.
            </p>
            <p>
              Uploaded resumes are stored in a protected uploads bucket tied to
              your session and are used solely for generating tailored interview
              questions. You can delete them at any time by clearing interview
              sessions.
            </p>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-heading">
            <span className="section-icon">📁</span>
            Data Handling
          </h2>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-bullet">✅</span>
              <div>
                <strong>Session Cookies:</strong> Cookies are HTTP-only and
                scoped to our Render backend; we use them purely for keeping you
                logged in.
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-bullet">🗄️</span>
              <div>
                <strong>Storage:</strong> Interview history and generated
                feedback reside in our PostgreSQL database hosted on Render.
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-bullet">♻️</span>
              <div>
                <strong>Retention:</strong> Remove an interview session to
                immediately purge its answers, feedback, and resume snapshot.
              </div>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2 className="section-heading">
            <span className="section-icon">🤝</span>
            Contact
          </h2>
          <div className="team-grid">
            <div className="team-card">
              <h3 className="member-name">Need help?</h3>
              <p className="member-role">Reach the Cognivue AI Team</p>
              <div className="member-links">
                <a href="mailto:support@cognivue.ai" className="social-link">
                  support@cognivue.ai
                </a>
                <a
                  href="https://github.com/Surya-Mathivanan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="terms-footer">
          <p>&copy; 2024 Cognivue AI Team. All rights reserved.</p>
          <p>Updated: November 2024</p>
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
