
















import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from packages.ledger.models import Base, Decision
from packages.ledger.writer import LedgerWriter

# Test database setup
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def test_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up
    Base.metadata.drop_all(bind=engine)

def test_hash_chain_integrity(test_db):
    """Test that the hash chain works correctly"""
    writer = LedgerWriter()

    # Create a session
    db = TestingSessionLocal()

    try:
        # Add first decision
        decision1_data = {
            'inputs_bundle': {'kpi_data': {'unemployment': 5.0}},
            'objectives': {'rights_protection': 1.0, 'prosperity': 0.8},
            'options_considered': [],
            'chosen_action': {'action_type': 'carbon_fee'},
            'tests_passed': {'constitution_check': True}
        }
        decision1 = writer.add_decision(db, decision1_data)
        first_hash = decision1.curr_hash

        # Add second decision that references the first
        decision2_data = {
            'prev_decision_id': decision1.decision_id,
            'inputs_bundle': {'kpi_data': {'unemployment': 4.8}},
            'objectives': {'rights_protection': 1.0, 'prosperity': 0.85},
            'options_considered': [],
            'chosen_action': {'action_type': 'housing_credits'},
            'tests_passed': {'constitution_check': True}
        }
        decision2 = writer.add_decision(db, decision2_data)

        # Verify hash chain
        assert decision2.prev_hash == first_hash

        # Test idempotency - same payload should produce same hash
        decision3_data = {
            'prev_decision_id': decision2.decision_id,
            'inputs_bundle': {'kpi_data': {'unemployment': 4.8}},
            'objectives': {'rights_protection': 1.0, 'prosperity': 0.85},
            'options_considered': [],
            'chosen_action': {'action_type': 'housing_credits'},
            'tests_passed': {'constitution_check': True}
        }
        decision3 = writer.add_decision(db, decision3_data)

        # The current hash should be the same for identical payloads
        assert decision2.curr_hash == decision3.curr_hash

    finally:
        db.close()












