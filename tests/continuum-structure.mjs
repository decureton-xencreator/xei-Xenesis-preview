import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const runtimeRoot = path.resolve("continuum");
const required = [
  "wrangler.jsonc",
  "openapi.yaml",
  "migrations/0001_stage2_runtime.sql",
  "schemas/mission.schema.json",
  "schemas/event-envelope.schema.json",
  "src/index.ts",
  "src/durable/mission-coordinator.ts",
  "src/workflows/mission-workflow.ts",
  "XEN-CPC-001-CAPABILITY-MANIFEST.json",
  "RECONSTRUCTION.md",
  "CONTINUITY.md",
  "RELEASE.md",
  "VALIDATION.md",
];

for (const relative of required) {
  assert.ok(fs.existsSync(path.join(runtimeRoot, relative)), `Missing Stage 2 artifact: ${relative}`);
}

const migration = fs.readFileSync(path.join(runtimeRoot, "migrations/0001_stage2_runtime.sql"), "utf8");
const tableCount = [...migration.matchAll(/^CREATE TABLE /gm)].length;
assert.equal(tableCount, 20, "The Stage 2 D1 migration must define exactly 20 tables");

const config = fs.readFileSync(path.join(runtimeRoot, "wrangler.jsonc"), "utf8");
assert.match(config, /00000000-0000-0000-0000-000000000001/, "D1 must use the documented local placeholder");
assert.match(config, /local-reconstruction/, "Runtime must remain explicitly local");
assert.doesNotMatch(config, /routes?\s*":/, "Local reconstruction must not define production routes");

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

console.log("PASS Stage 2 bounded-module structure, 20-table migration, local-only configuration, secret scan, and production-shell presence");

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(absolute);
    else if (/\.(?:ts|json|jsonc|yaml|yml|sql|md)$/.test(entry.name)) yield absolute;
  }
}
