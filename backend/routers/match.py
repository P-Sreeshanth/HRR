"""Resume-JD matching endpoints."""
from fastapi import APIRouter, HTTPException
from typing import List
import time

from services.scorer import scorer
from services.vector_store import vector_store
from models.schemas import MatchRequest, MatchResponse, MatchResult

router = APIRouter(prefix="/api/match", tags=["Match"])


@router.post("/{job_id}", response_model=MatchResponse)
async def match_resumes_to_job(job_id: str, top_k: int = 10):
    """
    Match all resumes against a job description.
    
    Returns ranked list of candidates with:
    - Hybrid score (40% vector + 60% LLM)
    - Skill match breakdown
    - LLM reasoning
    """
    start_time = time.time()
    
    # Verify job exists
    job_data = vector_store.get_job(job_id)
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    try:
        # Get ranked candidates
        results = scorer.rank_candidates(job_id=job_id, top_k=top_k)
        
        # Get total resume count
        all_resumes = vector_store.get_all_resumes()
        total_candidates = len(all_resumes)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return MatchResponse(
            job_id=job_id,
            job_title=job_data["metadata"].get("title", ""),
            total_candidates=total_candidates,
            results=results,
            processing_time_ms=round(processing_time, 2)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching resumes: {str(e)}")


@router.get("/{job_id}/results", response_model=List[MatchResult])
async def get_match_results(job_id: str, top_k: int = 10):
    """
    Get cached match results for a job (re-runs matching if not cached).
    """
    # Verify job exists
    job_data = vector_store.get_job(job_id)
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    try:
        results = scorer.rank_candidates(job_id=job_id, top_k=top_k)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting results: {str(e)}")
