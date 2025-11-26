import React, { useState, useEffect, useRef } from 'react';
import LoadingAnimation from './LoadingAnimation';
import { getApiUrl } from '../api';

function InterviewSession({ interviewData, setCurrentView, setFeedbackData }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentAnswer(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      const response = await fetch(getApiUrl('/api/generate-questions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(interviewData)
      });

      if (response.ok) {
        const result = await response.json();
        setQuestions(getAllQuestions(result.questions));
        setSessionId(result.session_id);
        setAnswers(new Array(getAllQuestions(result.questions).length).fill(''));
      } else {
        alert('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const getAllQuestions = (questionData) => {
    const allQuestions = [];
    
    questionData.hr_questions?.forEach(q => {
      allQuestions.push({ category: 'HR', text: q });
    });
    
    questionData.technical_questions?.forEach(q => {
      allQuestions.push({ category: 'Technical', text: q });
    });
    
    questionData.cultural_questions?.forEach(q => {
      allQuestions.push({ category: 'Cultural Fit', text: q });
    });
    
    return allQuestions;
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before continuing');
      return;
    }

    // Save answer to backend
    try {
      await fetch(getApiUrl('/api/submit-answer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          session_id: sessionId,
          question_index: currentQuestionIndex,
          answer: currentAnswer
        })
      });

      // Update local answers
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(newAnswers);

      // Move to next question or complete interview
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
      } else {
        completeInterview();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer');
    }
  };

  const completeInterview = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/complete-interview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId })
      });

      if (response.ok) {
        const result = await response.json();
        setFeedbackData(result.feedback);
        setCurrentView('feedback');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to complete interview: ${errorData.error || 'Unknown error'}`);
        setLoading(false); // Reset loading on error
      }
    } catch (error) {
      console.error('Error completing interview:', error);
      alert('Failed to complete interview. Please check your connection and try again.');
      setLoading(false); // Reset loading on error
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && speechSupported) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-main">
        <LoadingAnimation/>

        {/* ========================================================================================================== */}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="dashboard-main">
        <div className="page-header">
          <h1 className="page-title">Unable to Generate Questions</h1>
          <p className="page-subtitle">Please try again or contact support</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setCurrentView('mode-selection')}>
          Back to Mode Selection
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="dashboard-main">
      <div className="interview-layout">
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Interview Progress</span>
            <span className="progress-counter">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="question-section">
          <div className="question-header">
            <span className="question-badge">{currentQuestion.category}</span>
          </div>
          <div className="question-text">{currentQuestion.text}</div>
        </div>

        <div className="answer-section">
          <textarea
            className="answer-textarea"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentAnswer.trim() ? "" : "Share your thoughts here... Take your time to craft a thoughtful response. You can also use voice recording if available."}
          />

          {speechSupported && (
            <div className="voice-controls">
              <button
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                    Stop Recording
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    Start Recording
                  </>
                )}
              </button>
            </div>
          )}

          <div className="interview-actions">
            {currentQuestionIndex > 0 && (
              <button className="btn btn-secondary" onClick={goToPreviousQuestion}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
                Previous
              </button>
            )}

            <button className="btn btn-primary gradient-btn" onClick={handleAnswerSubmit}>
              {currentQuestionIndex === questions.length - 1 ? 'Complete Interview' : 'Next Question'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;