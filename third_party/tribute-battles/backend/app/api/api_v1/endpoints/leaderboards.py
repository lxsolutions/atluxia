







from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import user as user_model
from app.schemas import dispute as dispute_schema
from app.crud import leaderboard as leaderboard_crud

router = APIRouter()


@router.get("/", response_model=dispute_schema.LeaderboardList)
def read_leaderboards(
    game_id: int,
    skip: int = 0,
    limit: int = 100,
    sort_by: str = "rank",
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    leaderboards = leaderboard_crud.get_leaderboards(
        db, game_id=game_id, skip=skip, limit=limit, sort_by=sort_by
    )
    total = leaderboard_crud.get_leaderboards_count(db, game_id=game_id)
    
    return {
        "leaderboards": leaderboards,
        "total": total,
        "game_id": game_id,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit
    }


@router.get("/user/{user_id}", response_model=List[dispute_schema.Leaderboard])
def read_user_leaderboards(
    user_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user can access this data
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return leaderboard_crud.get_user_leaderboards(db, user_id=user_id)


@router.get("/global/{game_id}", response_model=List[dispute_schema.Leaderboard])
def read_global_leaderboard(
    game_id: int,
    limit: int = 100,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_global_leaderboard(db, game_id=game_id, limit=limit)


@router.get("/stats/{game_id}")
def read_game_stats(
    game_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_game_stats(db, game_id=game_id)


@router.get("/ranks/{user_id}/{game_id}")
def read_user_rank(
    user_id: int,
    game_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user can access this data
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    rank = leaderboard_crud.get_user_rank(db, user_id=user_id, game_id=game_id)
    return {"user_id": user_id, "game_id": game_id, "rank": rank}


@router.get("/achievements/{user_id}")
def read_user_achievements(
    user_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user can access this data
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return leaderboard_crud.get_user_achievements(db, user_id=user_id)


@router.get("/trending")
def read_trending_players(
    limit: int = 10,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_trending_players(db, limit=limit)


@router.get("/all-time/{game_id}")
def read_all_time_leaderboard(
    game_id: int,
    limit: int = 100,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_all_time_leaderboard(db, game_id=game_id, limit=limit)


@router.get("/recent/{game_id}")
def read_recent_matches(
    game_id: int,
    limit: int = 20,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_recent_matches(db, game_id=game_id, limit=limit)


@router.get("/head-to-head/{player1_id}/{player2_id}")
def read_head_to_head(
    player1_id: int,
    player2_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user can access this data
    if current_user.id not in [player1_id, player2_id] and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return leaderboard_crud.get_head_to_head_stats(
        db, player1_id=player1_id, player2_id=player2_id
    )


@router.get("/win-rate-distribution/{game_id}")
def read_win_rate_distribution(
    game_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_win_rate_distribution(db, game_id=game_id)


@router.get("/streaks/{game_id}")
def read_streaks(
    game_id: int,
    limit: int = 10,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return leaderboard_crud.get_current_streaks(db, game_id=game_id, limit=limit)


@router.get("/performance/{user_id}/{game_id}")
def read_user_performance(
    user_id: int,
    game_id: int,
    current_user: user_model.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user can access this data
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return leaderboard_crud.get_user_performance(db, user_id=user_id, game_id=game_id)




