import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { clips, instructions, voice, voiceContract } from './xen-mastered-narration-copy-v1.mjs';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY is required');

const outputDirectory = 'assets/narration/mastered-v1';
await mkdir(outputDirectory, { recursive: true });

const generated = [];
for (const [position, clip] of clips.entries()) {
  const path = `${outputDirectory}/${clip.id}.mp3`;
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: clip.text, instructions, response_format: 'mp3' })
  });
  if (!response.ok) throw new Error(`Speech generation failed for ${clip.id}: ${response.status} ${await response.text()}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1024) throw new Error(`Generated clip is unexpectedly small: ${clip.id}`);
  await writeFile(path, bytes);
  generated.push({ ...clip, path, bytes: bytes.length });
  console.log(`[${position + 1}/${clips.length}] ${clip.id} · ${bytes.length} bytes`);
}

const approvedAudition = await readFile('assets/narration/xen-voice-audition-v2.mp3');
if (approvedAudition.length < 1024) throw new Error('Approved audition v2 is missing or empty');

await writeFile(`${outputDirectory}/manifest.json`, `${JSON.stringify({
  schema: 'xen-mastered-narration/v1',
  generatedAt: new Date().toISOString(),
  model: 'gpt-4o-mini-tts',
  voice,
  voiceContract,
  instructionsSha256: createHash('sha256').update(instructions).digest('hex'),
  approvedAudition: 'assets/narration/xen-voice-audition-v2.mp3',
  clips: generated.map(({ text, ...clip }) => clip)
}, null, 2)}\n`);

console.log(`Generated ${generated.length} mastered narration clips and manifest.`);
