"""
Subscription API endpoints for creator monetization
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
import stripe

from app.core.database import get_db
from app.crud.user import get_current_user_pydantic
from app.models import user as user_model
from app.schemas import user as user_schema
from app.schemas import subscription as subscription_schema
from app.crud import subscription as subscription_crud

router = APIRouter()


@router.post("/creator/plan", response_model=subscription_schema.CreatorPlan)
def create_creator_plan(
    plan_data: subscription_schema.CreatorPlanCreate,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """Create a new creator subscription plan"""
    
    # Verify user is a creator
    if not current_user.is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can create subscription plans"
        )
    
    try:
        plan = subscription_crud.create_creator_plan(db, plan_data, current_user.id)
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/creator/plans", response_model=List[subscription_schema.CreatorPlan])
def get_creator_plans(
    creator_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get creator subscription plans"""
    plans = subscription_crud.get_creator_plans(db, creator_id, skip, limit)
    return plans


@router.post("/subscribe", response_model=subscription_schema.UserSubscription)
def create_subscription(
    subscription_data: subscription_schema.UserSubscriptionCreate,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """Subscribe to a creator's plan"""
    
    try:
        subscription = subscription_crud.create_subscription(db, subscription_data, current_user.id)
        return subscription
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me/subscriptions", response_model=subscription_schema.SubscriptionList)
def get_my_subscriptions(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """Get current user's subscriptions"""
    subscriptions = subscription_crud.get_user_subscriptions(db, current_user.id, status, skip, limit)
    total = len(subscriptions)
    
    return {
        "subscriptions": subscriptions,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit
    }


@router.post("/subscriptions/{subscription_id}/cancel")
def cancel_subscription(
    subscription_id: int,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """Cancel a subscription"""
    
    # Verify user owns the subscription
    subscription = subscription_crud.get_subscription(db, subscription_id)
    if not subscription or subscription.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )
    
    try:
        subscription = subscription_crud.cancel_subscription(db, subscription_id)
        return {"message": "Subscription canceled successfully", "subscription_id": subscription_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/webhook/stripe")
async def stripe_webhook(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events for subscriptions"""
    
    # This endpoint should be configured in Stripe dashboard
    # It will receive events for subscription lifecycle management
    
    # For now, we'll just acknowledge the webhook
    # In production, we would verify the signature and process the event
    
    return {"received": True}


@router.get("/creator/{creator_id}/profile", response_model=subscription_schema.CreatorProfile)
def get_creator_profile(
    creator_id: int,
    db: Session = Depends(get_db)
):
    """Get creator profile with subscription stats"""
    
    profile = subscription_crud.get_creator_profile(db, creator_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator not found"
        )
    
    return profile


@router.put("/me/creator-profile")
def update_creator_profile(
    profile_data: subscription_schema.CreatorProfile,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """Update user's creator profile"""
    
    user = db.query(user_model.User).filter(user_model.User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_creator = profile_data.is_creator
    user.creator_bio = profile_data.creator_bio
    
    if profile_data.creator_specialties:
        user.creator_specialties = str(profile_data.creator_specialties)
    
    db.commit()
    
    return {"message": "Creator profile updated successfully"}