// Canvas2D painted textures (our own). All deterministic.
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const speckle = (g, w, h, r, n, cols, rad = [1, 3]) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, rad[0] + r() * rad[1], rad[0] + r() * rad[1] * 0.7, r() * 3, 0, 7); g.fill(); } };

export function planks(seed = 1, rot = 0) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = 52 + r() * 10, H = 30 + r() * 6;
    g.fillStyle = hsl(H, 42, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) { g.strokeStyle = hsl(H - 4, 40, L - 10 - r() * 8, 0.5); g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * w + 4 + r() * (w - 8); g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, 170, x + r() * 6 - 3, 340, x + r() * 4 - 2, 512); g.stroke(); }
    const cut = r() * 512; g.fillStyle = 'rgba(40,24,14,.9)'; g.fillRect(i * w, cut, w, 4);
    for (const y of [cut - 18, cut + 18]) { g.fillStyle = '#2b2620'; g.beginPath(); g.arc(i * w + w * 0.3, y, 2.6, 0, 7); g.arc(i * w + w * 0.7, y, 2.6, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(30,18,10,.95)'; g.fillRect(i * w, 0, 3, 512);
    if (r() < 0.5) { g.fillStyle = hsl(H, 40, L - 16, .8); g.beginPath(); g.ellipse(i * w + w / 2, r() * 512, 5, 9, 0, 0, 7); g.fill(); }
  }
  return c;
}
export function beam(seed = 2, base = [30, 40, 40]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) { g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, .45); g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke(); }
  return c;
}
/** rotting pile: wet dark lower part, moss, rot holes, pale fungus streaks */
export function rotten(seed = 3) {
  const [c, g] = cv(256, 1024), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#6b4a2e'); gr.addColorStop(0.45, '#4f3722'); gr.addColorStop(0.8, '#33281c'); gr.addColorStop(1, '#22231a');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 1024);
  for (let k = 0; k < 50; k++) { g.strokeStyle = `rgba(20,12,6,${.3 + r() * .4})`; g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 10, 300, x - 10, 700, x + r() * 10 - 5, 1024); g.stroke(); }
  // moss bands near the water line and patches
  for (let i = 0; i < 260; i++) { const y = 650 + Math.pow(r(), 0.6) * 374; g.fillStyle = hsl(85 + r() * 25, 45, 26 + r() * 14, .85); g.beginPath(); g.ellipse(r() * 256, y, 4 + r() * 12, 3 + r() * 6, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = hsl(95, 40, 30 + r() * 10, .8); g.beginPath(); g.ellipse(r() * 256, r() * 650, 3 + r() * 8, 2 + r() * 5, 0, 0, 7); g.fill(); }
  // rot holes with cracks
  for (let i = 0; i < 9; i++) {
    const x = r() * 256, y = 200 + r() * 760, w = 10 + r() * 26, h = 18 + r() * 50;
    g.fillStyle = '#120c08'; g.beginPath(); g.ellipse(x, y, w, h, 0, 0, 7); g.fill();
    g.strokeStyle = '#8a6a48'; g.lineWidth = 3; g.beginPath(); g.ellipse(x - 2, y - 2, w, h, 0, 3.6, 5.6); g.stroke();
    g.strokeStyle = '#120c08'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 6, y - h - 40 - r() * 60); g.moveTo(x, y + h); g.lineTo(x - 5, y + h + 30 + r() * 50); g.stroke();
  }
  // pale fungus spots
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(226,214,180,${.5 + r() * .4})`; g.beginPath(); g.ellipse(r() * 256, 150 + r() * 700, 2 + r() * 4, 2 + r() * 3, 0, 0, 7); g.fill(); }
  return c;
}
export function stone(seed = 4, hue = 36, sat = 14, lig = 66, bw = 128, bh = 64) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#4a4238'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh; row++) for (let col = -1; col < 512 / bw + 1; col++) {
    const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = lig - 6 + r() * 12;
    g.fillStyle = hsl(hue + r() * 8 - 4, sat, L); g.beginPath(); g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 6); g.fill();
    g.fillStyle = hsl(hue, sat, L + 7, .6); g.fillRect(x + 6, y + 5, bw - 14, 5);
    g.fillStyle = hsl(hue, sat, L - 12, .5); g.fillRect(x + 6, y + bh - 10, bw - 12, 5);
    speckle(g, 0, 0, r, 0, ['#000']);
    for (let k = 0; k < 6; k++) { g.fillStyle = hsl(hue, sat, L - 8 - r() * 8, .6); g.beginPath(); g.ellipse(x + r() * bw, y + r() * bh, 2 + r() * 5, 1 + r() * 3, 0, 0, 7); g.fill(); }
  }
  return c;
}
export function mossy(c0, seed = 5, amt = 1) {
  const [c, g] = cv(c0.width, c0.height), r = rng(seed); g.drawImage(c0, 0, 0);
  for (let i = 0; i < 500 * amt; i++) { const y = c.height * (0.4 + 0.6 * Math.pow(r(), 0.5)); g.fillStyle = hsl(90 + r() * 30, 40, 28 + r() * 16, .85); g.beginPath(); g.ellipse(r() * c.width, y, 4 + r() * 10, 3 + r() * 6, 0, 0, 7); g.fill(); }
  // ivy strands with leaves
  for (let s = 0; s < 8 * amt; s++) {
    let x = r() * c.width, y = c.height;
    for (let k = 0; k < 40; k++) { x += (r() - 0.5) * 18; y -= 8 + r() * 6; g.fillStyle = hsl(100 + r() * 20, 45, 30 + r() * 15); g.beginPath(); g.ellipse(x, y, 7, 5, r() * 3, 0, 7); g.fill(); g.strokeStyle = '#1d2b14'; g.lineWidth = 1.5; g.stroke(); }
  }
  return c;
}
export function grass(seed = 6) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#6fa04a'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { g.fillStyle = hsl(85 + r() * 20, 42, 38 + r() * 14, .5); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 50, 12 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 1400; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = hsl(80 + r() * 30, 45, 30 + r() * 25, .9); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke(); }
  for (let i = 0; i < 30; i++) { g.fillStyle = ['#f3e27a', '#ffffff', '#e8a0c0'][i % 3]; g.beginPath(); g.arc(r() * 512, r() * 512, 2.5, 0, 7); g.fill(); }
  return c;
}
export function dirt(seed = 7) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#a88a62'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) { g.fillStyle = hsl(30 + r() * 10, 25, 40 + r() * 25, .6); g.beginPath(); g.ellipse(r() * 512, r() * 512, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, 7); g.fill(); }
  return c;
}
export function plaster(seed = 8, hue = 40) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = hsl(hue, 40, 86); g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = hsl(hue, 30, 76 + r() * 8, .5); g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 30, 6 + r() * 16, 0, 0, 7); g.fill(); }
  g.fillStyle = hsl(hue, 20, 60, .5); g.fillRect(0, 236, 256, 20);
  return c;
}
export function roof(seed = 9) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#7b2e1c'; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const x = col * 32 + (row % 2) * 16, y = row * 32; g.fillStyle = hsl(12 + r() * 8, 58, 42 + r() * 10);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,220,180,.25)'; g.fillRect(x + 6, y + 2, 5, 22);
  }
  return c;
}
export function marble(seed = 10) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = '#efe7d6'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(160,140,110,.25)'; g.fillRect(i * 32 + 2, 0, 6, 512); }
  for (let k = 0; k < 10; k++) { g.strokeStyle = 'rgba(150,140,130,.35)'; g.lineWidth = 1.5; g.beginPath(); let x = r() * 256, y = 0; g.moveTo(x, y); while (y < 512) { x += r() * 30 - 15; y += 20 + r() * 30; g.lineTo(x, y); } g.stroke(); }
  return c;
}
export function banner() {
  const [c, g] = cv(256, 512);
  g.fillStyle = '#b8282b'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#8a1c22'; for (let i = 0; i < 5; i++) g.fillRect(20 + i * 50, 0, 12, 512);
  g.strokeStyle = '#e6b84a'; g.lineWidth = 12; g.strokeRect(14, 14, 228, 484);
  g.fillStyle = '#e6b84a'; g.font = 'bold 66px DejaVu Serif, serif'; g.textAlign = 'center'; g.fillText('SPQR', 128, 300);
  g.lineWidth = 9; g.beginPath(); g.arc(128, 180, 60, 0.4, Math.PI - 0.4, true); g.stroke();
  for (let i = 0; i < 9; i++) { const a = Math.PI + 0.35 + i * 0.3; g.beginPath(); g.ellipse(128 + Math.cos(a) * 60, 180 - Math.sin(a) * 60 * -1, 10, 5, a, 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(i * 32, 512); g.lineTo(i * 32 + 16, 470); g.lineTo(i * 32 + 32, 512); g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out'; g.fill(); g.globalCompositeOperation = 'source-over'; }
  return c;
}
/** interior of the helmet, planar-mapped: rusty iron + the carved message */
export function helmetInside(reveal = 1) {
  const [c, g] = cv(1024, 1024), r = rng(77);
  const gr = g.createRadialGradient(512, 512, 40, 512, 512, 520); gr.addColorStop(0, '#6d675e'); gr.addColorStop(0.7, '#575148'); gr.addColorStop(1, '#3a352f');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 220; i++) { g.fillStyle = hsl(22 + r() * 12, 55, 28 + r() * 16, .35 + r() * .4); g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 4 + r() * 26, 3 + r() * 14, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(30,26,22,${.2 + r() * .3})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * 1024, y = r() * 1024; g.moveTo(x, y); g.lineTo(x + r() * 60 - 30, y + r() * 60 - 30); g.stroke(); }
  const lines = ['THE BRIDGE', 'IS NOT', 'SAFE'], ys = [400, 530, 670], sz = [104, 112, 150];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, li) => {
    g.font = `bold ${sz[li]}px DejaVu Serif, serif`;
    const w = g.measureText(t).width; let x = 512 - w / 2;
    for (const ch of t) {
      const cw = g.measureText(ch).width, a = (r() - 0.5) * 0.12, dy = (r() - 0.5) * 10;
      g.save(); g.translate(x + cw / 2, ys[li] + dy); g.rotate(a);
      g.fillStyle = '#d6cdbd'; g.fillText(ch, 3, 4);       // lit lower lip of the groove
      g.fillStyle = '#16120f'; g.fillText(ch, 0, 0);       // groove
      g.fillStyle = 'rgba(70,60,50,.9)'; g.fillText(ch, -2, -3);
      g.restore(); x += cw;
    }
  });
  // scratch-out flourish under the words
  g.strokeStyle = '#16120f'; g.lineWidth = 7; g.beginPath(); g.moveTo(330, 765); g.lineTo(700, 760); g.stroke();
  g.strokeStyle = '#cbbfa9'; g.lineWidth = 3; g.beginPath(); g.moveTo(332, 772); g.lineTo(702, 767); g.stroke();
  return c;
}
export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}

// ---------- Stories X-Ray painters (interiors) ----------
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
/** checker tiles (diner floor) */
export function checker(seed = 21, a = '#efe6d2', b = '#2f3a4a', n = 4) {
  const [c, g] = cv2(512, 512), r = rng(seed), s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? b : a; g.fillRect(i * s, j * s, s, s);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(i * s + 6, j * s + 6, s * 0.5, 6);
    for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`; g.beginPath(); g.ellipse(i * s + r() * s, j * s + r() * s, 4 + r() * 18, 2 + r() * 8, r() * 3, 0, 7); g.fill(); } }
  g.strokeStyle = 'rgba(20,16,20,.55)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 512); g.moveTo(0, i * s); g.lineTo(512, i * s); g.stroke(); }
  return c;
}
/** wallpaper with vertical stripes and a small motif */
export function wallpaper(seed = 22, base = '#7a3b3b', stripe = '#8d4848', motif = 'rgba(240,200,140,.35)') {
  const [c, g] = cv2(256, 256), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) { g.fillStyle = stripe; g.fillRect(i * 64 + 8, 0, 26, 256); }
  g.fillStyle = motif; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = i * 64 + 52, y = j * 64 + (i % 2) * 32 + 16; g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 6, y); g.lineTo(x, y + 9); g.lineTo(x - 6, y); g.fill(); }
  for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.04})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 30, 6 + r() * 18, 0, 0, 7); g.fill(); }
  return c;
}
/** wainscot: vertical wood panels with a rail */
export function wainscot(seed = 23, hue = 24, lig = 34) {
  const [c, g] = cv2(512, 256), r = rng(seed);
  g.fillStyle = hsl(hue, 45, lig); g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 4; i++) { const x = i * 128; g.fillStyle = hsl(hue, 42, lig + 5); g.fillRect(x + 14, 24, 100, 200); g.strokeStyle = hsl(hue, 45, lig - 12); g.lineWidth = 5; g.strokeRect(x + 14, 24, 100, 200);
    g.fillStyle = hsl(hue, 45, lig + 14, .5); g.fillRect(x + 18, 28, 92, 5);
    for (let k = 0; k < 8; k++) { g.strokeStyle = hsl(hue, 40, lig - 4 - r() * 6, .5); g.lineWidth = 1.5; g.beginPath(); const xx = x + 20 + r() * 88; g.moveTo(xx, 28); g.lineTo(xx + r() * 6 - 3, 220); g.stroke(); } }
  g.fillStyle = hsl(hue, 45, lig - 14); g.fillRect(0, 0, 512, 12); g.fillRect(0, 244, 512, 12);
  return c;
}
export function brick(seed = 24, hue = 12, lig = 44) {
  const [c, g] = cv2(512, 512), r = rng(seed), bw = 96, bh = 40;
  g.fillStyle = '#d8cbb6'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh + 1; row++) for (let col = -1; col < 512 / bw + 1; col++) { const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = lig - 6 + r() * 12;
    g.fillStyle = hsl(hue + r() * 8 - 4, 48, L); g.fillRect(x + 3, y + 3, bw - 6, bh - 6); g.fillStyle = hsl(hue, 45, L + 8, .5); g.fillRect(x + 5, y + 5, bw - 12, 4); }
  return c;
}
/** green chalkboard with drawings: queue diagrams, arrows, scribbles (no real words) */
export function chalkboard(seed = 25, drawLine = true) {
  const [c, g] = cv2(1024, 512), r = rng(seed);
  g.fillStyle = '#2f4a3c'; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(230,240,230,${0.02 + r() * 0.04})`; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 30 + r() * 90, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(245,245,235,.92)'; g.fillStyle = 'rgba(245,245,235,.92)'; g.lineWidth = 5; g.lineCap = 'round';
  const stick = (x, y, s = 1) => { g.beginPath(); g.arc(x, y - 52 * s, 13 * s, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, y - 38 * s); g.lineTo(x, y - 8 * s); g.moveTo(x - 14 * s, y - 28 * s); g.lineTo(x + 14 * s, y - 28 * s); g.moveTo(x, y - 8 * s); g.lineTo(x - 10 * s, y + 14 * s); g.moveTo(x, y - 8 * s); g.lineTo(x + 10 * s, y + 14 * s); g.stroke(); };
  if (drawLine) { for (let i = 0; i < 6; i++) stick(120 + i * 70, 300); g.beginPath(); g.moveTo(80, 340); g.lineTo(560, 340); g.stroke();
    g.font = '700 54px Kalam, Comic Sans MS, cursive'; ['1', '2', '3', '4', '5', '6'].forEach((t, i) => g.fillText(t, 108 + i * 70, 400));
    g.beginPath(); g.moveTo(560, 230); g.quadraticCurveTo(640, 150, 700, 250); g.stroke(); g.beginPath(); g.moveTo(690, 225); g.lineTo(702, 254); g.lineTo(672, 252); g.stroke(); }
  // graph: wait time vs anger
  g.beginPath(); g.moveTo(760, 80); g.lineTo(760, 360); g.lineTo(980, 360); g.stroke();
  g.beginPath(); g.moveTo(770, 340); g.bezierCurveTo(840, 330, 900, 250, 970, 100); g.stroke();
  g.font = '700 44px Kalam, Comic Sans MS, cursive'; g.fillText('?!', 900, 90); g.fillText('t', 960, 410);
  for (let i = 0; i < 5; i++) { g.lineWidth = 3; g.beginPath(); const x = 120 + r() * 400, y = 60 + r() * 120; g.moveTo(x, y); for (let k = 0; k < 6; k++) g.lineTo(x + k * 18, y + (k % 2 ? 10 : -6)); g.stroke(); }
  g.fillStyle = 'rgba(30,40,34,1)'; g.fillRect(0, 480, 1024, 32); g.fillStyle = '#efe9da'; g.fillRect(200, 486, 60, 12); g.fillRect(320, 488, 34, 10);
  return c;
}
/** night city through a window: dark blue sky, lit windows, bokeh */
export function nightCity(seed = 26) {
  const [c, g] = cv2(512, 512), r = rng(seed), gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#0d1838'); gr.addColorStop(0.6, '#25356b'); gr.addColorStop(1, '#3d3f78'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  for (let b = 0; b < 9; b++) { const x = b * 60 - 10 + r() * 20, w = 50 + r() * 30, h = 180 + r() * 260; g.fillStyle = hsl(230, 30, 14 + r() * 8); g.fillRect(x, 512 - h, w, h);
    for (let yy = 512 - h + 12; yy < 500; yy += 22) for (let xx = x + 6; xx < x + w - 8; xx += 14) if (r() < 0.45) { g.fillStyle = r() < 0.7 ? '#ffd27a' : '#9fd4ff'; g.fillRect(xx, yy, 7, 10); } }
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(255,${180 + r() * 60},${100 + r() * 80},${0.25 + r() * 0.3})`; g.beginPath(); g.arc(r() * 512, 380 + r() * 130, 8 + r() * 18, 0, 7); g.fill(); }
  return c;
}
/** framed picture (abstract landscape) */
export function picture(seed = 27, pal = ['#e8b04a', '#4f8fb8', '#c0476a', '#6fae4a']) {
  const [c, g] = cv2(256, 320), r = rng(seed);
  g.fillStyle = '#3a2618'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#efe4cc'; g.fillRect(16, 16, 224, 288);
  g.fillStyle = pal[1]; g.fillRect(28, 28, 200, 150); g.fillStyle = pal[0]; g.beginPath(); g.arc(160, 90, 34, 0, 7); g.fill();
  g.fillStyle = pal[3]; g.beginPath(); g.moveTo(28, 178); g.quadraticCurveTo(100, 100, 228, 178); g.fill();
  g.fillStyle = pal[2]; g.fillRect(28, 178, 200, 114); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(255,255,255,${0.1 + r() * 0.2})`; g.fillRect(36 + r() * 180, 190 + r() * 90, 30, 4); }
  return c;
}
/** store shelf: rows of boxes and cans (no logos) */
export function shelf(seed = 28, retro = false) {
  const [c, g] = cv2(512, 512), r = rng(seed);
  g.fillStyle = retro ? '#6b4a2e' : '#3a3f4a'; g.fillRect(0, 0, 512, 512);
  const pal = retro ? ['#d6a23a', '#b8442e', '#e8d9b0', '#5d7a3a', '#c97a3a', '#8a5a9a'] : ['#e0453a', '#3f8fd2', '#f2c14e', '#6fbf73', '#f08a5d', '#b58ad8', '#ffffff'];
  for (let row = 0; row < 4; row++) { const y0 = row * 128; g.fillStyle = retro ? '#8a6040' : '#c9ccd2'; g.fillRect(0, y0 + 112, 512, 16); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y0 + 108, 512, 4);
    let x = 4; while (x < 500) { const w = 28 + r() * 40, h = 50 + r() * 50, col = pal[(r() * pal.length) | 0]; g.fillStyle = col; g.fillRect(x, y0 + 112 - h, w, h);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 4, y0 + 112 - h + 6, w - 8, 8); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + w - 6, y0 + 112 - h, 6, h); g.strokeStyle = 'rgba(20,10,20,.7)'; g.lineWidth = 2; g.strokeRect(x, y0 + 112 - h, w, h); x += w + 3; } }
  return c;
}
/** a sign with big hand-lettered text (diegetic) */
export function sign(text, { w = 512, h = 256, bg = '#b8282b', fg = '#fff3d6', font = '900 110px Inter, Arial Black, Arial', border = '#2a1c16', sub = '' } = {}) {
  const [c, g] = cv2(w, h); g.fillStyle = border; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(12, 12, w - 24, h - 24);
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 - (sub ? 22 : 0));
  if (sub) { g.font = '700 40px Inter, Arial'; g.fillText(sub, w / 2, h - 50); }
  return c;
}
/** tear-off wall calendar showing a year */
export function calendar(year = '1976', month = 'MAY') {
  const [c, g] = cv2(256, 340); g.fillStyle = '#f6f0e0'; g.fillRect(0, 0, 256, 340); g.fillStyle = '#b8282b'; g.fillRect(0, 0, 256, 92);
  g.fillStyle = '#fff'; g.font = '900 64px Inter, Arial Black'; g.textAlign = 'center'; g.fillText(year, 128, 70);
  g.fillStyle = '#2a1c16'; g.font = '800 34px Inter, Arial'; g.fillText(month, 128, 130);
  g.font = '600 20px Inter, Arial'; for (let i = 0; i < 31; i++) g.fillText(String(i + 1), 34 + (i % 7) * 32, 172 + Math.floor(i / 7) * 34);
  g.strokeStyle = '#b8282b'; g.lineWidth = 4; g.beginPath(); g.arc(34 + 5 * 32, 166 + 2 * 34, 16, 0, 7); g.stroke();
  return c;
}
/** fabric with a fine weave (booths, tablecloths) */
export function fabric(seed = 29, base = '#9a2f35', check = null) {
  const [c, g] = cv2(256, 256), r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  if (check) { g.fillStyle = check; for (let i = 0; i < 8; i++) { g.globalAlpha = 0.55; g.fillRect(i * 32, 0, 16, 256); g.fillRect(0, i * 32, 256, 16); } g.globalAlpha = 1; }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${0.03 + r() * 0.05})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 3); }
  return c;
}
/** clock face */
export function clockFace() {
  const [c, g] = cv2(256, 256); g.fillStyle = '#f7f1e3'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
  g.strokeStyle = '#2a1c16'; g.fillStyle = '#2a1c16';
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r0 = i % 5 ? 112 : 98; g.lineWidth = i % 5 ? 3 : 8; g.beginPath(); g.moveTo(128 + Math.cos(a) * r0, 128 + Math.sin(a) * r0); g.lineTo(128 + Math.cos(a) * 120, 128 + Math.sin(a) * 120); g.stroke(); }
  g.font = '800 30px Inter, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; [12, 3, 6, 9].forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; g.fillText(String(n), 128 + Math.cos(a) * 76, 128 + Math.sin(a) * 76); });
  return c;
}
