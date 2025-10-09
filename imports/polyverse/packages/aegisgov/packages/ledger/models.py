














from sqlalchemy import Column, BigInteger, TIMESTAMP, JSON, LargeBinary, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Decision(Base):
    __tablename__ = 'decisions'

    decision_id = Column(BigInteger, primary_key=True, autoincrement=True)
    ts = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)
    prev_decision_id = Column(BigInteger, index=True)
    inputs_bundle = Column(JSON, nullable=False)
    objectives = Column(JSON, nullable=False)
    options_considered = Column(JSON, nullable=False)
    chosen_action = Column(JSON, nullable=False)
    tests_passed = Column(JSON, nullable=False)
    approvals = Column(JSON)
    appeals = Column(JSON)
    post_hoc_metrics = Column(JSON)

    # Hash chain fields
    prev_hash = Column(LargeBinary)
    curr_hash = Column(LargeBinary, unique=True)

    __table_args__ = (
        Index('idx_decisions_ts', 'ts'),
        Index('idx_decisions_appeals', 'appeals', postgresql_using='gin'),
    )










