# Quick Start Guide - Resume-Based Interview Feature

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install new Python packages
pip install pdfplumber langchain langchain-google-genai

# OR if using uv (recommended)
uv sync
```

### Step 2: Update Database

Delete the old database to apply new schema:

```bash
# Windows
del instance\interview_assistant.db

# Linux/Mac
rm instance/interview_assistant.db
```

### Step 3: Verify Environment Variables

Make sure your `.env` file has:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Test the Feature

1. Open http://localhost:3000
2. Login with Google
3. Choose "Resume-Based Interview"
4. Upload a PDF resume
5. See the magic! ✨

---

## 📋 What to Expect

### After Uploading Resume:

You'll see extracted data like:

**Technical Skills:**
- Python (Programming Languages)
- React (Web Frameworks)
- MongoDB (Databases)
- Docker (Cloud Devops)

**Soft Skills:**
- Leadership
- Teamwork
- Problem Solving

**Projects:**
- Project Title: "E-commerce Platform"
- Technologies: React, Node.js, MongoDB
- Description: Built a full-stack...

**Experience Level:** Mid

### Interview Questions You'll Get:

**Technical (5 questions):**
- "How would you optimize React component performance?"
- "Explain your experience with MongoDB schema design"
- (All based on YOUR actual skills!)

**HR (4 questions):**
- "Tell me about a time you demonstrated leadership"
- "How do you handle team conflicts?"
- (Based on YOUR soft skills!)

**Project-Based (3 questions):**
- "In your E-commerce Platform, what were the main challenges?"
- "How did you handle authentication?"
- (Based on YOUR actual projects!)

---

## 🔍 Quick Test

Want to test without a full resume? Use this minimal test:

**Create `test_resume.pdf` with this content:**
```
John Doe
Software Developer

Skills: Python, React, Node.js, MongoDB
Leadership, Teamwork

Project: Task Management App
Built using React and Node.js
Implemented user authentication and real-time updates
```

Upload this and see how the system extracts and generates questions!

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found: resume_analyzer"
```bash
# Make sure you're in project root
cd "E:\FINAL YEAR PROJECT\Final_Year_Project"
python backend/app.py
```

### Issue: Database error
```bash
# Delete and recreate database
del instance\interview_assistant.db
python backend/app.py
```

### Issue: Resume analysis takes too long
- Normal for first upload (5-15 seconds)
- Uses AI to deeply analyze your resume
- Worth the wait for personalized questions!

### Issue: Questions not relevant
- Make sure your resume has clear sections
- List skills explicitly
- Include project descriptions
- The more details, the better the questions!

---

## 💡 Pro Tips

1. **Better Resumes = Better Questions**
   - Use clear section headers (Skills, Projects, Experience)
   - List technologies explicitly
   - Include project descriptions

2. **Difficulty Matters**
   - Beginner: Fundamental concepts
   - Intermediate: Practical application
   - Advanced: System design & architecture

3. **Review Before Starting**
   - Check extracted skills are correct
   - Verify projects were detected
   - Confirm experience level matches

4. **Practice Makes Perfect**
   - Upload different resume versions
   - Try different difficulty levels
   - See how questions change!

---

## 📊 Feature Comparison

| Feature | Role-Based (Old) | Resume-Based (New) |
|---------|------------------|-------------------|
| Questions | Generic for role | Personalized for you |
| Technical Skills | Role-specific | Your actual skills |
| Projects | None | Your actual projects |
| Preparation | Study role requirements | Review your own work |
| Feedback | General | Specific to your background |

---

## 🎯 Next Steps

After testing:

1. **Check the Database**
   ```python
   # In Python console
   from backend.models import db, InterviewSession
   from backend.app import app
   
   with app.app_context():
       sessions = InterviewSession.query.all()
       for s in sessions:
           print(f"Session {s.id}: {s.mode}, {s.experience_level}")
   ```

2. **Test the API Directly**
   ```bash
   # Using curl
   curl -X POST http://localhost:5000/api/upload-resume \
     -H "Content-Type: multipart/form-data" \
     -F "resume=@your_resume.pdf"
   ```

3. **Explore the Code**
   - `backend/resume_analyzer.py` - How skills are extracted
   - `backend/question_generator.py` - How questions are created
   - `backend/app.py` - API endpoints

---

## 🎓 Understanding the System

### How It Works (Simple):
```
Your Resume → AI Reads It → Finds Your Skills → Creates Questions → You Answer → Get Feedback
```

### How It Works (Technical):
```
PDF Upload
  ↓
pdfplumber extracts text
  ↓
Pattern Matching finds keywords (fast)
  ↓
Gemini AI understands context (smart)
  ↓
Combines both results (best of both worlds)
  ↓
Stores in database
  ↓
Generates targeted questions
  ↓
Interview begins
```

---

## 📚 More Information

- **Full Documentation**: See `RESUME_FEATURE_DOCUMENTATION.md`
- **Installation Guide**: See `INSTALLATION_GUIDE.md`
- **Original README**: See `Readme.md`

---

## 🆘 Need Help?

1. Check error logs in terminal
2. Verify `.env` file has GEMINI_API_KEY
3. Make sure database was recreated
4. Try with a simple test resume first
5. Check if all dependencies installed correctly

---

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] Database recreated
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Can login with Google
- [ ] Can upload resume
- [ ] See extracted skills
- [ ] Questions generated
- [ ] Can answer questions
- [ ] Receive feedback

**All checked? You're ready to go! 🎉**

---

## 🔮 What's Different?

### Before (Role-Based):
"You're applying for Backend Developer. Here are generic backend questions."

### After (Resume-Based):
"You know Python, Django, and built an API project. Let me ask about YOUR specific experience with REST API design in Django."

**See the difference? It's personal. It's relevant. It's like a real interview! 🎯**
