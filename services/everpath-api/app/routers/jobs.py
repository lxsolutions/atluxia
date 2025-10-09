from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.job_lead import JobLead, JobLeadRead

router = APIRouter()


@router.get("/search", response_model=List[JobLeadRead])
def search_jobs(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Search for job leads relevant to user's skills and aspirations."""
    # For MVP, return all job leads
    job_leads = session.exec(select(JobLead)).all()
    return job_leads
