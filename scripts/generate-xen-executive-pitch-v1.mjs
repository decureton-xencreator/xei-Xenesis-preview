import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { instructions, voice, voiceContract } from './xen-mastered-narration-copy-v1.mjs';
import { pitchId, pitchText } from './xen-executive-pitch-copy-v1.mjs';

const apiKey=process.env.OPENAI_API_KEY;
if(!apiKey)throw new Error('OPENAI_API_KEY is required');
const outputDirectory='assets/narration/xcm-v1';
await mkdir(outputDirectory,{recursive:true});
const response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice,input:pitchText,instructions,response_format:'mp3'})});
if(!response.ok)throw new Error(`Pitch generation failed: ${response.status} ${await response.text()}`);
const bytes=Buffer.from(await response.arrayBuffer());
if(bytes.length<1024)throw new Error('Generated pitch is unexpectedly small');
const path=`${outputDirectory}/${pitchId}.mp3`;
await writeFile(path,bytes);
const audition=await readFile('assets/narration/xen-voice-audition-v2.mp3');
if(audition.length<1024)throw new Error('Approved Xen audition v2 is missing');
await writeFile(`${outputDirectory}/manifest.json`,`${JSON.stringify({schema:'xen-executive-pitch/v1',generatedAt:new Date().toISOString(),model:'gpt-4o-mini-tts',voice,voiceContract,approvedAudition:'assets/narration/xen-voice-audition-v2.mp3',pitchId,textSha256:createHash('sha256').update(pitchText).digest('hex'),path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')},null,2)}\n`);
console.log(`Generated ${pitchId} · ${bytes.length} bytes`);
