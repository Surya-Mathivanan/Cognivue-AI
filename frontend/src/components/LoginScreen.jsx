import React from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api";

function LoginScreen({ setUser, theme = "dark", toggleTheme }) {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="login-screen">
      
      <div className="login-container">
        {/* Left Panel - Minimal Login Form */}
        <div className="login-panel">
          <div className="login-content">
            <div className="welcome-section">
              <h1 className="welcome-title">Cognivue AI</h1>
              <p className="welcome-subtitle">
                LLM-Powered Cognitive Interview Assistant, Master your interview
                skills with AI-powered personalized feedback
              </p>
            </div>

            <div className="login-options">
              <button className="google-login-btn" onClick={handleGoogleLogin}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Footer Links */}
            <div className="login-footer">
              <p className="footer-text">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="footer-link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </p>
              <p className="creators-text">
   {" "}
  <button
    type="button"
    onClick={toggleTheme}
    className="creator-link"
    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
  >
    {theme === "dark" ? "Light Mode – Click Here" : "Dark Mode – Click Here"}
  </button>
</p>
              
            </div>
          </div>
        </div>

        {/* Right Panel - Interactive Content */}
        <div className="visual-panel">
          <div className="visual-content">
            {/* Main Heading with Icon */}
            <div className="visual-heading">
              {/* <div className="ai-icon-animated">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div> */}
              <h2 className="visual-main-title">Analyze. Adapt. Succeed.</h2>
              <p className="visual-subtitle">
                Your AI-powered interview preparation platform
              </p>
            </div>

            {/* Interactive Feature Cards */}
            <div className="feature-cards-grid">
              <div className="feature-card-interactive">
                <div className="feature-card-icon">🎯</div>
                <h3>Smart Question Generation</h3>
                <p>
                  AI analyzes your resume and generates targeted questions for
                  your role
                </p>
              </div>

              <div className="feature-card-interactive">
                <div className="feature-card-icon">💬</div>
                <h3>Real-time Feedback</h3>
                <p>
                  Get instant AI-powered feedback on your responses and improve
                  continuously
                </p>
              </div>

              <div className="feature-card-interactive">
                <div className="feature-card-icon">📊</div>
                <h3>Progress Tracking</h3>
                <p>
                  Track your performance across multiple categories and
                  difficulty levels
                </p>
              </div>

              <div className="feature-card-interactive">
                <div className="feature-card-icon">🚀</div>
                <h3>Interview Ready</h3>
                <p>
                  Build confidence with practice sessions tailored to your
                  target companies
                </p>
              </div>
            </div>

            {/* Powered By Section */}
            <div className="powered-by-section">
              <span className="powered-badge">
                ⚡ Powered by Google Gemini AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
