# Resume-Based Interview Feature Documentation

## Overview

The resume-based interview feature is an advanced AI-powered system that analyzes uploaded resumes and generates personalized interview questions based on the candidate's actual skills, projects, and experience.

## Key Features

### 1. Intelligent Resume Analysis
- **Multi-layered Extraction**: Uses both pattern matching and AI (Gemini) for comprehensive analysis
- **Technical Skills Detection**: Identifies programming languages, frameworks, databases, cloud platforms, etc.
- **Soft Skills Recognition**: Extracts communication, leadership, teamwork, and other professional skills
- **Project Parsing**: Identifies projects with their descriptions, technologies used, and achievements
- **Experience Level Assessment**: Automatically determines if candidate is entry-level, mid-level, or senior

### 2. Targeted Question Generation
Unlike generic interviews, this system generates three types of specific questions:

#### Technical Questions (5 questions)
- Based on **actual technical skills** mentioned in the resume
- Difficulty-adjusted (beginner/intermediate/advanced)
- Mix of theoretical and practical scenarios
- Example: If resume mentions "React" and "Node.js", questions will specifically test these technologies

#### HR/Culture Fit Questions (4 questions)
- Based on **soft skills** extracted from resume
- Uses STAR method (Situation, Task, Action, Result)
- Assesses communication, teamwork, and professional growth
- Example: If resume mentions "leadership", questions probe leadership experiences

#### Project-Based Questions (3 questions)
- Based on **actual projects** listed in resume
- Asks about technical decisions, challenges, and solutions
- Probes depth of involvement and understanding
- Example: "In your 'E-commerce Platform' project using Django, how did you handle user authentication?"

### 3. Data Persistence
All resume analysis data is stored in the database:
- Technical skills with categories
- Soft skills with context
- Projects with details
- Experience level
- AI-generated summary

This allows for:
- Historical tracking
- Analysis comparison
- Interview preparation insights

## System Architecture

### Component 1: Resume Analyzer (`backend/resume_analyzer.py`)

```
PDF Upload → Text Extraction → Pattern Matching → LLM Analysis → Merged Results
```

**Key Classes:**
- `ResumeAnalyzer`: Main analyzer class
- `ResumeAnalysis`: Data model for results
- `TechnicalSkill`, `SoftSkill`, `Project`: Individual data models

**Extraction Methods:**
1. **Pattern Matching** (Fast, Reliable)
   - Regex-based skill detection
   - Predefined skill databases
   - Keyword extraction

2. **LLM Analysis** (Intelligent, Context-Aware)
   - Gemini AI for deep understanding
   - Context extraction
   - Intelligent summarization

3. **Hybrid Approach** (Best of Both)
   - Combines pattern matching + LLM
   - Pattern matching for speed and coverage
   - LLM for quality and context

### Component 2: Question Generator (`backend/question_generator.py`)

```
Resume Analysis → Question Type Selection → LLM Generation → Targeted Questions
```

**Key Methods:**
- `generate_resume_based_questions()`: Main entry point
- `_generate_technical_questions()`: Tech questions from skills
- `_generate_hr_questions()`: HR questions from soft skills
- `_generate_project_questions()`: Project-specific questions

**Generation Strategy:**
- Uses Gemini AI with specific prompts
- JSON output for structured data
- Fallback questions if API fails
- Difficulty-aware generation

### Component 3: Enhanced API Endpoints

#### `/api/upload-resume` (POST)
**Input:**
```json
{
  "resume": "file (multipart/form-data)"
}
```

**Output:**
```json
{
  "message": "Resume uploaded and analyzed successfully",
  "filename": "unique_filename.pdf",
  "analysis": {
    "technical_skills": [
      {"name": "Python", "category": "Programming Languages", "proficiency": "mentioned"},
      {"name": "React", "category": "Web Frameworks", "proficiency": "mentioned"}
    ],
    "soft_skills": [
      {"skill": "Leadership", "context": "Led a team of 5 developers..."}
    ],
    "projects": [
      {
        "title": "E-commerce Platform",
        "description": "Built a full-stack e-commerce application",
        "technologies": ["React", "Node.js", "MongoDB"],
        "role": "Full-stack Developer",
        "key_achievements": ["Implemented payment gateway", "Optimized performance"]
      }
    ],
    "experience_level": "mid",
    "summary": "Experienced full-stack developer with focus on web technologies"
  },
  "keywords": ["python", "react", "leadership", "e-commerce"]
}
```

#### `/api/generate-questions` (POST)
**Input:**
```json
{
  "mode": "resume",
  "difficulty": "intermediate",
  "filename": "unique_filename.pdf",
  "analysis": { /* analysis object from upload-resume */ }
}
```

**Output:**
```json
{
  "session_id": 123,
  "questions": {
    "technical_questions": [
      "How would you optimize React component re-renders in a large application?",
      "Explain how you would implement authentication in a Node.js API.",
      "Describe your experience with state management in React.",
      "What's your approach to handling asynchronous operations in Python?",
      "How would you design a scalable MongoDB schema for an e-commerce platform?"
    ],
    "hr_questions": [
      "Tell me about a time when you demonstrated leadership in a technical project.",
      "Describe a challenging situation you faced and how you overcame it.",
      "How do you handle feedback from team members?",
      "What motivates you in your professional development?"
    ],
    "project_questions": [
      "In your E-commerce Platform project, what were the main technical challenges?",
      "How did you handle the payment gateway integration?",
      "What would you do differently if you rebuilt this project today?"
    ]
  }
}
```

## Database Schema Updates

### New Fields in `InterviewSession` Model:

```python
resume_filename = db.Column(db.String(255))      # Original filename
technical_skills = db.Column(db.Text)            # JSON array
soft_skills = db.Column(db.Text)                 # JSON array
projects = db.Column(db.Text)                    # JSON array
experience_level = db.Column(db.String(20))      # 'entry', 'mid', 'senior'
resume_summary = db.Column(db.Text)              # AI summary
```

## Skill Detection Coverage

### Technical Skills (100+ technologies)
- **Programming**: Python, Java, JavaScript, TypeScript, C++, Go, Rust, etc.
- **Web Frameworks**: React, Angular, Vue, Django, Flask, Spring, Express, etc.
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, etc.
- **Cloud/DevOps**: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, etc.
- **Data/AI**: TensorFlow, PyTorch, Pandas, Scikit-learn, NLP, etc.
- **Tools**: Git, JIRA, Agile, Scrum, CI/CD, Microservices, etc.

### Soft Skills (20+ competencies)
Leadership, Teamwork, Communication, Problem Solving, Critical Thinking, Creativity, Adaptability, Time Management, Collaboration, Analytical Skills, etc.

## Workflow Example

### User Journey:
1. **Login** via Google OAuth
2. **Select Mode**: Choose "Resume-Based Interview"
3. **Upload Resume**: Select PDF file
4. **Analysis** (5-15 seconds):
   - Extract text from PDF
   - Identify technical skills
   - Extract soft skills
   - Parse projects
   - Generate summary
5. **Review Analysis**: See extracted skills and projects
6. **Select Difficulty**: Beginner/Intermediate/Advanced
7. **Generate Questions** (3-8 seconds):
   - 5 technical questions
   - 4 HR questions
   - 3 project questions
8. **Start Interview**: Answer questions via voice/text
9. **Receive Feedback**: Get detailed evaluation

### Backend Flow:
```
Resume Upload
    ↓
PDF Text Extraction (pdfplumber)
    ↓
Pattern Matching (regex) + LLM Analysis (Gemini)
    ↓
Merge & Structure Results
    ↓
Store in Database
    ↓
Return to Frontend
    ↓
User Selects Difficulty
    ↓
Generate Questions (Gemini API)
    ↓
Store Session
    ↓
Interview Begins
```

## API Usage Examples

### Python Client Example:
```python
import requests

# Upload resume
with open('resume.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/upload-resume',
        files={'resume': f},
        headers={'Authorization': 'Bearer YOUR_TOKEN'}
    )
    analysis = response.json()

# Generate questions
response = requests.post(
    'http://localhost:5000/api/generate-questions',
    json={
        'mode': 'resume',
        'difficulty': 'intermediate',
        'filename': analysis['filename'],
        'analysis': analysis['analysis']
    },
    headers={'Authorization': 'Bearer YOUR_TOKEN'}
)
questions = response.json()
```

### JavaScript/Frontend Example:
```javascript
// Upload resume
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

const uploadResponse = await fetch('/api/upload-resume', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
const analysis = await uploadResponse.json();

// Generate questions
const questionsResponse = await fetch('/api/generate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'resume',
    difficulty: 'intermediate',
    filename: analysis.filename,
    analysis: analysis.analysis
  }),
  credentials: 'include'
});
const questions = await questionsResponse.json();
```

## Performance Optimization

### Current Performance:
- Resume analysis: 5-15 seconds
- Question generation: 3-8 seconds
- Total: ~10-25 seconds

### Optimization Strategies:
1. **Caching**: Cache analyzed resumes to avoid re-processing
2. **Parallel Processing**: Run pattern matching and LLM analysis in parallel
3. **Incremental Loading**: Show extracted skills progressively
4. **Background Jobs**: Use Celery/Redis for async processing
5. **Model Selection**: Use smaller spaCy models for faster NLP

## Error Handling

### Graceful Degradation:
1. If LLM fails → Falls back to pattern matching only
2. If pattern matching fails → Falls back to basic keyword extraction
3. If question generation fails → Uses template questions
4. If PDF extraction fails → Tries alternative method (PyPDF2)

### Error Messages:
- User-friendly messages in frontend
- Detailed logs in backend
- Retry mechanisms for API calls

## Security Considerations

1. **File Validation**: Only PDF files accepted
2. **File Size Limit**: 16MB maximum
3. **Filename Security**: Uses `secure_filename()` from werkzeug
4. **Unique Filenames**: Appends user ID and timestamp
5. **Login Required**: All endpoints protected by `@login_required`
6. **Data Privacy**: Resume data stored securely, not shared

## Testing the Feature

### Unit Tests (to be added):
```python
def test_resume_analyzer():
    analyzer = ResumeAnalyzer()
    analysis = analyzer.analyze_resume('test_resume.pdf')
    assert len(analysis.technical_skills) > 0
    assert analysis.experience_level in ['entry', 'mid', 'senior']

def test_question_generator():
    qg = QuestionGenerator(client)
    questions = qg.generate_resume_based_questions(
        technical_skills=[{'name': 'Python'}],
        soft_skills=[{'skill': 'Leadership'}],
        projects=[{'title': 'Test Project'}],
        difficulty='intermediate'
    )
    assert 'technical_questions' in questions
    assert len(questions['technical_questions']) == 5
```

### Manual Testing Checklist:
- [ ] Upload various resume formats
- [ ] Test with resumes of different experience levels
- [ ] Verify skill extraction accuracy
- [ ] Check question relevance
- [ ] Test error handling (invalid files, API failures)
- [ ] Verify database storage
- [ ] Test interview flow end-to-end

## Limitations & Future Work

### Current Limitations:
1. Only supports PDF format
2. English language only
3. No OCR for scanned PDFs
4. Limited to text-based resumes (no complex layouts)

### Planned Enhancements:
1. Support for .docx files
2. OCR for scanned PDFs
3. Multi-language support
4. Resume quality scoring
5. Skill gap analysis
6. Interview difficulty auto-adjustment
7. Real-time feedback during interview
8. Resume comparison feature
9. ATS (Applicant Tracking System) integration

## Contributing

To contribute to this feature:
1. Follow existing code structure
2. Add comprehensive docstrings
3. Include error handling
4. Write unit tests
5. Update documentation

## License & Credits

- Built using Google Gemini AI
- PDF processing with pdfplumber
- NLP capabilities from spaCy
- Framework by LangChain
