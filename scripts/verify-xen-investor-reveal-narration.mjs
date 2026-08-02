import { createHash } from 'node:crypto';import { readFile,stat } from 'node:fs/promises';import { clips,instructions,screenplay,voice,voiceContract } from './xen-investor-reveal-narration-copy-v1.mjs';
const manifest=JSON.parse(await readFile('assets/narration/investor-reveal-v1/manifest.json','utf8'));
if(manifest.schema!=='xen-investor-reveal-narration/v1'||manifest.screenplay!==screenplay)throw new Error('Unexpected screenplay or schema');
if(manifest.model!=='gpt-4o-mini-tts'||manifest.voice!==voice||manifest.voiceContract!==voiceContract)throw new Error('Canonical Marin voice contract changed');
if(manifest.approvedAudition!=='assets/narration/xen-voice-audition-v2.mp3')throw new Error('Unapproved voice audition');
if(manifest.instructionsSha256!==createHash('sha256').update(instructions).digest('hex'))throw new Error('Performance instructions changed after generation');
if(manifest.clips.length!==34||clips.length!==34)throw new Error('Exactly 34 scene masters are required');
const expected=new Map(clips.map(c=>[c.id,c]));
for(const clip of manifest.clips){const source=expected.get(clip.id);if(!source||source.scene!==clip.scene||source.title!==clip.title)throw new Error(`Unexpected or mismatched clip: ${clip.id}`);expected.delete(clip.id);const info=await stat(clip.path);if(info.size<1024||info.size!==clip.bytes)throw new Error(`Invalid asset: ${clip.id}`);const bytes=await readFile(clip.path);if(createHash('sha256').update(bytes).digest('hex')!==clip.sha256)throw new Error(`Hash mismatch: ${clip.id}`);}
if(expected.size)throw new Error(`Missing clips: ${[...expected.keys()].join(', ')}`);
const batch=createHash('sha256').update(manifest.clips.map(c=>`${c.id}:${c.sha256}`).join('|')).digest('hex');if(batch!==manifest.generationBatch)throw new Error('Mixed narration generation batch');
console.log(`PASS Investor Reveal narration gate · 34 content-addressed Marin scene masters · ${voiceContract}`);
