from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum


class QuestType(str, Enum):
    PRACTICE = "practice"
    MINI_PROJECT = "mini_project"
    LESSON = "lesson"
    ASSESSMENT = "assessment"
    GAME = "game"


class QuestDifficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class QuestBase(SQLModel):
    title: str
    type: QuestType
    difficulty: QuestDifficulty
    estimated_minutes: int = Field(ge=1)
    skill_id: Optional[int] = Field(foreign_key="skill.id")
    lesson_id: Optional[int] = Field(foreign_key="lesson.id")
    assessment_id: Optional[int] = Field(foreign_key="assessment.id")
    age_min: Optional[int] = Field(default=None)
    age_max: Optional[int] = Field(default=None)
    content: Optional[str] = Field(default=None, description="JSON content for the quest")


class Quest(QuestBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class QuestCreate(SQLModel):
    title: str
    type: QuestType
    difficulty: QuestDifficulty
    estimated_minutes: int
    skill_id: Optional[int] = None
    lesson_id: Optional[int] = None
    assessment_id: Optional[int] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    content: Optional[str] = None


class QuestRead(QuestBase):
    id: int