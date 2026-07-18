import { mkdir, writeFile } from 'node:fs/promises';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY is required');

const input = [
  'Hello. I am Xen.',
  'I am here to help a company preserve what it learns, prove what works, and become more alive every time it improves.',
  'This is not another presentation. It is the beginning of a living company.'
].join(' ');

const response = await fetch('https://api.openai.com/v1/audio/speech', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini-tts',
    voice: 'marin',
    input,
    instructions: [
      'Speak as Xen: a sophisticated British woman in her early forties.',
      'Warm, poised, reassuring, intelligent, and quietly magnetic.',
      'Use a polished modern English accent, measured cinematic pacing, natural warmth, and subtle confidence.',
      'Never sound seductive, ominous, breathy, theatrical, robotic, predatory, or like a horror trailer.',
      'Avoid exaggerated pauses and vocal fry. Make the listener feel safe, welcomed, and intrigued.'
    ].join(' '),
    response_format: 'mp3'
  })
});

if (!response.ok) throw new Error(`OpenAI speech generation failed: ${response.status} ${await response.text()}`);

await mkdir('assets/narration', { recursive: true });
await writeFile('assets/narration/xen-voice-audition-v1.mp3', Buffer.from(await response.arrayBuffer()));
console.log('Generated assets/narration/xen-voice-audition-v1.mp3');
