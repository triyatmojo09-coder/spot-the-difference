// differences.js — picking which differences a play uses, and hit testing.
// Each scene defines more candidate spots than one play uses (9–10), so the
// hunt is different every time. Two spots that touch the same object (the
// little mushroom in Hutan) never appear together in one play.

export const DIFFERENCES_PER_PLAY = 6;

// Spot ids that describe the same object and must not be picked together.
const CONFLICTS = {
  'mushroom-count': ['mushroom-color'],
  'mushroom-color': ['mushroom-count'],
};

export function pickDifferences(scene, count, rng) {
  const pool = [...scene.spots];
  // Fisher–Yates shuffle with the caller's rng.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = [];
  const blocked = new Set();
  for (const spot of pool) {
    if (picked.length >= count) break;
    if (blocked.has(spot.id)) continue;
    picked.push(spot);
    for (const other of CONFLICTS[spot.id] || []) blocked.add(other);
  }
  return picked;
}

// Fair tolerance: a click lands if it is inside the spot's radius plus a
// generous margin, so near-misses on small objects still count.
export function findHit(x, y, activeSpots, foundIds) {
  let best = null;
  let bestDist = Infinity;
  for (const spot of activeSpots) {
    if (foundIds.has(spot.id)) continue;
    const dx = x - spot.x;
    const dy = y - spot.y;
    const dist = Math.hypot(dx, dy);
    const reach = spot.r + 16;
    if (dist <= reach && dist < bestDist) { best = spot; bestDist = dist; }
  }
  return best;
}

export function spotById(scene, id) {
  return scene.spots.find((s) => s.id === id);
}
