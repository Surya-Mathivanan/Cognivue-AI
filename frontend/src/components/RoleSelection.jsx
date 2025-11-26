import React, { useState } from 'react';

function RoleSelection({ setCurrentView, setInterviewData }) {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const roles = [
    { value: 'frontend-developer', label: 'Frontend Developer' },
    { value: 'backend-developer', label: 'Backend Developer' },
    { value: 'fullstack-developer', label: 'Full Stack Developer' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'ui-ux-designer', label: 'UI/UX Designer' },
    { value: 'devops-engineer', label: 'DevOps Engineer' },
    { value: 'mobile-developer', label: 'Mobile Developer' },
    { value: 'qa-engineer', label: 'QA Engineer' },
    { value: 'data-analyst', label: 'Data Analyst' }
  ];

  const handleStartInterview = () => {
    if (!role || !difficulty) {
      alert('Please select both role and difficulty level');
      return;
    }

    setInterviewData({
      mode: 'role',
      role: role,
      difficulty: difficulty,
      keywords: []
    });

    setCurrentView('interview-setup');
  };

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Choose Your Role</h1>
        <p className="page-subtitle">Select the position you're preparing for</p>
      </div>
      
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Target Position</label>
          <select 
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">What role are you preparing for?</option>
            {roles.map(roleOption => (
              <option key={roleOption.value} value={roleOption.value}>
                {roleOption.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Experience Level</label>
          <select 
            className="form-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">What's your experience level?</option>
            <option value="beginner">Beginner - Just starting out</option>
            <option value="intermediate">Intermediate - Some experience</option>
            <option value="advanced">Advanced - Senior level</option>
          </select>
        </div>
        
        <div className="interview-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentView('mode-selection')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Back
          </button>
          <button
            className="btn btn-primary gradient-btn"
            onClick={handleStartInterview}
            disabled={!role || !difficulty}
          >
            Start Interview
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;