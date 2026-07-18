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
      'Speak as Xen: an exceptionally polished British executive assistant serving a discreet billionaire family office.',
      'Use an elegant, cultivated contemporary British accent with crisp diction, refined vowels, and effortless social confidence.',
      'Sound warm, gracious, highly intelligent, impeccably composed, and quietly authoritative—as though every detail is already under control.',
      'Keep the pleasant natural tone from the approved first audition, while making the delivery distinctly more posh and professionally elevated.',
      'Use measured cinematic pacing with fluid phrasing, gentle warmth, subtle wit, and a restrained premium presence.',
      'Never sound seductive, ominous, breathy, theatrical, robotic, predatory, condescending, or like a horror trailer.',
      'Avoid exaggerated pauses, vocal fry, caricatured royalty, and an overdone period-drama accent. Make the listener feel safe, welcomed, impressed, and personally looked after.'
    ].join(' '),
    response_format: 'mp3'
  })
});

if (!response.ok) throw new Error(`OpenAI speech generation failed: ${response.status} ${await response.text()}`);

await mkdir('assets/narration', { recursive: true });
await writeFile('assets/narration/xen-voice-audition-v2.mp3', Buffer.from(await response.arrayBuffer()));
console.log('Generated assets/narration/xen-voice-audition-v2.mp3');
