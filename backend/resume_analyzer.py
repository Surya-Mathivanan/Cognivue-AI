"""
Resume Analyzer Module
Extracts technical skills, soft skills, and project details from PDF resumes
Uses multiple approaches: pattern matching, NLP, and LLM-based extraction
"""

import os
import re
import json
import logging
from typing import Dict, List, Any
from collections import Counter

import pdfplumber
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TechnicalSkill(BaseModel):
    """Model for technical skills"""
    name: str
    category: str = ""  # programming, framework, database, cloud, etc.
    proficiency: str = "mentioned"  # mentioned, familiar, proficient, expert


class SoftSkill(BaseModel):
    """Model for soft skills"""
    skill: str
    context: str = ""  # Where/how it was mentioned


class Project(BaseModel):
    """Model for project details"""
    title: str
    description: str = ""
    technologies: List[str] = Field(default_factory=list)
    role: str = ""
    key_achievements: List[str] = Field(default_factory=list)


class ResumeAnalysis(BaseModel):
    """Complete resume analysis result"""
    technical_skills: List[Dict[str, str]] = Field(default_factory=list)
    soft_skills: List[Dict[str, str]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    summary: str = ""
    experience_level: str = "entry"  # entry, mid, senior


class ResumeAnalyzer:
    """
    Analyzes resumes using hybrid approach:
    1. Pattern matching for technical skills
    2. NLP for entity recognition
    3. LLM (Gemini) for intelligent extraction
    """
    
    # Comprehensive technical skills database
    TECHNICAL_SKILLS = {
        'programming_languages': [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 
            'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab',
            'perl', 'shell', 'bash', 'powershell', 'dart', 'objective-c'
        ],
        'web_frameworks': [
            'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby',
            'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 
            'spring boot', 'laravel', 'rails', 'asp.net', 'blazor'
        ],
        'mobile': [
            'react native', 'flutter', 'android', 'ios', 'xamarin', 'ionic',
            'swiftui', 'jetpack compose'
        ],
        'databases': [
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'cassandra', 'dynamodb', 'oracle', 'sql server', 'sqlite', 'firebase',
            'mariadb', 'neo4j', 'couchdb'
        ],
        'cloud_devops': [
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab ci',
            'github actions', 'terraform', 'ansible', 'circleci', 'travis ci',
            'heroku', 'netlify', 'vercel', 'cloud functions', 'lambda'
        ],
        'data_ai_ml': [
            'machine learning', 'deep learning', 'data science', 'ai', 
            'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 
            'numpy', 'opencv', 'nlp', 'computer vision', 'data analysis',
            'big data', 'hadoop', 'spark', 'tableau', 'power bi'
        ],
        'tools_technologies': [
            'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
            'agile', 'scrum', 'kanban', 'ci/cd', 'microservices', 'rest api',
            'graphql', 'websocket', 'oauth', 'jwt', 'unit testing', 'jest',
            'pytest', 'junit', 'selenium', 'cypress'
        ],
        'frontend': [
            'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'bootstrap',
            'tailwind', 'material ui', 'styled components', 'webpack', 'vite',
            'babel', 'responsive design', 'ui/ux'
        ]
    }
    
    # Soft skills to look for
    SOFT_SKILLS = [
        'leadership', 'teamwork', 'communication', 'problem solving',
        'critical thinking', 'creativity', 'adaptability', 'time management',
        'collaboration', 'presentation', 'analytical', 'detail-oriented',
        'initiative', 'mentoring', 'conflict resolution', 'negotiation',
        'project management', 'stakeholder management', 'agile mindset',
        'customer focus', 'innovation', 'strategic thinking'
    ]
    
    # Project keywords
    PROJECT_KEYWORDS = [
        'project', 'developed', 'built', 'created', 'implemented', 'designed',
        'architected', 'led', 'managed', 'contributed', 'worked on'
    ]
    
    def __init__(self, gemini_api_key: str = None):
        """Initialize the analyzer with Gemini API"""
        api_key = gemini_api_key or os.environ.get("GEMINI_API_KEY", "")
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None
            logger.warning("No Gemini API key provided. LLM-based extraction disabled.")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF using pdfplumber (more robust than PyPDF2)"""
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF text with pdfplumber: {e}")
            # Fallback to PyPDF2
            try:
                import PyPDF2
                text = ""
                with open(pdf_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        text += page.extract_text() + "\n"
                return text.strip()
            except Exception as e2:
                logger.error(f"Error with PyPDF2 fallback: {e2}")
                return ""
    
    def extract_technical_skills(self, text: str) -> List[Dict[str, str]]:
        """Extract technical skills using pattern matching"""
        text_lower = text.lower()
        found_skills = []
        
        # Search for skills from each category
        for category, skills in self.TECHNICAL_SKILLS.items():
            for skill in skills:
                # Use word boundaries for accurate matching
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower, re.IGNORECASE):
                    found_skills.append({
                        'name': skill,
                        'category': category.replace('_', ' ').title(),
                        'proficiency': 'mentioned'
                    })
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        for skill in found_skills:
            if skill['name'] not in seen:
                seen.add(skill['name'])
                unique_skills.append(skill)
        
        return unique_skills
    
    def extract_soft_skills(self, text: str) -> List[Dict[str, str]]:
        """Extract soft skills using pattern matching"""
        text_lower = text.lower()
        found_soft_skills = []
        
        for skill in self.SOFT_SKILLS:
            pattern = r'\b' + re.escape(skill) + r'\b'
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            
            for match in matches:
                # Get context (50 chars before and after)
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 50)
                context = text[start:end].strip()
                
                found_soft_skills.append({
                    'skill': skill.title(),
                    'context': context
                })
                break  # Only one instance per skill
        
        return found_soft_skills
    
    def extract_projects_basic(self, text: str) -> List[Dict[str, Any]]:
        """Extract projects using basic pattern matching"""
        projects = []
        lines = text.split('\n')
        
        current_project = None
        in_project_section = False
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            # Detect project section headers
            if re.search(r'\bprojects?\b', line_lower) and len(line.strip()) < 50:
                in_project_section = True
                continue
            
            # Exit project section if we hit another section
            if in_project_section and re.search(r'\b(education|experience|skills|certifications?|awards?)\b', line_lower):
                if current_project:
                    projects.append(current_project)
                break
            
            # Look for project titles (usually bold, capitalized, or have bullet points)
            if in_project_section or any(keyword in line_lower for keyword in ['developed', 'built', 'created', 'project:']):
                # Potential project title
                if len(line.strip()) > 10 and len(line.strip()) < 100:
                    if current_project:
                        projects.append(current_project)
                    
                    current_project = {
                        'title': line.strip(),
                        'description': '',
                        'technologies': [],
                        'role': '',
                        'key_achievements': []
                    }
                elif current_project:
                    # Add to description
                    current_project['description'] += ' ' + line.strip()
        
        if current_project:
            projects.append(current_project)
        
        # Extract technologies from each project description
        for project in projects:
            desc_lower = project['description'].lower()
            techs = []
            for category, skills in self.TECHNICAL_SKILLS.items():
                for skill in skills:
                    if skill in desc_lower:
                        techs.append(skill)
            project['technologies'] = list(set(techs))[:5]  # Limit to 5
        
        return projects[:5]  # Return max 5 projects
    
    def llm_extract_resume_details(self, text: str) -> Dict[str, Any]:
        """Use Gemini LLM to intelligently extract resume details"""
        if not self.client:
            logger.warning("LLM extraction skipped - no API key")
            return {}
        
        try:
            prompt = f"""You are an expert resume analyzer. Analyze the following resume text and extract detailed information.

Resume Text:
{text[:4000]}  # Limit to 4000 chars for API efficiency

Extract and return a JSON object with the following structure:
{{
    "technical_skills": [
        {{"name": "skill_name", "category": "programming/framework/database/cloud/etc", "proficiency": "mentioned/familiar/proficient/expert"}}
    ],
    "soft_skills": [
        {{"skill": "soft_skill_name", "context": "brief context where mentioned"}}
    ],
    "projects": [
        {{
            "title": "project title",
            "description": "brief description",
            "technologies": ["tech1", "tech2"],
            "role": "role in project",
            "key_achievements": ["achievement1", "achievement2"]
        }}
    ],
    "summary": "brief professional summary",
    "experience_level": "entry/mid/senior"
}}

Focus on:
1. Technical skills with their categories
2. Soft skills mentioned in context
3. Projects with detailed information
4. Overall experience level based on years and complexity

Be thorough but concise. Return ONLY valid JSON."""

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            
            if response.text:
                result = json.loads(response.text)
                return result
            
        except Exception as e:
            logger.error(f"LLM extraction error: {e}")
        
        return {}
    
    def analyze_resume(self, pdf_path: str) -> ResumeAnalysis:
        """
        Complete resume analysis using hybrid approach
        Combines pattern matching + LLM extraction
        """
        logger.info(f"Analyzing resume: {pdf_path}")
        
        # Extract text
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            logger.error("Failed to extract text from resume")
            return ResumeAnalysis()
        
        logger.info(f"Extracted {len(text)} characters from resume")
        
        # Pattern-based extraction (fast, reliable)
        technical_skills = self.extract_technical_skills(text)
        soft_skills = self.extract_soft_skills(text)
        projects_basic = self.extract_projects_basic(text)
        
        logger.info(f"Pattern matching found: {len(technical_skills)} tech skills, "
                   f"{len(soft_skills)} soft skills, {len(projects_basic)} projects")
        
        # LLM-based extraction (intelligent, context-aware)
        llm_result = self.llm_extract_resume_details(text)
        
        # Merge results: prefer LLM for projects, combine skills
        final_technical_skills = technical_skills  # Start with pattern matching
        final_soft_skills = soft_skills
        final_projects = projects_basic
        
        if llm_result:
            # Add LLM-found skills not in pattern matching
            llm_tech_names = {s.get('name', '').lower() for s in llm_result.get('technical_skills', [])}
            pattern_tech_names = {s['name'].lower() for s in technical_skills}
            
            for llm_skill in llm_result.get('technical_skills', []):
                if llm_skill.get('name', '').lower() not in pattern_tech_names:
                    final_technical_skills.append(llm_skill)
            
            # Prefer LLM projects if available (more detailed)
            if llm_result.get('projects'):
                final_projects = llm_result['projects']
            
            # Add LLM soft skills
            for llm_soft in llm_result.get('soft_skills', []):
                if not any(s['skill'].lower() == llm_soft.get('skill', '').lower() for s in soft_skills):
                    final_soft_skills.append(llm_soft)
        
        # Determine experience level
        experience_level = llm_result.get('experience_level', 'entry')
        if not experience_level or experience_level not in ['entry', 'mid', 'senior']:
            # Fallback heuristic
            if len(final_projects) >= 4 or len(final_technical_skills) >= 15:
                experience_level = 'senior'
            elif len(final_projects) >= 2 or len(final_technical_skills) >= 8:
                experience_level = 'mid'
            else:
                experience_level = 'entry'
        
        summary = llm_result.get('summary', '') or f"Candidate with {len(final_technical_skills)} technical skills and {len(final_projects)} projects"
        
        result = ResumeAnalysis(
            technical_skills=final_technical_skills[:20],  # Limit to top 20
            soft_skills=final_soft_skills[:10],
            projects=final_projects[:5],
            summary=summary,
            experience_level=experience_level
        )
        
        logger.info(f"Final analysis: {len(result.technical_skills)} tech skills, "
                   f"{len(result.soft_skills)} soft skills, {len(result.projects)} projects")
        
        return result
    
    def generate_keywords_from_analysis(self, analysis: ResumeAnalysis) -> List[str]:
        """Generate keyword list for backward compatibility"""
        keywords = []
        
        # Add top technical skills
        keywords.extend([s['name'] for s in analysis.technical_skills[:10]])
        
        # Add project titles
        keywords.extend([p['title'][:30] for p in analysis.projects[:3]])
        
        # Add key soft skills
        keywords.extend([s['skill'] for s in analysis.soft_skills[:5]])
        
        return keywords


# Convenience function for backward compatibility
def analyze_resume_file(pdf_path: str, gemini_api_key: str = None) -> Dict[str, Any]:
    """
    Analyze a resume file and return detailed results
    
    Returns:
        Dict with keys: technical_skills, soft_skills, projects, summary, experience_level, keywords
    """
    analyzer = ResumeAnalyzer(gemini_api_key)
    analysis = analyzer.analyze_resume(pdf_path)
    
    return {
        'technical_skills': analysis.technical_skills,
        'soft_skills': analysis.soft_skills,
        'projects': analysis.projects,
        'summary': analysis.summary,
        'experience_level': analysis.experience_level,
        'keywords': analyzer.generate_keywords_from_analysis(analysis)
    }


if __name__ == "__main__":
    # Test the analyzer
    import sys
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        result = analyze_resume_file(pdf_path)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python resume_analyzer.py <path_to_resume.pdf>")
