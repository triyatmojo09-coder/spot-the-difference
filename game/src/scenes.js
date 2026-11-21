// scenes.js — the five original worlds of Spot the Difference.
// Every scene is drawn in code from one description: draw(ctx, mut) paints the
// whole picture, and mut(id) tells whether difference `id` is switched on for
// this panel, so both panels are pixel-consistent except at the differences.
// Each scene lists more candidate spots than one play uses; the game picks 6.

export const PANEL_W = 560;
export const PANEL_H = 400;

/* ---------- tiny drawing helpers (local to this file) ---------- */
function circle(ctx, x, y, r, fill, stroke, lw) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function ellipse(ctx, x, y, rx, ry, fill, stroke, lw) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function rect(ctx, x, y, w, h, fill, stroke, lw) {
  ctx.beginPath(); ctx.rect(x, y, w, h);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function poly(ctx, pts, fill, stroke, lw) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 2; ctx.stroke(); }
}
function line(ctx, x1, y1, x2, y2, color, w) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; ctx.stroke();
}
function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, top); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}
function cloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  circle(ctx, x, y, 18 * s, 'rgba(255,255,255,0.92)');
  circle(ctx, x + 20 * s, y - 6 * s, 14 * s, 'rgba(255,255,255,0.92)');
  circle(ctx, x + 40 * s, y, 17 * s, 'rgba(255,255,255,0.92)');
  ellipse(ctx, x + 20 * s, y + 8 * s, 34 * s, 11 * s, 'rgba(255,255,255,0.92)');
}
function flower(ctx, x, y, petal, center) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, petal);
  }
  circle(ctx, x, y, 4.5, center);
  line(ctx, x, y + 8, x, y + 22, '#2b8a3e', 3);
}

/* ================= Scene 1 — Taman Pagi (Morning Garden) ================= */
function drawTaman(ctx, mut) {
  sky(ctx, '#8ec9ee', '#dff3e3');
  // sun (top-left)
  circle(ctx, 64, 62, 30, '#ffd43b', '#f59f00', 3);
  if (!mut('sun-rays')) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 64 + Math.cos(a) * 38, 62 + Math.sin(a) * 38, 64 + Math.cos(a) * 50, 62 + Math.sin(a) * 50, '#f59f00', 4);
    }
  }
  if (!mut('cloud-two')) cloud(ctx, 380, 46, 1);
  cloud(ctx, 210, 58, 0.8);
  // hills + grass
  ellipse(ctx, 280, 470, 360, 130, '#7ec850');
  ellipse(ctx, 90, 450, 220, 100, '#6db844');
  // fence across the middle
  ctx.fillStyle = '#b08954';
  ctx.fillRect(0, 252, PANEL_W, 8);
  for (let x = 20; x < PANEL_W; x += 56) {
    rect(ctx, x, 232, 10, 44, '#c9a06a', '#8a6a3b', 1.5);
    poly(ctx, [[x - 2, 232], [x + 5, 220], [x + 12, 232]], '#c9a06a');
  }
  if (mut('fence-post')) { rect(ctx, 508, 232, 10, 44, '#c9a06a', '#8a6a3b', 1.5); poly(ctx, [[506, 232], [513, 220], [520, 232]], '#c9a06a'); }
  // tree (left)
  rect(ctx, 128, 190, 22, 78, '#8a5a2b');
  circle(ctx, 139, 150, 52, '#3d9b4f');
  circle(ctx, 100, 172, 34, '#4cb361');
  circle(ctx, 180, 172, 34, '#4cb361');
  // apples on the tree
  circle(ctx, 118, 158, 7, '#e03131');
  circle(ctx, 162, 142, 7, '#e03131');
  if (!mut('apple-count')) circle(ctx, 140, 178, 7, '#e03131');
  // bench (right)
  rect(ctx, 408, 300, 96, 10, '#a5662f', '#7a4a1d', 2);
  rect(ctx, 408, 318, 96, 8, '#a5662f', '#7a4a1d', 2);
  if (!mut('bench-slat')) rect(ctx, 408, 282, 96, 8, '#a5662f', '#7a4a1d', 2);
  line(ctx, 418, 310, 418, 348, '#6b4423', 6);
  line(ctx, 494, 310, 494, 348, '#6b4423', 6);
  // bird in the sky
  if (!mut('bird')) {
    line(ctx, 448, 96, 458, 88, '#333', 2.5); line(ctx, 458, 88, 468, 96, '#333', 2.5);
    line(ctx, 478, 104, 488, 96, '#333', 2.5); line(ctx, 488, 96, 498, 104, '#333', 2.5);
  }
  // butterfly
  if (!mut('butterfly')) {
    const bx = 330, by = 128;
    ellipse(ctx, bx - 8, by - 4, 9, 6, '#9775fa');
    ellipse(ctx, bx + 8, by - 4, 9, 6, '#9775fa');
    ellipse(ctx, bx - 7, by + 7, 7, 5, '#b197fc');
    ellipse(ctx, bx + 7, by + 7, 7, 5, '#b197fc');
    line(ctx, bx, by - 8, bx, by + 10, '#333', 2);
  }
  // flower bed (bottom)
  flower(ctx, 60, 356, mut('flower-color') ? '#ffd43b' : '#e64980', '#f59f00');
  flower(ctx, 110, 368, '#e64980', '#f59f00');
  flower(ctx, 170, 356, '#748ffc', '#ffd43b');
  flower(ctx, 230, 368, '#e64980', '#f59f00');
  flower(ctx, 300, 358, '#ff922b', '#f59f00');
  // watering can
  if (!mut('watering-can')) {
    rect(ctx, 330, 330, 34, 26, '#4dabf7', '#1971c2', 2);
    poly(ctx, [[364, 336], [384, 326], [384, 336], [364, 344]], '#4dabf7');
    line(ctx, 330, 336, 318, 328, '#1971c2', 4);
  }
  // snail on the grass
  circle(ctx, 250, 386, 10, '#9775fa');
  circle(ctx, 258, 380, 5, '#7048e8');
  line(ctx, 240, 392, 244, 384, '#5f3dc4', 2);
}

const TAMAN = {
  id: 'taman', name: 'Taman Pagi', desc: 'A sunny garden with a tree, bench and flower bed.',
  theme: 'linear-gradient(135deg,#8ec9ee,#7ec850)', accent: '#2b8a3e',
  spots: [
    { id: 'sun-rays', x: 64, y: 62, r: 42, label: 'Sun rays' },
    { id: 'cloud-two', x: 400, y: 46, r: 34, label: 'Cloud' },
    { id: 'apple-count', x: 140, y: 178, r: 22, label: 'Apple on the tree' },
    { id: 'butterfly', x: 330, y: 128, r: 26, label: 'Butterfly' },
    { id: 'bird', x: 472, y: 96, r: 26, label: 'Birds in the sky' },
    { id: 'bench-slat', x: 456, y: 286, r: 24, label: 'Bench slat' },
    { id: 'flower-color', x: 60, y: 356, r: 22, label: 'Flower colour' },
    { id: 'watering-can', x: 350, y: 340, r: 30, label: 'Watering can' },
    { id: 'fence-post', x: 513, y: 240, r: 24, label: 'Fence post' },
  ],
  draw: drawTaman,
};

/* ================= Scene 2 — Dapur Koki (Chef's Kitchen) ================= */
function drawDapur(ctx, mut) {
  sky(ctx, '#ffe8cc', '#fff4e0');
  // tiled wall band
  rect(ctx, 0, 0, PANEL_W, 150, '#ffe8cc');
  ctx.strokeStyle = 'rgba(190,140,80,.35)'; ctx.lineWidth = 1;
  for (let x = 0; x <= PANEL_W; x += 40) { line(ctx, x, 0, x, 150, 'rgba(190,140,80,.35)', 1); }
  for (let y = 0; y <= 150; y += 30) { line(ctx, 0, y, PANEL_W, y, 'rgba(190,140,80,.35)', 1); }
  // window with curtains
  rect(ctx, 200, 30, 160, 110, '#a5d8ff', '#8a5a2b', 4);
  line(ctx, 280, 30, 280, 140, '#8a5a2b', 4);
  line(ctx, 200, 85, 360, 85, '#8a5a2b', 4);
  circle(ctx, 240, 58, 14, '#ffd43b');
  if (!mut('curtain')) {
    poly(ctx, [[200, 30], [232, 30], [222, 140], [200, 140]], '#e64980');
    poly(ctx, [[360, 30], [328, 30], [338, 140], [360, 140]], '#e64980');
  } else {
    poly(ctx, [[200, 30], [280, 30], [280, 140], [200, 140]], '#e64980');
  }
  // cat on the windowsill
  if (!mut('cat')) {
    ellipse(ctx, 320, 132, 26, 14, '#f08c00');
    circle(ctx, 344, 122, 11, '#f08c00');
    poly(ctx, [[338, 114], [340, 104], [346, 112]], '#f08c00');
    poly(ctx, [[348, 112], [354, 104], [354, 114]], '#f08c00');
    line(ctx, 296, 128, 282, 116, '#f08c00', 4);
  }
  // wall clock
  circle(ctx, 92, 70, 30, '#fff', '#333', 3);
  line(ctx, 92, 70, 92, 50, '#333', 3);
  if (!mut('clock-hands')) line(ctx, 92, 70, 110, 70, '#333', 3);
  else line(ctx, 92, 70, 78, 84, '#333', 3);
  // shelf with jars
  rect(ctx, 400, 60, 130, 10, '#8a5a2b');
  rect(ctx, 410, 30, 22, 30, '#b2d8b2', '#5c7a5c', 2);
  rect(ctx, 442, 30, 22, 30, '#f3c969', '#8a6a3b', 2);
  if (!mut('jar-label')) rect(ctx, 444, 42, 18, 12, '#fff', '#8a6a3b', 1);
  rect(ctx, 474, 30, 22, 30, '#f3a6b8', '#8a5a5c', 2);
  // hanging pans
  line(ctx, 70, 0, 70, 26, '#666', 3); circle(ctx, 70, 52, 22, '#495057', '#212529', 2);
  line(ctx, 120, 0, 120, 26, '#666', 3); circle(ctx, 120, 52, 22, '#868e96', '#212529', 2);
  if (!mut('pan-count')) { line(ctx, 170, 0, 170, 26, '#666', 3); circle(ctx, 170, 52, 22, '#495057', '#212529', 2); }
  // counter + stove
  rect(ctx, 0, 300, PANEL_W, 100, '#c98f5f');
  rect(ctx, 0, 300, PANEL_W, 10, '#a5662f');
  rect(ctx, 60, 250, 150, 52, '#343a40');
  ellipse(ctx, 110, 246, 34, 10, '#868e96');
  ellipse(ctx, 170, 246, 34, 10, '#868e96');
  // pot on the stove with steam
  ellipse(ctx, 135, 228, 46, 20, '#dee2e6', '#495057', 2);
  rect(ctx, 92, 200, 86, 30, '#adb5bd', '#495057', 2);
  if (!mut('pot-lid')) {
    ellipse(ctx, 135, 200, 44, 8, '#868e96', '#495057', 2);
    line(ctx, 120, 180, 126, 168, 'rgba(120,120,120,.7)', 3);
    line(ctx, 140, 176, 146, 162, 'rgba(120,120,120,.7)', 3);
  }
  // fruit bowl
  ellipse(ctx, 330, 292, 52, 14, '#e8590c');
  circle(ctx, 306, 276, 12, '#e03131');
  circle(ctx, 330, 270, 12, '#f59f00');
  circle(ctx, 354, 276, 12, '#e03131');
  if (!mut('fruit-count')) circle(ctx, 330, 252, 12, '#2b8a3e');
  // teapot
  ellipse(ctx, 460, 292, 40, 12, mut('teapot-color') ? '#1971c2' : '#c2255c');
  circle(ctx, 460, 272, 22, mut('teapot-color') ? '#1971c2' : '#c2255c');
  rect(ctx, 452, 246, 16, 10, mut('teapot-color') ? '#1971c2' : '#c2255c');
  poly(ctx, [[438, 268], [424, 258], [424, 272], [438, 278]], mut('teapot-color') ? '#1971c2' : '#c2255c');
  // rug
  if (!mut('rug-stripes')) {
    rect(ctx, 210, 350, 150, 34, '#9775fa');
    rect(ctx, 210, 350, 150, 8, '#e64980');
    rect(ctx, 210, 376, 150, 8, '#e64980');
  } else {
    rect(ctx, 210, 350, 150, 34, '#9775fa');
  }
}

const DAPUR = {
  id: 'dapur', name: 'Dapur Koki', desc: 'A cosy kitchen: stove, window cat and fruit bowl.',
  theme: 'linear-gradient(135deg,#ffe8cc,#f3c969)', accent: '#e8590c',
  spots: [
    { id: 'clock-hands', x: 92, y: 70, r: 34, label: 'Clock hands' },
    { id: 'cat', x: 322, y: 126, r: 30, label: 'Cat on the sill' },
    { id: 'curtain', x: 240, y: 85, r: 30, label: 'Window curtain' },
    { id: 'pan-count', x: 170, y: 52, r: 26, label: 'Hanging pan' },
    { id: 'pot-lid', x: 135, y: 200, r: 30, label: 'Pot lid and steam' },
    { id: 'fruit-count', x: 330, y: 252, r: 22, label: 'Fruit in the bowl' },
    { id: 'teapot-color', x: 460, y: 272, r: 28, label: 'Teapot colour' },
    { id: 'jar-label', x: 453, y: 48, r: 20, label: 'Jar label' },
    { id: 'rug-stripes', x: 285, y: 367, r: 30, label: 'Rug stripes' },
  ],
  draw: drawDapur,
};

/* ================= Scene 3 — Pantai Senja (Sunset Beach) ================= */
function drawPantai(ctx, mut) {
  sky(ctx, '#ff9a5a', '#ffe066');
  circle(ctx, 280, 150, 44, '#fff3bf', '#f59f00', 3);
  // sea
  rect(ctx, 0, 190, PANEL_W, 70, '#4dabf7');
  ctx.fillStyle = 'rgba(255,255,255,.5)';
  ellipse(ctx, 120, 210, 60, 6, 'rgba(255,255,255,.5)');
  ellipse(ctx, 380, 230, 70, 6, 'rgba(255,255,255,.5)');
  ellipse(ctx, 260, 246, 50, 5, 'rgba(255,255,255,.5)');
  // boat on the horizon
  if (!mut('boat')) {
    poly(ctx, [[430, 196], [500, 196], [488, 210], [442, 210]], '#8a5a2b');
    line(ctx, 466, 196, 466, 168, '#5c3a1a', 3);
    poly(ctx, [[466, 168], [466, 194], [492, 194]], '#fff');
  }
  // sand
  ellipse(ctx, 280, 470, 380, 120, '#f9e2a8');
  // palm tree
  line(ctx, 92, 260, 78, 150, '#8a5a2b', 12);
  const palm = '#2b8a3e';
  ellipse(ctx, 52, 138, 34, 10, palm); ellipse(ctx, 104, 138, 34, 10, palm);
  ellipse(ctx, 66, 118, 10, 30, palm); ellipse(ctx, 92, 116, 10, 30, palm);
  circle(ctx, 70, 152, 7, '#8a5a2b'); circle(ctx, 86, 154, 7, '#8a5a2b');
  if (!mut('coconuts')) circle(ctx, 78, 160, 7, '#8a5a2b');
  // beach umbrella
  line(ctx, 400, 250, 400, 330, '#8a5a2b', 5);
  const umb = mut('umbrella-stripe') ? '#1971c2' : '#e03131';
  poly(ctx, [[330, 252], [400, 196], [470, 252]], umb);
  poly(ctx, [[365, 252], [400, 196], [400, 252]], '#fff');
  poly(ctx, [[400, 252], [400, 196], [435, 252]], '#fff');
  // beach ball
  circle(ctx, 470, 330, 22, '#fff', '#e03131', 2);
  poly(ctx, [[470, 308], [486, 344], [454, 344]], mut('ball-stripe') ? '#1971c2' : '#e03131');
  // bucket and spade
  if (!mut('bucket')) {
    poly(ctx, [[180, 330], [214, 330], [208, 360], [186, 360]], '#e8590c');
    line(ctx, 214, 322, 236, 300, '#1971c2', 5);
    poly(ctx, [[236, 300], [248, 292], [242, 306]], '#1971c2');
  }
  // starfish
  function starfish(x, y, s, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
      const a2 = a + Math.PI / 5;
      ctx.lineTo(x + Math.cos(a) * 14 * s, y + Math.sin(a) * 14 * s);
      ctx.lineTo(x + Math.cos(a2) * 6 * s, y + Math.sin(a2) * 6 * s);
    }
    ctx.closePath(); ctx.fill();
  }
  starfish(300, 356, 1, '#ff922b');
  if (!mut('starfish-count')) starfish(340, 372, 0.7, '#ff922b');
  // crab
  if (!mut('crab')) {
    ellipse(ctx, 150, 372, 16, 10, '#e03131');
    circle(ctx, 140, 360, 4, '#e03131'); circle(ctx, 160, 360, 4, '#e03131');
    line(ctx, 134, 372, 122, 366, '#e03131', 3); line(ctx, 166, 372, 178, 366, '#e03131', 3);
    line(ctx, 136, 378, 124, 382, '#e03131', 3); line(ctx, 164, 378, 176, 382, '#e03131', 3);
  }
  // sunglasses
  if (!mut('sunglasses')) {
    circle(ctx, 250, 318, 10, '#212529'); circle(ctx, 276, 318, 10, '#212529');
    line(ctx, 260, 318, 266, 318, '#212529', 3);
    line(ctx, 240, 318, 232, 312, '#212529', 3); line(ctx, 286, 318, 294, 312, '#212529', 3);
  }
  // footprints
  if (!mut('footprints')) {
    for (let i = 0; i < 4; i++) {
      ellipse(ctx, 90 + i * 26, 300 - i * 6, 7, 4, 'rgba(160,120,60,.55)');
    }
  }
}

const PANTAI = {
  id: 'pantai', name: 'Pantai Senja', desc: 'A sunset beach: palm, umbrella, crab and boat.',
  theme: 'linear-gradient(135deg,#ff9a5a,#4dabf7)', accent: '#e8590c',
  spots: [
    { id: 'boat', x: 466, y: 190, r: 30, label: 'Boat on the sea' },
    { id: 'coconuts', x: 78, y: 160, r: 22, label: 'Coconut on the palm' },
    { id: 'umbrella-stripe', x: 400, y: 224, r: 34, label: 'Umbrella stripe' },
    { id: 'crab', x: 150, y: 372, r: 28, label: 'Crab on the sand' },
    { id: 'starfish-count', x: 340, y: 372, r: 22, label: 'Starfish' },
    { id: 'ball-stripe', x: 470, y: 330, r: 26, label: 'Beach ball stripe' },
    { id: 'bucket', x: 210, y: 336, r: 30, label: 'Bucket and spade' },
    { id: 'sunglasses', x: 263, y: 318, r: 26, label: 'Sunglasses' },
    { id: 'footprints', x: 130, y: 288, r: 28, label: 'Footprints' },
  ],
  draw: drawPantai,
};

/* ================= Scene 4 — Hutan Rimbun (Deep Forest) ================= */
function drawHutan(ctx, mut) {
  sky(ctx, '#2f6b3a', '#a9d18e');
  // sunbeams
  ctx.fillStyle = 'rgba(255,244,180,.28)';
  poly(ctx, [[120, 0], [180, 0], [260, 400], [180, 400]], 'rgba(255,244,180,.28)');
  if (!mut('sunbeam')) poly(ctx, [[380, 0], [420, 0], [480, 400], [420, 400]], 'rgba(255,244,180,.28)');
  // back pines
  function pine(x, y, s, color) {
    poly(ctx, [[x, y - 90 * s], [x - 34 * s, y], [x + 34 * s, y]], color);
    poly(ctx, [[x, y - 120 * s], [x - 26 * s, y - 34 * s], [x + 26 * s, y - 34 * s]], color);
    rect(ctx, x - 5 * s, y, 10 * s, 18 * s, '#6b4423');
  }
  pine(60, 260, 1.1, '#1f5c2e');
  pine(510, 250, 1.0, '#1f5c2e');
  if (!mut('pine-count')) pine(470, 270, 0.8, '#2b7a3d');
  // forest floor
  ellipse(ctx, 280, 460, 380, 110, '#4c9a4c');
  // big branch tree (left)
  rect(ctx, 150, 150, 26, 130, '#6b4423');
  line(ctx, 163, 190, 120, 150, '#6b4423', 10);
  line(ctx, 163, 170, 210, 130, '#6b4423', 10);
  circle(ctx, 120, 140, 40, '#2b7a3d'); circle(ctx, 210, 120, 44, '#2b7a3d'); circle(ctx, 163, 96, 46, '#357f45');
  // owl on the branch
  if (!mut('owl')) {
    ellipse(ctx, 196, 118, 16, 20, '#8a6a3b');
    circle(ctx, 190, 108, 6, '#fff'); circle(ctx, 202, 108, 6, '#fff');
    circle(ctx, 190, 108, 3, '#212529'); circle(ctx, 202, 108, 3, '#212529');
    poly(ctx, [[196, 116], [192, 122], [200, 122]], '#f59f00');
  }
  // bird nest
  if (!mut('nest')) {
    ellipse(ctx, 118, 148, 20, 8, '#8a5a2b');
    circle(ctx, 112, 142, 5, '#dee2e6'); circle(ctx, 122, 142, 5, '#dee2e6');
  }
  // stream (right)
  poly(ctx, [[330, 400], [370, 300], [420, 300], [470, 400]], '#74c0fc');
  poly(ctx, [[370, 300], [400, 250], [440, 250], [420, 300]], '#74c0fc');
  // rock in the stream
  if (!mut('stream-rock')) ellipse(ctx, 400, 330, 22, 12, '#868e96');
  // mushrooms
  function mushroom(x, y, s, cap) {
    rect(ctx, x - 4 * s, y - 12 * s, 8 * s, 12 * s, '#fff8e1');
    poly(ctx, [[x - 16 * s, y - 10 * s], [x, y - 28 * s], [x + 16 * s, y - 10 * s]], cap);
    circle(ctx, x - 6 * s, y - 18 * s, 2.5, '#fff');
    circle(ctx, x + 5 * s, y - 15 * s, 2.5, '#fff');
  }
  mushroom(250, 372, 1, '#e03131');
  mushroom(282, 378, 0.8, '#e03131');
  if (!mut('mushroom-count')) mushroom(222, 380, 0.7, mut('mushroom-color') ? '#1971c2' : '#e03131');
  // rabbit
  if (!mut('rabbit')) {
    ellipse(ctx, 90, 360, 20, 14, '#e9ecef');
    circle(ctx, 108, 350, 11, '#e9ecef');
    ellipse(ctx, 104, 332, 4, 12, '#e9ecef'); ellipse(ctx, 112, 332, 4, 12, '#e9ecef');
    circle(ctx, 116, 348, 2, '#212529');
  }
  // flowers
  flower(ctx, 320, 372, mut('flower-color') ? '#ffd43b' : '#e64980', '#f59f00');
  flower(ctx, 350, 382, '#748ffc', '#ffd43b');
  // fireflies
  const flies = mut('firefly-count') ? [[200, 90], [300, 70], [420, 110]] : [[200, 90], [300, 70], [420, 110], [480, 80], [250, 130]];
  for (const [fx, fy] of flies) { circle(ctx, fx, fy, 3.5, '#fff3bf'); circle(ctx, fx, fy, 7, 'rgba(255,243,191,.35)'); }
}

const HUTAN = {
  id: 'hutan', name: 'Hutan Rimbun', desc: 'A deep forest: owl, mushrooms, stream and fireflies.',
  theme: 'linear-gradient(135deg,#2f6b3a,#a9d18e)', accent: '#2b8a3e',
  spots: [
    { id: 'owl', x: 196, y: 112, r: 26, label: 'Owl on the branch' },
    { id: 'nest', x: 118, y: 144, r: 24, label: 'Bird nest' },
    { id: 'mushroom-count', x: 222, y: 372, r: 22, label: 'Little mushroom' },
    { id: 'mushroom-color', x: 222, y: 372, r: 22, label: 'Mushroom cap colour' },
    { id: 'firefly-count', x: 480, y: 80, r: 24, label: 'Fireflies' },
    { id: 'rabbit', x: 96, y: 352, r: 26, label: 'Rabbit in the grass' },
    { id: 'stream-rock', x: 400, y: 330, r: 26, label: 'Rock in the stream' },
    { id: 'flower-color', x: 320, y: 372, r: 20, label: 'Flower colour' },
    { id: 'pine-count', x: 470, y: 220, r: 30, label: 'Pine tree' },
    { id: 'sunbeam', x: 440, y: 200, r: 30, label: 'Sunbeam' },
  ],
  draw: drawHutan,
};

/* ================= Scene 5 — Pasar Malam (Night Market) ================= */
function drawPasar(ctx, mut) {
  sky(ctx, '#1b2a4a', '#3b2d5c');
  // stars
  const stars = [[60, 40], [150, 70], [260, 36], [360, 60], [470, 44], [520, 90], [40, 120], [200, 110]];
  for (const [sx, sy] of stars) circle(ctx, sx, sy, 2.5, '#fff');
  if (!mut('star-count')) { circle(ctx, 300, 90, 2.5, '#fff'); circle(ctx, 430, 120, 2.5, '#fff'); }
  // moon
  if (!mut('moon')) {
    circle(ctx, 500, 60, 26, '#fff3bf', '#f59f00', 2);
    circle(ctx, 492, 54, 5, '#f1d27a'); circle(ctx, 508, 68, 4, '#f1d27a');
  } else {
    ctx.fillStyle = '#fff3bf';
    ctx.beginPath(); ctx.arc(500, 60, 26, 0, Math.PI * 2); ctx.arc(512, 52, 22, 0, Math.PI * 2, true); ctx.fill();
  }
  // string lights across the top
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 110); ctx.quadraticCurveTo(280, 150, 560, 110); ctx.stroke();
  const bulbColors = ['#ffd43b', '#e64980', '#4dabf7', '#69db7c'];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const bx = t * 560;
    const by = 110 + Math.sin(t * Math.PI) * 36;
    const dark = mut('bulb-out') && i === 5;
    circle(ctx, bx, by + 8, 6, dark ? '#495057' : bulbColors[i % 4]);
  }
  // ground
  rect(ctx, 0, 300, PANEL_W, 100, '#4a3a28');
  // left stall with striped awning
  rect(ctx, 40, 220, 180, 80, '#8a5a2b');
  rect(ctx, 40, 220, 180, 34, '#e8590c');
  for (let i = 0; i < 4; i++) rect(ctx, 40 + i * 45, 220, 22, 34, mut('awning-stripe') ? '#1971c2' : '#fff');
  rect(ctx, 52, 258, 156, 42, '#ffe8cc');
  circle(ctx, 84, 278, 12, '#e03131'); circle(ctx, 112, 278, 12, '#f59f00'); circle(ctx, 140, 278, 12, '#2b8a3e');
  circle(ctx, 176, 278, 12, '#e03131');
  // lanterns hanging from the stall
  circle(ctx, 70, 200, 12, '#e03131', '#8a1f1f', 2);
  circle(ctx, 110, 200, 12, '#f59f00', '#8a5a00', 2);
  if (!mut('lantern-count')) circle(ctx, 150, 200, 12, '#e03131', '#8a1f1f', 2);
  // right stall
  rect(ctx, 340, 220, 180, 80, '#5c4a7a');
  rect(ctx, 340, 220, 180, 34, '#9775fa');
  for (let i = 0; i < 4; i++) rect(ctx, 340 + i * 45, 220, 22, 34, '#fff');
  rect(ctx, 352, 258, 156, 42, '#e7d6ff');
  // balloons above the right stall
  ellipse(ctx, 400, 168, 13, 16, mut('balloon-color') ? '#1971c2' : '#e03131');
  ellipse(ctx, 440, 160, 13, 16, '#f59f00');
  line(ctx, 400, 184, 400, 206, '#333', 2); line(ctx, 440, 176, 440, 206, '#333', 2);
  // vendor cart (centre)
  rect(ctx, 240, 300, 80, 44, '#1971c2', '#0b4a8a', 2);
  circle(ctx, 256, 348, 9, '#343a40'); circle(ctx, 304, 348, 9, '#343a40');
  if (mut('cart-wheel')) circle(ctx, 280, 348, 9, '#343a40');
  rect(ctx, 248, 282, 64, 18, '#ffd43b');
  circle(ctx, 262, 291, 5, '#e03131'); circle(ctx, 282, 291, 5, '#2b8a3e'); circle(ctx, 298, 291, 5, '#e03131');
  // bunting flags
  const flagColors = ['#e03131', '#f59f00', '#2b8a3e', '#1971c2'];
  for (let i = 0; i < 8; i++) {
    const fx = 30 + i * 70;
    let c = flagColors[i % 4];
    if (mut('flag-color') && i === 3) c = '#e64980';
    poly(ctx, [[fx, 130], [fx + 34, 130], [fx + 17, 152]], c);
  }
  // cat on a crate
  if (!mut('cat')) {
    rect(ctx, 470, 330, 46, 30, '#8a5a2b');
    ellipse(ctx, 492, 322, 20, 11, '#343a40');
    circle(ctx, 510, 314, 9, '#343a40');
    poly(ctx, [[506, 308], [508, 300], [512, 306]], '#343a40');
    line(ctx, 474, 320, 462, 310, '#343a40', 4);
  }
}

const PASAR = {
  id: 'pasar', name: 'Pasar Malam', desc: 'A night market: lanterns, stalls, balloons and a cat.',
  theme: 'linear-gradient(135deg,#1b2a4a,#9775fa)', accent: '#7048e8',
  spots: [
    { id: 'moon', x: 500, y: 60, r: 30, label: 'Moon shape' },
    { id: 'star-count', x: 300, y: 90, r: 24, label: 'Stars in the sky' },
    { id: 'bulb-out', x: 280, y: 146, r: 22, label: 'String-light bulb' },
    { id: 'lantern-count', x: 150, y: 200, r: 22, label: 'Lantern' },
    { id: 'awning-stripe', x: 96, y: 237, r: 26, label: 'Awning stripe colour' },
    { id: 'balloon-color', x: 400, y: 168, r: 24, label: 'Balloon colour' },
    { id: 'cart-wheel', x: 280, y: 348, r: 20, label: 'Cart wheel' },
    { id: 'flag-color', x: 257, y: 141, r: 22, label: 'Bunting flag colour' },
    { id: 'cat', x: 492, y: 320, r: 28, label: 'Cat on the crate' },
  ],
  draw: drawPasar,
};

export const SCENES = [TAMAN, DAPUR, PANTAI, HUTAN, PASAR];
export function getScene(id) { return SCENES.find((s) => s.id === id) || SCENES[0]; }
