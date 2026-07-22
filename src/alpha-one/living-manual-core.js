const normalize = value => String(value ?? '').trim();

export const AUTHORITY = Object.freeze({
  APPROVED: 'approved',
  COACHING: 'coaching',
  PROPOSED: 'proposed',
  UNKNOWN: 'unknown'
});

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'do', 'does', 'for', 'how', 'i', 'is', 'it', 'of', 'or',
  'the', 'to', 'what', 'when', 'where', 'with', 'you', 'your'
]);
const tokens = value => (normalize(value).toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
  .filter(token => token.length > 2 && !STOP_WORDS.has(token));

export function findApprovedSource(question, sources = []) {
  const query = new Set(tokens(question));
  return sources
    .filter(source => source.status === AUTHORITY.APPROVED)
    .map(source => ({
      ...source,
      score: tokens(`${source.title} ${source.text} ${(source.aliases || []).join(' ')}`)
        .reduce((score, token) => score + (query.has(token) ? 1 : 0), 0)
    }))
    .filter(source => source.score > 0)
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)))[0] ?? null;
}

function translationFor(source, language) {
  if (!language || language === source.language) return source.text;
  return source.translations?.[language] ?? null;
}

export function answerFromManual({ question, language = 'en', sources = [] }) {
  const source = findApprovedSource(question, sources);
  if (!source) {
    return {
      authority: AUTHORITY.UNKNOWN,
      confidence: 0,
      answer: language === 'es'
        ? 'No encuentro una respuesta aprobada. Consulta al responsable del manual.'
        : 'I cannot find an approved answer. Ask the manual owner.',
      source: null,
      escalationRequired: true
    };
  }

  const translated = translationFor(source, language);
  if (!translated) {
    return {
      authority: AUTHORITY.UNKNOWN,
      confidence: 0.5,
      answer: language === 'es'
        ? 'Existe una fuente aprobada, pero esta traducción todavía no está aprobada.'
        : 'An approved source exists, but this translation has not been approved.',
      source: { id: source.id, version: source.version, title: source.title },
      escalationRequired: true
    };
  }

  return {
    authority: AUTHORITY.APPROVED,
    confidence: Math.min(1, 0.7 + source.score * 0.05),
    answer: translated,
    source: { id: source.id, version: source.version, title: source.title },
    escalationRequired: false
  };
}

export function createRolePlay({ scenario, language = 'en', rubric = [] }) {
  return {
    id: `practice-${Date.now()}`,
    mode: 'practice',
    language,
    scenario,
    opening: language === 'es'
      ? 'Estoy interesado, pero no estoy listo para programar una cita.'
      : "I'm interested, but I'm not ready to schedule an appointment.",
    rubric: rubric.map(item => ({ ...item })),
    disclosure: language === 'es'
      ? 'Esta es una práctica, no una evaluación laboral en vivo.'
      : 'This is practice, not a live employment evaluation.'
  };
}

export function scorePractice(response, rubric = []) {
  const responseTokens = new Set(tokens(response));
  const results = rubric.map(item => {
    const required = item.keywords || [];
    const matched = required.filter(keyword => responseTokens.has(String(keyword).toLowerCase()));
    const earned = required.length ? item.weight * (matched.length / required.length) : 0;
    return { id: item.id, earned, possible: item.weight, matched };
  });
  const earned = results.reduce((total, item) => total + item.earned, 0);
  const possible = results.reduce((total, item) => total + item.possible, 0);
  return {
    score: possible ? Math.round((earned / possible) * 100) : 0,
    results,
    authority: AUTHORITY.COACHING,
    managerReviewRequired: true
  };
}

export function proposeImprovement({ observation, sourceId, actorId }) {
  return {
    status: 'review_required',
    authority: AUTHORITY.PROPOSED,
    observation: normalize(observation),
    sourceId,
    actorId,
    mayPublish: false,
    nextAction: 'Route to the manual owner for evidence review and approval.'
  };
}
