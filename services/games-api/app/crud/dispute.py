





from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models import dispute as dispute_model
from app.models import user as user_model
from app.models import game as game_model
from app.schemas import dispute as dispute_schema
from app.services.polyverse_integration import polyverse_integration
from app.services.rating_engine import rating_engine
from app.services.verification_service import verification_service
import asyncio


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


async def submit_result(
    db: Session,
    dispute_id: int,
    winner_id: int,
    score: str,
    proof_url: str,
    notes: Optional[str] = None, verification_data: Optional[dict] = None
) -> dispute_model.Dispute:
    db_dispute = get_dispute(db, dispute_id)
    if db_dispute is None:
        return None

    # Perform automatic verification if proof is provided
    if proof_url and db_dispute.game:
        try:
            # Simple heuristic verification based on proof URL and game type
            verification_result = await verification_service._verify_manual(
                {
                    "players": [
                        {"id": db_dispute.challenger_id, "side": db_dispute.challenger_side},
                        {"id": db_dispute.opponent_id, "side": db_dispute.opponent_side}
                    ],
                    "winner": winner_id,
                    "score": score,
                    "game_type": db_dispute.game.slug if db_dispute.game else "manual"
                },
                None  # No file uploads in this context
            )
            
            db_dispute.verification_status = "verified" if verification_result["verified"] else "pending"
            db_dispute.verification_data = verification_result
            db_dispute.winner_proof_verified = verification_result["verified"]
            
        except Exception as e:
            # If verification fails, mark as pending manual review
            db_dispute.verification_status = "pending"
            db_dispute.winner_proof_verified = False

    
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
    
    # Emit PlayfulSignal to PolyVerse if dispute is linked to a truth claim
    if db_dispute.truth_claim_id:
        # Prepare dispute data for PlayfulSignal
        dispute_data = {
            'id': db_dispute.id,
            'truth_claim_id': db_dispute.truth_claim_id,
            'winner_id': db_dispute.winner_id,
            'winner_side': db_dispute.challenger_side if db_dispute.winner_id == db_dispute.challenger_id else db_dispute.opponent_side,
            'playful_signal_strength': db_dispute.playful_signal_strength,
            'game_name': db_dispute.game.name if db_dispute.game else None,
            'entry_fee': db_dispute.entry_fee,
            'winner_proof_verified': db_dispute.winner_proof_verified
        }
        
        # Emit signal asynchronously (don't block the response)
        asyncio.create_task(polyverse_integration.emit_playful_signal(dispute_data))
    
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
    """
    Update leaderboard with transactional rating updates for both Elo and Glicko-2 systems
    """
    # Update leaderboard for both players
    challenger_entry = db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.user_id == dispute.challenger_id,
        dispute_model.Leaderboard.game_id == dispute.game_id
    ).first()
    
    opponent_entry = db.query(dispute_model.Leaderboard).filter(
        dispute_model.Leaderboard.user_id == dispute.opponent_id,
        dispute_model.Leaderboard.game_id == dispute.game_id
    ).first()
    
    # Create entries if they don't exist
    if not challenger_entry:
        challenger_entry = dispute_model.Leaderboard(
            user_id=dispute.challenger_id,
            game_id=dispute.game_id,
            elo_rating=rating_engine.initial_rating,
            glicko_rating=rating_engine.initial_rating,
            glicko_rating_deviation=350,  # Default RD for new players
            glicko_volatility=0.06  # Default volatility
        )
        db.add(challenger_entry)
    
    if not opponent_entry:
        opponent_entry = dispute_model.Leaderboard(
            user_id=dispute.opponent_id,
            game_id=dispute.game_id,
            elo_rating=rating_engine.initial_rating,
            glicko_rating=rating_engine.initial_rating,
            glicko_rating_deviation=350,  # Default RD for new players
            glicko_volatility=0.06  # Default volatility
        )
        db.add(opponent_entry)
    
    # Update user stats
    challenger_user = db.query(user_model.User).filter(user_model.User.id == dispute.challenger_id).first()
    opponent_user = db.query(user_model.User).filter(user_model.User.id == dispute.opponent_id).first()
    
    if challenger_user:
        challenger_entry.wins = challenger_user.total_wins
        challenger_entry.losses = challenger_user.total_losses
        challenger_entry.total_matches = challenger_user.total_matches_played
        
        if challenger_user.total_matches_played > 0:
            challenger_entry.win_rate = (challenger_user.total_wins / challenger_user.total_matches_played) * 100
    
    if opponent_user:
        opponent_entry.wins = opponent_user.total_wins
        opponent_entry.losses = opponent_user.total_losses
        opponent_entry.total_matches = opponent_user.total_matches_played
        
        if opponent_user.total_matches_played > 0:
            opponent_entry.win_rate = (opponent_user.total_wins / opponent_user.total_matches_played) * 100
    
    # Calculate ratings for both systems
    if dispute.winner_id:
        # Determine score (1 for winner, 0 for loser, 0.5 for draw if supported)
        challenger_score = 1.0 if dispute.winner_id == dispute.challenger_id else 0.0
        opponent_score = 1.0 if dispute.winner_id == dispute.opponent_id else 0.0
        
        # Calculate new ELO ratings
        new_challenger_elo, new_opponent_elo = rating_engine.calculate_elo(
            challenger_entry.elo_rating,
            opponent_entry.elo_rating,
            challenger_score
        )
        
        # Calculate new Glicko-2 ratings
        challenger_glicko_data, opponent_glicko_data = rating_engine.calculate_glicko2(
            challenger_entry.glicko_rating,
            challenger_entry.glicko_rating_deviation,
            challenger_entry.glicko_volatility,
            opponent_entry.glicko_rating,
            opponent_entry.glicko_rating_deviation,
            opponent_entry.glicko_volatility,
            challenger_score
        )
        
        # Update ratings
        challenger_entry.elo_rating = new_challenger_elo
        opponent_entry.elo_rating = new_opponent_elo
        
        challenger_entry.glicko_rating = challenger_glicko_data['rating']
        challenger_entry.glicko_rating_deviation = challenger_glicko_data['rating_deviation']
        challenger_entry.glicko_volatility = challenger_glicko_data['volatility']
        
        opponent_entry.glicko_rating = opponent_glicko_data['rating']
        opponent_entry.glicko_rating_deviation = opponent_glicko_data['rating_deviation']
        opponent_entry.glicko_volatility = opponent_glicko_data['volatility']
        
        # Update streaks
        if dispute.winner_id == dispute.challenger_id:
            challenger_entry.current_streak += 1
            challenger_entry.longest_streak = max(challenger_entry.longest_streak, challenger_entry.current_streak)
            opponent_entry.current_streak = 0
        else:
            opponent_entry.current_streak += 1
            opponent_entry.longest_streak = max(opponent_entry.longest_streak, opponent_entry.current_streak)
            challenger_entry.current_streak = 0
    
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


def add_proof_file(db: Session, dispute_id: int, proof_data: dict) -> dict:
    """
    Add a proof file to the database
    """
    from app.models.dispute import ProofFile
    
    proof_file = ProofFile(
        dispute_id=dispute_id,
        uploaded_by=proof_data["uploaded_by"],
        filename=proof_data["filename"],
        file_url=proof_data["file_url"],
        original_filename=proof_data.get("original_filename", proof_data["filename"]),
        size=proof_data["size"],
        mime_type=proof_data["mime_type"],
        description=proof_data.get("description"),
        virus_scan_clean=True,  # Assuming clean since it passed validation
        virus_scan_reason="Basic validation passed"
    )
    
    db.add(proof_file)
    db.commit()
    db.refresh(proof_file)
    
    return {
        "id": proof_file.id,
        "filename": proof_file.filename,
        "file_url": proof_file.file_url,
        "size": proof_file.size,
        "mime_type": proof_file.mime_type,
        "description": proof_file.description,
        "uploaded_by": proof_file.uploaded_by,
        "uploaded_at": proof_file.uploaded_at
    }


def get_proof_files(db: Session, dispute_id: int) -> list:
    """
    Get all proof files for a dispute
    """
    from app.models.dispute import ProofFile
    
    proof_files = db.query(ProofFile).filter(
        ProofFile.dispute_id == dispute_id
    ).all()
    
    return [
        {
            "id": pf.id,
            "filename": pf.filename,
            "file_url": pf.file_url,
            "original_filename": pf.original_filename,
            "size": pf.size,
            "mime_type": pf.mime_type,
            "description": pf.description,
            "uploaded_by": pf.uploaded_by,
            "uploaded_at": pf.uploaded_at,
            "virus_scan_clean": pf.virus_scan_clean,
            "virus_scan_reason": pf.virus_scan_reason
        }
        for pf in proof_files
    ]


def get_proof_file(db: Session, dispute_id: int, filename: str) -> Optional[dict]:
    """
    Get a specific proof file
    """
    from app.models.dispute import ProofFile
    
    proof_file = db.query(ProofFile).filter(
        ProofFile.dispute_id == dispute_id,
        ProofFile.filename == filename
    ).first()
    
    if not proof_file:
        return None
    
    return {
        "id": proof_file.id,
        "filename": proof_file.filename,
        "file_url": proof_file.file_url,
        "original_filename": proof_file.original_filename,
        "size": proof_file.size,
        "mime_type": proof_file.mime_type,
        "description": proof_file.description,
        "uploaded_by": proof_file.uploaded_by,
        "uploaded_at": proof_file.uploaded_at,
        "virus_scan_clean": proof_file.virus_scan_clean,
        "virus_scan_reason": proof_file.virus_scan_reason
    }


def delete_proof_file(db: Session, dispute_id: int, filename: str) -> bool:
    """
    Delete a proof file from database
    """
    from app.models.dispute import ProofFile
    
    proof_file = db.query(ProofFile).filter(
        ProofFile.dispute_id == dispute_id,
        ProofFile.filename == filename
    ).first()
    
    if proof_file:
        db.delete(proof_file)
        db.commit()
        return True
    
    return False


