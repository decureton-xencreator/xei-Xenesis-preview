import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const runtimeRoot = path.resolve("continuum");
const required = [
  "wrangler.jsonc",
  "openapi.yaml",
  "migrations/0001_stage2_runtime.sql",
  "migrations/0002_canonical_mission_contract.sql",
  "migrations/0003_completion_evidence_backfill.sql",
  "migrations/0004_canonical_evidence_backfill.sql",
  "migrations/0005_global_provider_lock.sql",
  "migrations/0006_atomic_mission_admission.sql",
  "schemas/mission.schema.json",
  "schemas/event-envelope.schema.json",
  "src/index.ts",
  "src/governor.ts",
  "src/scheduler.ts",
  "src/durable/mission-coordinator.ts",
  "src/workflows/mission-workflow.ts",
  "XEN-CPC-001-CAPABILITY-MANIFEST.json",
  "FAMILY-DEPENDENCIES.md",
  "ANTHROPIC-PROVIDER.md",
  "RECONSTRUCTION.md",
  "CONTINUITY.md",
  "RELEASE.md",
  "VALIDATION.md",
];

for (const relative of required) {
  assert.ok(fs.existsSync(path.join(runtimeRoot, relative)), `Missing Stage 2 artifact: ${relative}`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(runtimeRoot, "XEN-CPC-001-CAPABILITY-MANIFEST.json"), "utf8"));
assert.ok(!manifest.authority.canonicalControls.includes("XRI-006"), "Prospective XRI-006 must not be represented as an existing canonical control");
assert.ok(manifest.authority.futureControls.includes("XRI-006"), "XRI-006 continuation dependency must remain explicit");

const migration = fs.readFileSync(path.join(runtimeRoot, "migrations/0002_canonical_mission_contract.sql"), "utf8");
const globalLockMigration = fs.readFileSync(path.join(runtimeRoot, "migrations/0005_global_provider_lock.sql"), "utf8");
const admissionMigration = fs.readFileSync(path.join(runtimeRoot, "migrations/0006_atomic_mission_admission.sql"), "utf8");
assert.match(globalLockMigration, /ON resource_locks\(resource_type, resource_key\) WHERE released_at IS NULL/, "Provider lock must be globally unique while active");
assert.match(admissionMigration, /CREATE TABLE mission_admissions/, "Atomic mission admission ledger must exist");
assert.match(admissionMigration, /ON mission_admissions\(mission_id\) WHERE released_at IS NULL/, "A mission may hold only one active admission");
for (const table of [
  "users", "identities", "workspaces", "conversations", "mission_dependencies",
  "mission_context_references", "mission_events", "mission_checkpoints", "mission_approvals",
  "mission_artifacts", "mission_validation_evidence", "mission_attempts", "mission_costs",
  "resource_locks", "worker_leases", "provider_calls", "attention_preferences", "audit_records",
  "dead_letter_records",
]) assert.match(migration, new RegExp(`CREATE TABLE ${table} \\(`), `Canonical D1 table missing: ${table}`);
for (const column of ["exact_intent", "constraints_document", "success_criteria_document", "authority_document", "provenance_document", "capability_class", "weighted_mission_units", "priority", "progress", "current_operation", "completion_evidence_document"])
  assert.match(migration, new RegExp(`ALTER TABLE missions ADD COLUMN ${column}`), `Canonical mission field missing: ${column}`);

const config = fs.readFileSync(path.join(runtimeRoot, "wrangler.jsonc"), "utf8");
assert.match(config, /xen-continuum-stage2-staging/, "Staging bindings must remain explicit");
assert.match(config, /cloudflare-access/, "Staging authentication boundary must remain explicit");

const inspect = [...walk(runtimeRoot), path.resolve("package.json")];
const secretPatterns = [
  /sk-ant-[A-Za-z0-9_-]{20,}/,
  /CF_API_TOKEN\s*=\s*[^\s<]+/,
  /CLOUDFLARE_API_TOKEN\s*=\s*[^\s<]+/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
for (const file of inspect) {
  if (file.endsWith("worker-configuration.d.ts")) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const pattern of secretPatterns) {
    assert.doesNotMatch(content, pattern, `Potential secret material detected in ${path.relative(process.cwd(), file)}`);
  }
}

for (const productionAsset of [
  "index.html",
  "src/ed-premiere-clean-v1.js",
  "src/ed-premiere-clean-v1.css",
  "src/xfs-xen-centric-finish-v1.js",
  "src/xfs-xen-centric-finish-v1.css",
]) {
  assert.ok(fs.existsSync(productionAsset), `Production shell asset is missing: ${productionAsset}`);
}

console.log("PASS Stage 2 bounded-module structure, canonical forward migration, protected staging configuration, secret scan, and production-shell isolation");

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(absolute);
    else if (/\.(?:ts|json|jsonc|yaml|yml|sql|md)$/.test(entry.name)) yield absolute;
  }
}
