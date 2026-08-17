/**
 * REFERENCE DISTILLER — turn an ad/video reference into analyzable material.
 *
 *   node tools/distill-reference.mjs <video.mp4> [--frames 10] [--lang en]
 *
 * Output: evenly-spaced keyframes (JPG) + a word-timestamped transcript
 * grouped into lines by silence gaps. Frames show the mechanism; the script
 * shows the timing — when the joke lands, when the product appears, how the
 * CTA sounds. An LLM analyzing both together can name the persuasion
 * mechanism instead of "it looks good".
 *
 * Requires: ffmpeg on PATH (or set FFMPEG env var), and an ElevenLabs API key
 * in the ELEVENLABS_API_KEY env var for the transcript (skip with --no-audio;
 * ~$0.01/min when enabled).
 *
 * MIT — Mauro Spigolon <mauro.spigo@gmail.com>
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const video = args[0];
if (!video || !fs.existsSync(video)) throw new Error('usage: node tools/distill-reference.mjs <video> [--frames 10] [--lang en] [--no-audio]');
const nFrames = Number(args.find((a) => a.startsWith('--frames='))?.slice(9) ?? 10);
const lang = args.find((a) => a.startsWith('--lang='))?.slice(7) ?? 'en';
const ffmpeg = process.env.FFMPEG ?? 'ffmpeg';

const probe = spawnSync(ffmpeg, ['-i', video], { encoding: 'utf8' });
const durMatch = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(probe.stderr ?? '');
if (!durMatch) throw new Error('could not read duration — is ffmpeg on PATH?');
const dur = Number(durMatch[1]) * 3600 + Number(durMatch[2]) * 60 + Number(durMatch[3]);

const out = path.join(path.dirname(path.resolve(video)), path.basename(video).replace(/\.[^.]+$/, '') + '-distilled');
fs.mkdirSync(out, { recursive: true });

for (let i = 0; i < nFrames; i++) {
  const t = (dur * (i + 0.5)) / nFrames;
  spawnSync(ffmpeg, ['-ss', String(t), '-i', video, '-frames:v', '1', '-q:v', '3', '-y', path.join(out, `frame-${String(Math.round(t)).padStart(3, '0')}s.jpg`)], { encoding: 'utf8' });
}
console.log(`${nFrames} frames → ${out}/`);

if (!args.includes('--no-audio')) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    console.log('no ELEVENLABS_API_KEY — skipping transcript (frames only)');
    process.exit(0);
  }
  const audio = path.join(out, 'audio.mp3');
  spawnSync(ffmpeg, ['-y', '-i', video, '-vn', '-ac', '1', '-ar', '16000', audio], { encoding: 'utf8' });
  const form = new FormData();
  form.append('model_id', 'scribe_v2');
  form.append('timestamps_granularity', 'word');
  form.append('language_code', lang);
  form.append('file', new Blob([fs.readFileSync(audio)], { type: 'audio/mpeg' }), 'a.mp3');
  const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: form });
  if (res.status !== 200) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const words = ((await res.json()).words ?? []).filter((w) => w.type === 'word');
  fs.rmSync(audio);

  // Group words into lines by >0.9s silence — the difference between a word
  // soup and something that reads like a script.
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  let lines = [];
  let cur = null;
  for (const w of words) {
    if (!cur || w.start - cur.end > 0.9) {
      cur = { start: w.start, end: w.end, text: [w.text] };
      lines.push(cur);
    } else {
      cur.text.push(w.text);
      cur.end = w.end;
    }
  }
  const script = lines.map((l) => `[${mmss(l.start)}–${mmss(l.end)}]  ${l.text.join(' ')}`).join('\n');
  fs.writeFileSync(path.join(out, 'script.md'), `# ${path.basename(video)}\n\n${script}\n`);
  console.log(`script (${lines.length} lines) → ${out}/script.md`);
}
