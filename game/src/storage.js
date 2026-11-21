// storage.js — progress saved on this device: stars per scene, best times,
// and how many worlds are finished. Everything lives in localStorage so a
// reload keeps the player's stars.

const KEY = 'spot-the-difference-progress-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { stars: {}, bestTime: {}, played: 0 };
    const data = JSON.parse(raw);
    return {
      stars: data.stars || {},
      bestTime: data.bestTime || {},
      played: data.played || 0,
    };
  } catch {
    return { stars: {}, bestTime: {}, played: 0 };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Private mode or full storage: the game still plays, just unsaved.
  }
}

// Record a finished scene: keep the best star count and the fastest time.
export function recordWin(progress, sceneId, stars, secondsLeft) {
  const next = {
    stars: { ...progress.stars },
    bestTime: { ...progress.bestTime },
    played: (progress.played || 0) + 1,
  };
  next.stars[sceneId] = Math.max(next.stars[sceneId] || 0, stars);
  const total = 120; // scene time limit, seconds
  const took = total - secondsLeft;
  if (next.bestTime[sceneId] === undefined || took < next.bestTime[sceneId]) {
    next.bestTime[sceneId] = took;
  }
  saveProgress(next);
  return next;
}

export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
