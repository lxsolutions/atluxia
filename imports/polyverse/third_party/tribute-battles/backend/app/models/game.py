



from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base
import enum


class GameType(enum.Enum):
    AGE_OF_EMPIRES_2 = "age_of_empires_2"
    COMMAND_AND_CONQUER = "command_and_conquer"
    STARCRAFT_2 = "starcraft_2"
    CIVILIZATION = "civilization"


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    game_type = Column(Enum(GameType), nullable=False)
    description = Column(Text)
    max_players = Column(Integer, default=2)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class GameVariant(Base):
    __tablename__ = "game_variants"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    settings = Column(Text)  # JSON string for game-specific settings
    
    # Relationships
    game = relationship("Game", back_populates="variants")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# Update Game model to have relationship
Game.variants = relationship("GameVariant", back_populates="game", cascade="all, delete-orphan")

