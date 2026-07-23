PRAGMA foreign_keys = ON;

INSERT INTO mission_artifacts(
  id, mission_id, tenant_id, storage_key, media_type, size_bytes,
  integrity_hash, validation_state, created_by, created_at
)
SELECT
  'canonical-' || a.id, a.mission_id, a.tenant_id, a.storage_key, a.media_type,
  a.size_bytes, a.sha256, 'validated', a.created_by, a.created_at
FROM artifacts a
WHERE NOT EXISTS (
  SELECT 1 FROM mission_artifacts ma WHERE ma.storage_key = a.storage_key
);

INSERT INTO mission_validation_evidence(
  id, mission_id, artifact_id, validator, evidence_type, result,
  evidence_document, integrity_hash, created_at
)
SELECT
  'canonical-' || e.id,
  e.mission_id,
  ma.id,
  'continuum-evidence-backfill',
  e.evidence_type,
  'passed',
  e.document,
  e.sha256,
  e.created_at
FROM evidence_records e
LEFT JOIN mission_artifacts ma
  ON ma.mission_id = e.mission_id
 AND ma.integrity_hash = e.sha256
WHERE e.mission_id IS NOT NULL
  AND e.evidence_type = 'provider_completion'
  AND NOT EXISTS (
    SELECT 1 FROM mission_validation_evidence mve WHERE mve.id = 'canonical-' || e.id
  );

INSERT INTO mission_costs(
  id, mission_id, tenant_id, provider, model, estimated_cost_usd,
  actual_cost_usd, input_tokens, output_tokens, provider_calls, recorded_at
)
SELECT
  'canonical-cost-' || e.id,
  e.mission_id,
  e.tenant_id,
  COALESCE(json_extract(e.document, '$.provider'), 'unknown'),
  COALESCE(json_extract(e.document, '$.model'), 'unknown'),
  COALESCE(json_extract(e.document, '$.usage.estimatedCostUsd'), 0),
  COALESCE(json_extract(e.document, '$.usage.estimatedCostUsd'), 0),
  COALESCE(json_extract(e.document, '$.usage.inputTokens'), 0),
  COALESCE(json_extract(e.document, '$.usage.outputTokens'), 0),
  1,
  e.created_at
FROM evidence_records e
WHERE e.mission_id IS NOT NULL
  AND e.evidence_type = 'provider_completion'
  AND NOT EXISTS (
    SELECT 1 FROM mission_costs mc WHERE mc.id = 'canonical-cost-' || e.id
  );

INSERT INTO provider_calls(
  id, mission_id, provider, model, request_hash, response_hash, status,
  input_tokens, output_tokens, estimated_cost_usd, actual_cost_usd,
  started_at, completed_at
)
SELECT
  mi.id,
  mi.mission_id,
  mi.provider,
  mi.model,
  mi.request_hash,
  e.sha256,
  'succeeded',
  mi.input_tokens,
  mi.output_tokens,
  COALESCE(json_extract(e.document, '$.usage.estimatedCostUsd'), 0),
  COALESCE(json_extract(e.document, '$.usage.estimatedCostUsd'), 0),
  mi.created_at,
  mi.completed_at
FROM model_invocations mi
JOIN evidence_records e
  ON e.mission_id = mi.mission_id
 AND e.subject_id = mi.id
 AND e.evidence_type = 'provider_completion'
WHERE mi.status = 'succeeded'
  AND NOT EXISTS (SELECT 1 FROM provider_calls pc WHERE pc.id = mi.id);

INSERT INTO schema_migrations(version, applied_at)
VALUES ('0004_canonical_evidence_backfill', datetime('now'));
