"""
Payment endpoints for Stripe and crypto payments
"""
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import user as user_model
from app.models import dispute as dispute_model
from app.schemas import dispute as dispute_schema
from app.schemas import user as user_schema
from app.crud import dispute as dispute_crud
from app.crud.user import get_current_user_pydantic
from app.services.stripe_service import stripe_service
from app.services.verification_service import verification_service

router = APIRouter()


@router.post("/stripe/payment-intent")
async def create_stripe_payment_intent(
    payment_data: dispute_schema.StripePaymentCreate,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Payment Intent for dispute entry fee
    """
    try:
        # Convert amount to cents
        amount_cents = int(payment_data.amount * 100)
        
        # Create metadata for the payment
        metadata = {
            'user_id': str(current_user.id),
            'dispute_id': str(payment_data.dispute_id),
            'purpose': 'dispute_entry_fee'
        }
        
        # Create payment intent
        intent = await stripe_service.create_payment_intent(
            amount=amount_cents,
            currency=payment_data.currency,
            metadata=metadata
        )
        
        return {
            'client_secret': intent['client_secret'],
            'payment_intent_id': intent['id'],
            'status': intent['status']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment intent creation failed: {str(e)}"
        )


@router.post("/stripe/connect/onboarding")
async def create_stripe_connect_onboarding(
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Create Stripe Connect onboarding for a user
    """
    try:
        # Check if user already has a Stripe account
        if current_user.stripe_account_id:
            # Create new account link for existing account
            account_link = await stripe_service.create_account_link(current_user.stripe_account_id)
            return {
                'onboarding_url': account_link['url'],
                'account_id': current_user.stripe_account_id,
                'existing': True
            }
        
        # Create new Stripe Connect account
        user_data = {
            'email': current_user.email,
            'first_name': current_user.full_name.split(' ')[0] if current_user.full_name else '',
            'last_name': ' '.join(current_user.full_name.split(' ')[1:]) if current_user.full_name else ''
        }
        
        account = await stripe_service.create_connect_account(user_data)
        
        # Save Stripe account ID to user
        current_user.stripe_account_id = account['id']
        db.commit()
        
        # Create account link for onboarding
        account_link = await stripe_service.create_account_link(account['id'])
        
        return {
            'onboarding_url': account_link['url'],
            'account_id': account['id'],
            'existing': False
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe Connect onboarding failed: {str(e)}"
        )


@router.post("/stripe/webhook")
async def handle_stripe_webhook(
    background_tasks: BackgroundTasks,
    payload: bytes = Depends(lambda x: x.body()),
    stripe_signature: str = Depends(lambda x: x.headers.get("stripe-signature"))
):
    """
    Handle Stripe webhook events
    """
    try:
        # Verify webhook signature
        if not await stripe_service.verify_webhook_signature(payload, stripe_signature):
            raise HTTPException(status_code=400, detail="Invalid signature")
        
        # Parse webhook event
        import json
        event = json.loads(payload.decode())
        
        # Handle different event types
        event_type = event['type']
        
        if event_type == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            background_tasks.add_task(
                handle_successful_payment,
                payment_intent
            )
        elif event_type == 'account.updated':
            account = event['data']['object']
            background_tasks.add_task(
                handle_account_update,
                account
            )
        
        return {'status': 'success'}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook processing failed: {str(e)}"
        )


@router.post("/verify/match")
async def verify_match_result(
    verification_data: dispute_schema.MatchVerification,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Verify a match result using appropriate game adapter
    """
    try:
        # Get the dispute
        dispute = dispute_crud.get_dispute(db, verification_data.dispute_id)
        if not dispute:
            raise HTTPException(status_code=404, detail="Dispute not found")
        
        # Verify the user has permission to verify this match
        if current_user.id not in [dispute.challenger_id, dispute.opponent_id]:
            raise HTTPException(status_code=403, detail="Not authorized to verify this match")
        
        # Process verification
        verification_result = await verification_service.verify_match(
            game_type=verification_data.game_type,
            match_data=verification_data.match_data,
            proof_files=verification_data.proof_files
        )
        
        # Update dispute with verification result
        dispute.verification_status = 'verified' if verification_result['verified'] else 'pending'
        dispute.verification_data = verification_result
        db.commit()
        
        return verification_result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Match verification failed: {str(e)}"
        )


@router.get("/stripe/account/status")
async def get_stripe_account_status(
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Get Stripe Connect account status
    """
    if not current_user.stripe_account_id:
        raise HTTPException(status_code=404, detail="No Stripe account found")
    
    try:
        import stripe
        account = stripe.Account.retrieve(current_user.stripe_account_id)
        
        return {
            'account_id': account.id,
            'details_submitted': account.details_submitted,
            'charges_enabled': account.charges_enabled,
            'payouts_enabled': account.payouts_enabled,
            'requirements': account.requirements,
            'status': 'complete' if account.details_submitted and account.charges_enabled else 'incomplete'
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )


@router.post("/usdc/escrow/create")
async def create_usdc_escrow(
    escrow_data: dispute_schema.USDCEscrowCreate,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Create a USDC escrow for a dispute
    """
    try:
        from app.services.blockchain_service import blockchain_service
        
        # Create escrow on blockchain
        result = await blockchain_service.create_dispute_escrow(
            network=escrow_data.network,
            dispute_id=escrow_data.dispute_id,
            challenger_address=escrow_data.challenger_address,
            opponent_address=escrow_data.opponent_address,
            entry_fee=escrow_data.entry_fee
        )
        
        return {
            'escrow_created': True,
            'transaction_data': result['transaction_data'],
            'dispute_id': result['dispute_id'],
            'network': result['network']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"USDC escrow creation failed: {str(e)}"
        )


@router.post("/usdc/escrow/deposit")
async def deposit_usdc_escrow(
    deposit_data: dispute_schema.USDCDeposit,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Deposit USDC to an escrow
    """
    try:
        from app.services.blockchain_service import blockchain_service
        
        # Verify user is a participant in the dispute
        dispute = dispute_crud.get_dispute(db, deposit_data.dispute_id)
        if not dispute:
            raise HTTPException(status_code=404, detail="Dispute not found")
        
        if current_user.id not in [dispute.challenger_id, dispute.opponent_id]:
            raise HTTPException(status_code=403, detail="Not authorized to deposit to this escrow")
        
        # Deposit to escrow
        result = await blockchain_service.deposit_entry_fee(
            network=deposit_data.network,
            dispute_id=deposit_data.dispute_id,
            user_address=deposit_data.user_address,
            private_key=deposit_data.private_key  # In production, this would be handled securely
        )
        
        return {
            'deposit_created': True,
            'approve_transaction': result['approve_transaction'],
            'deposit_transaction': result['deposit_transaction'],
            'dispute_id': result['dispute_id'],
            'entry_fee': result['entry_fee']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"USDC deposit failed: {str(e)}"
        )


@router.post("/usdc/escrow/claim")
async def claim_usdc_escrow(
    claim_data: dispute_schema.USDCClaim,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Claim winnings from a USDC escrow
    """
    try:
        from app.services.blockchain_service import blockchain_service
        
        # Verify user is authorized to claim (admin or winner)
        dispute = dispute_crud.get_dispute(db, claim_data.dispute_id)
        if not dispute:
            raise HTTPException(status_code=404, detail="Dispute not found")
        
        # In production, this would check if the user is the winner or an admin
        
        # Claim winnings
        result = await blockchain_service.claim_winnings(
            network=claim_data.network,
            dispute_id=claim_data.dispute_id,
            winner_address=claim_data.winner_address,
            proof_hash=claim_data.proof_hash
        )
        
        return {
            'claim_created': True,
            'transaction_data': result['transaction_data'],
            'dispute_id': result['dispute_id'],
            'winner_address': result['winner_address']
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"USDC claim failed: {str(e)}"
        )


@router.get("/usdc/escrow/{dispute_id}")
async def get_usdc_escrow_status(
    dispute_id: int,
    network: str,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Get USDC escrow status for a dispute
    """
    try:
        from app.services.blockchain_service import blockchain_service
        
        # Get escrow status from blockchain
        dispute = await blockchain_service.get_dispute(network, dispute_id)
        
        return {
            'dispute': dispute,
            'network': network
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get escrow status: {str(e)}"
        )


# Background task handlers
async def handle_successful_payment(payment_intent: Dict[str, Any]):
    """Handle successful payment webhook"""
    # This would update the database with payment confirmation
    # and trigger dispute state changes
    pass


async def handle_account_update(account: Dict[str, Any]):
    """Handle Stripe account update webhook"""
    # This would update user account status in the database
    pass