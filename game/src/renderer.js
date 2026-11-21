// renderer.js — paints one scene onto a canvas and draws the markers.
// Panel A is always the untouched scene; panel B applies the active
// differences. Found differences get a gold ring on BOTH panels.

import { PANEL_W, PANEL_H } from './scenes.js';

export function renderPanel(canvas, scene, activeIds, foundIds, fx) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  const isMutated = canvas.dataset.panel === 'b';
  const mut = (id) => isMutated && activeIds.has(id);
  scene.draw(ctx, mut);
  drawRings(ctx, scene, activeIds, foundIds, fx);
}

function drawRings(ctx, scene, activeIds, foundIds, fx) {
  const now = fx && fx.now ? fx.now() : 0;
  for (const spot of scene.spots) {
    if (!activeIds.has(spot.id)) continue;
    if (foundIds.has(spot.id)) {
      // Satisfying gold ring, gently pulsing, with a check mark.
      const pulse = 1 + 0.06 * Math.sin(now / 260);
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd43b';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r * pulse + 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,212,59,0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e8590c';
      ctx.fillText('✓', spot.x, spot.y - spot.r - 12);
    } else if (fx && fx.hintId === spot.id && fx.hintUntil > now) {
      // Hint: a soft pulsing circle that fades as the hint expires.
      const remain = (fx.hintUntil - now) / 1500;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r + 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(25,113,194,${0.35 + 0.55 * remain})`;
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  // Wrong-click flash: a red X that fades quickly.
  if (fx && fx.miss && fx.missUntil > now) {
    const a = (fx.missUntil - now) / 600;
    ctx.strokeStyle = `rgba(201,42,42,${a})`;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const { x, y } = fx.miss;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
  }
}

// Draw a one-off "found" burst (expanding ring) on both panels.
export function burst(ctx, x, y, progress) {
  const r = 10 + progress * 46;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255,212,59,${1 - progress})`;
  ctx.lineWidth = 5 * (1 - progress) + 1;
  ctx.stroke();
}
