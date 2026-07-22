import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createLivingManualService, InMemoryAuditStore} from '../src/alpha-one/living-manual-service.js';
import {FileAuditStore} from '../src/alpha-one/file-audit-store.js';
import {createGovernedModelAdapter} from '../src/alpha-one/governed-model-adapter.js';

const fixture = JSON.parse(fs.readFileSync('content/alpha-one-bdc-approved-sources.json', 'utf8'));
const ids = (() => { let value = 0; return () => `event-${++value}`; })();
const context = permissions => ({actorId: 'employee-demo', tenantId: 'checkmate-demo', roles: ['employee'], permissions});
const service = store => createLivingManualService({sources: fixture.sources, auditStore: store, clock: () => '2026-07-21T20:00:00.000Z', id: ids});

test('requires authenticated identity and explicit permission', async () => {
  await assert.rejects(() => service(new InMemoryAuditStore()).ask({context: {tenantId: 'checkmate-demo', permissions: ['manual:read']}, question: 'appointment'}), /missing_actor_id/);
  await assert.rejects(() => service(new InMemoryAuditStore()).ask({context: context([]), question: 'appointment'}), /permission_denied/);
});

test('isolates approved sources by tenant', async () => {
  const result = await service(new InMemoryAuditStore()).ask({context: {...context(['manual:read']), tenantId: 'different-company'}, question: 'appointment'});
  assert.equal(result.escalationRequired, true);
  assert.equal(result.source, null);
});

test('labels demo answers and writes a cited audit event', async () => {
  const store = new InMemoryAuditStore();
  const runtime = service(store);
  const result = await runtime.ask({context: context(['manual:read']), question: 'How do I schedule an appointment?'});
  assert.equal(result.dataLabel, 'DEMONSTRATION DATA');
  assert.equal(result.source.id, 'BDC-APPT-001');
  const records = await runtime.audit({context: context(['audit:read'])});
  assert.equal(records.length, 1);
  assert.equal(records[0].tenantId, 'checkmate-demo');
  assert.equal(records[0].source.id, 'BDC-APPT-001');
});

test('keeps practice explicitly outside live evaluation and audits scoring', async () => {
  const runtime = service(new InMemoryAuditStore());
  const practice = await runtime.startPractice({context: context(['practice:start']), scenario: 'hesitant homeowner', rubric: fixture.practiceRubric});
  assert.equal(practice.dataLabel, 'PRACTICE · NOT LIVE EVALUATION');
  const score = await runtime.scorePractice({context: context(['practice:score']), response: 'I understand your project and timeframe. Let us agree on the next step.', rubric: fixture.practiceRubric});
  assert.equal(score.score, 100);
  assert.equal(score.managerReviewRequired, true);
});

test('blocks cross-tenant improvement proposals', async () => {
  const runtime = service(new InMemoryAuditStore());
  await assert.rejects(() => runtime.propose({context: {...context(['manual:propose']), tenantId: 'different-company'}, observation: 'Update it', sourceId: 'BDC-OBJ-001'}), /source_not_available_to_tenant/);
});

test('persists append-only JSONL audit records with tenant-filtered reads', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'xen-alpha-one-'));
  const file = path.join(directory, 'audit.jsonl');
  const runtime = service(new FileAuditStore(file));
  await runtime.ask({context: context(['manual:read']), question: 'appointment'});
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).schema, 'xen/living-manual-audit/v1');
  const records = await runtime.audit({context: context(['audit:read'])});
  assert.equal(records.length, 1);
});

test('connects the governed service to the XEI-005 employee interface', () => {
  const interfaceSource = fs.readFileSync('src/series.js', 'utf8');
  for (const contract of ['Ask Xen', 'DEMONSTRATION DATA', 'askManualSpanish', 'startPractice', 'WARDEN ESCALATION', 'result.source.version']) {
    assert.ok(interfaceSource.includes(contract), `missing interface contract: ${contract}`);
  }
});

test('accepts a model explanation only when the approved citation is preserved', async () => {
  const modelAdapter = createGovernedModelAdapter({generate: async ({requiredCitation}) => ({answer: 'First confirm the project and timeframe.', citation: requiredCitation})});
  const runtime = createLivingManualService({sources: fixture.sources, modelAdapter, id: ids});
  const result = await runtime.ask({context: context(['manual:read']), question: 'appointment'});
  assert.equal(result.modelApplied, true);
  assert.equal(result.source.id, 'BDC-APPT-001');
});

test('blocks an uncited model answer and returns the approved grounded text', async () => {
  const modelAdapter = createGovernedModelAdapter({generate: async () => ({answer: 'Invented policy', citation: {id: 'OTHER', version: '9'}})});
  const runtime = createLivingManualService({sources: fixture.sources, modelAdapter, id: ids});
  const result = await runtime.ask({context: context(['manual:read']), question: 'appointment'});
  assert.equal(result.modelApplied, false);
  assert.equal(result.modelBlockedReason, 'citation_or_answer_invalid');
  assert.match(result.answer, /Confirm the customer's project/);
});
