// hud.js — everything drawn in the DOM around the two pictures: the top
// bar (scene, remaining counter, timer, hints), the level-select grid, the
// found-difference chips, and the win / time-out overlay.

import { formatTime } from './storage.js';

const $ = (id) => document.getElementById(id);

export function starString(n) {
  let out = '';
  for (let i = 0; i < 3; i++) out += i < n ? '★' : '☆';
  return out;
}

export function renderLevelGrid(scenes, progress, onPick) {
  const grid = $('level-grid');
  grid.innerHTML = '';
  for (const scene of scenes) {
    const stars = progress.stars[scene.id] || 0;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'level-card';
    card.innerHTML = `
      <div class="thumb" style="background:${scene.theme}">${scene.name}</div>
      <div class="meta">
        <div class="name">${scene.name}</div>
        <div class="desc">${scene.desc}</div>
        <div class="stars" aria-label="${stars} of 3 stars">${starString(stars).split('').map((c) => `<span class="${c === '☆' ? 'empty' : ''}">${c}</span>`).join('')}</div>
        <div class="best">${progress.bestTime[scene.id] !== undefined ? `Best: ${formatTime(progress.bestTime[scene.id])}` : 'Not finished yet'}</div>
      </div>`;
    card.addEventListener('click', () => onPick(scene.id));
    grid.appendChild(card);
  }
  const done = scenes.filter((s) => progress.stars[s.id]).length;
  $('progress-summary').textContent = `${done} of ${scenes.length} worlds finished · ${Object.values(progress.stars).reduce((a, b) => a + b, 0)} ★ earned`;
}

export function updateHud({ scene, remaining, total, secondsLeft, hintsLeft }) {
  $('hud-scene').textContent = scene.name;
  $('hud-remaining').textContent = remaining;
  $('hud-timer').textContent = formatTime(Math.max(0, secondsLeft));
  $('pill-timer').classList.toggle('low', secondsLeft <= 20);
  $('hud-hints').textContent = hintsLeft;
  $('btn-hint').disabled = hintsLeft <= 0 || remaining <= 0;
  document.title = `${remaining} left — ${scene.name} · Spot the Difference`;
}

export function setMessage(text, kind) {
  const el = $('message');
  el.textContent = text;
  el.className = kind || '';
}

export function renderFoundChips(activeSpots, foundIds) {
  const strip = $('found-strip');
  strip.innerHTML = '';
  for (const spot of activeSpots) {
    if (!foundIds.has(spot.id)) continue;
    const chip = document.createElement('span');
    chip.className = 'found-chip';
    chip.textContent = `✓ ${spot.label}`;
    strip.appendChild(chip);
  }
}

export function showScreen(name) {
  $('screen-select').classList.toggle('hidden', name !== 'select');
  $('screen-play').classList.toggle('hidden', name !== 'play');
  $('hud').classList.toggle('hidden', name !== 'play');
}

export function showOverlay({ title, stars, detail, showNext }) {
  $('overlay-title').textContent = title;
  $('overlay-stars').innerHTML = starString(stars).split('').map((c) => `<span class="${c === '☆' ? 'empty' : ''}">${c}</span>`).join('');
  $('overlay-detail').textContent = detail;
  $('btn-next').classList.toggle('hidden', !showNext);
  $('overlay').classList.remove('hidden');
}

export function hideOverlay() {
  $('overlay').classList.add('hidden');
}
