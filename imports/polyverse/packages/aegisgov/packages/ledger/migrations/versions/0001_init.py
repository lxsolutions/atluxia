























from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create decisions table with hash chain support
    op.create_table(
        'decisions',
        sa.Column('decision_id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('ts', sa.TIMESTAMP(), nullable=False, server_default=sa.func.now()),
        sa.Column('prev_decision_id', sa.BigInteger(), index=True),
        sa.Column('inputs_bundle', sa.JSON(), nullable=False),
        sa.Column('objectives', sa.JSON(), nullable=False),
        sa.Column('options_considered', sa.JSON(), nullable=False),
        sa.Column('chosen_action', sa.JSON(), nullable=False),
        sa.Column('tests_passed', sa.JSON(), nullable=False),
        sa.Column('approvals', sa.JSON()),
        sa.Column('appeals', sa.JSON()),
        sa.Column('post_hoc_metrics', sa.JSON()),
        sa.Column('prev_hash', sa.LargeBinary()),
        sa.Column('curr_hash', sa.LargeBinary(), unique=True)
    )

    # Create indexes
    op.create_index('idx_decisions_ts', 'decisions', ['ts'])
    op.create_index('idx_decisions_appeals', 'decisions', ['appeals'], postgresql_using='gin')

def downgrade():
    op.drop_table('decisions')























