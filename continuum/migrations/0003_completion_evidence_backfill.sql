PRAGMA foreign_keys = ON;

UPDATE missions
SET completion_evidence_document = (
  SELECT evidence_records.document
  FROM evidence_records
  WHERE evidence_records.mission_id = missions.id
    AND evidence_records.evidence_type = 'provider_completion'
  ORDER BY evidence_records.created_at DESC
  LIMIT 1
)
WHERE state = 'succeeded'
  AND completion_evidence_document IS NULL
  AND EXISTS (
    SELECT 1 FROM evidence_records
    WHERE evidence_records.mission_id = missions.id
      AND evidence_records.evidence_type = 'provider_completion'
  );

INSERT INTO schema_migrations(version, applied_at)
VALUES ('0003_completion_evidence_backfill', datetime('now'));
