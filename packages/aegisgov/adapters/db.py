














"""
Database session factory and utilities.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Database URL (will be configured via environment variables in production)
DATABASE_URL = "postgresql://aegisgov:securepassword@localhost/aegisgov_db"

# Create database engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """
    Dependency function that provides a SQLAlchemy session.
    This is used by FastAPI to inject database sessions into route handlers.

    Returns:
        Session: A new database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()















