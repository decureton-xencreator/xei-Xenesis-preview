import {answerFromManual, createRolePlay, proposeImprovement, scorePractice} from './living-manual-core.js';

const required = (value, name) => {
  if (!String(value ?? '').trim()) throw new Error(`missing_${name}`);
  return String(value).trim();
};

const clone = value => JSON.parse(JSON.stringify(value));

export const DATA_PROVENANCE = Object.freeze({DEMO: 'demo', LIVE: 'live'});

export class InMemoryAuditStore {
  #records = [];

  async append(record) {
    const entry = Object.freeze(clone(record));
    this.#records.push(entry);
    return clone(entry);
  }

  async list({tenantId}) {
    return this.#records.filter(record => record.tenantId === tenantId).map(clone);
  }
}

export function authorize(context, permission) {
  const actorId = required(context?.actorId, 'actor_id');
  const tenantId = required(context?.tenantId, 'tenant_id');
  const permissions = Array.isArray(context?.permissions) ? context.permissions : [];
  if (!permissions.includes(permission)) throw new Error('permission_denied');
  return {actorId, tenantId, roles: [...(context.roles || [])], permissions: [...permissions]};
}

function sourcesForTenant(sources, tenantId) {
  return sources.filter(source => source.tenantId === tenantId);
}

export function createLivingManualService({sources = [], auditStore = new InMemoryAuditStore(), modelAdapter = null, clock = () => new Date().toISOString(), id = () => crypto.randomUUID()} = {}) {
  const record = async ({context, action, requestId, outcome, authority, source = null, provenance}) => auditStore.append({
    schema: 'xen/living-manual-audit/v1',
    id: id(),
    requestId,
    occurredAt: clock(),
    actorId: context.actorId,
    tenantId: context.tenantId,
    action,
    outcome,
    authority,
    source,
    provenance
  });

  return Object.freeze({
    async ask({context: rawContext, question, language = 'en', requestId = id()}) {
      const context = authorize(rawContext, 'manual:read');
      const tenantSources = sourcesForTenant(sources, context.tenantId);
      const safeQuestion = required(question, 'question');
      const grounded = answerFromManual({question: safeQuestion, language, sources: tenantSources});
      const result = modelAdapter ? await modelAdapter.explain({groundedAnswer: grounded, question: safeQuestion, language, tenantId: context.tenantId}) : grounded;
      const provenance = tenantSources[0]?.provenance || DATA_PROVENANCE.DEMO;
      await record({context, action: 'manual.ask', requestId, outcome: result.escalationRequired ? 'escalated' : 'answered', authority: result.authority, source: result.source, provenance});
      return {...result, requestId, provenance, dataLabel: provenance === DATA_PROVENANCE.LIVE ? 'LIVE APPROVED DATA' : 'DEMONSTRATION DATA'};
    },

    async startPractice({context: rawContext, scenario, language = 'en', rubric = [], requestId = id()}) {
      const context = authorize(rawContext, 'practice:start');
      const result = createRolePlay({scenario: required(scenario, 'scenario'), language, rubric});
      await record({context, action: 'practice.start', requestId, outcome: 'started', authority: 'coaching', provenance: DATA_PROVENANCE.DEMO});
      return {...result, requestId, provenance: DATA_PROVENANCE.DEMO, dataLabel: 'PRACTICE · NOT LIVE EVALUATION'};
    },

    async scorePractice({context: rawContext, response, rubric = [], requestId = id()}) {
      const context = authorize(rawContext, 'practice:score');
      const result = scorePractice(required(response, 'response'), rubric);
      await record({context, action: 'practice.score', requestId, outcome: 'manager_review_required', authority: result.authority, provenance: DATA_PROVENANCE.DEMO});
      return {...result, requestId, provenance: DATA_PROVENANCE.DEMO};
    },

    async propose({context: rawContext, observation, sourceId, requestId = id()}) {
      const context = authorize(rawContext, 'manual:propose');
      const source = sourcesForTenant(sources, context.tenantId).find(item => item.id === sourceId);
      if (!source) throw new Error('source_not_available_to_tenant');
      const result = proposeImprovement({observation: required(observation, 'observation'), sourceId, actorId: context.actorId});
      await record({context, action: 'manual.propose', requestId, outcome: result.status, authority: result.authority, source: {id: source.id, version: source.version}, provenance: source.provenance || DATA_PROVENANCE.DEMO});
      return {...result, requestId};
    },

    async audit({context: rawContext}) {
      const context = authorize(rawContext, 'audit:read');
      return auditStore.list({tenantId: context.tenantId});
    }
  });
}
