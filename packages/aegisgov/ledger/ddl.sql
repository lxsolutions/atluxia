














-- Safe hash chain DDL for AegisGov decision ledger

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE decisions (
  decision_id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prev_decision_id BIGINT,
  inputs_bundle JSONB NOT NULL,
  objectives JSONB NOT NULL,
  options_considered JSONB NOT NULL,
  chosen_action JSONB NOT NULL,
  tests_passed JSONB NOT NULL,
  approvals JSONB,
  appeals JSONB,
  post_hoc_metrics JSONB,
  prev_hash BYTEA,
  curr_hash BYTEA,
  UNIQUE (curr_hash)
);

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

CREATE TRIGGER trg_compute_hashes
BEFORE INSERT ON decisions
FOR EACH ROW EXECUTE FUNCTION compute_hashes();

CREATE INDEX idx_decisions_ts ON decisions (ts);
CREATE INDEX idx_decisions_appeals ON decisions USING GIN (appeals);














