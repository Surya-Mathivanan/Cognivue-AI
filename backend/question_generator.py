"""
Question Generator Module
Generates targeted interview questions based on resume analysis
Separates questions into: Technical Skills, HR/Soft Skills, and Project-based
"""

import json
import time
import logging
from typing import Dict, List, Any
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class QuestionGenerator:
    """
    Generates interview questions based on resume analysis
    Creates three types of questions:
    1. Technical questions based on extracted technical skills
    2. HR/Culture fit questions based on soft skills
    3. Project-based questions based on extracted projects
    """
    
    def __init__(self, gemini_client: genai.Client):
        self.client = gemini_client
    
    def generate_resume_based_questions(
        self,
        technical_skills: List[Dict[str, str]],
        soft_skills: List[Dict[str, str]],
        projects: List[Dict[str, Any]],
        difficulty: str = "intermediate"
    ) -> Dict[str, List[str]]:
        """
        Generate comprehensive interview questions based on resume analysis
        
        Args:
            technical_skills: List of technical skills extracted from resume
            soft_skills: List of soft skills extracted from resume
            projects: List of projects extracted from resume
            difficulty: beginner, intermediate, or advanced
        
        Returns:
            Dict with keys: technical_questions, hr_questions, project_questions
        """
        
        # Prepare skill summaries
        tech_skill_names = [s['name'] for s in technical_skills[:15]]  # Top 15
        soft_skill_names = [s['skill'] for s in soft_skills[:8]]  # Top 8
        project_summaries = []
        
        for proj in projects[:5]:  # Max 5 projects
            proj_summary = {
                'title': proj.get('title', 'Unnamed Project'),
                'technologies': proj.get('technologies', [])[:5],
                'description': proj.get('description', '')[:200]  # Limit description
            }
            project_summaries.append(proj_summary)
        
        # Generate three types of questions
        technical_questions = self._generate_technical_questions(
            tech_skill_names, difficulty
        )
        
        hr_questions = self._generate_hr_questions(
            soft_skill_names, difficulty
        )
        
        project_questions = self._generate_project_questions(
            project_summaries, difficulty
        )
        
        return {
            'technical_questions': technical_questions,
            'hr_questions': hr_questions,
            'project_questions': project_questions
        }
    
    def _generate_technical_questions(
        self,
        skills: List[str],
        difficulty: str
    ) -> List[str]:
        """Generate technical questions based on skills - Always uses LLM, no fallbacks"""
        
        # Prepare context based on what's available
        if skills:
            skills_str = ", ".join(skills[:10])
            context = f"The candidate has listed these technical skills: {skills_str}"
        else:
            context = "The candidate has not listed specific technical skills in their resume"
        
        prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview.

{context}

Generate exactly 5 technical interview questions that are:
1. Appropriate for {difficulty} level
2. {'Focused on the specific skills mentioned: ' + skills_str if skills else 'General but insightful technical questions about software development, problem-solving, and engineering practices'}
3. Mix of theoretical understanding and practical application
4. Include at least 2 scenario-based questions
5. Professional and realistic

Return ONLY a JSON array of 5 questions, nothing else:
["question1", "question2", "question3", "question4", "question5"]"""

        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7
                    )
                )
                
                if response.text:
                    questions = json.loads(response.text)
                    if isinstance(questions, list) and len(questions) >= 4:
                        return questions[:5]
            except Exception as e:
                logger.error(f"Error generating technical questions (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
        
        # If LLM fails completely, raise error instead of returning fallback
        raise Exception("Failed to generate technical questions using LLM after retries")
    
    def _generate_hr_questions(
        self,
        soft_skills: List[str],
        difficulty: str
    ) -> List[str]:
        """Generate HR/culture fit questions - Always uses LLM, no fallbacks"""
        
        # Prepare context based on what's available
        if soft_skills:
            soft_skills_str = ", ".join(soft_skills[:8])
            context = f"The candidate has demonstrated these soft skills: {soft_skills_str}"
        else:
            context = "The candidate has not explicitly listed soft skills, but we want to assess their behavioral competencies"
        
        prompt = f"""You are an expert HR interviewer conducting a {difficulty} level interview.

{context}

Generate exactly 4 behavioral/HR interview questions that:
1. Assess communication, teamwork, and professional growth
2. Include at least 2 STAR method questions (Situation, Task, Action, Result)
3. {'Focus on evaluating the mentioned soft skills: ' + soft_skills_str if soft_skills else 'Assess general professional skills like problem-solving, adaptability, teamwork, and communication'}
4. Are appropriate for {difficulty} level candidates
5. Focus on real-world scenarios

Return ONLY a JSON array of 4 questions, nothing else:
["question1", "question2", "question3", "question4"]"""

        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7
                    )
                )
                
                if response.text:
                    questions = json.loads(response.text)
                    if isinstance(questions, list) and len(questions) >= 3:
                        return questions[:4]
            except Exception as e:
                logger.error(f"Error generating HR questions (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
        
        # If LLM fails completely, raise error instead of returning fallback
        raise Exception("Failed to generate HR questions using LLM after retries")
    
    def _generate_project_questions(
        self,
        projects: List[Dict[str, Any]],
        difficulty: str
    ) -> List[str]:
        """Generate project-based questions - Always uses LLM, no fallbacks"""
        
        # Prepare context based on what's available
        if projects:
            projects_str = json.dumps(projects, indent=2)
            context = f"The candidate has listed these projects:\n{projects_str}"
        else:
            context = "The candidate has not listed specific projects in their resume"
        
        prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview.

{context}

Generate exactly 3 project-based interview questions that:
1. {'Ask specific questions about the listed projects, their technologies, and challenges' if projects else 'Ask about general project experience, teamwork, and software development lifecycle'}
2. Focus on technical decisions, problem-solving, and learning experiences
3. Probe depth of involvement and understanding
4. Are appropriate for {difficulty} level
5. Are open-ended and encourage detailed responses

Return ONLY a JSON array of 3 questions, nothing else:
["question1", "question2", "question3"]"""

        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.7
                    )
                )
                
                if response.text:
                    questions = json.loads(response.text)
                    if isinstance(questions, list) and len(questions) >= 2:
                        return questions[:3]
            except Exception as e:
                logger.error(f"Error generating project questions (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
        
        # If LLM fails completely, raise error instead of returning fallback
        raise Exception("Failed to generate project questions using LLM after retries")
    
    def generate_role_based_questions(
        self,
        role: str,
        difficulty: str
    ) -> Dict[str, List[str]]:
        """
        Generate questions for role-based interviews (existing functionality)
        """
        prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview for a {role} position.

Generate a comprehensive set of interview questions specifically tailored for a {role} role in the following categories:
- 3 behavioral/HR questions that assess soft skills and cultural fit for a {role}
- 4 technical questions that test the core competencies required for a {role}
- 3 situational questions that test problem-solving and experience in {role} scenarios

Make questions specific to {role} responsibilities and requirements.
Return the response as a JSON object with exactly these keys:
{{
    "hr_questions": [array of 3 HR/behavioral questions],
    "technical_questions": [array of 4 technical questions],
    "cultural_questions": [array of 3 situational/cultural fit questions]
}}

Ensure all questions are highly relevant to a {role} position."""

        max_retries = 3
        retry_delay = 1

        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )

                if response.text:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        questions_data = json.loads(json_match.group())
                        return questions_data
                    else:
                        logger.error(f"No JSON found in response: {response.text[:200]}")
                        raise ValueError("Invalid response format from LLM")

            except json.JSONDecodeError as je:
                logger.error(f"JSON parse error (attempt {attempt + 1}/{max_retries}): {je}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    break
            except Exception as e:
                error_str = str(e).lower()
                is_retryable = ('503' in error_str or
                              'unavailable' in error_str or
                              'overloaded' in error_str)

                if is_retryable and attempt < max_retries - 1:
                    logger.info(f"Gemini API temporarily unavailable (attempt {attempt + 1}/{max_retries})")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    logger.error(f"Error generating role-based questions: {e}")
                    break

        # Return error if all attempts fail
        return {
            "error": "Unable to generate interview questions at this time.",
            "details": "All retry attempts exhausted"
        }
