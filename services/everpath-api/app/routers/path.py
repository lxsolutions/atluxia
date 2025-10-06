from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, SQLModel

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.skill import Skill
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.user_skill import UserSkill
from app.models.quest import Quest
from app.models.assessment import Assessment
from app.models.lesson import Lesson
from app.models.job_lead import JobLead
from app.models.recommendation import Recommendation, RecommendationCreate

router = APIRouter()


class NextStepsResponse(SQLModel):
    quests: List[Quest]
    lessons: List[Lesson]
    assessments: List[Assessment]
    job_leads: List[JobLead]
    recommendations: List[Recommendation]


@router.get("/next-steps", response_model=NextStepsResponse)
def get_next_steps(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get the next recommended steps for the user based on their skills and aspirations."""
    
    # Get user's profile
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile or not profile.aspiration_role_id:
        raise HTTPException(status_code=400, detail="User has no aspiration role set")
    
    # Get aspiration role
    aspiration_role = session.get(Role, profile.aspiration_role_id)
    if not aspiration_role:
        raise HTTPException(status_code=404, detail="Aspiration role not found")
    
    # Compute skill gaps
    skill_gaps = compute_skill_gaps(current_user.id, profile.aspiration_role_id, session)
    
    # Get recommendations based on skill gaps
    recommendations = generate_recommendations(current_user.id, skill_gaps, session)
    
    # Get job leads for working-age users
    job_leads = []
    if current_user.role in ["adult", "teen"]:
        job_leads = get_relevant_job_leads(current_user.id, profile, session)
    
    return NextStepsResponse(
        quests=recommendations.get("quests", []),
        lessons=recommendations.get("lessons", []),
        assessments=recommendations.get("assessments", []),
        job_leads=job_leads,
        recommendations=[]  # Will be populated from database
    )


def compute_skill_gaps(user_id: int, role_id: int, session: Session) -> List[Dict[str, Any]]:
    """Compute gaps between user's skills and role requirements."""
    
    # Get required skills for the role
    required_skills = session.exec(
        select(RoleSkill).where(RoleSkill.role_id == role_id)
    ).all()
    
    gaps = []
    for role_skill in required_skills:
        # Get user's skill level
        user_skill = session.exec(
            select(UserSkill).where(
                UserSkill.user_id == user_id,
                UserSkill.skill_id == role_skill.skill_id
            )
        ).first()
        
        user_level = user_skill.level if user_skill else 0
        gap = max(0, role_skill.required_level - user_level)
        
        if gap > 0:
            gaps.append({
                "skill_id": role_skill.skill_id,
                "skill_name": session.get(Skill, role_skill.skill_id).name,
                "current_level": user_level,
                "required_level": role_skill.required_level,
                "gap": gap,
                "importance": role_skill.importance
            })
    
    # Sort by weighted gap (gap * importance)
    gaps.sort(key=lambda x: x["gap"] * x["importance"], reverse=True)
    return gaps


def generate_recommendations(
    user_id: int, 
    skill_gaps: List[Dict[str, Any]], 
    session: Session
) -> Dict[str, List]:
    """Generate recommendations based on skill gaps."""
    
    recommendations = {"quests": [], "lessons": [], "assessments": []}
    
    # Take top 3 skill gaps
    top_gaps = skill_gaps[:3]
    
    for gap in top_gaps:
        skill_id = gap["skill_id"]
        
        # Get quests for this skill
        quests = session.exec(
            select(Quest).where(
                Quest.skill_id == skill_id
            ).order_by(Quest.difficulty)
        ).all()
        
        # Get lessons for this skill
        lessons = session.exec(
            select(Lesson).where(
                Lesson.topics.contains(session.get(Skill, skill_id).name)
            )
        ).all()
        
        # Get assessments for this skill
        assessments = session.exec(
            select(Assessment).where(Assessment.skill_id == skill_id)
        ).all()
        
        recommendations["quests"].extend(quests[:2])  # Top 2 quests per skill
        recommendations["lessons"].extend(lessons[:1])  # Top lesson per skill
        recommendations["assessments"].extend(assessments[:1])  # Top assessment per skill
    
    # Remove duplicates and limit to reasonable numbers
    recommendations["quests"] = list(set(recommendations["quests"]))[:3]
    recommendations["lessons"] = list(set(recommendations["lessons"]))[:2]
    recommendations["assessments"] = list(set(recommendations["assessments"]))[:2]
    
    return recommendations


def get_relevant_job_leads(
    user_id: int, 
    profile: Profile, 
    session: Session
) -> List[JobLead]:
    """Get job leads relevant to user's skills and aspirations."""
    
    # For MVP, return mock job leads
    job_leads = session.exec(
        select(JobLead).where(JobLead.role_id == profile.aspiration_role_id)
    ).all()
    
    return job_leads[:3]  # Return top 3 job leads