from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class RecommendationKind(str, Enum):
    QUEST = "quest"
    LESSON = "lesson"
    JOB = "job"
    ASSESSMENT = "assessment"


class RecommendationBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    kind: RecommendationKind
    ref_id: int
    reason: str
    priority: int = Field(default=1, ge=1, le=10)


class Recommendation(RecommendationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecommendationCreate(SQLModel):
    kind: RecommendationKind
    ref_id: int
    reason: str
    priority: int = 1


class RecommendationRead(RecommendationBase):
    id: int
    created_at: datetime
