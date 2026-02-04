"""Job description management endpoints."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import uuid
from datetime import datetime

from services.embeddings import embedding_service
from services.vector_store import vector_store
from services.pdf_parser import pdf_parser
from models.schemas import JobCreate, JobResponse

router = APIRouter(prefix="/api/job", tags=["Job"])


@router.post("/upload")
async def upload_job_pdf(file: UploadFile = File(...)):
    """
    Upload a JD as PDF and extract text.
    
    Returns the extracted text that can be used to create a job.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse PDF to text
        text = pdf_parser.extract_text(content)
        
        if not text or len(text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        return {
            "filename": file.filename,
            "text": text,
            "char_count": len(text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing JD PDF: {str(e)}")


@router.post("/create", response_model=JobResponse)
async def create_job(job: JobCreate):
    """
    Create a new job description.
    
    - Generates embedding from job description
    - Stores in Qdrant for matching
    """
    try:
        # Generate unique ID
        job_id = str(uuid.uuid4())
        
        # Combine title and description for embedding
        combined_text = f"{job.title}\n\n{job.description}\n\nRequired Skills: {', '.join(job.required_skills)}"
        
        # Generate embedding
        embedding = embedding_service.embed_text(combined_text)
        
        # Build metadata
        metadata = {
            "title": job.title,
            "company": job.company,
            "description": job.description,
            "required_skills": job.required_skills,
            "preferred_skills": job.preferred_skills,
            "min_experience_years": job.min_experience_years,
            "education_requirement": job.education_requirement,
            "created_at": datetime.now().isoformat()
        }
        
        # Store in Qdrant
        vector_store.add_job(
            job_id=job_id,
            embedding=embedding,
            metadata=metadata
        )
        
        return JobResponse(
            id=job_id,
            title=job.title,
            company=job.company,
            description=job.description,
            required_skills=job.required_skills,
            preferred_skills=job.preferred_skills,
            min_experience_years=job.min_experience_years,
            education_requirement=job.education_requirement
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """Get a specific job by ID."""
    result = vector_store.get_job(job_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    
    metadata = result["metadata"]
    return JobResponse(
        id=result["id"],
        title=metadata.get("title", ""),
        company=metadata.get("company"),
        description=metadata.get("description", ""),
        required_skills=metadata.get("required_skills", []),
        preferred_skills=metadata.get("preferred_skills", []),
        min_experience_years=metadata.get("min_experience_years"),
        education_requirement=metadata.get("education_requirement")
    )
