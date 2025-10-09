from sqlmodel import SQLModel, Field
from typing import Optional


class RoleBase(SQLModel):
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    category: str = Field(description="e.g., Technology, Healthcare, Business, Creative, Trades")
    min_age: Optional[int] = Field(default=None, description="Minimum recommended age for this role")


class Role(RoleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class RoleCreate(SQLModel):
    name: str
    description: Optional[str] = None
    category: str
    min_age: Optional[int] = None


class RoleRead(RoleBase):
    id: int