















from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter(
    prefix="/appeals",
    tags=["appeals"],
    responses={404: {"description": "Not found"}}
)

class AppealRequest(BaseModel):
    decision_id: int
    appeal_reason: str
    evidence: List[Dict[str, Any]]

class AppealResponse(BaseModel):
    status: str
    message: str
    appeal_id: str
    next_steps: Dict[str, Any]

@router.post("/file", response_model=AppealResponse)
def file_appeal(appeal_request: AppealRequest):
    """
    File an appeal, pause linked plan, and create ledger entry
    """
    try:
        # In a real system, this would:
        # 1. Pause the linked decision
        # 2. Create an appeal record in the database
        # 3. Notify the human panel

        # For demo purposes, return mock response
        appeal_id = f"APL-2025-{appeal_request.decision_id:04d}"

        return AppealResponse(
            status="appeal_filed",
            message="Plan paused and appeal logged. Panel review scheduled.",
            appeal_id=appeal_id,
            next_steps={
                "panel_review_hours": 48,
                "decision_expected_by": (datetime.datetime.now() + datetime.timedelta(hours=48)).isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))











