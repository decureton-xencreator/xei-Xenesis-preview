import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { clips, instructions, screenplay, voice, voiceContract } from './xen-investor-reveal-narration-copy-v1.mjs';
const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)throw new Error('OPENAI_API_KEY is required');
const outputDirectory='assets/narration/investor-reveal-v1';await mkdir(outputDirectory,{recursive:true});
const generated=[];
for(const [position,clip] of clips.entries()){
 const path=`${outputDirectory}/${clip.id}.mp3`;
 const response=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice,input:clip.text,instructions,response_format:'mp3',speed:0.97})});
 if(!response.ok)throw new Error(`Speech generation failed for ${clip.id}: ${response.status} ${await response.text()}`);
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length<1024)throw new Error(`Generated clip is unexpectedly small: ${clip.id}`);
 await writeFile(path,bytes);generated.push({...clip,path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});console.log(`[${position+1}/${clips.length}] ${clip.id} · ${bytes.length} bytes`);
}
const audition=await readFile('assets/narration/xen-voice-audition-v2.mp3');if(audition.length<1024)throw new Error('Approved audition v2 is missing or empty');
await writeFile(`${outputDirectory}/manifest.json`,`${JSON.stringify({schema:'xen-investor-reveal-narration/v1',generatedAt:new Date().toISOString(),screenplay,model:'gpt-4o-mini-tts',voice,voiceContract,approvedAudition:'assets/narration/xen-voice-audition-v2.mp3',instructionsSha256:createHash('sha256').update(instructions).digest('hex'),generationBatch:createHash('sha256').update(generated.map(c=>`${c.id}:${c.sha256}`).join('|')).digest('hex'),clips:generated.map(({text,...clip})=>clip)},null,2)}\n`);
console.log(`Generated ${generated.length} Investor Reveal narration clips and manifest.`);
