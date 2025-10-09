from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum


class AssessmentType(str, Enum):
    QUIZ = "quiz"
    CODING_CHALLENGE = "coding_challenge"
    VIDEO_PROMPT = "video_prompt"
    ORAL_PROMPT = "oral_prompt"
    PROJECT_REVIEW = "project_review"


class AssessmentBase(SQLModel):
    type: AssessmentType
    skill_id: int = Field(foreign_key="skill.id")
    title: str
    description: Optional[str] = None
    rubric: Optional[str] = Field(default=None, description="JSON rubric for grading")
    auto_grader_ref: Optional[str] = None


class Assessment(AssessmentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class AssessmentCreate(SQLModel):
    type: AssessmentType
    skill_id: int
    title: str
    description: Optional[str] = None
    rubric: Optional[str] = None
    auto_grader_ref: Optional[str] = None


class AssessmentRead(AssessmentBase):
    id: int
