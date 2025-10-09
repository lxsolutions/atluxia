















import hashlib
from typing import Dict, Any
from sqlalchemy.orm import Session
from .models import Decision

class LedgerWriter:
    def __init__(self):
        pass

    def compute_hash(self, prev_hash: bytes, inputs_bundle: Dict, objectives: Dict,
                    options_considered: Dict, chosen_action: Dict, tests_passed: Dict) -> bytes:
        """Compute SHA-256 hash for a decision"""
        # Convert all JSON to strings
        payload = (
            (prev_hash.hex() if prev_hash else '') + '|' +
            str(inputs_bundle).encode('utf-8') + b'|' +
            str(objectives).encode('utf-8') + b'|' +
            str(options_considered).encode('utf-8') + b'|' +
            str(chosen_action).encode('utf-8') + b'|' +
            str(tests_passed).encode('utf-8')
        )

        return hashlib.sha256(payload).digest()

    def add_decision(self, db: Session, decision_data: Dict) -> Decision:
        """
        Add a decision to the ledger with proper hash chaining
        Returns the created decision record
        """
        # Prepare decision data
        prev_hash = None
        if 'prev_decision_id' in decision_data and decision_data['prev_decision_id']:
            # In a real system, we'd query for the previous decision's curr_hash
            pass

        inputs_bundle = decision_data.get('inputs_bundle', {})
        objectives = decision_data.get('objectives', {})
        options_considered = decision_data.get('options_considered', [])
        chosen_action = decision_data.get('chosen_action', {})
        tests_passed = decision_data.get('tests_passed', {})

        # Compute current hash
        curr_hash = self.compute_hash(prev_hash, inputs_bundle, objectives,
                                     options_considered, chosen_action, tests_passed)

        # Create decision record
        decision = Decision(
            prev_decision_id=decision_data.get('prev_decision_id'),
            inputs_bundle=inputs_bundle,
            objectives=objectives,
            options_considered=options_considered,
            chosen_action=chosen_action,
            tests_passed=tests_passed,
            approvals=decision_data.get('approvals'),
            appeals=decision_data.get('appeals'),
            post_hoc_metrics=decision_data.get('post_hoc_metrics'),
            prev_hash=prev_hash,
            curr_hash=curr_hash
        )

        # Add to database (in a real system)
        db.add(decision)
        db.commit()
        db.refresh(decision)

        return decision









