import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AUTHORITY,
  answerFromManual,
  createRolePlay,
  proposeImprovement,
  scorePractice
} from '../src/alpha-one/living-manual-core.js';

const fixture = JSON.parse(fs.readFileSync('content/alpha-one-bdc-approved-sources.json', 'utf8'));

test('answers only from an approved, cited source', () => {
  const result = answerFromManual({ question: 'How do I schedule an appointment?', sources: fixture.sources });
  assert.equal(result.authority, AUTHORITY.APPROVED);
  assert.equal(result.source.id, 'BDC-APPT-001');
  assert.equal(result.escalationRequired, false);
});

test('uses an approved Spanish translation', () => {
  const result = answerFromManual({ question: 'just looking objection', language: 'es', sources: fixture.sources });
  assert.match(result.answer, /Reduzca la presión/);
  assert.equal(result.source.id, 'BDC-OBJ-001');
});

test('fails closed when approved knowledge is absent', () => {
  const result = answerFromManual({ question: 'What is the refund policy?', sources: fixture.sources });
  assert.equal(result.authority, AUTHORITY.UNKNOWN);
  assert.equal(result.escalationRequired, true);
  assert.equal(result.source, null);
});

test('keeps role-play separate from live evaluation', () => {
  const practice = createRolePlay({ scenario: 'hesitant homeowner', rubric: fixture.practiceRubric });
  assert.equal(practice.mode, 'practice');
  assert.match(practice.disclosure, /not a live employment evaluation/);
});

test('scores against the manager-approved rubric and requires review', () => {
  const result = scorePractice('I understand. Tell me about your project and timeframe, then we can choose the next step.', fixture.practiceRubric);
  assert.equal(result.score, 100);
  assert.equal(result.managerReviewRequired, true);
});

test('employee observations cannot publish manual changes', () => {
  const proposal = proposeImprovement({ observation: 'Customers ask about financing.', sourceId: 'BDC-OBJ-001', actorId: 'employee-demo' });
  assert.equal(proposal.authority, AUTHORITY.PROPOSED);
  assert.equal(proposal.status, 'review_required');
  assert.equal(proposal.mayPublish, false);
});
