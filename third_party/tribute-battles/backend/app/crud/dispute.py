





from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import dispute as dispute_model
from app.models import user as user_model
from app.models import game as game_model
from app.schemas import dispute as dispute_schema


def get_dispute(db: Session, dispute_id: int) -> Optional[dispute_model.Dispute]:
    return db.query(dispute_model.Dispute).filter(dispute_model.Dispute.id == dispute_id).first()


def get_disputes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    game_id: Optional[int] = None,
    user_id: Optional[int] = None
) -> List[dispute_model.Dispute]:
    query = db.query(dispute_model.Dispute)
    
    if status:
        query = query.filter(dispute_model.Dispute.status == status)
    if game_id:
        query = query.filter(dispute_model.Dispute.game_id == game_id)
    if user_id:
        query = query.filter(
            or_(
                dispute_model.Dispute.challenger_id == user_id,
                dispute_model.Dispute.opponent_id == user_id
            )
        )
    
    return query.offset(skip).limit(limit).all()


def get_disputes_count(
    db: Session,
    status: Optional[str] = None,
    game_id: Optional[int] = None,
    user_id: Optional[int] = None
) -> int:
    query = db.query(dispute_model.Dispute)
    
    if status:
        query = query.filter(dispute_model.Dispute.status == status)
    if game_id:
        query = query.filter(dispute_model.Dispute.game_id == game_id)
    if user_id:
        query = query.filter(
            or_(
                dispute_model.Dispute.challenger_id == user_id,
                dispute_model.Dispute.opponent_id == user_id
            )
        )
    
    return query.count()


def create_dispute(
    db: Session, 
    dispute: dispute_schema.DisputeCreate, 
    challenger_id: int
) -> dispute_model.Dispute:
    # Find opponent by email if provided
    opponent = None
    if dispute.opponent_email:
        opponent = db.query(user_model.User).filter(
            user_model.User.email == dispute.opponent_email
        ).first()
        if not opponent:
            raise ValueError("Opponent not found")
    
    db_dispute = dispute_model.Dispute(
        title=dispute.title,
        description=dispute.description,
        game_id=dispute.game_id,
        game_variant_id=dispute.game_variant_id,
        challenger_id=challenger_id,
        opponent_id=opponent.id if opponent else None,
        challenger_side=dispute.challenger_side,
        opponent_side=dispute.opponent_side,
        entry_fee=dispute.entry_fee,
        payment_method=dispute.payment_method,
        currency=dispute.currency,
        is_streamed=dispute.is_streamed,
        stream_url=dispute.stream_url,
        status=dispute_model.DisputeStatus.PENDING
    )
    
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def update_dispute(
    db: Session, 
    dispute_id: int, 
    dispute: dispute_schema.DisputeUpdate
) -> dispute_model.Dispute:
    db_dispute = get_dispute(db, dispute_id)
    if db_dispute is None:
        return None
    
    update_data = dispute.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_dispute, field, value)
    
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def confirm_dispute(db: Session, dispute_id: int) -> dispute_model.Dispute:
    db_dispute = get_dispute(db, dispute_id)
    if db_dispute is None:
        return None
    
    db_dispute.status = dispute_model.DisputeStatus.CONFIRMED
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def submit_result(
    db: Session,
    dispute_id: int,
    winner_id: int,
    score: str,
    proof_url: str,
    notes: Optional[str] = None
) -> dispute_model.Dispute:
    db_dispute = get_dispute(db, dispute_id)
    if db_dispute is None:
        return None
    
    # Update dispute status and winner
    db_dispute.status = dispute_model.DisputeStatus.COMPLETED
    db_dispute.winner_id = winner_id
    db_dispute.winner_proof_url = proof_url
    db_dispute.completed_at = db.func.now()
    
    # Create match history entry
    match_history = dispute_model.MatchHistory(
        dispute_id=dispute_id,
        winner_id=winner_id,
        score=score,
        screenshot_url=proof_url,
        notes=notes
    )
    db.add(match_history)
    
    # Update user statistics
    winner = db.query(user_model.User).filter(user_model.User.id == winner_id).first()
    loser = db.query(user_model.User).filter(
        user_model.User.id != winner_id
    ).filter(
        or_(
            user_model.User.id == db_dispute.challenger_id,
            user_model.User.id == db_dispute.opponent_id
        )
    ).first()
    
    if winner:
        winner.total_wins += 1
        winner.total_matches_played += 1
        winner.total_tribute_earned += db_dispute.entry_fee
    
    if loser:
        loser.total_losses += 1
        loser.total_matches_played += 1
    
    # Update argument history
    update_argument_history(db, db_dispute)
    
    # Update leaderboard
    update_leaderboard(db, db_dispute)
    
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def request_payout(db: Session, dispute_id: int, proof_url: str) -> dispute_model.Dispute:
    db_dispute = get_dispute(db, dispute_id)
    if db_dispute is None:
        return None
    
    db_dispute.winner_proof_url = proof_url
    db_dispute.payout_processed = True
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def add_stream_link(db: Session, dispute_id: int, stream_url: str) -> dispute_model.Dispute:
    db_dispute = get_dispute(db, dispute_id)
    if db_dispute is None:
        return None
    
    db_dispute.is_streamed = True
    db_dispute.stream_url = stream_url
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def get_match_history(db: Session, dispute_id: int) -> List[dispute_model.MatchHistory]:
    return db.query(dispute_model.MatchHistory).filter(
        dispute_model.MatchHistory.dispute_id == dispute_id
    ).all()


def update_argument_history(db: Session, dispute: dispute_model.Dispute):
    # Find or create argument history entry
    argument_history = db.query(dispute_model.ArgumentHistory).filter(
        dispute_model.ArgumentHistory.argument_name == dispute.title,
        dispute_model.ArgumentHistory.game_id == dispute.game_id
    ).first()
    
    if not argument_history:
        argument_history = dispute_model.ArgumentHistory(
            argument_name=dispute.title,
            game_id=dispute.game_id,
            side_a_name=dispute.challenger_side,
            side_b_name=dispute.opponent_side
        )
        db.add(argument_history)
    
    # Update win counts
    if dispute.winner_id == dispute.challenger_id:
        argument_history.side_a_wins += 1
    else:
        argument_history.side_b_wins += 1
    
    argument_history.total_matches += 1
    db.commit()


def update_leaderboard(db: Session, dispute: dispute_model.Dispute):
    # Update leaderboard for both players
    for user_id in [dispute.challenger_id, dispute.opponent_id]:
        leaderboard_entry = db.query(dispute_model.Leaderboard).filter(
            dispute_model.Leaderboard.user_id == user_id,
            dispute_model.Leaderboard.game_id == dispute.game_id
        ).first()
        
        if not leaderboard_entry:
            leaderboard_entry = dispute_model.Leaderboard(
                user_id=user_id,
                game_id=dispute.game_id
            )
            db.add(leaderboard_entry)
        
        # Update stats
        user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
        if user:
            leaderboard_entry.wins = user.total_wins
            leaderboard_entry.losses = user.total_losses
            leaderboard_entry.total_matches = user.total_matches_played
            
            # Calculate win rate
            if user.total_matches_played > 0:
                leaderboard_entry.win_rate = (user.total_wins / user.total_matches_played) * 100
            
            # Calculate ELO rating (simplified)
            if user.total_matches_played > 0:
                expected_score = 1 / (1 + 10 ** ((1000 - leaderboard_entry.elo_rating) / 400))
                if user_id == dispute.winner_id:
                    leaderboard_entry.elo_rating += 32 * (1 - expected_score)
                else:
                    leaderboard_entry.elo_rating += 32 * (0 - expected_score)
        
        db.commit()


def create_escrow_transaction(
    db: Session,
    dispute_id: int,
    user_id: int,
    amount: float,
    payment_method: dispute_model.PaymentMethod,
    transaction_id: str
) -> dispute_model.EscrowTransaction:
    escrow = dispute_model.EscrowTransaction(
        dispute_id=dispute_id,
        user_id=user_id,
        amount=amount,
        payment_method=payment_method,
        transaction_id=transaction_id,
        status="completed"
    )
    db.add(escrow)
    db.commit()
    db.refresh(escrow)
    return escrow


