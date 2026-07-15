const VERSION = '2.0.0-diamond';
const KEY = 'xei.ed.premiere.v2';

const manuals = {
  'XBM-101': {
    title: 'BDC Agent Field Guide',
    section: 'Customer Conversation Standard',
    lines: [
      'Understand before persuading.',
      'Reduce pressure, clarify intent, educate accurately, and earn the next step.',
      'Capture the customer objective, concern, timeframe, decision-makers, and agreed follow-up.',
      'Never trade truth for momentum.'
    ]
  },
  'XBM-102': {
    title: 'BDC Manager Operating Manual',
    section: 'Coaching & Quality Standard',
    lines: [
      'Coach observable behaviors, not personality.',
      'Review whether the representative listened, clarified, educated, confirmed, and documented.',
      'Turn repeated friction into a training improvement, not a private complaint.',
      'Escalate uncertainty before it becomes customer harm.'
    ]
  },
  'XBM-103': {
    title: 'BDC Objection Playbook',
    section: '“I’m Just Looking”',
    lines: [
      'Listen without interrupting.',
      'Acknowledge without pressure.',
      'Clarify what the customer hopes to learn.',
      'Educate with the smallest useful amount of accurate information.',
      'Offer a useful next step and let the customer choose.'
    ]
  },
  'XBM-104': {
    title: 'BDC Script Playbook',
    section: 'Approved Customer Language',
    lines: [
      '“Absolutely. What are you hoping to learn while you look?”',
      '“I can give you a useful starting point without putting pressure on you.”',
      '“Would it help to compare styles, budget ranges, or the project process first?”',
      '“I will document what matters to you so the next person does not make you repeat yourself.”'
    ]
  }
};

const scenes = ['opening','assessment','mri','origin','manual','contribution','route','propagate','reveal','summary','mandate','close'];
const defaults = {
  scene: 0,
  answer: '',
  intent: '',
  contribution: '',
  route: 'XBM-103',
  company: '',
  department: '',
  voice: true,
  manual: 'XBM-103',
  updatedAt: Date.now()
};
let state = load();

const $ = s => document.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const button = (label, id='next', cls='primary') => `<button class="btn ${cls}" id="${id}">${label}</button>`;
const shell = (eyebrow, title, body, actions='', extra='') => `<section class="scene ${extra}"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${body}<div class="actions">${actions}</div></section>`;

function load(){
  try { return {...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}')}; }
  catch { return {...defaults}; }
}
function save(){ state.updatedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(state)); updateChrome(); }
function updateChrome(){
  const pct = (state.scene / (scenes.length - 1)) * 100;
  $('#progress').style.width = `${pct}%`;
  $('#sceneCount').textContent = `${String(state.scene + 1).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;
  $('#back').disabled = state.scene === 0;
  $('#voice').textContent = `Voice · ${state.voice ? 'On' : 'Off'}`;
}
function speak(text){
  if (!state.voice || !('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = .9; utterance.pitch = .96; utterance.volume = .82;
  speechSynthesis.speak(utterance);
}
function classify(text){
  const value = text.toLowerCase();
  if (/coach|manager|quality|review|score/.test(value)) return 'XBM-102';
  if (/say|word|phrase|script|language/.test(value)) return 'XBM-104';
  if (/objection|pressure|looking|not interested|think about|price/.test(value)) return 'XBM-103';
  return 'XBM-101';
}
function next(){ if (state.scene < scenes.length - 1) { state.scene += 1; save(); render(); } }
function back(){ if (state.scene > 0) { state.scene -= 1; save(); render(); } }

function manualViewer(id, revision=false){
  const m = manuals[id];
  return `<div class="manual-frame glass">
    <aside class="manual-rail">
      <div class="label">CANONICAL PUBLICATION FAMILY</div>
      <h3>${m.title}</h3>
      <input class="manual-search" id="manualSearch" placeholder="Search living manual" aria-label="Search living manual">
      <div class="manual-tabs">
        ${Object.entries(manuals).map(([key,item]) => `<button class="manual-tab ${key===id?'active':''}" data-manual="${key}">${key}<br>${item.title.replace('BDC ','')}</button>`).join('')}
      </div>
      <div class="manual-meta">LIVING DOCUMENT RUNTIME<br>Truth labeled · Version governed<br>Searchable · Trainable · Inheritable<br><br>Executive contribution layer active</div>
    </aside>
    <article class="manual-page">
      <div class="chapter">${id} · ${m.section}</div>
      <h2>${m.section}</h2>
      <div class="living-pill"><i></i> LIVING MANUAL · ACTIVE</div>
      <div class="manual-lines">
        ${m.lines.map((line,index)=>`<div class="manual-line" data-search="${esc(line.toLowerCase())}"><b>${String(index+1).padStart(2,'0')}</b><span>${esc(line)}</span></div>`).join('')}
      </div>
      ${revision ? `<div class="revision" id="revision"><div class="chapter">PROPOSED EXECUTIVE EVOLUTION</div><h3>${esc(state.contribution)}</h3><p>Xen classified this instruction into <strong>${m.title}</strong>, section <strong>${m.section}</strong>. Approval will propagate it into agent guidance, manager coaching, training, QA, and future-hire inheritance.</p></div>` : ''}
    </article>
  </div>`;
}

function render(){
  speechSynthesis?.cancel();
  const scene = scenes[state.scene];
  let html = '';
  let narration = '';

  if (scene === 'opening') {
    html = shell('Private executive premiere', 'Ed, this began with one department.', `
      <div class="hero-mark">X</div>
      <p class="lead">Darren needed six people in Panama—with no cabinet or countertop experience—to operate with the judgment of a mature BDC department.</p>
      <div class="hero-proof">
        <div class="proof-card"><strong>01</strong><span>A real operating problem—not an AI exercise.</span></div>
        <div class="proof-card"><strong>06</strong><span>New team members requiring immediate operating intelligence.</span></div>
        <div class="proof-card"><strong>∞</strong><span>A question bigger than a manual: can company knowledge become infrastructure?</span></div>
      </div>`, button('Enter the experience','next','primary'));
    narration = 'Ed, this began with one department. Darren needed six people in Panama, with no cabinet or countertop experience, to operate with the judgment of a mature B D C department.';
  }

  if (scene === 'assessment') {
    html = shell('Executive assessment', 'How much of a company still disappears when the right person leaves?', `
      <p class="lead">Choose the answer that is most true across a growing group of companies.</p>
      <div class="choice-grid">
        ${[
          ['01','Too much','Knowledge and judgment still live primarily inside people.'],
          ['02','Some','Processes exist, but execution changes depending on who is present.'],
          ['03','Very little','Knowledge is governed, searchable, teachable, and inherited.']
        ].map(item=>`<button class="choice" data-answer="${item[2]}"><span class="num">${item[0]}</span><b>${item[1]}</b><span>${item[2]}</span></button>`).join('')}
      </div>`);
    narration = 'How much of a company still disappears when the right person leaves? Choose the answer that is most true.';
  }

  if (scene === 'mri') {
    html = shell('Enterprise MRI', 'The issue is not missing information. It is fragmented intelligence.', `
      <div class="mri">
        <div class="mri-map glass">
          <div class="core">EXECUTIVE<br>INTENT</div>
          <div class="node">People</div><div class="node">Manuals</div><div class="node">Systems</div><div class="node">Departments</div><div class="node">Companies</div>
        </div>
        <div class="mri-panel glass">
          <div class="eyebrow">Observed friction</div>
          <div class="signal-list">
            <button class="signal"><b>Knowledge dependency <em>High</em></b><small>Critical judgment is difficult to inherit consistently.</small></button>
            <button class="signal"><b>Training distance <em>Extended</em></b><small>New people must find, interpret, and remember disconnected information.</small></button>
            <button class="signal"><b>Leadership repetition <em>Recurring</em></b><small>The same standards must be retaught because the company cannot yet teach itself.</small></button>
            <button class="signal"><b>Execution continuity <em>Variable</em></b><small>Systems store records; they do not preserve the full reason behind decisions.</small></button>
          </div>
        </div>
      </div>`, button('Show me the proof'));
    narration = 'The issue is not missing information. It is fragmented intelligence. People, manuals, systems, departments, and companies each hold part of the operating truth.';
  }

  if (scene === 'origin') {
    html = shell('The real build', 'The BDC system was born because failure was not an option.', `
      <p class="lead">Vianka became the first actual BDC Manager. Five Panamanian agents joined without cabinet or countertop sales experience. A binder would not be enough.</p>
      <div class="propagation">
        <div><span>Product knowledge had to be teachable</span><b>CAPTURED</b></div>
        <div><span>Customer conversations had to be repeatable</span><b>STANDARDIZED</b></div>
        <div><span>Manager coaching had to be consistent</span><b>GOVERNED</b></div>
        <div><span>Objections had to become learning moments</span><b>ROUTED</b></div>
        <div><span>Every future hire had to inherit improvement</span><b>DESIGNED IN</b></div>
      </div>`, button('Open the living manual','next','xen'));
    narration = 'The B D C system was born because failure was not an option. A binder would not be enough.';
  }

  if (scene === 'manual') {
    html = shell('Proof of execution', 'This is not a document. It is an operating surface.', `
      <p class="copy">Search it. Move between manuals. Read the actual customer standard. The agent stays inside the work instead of leaving to hunt for knowledge.</p>
      ${manualViewer(state.manual)}`, button('Let Ed teach the system'));
    narration = 'This is not a document. It is an operating surface. Search it, move between manuals, and read the actual customer standard.';
  }

  if (scene === 'contribution') {
    html = shell('Executive contribution', 'When a customer says, “I’m just looking,” what should every future representative understand or do?', `
      <p class="copy">Use your own words. Xen will determine where the instruction belongs and show exactly what changes if it is approved.</p>
      <textarea id="contribution" placeholder="Example: Never make the customer feel chased. Help them understand enough to choose the next step willingly.">${esc(state.contribution)}</textarea>
      <p class="whisper">Your response is saved locally as you type. No production system is being changed in this demonstration.</p>`, button('Route my judgment','route','xen'));
    narration = 'Now teach the company something. When a customer says I am just looking, what should every future representative understand or do?';
  }

  if (scene === 'route') {
    const id = state.route;
    html = shell('Living manual router', 'Xen found the correct home for your judgment.', `
      <div class="route-card glass">
        <div class="eyebrow">Classification complete</div>
        <div class="route-grid">
          <span>Canonical destination</span><b>${id} · ${manuals[id].title}</b>
          <span>Section</span><b>${manuals[id].section}</b>
          <span>Reason</span><b>The instruction governs customer-pressure reduction and the approved response to an objection.</b>
          <span>Authority</span><b>Executive approval required before propagation.</b>
        </div>
      </div>
      ${manualViewer(id,true)}`, button('Approve this evolution','next','xen'), 'compact');
    narration = `Xen found the correct home. ${manuals[id].title}, ${manuals[id].section}. Approval is required before propagation.`;
    setTimeout(()=>$('#revision')?.scrollIntoView({behavior:'smooth',block:'center'}),700);
  }

  if (scene === 'propagate') {
    html = shell('Visible propagation', 'One approved decision. Every related layer learns.', `
      <p class="lead">The instruction is no longer trapped in the meeting where it was spoken.</p>
      <div class="propagation">
        <div><span>BDC Agent guidance</span><b>UPDATED</b></div>
        <div><span>Manager coaching standard</span><b>INHERITED</b></div>
        <div><span>Objection certification</span><b>ALIGNED</b></div>
        <div><span>Call-quality rubric</span><b>MEASURE ADDED</b></div>
        <div><span>New-hire training</span><b>INHERITED</b></div>
        <div><span>Executive memory</span><b>ATTRIBUTED TO ED</b></div>
      </div>`, button('Reveal what was actually built','next','primary'));
    narration = 'One approved decision. Every related layer learns. The instruction is no longer trapped in the meeting where it was spoken.';
  }

  if (scene === 'reveal') {
    html = `<section class="scene reveal-stage">
      <div class="eyebrow">The reveal</div>
      <div class="reveal-orbit"><div class="reveal-x">X</div><i class="reveal-dot one"></i><i class="reveal-dot two"></i><i class="reveal-dot three"></i></div>
      <h1>This manual is not actually a manual.</h1>
      <p class="lead">It is the first living organ of a company capable of remembering, teaching, operating, and improving itself.</p>
      <div class="actions">${button('Meet Xen','next','xen')}</div>
    </section>`;
    narration = 'This manual is not actually a manual. It is the first living organ of a company capable of remembering, teaching, operating, and improving itself.';
  }

  if (scene === 'summary') {
    const answer = state.answer || 'Critical judgment remains dependent on the people who currently hold it.';
    const contribution = state.contribution || 'Help the customer without pressure and earn the next step through usefulness.';
    html = shell('Executive summary', 'What happened here is larger than BDC.', `
      <div class="summary-card glass">
        <h3>Executive observation</h3><p>${esc(answer)}</p>
        <h3>Proof demonstrated</h3><p>A real operating publication was searched, questioned, evolved, approved, and propagated without pretending the demonstration records were live production data.</p>
        <h3>Executive knowledge captured</h3><p>“${esc(contribution)}”</p>
        <h3>Strategic implication</h3><p>The BDC family proves that leadership judgment can become governed company infrastructure. The same method can connect departments, companies, systems, manuals, decisions, and people.</p>
      </div>
      <div class="closing-question">What if every company you own could inherit what makes your best company work?</div>`, button('Define the second meeting','next','primary'));
    narration = 'What happened here is larger than B D C. The B D C family proves that leadership judgment can become governed company infrastructure.';
  }

  if (scene === 'mandate') {
    const companies = ['One operating company','One department across several companies','The executive layer above the group','Checkmate 1 integration and comparison'];
    html = shell('The second meeting', 'Where should Xen prove itself next?', `
      <p class="lead">Choose the mandate—not the software feature.</p>
      <div class="company-grid">
        ${companies.map(item=>`<button class="company-choice" data-company="${item}"><b>${item}</b><span>Build a truth-labeled Living Company blueprint around this scope.</span></button>`).join('')}
      </div>`);
    narration = 'Where should Xen prove itself next? Choose the mandate, not the software feature.';
  }

  if (scene === 'close') {
    html = shell('Xenesis executive premiere', 'Software stores what happened. Xen preserves what the company should become.', `
      <p class="lead">The BDC Operating System was the proof. The Living Company is the opportunity.</p>
      <div class="summary-card glass">
        <h3>Second-meeting mandate</h3><p>${esc(state.company || 'To be selected with Ed')}</p>
        <h3>Deliverable</h3><p>Enterprise Memory Map · Knowledge Dependency Analysis · Living Company Blueprint · First production integration path</p>
        <h3>Positioning</h3><p>Xen can complement, interrogate, or extend Checkmate 1. The next meeting establishes the evidence before choosing the relationship.</p>
      </div>
      <div class="seal">XEI-001 · DIAMOND EXECUTIVE EXPERIENCE · ${VERSION}</div>`, button('Replay the premiere','restart','ghost'));
    narration = 'Software stores what happened. Xen preserves what the company should become. The B D C Operating System was the proof. The Living Company is the opportunity.';
  }

  $('#stage').innerHTML = html;
  bind(scene);
  updateChrome();
  $('#stage').focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(()=>speak(narration),450);
}

function bind(scene){
  $('#next')?.addEventListener('click', next);
  $('#restart')?.addEventListener('click', ()=>{ localStorage.removeItem(KEY); state={...defaults}; render(); });
  document.querySelectorAll('[data-answer]').forEach(el=>el.addEventListener('click',()=>{state.answer=el.dataset.answer;save();next();}));
  document.querySelectorAll('[data-company]').forEach(el=>el.addEventListener('click',()=>{state.company=el.dataset.company;save();next();}));
  document.querySelectorAll('[data-manual]').forEach(el=>el.addEventListener('click',()=>{state.manual=el.dataset.manual;save();render();}));
  $('#manualSearch')?.addEventListener('input',event=>{
    const query=event.target.value.trim().toLowerCase();
    document.querySelectorAll('.manual-line').forEach(line=>line.classList.toggle('hidden',query && !line.dataset.search.includes(query)));
  });
  $('#contribution')?.addEventListener('input',event=>{state.contribution=event.target.value;save();});
  $('#route')?.addEventListener('click',()=>{
    const value=$('#contribution').value.trim();
    state.contribution=value || 'Never make the customer feel chased. Help them understand enough to choose the next step willingly.';
    state.route=classify(state.contribution); save(); next();
  });
}

$('#back').addEventListener('click',back);
$('#home').addEventListener('click',()=>{state.scene=0;save();render();});
$('#voice').addEventListener('click',()=>{state.voice=!state.voice;speechSynthesis?.cancel();save();if(state.voice)render();});
document.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft') back();
  if(event.key==='ArrowRight' && !['TEXTAREA','INPUT'].includes(document.activeElement.tagName)) next();
});
render();
