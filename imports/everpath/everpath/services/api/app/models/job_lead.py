from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class JobLeadBase(SQLModel):
    provider: str = Field(description="e.g., mock, indeed, linkedin")
    title: str
    company: str
    location: Optional[str] = None
    url: Optional[str] = None
    skills: Optional[str] = Field(default=None, description="Comma-separated skills")
    role_id: Optional[int] = Field(foreign_key="role.id")
    seniority_level: Optional[str] = Field(default=None)


class JobLead(JobLeadBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobLeadCreate(SQLModel):
    provider: str
    title: str
    company: str
    location: Optional[str] = None
    url: Optional[str] = None
    skills: Optional[str] = None
    role_id: Optional[int] = None
    seniority_level: Optional[str] = None


class JobLeadRead(JobLeadBase):
    id: int
    created_at: datetime
