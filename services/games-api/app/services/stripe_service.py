"""
Stripe payment service for handling payments and webhooks
"""
import stripe
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import settings

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service for handling Stripe payments and webhooks"""
    
    def __init__(self):
        self.webhook_secret = None  # Would be set from environment in production
    
    async def create_payment_intent(
        self, 
        amount: int, 
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe Payment Intent
        
        Args:
            amount: Amount in smallest currency unit (e.g., cents for USD)
            currency: Currency code (default: "usd")
            metadata: Additional metadata for the payment
            
        Returns:
            Stripe Payment Intent object
        """
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            return {
                'client_secret': intent.client_secret,
                'id': intent.id,
                'status': intent.status
            }
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    async def create_connect_account(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a Stripe Connect account for a user
        
        Args:
            user_data: User information for account creation
            
        Returns:
            Stripe Account object
        """
        try:
            account = stripe.Account.create(
                type="express",
                country="US",
                email=user_data.get('email'),
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
                business_type="individual",
                individual={
                    "first_name": user_data.get('first_name', ''),
                    "last_name": user_data.get('last_name', ''),
                    "email": user_data.get('email'),
                },
            )
            return {
                'id': account.id,
                'details_submitted': account.details_submitted
            }
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe Connect error: {str(e)}"
            )
    
    async def create_account_link(self, account_id: str) -> Dict[str, Any]:
        """
        Create an account link for Stripe Connect onboarding
        
        Args:
            account_id: Stripe Connect account ID
            
        Returns:
            Account link URL
        """
        try:
            link = stripe.AccountLink.create(
                account=account_id,
                refresh_url=f"{settings.FRONTEND_URL}/stripe/onboarding/refresh",
                return_url=f"{settings.FRONTEND_URL}/stripe/onboarding/success",
                type="account_onboarding",
            )
            return {'url': link.url}
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe account link error: {str(e)}"
            )
    
    async def verify_webhook_signature(self, payload: bytes, sig_header: str) -> bool:
        """
        Verify Stripe webhook signature
        
        Args:
            payload: Raw request payload
            sig_header: Stripe signature header
            
        Returns:
            Boolean indicating if signature is valid
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            return True
        except stripe.error.SignatureVerificationError:
            return False
        except Exception:
            return False
    
    async def handle_payment_success(self, payment_intent_id: str) -> Dict[str, Any]:
        """
        Handle successful payment webhook
        
        Args:
            payment_intent_id: Stripe Payment Intent ID
            
        Returns:
            Payment information
        """
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == 'succeeded':
                return {
                    'id': payment_intent.id,
                    'amount': payment_intent.amount,
                    'currency': payment_intent.currency,
                    'metadata': payment_intent.metadata,
                    'status': payment_intent.status
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Payment not succeeded: {payment_intent.status}"
                )
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    async def create_payout(self, account_id: str, amount: int, currency: str = "usd") -> Dict[str, Any]:
        """
        Create a payout to a connected account
        
        Args:
            account_id: Stripe Connect account ID
            amount: Amount in smallest currency unit
            currency: Currency code
            
        Returns:
            Payout information
        """
        try:
            payout = stripe.Payout.create(
                amount=amount,
                currency=currency,
                destination=account_id,
            )
            return {
                'id': payout.id,
                'amount': payout.amount,
                'currency': payout.currency,
                'status': payout.status
            }
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe payout error: {str(e)}"
            )


# Global Stripe service instance
stripe_service = StripeService()