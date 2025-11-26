import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsOfService() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Surya M",
      college: "Sri Sairam Engineering College",
      role: "Full Stack Developer",
      photo: "https://via.placeholder.com/150",
      github: "https://github.com/suryamurali",
      linkedin: "https://linkedin.com/in/suryamurali"
    },
    {
      name: "Team Member 2",
      college: "Sri Sairam Engineering College",
      role: "AI/ML Engineer",
      photo: "https://via.placeholder.com/150",
      github: "https://github.com/member2",
      linkedin: "https://linkedin.com/in/member2"
    },
    {
      name: "Team Member 3",
      college: "Sri Sairam Engineering College",
      role: "Backend Developer",
      photo: "https://via.placeholder.com/150",
      github: "https://github.com/member3",
      linkedin: "https://linkedin.com/in/member3"
    },
    {
      name: "Team Member 4",
      college: "Sri Sairam Engineering College",
      role: "Frontend Developer",
      photo: "https://via.placeholder.com/150",
      github: "https://github.com/member4",
      linkedin: "https://linkedin.com/in/member4"
    }
  ];

  const technologies = [
    { name: "React 19.1.1", icon: "⚛️" },
    { name: "Python Flask", icon: "🐍" },
    { name: "Google Gemini AI", icon: "🤖" },
    { name: "SQLite", icon: "🗄️" },
    { name: "Vite", icon: "⚡" },
    { name: "Google OAuth 2.0", icon: "🔐" }
  ];

  return (
    <div className="terms-container">
      <button className="back-button gradient-btn" onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Home
      </button>

      <div className="terms-content">
        <div className="terms-header">
          <h1 className="terms-title">About Cognivue AI</h1>
          <p className="terms-subtitle">AI-Powered Interview Preparation Platform</p>
        </div>

        <section className="project-section">
          <h2 className="section-heading">
            <span className="section-icon">📋</span>
            Project Overview
          </h2>
          <div className="project-description">
            <p>
              <strong>Cognivue AI</strong> is an intelligent, full-stack web application
              designed to revolutionize interview preparation for students, freshers, and job seekers. By leveraging
              cutting-edge AI technology (Google Gemini AI), this application provides personalized, context-aware
              interview practice with real-time feedback.
            </p>
            <p>
              The application starts with a secure Google OAuth login screen displaying the project title prominently.
              Users can choose between two interview modes: resume-based (upload PDF resume for personalized questions)
              or role-based (select job role with difficulty levels). The system generates HR, technical, and cultural
              questions using AI, evaluates responses, and provides detailed feedback with performance metrics.
            </p>
            <p>
              Built as a Final Year Project by Cognivue AI Team, this platform combines modern React frontend with
              Flask backend, SQLite database, and Google Gemini AI integration to deliver a comprehensive
              interview preparation solution.
            </p>
          </div>
        </section>

        <section className="tech-section">
          <h2 className="section-heading">
            <span className="section-icon">🛠️</span>
            Technologies Used
          </h2>
          <div className="tech-grid">
            {technologies.map((tech, index) => (
              <div key={index} className="tech-card">
                <span className="tech-icon">{tech.icon}</span>
                <span className="tech-name">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <h2 className="section-heading">
            <span className="section-icon">👥</span>
            Our Team
          </h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="member-photo-wrapper">
                  <img src={member.photo} alt={member.name} className="member-photo" />
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-college">{member.college}</p>
                <p className="member-role">{member.role}</p>
                <div className="member-links">
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-heading">
            <span className="section-icon">✨</span>
            Key Features
          </h2>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-bullet">🎯</span>
              <div>
                <strong>Resume-Based Questions:</strong> Upload your resume and get personalized questions tailored to your experience
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-bullet">💼</span>
              <div>
                <strong>Role-Specific Interviews:</strong> Practice for specific positions with difficulty-adjusted questions
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-bullet">🎤</span>
              <div>
                <strong>Voice Recognition:</strong> Answer questions using speech-to-text technology
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-bullet">📊</span>
              <div>
                <strong>Detailed Feedback:</strong> Get comprehensive analysis across HR, technical, and cultural fit categories
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-bullet">🤖</span>
              <div>
                <strong>AI-Powered Analysis:</strong> Leverages Google Gemini AI for intelligent question generation and feedback
              </div>
            </div>
          </div>
        </section>

        <footer className="terms-footer">
          <p>&copy; 2024 Cognivue AI Team. All rights reserved.</p>
          <p>Built with passion for helping candidates succeed in their career journey.</p>
        </footer>
      </div>
    </div>
  );
}

export default TermsOfService;
