














from sqlalchemy import Column, Integer, String, DateTime, JSON, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Decision(Base):
    __tablename__ = 'decisions'

    decision_id = Column(Integer, primary_key=True)
    ts = Column(DateTime, default=datetime.datetime.utcnow)
    prev_decision_id = Column(Integer, nullable=True)

    inputs_bundle = Column(JSON, nullable=False)
    objectives = Column(JSON, nullable=False)
    options_considered = Column(JSON, nullable=False)
    chosen_action = Column(JSON, nullable=False)
    tests_passed = Column(JSON, nullable=False)

    approvals = Column(JSON, nullable=True)
    appeals = Column(JSON, nullable=True)
    post_hoc_metrics = Column(JSON, nullable=True)

    prev_hash = Column(LargeBinary, nullable=True)
    curr_hash = Column(LargeBinary, nullable=False)


















