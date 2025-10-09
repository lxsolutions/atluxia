




from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Numeric, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base
import enum


class DisputeStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"


class PaymentMethod(enum.Enum):
    STRIPE = "stripe"
    CRYPTO = "crypto"


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # Game information
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    game_variant_id = Column(Integer, ForeignKey("game_variants.id"))
    
    # Players
    challenger_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opponent_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Sides/Arguments
    challenger_side = Column(String, nullable=False)
    opponent_side = Column(String, nullable=False)
    
    # Payment details
    entry_fee = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    currency = Column(String, default="USD")
    
    # Status and progression
    status = Column(Enum(DisputeStatus), default=DisputeStatus.PENDING)
    is_streamed = Column(Boolean, default=False)
    stream_url = Column(String)
    
    # Winner and proof
    winner_id = Column(Integer, ForeignKey("users.id"))
    winner_proof_url = Column(String)
    winner_proof_verified = Column(Boolean, default=False)
    
    # Payout
    payout_processed = Column(Boolean, default=False)
    payout_transaction_id = Column(String)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    scheduled_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    game = relationship("Game")
    game_variant = relationship("GameVariant")
    challenger = relationship("User", foreign_keys=[challenger_id])
    opponent = relationship("User", foreign_keys=[opponent_id])
    winner = relationship("User", foreign_keys=[winner_id])
    
    # Match history
    match_history = relationship("MatchHistory", back_populates="dispute", cascade="all, delete-orphan")


class MatchHistory(Base):
    __tablename__ = "match_history"

    id = Column(Integer, primary_key=True, index=True)
    dispute_id = Column(Integer, ForeignKey("disputes.id"), nullable=False)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(String)  # Could be "2-1", "Victory", etc.
    replay_url = Column(String)
    screenshot_url = Column(String)
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dispute = relationship("Dispute", back_populates="match_history")
    winner = relationship("User")


class ArgumentHistory(Base):
    __tablename__ = "argument_history"

    id = Column(Integer, primary_key=True, index=True)
    argument_name = Column(String, nullable=False)  # e.g., "Catholics vs Muslims"
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    side_a_name = Column(String, nullable=False)
    side_b_name = Column(String, nullable=False)
    side_a_wins = Column(Integer, default=0)
    side_b_wins = Column(Integer, default=0)
    total_matches = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    game = relationship("Game")


class Leaderboard(Base):
    __tablename__ = "leaderboards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    
    # Ranking stats
    rank = Column(Integer, nullable=False)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    win_rate = Column(Numeric(5, 2), default=0.00)
    total_tribute = Column(Numeric(10, 2), default=0.00)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    elo_rating = Column(Integer, default=1000)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    game = relationship("Game")


class EscrowTransaction(Base):
    __tablename__ = "escrow_transactions"

    id = Column(Integer, primary_key=True, index=True)
    dispute_id = Column(Integer, ForeignKey("disputes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="USD")
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    transaction_id = Column(String, nullable=False)  # Stripe charge ID or crypto tx hash
    status = Column(String, default="pending")  # pending, completed, refunded
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    dispute = relationship("Dispute")
    user = relationship("User")

