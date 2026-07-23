PRAGMA foreign_keys = ON;

CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended')),
  created_at TEXT NOT NULL
);

CREATE TABLE actors (
  id TEXT NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  display_name TEXT NOT NULL,
  identity_source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, id)
);

CREATE TABLE authority_grants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  authority TEXT NOT NULL CHECK (authority IN ('read', 'propose', 'approve', 'execute', 'admin')),
  scope TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (tenant_id, actor_id) REFERENCES actors(tenant_id, id)
);

CREATE TABLE missions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  state TEXT NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('low', 'moderate', 'high', 'critical')),
  version INTEGER NOT NULL CHECK (version > 0),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX missions_tenant_state ON missions(tenant_id, state);

CREATE TABLE mission_versions (
  mission_id TEXT NOT NULL REFERENCES missions(id),
  version INTEGER NOT NULL,
  tenant_id TEXT NOT NULL,
  document TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (mission_id, version)
);

CREATE TABLE mission_transitions (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  tenant_id TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  expected_version INTEGER NOT NULL,
  resulting_version INTEGER NOT NULL,
  actor_id TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX mission_transitions_order ON mission_transitions(mission_id, resulting_version);

CREATE TABLE approvals (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  evidence TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  created_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  tenant_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  state TEXT NOT NULL,
  risk TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE task_attempts (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  attempt INTEGER NOT NULL CHECK (attempt > 0),
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error_code TEXT,
  UNIQUE (task_id, attempt)
);

CREATE TABLE idempotency_records (
  tenant_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  operation TEXT NOT NULL,
  response_document TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT,
  PRIMARY KEY (tenant_id, idempotency_key)
);

CREATE TABLE outbox_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  published_at TEXT
);
CREATE INDEX outbox_unpublished ON outbox_events(published_at, created_at);

CREATE TABLE inbox_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  received_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE queue_receipts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  status TEXT NOT NULL,
  received_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE workflow_instances (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  workflow_version TEXT NOT NULL,
  state TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE workflow_checkpoints (
  workflow_id TEXT NOT NULL REFERENCES workflow_instances(id),
  sequence INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  state TEXT NOT NULL,
  document TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (workflow_id, sequence)
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  storage_key TEXT NOT NULL UNIQUE,
  sha256 TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  media_type TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE model_invocations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE evidence_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  mission_id TEXT REFERENCES missions(id),
  evidence_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  document TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE dead_letters (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  source TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  attempt_count INTEGER NOT NULL,
  error_code TEXT NOT NULL,
  payload TEXT NOT NULL,
  failed_at TEXT NOT NULL,
  replayed_at TEXT
);

INSERT INTO schema_migrations(version, applied_at)
VALUES ('0001_stage2_runtime', datetime('now'));
