from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.assessment import Assessment, AssessmentRead

router = APIRouter()


@router.get("/", response_model=List[AssessmentRead])
def get_assessments(session: Session = Depends(get_session)):
    """Get all available assessments."""
    assessments = session.exec(select(Assessment)).all()
    return assessments


@router.post("/submit")
def submit_assessment(
    assessment_id: int,
    result_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Submit assessment results and update user skills."""
    # TODO: Implement assessment submission and skill update logic
    # For MVP, return success
    return {"message": "Assessment submitted successfully", "assessment_id": assessment_id}
