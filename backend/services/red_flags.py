"""Red Flags Detection Service for HR risk analysis."""
from typing import Dict, List, Any, Optional
from datetime import datetime
import re


class RedFlagsDetector:
    """Detect potential red flags in candidate profiles."""
    
    def __init__(self):
        self.flags = []
    
    def analyze(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze resume for red flags relative to job requirements.
        
        Returns dict with:
            - flags: List of detected issues
            - risk_level: "low", "medium", "high"
            - summary: Brief explanation
        """
        self.flags = []
        
        # Check various red flags
        self._check_experience_gaps(resume_data)
        self._check_job_hopping(resume_data)
        self._check_missing_critical_skills(resume_data, job_data)
        self._check_overqualification(resume_data, job_data)
        self._check_education_mismatch(resume_data, job_data)
        
        # Calculate risk level
        risk_level = self._calculate_risk()
        
        return {
            "flags": self.flags,
            "risk_level": risk_level,
            "flag_count": len(self.flags),
            "summary": self._generate_summary()
        }
    
    def _check_experience_gaps(self, resume_data: Dict):
        """Detect unexplained employment gaps > 6 months."""
        employment_history = resume_data.get("employment_history", [])
        
        if len(employment_history) < 2:
            return
            
        for i in range(len(employment_history) - 1):
            current_end = employment_history[i].get("end_date")
            next_start = employment_history[i + 1].get("start_date")
            
            if current_end and next_start:
                try:
                    gap_months = self._calculate_gap_months(current_end, next_start)
                    if gap_months > 6:
                        self.flags.append({
                            "type": "employment_gap",
                            "severity": "medium" if gap_months < 12 else "high",
                            "message": f"Employment gap of {gap_months} months detected",
                            "details": f"Between {employment_history[i].get('company', 'Unknown')} and {employment_history[i+1].get('company', 'Unknown')}"
                        })
                except:
                    pass
    
    def _check_job_hopping(self, resume_data: Dict):
        """Flag if average tenure is less than 1 year."""
        employment_history = resume_data.get("employment_history", [])
        
        if len(employment_history) < 2:
            return
            
        total_months = 0
        job_count = 0
        
        for job in employment_history:
            duration = job.get("duration_months")
            if duration:
                total_months += duration
                job_count += 1
        
        if job_count >= 2:
            avg_tenure = total_months / job_count
            if avg_tenure < 12:
                self.flags.append({
                    "type": "job_hopping",
                    "severity": "medium",
                    "message": f"Frequent job changes (avg {avg_tenure:.0f} months)",
                    "details": f"Held {job_count} positions with average tenure under 1 year"
                })
    
    def _check_missing_critical_skills(self, resume_data: Dict, job_data: Dict):
        """Flag if missing more than 50% of required skills."""
        required_skills = set(s.lower() for s in job_data.get("required_skills", []))
        candidate_skills = set(s.lower() for s in resume_data.get("skills", []))
        
        if not required_skills:
            return
            
        missing = required_skills - candidate_skills
        match_rate = len(required_skills - missing) / len(required_skills)
        
        if match_rate < 0.5:
            self.flags.append({
                "type": "missing_skills",
                "severity": "high",
                "message": f"Missing {len(missing)} of {len(required_skills)} required skills",
                "details": f"Missing: {', '.join(list(missing)[:5])}"
            })
    
    def _check_overqualification(self, resume_data: Dict, job_data: Dict):
        """Flag if significantly overqualified (may not stay long)."""
        candidate_exp = resume_data.get("experience_years", 0) or 0
        required_exp = job_data.get("min_experience_years", 0) or 0
        
        if required_exp > 0 and candidate_exp > required_exp * 2.5:
            self.flags.append({
                "type": "overqualified",
                "severity": "low",
                "message": f"Potentially overqualified ({candidate_exp:.0f} yrs vs {required_exp:.0f} required)",
                "details": "May have higher salary expectations or seek more senior roles"
            })
    
    def _check_education_mismatch(self, resume_data: Dict, job_data: Dict):
        """Flag if education doesn't align with requirements."""
        required_edu = job_data.get("education_requirement", "").lower()
        candidate_edu = (resume_data.get("education", "") or "").lower()
        
        if not required_edu or not candidate_edu:
            return
            
        # Simple check - can be enhanced
        if "master" in required_edu and "master" not in candidate_edu and "phd" not in candidate_edu:
            self.flags.append({
                "type": "education_mismatch",
                "severity": "medium",
                "message": "Education level may not meet requirements",
                "details": f"Required: {required_edu.title()}, Candidate has: {candidate_edu.title()}"
            })
    
    def _calculate_gap_months(self, end_date: str, start_date: str) -> int:
        """Calculate months between two date strings."""
        # Simplified - assumes dates in common formats
        try:
            end = datetime.strptime(end_date, "%Y-%m")
            start = datetime.strptime(start_date, "%Y-%m")
            return max(0, (start.year - end.year) * 12 + start.month - end.month)
        except:
            return 0
    
    def _calculate_risk(self) -> str:
        """Calculate overall risk level."""
        high_count = sum(1 for f in self.flags if f["severity"] == "high")
        medium_count = sum(1 for f in self.flags if f["severity"] == "medium")
        
        if high_count >= 2 or (high_count >= 1 and medium_count >= 2):
            return "high"
        elif high_count >= 1 or medium_count >= 2:
            return "medium"
        return "low"
    
    def _generate_summary(self) -> str:
        """Generate brief summary of red flags."""
        if not self.flags:
            return "No significant concerns detected"
        
        types = [f["type"].replace("_", " ") for f in self.flags]
        return f"Concerns: {', '.join(types)}"


# Singleton instance
red_flags_detector = RedFlagsDetector()
