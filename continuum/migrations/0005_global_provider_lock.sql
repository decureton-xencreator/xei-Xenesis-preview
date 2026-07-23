PRAGMA foreign_keys = ON;

-- The staging provider envelope is one request across all tenants. The original
-- partial index was tenant-scoped and therefore could not enforce that global
-- boundary. No active locks may exist while this migration is applied.
DROP INDEX active_resource_lock;
CREATE UNIQUE INDEX active_resource_lock
  ON resource_locks(resource_type, resource_key) WHERE released_at IS NULL;

INSERT INTO schema_migrations(version, applied_at)
VALUES ('0005_global_provider_lock', datetime('now'));
