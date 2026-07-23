PRAGMA foreign_keys = ON;

-- Forward-only expansion of the proven 0001 staging schema. Existing smoke-test
-- evidence remains in place; canonical names are introduced without renaming or
-- dropping the preliminary tables.
ALTER TABLE missions ADD COLUMN exact_intent TEXT;
ALTER TABLE missions ADD COLUMN constraints_document TEXT NOT NULL DEFAULT '{}';
ALTER TABLE missions ADD COLUMN success_criteria_document TEXT NOT NULL DEFAULT '[]';
ALTER TABLE missions ADD COLUMN authority_document TEXT NOT NULL DEFAULT '{}';
ALTER TABLE missions ADD COLUMN provenance_document TEXT NOT NULL DEFAULT '{}';
ALTER TABLE missions ADD COLUMN capability_class TEXT NOT NULL DEFAULT 'analytical';
ALTER TABLE missions ADD COLUMN weighted_mission_units REAL NOT NULL DEFAULT 1 CHECK (weighted_mission_units > 0);
ALTER TABLE missions ADD COLUMN parent_mission_id TEXT REFERENCES missions(id);
ALTER TABLE missions ADD COLUMN group_id TEXT;
ALTER TABLE missions ADD COLUMN priority INTEGER NOT NULL DEFAULT 50 CHECK (priority BETWEEN 0 AND 100);
ALTER TABLE missions ADD COLUMN progress REAL NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 1);
ALTER TABLE missions ADD COLUMN current_operation TEXT;
ALTER TABLE missions ADD COLUMN scheduled_at TEXT;
ALTER TABLE missions ADD COLUMN cost_limit_usd REAL NOT NULL DEFAULT 0.10 CHECK (cost_limit_usd >= 0);
ALTER TABLE missions ADD COLUMN token_limit INTEGER NOT NULL DEFAULT 4096 CHECK (token_limit >= 0);
ALTER TABLE missions ADD COLUMN provider_call_limit INTEGER NOT NULL DEFAULT 1 CHECK (provider_call_limit >= 0);
ALTER TABLE missions ADD COLUMN completion_evidence_document TEXT;
ALTER TABLE missions ADD COLUMN idempotency_key TEXT;

UPDATE missions SET exact_intent = objective WHERE exact_intent IS NULL;
CREATE UNIQUE INDEX missions_tenant_idempotency
  ON missions(tenant_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX missions_schedule_priority
  ON missions(tenant_id, state, scheduled_at, priority DESC, created_at);
CREATE INDEX missions_lineage ON missions(tenant_id, parent_mission_id, group_id);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE TABLE identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  provider_subject TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (provider, provider_subject)
);

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX workspaces_tenant ON workspaces(tenant_id, status);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  external_reference TEXT,
  transcript_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (workspace_id, external_reference)
);

CREATE TABLE mission_dependencies (
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  depends_on_mission_id TEXT NOT NULL REFERENCES missions(id),
  dependency_type TEXT NOT NULL DEFAULT 'finish_to_start',
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (mission_id, depends_on_mission_id),
  CHECK (mission_id <> depends_on_mission_id)
);
CREATE INDEX mission_dependencies_blockers ON mission_dependencies(depends_on_mission_id, mission_id);

CREATE TABLE mission_context_references (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL,
  reference_uri TEXT NOT NULL,
  authorization_scope TEXT NOT NULL,
  integrity_hash TEXT,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (mission_id, reference_uri)
);

CREATE TABLE mission_events (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  sequence INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  causation_id TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (mission_id, sequence),
  UNIQUE (tenant_id, correlation_id, event_type, sequence)
);
CREATE INDEX mission_events_stream ON mission_events(tenant_id, mission_id, sequence);

CREATE TABLE mission_checkpoints (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  workflow_id TEXT REFERENCES workflow_instances(id),
  sequence INTEGER NOT NULL,
  operation TEXT NOT NULL,
  state_document TEXT NOT NULL,
  integrity_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (mission_id, sequence)
);

CREATE TABLE mission_approvals (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  actor_id TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'revoked')),
  scope TEXT NOT NULL,
  evidence TEXT NOT NULL,
  evidence_hash TEXT NOT NULL,
  signature TEXT,
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE mission_artifacts (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  storage_key TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  integrity_hash TEXT NOT NULL,
  validation_state TEXT NOT NULL DEFAULT 'pending',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX mission_artifacts_mission ON mission_artifacts(tenant_id, mission_id, created_at);

CREATE TABLE mission_validation_evidence (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  artifact_id TEXT REFERENCES mission_artifacts(id),
  validator TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'inconclusive')),
  evidence_document TEXT NOT NULL,
  integrity_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX mission_validation_by_mission ON mission_validation_evidence(mission_id, result, created_at);

CREATE TABLE mission_attempts (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  state TEXT NOT NULL,
  retry_classification TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  error_code TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  UNIQUE (mission_id, attempt_number)
);

CREATE TABLE mission_costs (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  estimated_cost_usd REAL NOT NULL DEFAULT 0 CHECK (estimated_cost_usd >= 0),
  actual_cost_usd REAL CHECK (actual_cost_usd >= 0),
  input_tokens INTEGER NOT NULL DEFAULT 0 CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL DEFAULT 0 CHECK (output_tokens >= 0),
  provider_calls INTEGER NOT NULL DEFAULT 0 CHECK (provider_calls >= 0),
  recorded_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX mission_costs_budget ON mission_costs(tenant_id, provider, recorded_at);

CREATE TABLE resource_locks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  resource_type TEXT NOT NULL,
  resource_key TEXT NOT NULL,
  mission_id TEXT NOT NULL REFERENCES missions(id),
  lease_token TEXT NOT NULL UNIQUE,
  acquired_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  released_at TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE UNIQUE INDEX active_resource_lock
  ON resource_locks(tenant_id, resource_type, resource_key) WHERE released_at IS NULL;

CREATE TABLE worker_leases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  mission_id TEXT NOT NULL REFERENCES missions(id),
  worker_id TEXT NOT NULL,
  lease_token TEXT NOT NULL UNIQUE,
  acquired_at TEXT NOT NULL,
  heartbeat_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  released_at TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE UNIQUE INDEX active_worker_lease ON worker_leases(mission_id) WHERE released_at IS NULL;

CREATE TABLE provider_calls (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  attempt_id TEXT REFERENCES mission_attempts(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_hash TEXT,
  status TEXT NOT NULL,
  retry_classification TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost_usd REAL,
  actual_cost_usd REAL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX provider_calls_concurrency ON provider_calls(provider, status, started_at);

CREATE TABLE attention_preferences (
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  interruption_mode TEXT NOT NULL DEFAULT 'approval_only',
  max_active_attention_requests INTEGER NOT NULL DEFAULT 1 CHECK (max_active_attention_requests >= 0),
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  PRIMARY KEY (user_id, workspace_id)
);

CREATE TABLE audit_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  actor_id TEXT,
  mission_id TEXT REFERENCES missions(id),
  action TEXT NOT NULL,
  outcome TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  request_hash TEXT,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX audit_records_lookup ON audit_records(tenant_id, mission_id, created_at);

CREATE TABLE dead_letter_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  mission_id TEXT REFERENCES missions(id),
  source TEXT NOT NULL,
  payload TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  error_code TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  retry_budget INTEGER NOT NULL DEFAULT 0 CHECK (retry_budget >= 0),
  failed_at TEXT NOT NULL,
  replayed_at TEXT,
  resolved_at TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX dead_letter_unresolved ON dead_letter_records(tenant_id, resolved_at, failed_at);

INSERT INTO schema_migrations(version, applied_at)
VALUES ('0002_canonical_mission_contract', datetime('now'));
