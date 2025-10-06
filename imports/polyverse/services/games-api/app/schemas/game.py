





from typing import Optional, List
from pydantic import BaseModel
from app.models.game import GameType


class GameBase(BaseModel):
    name: str
    game_type: GameType
    description: Optional[str] = None
    max_players: int = 2
    is_active: bool = True


class GameCreate(GameBase):
    pass


class GameUpdate(BaseModel):
    name: Optional[str] = None
    game_type: Optional[GameType] = None
    description: Optional[str] = None
    max_players: Optional[int] = None
    is_active: Optional[bool] = None


class GameInDBBase(GameBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True


class Game(GameInDBBase):
    pass


class GameVariantBase(BaseModel):
    name: str
    description: Optional[str] = None
    settings: Optional[str] = None  # JSON string


class GameVariantCreate(GameVariantBase):
    game_id: int


class GameVariant(GameVariantBase):
    id: int
    game_id: int
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True


class GameWithVariants(Game):
    variants: List[GameVariant] = []


class GameTypeCount(BaseModel):
    game_type: GameType
    count: int


class GameStats(BaseModel):
    total_games: int
    active_games: int
    total_variants: int
    popular_games: List[GameTypeCount]




