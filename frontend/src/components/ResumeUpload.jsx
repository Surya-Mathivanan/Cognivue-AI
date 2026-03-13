import React, { useState } from "react";
import styled from "styled-components";
import Loader from "./Loader";
import { getApiUrl, getAuthHeaders } from "../api";

// Styled File Upload Component
const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  height: 300px;
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  box-shadow: 4px 4px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  gap: 10px;
  background-color: rgba(137, 92, 246, 0.05);
  border: 1px solid rgba(137, 92, 246, 0.2);
`;

const Header = styled.div`
  flex: 1;
  width: 100%;
  border: 2px dashed #8b5cf6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(137, 92, 246, 0.1);
    border-color: #8b5cf6;
  }

  svg {
    height: 80px;
    margin-bottom: 10px;
  }

  p {
    text-align: center;
    color: #666;
    font-size: 14px;
  }
`;

const Footer = styled.label`
  background-color: rgba(137, 92, 246, 0.1);
  width: 100%;
  height: 45px;
  padding: 8px 15px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(137, 92, 246, 0.2);
  }

  svg {
    height: 24px;
    fill: #8b5cf6;
    background-color: rgba(137, 92, 246, 0.15);
    border-radius: 50%;
    padding: 4px;
    cursor: pointer;
  }

  p {
    flex: 1;
    text-align: center;
    font-weight: 500;
    color: ${(props) => (props.hasFile ? "#8B5CF6" : "#666")};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadBox = ({ selectedFile, onFileChange }) => {
  return (
    <StyledWrapper>
      <Container>
        <Header onClick={() => document.getElementById("resume-file").click()}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g id="SVGRepo_iconCarrier">
              <path
                d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15"
                stroke="#8B5CF6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
          <p>
            {selectedFile
              ? selectedFile.name
              : "Click to browse or drop your PDF resume"}
          </p>
        </Header>
        <Footer htmlFor="resume-file" hasFile={selectedFile ? true : false}>
          <svg
            fill="#8B5CF6"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g id="SVGRepo_iconCarrier">
              <path d="M15.331 6H8.5v20h15V14.154h-8.169z" />
              <path d="M18.153 6h-.009v5.342H23.5v-.002z" />
            </g>
          </svg>
          <p>{selectedFile ? selectedFile.name : "No file selected"}</p>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth={0} />
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g id="SVGRepo_iconCarrier">
              <path
                d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z"
                stroke="#8B5CF6"
                strokeWidth={2}
              />
              <path
                d="M19.5 5H4.5"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <path
                d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5H10V3Z"
                stroke="#8B5CF6"
                strokeWidth={2}
              />
            </g>
          </svg>
        </Footer>
        <FileInput
          id="resume-file"
          type="file"
          accept=".pdf,application/pdf"
          onChange={onFileChange}
        />
      </Container>
    </StyledWrapper>
  );
};

function ResumeUpload({ setCurrentView, setInterviewData }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [difficulty, setDifficulty] = useState("");
  const [uploading, setUploading] = useState(false);
  const [keywords, setKeywords] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !difficulty) {
      alert("Please select a file and difficulty level");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const response = await fetch(getApiUrl("/api/upload-resume/"), {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setKeywords(result.keywords);

        // Set interview data and proceed to interview
        setInterviewData({
          mode: "resume",
          difficulty: difficulty,
          keywords: result.keywords,
          filename: result.filename,
        });

        setCurrentView("interview-setup");
      } else {
        const error = await response.json();
        alert(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div className="dashboard-main">
        <Loader message="Processing your resume and extracting keywords..." />
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div className="page-header">
        <h1 className="page-title">Upload Your Resume</h1>
        <p className="page-subtitle">
          Share your professional story for personalized interview questions
        </p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Resume Document</label>
          <FileUploadBox
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
          />
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
            <option value="intermediate">
              Intermediate - Mid-level challenges
            </option>
            <option value="advanced">Advanced - Senior level scenarios</option>
          </select>
        </div>

        {keywords.length > 0 && (
          <div className="form-group">
            <label className="form-label">Key Skills Identified</label>
            <div className="keywords-grid">
              {keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="interview-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentView("mode-selection")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15,18 9,12 15,6" />
            </svg>
            Back
          </button>
          <button
            className="btn btn-primary gradient-btn"
            onClick={handleUpload}
            disabled={!selectedFile || !difficulty || uploading}
          >
            {uploading ? "Processing..." : "Start Interview"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
