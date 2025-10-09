















"""
Initial database migration for AegisGov ledger.
"""

from alembic import op
import sqlalchemy as sa
import datetime

# Revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    """Apply the initial migration."""
    # Create decisions table with hash chain support
    op.create_table(
        'decisions',
        sa.Column('decision_id', sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column('ts', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('prev_decision_id', sa.BigInteger(), nullable=True),
        sa.Column('inputs_bundle', sa.JSON(none_as_null=True), nullable=False),
        sa.Column('objectives', sa.JSON(none_as_null=True), nullable=False),
        sa.Column('options_considered', sa.JSON(none_as_null=True), nullable=False),
        sa.Column('chosen_action', sa.JSON(none_as_null=True), nullable=False),
        sa.Column('tests_passed', sa.JSON(none_as_null=True), nullable=False),
        sa.Column('approvals', sa.JSON(none_as_null=True), nullable=True),
        sa.Column('appeals', sa.JSON(none_as_null=True), nullable=True),
        sa.Column('post_hoc_metrics', sa.JSON(none_as_null=True), nullable=True),
        sa.Column('prev_hash', sa.LargeBinary(), nullable=True),
        sa.Column('curr_hash', sa.LargeBinary(), nullable=False)
    )

    # Create hash computation trigger function
    op.execute("""
    CREATE OR REPLACE FUNCTION compute_hashes() RETURNS TRIGGER AS $$
    DECLARE payload TEXT;
    BEGIN
      IF NEW.prev_decision_id IS NOT NULL THEN
        SELECT curr_hash INTO NEW.prev_hash FROM decisions WHERE decision_id = NEW.prev_decision_id;
      END IF;
      payload := COALESCE(encode(NEW.prev_hash,'hex'),'') || '|' ||
                 COALESCE(NEW.inputs_bundle::text,'') || '|' ||
                 COALESCE(NEW.objectives::text,'') || '|' ||
                 COALESCE(NEW.options_considered::text,'') || '|' ||
                 COALESCE(NEW.chosen_action::text,'') || '|' ||
                 COALESCE(NEW.tests_passed::text,'');
      NEW.curr_hash := digest(payload, 'sha256');
      RETURN NEW;
    END $$ LANGUAGE plpgsql;
    """)

    # Create trigger for hash computation
    op.execute("""
    CREATE TRIGGER trg_compute_hashes
    BEFORE INSERT ON decisions
    FOR EACH ROW EXECUTE FUNCTION compute_hashes();
    """)

    # Create indexes
    op.create_index('idx_decisions_ts', 'decisions', ['ts'])
    op.create_index('idx_decisions_appeals', 'decisions', {'appeals'}, postgresql_using='gin')

def downgrade():
    """Revert the initial migration."""
    # Drop indexes
    op.drop_index('idx_decisions_appeals', table_name='decisions')
    op.drop_index('idx_decisions_ts', table_name='decisions')

    # Drop trigger and function
    op.execute("DROP TRIGGER IF EXISTS trg_compute_hashes ON decisions")
    op.execute("DROP FUNCTION IF EXISTS compute_hashes")

    # Drop table
    op.drop_table('decisions')


















