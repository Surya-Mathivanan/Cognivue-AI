# Installation Guide for Resume-Based Interview Feature

This guide will help you install and configure the new resume analysis feature.

## New Dependencies

The following packages have been added:
- **pdfplumber**: Advanced PDF text extraction
- **spacy**: Natural Language Processing
- **langchain**: LLM orchestration framework
- **langchain-google-genai**: Google Gemini integration for LangChain

## Installation Steps

### 1. Install Python Dependencies

Run one of the following commands based on your setup:

**Using pip:**
```bash
pip install -r requirements.txt
```

**Using uv (recommended for this project):**
```bash
uv sync
```

### 2. Download spaCy Language Model (Optional but Recommended)

The resume analyzer can work without spaCy models, but having one improves accuracy:

```bash
python -m spacy download en_core_web_sm
```

For better performance, you can use a larger model:
```bash
python -m spacy download en_core_web_md
```

**Note:** If you skip this step, the analyzer will still work using pattern matching and LLM extraction.

### 3. Verify Installation

Test the resume analyzer module:

```bash
python backend/resume_analyzer.py path/to/sample/resume.pdf
```

This should output JSON with extracted skills, projects, and summary.

## Environment Variables

Ensure your `.env` file contains:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_session_secret
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
DATABASE_URL=sqlite:///interview_assistant.db
```

## Database Migration

Since the database model has been updated with new fields, you need to recreate the database:

**Option 1: Fresh Start (Development)**
```bash
# Delete the old database
rm instance/interview_assistant.db

# Run the application - database will be recreated automatically
python backend/app.py
```

**Option 2: Keep Existing Data (Manual Migration)**

If you want to preserve existing data, you'll need to manually add the new columns to your database:

```sql
ALTER TABLE interview_session ADD COLUMN resume_filename VARCHAR(255);
ALTER TABLE interview_session ADD COLUMN technical_skills TEXT;
ALTER TABLE interview_session ADD COLUMN soft_skills TEXT;
ALTER TABLE interview_session ADD COLUMN projects TEXT;
ALTER TABLE interview_session ADD COLUMN experience_level VARCHAR(20);
ALTER TABLE interview_session ADD COLUMN resume_summary TEXT;
```

## Running the Application

1. **Start Backend:**
   ```bash
   python backend/app.py
   ```

2. **Start Frontend (in separate terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Testing the Feature

1. Log in using Google OAuth
2. Select "Resume-Based Interview"
3. Upload a PDF resume
4. Wait for analysis to complete (you'll see extracted skills and projects)
5. Select difficulty level
6. Start the interview - questions will be based on your resume!

## Troubleshooting

### Issue: pdfplumber installation fails
**Solution:** Install system dependencies
- Windows: Usually works out of the box
- Linux: `sudo apt-get install python3-dev`
- Mac: `brew install python`

### Issue: spaCy model download fails
**Solution:** The analyzer works without spaCy models. Pattern matching and LLM extraction will still function.

### Issue: "No module named 'resume_analyzer'"
**Solution:** Make sure you're running from the project root directory and Python can find the backend folder.

### Issue: Resume analysis takes too long
**Solution:** This is normal for the first analysis as the LLM processes the resume. Subsequent analyses are faster. You can also:
- Reduce the amount of text sent to LLM (already limited to 4000 chars)
- Use pattern matching only by commenting out LLM extraction

### Issue: Database error after update
**Solution:** Recreate the database as described in the Database Migration section.

## Feature Architecture

The resume-based interview system consists of three main components:

1. **Resume Analyzer** (`backend/resume_analyzer.py`)
   - Extracts technical skills using pattern matching
   - Identifies soft skills from resume text
   - Extracts project information with technologies used
   - Uses Gemini AI for intelligent parsing

2. **Question Generator** (`backend/question_generator.py`)
   - Generates technical questions based on extracted skills
   - Creates HR questions based on soft skills
   - Produces project-specific questions

3. **Enhanced API Endpoints** (`backend/app.py`)
   - `/api/upload-resume`: Analyzes resume and returns structured data
   - `/api/generate-questions`: Creates targeted questions based on analysis

## Performance Notes

- **Resume Upload & Analysis**: 5-15 seconds depending on resume complexity
- **Question Generation**: 3-8 seconds for all three question types
- **Total Setup Time**: ~10-25 seconds from upload to interview start

The system uses local pattern matching for speed and LLM APIs for accuracy, providing a balanced approach.

## Future Enhancements

Potential improvements you can add:
- Cache resume analyses to avoid re-processing
- Add support for Word documents (.docx)
- Fine-tune skill extraction patterns
- Add real-time progress indicators during analysis
- Implement resume similarity scoring
