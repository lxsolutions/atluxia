"""Initial database schema

Revision ID: 001
Revises: 
Create Date: 2025-10-06 08:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create all tables from SQLModel models
    # This will be generated automatically when we can connect to the database
    pass


def downgrade() -> None:
    # Drop all tables
    pass