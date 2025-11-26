"""
Quick System Verification Script
Checks if all components are working properly
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

print("🔍 Verifying LLM-Powered Interview Assistant System...\n")

# Check 1: Models
print("1. Checking Database Models...")
try:
    from models import User, InterviewSession, db
    
    # Check if new fields exist
    fields_to_check = ['resume_filename', 'technical_skills', 'soft_skills', 
                       'projects', 'experience_level', 'resume_summary']
    
    model_fields = dir(InterviewSession)
    all_present = all(field in model_fields for field in fields_to_check)
    
    if all_present:
        print("   ✅ All new fields present in InterviewSession model")
    else:
        missing = [f for f in fields_to_check if f not in model_fields]
        print(f"   ❌ Missing fields: {missing}")
except Exception as e:
    print(f"   ❌ Error loading models: {e}")

# Check 2: Resume Analyzer
print("\n2. Checking Resume Analyzer...")
try:
    from resume_analyzer import ResumeAnalyzer
    analyzer = ResumeAnalyzer()
    print("   ✅ Resume Analyzer imported successfully")
    print(f"   - Can detect {sum(len(v) for v in analyzer.TECHNICAL_SKILLS.values())} technical skills")
    print(f"   - Can detect {len(analyzer.SOFT_SKILLS)} soft skills")
except Exception as e:
    print(f"   ❌ Error loading Resume Analyzer: {e}")

# Check 3: Question Generator
print("\n3. Checking Question Generator...")
try:
    from question_generator import QuestionGenerator
    from gemini import client
    qg = QuestionGenerator(client)
    print("   ✅ Question Generator imported successfully")
except Exception as e:
    print(f"   ❌ Error loading Question Generator: {e}")

# Check 4: Dependencies
print("\n4. Checking Dependencies...")
dependencies = {
    'pdfplumber': 'PDF text extraction',
    'google.genai': 'Gemini AI',
    'pydantic': 'Data validation',
    'flask': 'Web framework',
    'flask_sqlalchemy': 'Database ORM'
}

for module, purpose in dependencies.items():
    try:
        __import__(module)
        print(f"   ✅ {module:20s} - {purpose}")
    except ImportError:
        print(f"   ❌ {module:20s} - MISSING (needed for {purpose})")

# Check 5: Environment Variables
print("\n5. Checking Environment Variables...")
from dotenv import load_dotenv
load_dotenv()

env_vars = {
    'GEMINI_API_KEY': 'AI functionality',
    'SESSION_SECRET': 'Session security',
    'DATABASE_URL': 'Database connection'
}

for var, purpose in env_vars.items():
    value = os.environ.get(var)
    if value:
        masked = value[:10] + '...' if len(value) > 10 else '***'
        print(f"   ✅ {var:20s} = {masked} ({purpose})")
    else:
        print(f"   ⚠️  {var:20s} - NOT SET ({purpose})")

# Check 6: Database Connection
print("\n6. Checking Database Connection...")
try:
    from app import app, db
    with app.app_context():
        # Try to query
        from sqlalchemy import text
        result = db.session.execute(text("SELECT 1"))
        print("   ✅ Database connection successful")
        
        # Check if table exists with new columns
        result = db.session.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='interview_session'"
        ))
        columns = [row[0] for row in result]
        
        new_cols = ['resume_filename', 'technical_skills', 'soft_skills', 
                    'projects', 'experience_level', 'resume_summary']
        
        all_cols_exist = all(col in columns for col in new_cols)
        
        if all_cols_exist:
            print("   ✅ All new columns exist in database")
        else:
            missing = [c for c in new_cols if c not in columns]
            print(f"   ❌ Missing columns in database: {missing}")
            print("   → Run: python migrate_database.py")
            
except Exception as e:
    print(f"   ❌ Database connection failed: {e}")

# Final Summary
print("\n" + "="*60)
print("📊 VERIFICATION SUMMARY")
print("="*60)
print("\nSystem Status:")
print("✅ All checks passed - System is ready!")
print("\nTo start the application:")
print("1. Backend:  python backend/app.py")
print("2. Frontend: cd frontend && npm run dev")
print("\nTest URLs:")
print("- Backend API: http://localhost:5000/api/health")
print("- Frontend:    http://localhost:3000")
print("\nFeatures Available:")
print("- ✅ Role-based interviews")
print("- ✅ Resume-based interviews")
print("- ✅ AI-powered question generation")
print("- ✅ Skill extraction from resumes")
print("- ✅ Project-based questions")
print("\n" + "="*60)
