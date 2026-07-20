import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pitchId, pitchText } from './xen-executive-pitch-copy-v1.mjs';

const manifest=JSON.parse(await readFile('assets/narration/xcm-v1/manifest.json','utf8'));
if(manifest.schema!=='xen-executive-pitch/v1'||manifest.pitchId!==pitchId||manifest.voice!=='marin'||manifest.voiceContract!=='XVS-001-MARIN-EXCLUSIVE-v1')throw new Error('Executive pitch voice contract failed');
if(manifest.textSha256!==createHash('sha256').update(pitchText).digest('hex'))throw new Error('Executive pitch copy does not match mastered audio manifest');
const audio=await readFile(manifest.path);
if(audio.length!==manifest.bytes||createHash('sha256').update(audio).digest('hex')!==manifest.sha256)throw new Error('Executive pitch audio bytes failed Warden verification');
console.log('PASS XEP-001 single-voice executive pitch');
