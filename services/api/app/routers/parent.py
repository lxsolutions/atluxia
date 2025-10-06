from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.user import UserRead

router = APIRouter()


@router.get("/children", response_model=List[UserRead])
def get_children(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get parent's children."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(status_code=403, detail="Only parents can access this endpoint")
    
    children = session.exec(
        select(User).where(User.guardian_id == current_user.id)
    ).all()
    return children


@router.patch("/settings")
def update_parent_settings(
    settings: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update parent settings for a child."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(status_code=403, detail="Only parents can access this endpoint")
    
    # TODO: Implement parent settings update
    return {"message": "Parent settings updated successfully"}
