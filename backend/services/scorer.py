"""Hybrid Scoring Engine combining vector similarity and LLM analysis."""
from typing import List, Dict, Any
from config import settings
from services.embeddings import embedding_service
from services.vector_store import vector_store
from services.llm_chain import llm_chain
from models.schemas import MatchScore, MatchResult, SkillMatch


class Scorer:
    """
    Hybrid scoring engine.
    
    Final Score = (VECTOR_WEIGHT * vector_score) + (LLM_WEIGHT * llm_score)
    Default: 40% vector + 60% LLM
    """
    
    def __init__(self):
        self.vector_weight = settings.VECTOR_WEIGHT
        self.llm_weight = settings.LLM_WEIGHT
    
    def calculate_match_score(
        self,
        resume_id: str,
        resume_text: str,
        resume_vector: List[float],
        job_data: Dict[str, Any],
        job_vector: List[float]
    ) -> MatchResult:
        """
        Calculate hybrid match score for a resume-job pair.
        
        Args:
            resume_id: Resume identifier
            resume_text: Full resume text
            resume_vector: Resume embedding
            job_data: Job metadata (title, description, skills, etc.)
            job_vector: Job description embedding
            
        Returns:
            MatchResult with detailed scoring breakdown
        """
        # 1. Calculate vector similarity score (0-100)
        raw_similarity = embedding_service.cosine_similarity(resume_vector, job_vector)
        vector_score = raw_similarity * 100  # Convert to 0-100 scale
        
        # 2. Get LLM analysis score
        llm_analysis = llm_chain.analyze_match(
            resume_text=resume_text,
            job_title=job_data.get("title", ""),
            job_description=job_data.get("description", ""),
            required_skills=job_data.get("required_skills", []),
            preferred_skills=job_data.get("preferred_skills", []),
            min_experience=job_data.get("min_experience_years")
        )
        
        llm_score = llm_analysis.get("total_score", 0)
        
        # 3. Calculate final hybrid score
        final_score = (self.vector_weight * vector_score) + (self.llm_weight * llm_score)
        
        # 4. Build skill matches
        skill_matches = []
        for skill in llm_analysis.get("matched_skills", []):
            skill_matches.append(SkillMatch(
                skill=skill,
                matched=True,
                source="resume"
            ))
        for skill in llm_analysis.get("missing_skills", []):
            skill_matches.append(SkillMatch(
                skill=skill,
                matched=False,
                source=None
            ))
        
        # 5. Build score breakdown
        score = MatchScore(
            vector_score=round(vector_score, 2),
            llm_score=round(llm_score, 2),
            final_score=round(final_score, 2),
            skills_score=llm_analysis.get("skills_score", 0),
            experience_score=llm_analysis.get("experience_score", 0),
            education_score=llm_analysis.get("education_score", 0),
            project_score=llm_analysis.get("project_score", 0)
        )
        
        return MatchResult(
            resume_id=resume_id,
            candidate_name=job_data.get("candidate_name", "Unknown"),
            score=score,
            skill_matches=skill_matches,
            reasoning=llm_analysis.get("reasoning", ""),
            rank=0  # Will be set after sorting
        )
    
    def rank_candidates(
        self,
        job_id: str,
        top_k: int = 10
    ) -> List[MatchResult]:
        """
        Rank all resumes against a job description.
        
        Args:
            job_id: Job description ID
            top_k: Number of top candidates to return
            
        Returns:
            Sorted list of MatchResults (highest score first)
        """
        # Get job data from vector store
        job_data = vector_store.get_job(job_id)
        if not job_data:
            raise ValueError(f"Job not found: {job_id}")
        
        job_vector = job_data["vector"]
        job_metadata = job_data["metadata"]
        
        # Get all resumes
        resumes = vector_store.get_all_resumes()
        
        results = []
        for resume in resumes:
            resume_id = resume["id"]
            resume_vector = resume["vector"]
            resume_metadata = resume["metadata"]
            resume_text = resume_metadata.get("raw_text", "")
            
            # Add candidate name to job data for match result
            job_with_candidate = {
                **job_metadata,
                "candidate_name": resume_metadata.get("name", "Unknown")
            }
            
            match_result = self.calculate_match_score(
                resume_id=resume_id,
                resume_text=resume_text,
                resume_vector=resume_vector,
                job_data=job_with_candidate,
                job_vector=job_vector
            )
            results.append(match_result)
        
        # Sort by final score (descending)
        results.sort(key=lambda x: x.score.final_score, reverse=True)
        
        # Assign ranks and limit to top_k
        for i, result in enumerate(results[:top_k]):
            result.rank = i + 1
        
        return results[:top_k]


# Singleton instance
scorer = Scorer()
