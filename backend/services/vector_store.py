"""In-Memory Vector Store Service (No Qdrant required)."""
from typing import List, Dict, Optional, Any
import numpy as np
from config import settings


class InMemoryVectorStore:
    """Simple in-memory vector store for testing without Qdrant."""
    
    def __init__(self):
        self._resumes: Dict[str, Dict] = {}  # id -> {vector, metadata}
        self._jobs: Dict[str, Dict] = {}
        self._initialized = False
        print("📦 Using In-Memory Vector Store (no Qdrant required)")
    
    @property
    def client(self):
        """Dummy client property for compatibility."""
        return self
    
    def get_collections(self):
        """Dummy method for health check compatibility."""
        class Collections:
            collections = []
        return Collections()
    
    def initialize_collections(self):
        """No-op for in-memory store."""
        self._initialized = True
    
    def add_resume(
        self,
        resume_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> str:
        """Add a resume to the store."""
        self._resumes[resume_id] = {
            "vector": embedding,
            "metadata": metadata
        }
        return resume_id
    
    def add_job(
        self,
        job_id: str,
        embedding: List[float],
        metadata: Dict[str, Any]
    ) -> str:
        """Add a job to the store."""
        self._jobs[job_id] = {
            "vector": embedding,
            "metadata": metadata
        }
        return job_id
    
    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        a = np.array(v1)
        b = np.array(v2)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
    
    def search_similar_resumes(
        self,
        query_vector: List[float],
        top_k: int = 10,
        filter_conditions: Optional[Dict] = None
    ) -> List[Dict]:
        """Search for similar resumes using cosine similarity."""
        results = []
        
        for resume_id, data in self._resumes.items():
            score = self._cosine_similarity(query_vector, data["vector"])
            results.append({
                "id": resume_id,
                "score": score,
                "metadata": data["metadata"]
            })
        
        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
    
    def get_resume(self, resume_id: str) -> Optional[Dict]:
        """Get a resume by ID."""
        if resume_id in self._resumes:
            return {
                "id": resume_id,
                "vector": self._resumes[resume_id]["vector"],
                "metadata": self._resumes[resume_id]["metadata"]
            }
        return None
    
    def get_job(self, job_id: str) -> Optional[Dict]:
        """Get a job by ID."""
        if job_id in self._jobs:
            return {
                "id": job_id,
                "vector": self._jobs[job_id]["vector"],
                "metadata": self._jobs[job_id]["metadata"]
            }
        return None
    
    def get_all_resumes(self) -> List[Dict]:
        """Get all resumes."""
        return [
            {
                "id": rid,
                "vector": data["vector"],
                "metadata": data["metadata"]
            }
            for rid, data in self._resumes.items()
        ]
    
    def delete_resume(self, resume_id: str) -> bool:
        """Delete a resume."""
        if resume_id in self._resumes:
            del self._resumes[resume_id]
            return True
        return False


# Singleton instance
vector_store = InMemoryVectorStore()
