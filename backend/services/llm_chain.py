"""LangChain + Groq LLM Service for resume analysis."""
import json
import re
from typing import Dict, Any, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from config import settings
from models.prompts import (
    SKILL_EXTRACTION_PROMPT,
    RESUME_JD_MATCH_PROMPT,
    RESUME_PARSING_PROMPT
)


class LLMChain:
    """LangChain-based LLM service using Groq API."""
    
    def __init__(self):
        self._llm = None
    
    @property
    def llm(self) -> ChatGroq:
        """Lazy initialization of Groq LLM."""
        if self._llm is None:
            self._llm = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model_name=settings.GROQ_MODEL,
                temperature=settings.TEMPERATURE,
                max_tokens=settings.MAX_TOKENS
            )
        return self._llm
    
    def _extract_json(self, text: str) -> Dict:
        """Extract JSON from LLM response text."""
        # Try to find JSON in the response
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        return {}
    
    def extract_skills(self, resume_text: str) -> Dict[str, Any]:
        """
        Extract skills from resume text.
        
        Returns:
            Dict with technical_skills, soft_skills, tools, certifications
        """
        prompt = ChatPromptTemplate.from_template(SKILL_EXTRACTION_PROMPT)
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({"resume_text": resume_text})
            return self._extract_json(response.content)
        except Exception as e:
            print(f"Skill extraction error: {e}")
            return {
                "technical_skills": [],
                "soft_skills": [],
                "tools": [],
                "certifications": []
            }
    
    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Parse resume to extract structured information.
        
        Returns:
            Dict with name, email, phone, experience_years, education, skills
        """
        prompt = ChatPromptTemplate.from_template(RESUME_PARSING_PROMPT)
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({"resume_text": resume_text})
            return self._extract_json(response.content)
        except Exception as e:
            print(f"Resume parsing error: {e}")
            return {
                "name": "Unknown",
                "email": None,
                "phone": None,
                "experience_years": None,
                "education": None,
                "skills": [],
                "summary": ""
            }
    
    def analyze_match(
        self,
        resume_text: str,
        job_title: str,
        job_description: str,
        required_skills: list,
        preferred_skills: list,
        min_experience: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Analyze resume-JD match using LLM.
        
        Returns:
            Dict with scores (skills, experience, education, project),
            matched_skills, missing_skills, reasoning
        """
        prompt = ChatPromptTemplate.from_template(RESUME_JD_MATCH_PROMPT)
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "resume_text": resume_text,
                "job_title": job_title,
                "job_description": job_description,
                "required_skills": ", ".join(required_skills) if required_skills else "Not specified",
                "preferred_skills": ", ".join(preferred_skills) if preferred_skills else "Not specified",
                "min_experience": min_experience if min_experience else "Not specified"
            })
            
            result = self._extract_json(response.content)
            
            # Ensure all required fields exist with defaults
            return {
                "skills_score": result.get("skills_score", 0),
                "experience_score": result.get("experience_score", 0),
                "education_score": result.get("education_score", 0),
                "project_score": result.get("project_score", 0),
                "total_score": result.get("total_score", 0),
                "matched_skills": result.get("matched_skills", []),
                "missing_skills": result.get("missing_skills", []),
                "reasoning": result.get("reasoning", "Unable to analyze match.")
            }
            
        except Exception as e:
            print(f"Match analysis error: {e}")
            return {
                "skills_score": 0,
                "experience_score": 0,
                "education_score": 0,
                "project_score": 0,
                "total_score": 0,
                "matched_skills": [],
                "missing_skills": required_skills,
                "reasoning": f"Analysis failed: {str(e)}"
            }


# Singleton instance
llm_chain = LLMChain()
