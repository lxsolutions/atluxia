







from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import game as game_model
from app.schemas import game as game_schema


def get_game(db: Session, game_id: int) -> Optional[game_model.Game]:
    return db.query(game_model.Game).filter(game_model.Game.id == game_id).first()


def get_games(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    is_active: bool = True
) -> List[game_model.Game]:
    query = db.query(game_model.Game)
    if is_active:
        query = query.filter(game_model.Game.is_active == True)
    return query.offset(skip).limit(limit).all()


def create_game(db: Session, game: game_schema.GameCreate) -> game_model.Game:
    db_game = game_model.Game(
        name=game.name,
        game_type=game.game_type,
        description=game.description,
        max_players=game.max_players,
        is_active=game.is_active
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


def update_game(
    db: Session, 
    game_id: int, 
    game: game_schema.GameUpdate
) -> Optional[game_model.Game]:
    db_game = get_game(db, game_id)
    if db_game is None:
        return None
    
    update_data = game.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_game, field, value)
    
    db.commit()
    db.refresh(db_game)
    return db_game


def delete_game(db: Session, game_id: int) -> bool:
    db_game = get_game(db, game_id)
    if db_game is None:
        return False
    
    db.delete(db_game)
    db.commit()
    return True


def get_game_variants(db: Session, game_id: int) -> List[game_model.GameVariant]:
    return db.query(game_model.GameVariant).filter(
        game_model.GameVariant.game_id == game_id
    ).all()


def get_game_variant(db: Session, variant_id: int) -> Optional[game_model.GameVariant]:
    return db.query(game_model.GameVariant).filter(
        game_model.GameVariant.id == variant_id
    ).first()


def create_game_variant(
    db: Session, 
    game_id: int, 
    variant: game_schema.GameVariantCreate
) -> game_model.GameVariant:
    # Verify game exists
    game = get_game(db, game_id)
    if game is None:
        raise ValueError("Game not found")
    
    db_variant = game_model.GameVariant(
        game_id=game_id,
        name=variant.name,
        description=variant.description,
        settings=variant.settings
    )
    db.add(db_variant)
    db.commit()
    db.refresh(db_variant)
    return db_variant


def update_game_variant(
    db: Session, 
    variant_id: int, 
    variant: game_schema.GameVariantCreate
) -> Optional[game_model.GameVariant]:
    db_variant = get_game_variant(db, variant_id)
    if db_variant is None:
        return None
    
    update_data = variant.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_variant, field, value)
    
    db.commit()
    db.refresh(db_variant)
    return db_variant


def delete_game_variant(db: Session, variant_id: int) -> bool:
    db_variant = get_game_variant(db, variant_id)
    if db_variant is None:
        return False
    
    db.delete(db_variant)
    db.commit()
    return True


def get_game_stats(db: Session) -> dict:
    total_games = db.query(game_model.Game).count()
    active_games = db.query(game_model.Game).filter(
        game_model.Game.is_active == True
    ).count()
    total_variants = db.query(game_model.GameVariant).count()
    
    # Get popular games by type
    from sqlalchemy import func
    popular_games = db.query(
        game_model.Game.game_type,
        func.count(game_model.Game.id).label('count')
    ).group_by(game_model.Game.game_type).all()
    
    return {
        "total_games": total_games,
        "active_games": active_games,
        "total_variants": total_variants,
        "popular_games": [
            {"game_type": game_type, "count": count}
            for game_type, count in popular_games
        ]
    }




