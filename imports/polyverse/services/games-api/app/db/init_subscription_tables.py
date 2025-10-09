"""
Initialize subscription tables in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.models.subscription import Base as SubscriptionBase
from app.models import Base

# Create engine
def init_subscription_tables():
    engine = create_engine(settings.DATABASE_URL)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("Subscription tables created successfully")

if __name__ == "__main__":
    init_subscription_tables()