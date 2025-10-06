"""
Subscription models for creator monetization
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Boolean, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base
import enum


class SubscriptionTier(enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class CreatorPlan(Base):
    __tablename__ = "creator_plans"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    tier = Column(Enum(SubscriptionTier), nullable=False)
    monthly_price = Column(Numeric(10, 2), nullable=False)  # USD
    
    # Features
    supporter_badge = Column(Boolean, default=True)
    early_access = Column(Boolean, default=False)
    exclusive_content = Column(Boolean, default=False)
    direct_messaging = Column(Boolean, default=False)
    custom_benefits = Column(Text)  # JSON string of custom benefits
    
    # Stripe integration
    stripe_price_id = Column(String, unique=True)
    stripe_product_id = Column(String, unique=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="creator_plans")
    subscriptions = relationship("UserSubscription", back_populates="plan")


class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("creator_plans.id"), nullable=False)
    
    # Stripe integration
    stripe_subscription_id = Column(String, unique=True)
    stripe_customer_id = Column(String)
    
    # Status
    status = Column(String, default="active")  # active, canceled, past_due, unpaid
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    cancel_at_period_end = Column(Boolean, default=False)
    
    # Revenue share tracking
    revenue_share_percent = Column(Numeric(5, 2), default=80.00)  # 80% to creator
    platform_fee_percent = Column(Numeric(5, 2), default=20.00)  # 20% to platform
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    canceled_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("CreatorPlan", back_populates="subscriptions")
    receipts = relationship("SubscriptionReceipt", back_populates="subscription")


class SubscriptionReceipt(Base):
    __tablename__ = "subscription_receipts"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("user_subscriptions.id"), nullable=False)
    
    # Payment details
    stripe_payment_intent_id = Column(String, unique=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="usd")
    
    # Revenue distribution
    creator_amount = Column(Numeric(10, 2), nullable=False)
    platform_amount = Column(Numeric(10, 2), nullable=False)
    
    # Transparency record
    transparency_record = Column(Text)  # JSON string with detailed breakdown
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    subscription = relationship("UserSubscription", back_populates="receipts")