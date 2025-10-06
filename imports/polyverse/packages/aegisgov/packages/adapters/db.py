















from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

class DatabaseAdapter:
    def __init__(self, connection_string: str = "postgresql://aegisgov:aegisgov@localhost:5432/aegisgov"):
        self.engine = create_engine(connection_string)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

    def get_db(self) -> Session:
        """Get a database session"""
        db = self.SessionLocal()
        try:
            yield db
        finally:
            db.close()











