"""
Entitlements middleware for subscription-based access control
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Callable, Optional
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud import subscription as subscription_crud
from app.models import user as user_model
import json


class EntitlementsMiddleware:
    """Middleware to check subscription entitlements"""
    
    def __init__(self, required_tier: Optional[str] = None, required_feature: Optional[str] = None):
        self.required_tier = required_tier
        self.required_feature = required_feature
    
    async def __call__(self, request: Request, call_next: Callable):
        # Skip entitlement checks for public endpoints
        if request.url.path in [
            "/api/v1/subscriptions/creator/plans",
            "/api/v1/subscriptions/creator/{creator_id}/profile",
            "/health"
        ]:
            return await call_next(request)
        
        # Get current user from request state (set by auth middleware)
        current_user = getattr(request.state, 'current_user', None)
        
        if not current_user:
            # If no user is authenticated, allow access to public endpoints
            return await call_next(request)
        
        # Check if endpoint requires specific entitlements
        if self.required_tier or self.required_feature:
            # Get user's active subscriptions
            db: Session = next(get_db())
            
            # Check if user has active subscription to creator
            if "/creator/" in request.url.path and "/plan" in request.url.path:
                # This is a creator-specific endpoint
                # Extract creator_id from path
                path_parts = request.url.path.split('/')
                try:
                    creator_id_index = path_parts.index('creator') + 1
                    creator_id = int(path_parts[creator_id_index])
                    
                    # Check if user has active subscription to this creator
                    user_subscriptions = subscription_crud.get_user_subscriptions(
                        db, current_user.id, status='active'
                    )
                    
                    has_access = any(
                        sub.plan.creator_id == creator_id 
                        for sub in user_subscriptions
                    )
                    
                    if not has_access:
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={
                                "detail": "Subscription required to access creator content",
                                "required_tier": self.required_tier,
                                "required_feature": self.required_feature
                            }
                        )
                        
                except (ValueError, IndexError):
                    # If we can't extract creator_id, continue
                    pass
        
        return await call_next(request)


def require_subscription(tier: Optional[str] = None, feature: Optional[str] = None):
    """Decorator to require subscription for endpoint access"""
    
    def decorator(func):
        func._entitlement_requirements = {
            "tier": tier,
            "feature": feature
        }
        return func
    
    return decorator


def check_creator_access(db: Session, user_id: int, creator_id: int) -> bool:
    """Check if user has access to creator's content"""
    
    # If user is the creator themselves, allow access
    if user_id == creator_id:
        return True
    
    # Check for active subscription
    user_subscriptions = subscription_crud.get_user_subscriptions(db, user_id, status='active')
    
    return any(
        sub.plan.creator_id == creator_id 
        for sub in user_subscriptions
    )


def get_user_entitlements(db: Session, user_id: int) -> dict:
    """Get user's subscription entitlements"""
    
    user_subscriptions = subscription_crud.get_user_subscriptions(db, user_id, status='active')
    
    entitlements = {
        "active_subscriptions": len(user_subscriptions),
        "creators": [],
        "features": {
            "supporter_badge": False,
            "early_access": False,
            "exclusive_content": False,
            "direct_messaging": False
        }
    }
    
    for subscription in user_subscriptions:
        entitlements["creators"].append({
            "creator_id": subscription.plan.creator_id,
            "plan_name": subscription.plan.name,
            "tier": subscription.plan.tier.value
        })
        
        # Aggregate features from all subscriptions
        if subscription.plan.supporter_badge:
            entitlements["features"]["supporter_badge"] = True
        if subscription.plan.early_access:
            entitlements["features"]["early_access"] = True
        if subscription.plan.exclusive_content:
            entitlements["features"]["exclusive_content"] = True
        if subscription.plan.direct_messaging:
            entitlements["features"]["direct_messaging"] = True
    
    return entitlements