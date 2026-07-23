PRAGMA foreign_keys = ON;

CREATE TABLE mission_admissions (
  id TEXT PRIMARY KEY,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  weighted_mission_units REAL NOT NULL CHECK (weighted_mission_units > 0),
  admission_token TEXT NOT NULL,
  admitted_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  released_at TEXT
);

CREATE UNIQUE INDEX active_mission_admission
  ON mission_admissions(mission_id) WHERE released_at IS NULL;
CREATE INDEX mission_admission_capacity
  ON mission_admissions(released_at, expires_at);

INSERT INTO schema_migrations(version, applied_at)
VALUES ('0006_atomic_mission_admission', datetime('now'));
