from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User, UserRead
from app.models.profile import Profile, ProfileRead, ProfileUpdate
from app.models.user_skill import UserSkill, UserSkillRead, UserSkillCreate

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.get("/profile", response_model=ProfileRead)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get user profile."""
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        # Create default profile if it doesn't exist
        profile = Profile(user_id=current_user.id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    return profile


@router.put("/profile", response_model=ProfileRead)
def update_user_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user profile."""
    profile = session.exec(select(Profile).where(Profile.user_id == current_user.id)).first()
    if not profile:
        profile = Profile(user_id=current_user.id, **profile_update.dict())
        session.add(profile)
    else:
        for key, value in profile_update.dict(exclude_unset=True).items():
            setattr(profile, key, value)
    
    session.commit()
    session.refresh(profile)
    return profile


@router.get("/skills", response_model=List[UserSkillRead])
def get_user_skills(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get user's skills."""
    user_skills = session.exec(
        select(UserSkill).where(UserSkill.user_id == current_user.id)
    ).all()
    return user_skills


@router.post("/skills", response_model=UserSkillRead)
def update_user_skill(
    skill_data: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update or create user skill."""
    user_skill = session.exec(
        select(UserSkill).where(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == skill_data.skill_id
        )
    ).first()
    
    if user_skill:
        user_skill.level = skill_data.level
        user_skill.evidence_score = skill_data.evidence_score
    else:
        user_skill = UserSkill(
            user_id=current_user.id,
            skill_id=skill_data.skill_id,
            level=skill_data.level,
            evidence_score=skill_data.evidence_score
        )
        session.add(user_skill)
    
    session.commit()
    session.refresh(user_skill)
    return user_skill
