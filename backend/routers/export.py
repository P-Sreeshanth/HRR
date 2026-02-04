"""Export endpoints for downloading match results."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import csv
import io
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/csv")
async def export_to_csv(results: dict):
    """
    Export match results to CSV format.
    
    Expects the full MatchResponse object as input.
    """
    try:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Rank",
            "Candidate Name",
            "Final Score",
            "Vector Score",
            "LLM Score",
            "Skills Score",
            "Experience Score",
            "Matched Skills",
            "Missing Skills",
            "Reasoning"
        ])
        
        # Data rows
        for result in results.get("results", []):
            score = result.get("score", {})
            skill_matches = result.get("skill_matches", [])
            matched = [s["skill"] for s in skill_matches if s.get("matched")]
            missing = [s["skill"] for s in skill_matches if not s.get("matched")]
            
            writer.writerow([
                result.get("rank", "-"),
                result.get("candidate_name", "Unknown"),
                f"{score.get('final_score', 0):.1f}",
                f"{score.get('vector_score', 0):.1f}",
                f"{score.get('llm_score', 0):.1f}",
                f"{score.get('skills_score', 0):.1f}",
                f"{score.get('experience_score', 0):.1f}",
                ", ".join(matched[:10]),
                ", ".join(missing[:10]),
                result.get("reasoning", "")[:200]
            ])
        
        output.seek(0)
        
        filename = f"matchflow_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode('utf-8')),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/clipboard")
async def get_clipboard_text(results: dict):
    """
    Get formatted text for clipboard copy.
    
    Returns a formatted text summary of top candidates.
    """
    try:
        lines = []
        job_title = results.get("job_title", "Position")
        
        lines.append(f"# Match Results: {job_title}")
        lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        lines.append(f"Total Candidates: {results.get('total_candidates', 0)}")
        lines.append("")
        lines.append("## Top Candidates")
        lines.append("")
        
        for result in results.get("results", [])[:10]:
            score = result.get("score", {})
            name = result.get("candidate_name", "Unknown")
            final = score.get("final_score", 0)
            rank = result.get("rank", "-")
            
            # Get matched skills
            skill_matches = result.get("skill_matches", [])
            matched = [s["skill"] for s in skill_matches if s.get("matched")]
            
            lines.append(f"**{rank}. {name}** - {final:.0f}%")
            lines.append(f"   Skills: {', '.join(matched[:5])}")
            lines.append("")
        
        return {"text": "\n".join(lines)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clipboard format failed: {str(e)}")
