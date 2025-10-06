















"""
Idempotent decision ledger writer with hash chain support.
"""

from typing import Dict, Any
import psycopg2
import json
import hashlib

class LedgerWriter:
    def __init__(self, db_url: str):
        """
        Initialize the ledger writer.

        Args:
            db_url: Database connection URL
        """
        self.db_url = db_url

    def _compute_payload_hash(self, inputs_bundle: Dict[str, Any],
                             objectives: Dict[str, float],
                             options_considered: list,
                             chosen_action: Dict[str, Any],
                             tests_passed: Dict[str, bool]) -> str:
        """
        Compute the payload hash for a decision.

        Args:
            inputs_bundle: Input data bundle
            objectives: Objectives considered
            options_considered: Options that were considered
            chosen_action: The chosen action
            tests_passed: Tests that passed

        Returns:
            str: Hex digest of the payload hash
        """
        # Convert all components to JSON strings and concatenate
        payload = json.dumps(inputs_bundle, sort_keys=True) + '|' + \
                  json.dumps(objectives, sort_keys=True) + '|' + \
                  json.dumps(options_considered, sort_keys=True) + '|' + \
                  json.dumps(chosen_action, sort_keys=True) + '|' + \
                  json.dumps(tests_passed, sort_keys=True)

        # Compute SHA-256 hash
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def _get_prev_hash(self, conn, prev_decision_id: int) -> str:
        """
        Get the previous decision's hash.

        Args:
            conn: Database connection
            prev_decision_id: ID of the previous decision

        Returns:
            str: Previous hash (empty string if no previous decision)
        """
        with conn.cursor() as cursor:
            cursor.execute("SELECT curr_hash FROM decisions WHERE decision_id = %s", (prev_decision_id,))
            result = cursor.fetchone()
            return result[0].hex() if result else ''

    def write_decision(self, inputs_bundle: Dict[str, Any],
                      objectives: Dict[str, float],
                      options_considered: list,
                      chosen_action: Dict[str, Any],
                      tests_passed: Dict[str, bool],
                      prev_decision_id: int = None,
                      approvals: Dict[str, Any] = None,
                      appeals: Dict[str, Any] = None,
                      post_hoc_metrics: Dict[str, float] = None) -> Dict:
        """
        Write a decision to the ledger with idempotent hash chain.

        Args:
            inputs_bundle: Input data bundle
            objectives: Objectives considered
            options_considered: Options that were considered
            chosen_action: The chosen action
            tests_passed: Tests that passed
            prev_decision_id: ID of the previous decision (optional)
            approvals: Approvals received (optional)
            appeals: Appeals filed (optional)
            post_hoc_metrics: Post-hoc metrics (optional)

        Returns:
            Dict: Result containing success status and decision ID
        """
        conn = None
        try:
            # Connect to the database
            conn = psycopg2.connect(self.db_url)
            conn.autocommit = False

            with conn.cursor() as cursor:
                # Compute current hash
                curr_hash_hex = self._compute_payload_hash(
                    inputs_bundle, objectives, options_considered,
                    chosen_action, tests_passed
                )

                # Get previous hash if applicable
                prev_hash_hex = ''
                if prev_decision_id is not None:
                    prev_hash_hex = self._get_prev_hash(conn, prev_decision_id)

                # Check if this decision already exists (idempotency)
                cursor.execute(
                    "SELECT decision_id FROM decisions WHERE curr_hash = %s",
                    (bytes.fromhex(curr_hash_hex),)
                )
                existing_result = cursor.fetchone()

                if existing_result:
                    # Decision already exists, return the ID
                    conn.commit()
                    return {
                        'status': 'idempotent',
                        'decision_id': existing_result[0],
                        'message': 'Decision already exists in ledger'
                    }

                # Insert new decision
                cursor.execute("""
                    INSERT INTO decisions (
                        prev_decision_id, inputs_bundle, objectives,
                        options_considered, chosen_action, tests_passed,
                        approvals, appeals, post_hoc_metrics,
                        prev_hash, curr_hash
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING decision_id
                """, (
                    prev_decision_id,
                    json.dumps(inputs_bundle),
                    json.dumps(objectives),
                    json.dumps(options_considered),
                    json.dumps(chosen_action),
                    json.dumps(tests_passed),
                    json.dumps(approvals) if approvals else None,
                    json.dumps(appeals) if appeals else None,
                    json.dumps(post_hoc_metrics) if post_hoc_metrics else None,
                    bytes.fromhex(prev_hash_hex) if prev_decision_id else None,
                    bytes.fromhex(curr_hash_hex)
                ))

                new_id = cursor.fetchone()[0]
                conn.commit()

                return {
                    'status': 'success',
                    'decision_id': new_id,
                    'message': 'Decision written to ledger'
                }

        except Exception as e:
            if conn:
                conn.rollback()
            raise RuntimeError(f"Failed to write decision: {str(e)}")
        finally:
            if conn:
                conn.close()


















