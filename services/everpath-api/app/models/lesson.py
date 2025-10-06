from sqlmodel import SQLModel, Field
from typing import Optional, List


class LessonBase(SQLModel):
    title: str
    topics: Optional[str] = Field(default=None, description="Comma-separated topics")
    body_md: Optional[str] = None
    age_min: Optional[int] = Field(default=None)
    age_max: Optional[int] = Field(default=None)
    estimated_minutes: int = Field(default=30, ge=1)


class Lesson(LessonBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class LessonCreate(SQLModel):
    title: str
    topics: Optional[str] = None
    body_md: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    estimated_minutes: int = 30


class LessonRead(LessonBase):
    id: int
