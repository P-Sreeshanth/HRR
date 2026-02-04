"""Resume upload and management endpoints."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from datetime import datetime

from services.pdf_parser import pdf_parser
from services.embeddings import embedding_service
from services.vector_store import vector_store
from services.llm_chain import llm_chain
from models.schemas import ResumeResponse

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and process a PDF resume.
    
    - Extracts text from PDF
    - Parses structured data using LLM
    - Generates embedding
    - Stores in Qdrant vector database
    """
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Read PDF content
        pdf_bytes = await file.read()
        
        # Extract text
        raw_text = pdf_parser.extract_text(pdf_bytes)
        if not raw_text or len(raw_text) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Extract contact info
        contact_info = pdf_parser.extract_contact_info(raw_text)
        
        # Parse resume using LLM
        parsed_data = llm_chain.parse_resume(raw_text)
        
        # Generate embedding
        embedding = embedding_service.embed_text(raw_text)
        
        # Generate unique ID
        resume_id = str(uuid.uuid4())
        
        # Build metadata
        metadata = {
            "name": parsed_data.get("name", "Unknown"),
            "email": contact_info.get("email") or parsed_data.get("email"),
            "phone": contact_info.get("phone") or parsed_data.get("phone"),
            "skills": parsed_data.get("skills", []),
            "experience_years": parsed_data.get("experience_years"),
            "education": parsed_data.get("education"),
            "raw_text": raw_text,
            "filename": file.filename,
            "created_at": datetime.now().isoformat()
        }
        
        # Store in Qdrant
        vector_store.add_resume(
            resume_id=resume_id,
            embedding=embedding,
            metadata=metadata
        )
        
        return ResumeResponse(
            id=resume_id,
            name=metadata["name"],
            email=metadata["email"],
            phone=metadata["phone"],
            skills=metadata["skills"],
            experience_years=metadata["experience_years"],
            education=metadata["education"],
            raw_text=raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")


@router.get("/list", response_model=List[ResumeResponse])
async def list_resumes():
    """Get all uploaded resumes."""
    try:
        resumes = vector_store.get_all_resumes()
        
        return [
            ResumeResponse(
                id=r["id"],
                name=r["metadata"].get("name", "Unknown"),
                email=r["metadata"].get("email"),
                phone=r["metadata"].get("phone"),
                skills=r["metadata"].get("skills", []),
                experience_years=r["metadata"].get("experience_years"),
                education=r["metadata"].get("education")
            )
            for r in resumes
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing resumes: {str(e)}")


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: str):
    """Get a specific resume by ID."""
    result = vector_store.get_resume(resume_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    metadata = result["metadata"]
    return ResumeResponse(
        id=result["id"],
        name=metadata.get("name", "Unknown"),
        email=metadata.get("email"),
        phone=metadata.get("phone"),
        skills=metadata.get("skills", []),
        experience_years=metadata.get("experience_years"),
        education=metadata.get("education"),
        raw_text=metadata.get("raw_text")
    )


@router.delete("/{resume_id}")
async def delete_resume(resume_id: str):
    """Delete a resume by ID."""
    success = vector_store.delete_resume(resume_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {"message": "Resume deleted successfully", "id": resume_id}
