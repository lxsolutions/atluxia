from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.skill import Skill, SkillRead
from app.models.role import Role, RoleRead

router = APIRouter()


@router.get("/roles", response_model=List[RoleRead])
def get_roles(session: Session = Depends(get_session)):
    """Get all available roles."""
    roles = session.exec(select(Role)).all()
    return roles


@router.get("/skills", response_model=List[SkillRead])
def get_skills(session: Session = Depends(get_session)):
    """Get all available skills."""
    skills = session.exec(select(Skill)).all()
    return skills
