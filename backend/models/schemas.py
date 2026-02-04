"""Pydantic schemas for API request/response models."""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class MatchStatus(str, Enum):
    """Status of a match operation."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


# ============ Resume Models ============

class ResumeBase(BaseModel):
    """Base resume data."""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None


class ResumeCreate(ResumeBase):
    """Resume creation - file upload handled separately."""
    pass


class ResumeResponse(ResumeBase):
    """Resume response with extracted data."""
    id: str
    skills: List[str] = []
    experience_years: Optional[float] = None
    education: Optional[str] = None
    raw_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


# ============ Job Description Models ============

class JobCreate(BaseModel):
    """Job description creation."""
    title: str
    company: Optional[str] = None
    description: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    min_experience_years: Optional[float] = None
    education_requirement: Optional[str] = None


class JobResponse(JobCreate):
    """Job response with ID."""
    id: str
    created_at: datetime = Field(default_factory=datetime.now)


# ============ Match Models ============

class SkillProficiency(str, Enum):
    """Skill proficiency levels."""
    EXPERT = "Expert"
    ADVANCED = "Advanced"
    INTERMEDIATE = "Intermediate"
    BEGINNER = "Beginner"


class SkillDetail(BaseModel):
    """Detailed skill with proficiency level."""
    name: str
    category: str  # technical, soft, tool, certification
    proficiency: SkillProficiency


class SkillMatch(BaseModel):
    """Individual skill match details."""
    skill: str
    matched: bool
    source: Optional[str] = None  # Where in resume it was found
    proficiency: Optional[str] = None


class RedFlag(BaseModel):
    """A single red flag detected in candidate profile."""
    type: str  # employment_gap, job_hopping, missing_skills, overqualified, education_mismatch
    severity: str  # low, medium, high
    message: str
    details: Optional[str] = None


class RedFlagsResult(BaseModel):
    """Red flags analysis result."""
    flags: List[RedFlag] = []
    risk_level: str = "low"  # low, medium, high
    flag_count: int = 0
    summary: str = "No significant concerns detected"


class MatchScore(BaseModel):
    """Detailed match scoring breakdown."""
    vector_score: float = Field(ge=0, le=100, description="Semantic similarity score")
    llm_score: float = Field(ge=0, le=100, description="LLM analysis score")
    final_score: float = Field(ge=0, le=100, description="Weighted final score")
    
    # Score breakdown
    skills_score: float = Field(ge=0, le=40, description="Skills match points")
    experience_score: float = Field(ge=0, le=30, description="Experience relevance points")
    education_score: float = Field(ge=0, le=15, description="Education fit points")
    project_score: float = Field(ge=0, le=15, description="Project quality points")


class MatchResult(BaseModel):
    """Single candidate match result."""
    resume_id: str
    candidate_name: str
    score: MatchScore
    skill_matches: List[SkillMatch] = []
    reasoning: str  # LLM explanation
    rank: int


class MatchRequest(BaseModel):
    """Request to match resumes against a job."""
    job_id: str
    top_k: int = Field(default=10, ge=1, le=100)


class MatchResponse(BaseModel):
    """Match operation response."""
    job_id: str
    job_title: str
    total_candidates: int
    results: List[MatchResult]
    processing_time_ms: float
    status: MatchStatus = MatchStatus.COMPLETED
