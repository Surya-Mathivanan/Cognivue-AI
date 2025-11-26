import React from 'react';

// Custom Pie Chart Component
function PieChart({ percentage, size = 120, color = '#238636' }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="pie-chart-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#21262d"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          fontSize="24"
          fontWeight="700"
          fill={color}
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}

function FeedbackDashboard({ feedbackData, setCurrentView }) {
  if (!feedbackData) {
    return (
      <div className="feedback-container">
        <div className="section-title">No feedback data available</div>
        <button className="btn btn-secondary" onClick={() => setCurrentView('mode-selection')}>
          Start New Interview
        </button>
      </div>
    );
  }

  const {
    overall_score = 0,
    category_scores = {},
    strengths = [],
    improvements = [],
    detailed_feedback = ''
  } = feedbackData;

  return (
    <div className="feedback-container">
      <div className="page-header">
        <h2 className="page-title">Your Interview Performance</h2>
        <p className="page-subtitle">Detailed analysis of your interview session</p>
      </div>
      
      {/* Overall Score with Large Pie Chart */}
      <div className="overall-score-section">
        <div className="overall-score-card">
          <h3 className="score-section-title">Overall Performance</h3>
          <PieChart percentage={overall_score} size={200} color="#238636" />
          <p className="score-description">
            {overall_score >= 80 ? 'Excellent performance! You demonstrated strong skills across all areas.' :
             overall_score >= 60 ? 'Good job! There\'s room for improvement in some areas.' :
             overall_score >= 40 ? 'Fair performance. Focus on strengthening your weak areas.' :
             'Keep practicing! Review the feedback below for improvement suggestions.'}
          </p>
        </div>
      </div>

      {/* Category Scores with Pie Charts */}
      <div className="category-scores-section">
        <h3 className="section-title">Performance Breakdown</h3>
        <div className="score-overview">

          <div className="score-card">
            <div className="score-card-header">
              <span className="score-icon">💼</span>
              <div className="score-label">Behavioral Skills</div>
            </div>
            <PieChart 
              percentage={category_scores.hr_performance || 0} 
              size={120} 
              color="#1f6feb" 
            />
          </div>
          
          <div className="score-card">
            <div className="score-card-header">
              <span className="score-icon">⚙️</span>
              <div className="score-label">Technical Expertise</div>
            </div>
            <PieChart 
              percentage={category_scores.technical_performance || 0} 
              size={120} 
              color="#d29922" 
            />
          </div>
          
          <div className="score-card">
            <div className="score-card-header">
              <span className="score-icon">🤝</span>
              <div className="score-label">Culture Alignment</div>
            </div>
            <PieChart 
              percentage={category_scores.cultural_fit || 0} 
              size={120} 
              color="#8957e5" 
            />
          </div>
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="feedback-grid">
        <div className="feedback-section">
          <h3 className="feedback-section-title">
            <span className="feedback-icon">🌟</span>
            What You Excelled At
          </h3>
          <ul className="feedback-list">
            {strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))
            ) : (
              <li>No specific strengths identified in this session</li>
            )}
          </ul>
        </div>

        <div className="feedback-section">
          <h3 className="feedback-section-title">
            <span className="feedback-icon">🎯</span>
            Growth Opportunities
          </h3>
          <ul className="feedback-list">
            {improvements.length > 0 ? (
              improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))
            ) : (
              <li>Keep up the excellent work!</li>
            )}
          </ul>
        </div>
      </div>

      <div className="feedback-section detailed-feedback">
        <h3 className="feedback-section-title">
          <span className="feedback-icon">📝</span>
          Detailed Analysis
        </h3>
        <p className="feedback-content">{detailed_feedback || 'Great job completing the interview! Keep practicing to improve your skills.'}</p>
      </div>

      <div className="feedback-actions">
        <button
          className="btn btn-primary gradient-btn"
          onClick={() => setCurrentView('mode-selection')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Take Another Interview
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => window.print()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7"/>
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <path d="M6 14h12v8H6z"/>
          </svg>
          Save Results
        </button>
      </div>
    </div>
  );
}

export default FeedbackDashboard;
