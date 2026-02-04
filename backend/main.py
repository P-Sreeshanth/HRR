"""MatchFlow AI - FastAPI Application Entry Point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import resume, job, match, export
from services.vector_store import vector_store
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    # Initialize Qdrant collections
    print("🚀 Initializing MatchFlow AI 2026...")
    print(f"   - Qdrant: {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")
    print(f"   - Groq Model: {settings.GROQ_MODEL}")
    print(f"   - Embedding Model: {settings.EMBEDDING_MODEL}")
    
    try:
        vector_store.initialize_collections()
        print("✅ Qdrant collections initialized")
    except Exception as e:
        print(f"⚠️  Qdrant initialization failed: {e}")
        print("   Make sure Qdrant is running: docker run -p 6333:6333 qdrant/qdrant")
    
    yield
    
    print("👋 Shutting down MatchFlow AI...")


# Create FastAPI app
app = FastAPI(
    title="MatchFlow AI",
    description="Production-grade Resume-JD Matching System using Groq LLM, LangChain, and Qdrant",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router)
app.include_router(job.router)
app.include_router(match.router)
app.include_router(export.router)


@app.get("/")
async def root():
    """Health check and API info."""
    return {
        "name": "MatchFlow AI",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "resume_upload": "POST /api/resume/upload",
            "resume_list": "GET /api/resume/list",
            "job_create": "POST /api/job/create",
            "match": "POST /api/match/{job_id}",
            "docs": "GET /docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    # Check Qdrant connection
    qdrant_status = "unknown"
    try:
        vector_store.client.get_collections()
        qdrant_status = "connected"
    except Exception:
        qdrant_status = "disconnected"
    
    # Check Groq API key
    groq_status = "configured" if settings.GROQ_API_KEY else "missing"
    
    return {
        "status": "healthy" if qdrant_status == "connected" and groq_status == "configured" else "degraded",
        "services": {
            "qdrant": qdrant_status,
            "groq_api": groq_status
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
