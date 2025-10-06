from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.job_lead import JobLead, JobLeadRead
from app.models.profile import Profile
from app.models.user_skill import UserSkill
from app.models.role_skill import RoleSkill
from app.models.role import Role

router = APIRouter()


class MockJobProvider:
    """Mock job provider for MVP testing"""
    
    @staticmethod
    def get_mock_jobs():
        """Return mock job data for testing"""
        return [
            {
                "title": "Software Engineer",
                "company": "TechCorp Inc.",
                "location": "Remote",
                "description": "Build scalable web applications using modern technologies.",
                "required_skills": ["Python", "JavaScript", "React", "AWS"],
                "salary_range": "$80,000 - $120,000",
                "experience_level": "Mid-level",
                "match_score": 85
            },
            {
                "title": "Data Scientist",
                "company": "DataWorks Analytics",
                "location": "New York, NY",
                "description": "Analyze complex datasets and build machine learning models.",
                "required_skills": ["Python", "Machine Learning", "SQL", "Statistics"],
                "salary_range": "$90,000 - $130,000",
                "experience_level": "Senior",
                "match_score": 78
            },
            {
                "title": "Frontend Developer",
                "company": "WebCraft Studios",
                "location": "San Francisco, CA",
                "description": "Create beautiful and responsive user interfaces.",
                "required_skills": ["JavaScript", "React", "CSS", "TypeScript"],
                "salary_range": "$75,000 - $110,000",
                "experience_level": "Junior",
                "match_score": 92
            },
            {
                "title": "DevOps Engineer",
                "company": "CloudScale Technologies",
                "location": "Austin, TX",
                "description": "Manage cloud infrastructure and CI/CD pipelines.",
                "required_skills": ["AWS", "Docker", "Kubernetes", "Linux"],
                "salary_range": "$85,000 - $125,000",
                "experience_level": "Mid-level",
                "match_score": 65
            },
            {
                "title": "Product Manager",
                "company": "InnovateLabs",
                "location": "Boston, MA",
                "description": "Lead product development and strategy.",
                "required_skills": ["Product Management", "Agile", "User Research", "Analytics"],
                "salary_range": "$95,000 - $140,000",
                "experience_level": "Senior",
                "match_score": 72
            }
        ]


def calculate_job_match_score(user_skills: List[UserSkill], job_skills: List[str]) -> int:
    """Calculate match score between user skills and job requirements"""
    if not user_skills:
        return 0
    
    # Convert user skills to a set of skill names
    user_skill_names = {skill.skill.name.lower() for skill in user_skills if skill.skill}
    
    # Convert job skills to lowercase for comparison
    job_skill_names = {skill.lower() for skill in job_skills}
    
    # Calculate intersection
    matching_skills = user_skill_names.intersection(job_skill_names)
    
    # Calculate match percentage
    if not job_skill_names:
        return 0
    
    match_percentage = (len(matching_skills) / len(job_skill_names)) * 100
    
    # Add bonus for user skill levels
    skill_level_bonus = 0
    for user_skill in user_skills:
        if user_skill.skill and user_skill.skill.name.lower() in job_skill_names:
            # Higher skill levels get more bonus
            skill_level_bonus += user_skill.level * 2
    
    final_score = min(100, match_percentage + skill_level_bonus)
    return int(final_score)


@router.get("/search", response_model=List[JobLeadRead])
def search_jobs(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    location: Optional[str] = Query(None, description="Filter by location"),
    role: Optional[str] = Query(None, description="Filter by role")
):
    """Search for job leads relevant to user's skills and aspirations."""
    # Get user's profile and skills
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).first()
    
    user_skills = session.exec(
        select(UserSkill).where(UserSkill.user_id == current_user.id)
    ).all()
    
    # For MVP, return job leads from database first
    query = select(JobLead)
    
    if location:
        query = query.where(JobLead.location.ilike(f"%{location}%"))
    
    if role:
        query = query.where(JobLead.role_id == role)
    
    job_leads = session.exec(query).all()
    
    # If no job leads in database, use mock provider
    if not job_leads:
        mock_jobs = MockJobProvider.get_mock_jobs()
        
        # Convert mock jobs to JobLead format with match scores
        enhanced_jobs = []
        for mock_job in mock_jobs:
            match_score = calculate_job_match_score(user_skills, mock_job["required_skills"])
            
            # Create a JobLead-like object
            job_lead = JobLead(
                title=mock_job["title"],
                company=mock_job["company"],
                location=mock_job["location"],
                description=mock_job["description"],
                skills=mock_job["required_skills"],
                provider="mock",
                match_score=match_score
            )
            enhanced_jobs.append(job_lead)
        
        # Sort by match score
        enhanced_jobs.sort(key=lambda x: x.match_score or 0, reverse=True)
        return enhanced_jobs
    
    # Calculate match scores for database job leads
    for job_lead in job_leads:
        if job_lead.skills:
            match_score = calculate_job_match_score(user_skills, job_lead.skills)
            job_lead.match_score = match_score
    
    # Sort by match score
    job_leads.sort(key=lambda x: x.match_score or 0, reverse=True)
    
    return job_leads


@router.get("/mock", response_model=List[dict])
def get_mock_jobs(
    current_user: User = Depends(get_current_user)
):
    """Get mock job data for testing and development."""
    return MockJobProvider.get_mock_jobs()
