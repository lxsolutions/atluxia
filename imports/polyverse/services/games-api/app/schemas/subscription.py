"""
Subscription schemas for creator monetization
"""

from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum


class SubscriptionTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class CreatorPlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    tier: SubscriptionTier
    monthly_price: Decimal
    
    # Features
    supporter_badge: bool = True
    early_access: bool = False
    exclusive_content: bool = False
    direct_messaging: bool = False
    custom_benefits: Optional[str] = None


class CreatorPlanCreate(CreatorPlanBase):
    pass


class CreatorPlan(CreatorPlanBase):
    id: int
    creator_id: int
    is_active: bool
    stripe_price_id: Optional[str] = None
    stripe_product_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class UserSubscriptionBase(BaseModel):
    plan_id: int


class UserSubscriptionCreate(UserSubscriptionBase):
    stripe_payment_method_id: str


class UserSubscription(UserSubscriptionBase):
    id: int
    user_id: int
    status: str
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    revenue_share_percent: Decimal
    platform_fee_percent: Decimal
    created_at: datetime
    updated_at: Optional[datetime] = None
    canceled_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class SubscriptionReceipt(BaseModel):
    id: int
    subscription_id: int
    stripe_payment_intent_id: Optional[str] = None
    amount: Decimal
    currency: str
    creator_amount: Decimal
    platform_amount: Decimal
    transparency_record: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        orm_mode = True


class SubscriptionWebhook(BaseModel):
    type: str
    data: Dict[str, Any]
    
    @validator('type')
    def validate_webhook_type(cls, v):
        valid_types = {
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted',
            'invoice.payment_succeeded',
            'invoice.payment_failed'
        }
        if v not in valid_types:
            raise ValueError(f'Invalid webhook type: {v}')
        return v


class CreatorProfile(BaseModel):
    is_creator: bool
    creator_bio: Optional[str] = None
    creator_specialties: Optional[List[str]] = None
    total_subscribers: int = 0
    monthly_revenue: Decimal = Decimal('0.00')
    
    class Config:
        orm_mode = True


class SubscriptionList(BaseModel):
    subscriptions: List[UserSubscription]
    total: int
    page: int
    size: int