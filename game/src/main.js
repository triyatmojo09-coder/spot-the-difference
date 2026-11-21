// main.js — the game controller: wires scenes, input, HUD, timer and
// progress together, and stages deterministic states for screenshots
// (?shot=cover|select|win|play2&scene=<id>&seed=<n>).

import { SCENES, getScene } from './scenes.js';
import { renderPanel, burst } from './renderer.js';
import { pickDifferences, findHit, DIFFERENCES_PER_PLAY } from './differences.js';
import { attachPanelInput, createMagnifier } from './input.js';
import { loadProgress, recordWin, formatTime } from './storage.js';
import { renderLevelGrid, updateHud, setMessage, renderFoundChips, showScreen, showOverlay, hideOverlay, starString } from './hud.js';
import { sfx } from './audio.js';

const TIME_LIMIT = 120; // seconds per scene
const WRONG_PENALTY = 5; // seconds lost on a wrong click
const HINTS_PER_SCENE = 3;

// Small seeded RNG (mulberry32) so screenshot staging is deterministic.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const $ = (id) => document.getElementById(id);
const canvasA = $('canvas-a');
const canvasB = $('canvas-b');
canvasA.dataset.panel = 'a';
canvasB.dataset.panel = 'b';

const state = {
  screen: 'select',
  scene: SCENES[0],
  activeSpots: [],
  found: new Set(),
  secondsLeft: TIME_LIMIT,
  hintsLeft: HINTS_PER_SCENE,
  mistakes: 0,
  hintId: null,
  hintUntil: 0,
  miss: null,
  missUntil: 0,
  bursts: [],
  endAt: 0,
  paused: false,
  frozen: false, // shot staging freezes the clock
  progress: loadProgress(),
};

const magnifier = createMagnifier($('lens'), () => canvasA);
magnifier.track(canvasA);
magnifier.track(canvasB);

let timerId = null;

function activeSet() { return new Set(state.activeSpots.map((s) => s.id)); }

function draw() {
  const fx = {
    now: () => performance.now(),
    hintId: state.hintId,
    hintUntil: state.hintUntil,
    miss: state.miss,
    missUntil: state.missUntil,
  };
  renderPanel(canvasA, state.scene, activeSet(), state.found, fx);
  renderPanel(canvasB, state.scene, activeSet(), state.found, fx);
  // Expanding "found" bursts on both panels.
  const now = performance.now();
  state.bursts = state.bursts.filter((b) => now - b.at < 500);
  for (const b of state.bursts) {
    const p = (now - b.at) / 500;
    burst(canvasA.getContext('2d'), b.x, b.y, p);
    burst(canvasB.getContext('2d'), b.x, b.y, p);
  }
  requestAnimationFrame(draw);
}

function remaining() { return state.activeSpots.length - state.found.size; }

function refreshHud() {
  updateHud({
    scene: state.scene,
    remaining: remaining(),
    total: state.activeSpots.length,
    secondsLeft: Math.ceil(state.secondsLeft),
    hintsLeft: state.hintsLeft,
  });
  renderFoundChips(state.activeSpots, state.found);
}

function startTimer() {
  clearInterval(timerId);
  state.endAt = Date.now() + state.secondsLeft * 1000;
  timerId = setInterval(() => {
    if (state.frozen || state.paused || state.screen !== 'play') return;
    state.secondsLeft = Math.max(0, (state.endAt - Date.now()) / 1000);
    refreshHud();
    if (state.secondsLeft <= 0) onTimeout();
  }, 100);
}

export function startScene(sceneId, opts = {}) {
  const scene = getScene(sceneId);
  const rng = opts.rng || Math.random;
  state.scene = scene;
  state.activeSpots = pickDifferences(scene, DIFFERENCES_PER_PLAY, rng);
  state.found = new Set();
  state.secondsLeft = TIME_LIMIT;
  state.hintsLeft = HINTS_PER_SCENE;
  state.mistakes = 0;
  state.hintId = null;
  state.miss = null;
  state.bursts = [];
  state.paused = false;
  state.frozen = !!opts.frozen;
  hideOverlay();
  showScreen('play');
  state.screen = 'play';
  setMessage(`Find ${DIFFERENCES_PER_PLAY} differences in ${scene.name} — click one on either picture!`, '');
  refreshHud();
  startTimer();
  drawOnce();
}

function drawOnce() {
  // One immediate paint so the frame is never blank before rAF runs.
  const fx = { now: () => performance.now(), hintId: null, hintUntil: 0, miss: null, missUntil: 0 };
  renderPanel(canvasA, state.scene, activeSet(), state.found, fx);
  renderPanel(canvasB, state.scene, activeSet(), state.found, fx);
}

function onTap(panel, x, y) {
  if (state.screen !== 'play' || state.frozen) return;
  const hit = findHit(x, y, state.activeSpots, state.found);
  if (hit) {
    state.found.add(hit.id);
    state.bursts.push({ x: hit.x, y: hit.y, at: performance.now() });
    sfx.found();
    const left = remaining();
    setMessage(left === 0 ? 'All found — brilliant!' : `Found it: ${hit.label}! ${left} still hiding.`, 'good');
    $('status').textContent = `Found ${hit.label}. ${left} differences remain.`;
    refreshHud();
    if (left === 0) onWin();
  } else {
    state.mistakes += 1;
    state.secondsLeft = Math.max(0, state.secondsLeft - WRONG_PENALTY);
    state.endAt = Date.now() + state.secondsLeft * 1000;
    state.miss = { x, y };
    state.missUntil = performance.now() + 600;
    sfx.miss();
    setMessage(`Not quite — ${WRONG_PENALTY} seconds lost. Look closer!`, 'bad');
    refreshHud();
    if (state.secondsLeft <= 0) onTimeout();
  }
}

function starsFor(secondsLeft, mistakes) {
  if (secondsLeft >= 60 && mistakes <= 1) return 3;
  if (secondsLeft >= 30 && mistakes <= 3) return 2;
  return 1;
}

function onWin() {
  clearInterval(timerId);
  state.screen = 'won';
  const stars = starsFor(Math.ceil(state.secondsLeft), state.mistakes);
  state.progress = recordWin(state.progress, state.scene.id, stars, Math.ceil(state.secondsLeft));
  sfx.win();
  const next = nextScene();
  showOverlay({
    title: `${state.scene.name} complete!`,
    stars,
    detail: `All ${DIFFERENCES_PER_PLAY} differences found in ${formatTime(TIME_LIMIT - Math.ceil(state.secondsLeft))} with ${state.mistakes} wrong click${state.mistakes === 1 ? '' : 's'}. ${starString(stars)}`,
    showNext: !!next,
  });
  $('status').textContent = `${state.scene.name} complete with ${stars} stars.`;
}

function onTimeout() {
  clearInterval(timerId);
  if (state.screen !== 'play') return;
  state.screen = 'timeout';
  sfx.timeout();
  showOverlay({
    title: 'Time ran out!',
    stars: 0,
    detail: `You found ${state.found.size} of ${DIFFERENCES_PER_PLAY} differences in ${state.scene.name}. The rest were: ${state.activeSpots.filter((s) => !state.found.has(s.id)).map((s) => s.label).join(', ')}.`,
    showNext: false,
  });
}

function nextScene() {
  const i = SCENES.findIndex((s) => s.id === state.scene.id);
  return SCENES[(i + 1) % SCENES.length];
}

function useHint() {
  if (state.screen !== 'play' || state.frozen) return;
  if (state.hintsLeft <= 0) { setMessage('No hints left — trust your eyes!', 'bad'); return; }
  const unfound = state.activeSpots.filter((s) => !state.found.has(s.id));
  if (!unfound.length) return;
  const spot = unfound[Math.floor(Math.random() * unfound.length)];
  state.hintsLeft -= 1;
  state.hintId = spot.id;
  state.hintUntil = performance.now() + 1500;
  sfx.hint();
  setMessage(`Hint: something changed near the ${spot.label.toLowerCase()}…`, '');
  refreshHud();
  setTimeout(() => { if (state.hintId === spot.id) state.hintId = null; }, 1600);
}

function goToLevels() {
  clearInterval(timerId);
  state.screen = 'select';
  state.paused = false;
  hideOverlay();
  showScreen('select');
  renderLevelGrid(SCENES, state.progress, (id) => startScene(id));
  document.title = 'Spot the Difference — Five Worlds';
}

function toggleMagnifier() {
  const on = !magnifier.isEnabled();
  magnifier.setEnabled(on);
  $('btn-magnifier').setAttribute('aria-pressed', String(on));
  $('btn-magnifier').textContent = on ? '🔎 Lens on' : '🔎 Lens';
}

attachPanelInput(canvasA, canvasB, onTap);
$('btn-hint').addEventListener('click', useHint);
$('btn-magnifier').addEventListener('click', toggleMagnifier);
$('btn-levels').addEventListener('click', goToLevels);
$('btn-next').addEventListener('click', () => startScene(nextScene().id));
$('btn-replay').addEventListener('click', () => startScene(state.scene.id));
$('btn-overlay-levels').addEventListener('click', goToLevels);
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') useHint();
  else if (e.key === 'm' || e.key === 'M') toggleMagnifier();
  else if (e.key === 'Escape') goToLevels();
});

/* ---------- deterministic staging for screenshots (?shot=...) ---------- */
function stageShot() {
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = Number(params.get('seed') || '7');
  const sceneId = params.get('scene') || 'taman';
  const rng = mulberry32(seed);
  if (shot === 'select') {
    // Pretend a returning player: a few worlds already starred.
    state.progress = {
      stars: { taman: 3, dapur: 2, pantai: 1 },
      bestTime: { taman: 58, dapur: 84, pantai: 96 },
      played: 3,
    };
    goToLevels();
    return true;
  }
  if (shot === 'win') {
    startScene(sceneId, { rng, frozen: true });
    for (const spot of state.activeSpots) state.found.add(spot.id);
    state.secondsLeft = 64;
    state.mistakes = 1;
    refreshHud();
    setMessage(`All ${DIFFERENCES_PER_PLAY} differences found — brilliant!`, 'good');
    drawOnce();
    const stars = 3;
    state.progress = recordWin(state.progress, state.scene.id, stars, 64);
    showOverlay({
      title: `${state.scene.name} complete!`,
      stars,
      detail: `All ${DIFFERENCES_PER_PLAY} differences found in ${formatTime(TIME_LIMIT - 64)} with 1 wrong click. ${starString(stars)}`,
      showNext: true,
    });
    return true;
  }
  // Mid-game states: 'cover' (3 found) and 'play2' (2 found, another scene).
  const foundCount = shot === 'cover' ? 3 : 2;
  startScene(sceneId, { rng, frozen: true });
  state.activeSpots.slice(0, foundCount).forEach((s) => state.found.add(s.id));
  state.secondsLeft = shot === 'cover' ? 92 : 74;
  refreshHud();
  setMessage(`${foundCount} differences found — ${remaining()} still hiding!`, 'good');
  drawOnce();
  return true;
}

if (!stageShot()) {
  goToLevels();
}
requestAnimationFrame(draw);

// Small handle for automated play-testing (Playwright): state + a tap API.
window.__spotdiff = {
  state,
  startScene,
  tap(panel, x, y) { onTap(panel, x, y); },
  useHint,
  goToLevels,
};
