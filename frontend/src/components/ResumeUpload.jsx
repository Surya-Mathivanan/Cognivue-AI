import React, { useState } from 'react';
import LoadingAnimation from './LoadingAnimation';
import { getApiUrl } from '../api';

function ResumeUpload({ setCurrentView, setInterviewData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [difficulty, setDifficulty] = useState('');
  const [uploading, setUploading] = useState(false);
  const [keywords, setKeywords] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !difficulty) {
      alert('Please select a file and difficulty level');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const response = await fetch(getApiUrl('/api/upload-resume/'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setKeywords(result.keywords);
        
        // Set interview data and proceed to interview
        setInterviewData({
          mode: 'resume',
          difficulty: difficulty,
          keywords: result.keywords,
          filename: result.filename
        });
        
        setCurrentView('interview-setup');
      } else {
        const error = await response.json();
        alert(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div className="dashboard-main">
        <LoadingAnimation message="Processing your resume and extracting keywords..." size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Upload Your Resume</h1>
        <p className="page-subtitle">Share your professional story for personalized interview questions</p>
      </div>
      
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Resume Document</label>
          <div 
            className={`file-upload-area ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-upload').click()}
          >
            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              {selectedFile ? selectedFile.name : 'Drop your PDF resume here or click to browse'}
            </div>
            <div className="upload-hint">PDF files only, max 10MB</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Interview Complexity</label>
          <select 
            className="form-select" 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Choose your challenge level...</option>
            <option value="beginner">Beginner - Entry level questions</option>
            <option value="intermediate">Intermediate - Mid-level challenges</option>
            <option value="advanced">Advanced - Senior level scenarios</option>
          </select>
        </div>

        {keywords.length > 0 && (
          <div className="form-group">
            <label className="form-label">Key Skills Identified</label>
            <div className="keywords-grid">
              {keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">{keyword}</span>
              ))}
            </div>
          </div>
        )}

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
            onClick={handleUpload}
            disabled={!selectedFile || !difficulty || uploading}
          >
            {uploading ? 'Processing...' : 'Start Interview'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
