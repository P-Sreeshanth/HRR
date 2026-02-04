"""LLM prompt templates for resume analysis and matching."""

SKILL_EXTRACTION_PROMPT = """Extract all skills from this resume with proficiency levels.

Resume:
{resume_text}

For each skill, estimate proficiency based on:
- Expert: 5+ years OR lead/architect roles OR deep project work
- Advanced: 3-5 years OR significant project experience
- Intermediate: 1-3 years OR coursework + projects
- Beginner: Mentioned but limited evidence

Return a JSON object with this exact structure:
{{
    "skills": [
        {{"name": "Python", "category": "technical", "proficiency": "Expert"}},
        {{"name": "Leadership", "category": "soft", "proficiency": "Advanced"}},
        {{"name": "Docker", "category": "tool", "proficiency": "Intermediate"}}
    ],
    "certifications": ["AWS Solutions Architect", "PMP"],
    "total_experience_years": 5
}}

Categories: "technical", "soft", "tool", "certification"
Only include skills explicitly mentioned."""


RESUME_JD_MATCH_PROMPT = """Analyze how well this resume matches the job description.

## Job Description:
Title: {job_title}
Requirements: {job_description}
Required Skills: {required_skills}
Preferred Skills: {preferred_skills}
Min Experience: {min_experience} years

## Resume:
{resume_text}

Score the candidate on these criteria (be strict and objective):

1. **Skills Match (0-40 points)**: How many required/preferred skills does the candidate have?
2. **Experience Relevance (0-30 points)**: Is their experience relevant to this role?
3. **Education Fit (0-15 points)**: Does their education align with requirements?
4. **Project Quality (0-15 points)**: Do their projects demonstrate relevant capabilities?

Return a JSON object with this exact structure:
{{
    "skills_score": <0-40>,
    "experience_score": <0-30>,
    "education_score": <0-15>,
    "project_score": <0-15>,
    "total_score": <0-100>,
    "matched_skills": ["skill1", "skill2", ...],
    "missing_skills": ["skill1", "skill2", ...],
    "reasoning": "<2-3 sentence explanation of the score>"
}}

Be objective. A perfect candidate should score 85+. Average candidates score 50-70."""


RESUME_PARSING_PROMPT = """Parse this resume and extract structured information.

Resume Text:
{resume_text}

Return a JSON object with this exact structure:
{{
    "name": "<full name>",
    "email": "<email or null>",
    "phone": "<phone or null>",
    "experience_years": <total years as number or null>,
    "education": "<highest degree and field>",
    "skills": ["skill1", "skill2", ...],
    "summary": "<1 sentence professional summary>"
}}

Extract only what is explicitly stated. Use null for missing fields."""
