from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class ProfileBase(SQLModel):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    aspiration_role_id: Optional[int] = Field(foreign_key="role.id")
    location: Optional[str] = None
    availability_hours: Optional[int] = Field(default=0, ge=0, le=168)
    education_level: Optional[str] = None
    bio: Optional[str] = None


class Profile(ProfileBase, table=True):
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProfileCreate(SQLModel):
    aspiration_role_id: Optional[int] = None
    location: Optional[str] = None
    availability_hours: Optional[int] = 0
    education_level: Optional[str] = None
    bio: Optional[str] = None


class ProfileRead(ProfileBase):
    updated_at: datetime


class ProfileUpdate(SQLModel):
    aspiration_role_id: Optional[int] = None
    location: Optional[str] = None
    availability_hours: Optional[int] = None
    education_level: Optional[str] = None
    bio: Optional[str] = None