// input.js — pointer clicks on the two panels and the magnifier lens.
// Click coordinates are converted from the page into the canvas's own
// 560x400 space, so the lens and the hit test agree with what is drawn.

import { PANEL_W, PANEL_H } from './scenes.js';

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = PANEL_W / rect.width;
  const scaleY = PANEL_H / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

// Wire both panels to one tap handler: (panel, x, y, event).
export function attachPanelInput(canvasA, canvasB, onTap) {
  for (const canvas of [canvasA, canvasB]) {
    canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const { x, y } = canvasPoint(canvas, event);
      onTap(canvas.dataset.panel, x, y, event);
    });
  }
}

// The magnifier: a round lens that follows the pointer over a panel and
// shows that patch of the picture at 2x zoom.
export function createMagnifier(lensCanvas, getSourceCanvas) {
  const lensCtx = lensCanvas.getContext('2d');
  const SIZE = 180;
  const ZOOM = 2;
  let enabled = false;
  let currentCanvas = null;

  function hide() { lensCanvas.classList.add('hidden'); }
  function move(event) {
    if (!enabled || !currentCanvas) return;
    const rect = currentCanvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) * (PANEL_W / rect.width);
    const py = (event.clientY - rect.top) * (PANEL_H / rect.height);
    const srcSize = SIZE / ZOOM;
    let sx = px - srcSize / 2;
    let sy = py - srcSize / 2;
    sx = Math.max(0, Math.min(PANEL_W - srcSize, sx));
    sy = Math.max(0, Math.min(PANEL_H - srcSize, sy));
    lensCtx.clearRect(0, 0, SIZE, SIZE);
    lensCtx.save();
    lensCtx.beginPath();
    lensCtx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    lensCtx.clip();
    lensCtx.imageSmoothingEnabled = false;
    lensCtx.drawImage(currentCanvas, sx, sy, srcSize, srcSize, 0, 0, SIZE, SIZE);
    lensCtx.restore();
    lensCanvas.style.left = `${event.clientX - SIZE / 2}px`;
    lensCanvas.style.top = `${event.clientY - SIZE / 2}px`;
    lensCanvas.classList.remove('hidden');
  }
  function track(canvas) {
    currentCanvas = canvas;
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', hide);
  }
  return {
    setEnabled(value) {
      enabled = value;
      if (!value) hide();
    },
    isEnabled() { return enabled; },
    track,
    hide,
  };
}
