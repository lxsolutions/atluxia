from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class UserSkillBase(SQLModel):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    skill_id: int = Field(foreign_key="skill.id", primary_key=True)
    level: int = Field(default=0, ge=0, le=5, description="0-5 scale: 0=no knowledge, 5=expert")
    evidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class UserSkill(UserSkillBase, table=True):
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserSkillCreate(SQLModel):
    skill_id: int
    level: int = 0
    evidence_score: float = 0.0


class UserSkillRead(UserSkillBase):
    updated_at: datetime
