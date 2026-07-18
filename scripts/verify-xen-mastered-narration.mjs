import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { clips, instructions, voice, voiceContract } from './xen-mastered-narration-copy-v1.mjs';

const manifest = JSON.parse(await readFile('assets/narration/mastered-v1/manifest.json', 'utf8'));
if (manifest.schema !== 'xen-mastered-narration/v1') throw new Error('Unexpected mastered narration schema');
if (manifest.model !== 'gpt-4o-mini-tts' || manifest.voice !== voice) throw new Error('Canonical Xen model voice changed');
if (manifest.voiceContract !== voiceContract) throw new Error('Canonical Xen voice contract missing or changed');
if (manifest.approvedAudition !== 'assets/narration/xen-voice-audition-v2.mp3') throw new Error('Unapproved Xen voice audition');
if (manifest.instructionsSha256 !== createHash('sha256').update(instructions).digest('hex')) throw new Error('Canonical Xen performance instructions changed after generation');
if (manifest.clips.length !== clips.length) throw new Error(`Expected ${clips.length} clips; found ${manifest.clips.length}`);

const expected = new Set(clips.map(clip => clip.id));
for (const clip of manifest.clips) {
  if (!expected.delete(clip.id)) throw new Error(`Unexpected or duplicate clip: ${clip.id}`);
  const info = await stat(clip.path);
  if (info.size < 1024 || info.size !== clip.bytes) throw new Error(`Invalid mastered asset: ${clip.id}`);
  const bytes = await readFile(clip.path);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (!clip.sha256 || clip.sha256 !== digest) throw new Error(`Content hash mismatch: ${clip.id}`);
}
if (expected.size) throw new Error(`Missing mastered clips: ${[...expected].join(', ')}`);
const expectedBatch = createHash('sha256').update(manifest.clips.map(clip => `${clip.id}:${clip.sha256}`).join('|')).digest('hex');
if (!manifest.generationBatch || manifest.generationBatch !== expectedBatch) throw new Error('Mixed or invalid narration generation batch');

for (const audience of ['ed', 'kim', 'ahmer', 'faith']) {
  if (!manifest.clips.some(clip => clip.id === `intro-${audience}`)) throw new Error(`Missing ${audience} introduction`);
}
for (const path of ['bdc', 'company', 'compare']) {
  if (!manifest.clips.some(clip => clip.id === `ending-${path}`)) throw new Error(`Missing ${path} ending`);
  const appointment = manifest.clips.find(clip => clip.id === `appointment-${path}`);
  if (!appointment?.requiresExplicitContinue) throw new Error(`${path} appointment must require explicit continuation`);
}

console.log(`PASS Warden mastered narration gate · ${manifest.clips.length} content-addressed clips · one generation batch · ${voiceContract} · no alternate voice permitted`);
