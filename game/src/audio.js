// audio.js — tiny WebAudio bleeps, generated in code (no sound files).
// A bright two-note chime on each find, a low buzz on a miss, a soft tick
// for a hint, and a little arpeggio when a world is complete.

let audioCtx = null;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, startIn, duration, type, gain) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  const t0 = ac.currentTime + startIn;
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export const sfx = {
  found() { tone(660, 0, 0.16, 'sine', 0.14); tone(990, 0.09, 0.22, 'sine', 0.12); },
  miss() { tone(160, 0, 0.22, 'sawtooth', 0.06); },
  hint() { tone(520, 0, 0.12, 'triangle', 0.1); tone(780, 0.08, 0.14, 'triangle', 0.08); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.28, 'sine', 0.13));
  },
  timeout() { tone(392, 0, 0.2, 'triangle', 0.1); tone(311, 0.18, 0.3, 'triangle', 0.1); },
};
