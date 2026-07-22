const CANONICAL_ID='XLIE-XLEE-001';
const CONSENT=['save','do-not-save','remind-later','save-and-track-return-or-warranty','save-to-trip-project-mission-or-business'];
export function renderMissionHud(root, model={}){
 const phases=model.phases||[]; const active=phases.find(p=>p.status==='active')||phases.find(p=>p.status==='planned')||null;
 const complete=phases.filter(p=>p.status==='complete').length; const truth=model.position_truth||'planned';
 root.innerHTML=`<section class="xlie-hud" data-canonical-id="${CANONICAL_ID}">
 <header><small>${CANONICAL_ID} · ${escapeHtml(truth)}</small><h1>${escapeHtml(model.title||'Mission HUD')}</h1><progress value="${complete}" max="${phases.length||1}"></progress></header>
 <div class="hud-grid"><article><b>Active phase</b><p>${escapeHtml(active?.objective||'No active phase')}</p><small>${complete} / ${phases.length} complete</small></article>
 <article><b>Next maneuver</b><p>${escapeHtml(model.next_maneuver||'Awaiting verified route context')}</p><small>Live navigation: ${model.live_navigation_verified?'verified':'not verified'}</small></article>
 <article><b>Venue</b><p>${escapeHtml(model.venue?.name||'No verified venue')}</p><small>${escapeHtml(model.venue?.confidence||'confidence unavailable')}</small></article>
 <article><b>Receipt Vault</b><p>${escapeHtml(model.receipt_state||'consent required before save')}</p><small>Persistence is never implied</small></article></div>
 <div class="hud-alerts" aria-live="polite">${(model.alerts||[]).map(a=>`<p>${escapeHtml(a)}</p>`).join('')}</div></section>`;
}
export function receiptConsent(choice){return {choice,persist:CONSENT.includes(choice)&&choice.startsWith('save'),valid:CONSENT.includes(choice)}}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const root=document.querySelector('[data-xlie-mission-hud]');
if(root) renderMissionHud(root,JSON.parse(root.dataset.model||'{}'));
