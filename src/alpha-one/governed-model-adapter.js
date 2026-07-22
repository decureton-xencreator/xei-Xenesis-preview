const clean = value => String(value ?? '').trim();

export function createGovernedModelAdapter({generate}) {
  if (typeof generate !== 'function') throw new Error('model_generate_function_required');
  return Object.freeze({
    async explain({groundedAnswer, question, language, tenantId}) {
      if (!groundedAnswer?.source || groundedAnswer.escalationRequired) return groundedAnswer;
      const candidate = await generate({
        question,
        language,
        tenantId,
        approvedText: groundedAnswer.answer,
        requiredCitation: {...groundedAnswer.source}
      });
      const citation = candidate?.citation;
      const citationValid = citation?.id === groundedAnswer.source.id && citation?.version === groundedAnswer.source.version;
      if (!citationValid || !clean(candidate?.answer)) {
        return {...groundedAnswer, modelApplied: false, modelBlockedReason: 'citation_or_answer_invalid'};
      }
      return {...groundedAnswer, answer: clean(candidate.answer), source: {...groundedAnswer.source}, modelApplied: true};
    }
  });
}
