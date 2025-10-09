






from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import game as game_model
from app.schemas import game as game_schema
from app.crud import game as game_crud

router = APIRouter()


@router.get("/", response_model=List[game_schema.Game])
def read_games(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    games = game_crud.get_games(db, skip=skip, limit=limit, is_active=is_active)
    return games


@router.get("/{game_id}", response_model=game_schema.Game)
def read_game(
    game_id: int,
    db: Session = Depends(get_db)
):
    game = game_crud.get_game(db, game_id=game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@router.get("/{game_id}/variants", response_model=List[game_schema.GameVariant])
def read_game_variants(
    game_id: int,
    db: Session = Depends(get_db)
):
    variants = game_crud.get_game_variants(db, game_id=game_id)
    return variants


@router.post("/", response_model=game_schema.Game)
def create_game(
    game: game_schema.GameCreate,
    db: Session = Depends(get_db)
):
    return game_crud.create_game(db=db, game=game)


@router.post("/{game_id}/variants", response_model=game_schema.GameVariant)
def create_game_variant(
    game_id: int,
    variant: game_schema.GameVariantCreate,
    db: Session = Depends(get_db)
):
    return game_crud.create_game_variant(db=db, game_id=game_id, variant=variant)


@router.put("/{game_id}", response_model=game_schema.Game)
def update_game(
    game_id: int,
    game: game_schema.GameUpdate,
    db: Session = Depends(get_db)
):
    db_game = game_crud.get_game(db, game_id=game_id)
    if db_game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return game_crud.update_game(db=db, game_id=game_id, game=game)


@router.delete("/{game_id}")
def delete_game(
    game_id: int,
    db: Session = Depends(get_db)
):
    game = game_crud.get_game(db, game_id=game_id)
    if game is None:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game_crud.delete_game(db=db, game_id=game_id)
    return {"message": "Game deleted successfully"}



