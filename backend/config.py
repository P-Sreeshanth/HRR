"""Configuration settings for MatchFlow AI."""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    GROQ_API_KEY: str = ""
    
    # Qdrant Configuration
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION_RESUMES: str = "resumes"
    QDRANT_COLLECTION_JOBS: str = "jobs"
    
    # Model Configuration
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    
    # Scoring Weights (must sum to 1.0)
    VECTOR_WEIGHT: float = 0.4
    LLM_WEIGHT: float = 0.6
    
    # Performance
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.1
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
