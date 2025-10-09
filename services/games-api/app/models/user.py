


from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # OAuth fields
    google_id = Column(String, unique=True)
    github_id = Column(String, unique=True)
    
    # PolyVerse DID for shared authentication
    polyverse_did = Column(String, unique=True)
    
    # Profile fields
    favorite_factions = Column(Text)  # JSON string of faction preferences
    total_tribute_earned = Column(Integer, default=0)
    total_matches_played = Column(Integer, default=0)
    total_wins = Column(Integer, default=0)
    total_losses = Column(Integer, default=0)
    
    # Wallet linking
    wallet_address = Column(String)
    
    # Stripe Connect
    stripe_account_id = Column(String, unique=True)
    
    # Subscription fields
    is_creator = Column(Boolean, default=False)
    creator_bio = Column(Text)
    creator_specialties = Column(Text)  # JSON string of specialties
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    creator_plans = relationship("CreatorPlan", back_populates="creator")
    subscriptions = relationship("UserSubscription", back_populates="user")



