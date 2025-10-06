





from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import dispute as dispute_model
from app.models import user as user_model
from app.schemas import dispute as dispute_schema
from app.schemas import user as user_schema
from app.crud import dispute as dispute_crud
from app.crud.user import get_current_user_pydantic
from app.services.storage_service import get_storage_service

router = APIRouter()


@router.post("/", response_model=dispute_schema.Dispute)
def create_dispute(
    dispute: dispute_schema.DisputeCreate,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    db_dispute = dispute_crud.create_dispute(db=db, dispute=dispute, challenger_id=current_user.id)
    return dispute_schema.Dispute.from_orm(db_dispute)


@router.get("/", response_model=dispute_schema.DisputeList)
def read_disputes(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    game_id: Optional[int] = None,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    disputes = dispute_crud.get_disputes(
        db, skip=skip, limit=limit, status=status, game_id=game_id, user_id=current_user.id
    )
    total = dispute_crud.get_disputes_count(db, status=status, game_id=game_id, user_id=current_user.id)
    return {
        "disputes": [dispute_schema.Dispute.from_orm(d) for d in disputes],
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit
    }


@router.get("/{dispute_id}", response_model=dispute_schema.DisputeWithDetails)
def read_dispute(
    dispute_id: int,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this dispute")
    
    return dispute_schema.DisputeWithDetails.from_orm(dispute)


@router.put("/{dispute_id}", response_model=dispute_schema.Dispute)
def update_dispute(
    dispute_id: int,
    dispute: dispute_schema.DisputeUpdate,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    db_dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if db_dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if db_dispute.challenger_id != current_user.id and db_dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this dispute")
    
    updated_dispute = dispute_crud.update_dispute(db=db, dispute_id=dispute_id, dispute=dispute)
    return dispute_schema.Dispute.from_orm(updated_dispute)


@router.post("/{dispute_id}/confirm")
def confirm_dispute(
    dispute_id: int,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
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
async def submit_result(
    dispute_id: int,
    result: dispute_schema.DisputeResult,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
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
    
    return await dispute_crud.submit_result(
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
    current_user: user_schema.User = Depends(get_current_user_pydantic),
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
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add stream link")
    
    return dispute_crud.add_stream_link(db=db, dispute_id=dispute_id, stream_url=stream_link.stream_url)


@router.post("/{dispute_id}/link-truth-claim")
def link_truth_claim(
    dispute_id: int,
    claim_link: dispute_schema.TruthClaimLink,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Link a dispute to a Truth Archive claim for PolyVerse integration
    """
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to link truth claim")
    
    # Update dispute with truth claim ID
    dispute.truth_claim_id = claim_link.claim_id
    if claim_link.signal_strength is not None:
        # Cap at 2% maximum influence
        dispute.playful_signal_strength = min(0.02, claim_link.signal_strength)
    
    db.commit()
    db.refresh(dispute)
    
    # Link to PolyVerse asynchronously
    import asyncio
    from app.services.polyverse_integration import polyverse_integration
    asyncio.create_task(polyverse_integration.link_dispute_to_claim(dispute_id, claim_link.claim_id))
    
    return {"message": "Truth claim linked successfully", "dispute_id": dispute_id, "claim_id": claim_link.claim_id}


@router.get("/{dispute_id}/history", response_model=List[dispute_schema.MatchHistory])
def read_match_history(
    dispute_id: int,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view match history")
    
    return dispute_crud.get_match_history(db, dispute_id=dispute_id)


@router.post("/{dispute_id}/upload-proof")
async def upload_proof_file(
    dispute_id: int,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Upload a proof file (screenshot, replay, video) for a dispute
    """
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upload proof files")
    
    try:
        # Upload file to S3
        upload_result = await get_storage_service().upload_file(
            file, dispute_id, current_user.id
        )
        
        # Store proof metadata in database
        proof_data = {
            "filename": upload_result["filename"],
            "file_url": upload_result["file_url"],
            "presigned_url": upload_result["presigned_url"],
            "size": upload_result["size"],
            "mime_type": upload_result["mime_type"],
            "description": description,
            "uploaded_by": current_user.id
        }
        
        # Add proof to dispute
        dispute_crud.add_proof_file(db, dispute_id, proof_data)
        
        return {
            "message": "Proof file uploaded successfully",
            "proof_id": proof_data["filename"],
            "presigned_url": upload_result["presigned_url"],
            "file_info": upload_result
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload proof file: {str(e)}"
        )


@router.get("/{dispute_id}/proofs")
def get_proof_files(
    dispute_id: int,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Get all proof files for a dispute
    """
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is involved in this dispute
    if dispute.challenger_id != current_user.id and dispute.opponent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view proof files")
    
    proofs = dispute_crud.get_proof_files(db, dispute_id)
    
    # Generate fresh presigned URLs for each proof
    for proof in proofs:
        if proof.get("file_url") and proof["file_url"].startswith("s3://"):
            proof["presigned_url"] = get_storage_service().generate_presigned_url(
                proof["filename"], expires_in=3600
            )
    
    return {"proofs": proofs}


@router.delete("/{dispute_id}/proofs/{proof_filename}")
def delete_proof_file(
    dispute_id: int,
    proof_filename: str,
    current_user: user_schema.User = Depends(get_current_user_pydantic),
    db: Session = Depends(get_db)
):
    """
    Delete a proof file
    """
    dispute = dispute_crud.get_dispute(db, dispute_id=dispute_id)
    if dispute is None:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    # Check if user is the uploader of this proof
    proof = dispute_crud.get_proof_file(db, dispute_id, proof_filename)
    if not proof or proof.get("uploaded_by") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this proof file")
    
    # Delete from S3
    get_storage_service().delete_file(proof_filename)
    
    # Delete from database
    dispute_crud.delete_proof_file(db, dispute_id, proof_filename)
    
    return {"message": "Proof file deleted successfully"}


