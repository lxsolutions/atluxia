from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    KID = "kid"
    TEEN = "teen"
    ADULT = "adult"
    PARENT = "parent"
    EDUCATOR = "educator"
    ADMIN = "admin"


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    age_band: str = Field(description="Age range: 5-12, 13-17, 18-24, 25-34, 35-44, 45+")
    role: UserRole
    guardian_id: Optional[int] = Field(default=None, foreign_key="user.id")


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)


class UserCreate(SQLModel):
    email: str
    password: str
    age_band: str
    role: UserRole
    guardian_id: Optional[int] = None


class UserRead(UserBase):
    id: int
    created_at: datetime
    is_active: bool


class UserUpdate(SQLModel):
    email: Optional[str] = None
    age_band: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None