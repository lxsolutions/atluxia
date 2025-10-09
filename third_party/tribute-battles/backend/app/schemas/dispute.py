





from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, validator
from datetime import datetime
from app.models.dispute import DisputeStatus, PaymentMethod


class DisputeBase(BaseModel):
    title: str
    description: Optional[str] = None
    game_id: int
    game_variant_id: Optional[int] = None
    challenger_side: str
    opponent_side: str
    entry_fee: Decimal
    payment_method: PaymentMethod
    currency: str = "USD"
    is_streamed: bool = False
    stream_url: Optional[str] = None


class DisputeCreate(DisputeBase):
    opponent_email: Optional[str] = None  # For email invitation


class DisputeUpdate(BaseModel):
    status: Optional[DisputeStatus] = None
    winner_id: Optional[int] = None
    winner_proof_url: Optional[str] = None
    winner_proof_verified: Optional[bool] = None
    payout_processed: Optional[bool] = None
    payout_transaction_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class DisputeInDBBase(DisputeBase):
    id: int
    challenger_id: int
    opponent_id: int
    status: DisputeStatus
    winner_id: Optional[int] = None
    payout_processed: bool
    created_at: datetime
    updated_at: datetime
    scheduled_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class Dispute(DisputeInDBBase):
    pass


class DisputeWithDetails(Dispute):
    challenger_username: Optional[str] = None
    opponent_username: Optional[str] = None
    winner_username: Optional[str] = None
    game_name: Optional[str] = None
    game_variant_name: Optional[str] = None


class MatchHistoryBase(BaseModel):
    score: str
    replay_url: Optional[str] = None
    screenshot_url: Optional[str] = None
    notes: Optional[str] = None


class MatchHistoryCreate(MatchHistoryBase):
    dispute_id: int
    winner_id: int


class MatchHistory(MatchHistoryBase):
    id: int
    dispute_id: int
    winner_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ArgumentHistoryBase(BaseModel):
    argument_name: str
    game_id: int
    side_a_name: str
    side_b_name: str
    side_a_wins: int = 0
    side_b_wins: int = 0
    total_matches: int = 0


class ArgumentHistoryCreate(ArgumentHistoryBase):
    pass


class ArgumentHistory(ArgumentHistoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class LeaderboardBase(BaseModel):
    user_id: int
    game_id: int
    rank: int
    wins: int = 0
    losses: int = 0
    win_rate: float = 0.0
    total_tribute: Decimal = Decimal(0)
    current_streak: int = 0
    longest_streak: int = 0
    elo_rating: int = 1000


class Leaderboard(LeaderboardBase):
    id: int
    username: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class EscrowTransactionBase(BaseModel):
    dispute_id: int
    amount: Decimal
    currency: str = "USD"
    payment_method: PaymentMethod
    transaction_id: str


class EscrowTransactionCreate(EscrowTransactionBase):
    user_id: int


class EscrowTransaction(EscrowTransactionBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class DisputeList(BaseModel):
    disputes: List[Dispute]
    total: int
    page: int
    size: int


class LeaderboardList(BaseModel):
    leaderboards: List[Leaderboard]
    total: int
    game_id: int
    page: int
    size: int


class ArgumentHistoryList(BaseModel):
    argument_histories: List[ArgumentHistory]
    total: int
    page: int
    size: int


class DisputeConfirmation(BaseModel):
    dispute_id: int
    user_id: int
    confirmed: bool


class DisputeResult(BaseModel):
    dispute_id: int
    winner_id: int
    score: str
    proof_url: str
    notes: Optional[str] = None


class PayoutRequest(BaseModel):
    dispute_id: int
    winner_proof_url: str


class StreamLink(BaseModel):
    dispute_id: int
    stream_url: str


