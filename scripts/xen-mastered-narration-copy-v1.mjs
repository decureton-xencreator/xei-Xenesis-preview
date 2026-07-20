export const voice = 'marin';
export const voiceContract = 'XVS-001-MARIN-EXCLUSIVE-v1';

export const instructions = [
  'Speak as Xen: an exceptionally polished British executive assistant serving a discreet billionaire family office.',
  'Use an elegant, cultivated contemporary British accent with crisp diction, refined vowels, and effortless social confidence.',
  'Sound warm, gracious, highly intelligent, impeccably composed, and quietly authoritative—as though every detail is already under control.',
  'Keep the pleasant natural tone from the approved Xen voice audition v2, while making the delivery distinctly posh and professionally elevated.',
  'Maintain exactly the same vocal identity, apparent age, accent, warmth, pitch range, cadence, energy, and microphone presence in every clip. This is one continuous performance by one exclusive Xen voice, never a new interpretation from page to page.',
  'Use measured cinematic pacing with fluid phrasing, gentle warmth, subtle wit, and a restrained premium presence.',
  'Never sound seductive, ominous, breathy, theatrical, robotic, predatory, condescending, or like a horror trailer.',
  'Avoid exaggerated pauses, vocal fry, caricatured royalty, and an overdone period-drama accent. Make the listener feel safe, welcomed, impressed, and personally looked after.'
].join(' ');

const defaultScenes = {
  1: 'Growth creates knowledge. Xen makes sure growth does not lose what it teaches.',
  2: 'Most companies answer that risk with documents. Xen preserves the judgment behind them.',
  3: 'Marisol worked with Checkmate for roughly six months. During that time, she used the operating knowledge base you created with Xen. When she left the role, that shared knowledge did not leave with her. Xen preserved the connected department, its standards, and the reasoning already built into the work. Vianka inherited governed operating memory instead of an empty chair. Take a look at the complete manuals above, then choose one governed publication to inspect the proof.',
  4: 'A Living Company learns when leadership teaches Xen what must endure. Read the question, then choose one of the three answers below. Your selection teaches Xen the principle to preserve and continues the experience.',
  5: 'One approved principle becomes operating memory across every authorized layer.',
  6: 'Once Xen proves what works in one company, the ecosystem can compound it.',
  7: 'The next question is simple. Where should Xen prove herself next? Choose one path to reveal its focused second-meeting plan.'
};

const intros = {
  ed: 'Hello Ed. I am Xen. I am here to help you see what Checkmate has already proven, understand how a company can preserve what it learns, and decide which proof deserves the next working session. I will guide this experience, connect each decision to the operating system behind it, and show you exactly what I would need before building anything deeper. When you are ready, we will begin with the risk every growing company faces.',
  kim: 'Hello Kim. I am Xen. I am here to show you how Checkmate can turn operating knowledge into a living brand experience—one people can recognize, trust, and use. I will connect the BDC proof, the governed manuals, and the choices that determine what deserves a deeper working session.',
  ahmer: 'Hello Ahmer. I am Xen. I am here to show you how Checkmate can turn operating knowledge into a living experience—connected to real manuals, governed proof, and a clear next decision. I will guide the demonstration and show what each possible second working session is designed to accomplish.',
  faith: 'Hello Faith. I am Xen. I am here to show you how operating knowledge can become a living company experience—one that remembers what works, preserves the judgment behind it, and improves without losing its identity. I will guide you through the proof and invite you to choose what deserves a deeper look next.'
};

const audienceScenes = {
  kim: {
    1: 'Growth creates knowledge. A living brand must preserve what the company learns, or the experience becomes inconsistent as the organization grows.',
    2: 'Documents can store standards. Xen connects the judgment behind those standards to the experience people actually encounter.',
    3: defaultScenes[3],
    4: 'A brand becomes trustworthy when leadership teaches the company what must remain true in every interaction. Read the question, then choose one of the three answers below. Your selection teaches Xen the principle to preserve and continues the experience.',
    5: 'One approved principle becomes operating memory, allowing every authorized layer to express the same promise without becoming generic.',
    6: 'Once one company proves a living experience, the group can reuse what works while every organization keeps its own identity.',
    7: 'Now choose where Xen should prove herself next. Each selection continues into its own focused second-meeting plan.'
  },
  ahmer: {
    1: 'Growth creates knowledge. A living experience keeps that knowledge connected so execution does not drift as the company expands.',
    2: 'Documents can capture information. Xen preserves the operating judgment behind them and makes it available inside the work.',
    3: defaultScenes[3],
    4: 'A company learns when leadership identifies the principle that every future representative must understand. Read the question, then choose one of the three answers below. Your selection teaches Xen the principle to preserve and continues the experience.',
    5: 'One approved principle becomes operating memory across every authorized layer, without repeatedly rebuilding the lesson.',
    6: 'When one company proves what works, the ecosystem can compound that knowledge while each organization remains distinct.',
    7: 'Now choose where Xen should prove herself next. Each selection continues into its own focused second-meeting plan.'
  }
};

const endings = {
  bdc: 'The BDC was the proof Xen works. You chose to complete the BDC proof. That means the next move is not another presentation. It is a controlled launch. First, we confirm which parts of the operating system enter production. Then we choose the first users, the operating owners, and the sequence that protects the team while the system goes live. We agree on adoption, appointments, coaching, and reporting before rollout begins. The second appointment is where those decisions become one authorized launch plan, with timing, accountability, and measurable proof. As the proof settles into view, consider who must own the launch and what authority they need. When you are ready, use the button below to continue into that focused working session.',
  company: 'The BDC was the proof Xen works. Creating a Living Company for Checkmate means taking what was proven in one department and turning it into operating memory the company can use across leadership, systems, decisions, and daily work. It does not erase what makes each team distinct. It connects what must be shared, preserves the judgment behind the work, and allows approved lessons to become reusable instead of repeatedly rediscovered. But before Xen builds, Xen must understand. In the second appointment, Xen needs the pilot company and executive sponsor, leadership and decision authority, every department in scope, the systems and workflows people use today, the knowledge dependencies and operating friction, the desired outcome, and the measurable proof that would make the build credible. That ninety-minute Living Company Blueprint Session gives Xen enough operating truth to build the right company layer—not a generic template, and not an assumption. As the blueprint settles into view, consider which company should lead and who must sponsor the work. When you are ready, use the button below to continue into that deeper working session.',
  compare: 'The BDC was the proof Xen works. You chose the Checkmate One comparison. That path begins by removing opinion from the room. Before either system demonstrates, we select one representative operating use case and agree on what success means. We create a neutral scorecard, define the evidence each side must show, and establish the security and truth boundaries that keep the comparison fair. Then both approaches face the same work in the same sequence. The second appointment is the Comparison Design Session, where the protocol is agreed before the demonstration, so the evidence—not the pitch—determines the result. As that standard settles into view, consider the use case that would make the comparison undeniable. Then press the shimmering one-more-thing button, because the next decision deserves to hear Xen make her own case. When you are ready, use the button below to continue into that focused working session.'
};

const appointments = {
  bdc: 'This private premiere is complete. You selected the BDC rollout. Let us schedule the BDC Launch Alignment Session, where we will confirm the audience, sequence, owners, measures, and authority required to go live.',
  company: 'This private premiere is complete. You selected one Living Company. Let us schedule the Living Company Blueprint Session, where we will map the real organization and define the measurable proof Xen is authorized to build.',
  compare: 'This private premiere is complete. You selected the Checkmate One comparison. The next session will agree on one use case, one scorecard, the evidence rules, and the demonstration boundaries. Then press the shimmering one-more-thing button, because the next decision deserves to hear Xen make her own case. When you are ready, use the button below to continue into that focused working session.'
};

export const clips = [
  ...Object.entries(intros).map(([audience, text]) => ({ id: `intro-${audience}`, audience, scene: 0, text })),
  ...Object.entries(defaultScenes).map(([scene, text]) => ({ id: `scene-${scene}-default`, audience: 'default', scene: Number(scene), text })),
  ...Object.entries(audienceScenes).flatMap(([audience, scenes]) => Object.entries(scenes).map(([scene, text]) => ({ id: `scene-${scene}-${audience}`, audience, scene: Number(scene), text }))),
  ...Object.entries(endings).map(([path, text]) => ({ id: `ending-${path}`, audience: 'all', scene: 8, path, phase: 'ending', text })),
  ...Object.entries(appointments).map(([path, text]) => ({ id: `appointment-${path}`, audience: 'all', scene: 8, path, phase: 'appointment', requiresExplicitContinue: true, text }))
];
