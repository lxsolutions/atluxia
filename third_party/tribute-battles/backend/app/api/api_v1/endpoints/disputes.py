





from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import dispute as dispute_model
from app.models import user as user_model
from app.schemas import dispute as dispute_schema
from app.crud import dispute as dispute_crud

router = APIRouter()


@router.post("/", response_model=dispute_schema.Dispute)
def create_dispute(
    dispute: dispute_schema.DisputeCreate,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return dispute_crud.create_dispute(db=db, dispute=dispute, challenger_id=current_user.id)


@router.get("/", response_model=dispute_schema.DisputeList)
def read_disputes(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    game_id: Optional[int] = None,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    disputes = dispute_crud.get_disputes(
        db, skip=skip, limit=limit, status=status, game_id=game_id, user_id=current_user.id
    )
    total = dispute_crud.get_disputes_count(db, status=status, game_id=game_id, user_id=current_user.id)
    return {
        "disputes": disputes,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit
    }


@router.get("/{dispute_id}", response_model=dispute_schema.DisputeWithDetails)
def read_dispute(
    dispute_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this dispute")
    
    return dispute


@router.put("/{dispute_id}", response_model=dispute_schema.Dispute)
def update_dispute(
    dispute_id: int,
    dispute: dispute_schema.DisputeUpdate,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if db_dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if db_dispute.challenger_id != current_user.id and db_dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this dispute")
    
    return dispute_crud.update_dispute(db=db, dispute_id=dispute_id, dispute=dispute)


@router.post("/{dispute_id}/confirm")
def confirm_dispute(
    dispute_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Only opponent can confirm
    if dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only opponent can confirm dispute")
    
    if dispute.status != dispute_model.DisputeStatus.PENDING:
        raise HTTPException(status_code=400, detail="Dispute already confirmed or in progress")
    
    return dispute_crud.confirm_dispute(db=db, dispute_id=dispute_id)


@router.post("/{dispute_id}/result", response_model=dispute_schema.Dispute)
def submit_result(
    dispute_id: int,
    result: dispute_schema.DisputeResult,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit result")
    
    if dispute.status != dispute_model.DisputeStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Dispute must be confirmed before submitting result")
    
    return dispute_crud.submit_result(
        db=db, 
        dispute_id=dispute_id, 
        winner_id=result.winner_id, 
        score=result.score, 
        proof_url=result.proof_url,
        notes=result.notes
    )


@router.post("/{dispute_id}/payout")
def request_payout(
    dispute_id: int,
    payout_request: dispute_schema.PayoutRequest,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Only winner can request payout
    if dispute.winner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only winner can request payout")
    
    if dispute.status != dispute_model.DisputeStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Dispute must be completed before requesting payout")
    
    return dispute_crud.request_payout(
        db=db, 
        dispute_id=dispute_id, 
        proof_url=payout_request.winner_proof_url
    )


@router.post("/{dispute_id}/stream")
def add_stream_link(
    dispute_id: int,
    stream_link: dispute_schema.StreamLink,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add stream link")
    
    return dispute_crud.add_stream_link(db=db, dispute_id=dispute_id, stream_url=stream_link.stream_url)


@router.get("/{dispute_id}/history", response_model=List[dispute_schema.MatchHistory])
def read_match_history(
    dispute_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view match history")
    
    return dispute_crud.get_match_history(db, dispute_id=dispute_id)


# Need to import get_current_user
from app.crud.user import get_current_user


