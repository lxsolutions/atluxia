from sqlmodel import SQLModel, Field
from typing import Optional


class SkillBase(SQLModel):
    name: str = Field(unique=True, index=True)
    category: str = Field(description="e.g., Technical, Soft Skills, Creative, Academic")
    description: Optional[str] = None


class Skill(SkillBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class SkillCreate(SQLModel):
    name: str
    category: str
    description: Optional[str] = None


class SkillRead(SkillBase):
    id: int