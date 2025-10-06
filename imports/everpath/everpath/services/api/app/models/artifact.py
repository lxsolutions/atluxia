from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ArtifactType(str, Enum):
    PROJECT = "project"
    CERTIFICATE = "certificate"
    RESUME = "resume"
    PORTFOLIO = "portfolio"
    ASSESSMENT_RESULT = "assessment_result"
    OTHER = "other"


class ArtifactBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    type: ArtifactType
    title: str
    url: Optional[str] = None
    description: Optional[str] = None
    skill_tags: Optional[str] = Field(default=None, description="Comma-separated skill tags")
    verified: bool = Field(default=False)


class Artifact(ArtifactBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ArtifactCreate(SQLModel):
    type: ArtifactType
    title: str
    url: Optional[str] = None
    description: Optional[str] = None
    skill_tags: Optional[str] = None


class ArtifactRead(ArtifactBase):
    id: int
    created_at: datetime
