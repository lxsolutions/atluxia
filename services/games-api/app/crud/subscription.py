"""
CRUD operations for subscriptions
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import Optional, List
from app.models import subscription as subscription_model
from app.models import user as user_model
from app.schemas import subscription as subscription_schema
import stripe
from app.core.config import settings
import json
from datetime import datetime, timedelta


# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


def create_creator_plan(
    db: Session, 
    plan_data: subscription_schema.CreatorPlanCreate,
    creator_id: int
) -> subscription_model.CreatorPlan:
    """Create a new creator subscription plan"""
    
    # Create Stripe product and price
    try:
        product = stripe.Product.create(
            name=plan_data.name,
            description=plan_data.description,
            metadata={
                "creator_id": str(creator_id),
                "tier": plan_data.tier.value
            }
        )
        
        price = stripe.Price.create(
            product=product.id,
            unit_amount=int(plan_data.monthly_price * 100),  # Convert to cents
            currency="usd",
            recurring={"interval": "month"}
        )
        
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error creating plan: {str(e)}")
    
    # Create database record
    db_plan = subscription_model.CreatorPlan(
        creator_id=creator_id,
        name=plan_data.name,
        description=plan_data.description,
        tier=plan_data.tier,
        monthly_price=plan_data.monthly_price,
        supporter_badge=plan_data.supporter_badge,
        early_access=plan_data.early_access,
        exclusive_content=plan_data.exclusive_content,
        direct_messaging=plan_data.direct_messaging,
        custom_benefits=plan_data.custom_benefits,
        stripe_product_id=product.id,
        stripe_price_id=price.id
    )
    
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


def get_creator_plans(
    db: Session, 
    creator_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[subscription_model.CreatorPlan]:
    """Get creator plans, optionally filtered by creator"""
    query = db.query(subscription_model.CreatorPlan)
    
    if creator_id:
        query = query.filter(subscription_model.CreatorPlan.creator_id == creator_id)
    
    query = query.filter(subscription_model.CreatorPlan.is_active == True)
    
    return query.offset(skip).limit(limit).all()


def get_creator_plan(db: Session, plan_id: int) -> Optional[subscription_model.CreatorPlan]:
    """Get a specific creator plan"""
    return db.query(subscription_model.CreatorPlan).filter(
        subscription_model.CreatorPlan.id == plan_id,
        subscription_model.CreatorPlan.is_active == True
    ).first()


def create_subscription(
    db: Session,
    subscription_data: subscription_schema.UserSubscriptionCreate,
    user_id: int
) -> subscription_model.UserSubscription:
    """Create a new subscription for a user"""
    
    # Get the plan
    plan = get_creator_plan(db, subscription_data.plan_id)
    if not plan:
        raise Exception("Plan not found")
    
    # Get or create Stripe customer
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise Exception("User not found")
    
    try:
        # Create Stripe customer if needed
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.full_name or user.username,
                metadata={"user_id": str(user_id)}
            )
            user.stripe_customer_id = customer.id
            db.commit()
        
        # Create Stripe subscription
        subscription = stripe.Subscription.create(
            customer=user.stripe_customer_id,
            items=[{"price": plan.stripe_price_id}],
            payment_behavior="default_incomplete",
            payment_settings={"save_default_payment_method": "on_subscription"},
            expand=["latest_invoice.payment_intent"]
        )
        
        # Create database record
        db_subscription = subscription_model.UserSubscription(
            user_id=user_id,
            plan_id=subscription_data.plan_id,
            stripe_subscription_id=subscription.id,
            stripe_customer_id=user.stripe_customer_id,
            status=subscription.status,
            current_period_start=datetime.fromtimestamp(subscription.current_period_start),
            current_period_end=datetime.fromtimestamp(subscription.current_period_end),
            revenue_share_percent=80.00,  # 80% to creator
            platform_fee_percent=20.00   # 20% to platform
        )
        
        db.add(db_subscription)
        db.commit()
        db.refresh(db_subscription)
        
        return db_subscription
        
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error creating subscription: {str(e)}")


def get_user_subscriptions(
    db: Session, 
    user_id: int,
    status: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[subscription_model.UserSubscription]:
    """Get user's subscriptions"""
    query = db.query(subscription_model.UserSubscription).filter(
        subscription_model.UserSubscription.user_id == user_id
    )
    
    if status:
        query = query.filter(subscription_model.UserSubscription.status == status)
    
    return query.offset(skip).limit(limit).all()


def get_subscription(db: Session, subscription_id: int) -> Optional[subscription_model.UserSubscription]:
    """Get a specific subscription"""
    return db.query(subscription_model.UserSubscription).filter(
        subscription_model.UserSubscription.id == subscription_id
    ).first()


def cancel_subscription(db: Session, subscription_id: int) -> Optional[subscription_model.UserSubscription]:
    """Cancel a subscription"""
    subscription = get_subscription(db, subscription_id)
    if not subscription:
        return None
    
    try:
        # Cancel in Stripe
        stripe_subscription = stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True
        )
        
        # Update database
        subscription.cancel_at_period_end = True
        subscription.canceled_at = datetime.utcnow()
        
        db.commit()
        db.refresh(subscription)
        return subscription
        
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error canceling subscription: {str(e)}")


def handle_webhook_event(db: Session, event_data: dict) -> bool:
    """Handle Stripe webhook events for subscriptions"""
    try:
        event_type = event_data.get('type')
        
        if event_type == 'customer.subscription.updated':
            subscription_data = event_data['data']['object']
            
            # Find subscription in database
            subscription = db.query(subscription_model.UserSubscription).filter(
                subscription_model.UserSubscription.stripe_subscription_id == subscription_data['id']
            ).first()
            
            if subscription:
                subscription.status = subscription_data['status']
                subscription.current_period_start = datetime.fromtimestamp(subscription_data['current_period_start'])
                subscription.current_period_end = datetime.fromtimestamp(subscription_data['current_period_end'])
                subscription.cancel_at_period_end = subscription_data['cancel_at_period_end']
                
                if subscription_data['canceled_at']:
                    subscription.canceled_at = datetime.fromtimestamp(subscription_data['canceled_at'])
                
                db.commit()
                
        elif event_type == 'invoice.payment_succeeded':
            invoice_data = event_data['data']['object']
            subscription_id = invoice_data.get('subscription')
            
            if subscription_id:
                subscription = db.query(subscription_model.UserSubscription).filter(
                    subscription_model.UserSubscription.stripe_subscription_id == subscription_id
                ).first()
                
                if subscription:
                    # Create receipt
                    amount = invoice_data['amount_paid'] / 100.0  # Convert from cents
                    creator_amount = amount * (subscription.revenue_share_percent / 100)
                    platform_amount = amount * (subscription.platform_fee_percent / 100)
                    
                    receipt = subscription_model.SubscriptionReceipt(
                        subscription_id=subscription.id,
                        stripe_payment_intent_id=invoice_data['payment_intent'],
                        amount=amount,
                        currency=invoice_data['currency'],
                        creator_amount=creator_amount,
                        platform_amount=platform_amount,
                        transparency_record=json.dumps({
                            "invoice_id": invoice_data['id'],
                            "subscription_id": subscription_id,
                            "amount_paid": amount,
                            "revenue_share_percent": float(subscription.revenue_share_percent),
                            "platform_fee_percent": float(subscription.platform_fee_percent),
                            "creator_amount": float(creator_amount),
                            "platform_amount": float(platform_amount),
                            "payment_method": invoice_data.get('payment_method_types', []),
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    )
                    
                    db.add(receipt)
                    db.commit()
        
        return True
        
    except Exception as e:
        # Log error but don't fail the webhook
        print(f"Error handling webhook: {str(e)}")
        return False


def get_creator_profile(db: Session, creator_id: int) -> dict:
    """Get creator profile with subscription stats"""
    creator = db.query(user_model.User).filter(user_model.User.id == creator_id).first()
    if not creator:
        return None
    
    # Count active subscribers
    total_subscribers = db.query(func.count(subscription_model.UserSubscription.id)).filter(
        subscription_model.UserSubscription.plan_id.in_(
            db.query(subscription_model.CreatorPlan.id).filter(
                subscription_model.CreatorPlan.creator_id == creator_id
            )
        ),
        subscription_model.UserSubscription.status == 'active'
    ).scalar()
    
    # Calculate monthly revenue (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_revenue = db.query(func.sum(subscription_model.SubscriptionReceipt.creator_amount)).filter(
        subscription_model.SubscriptionReceipt.subscription_id.in_(
            db.query(subscription_model.UserSubscription.id).filter(
                subscription_model.UserSubscription.plan_id.in_(
                    db.query(subscription_model.CreatorPlan.id).filter(
                        subscription_model.CreatorPlan.creator_id == creator_id
                    )
                )
            )
        ),
        subscription_model.SubscriptionReceipt.created_at >= thirty_days_ago
    ).scalar() or 0
    
    return {
        "is_creator": creator.is_creator,
        "creator_bio": creator.creator_bio,
        "creator_specialties": json.loads(creator.creator_specialties) if creator.creator_specialties else [],
        "total_subscribers": total_subscribers,
        "monthly_revenue": monthly_revenue
    }