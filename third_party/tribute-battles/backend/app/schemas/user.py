



from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    favorite_factions: Optional[str] = None
    wallet_address: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    favorite_factions: Optional[str] = None
    wallet_address: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    total_tribute_earned: int
    total_matches_played: int
    total_wins: int
    total_losses: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None


class OAuthLogin(BaseModel):
    provider: str  # "google" or "github"
    provider_id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None


