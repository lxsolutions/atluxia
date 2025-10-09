from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class XPLedgerBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    source: str = Field(description="Source of XP: quest, assessment, game, etc.")
    delta: int = Field(description="XP change, can be positive or negative")
    reason: str
    skill_id: Optional[int] = Field(foreign_key="skill.id")


class XPLedger(XPLedgerBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class XPLedgerCreate(SQLModel):
    source: str
    delta: int
    reason: str
    skill_id: Optional[int] = None


class XPLedgerRead(XPLedgerBase):
    id: int
    created_at: datetime
