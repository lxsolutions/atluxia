from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.artifact import Artifact, ArtifactRead, ArtifactCreate

router = APIRouter()


@router.get("/", response_model=List[ArtifactRead])
def get_artifacts(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get user's artifacts."""
    artifacts = session.exec(
        select(Artifact).where(Artifact.user_id == current_user.id)
    ).all()
    return artifacts


@router.post("/", response_model=ArtifactRead)
def create_artifact(
    artifact_data: ArtifactCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new artifact."""
    artifact = Artifact(
        user_id=current_user.id,
        **artifact_data.dict()
    )
    session.add(artifact)
    session.commit()
    session.refresh(artifact)
    return artifact
