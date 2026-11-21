// shots.mjs — play-tests the game in headless Chromium and captures the
// 4 screenshots listed in shots.json. Run from the repo root:
//   node shots.mjs
// Serves game/ on localhost, opens each ?shot= URL at 1280x800, checks for
// console errors and failed network requests, and saves JPEGs to screenshots/.

import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { createReadStream, statSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('.', import.meta.url));
const gameRoot = resolve(repo, 'game');
const shots = JSON.parse(readFileSync(join(repo, 'shots.json'), 'utf8'));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(gameRoot, normalize(pathname)));
  if (file !== gameRoot && !file.startsWith(gameRoot + sep)) { res.writeHead(403).end(); return; }
  try {
    const size = statSync(file).size;
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream', 'content-length': size });
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
const failedRequests = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => failedRequests.push(r.url()));
page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1')) failedRequests.push('external: ' + r.url()); });

// ---- Play-test: start a scene, click a real difference, finish it ----
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.evaluate(() => window.__spotdiff.startScene('taman'));
await page.waitForTimeout(400);
const play = await page.evaluate(() => {
  const st = window.__spotdiff.state;
  const spot = st.activeSpots[0];
  const before = st.found.size;
  window.__spotdiff.tap('b', spot.x, spot.y);
  const after = st.found.size;
  const remaining = document.getElementById('hud-remaining').textContent;
  return { spot: spot.label, before, after, remaining, active: st.activeSpots.map((s) => s.id) };
});
console.log('PLAY-TEST click:', JSON.stringify(play));
// Wrong click: penalty applies.
const wrong = await page.evaluate(() => {
  const st = window.__spotdiff.state;
  const t0 = st.secondsLeft;
  window.__spotdiff.tap('a', 5, 5); // empty corner of the sky
  return { before: t0, after: st.secondsLeft, mistakes: st.mistakes };
});
console.log('PLAY-TEST wrong click:', JSON.stringify(wrong));
// Finish the scene by clicking every remaining difference.
const finish = await page.evaluate(() => {
  const st = window.__spotdiff.state;
  for (const s of st.activeSpots) window.__spotdiff.tap('a', s.x, s.y);
  return {
    found: st.found.size, total: st.activeSpots.length,
    screen: st.screen, overlayVisible: !document.getElementById('overlay').classList.contains('hidden'),
    overlayTitle: document.getElementById('overlay-title').textContent,
    stars: document.getElementById('overlay-stars').textContent,
    saved: JSON.parse(localStorage.getItem('spot-the-difference-progress-v1') || '{}'),
  };
});
console.log('PLAY-TEST finish:', JSON.stringify(finish));
// Hint + magnifier smoke test.
await page.evaluate(() => { window.__spotdiff.startScene('pantai'); window.__spotdiff.useHint(); });
await page.waitForTimeout(300);
const hint = await page.evaluate(() => ({ hintsLeft: window.__spotdiff.state.hintsLeft, hintId: window.__spotdiff.state.hintId }));
console.log('PLAY-TEST hint:', JSON.stringify(hint));

// ---- Screenshots ----
mkdirSync(join(repo, 'screenshots'), { recursive: true });
for (const shot of shots) {
  await page.goto(`http://127.0.0.1:${port}/index.html${shot.query}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const buf = await page.screenshot({ type: 'jpeg', quality: 82 });
  const path = join(repo, 'screenshots', shot.name);
  writeFileSync(path, buf);
  console.log(`SHOT ${shot.name}: ${buf.length} bytes`);
}

console.log('CONSOLE ERRORS:', JSON.stringify(errors));
console.log('FAILED/EXTERNAL REQUESTS:', JSON.stringify(failedRequests));
await browser.close();
server.close();
if (errors.length || failedRequests.length) process.exitCode = 2;
