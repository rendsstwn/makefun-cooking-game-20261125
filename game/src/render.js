// Every pixel of the stall, third pass: deeper light and shadow across the
// kitchen, steam rising off the hot food, and a drinks shelf with two cold
// pours. The painter takes the stall state and draws one frame — floor,
// counters, cook, order board, timer and floating feedback — and never
// changes it.

import {
  BOARD,
  DRINKS,
  INGREDIENTS,
  PALETTE,
  SHIFT_LENGTH,
  TICKET,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  patienceTone,
} from './config.js';
import { MODE_DONE, MODE_OVER, MODE_PAUSED, MODE_PLAY, MODE_TITLE } from './kitchen.js';

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath(); // start the path
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath(); // seal the path
}; // a rounded rectangle path

const label = (ctx, str, x, y, size, colour, weight, align) => {
  ctx.fillStyle = colour;
  ctx.font = `${weight ?? 'bold'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}; // one line of text

const drawHeart = (ctx, x, y, size, filled) => {
  ctx.save(); // push state
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath(); // start the heart
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -3, -5, -10, 0, -5);
  ctx.bezierCurveTo(5, -10, 9, -3, 0, 5);
  ctx.closePath(); // seal the heart
  ctx.fillStyle = filled ? '#e4572e' : '#5a3a32';
  ctx.fill(); // paint the heart
  ctx.restore(); // pop state
}; // one heart, full or empty

// One recognisable drawing of each ingredient, centred on (x, y) — drawn
// richer this pass: layered strands, gloss, garnish and steam.
export const drawPiece = (ctx, piece, x, y, size) => {
  const half = size / 2;
  ctx.save(); // push state
  ctx.translate(x, y);
  if (piece === 'noodle') {
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); // start a strand
      ctx.moveTo(-half * 0.85, i * half * 0.45);
      ctx.quadraticCurveTo(-half * 0.3, i * half * 0.45 - half * 0.45, half * 0.1, i * half * 0.45);
      ctx.quadraticCurveTo(half * 0.55, i * half * 0.45 + half * 0.4, half * 0.85, i * half * 0.45 - half * 0.15);
      ctx.stroke(); // paint the strand
    }
    ctx.fillStyle = '#f4d58d';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); // start a noodle blob
      ctx.arc(i * half * 0.42, half * 0.1, half * 0.4, 0, Math.PI * 2);
      ctx.fill(); // paint the blob
    }
    ctx.strokeStyle = 'rgba(251,243,221,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the gloss
    ctx.moveTo(-half * 0.6, -half * 0.55);
    ctx.quadraticCurveTo(0, -half * 0.85, half * 0.6, -half * 0.55);
    ctx.stroke(); // paint the gloss
    ctx.fillStyle = '#e8b4b8';
    ctx.beginPath(); // start the garnish
    ctx.arc(0, half * 0.42, half * 0.6, 0, Math.PI);
    ctx.fill(); // paint the garnish
  } else if (piece === 'chicken') {
    ctx.fillStyle = '#e8a83c';
    ctx.beginPath(); // start the drumstick
    ctx.arc(-half * 0.1, half * 0.12, half * 0.66, 0, Math.PI * 2);
    ctx.fill(); // paint it
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath(); // start the meat
    ctx.arc(-half * 0.18, half * 0.05, half * 0.55, 0, Math.PI * 2);
    ctx.fill(); // paint it
    ctx.fillStyle = '#b98a2e';
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath(); // start a sear dot
      ctx.arc(-half * 0.5 + i * half * 0.3, -half * 0.2 + (i % 2) * half * 0.35, half * 0.09, 0, Math.PI * 2);
      ctx.fill(); // paint the dot
    }
    ctx.strokeStyle = '#fdf6d8';
    ctx.lineWidth = half * 0.26;
    ctx.beginPath(); // start the bone
    ctx.moveTo(half * 0.35, -half * 0.3);
    ctx.lineTo(half * 0.85, -half * 0.8);
    ctx.stroke(); // paint the bone
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath(); // start the knuckle
    ctx.arc(half * 0.85, -half * 0.8, half * 0.22, 0, Math.PI * 2);
    ctx.fill(); // paint the knuckle
  } else if (piece === 'beef') {
    ctx.fillStyle = '#a34d2d';
    roundRect(ctx, -half * 0.85, -half * 0.55, half * 1.7, half * 1.1, half * 0.4);
    ctx.fill(); // paint the steak
    ctx.fillStyle = '#c96a3f';
    roundRect(ctx, -half * 0.7, -half * 0.42, half * 1.4, half * 0.5, half * 0.25);
    ctx.fill(); // paint the top
    ctx.strokeStyle = '#6e2f1a';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); // start a grill mark
      ctx.moveTo(-half * 0.5 + i * half * 0.5, -half * 0.45);
      ctx.lineTo(-half * 0.2 + i * half * 0.5, half * 0.45);
      ctx.stroke(); // paint the mark
    }
    ctx.strokeStyle = 'rgba(251,243,221,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the sheen
    ctx.moveTo(-half * 0.55, -half * 0.35);
    ctx.lineTo(half * 0.2, -half * 0.35);
    ctx.stroke(); // paint the sheen
  } else if (piece === 'egg') {
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath(); // start the white
    ctx.ellipse(0, 0, half * 0.88, half * 0.72, 0.3, 0, Math.PI * 2);
    ctx.fill(); // paint the white
    ctx.strokeStyle = '#e8d9a8';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); // start the rim
    ctx.ellipse(0, 0, half * 0.8, half * 0.64, 0.3, 0, Math.PI * 2);
    ctx.stroke(); // paint the rim
    ctx.fillStyle = '#f0b429';
    ctx.beginPath(); // start the yolk
    ctx.arc(half * 0.1, -half * 0.05, half * 0.4, 0, Math.PI * 2);
    ctx.fill(); // paint the yolk
    ctx.fillStyle = '#ffd968';
    ctx.beginPath(); // start the yolk shine
    ctx.arc(half * 0.02, -half * 0.14, half * 0.18, 0, Math.PI * 2);
    ctx.fill(); // paint the shine
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); // start the sparkle
    ctx.arc(half * 0.2, -half * 0.2, half * 0.09, 0, Math.PI * 2);
    ctx.fill(); // paint the sparkle
  } else if (piece === 'chili') {
    ctx.strokeStyle = '#d9381e';
    ctx.lineWidth = half * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath(); // start the pod
    ctx.arc(0, -half * 0.1, half * 0.7, Math.PI * 0.15, Math.PI * 0.95);
    ctx.stroke(); // paint the pod
    ctx.strokeStyle = '#f26a4a';
    ctx.lineWidth = half * 0.16;
    ctx.beginPath(); // start the ridge
    ctx.arc(-half * 0.05, -half * 0.18, half * 0.55, Math.PI * 0.25, Math.PI * 0.7);
    ctx.stroke(); // paint the ridge
    ctx.strokeStyle = '#3e7d32';
    ctx.lineWidth = half * 0.22;
    ctx.beginPath(); // start the stem
    ctx.moveTo(-half * 0.62, -half * 0.62);
    ctx.lineTo(-half * 0.85, -half * 0.95);
    ctx.stroke(); // paint the stem
  } else if (piece === 'herbs') {
    ctx.fillStyle = '#69b455';
    for (let i = -1; i <= 1; i += 1) {
      ctx.save(); // push leaf state
      ctx.rotate(i * 0.5);
      ctx.beginPath(); // start a leaf
      ctx.ellipse(0, -half * 0.45, half * 0.28, half * 0.55, 0, 0, Math.PI * 2);
      ctx.fill(); // paint the leaf
      ctx.restore(); // pop leaf state
    }
    ctx.fillStyle = '#8ed06a';
    ctx.beginPath(); // start the light leaf
    ctx.ellipse(-half * 0.3, -half * 0.5, half * 0.16, half * 0.3, -0.4, 0, Math.PI * 2);
    ctx.fill(); // paint it
    ctx.strokeStyle = '#3e7d32';
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the stem
    ctx.moveTo(0, half * 0.2);
    ctx.lineTo(0, half * 0.85);
    ctx.stroke(); // paint the stem
  } else if (piece === 'broth') {
    ctx.fillStyle = '#d97b2b';
    ctx.beginPath(); // start the bowl
    ctx.arc(0, half * 0.1, half * 0.72, 0, Math.PI);
    ctx.fill(); // paint the bowl
    ctx.fillStyle = '#e89a4e';
    ctx.beginPath(); // start the broth top
    ctx.arc(0, half * 0.02, half * 0.6, 0, Math.PI);
    ctx.fill(); // paint the top
    ctx.fillStyle = '#fbf3dd';
    ctx.fillRect(-half * 0.75, -half * 0.15, half * 1.5, half * 0.18);
    ctx.strokeStyle = 'rgba(251,243,221,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the steam curls
    ctx.moveTo(-half * 0.3, -half * 0.5);
    ctx.quadraticCurveTo(-half * 0.5, -half * 0.9, -half * 0.3, -half * 1.1);
    ctx.moveTo(half * 0.25, -half * 0.5);
    ctx.quadraticCurveTo(half * 0.45, -half * 0.9, half * 0.25, -half * 1.1);
    ctx.stroke(); // paint the curls
    ctx.fillStyle = '#69b455';
    ctx.beginPath(); // start the herb fleck
    ctx.ellipse(half * 0.45, -half * 0.1, half * 0.16, half * 0.08, 0.5, 0, Math.PI * 2);
    ctx.fill(); // paint the fleck
  }
  ctx.restore(); // pop state
}; // one ingredient

// One cold drink in a glass, centred on (x, y): a trapezoid glass, the
// coloured liquid, two ice cubes and a straw. Used on tickets, on the
// drinks shelf, and above the cook's head while one is being carried.
export const drawDrink = (ctx, drinkId, x, y, size) => {
  const spec = DRINKS[drinkId];
  const half = size / 2;
  ctx.save(); // push state
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(251,243,221,0.92)';
  ctx.beginPath(); // start the glass
  ctx.moveTo(-half * 0.62, -half * 0.7);
  ctx.lineTo(half * 0.62, -half * 0.7);
  ctx.lineTo(half * 0.45, half * 0.8);
  ctx.lineTo(-half * 0.45, half * 0.8);
  ctx.closePath(); // seal the glass
  ctx.fill(); // paint the glass
  ctx.fillStyle = spec.liquid;
  ctx.beginPath(); // start the liquid
  ctx.moveTo(-half * 0.55, -half * 0.45);
  ctx.lineTo(half * 0.55, -half * 0.45);
  ctx.lineTo(half * 0.42, half * 0.68);
  ctx.lineTo(-half * 0.42, half * 0.68);
  ctx.closePath(); // seal the liquid
  ctx.fill(); // paint the liquid
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-half * 0.28, -half * 0.28, half * 0.3, half * 0.3);
  ctx.fillRect(half * 0.05, -half * 0.1, half * 0.28, half * 0.28);
  ctx.strokeStyle = '#e4572e';
  ctx.lineWidth = Math.max(2, half * 0.14);
  ctx.lineCap = 'round';
  ctx.beginPath(); // start the straw
  ctx.moveTo(half * 0.18, -half * 0.4);
  ctx.lineTo(half * 0.42, -half * 1.05);
  ctx.stroke(); // paint the straw
  ctx.restore(); // pop state
}; // one drink in a glass

const drawShell = (ctx, rect, topColour) => {
  const [x, y, w, h] = rect;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  roundRect(ctx, x + 4, y + 12, w, h - 8, 8);
  ctx.fill(); // paint the drop shadow
  ctx.fillStyle = PALETTE.counterFront;
  roundRect(ctx, x, y + 8, w, h - 8, 8);
  ctx.fill(); // paint the front
  const sheen = ctx.createLinearGradient(x, y, x, y + 18);
  sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  roundRect(ctx, x - 2, y, w + 4, 18, 8);
  ctx.fill(); // paint the top sheen
  ctx.fillStyle = topColour;
  roundRect(ctx, x - 2, y + 6, w + 4, 12, 6);
  ctx.fill(); // paint the top edge
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 1; i < 3; i += 1) {
    ctx.fillRect(x + 8, y + 8 + ((h - 16) * i) / 3, w - 16, 2);
  }
}; // a counter's wooden shell, with shadow and sheen

// A cooking timer drawn as a bar across the station's top, its label in a
// cream pill pinned to the bottom inside the station, clear of the name
// hanging in the gap overhead.
const drawProgress = (ctx, station, fraction, labelText) => {
  const [x, y, w, h] = station.rect;
  const cx = x + w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, x + 10, y + 8, w - 20, 8, 4);
  ctx.fill(); // paint the track
  ctx.fillStyle = '#f2b544';
  roundRect(ctx, x + 10, y + 8, (w - 20) * Math.min(1, fraction), 8, 4);
  ctx.fill(); // paint the fill
  const pillW = 18 + labelText.length * 7.5;
  ctx.fillStyle = '#fbf3dd';
  roundRect(ctx, cx - pillW / 2, y + h - 24, pillW, 18, 9);
  ctx.fill(); // paint the pill
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  roundRect(ctx, cx - pillW / 2, y + h - 24, pillW, 18, 9);
  ctx.stroke(); // outline the pill
  label(ctx, labelText, cx, y + h - 14, 12, '#3a2a18', 'bold', 'center');
}; // a cooking progress bar and pill

// A green READY pill pinned to the same spot at the station's bottom.
const drawReady = (ctx, station) => {
  const [x, y, w, h] = station.rect;
  const cx = x + w / 2;
  ctx.fillStyle = '#7bc950';
  roundRect(ctx, cx - 31, y + h - 24, 62, 18, 9);
  ctx.fill(); // paint the pill
  ctx.strokeStyle = '#17221f';
  ctx.lineWidth = 2;
  roundRect(ctx, cx - 31, y + h - 24, 62, 18, 9);
  ctx.stroke(); // outline the pill
  label(ctx, 'READY', cx, y + h - 14, 12, '#17221f', 'bold', 'center');
}; // a green ready pill

// Three thin steam wisps rising off a hot spot, driven only by the shift
// clock so the same moment always paints the same curls.
const drawSteam = (ctx, x, y, time, offset) => {
  ctx.save(); // push steam state
  ctx.strokeStyle = 'rgba(251,243,221,0.55)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i += 1) {
    const sway = Math.sin(time * 1.6 + offset + i * 2.1) * 5;
    const lift = ((time * 14 + i * 23 + offset * 10) % 26);
    ctx.globalAlpha = 0.5 * (1 - lift / 26);
    ctx.beginPath(); // start a wisp
    ctx.moveTo(x + i * 12 + sway * 0.4, y - lift * 0.4);
    ctx.quadraticCurveTo(x + i * 12 + sway, y - 8 - lift * 0.6, x + i * 12 - sway * 0.5, y - 16 - lift);
    ctx.stroke(); // paint the wisp
  }
  ctx.restore(); // pop steam state
}; // steam wisps over hot food

const drawStation = (ctx, stall, station) => {
  const [x, y, w, h] = station.rect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const time = stall.time;

  if (station.kind === 'bin') {
    drawShell(ctx, station.rect, PALETTE.counterTop);
    drawPiece(ctx, station.stock, cx - 12, cy - 6, 26);
    drawPiece(ctx, station.stock, cx + 14, cy + 2, 22);
    label(ctx, station.label, cx, y + h - 8, 12, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'ladle') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 4, y + 12, w, h - 8, 10);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#3a2a18';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill(); // paint the trough
    const brothGlow = ctx.createRadialGradient(cx, y + 34, 6, cx, y + 34, w / 2);
    brothGlow.addColorStop(0, '#f0a44e');
    brothGlow.addColorStop(1, '#d97b2b');
    ctx.fillStyle = brothGlow;
    roundRect(ctx, x + 10, y + 12, w - 20, h - 26, 8);
    ctx.fill(); // paint the broth
    ctx.fillStyle = '#e89a4e';
    roundRect(ctx, x + 16, y + 16, w - 32, 10, 5);
    ctx.fill(); // paint the broth shine
    ctx.strokeStyle = 'rgba(251,243,221,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the ladle steam
    ctx.moveTo(x + 26, y + 8);
    ctx.quadraticCurveTo(x + 14, y - 6, x + 26, y - 16);
    ctx.moveTo(x + w - 26, y + 8);
    ctx.quadraticCurveTo(x + w - 14, y - 6, x + w - 26, y - 16);
    ctx.stroke(); // paint the steam
    drawSteam(ctx, cx, y + 4, time, 3);
    label(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'pot') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 4, y + 26, w, h - 14, 12);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#20262b';
    roundRect(ctx, x, y + 14, w, h - 14, 12);
    ctx.fill(); // paint the pot body
    const soupGlow = ctx.createRadialGradient(cx, y + 20, 4, cx, y + 20, w / 2);
    soupGlow.addColorStop(0, '#eda14f');
    soupGlow.addColorStop(1, '#d97b2b');
    ctx.fillStyle = soupGlow;
    ctx.beginPath(); // start the soup surface
    ctx.ellipse(cx, y + 20, w / 2 - 10, 12, 0, 0, Math.PI * 2);
    ctx.fill(); // paint the surface
    ctx.strokeStyle = '#f4d58d';
    ctx.lineWidth = 3;
    ctx.beginPath(); // start the noodle swirl
    ctx.moveTo(cx - 60, y + 18);
    ctx.quadraticCurveTo(cx - 20, y + 10, cx + 10, y + 20);
    ctx.quadraticCurveTo(cx + 40, y + 28, cx + 62, y + 18);
    ctx.stroke(); // paint the swirl
    for (let i = 0; i < 3; i += 1) {
      const bx = cx - 50 + i * 50 + Math.sin(time * 2 + i * 2) * 6;
      ctx.fillStyle = '#f0b429';
      ctx.beginPath(); // start a bubble
      ctx.arc(bx, y + 18 + Math.cos(time * 3 + i) * 2, 5, 0, Math.PI * 2);
      ctx.fill(); // paint the bubble
    }
    drawSteam(ctx, cx, y + 6, time, 1);
    if (station.job) {
      drawProgress(ctx, station, station.job.done / station.job.total, 'Boiling…');
    } else if (station.ready) {
      drawPiece(ctx, station.ready, cx, y + 20, 26);
      drawReady(ctx, station);
    }
    label(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'board') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 10, y + 22, w - 12, h - 20, 8);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#c9a24a';
    roundRect(ctx, x + 6, y + 10, w - 12, h - 20, 8);
    ctx.fill(); // paint the board top
    ctx.strokeStyle = '#8a6a2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 14, y + 18, w - 28, h - 36);
    if (station.job) {
      drawPiece(ctx, station.job.piece, cx - 24, cy, 30);
      ctx.save(); // push knife state
      ctx.translate(cx + 44, cy - 8);
      ctx.rotate(Math.sin(time * 14) * 0.35 - 0.5);
      ctx.fillStyle = '#dfe3e6';
      ctx.fillRect(-4, -22, 8, 34);
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(-4, 12, 8, 14);
      ctx.restore(); // pop knife state
      drawProgress(ctx, station, station.job.done / station.job.total, 'Chopping…');
    } else if (station.ready) {
      drawPiece(ctx, station.ready, cx, cy, 32);
      drawReady(ctx, station);
    } else {
      ctx.save(); // push knife state
      ctx.translate(cx + 44, cy - 8);
      ctx.rotate(-0.5);
      ctx.fillStyle = '#dfe3e6';
      ctx.fillRect(-4, -22, 8, 34);
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(-4, 12, 8, 14);
      ctx.restore(); // pop knife state
    }
    label(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'grill') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 4, y + 12, w, h - 8, 10);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#26221f';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill(); // paint the grill body
    ctx.fillStyle = station.job ? '#e4572e' : '#4a3a30';
    for (let i = 0; i < 4; i += 1) {
      const gy = y + 16 + i * 18;
      ctx.beginPath(); // start a heat wave
      ctx.moveTo(x + 14, gy);
      ctx.quadraticCurveTo(cx, gy - 10, x + w - 14, gy);
      ctx.lineWidth = 5;
      ctx.strokeStyle = station.job
        ? `rgba(228,87,46,${0.5 + 0.3 * Math.sin(time * 6 + i)})`
        : '#5a4636';
      ctx.stroke(); // paint the wave
    }
    ctx.strokeStyle = '#8a7a68';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath(); // start a grate bar
      ctx.moveTo(x + 16 + i * ((w - 32) / 4), y + 8);
      ctx.lineTo(x + 16 + i * ((w - 32) / 4), y + h - 8);
      ctx.stroke(); // paint the bar
    }
    if (station.job) {
      drawPiece(ctx, station.job.piece, cx, cy, 30);
      drawProgress(ctx, station, station.job.done / station.job.total, 'Searing…');
    } else if (station.ready) {
      drawPiece(ctx, station.ready, cx, cy, 32);
      drawReady(ctx, station);
    }
    label(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }

  if (station.kind === 'plate') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 4, y + 12, w, h - 8, 10);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#3a2a18';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill(); // paint the mat
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath(); // start the plate
    ctx.arc(cx, cy + 2, 34, 0, Math.PI * 2);
    ctx.fill(); // paint the plate
    ctx.strokeStyle = '#d9c9a0';
    ctx.lineWidth = 3;
    ctx.beginPath(); // start the plate rim
    ctx.arc(cx, cy + 2, 26, 0, Math.PI * 2);
    ctx.stroke(); // paint the rim
    station.pieces.forEach((piece, i) => {
      const angle = (i / Math.max(1, station.pieces.length)) * Math.PI * 2 - Math.PI / 2;
      drawPiece(ctx, piece, cx + Math.cos(angle) * 14, cy + 2 + Math.sin(angle) * 14, 20);
    });
    if (station.pieces.length >= 3) {
      ctx.fillStyle = '#69b455';
      ctx.beginPath(); // start the garnish
      ctx.ellipse(cx + 10, cy - 12, 6, 3, -0.5, 0, Math.PI * 2);
      ctx.ellipse(cx + 16, cy - 8, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill(); // paint the garnish
    }
    if (station.pieces.length > 0) {
      drawSteam(ctx, cx, y + 6, time, 5);
    }
    label(ctx, station.label, x + 16, y - 8, 13, '#fbf3dd', 'bold', 'left');
    return;
  }
  if (station.kind === 'window') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 4, y + 12, w, h - 8, 10);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#c98a3d';
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill(); // paint the frame
    for (let i = 0; i < 8; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? '#e4572e' : '#f6e8c8';
      ctx.fillRect(x + 10 + i * ((w - 20) / 8), y + 2, (w - 20) / 8, 12);
    }
    ctx.fillStyle = '#f6e8c8';
    roundRect(ctx, x + 10, y + 16, w - 20, h - 26, 8);
    ctx.fill(); // paint the counter
    ctx.fillStyle = '#e4572e';
    ctx.beginPath(); // start the bell
    ctx.arc(cx - 60, cy, 16, Math.PI, 0);
    ctx.fill(); // paint the bell
    ctx.fillRect(cx - 76, cy - 4, 32, 6);
    label(ctx, 'SERVE', cx + 30, cy, 26, '#3a2a18', 'bold', 'center');
    label(ctx, 'pick up a finished plate, bring it here', cx + 30, cy + 26, 12, '#6e4525', 'normal', 'center');
    return;
  }
  if (station.kind === 'trash') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 14, y + 20, w - 20, h - 16, 8);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#3f4a44';
    roundRect(ctx, x + 10, y + 8, w - 20, h - 16, 8);
    ctx.fill(); // paint the bin
    ctx.fillStyle = '#2c3430';
    roundRect(ctx, x + 4, y, w - 8, 14, 7);
    ctx.fill(); // paint the lid
    label(ctx, station.label, x + 16, y - 8, 13, '#fbf3dd', 'bold', 'left');
    return;
  }
  if (station.kind === 'drinks') {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    roundRect(ctx, x + 4, y + 12, w, h - 8, 10);
    ctx.fill(); // paint the drop shadow
    ctx.fillStyle = '#5a3a20';
    roundRect(ctx, x, y + 8, w, h - 8, 8);
    ctx.fill(); // paint the shelf front
    ctx.fillStyle = PALETTE.counterTop;
    roundRect(ctx, x - 2, y, w + 4, 18, 8);
    ctx.fill(); // paint the shelf top
    drawDrink(ctx, 'es-teh', cx - 30, cy - 2, 34);
    drawDrink(ctx, 'es-jeruk', cx + 30, cy - 2, 34);
    const wanted = stall.tickets.find((entry) => entry.drink && !entry.drinkServed);
    if (wanted) {
      ctx.fillStyle = 'rgba(251,243,221,0.95)';
      ctx.beginPath(); // start the want bubble
      ctx.arc(x + w - 16, y + 4, 12, 0, Math.PI * 2);
      ctx.fill(); // paint the bubble
      drawDrink(ctx, wanted.drink, x + w - 16, y + 4, 15);
    }
    if (station.job) {
      drawProgress(ctx, station, station.job.done / station.job.total, 'Pouring…');
    } else if (station.ready) {
      drawReady(ctx, station);
    }
    label(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
  }
}; // one counter, any kind

const drawChef = (ctx, stall) => {
  const chef = stall.chef;
  const swing = stall.mode === MODE_PLAY ? Math.sin(stall.time * 10) * 4 : 0;
  const bob = stall.mode === MODE_PLAY ? Math.sin(stall.time * 8) * 2 : 0;
  ctx.save(); // push chef state
  ctx.translate(chef.x, chef.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath(); // start the deep shadow
  ctx.ellipse(2, 34, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill(); // paint the shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); // start the soft shadow
  ctx.ellipse(-4, 30, 34, 12, 0, 0, Math.PI * 2);
  ctx.fill(); // paint the soft edge
  ctx.fillStyle = '#2e2a26';
  ctx.beginPath(); // start the shoes
  ctx.ellipse(-10, 28, 7, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(10, 28, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill(); // paint the shoes
  ctx.fillStyle = '#fbf3dd';
  ctx.beginPath(); // start the apron
  ctx.arc(0, 10, 24, 0, Math.PI * 2);
  ctx.fill(); // paint the apron
  ctx.fillStyle = '#2e6f6a';
  ctx.beginPath(); // start the shirt
  ctx.arc(0, 16, 24, 0, Math.PI);
  ctx.fill(); // paint the shirt
  ctx.fillStyle = '#e4572e';
  ctx.beginPath(); // start the scarf
  ctx.moveTo(-8, -2);
  ctx.lineTo(8, -2);
  ctx.lineTo(0, 8);
  ctx.closePath(); // seal the scarf
  ctx.fill(); // paint the scarf
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); // start the hands
  ctx.arc(-24, 12 + swing, 6, 0, Math.PI * 2);
  ctx.arc(24, 12 - swing, 6, 0, Math.PI * 2);
  ctx.fill(); // paint the hands
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); // start the head
  ctx.arc(0, -16, 18, 0, Math.PI * 2);
  ctx.fill(); // paint the head
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath(); // start the hat
  ctx.arc(-8, -30, 11, 0, Math.PI * 2);
  ctx.arc(8, -30, 11, 0, Math.PI * 2);
  ctx.arc(0, -35, 12, 0, Math.PI * 2);
  ctx.fill(); // paint the hat
  ctx.fillRect(-15, -30, 30, 8);
  ctx.fillStyle = '#1d3230';
  ctx.beginPath(); // start the eyes
  ctx.arc(-6 * chef.face, -16, 2.4, 0, Math.PI * 2);
  ctx.arc(6 * chef.face, -16, 2.4, 0, Math.PI * 2);
  ctx.fill(); // paint the eyes
  ctx.strokeStyle = '#1d3230';
  ctx.lineWidth = 2;
  ctx.beginPath(); // start the smile
  ctx.arc(0, -9, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke(); // paint the smile
  if (chef.carry) {
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath(); // start the tray
    ctx.arc(0, -62, 21, 0, Math.PI * 2);
    ctx.fill(); // paint the tray
    ctx.strokeStyle = '#d9c9a0';
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the tray rim
    ctx.arc(0, -62, 21, 0, Math.PI * 2);
    ctx.stroke(); // paint the rim
    if (chef.carry.type === 'piece') {
      drawPiece(ctx, chef.carry.piece, 0, -62, 28);
    } else if (chef.carry.type === 'drink') {
      drawDrink(ctx, chef.carry.drink, 0, -62, 30);
    } else {
      chef.carry.pieces.forEach((piece, i) => {
        const angle = (i / Math.max(1, chef.carry.pieces.length)) * Math.PI * 2 - Math.PI / 2;
        drawPiece(ctx, piece, Math.cos(angle) * 10, -62 + Math.sin(angle) * 10, 15);
      });
    }
  }
  ctx.restore(); // pop chef state
}; // the cook, bigger and livelier

const drawTicket = (ctx, ticket, x, y) => {
  const urgent = ticket.patience / ticket.maxPatience < 0.25;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, x + 3, y + 5, TICKET.w, TICKET.h, 10);
  ctx.fill(); // paint the ticket shadow
  ctx.save(); // push ticket state
  if (urgent && Math.floor(ticket.patience * 4) % 2 === 0) {
    ctx.shadowColor = '#e4572e';
    ctx.shadowBlur = 12;
  }
  ctx.fillStyle = ticket.vip ? '#ffe9a8' : PALETTE.board;
  roundRect(ctx, x, y, TICKET.w, TICKET.h, 10);
  ctx.fill(); // paint the ticket
  ctx.restore(); // pop ticket state
  if (ticket.vip) {
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 3;
    roundRect(ctx, x + 1.5, y + 1.5, TICKET.w - 3, TICKET.h - 3, 9);
    ctx.stroke(); // outline the VIP ticket
    ctx.fillStyle = '#c9a24a';
    roundRect(ctx, x + TICKET.w - 52, y + 6, 42, 16, 8);
    ctx.fill(); // paint the VIP tag
    label(ctx, 'VIP', x + TICKET.w - 31, y + 14, 11, '#3a2a18', 'bold', 'center');
  }
  ctx.fillStyle = '#c9a24a';
  ctx.fillRect(x + 10, y + 8, 4, TICKET.h - 16);
  label(ctx, ticket.dish.name, x + 24, y + 18, 17, PALETTE.boardInk, 'bold');
  label(ctx, `$${ticket.coins}`, x + TICKET.w - (ticket.vip ? 58 : 12), y + 18, 16, '#9c5518', 'bold', 'right');
  ticket.dish.pieces.forEach((piece, i) => {
    const ix = x + 40 + i * 34;
    ctx.fillStyle = '#e8d5a8';
    ctx.beginPath(); // start the piece chip
    ctx.arc(ix, y + 46, 14, 0, Math.PI * 2);
    ctx.fill(); // paint the chip
    drawPiece(ctx, piece, ix, y + 46, 24);
  });
  if (ticket.drink) {
    const dx = x + 40 + ticket.dish.pieces.length * 34;
    const spec = DRINKS[ticket.drink];
    if (ticket.drinkServed) {
      ctx.save(); // push served-drink state
      ctx.globalAlpha = 0.45;
      drawDrink(ctx, ticket.drink, dx, y + 46, 24);
      ctx.restore(); // pop served-drink state
      ctx.strokeStyle = '#3e7d32';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath(); // start the served check
      ctx.moveTo(dx - 7, y + 46);
      ctx.lineTo(dx - 2, y + 51);
      ctx.lineTo(dx + 8, y + 40);
      ctx.stroke(); // paint the check
    } else {
      drawDrink(ctx, ticket.drink, dx, y + 46, 24);
      label(ctx, `+$${spec.coins}`, dx + 16, y + 46, 12, '#9c5518', 'bold', 'left');
    }
  }
  const fraction = Math.max(0, ticket.patience / ticket.maxPatience);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  roundRect(ctx, x + 24, y + TICKET.h - 14, TICKET.w - 48, 7, 3);
  ctx.fill(); // paint the patience track
  ctx.fillStyle = patienceTone(fraction);
  roundRect(ctx, x + 24, y + TICKET.h - 14, (TICKET.w - 48) * fraction, 7, 3);
  ctx.fill(); // paint the patience fill
}; // one ticket on the board

const drawBoard = (ctx, stall) => {
  const { x, y, w, h } = BOARD;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  roundRect(ctx, x + 4, y + 6, w, h, 12);
  ctx.fill(); // paint the board shadow
  ctx.fillStyle = 'rgba(23,34,31,0.85)';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill(); // paint the board
  label(ctx, 'ORDERS', x + 14, y + h / 2, 15, PALETTE.gold, 'bold');
  stall.tickets.forEach((ticket, i) => {
    drawTicket(ctx, ticket, x + 96 + i * (TICKET.w + TICKET.gap), y + 4);
  });
  if (stall.tickets.length === 0) {
    label(ctx, 'No orders yet — the first ticket is coming…', x + 110, y + h / 2, 15, '#fbf3dd', 'normal');
  }
}; // the order board

const drawHud = (ctx, stall, best) => {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, VIEW_WIDTH, 56);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, 54, VIEW_WIDTH, 2);
  label(ctx, 'LADLE & EMBER', 18, 29, 21, PALETTE.gold, 'bold');
  label(ctx, 'noodle stall', 196, 31, 13, '#c9d4c9', 'normal');

  const remain = Math.max(0, SHIFT_LENGTH - stall.time);
  const mins = Math.floor(remain / 60);
  const secs = Math.floor(remain % 60);
  const low = remain <= 30 && stall.mode === MODE_PLAY;
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  if (low && Math.floor(stall.time * 2) % 2 === 0) {
    label(ctx, clock, VIEW_WIDTH / 2, 26, 30, '#e4572e', 'bold', 'center');
  } else {
    label(ctx, clock, VIEW_WIDTH / 2, 26, 30, '#fbf3dd', 'bold', 'center');
  }
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx, VIEW_WIDTH / 2 - 110, 44, 220, 6, 3);
  ctx.fill(); // paint the clock track
  ctx.fillStyle = low ? '#e4572e' : '#7bc950';
  roundRect(ctx, VIEW_WIDTH / 2 - 110, 44, 220 * (remain / SHIFT_LENGTH), 6, 3);
  ctx.fill(); // paint the clock fill

  const phaseColour = stall.phase === 'dinner' ? '#f2b544' : '#c9d4c9';
  label(ctx, `◆ ${stall.phaseLabel}`, VIEW_WIDTH / 2 - 190, 28, 15, phaseColour, 'bold', 'right');

  for (let i = 0; i < 3; i += 1) {
    drawHeart(ctx, VIEW_WIDTH - 480 + i * 26, 28, 20, i < stall.hearts);
  }
  label(ctx, `SCORE ${stall.score}`, VIEW_WIDTH - 280, 28, 16, '#fbf3dd', 'bold', 'right');
  label(ctx, `DRINKS ${stall.drinksServed}`, VIEW_WIDTH - 280, 48, 13, '#e8a94e', 'bold', 'right');
  label(ctx, `$${stall.coins}`, VIEW_WIDTH - 150, 28, 16, PALETTE.gold, 'bold', 'right');
  label(ctx, `BEST ${best}`, VIEW_WIDTH - 18, 28, 13, '#c9d4c9', 'normal', 'right');
  if (stall.streak >= 2) {
    label(ctx, `COMBO x${stall.streak}`, VIEW_WIDTH - 18, 48, 13, '#7bc950', 'bold', 'right');
  }
}; // the top bar: title, clock, phase, hearts, score

const drawRug = (ctx) => {
  ctx.fillStyle = '#8a2f24';
  roundRect(ctx, 430, 360, 380, 150, 14);
  ctx.fill(); // paint the rug
  ctx.strokeStyle = '#e8a94e';
  ctx.lineWidth = 4;
  roundRect(ctx, 442, 372, 356, 126, 10);
  ctx.stroke(); // outline the rug
  ctx.strokeStyle = 'rgba(232,169,78,0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath(); // start a rug ring
    ctx.arc(620, 435, 18 + i * 11, 0, Math.PI * 2);
    ctx.stroke(); // paint the ring
  }
}; // the rug in the middle of the floor

const drawPlant = (ctx, x, y) => {
  ctx.fillStyle = '#b4552d';
  ctx.beginPath(); // start the pot
  ctx.moveTo(x - 16, y);
  ctx.lineTo(x + 16, y);
  ctx.lineTo(x + 11, y + 22);
  ctx.lineTo(x - 11, y + 22);
  ctx.closePath(); // seal the pot
  ctx.fill(); // paint the pot
  ctx.fillStyle = '#69b455';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save(); // push leaf state
    ctx.translate(x, y - 4);
    ctx.rotate(i * 0.42);
    ctx.beginPath(); // start a leaf
    ctx.ellipse(0, -20, 7, 22, 0, 0, Math.PI * 2);
    ctx.fill(); // paint the leaf
    ctx.restore(); // pop leaf state
  }
  ctx.fillStyle = '#8ed06a';
  ctx.beginPath(); // start the light leaf
  ctx.ellipse(x - 8, y - 22, 4, 10, -0.5, 0, Math.PI * 2);
  ctx.fill(); // paint it
}; // a potted plant

const drawLamp = (ctx, x, time) => {
  const glow = 0.5 + 0.12 * Math.sin(time * 2 + x);
  ctx.strokeStyle = '#1d3230';
  ctx.lineWidth = 3;
  ctx.beginPath(); // start the cord
  ctx.moveTo(x, 156);
  ctx.lineTo(x, 196);
  ctx.stroke(); // paint the cord
  ctx.save(); // push glow state
  ctx.globalAlpha = 0.1 * glow + 0.06;
  ctx.fillStyle = '#f2b544';
  ctx.beginPath(); // start the outer glow
  ctx.arc(x, 210, 86, 0, Math.PI * 2);
  ctx.fill(); // paint the outer glow
  ctx.globalAlpha = 0.16 * glow + 0.1;
  ctx.beginPath(); // start the inner glow
  ctx.arc(x, 210, 52, 0, Math.PI * 2);
  ctx.fill(); // paint the inner glow
  ctx.restore(); // pop glow state
  ctx.fillStyle = '#c98a3d';
  ctx.beginPath(); // start the shade
  ctx.moveTo(x - 20, 196);
  ctx.lineTo(x + 20, 196);
  ctx.lineTo(x + 12, 214);
  ctx.lineTo(x - 12, 214);
  ctx.closePath(); // seal the shade
  ctx.fill(); // paint the shade
  ctx.fillStyle = '#ffd968';
  ctx.beginPath(); // start the bulb
  ctx.arc(x, 214, 8, 0, Math.PI * 2);
  ctx.fill(); // paint the bulb
  const pool = ctx.createRadialGradient(x, 310, 6, x, 310, 110);
  pool.addColorStop(0, 'rgba(242,181,68,0.12)');
  pool.addColorStop(1, 'rgba(242,181,68,0)');
  ctx.fillStyle = pool;
  ctx.beginPath(); // start the light pool
  ctx.ellipse(x, 310, 110, 26, 0, 0, Math.PI * 2);
  ctx.fill(); // paint the pool
}; // one hanging lantern, with a pool of light below

const drawFloor = (ctx, time) => {
  for (let row = 0; row < 12; row += 1) {
    const y = 156 + row * 46;
    ctx.fillStyle = row % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
    ctx.fillRect(8, y, 1264, 46);
    ctx.strokeStyle = PALETTE.plankLine;
    ctx.lineWidth = 2;
    ctx.beginPath(); // start the plank line
    ctx.moveTo(8, y);
    ctx.lineTo(1272, y);
    ctx.stroke(); // paint the line
    for (let s = 0; s < 3; s += 1) {
      const sx = 120 + ((row * 397 + s * 433) % 1100);
      ctx.beginPath(); // start a plank seam
      ctx.moveTo(sx, y + 4);
      ctx.lineTo(sx, y + 42);
      ctx.stroke(); // paint the seam
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); // start the grain wave
    ctx.moveTo(20, y + 22 + (row % 3) * 6);
    ctx.quadraticCurveTo(400, y + 16 + (row % 3) * 6, 900, y + 26);
    ctx.stroke(); // paint the grain
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    for (let g = 0; g < 4; g += 1) {
      const gx = 60 + ((row * 211 + g * 307) % 1150);
      ctx.beginPath(); // start a grain fleck
      ctx.moveTo(gx, y + 8 + g * 7);
      ctx.lineTo(gx + 26, y + 10 + g * 7);
      ctx.stroke(); // paint the fleck
    }
  }
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 148, VIEW_WIDTH, 10);
  for (let i = 0; i < 9; i += 1) {
    const lx = 60 + i * 140;
    ctx.fillStyle = i % 2 === 0 ? '#e4572e' : '#f2b544';
    ctx.beginPath(); // start a string bulb
    ctx.arc(lx, 150, 7, 0, Math.PI * 2);
    ctx.fill(); // paint the bulb
    ctx.fillStyle = '#fbf3dd';
    ctx.fillRect(lx - 1, 138, 2, 6);
  }
  drawRug(ctx);
  drawPlant(ctx, 300, 210);
  drawPlant(ctx, 980, 210);
  drawPlant(ctx, 280, 588);
  drawLamp(ctx, 380, time);
  drawLamp(ctx, 640, time);
  drawLamp(ctx, 900, time);
}; // the floor: warm planks, rug, plants, lanterns

// A soft dark edge around the frame, painted late so the kitchen feels
// lit from the middle and the corners fall away.
const drawVignette = (ctx) => {
  const shade = ctx.createRadialGradient(640, 360, 380, 640, 360, 780);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.16)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}; // the vignette

const drawOverlay = (ctx, title, lines, accent) => {
  ctx.fillStyle = 'rgba(12,20,18,0.72)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  label(ctx, title, VIEW_WIDTH / 2, 250, 54, accent ?? PALETTE.gold, 'bold', 'center');
  lines.forEach((line, i) => {
    label(ctx, line, VIEW_WIDTH / 2, 320 + i * 34, 20, '#fbf3dd', 'normal', 'center');
  });
}; // a full-screen message

export const paintStall = (ctx, stall, best) => {
  ctx.save(); // push frame state
  if (stall.shake > 0) {
    const mag = stall.shake * 14;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawFloor(ctx, stall.time);
  drawHud(ctx, stall, best);
  drawBoard(ctx, stall);
  for (const station of stall.stations) {
    drawStation(ctx, stall, station);
  }
  for (const part of stall.particles) {
    ctx.globalAlpha = Math.max(0, part.life / part.max);
    ctx.fillStyle = part.colour;
    ctx.beginPath(); // start a spark
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
    ctx.fill(); // paint the spark
  }
  ctx.globalAlpha = 1;
  drawChef(ctx, stall);
  for (const floater of stall.floaters) {
    ctx.globalAlpha = Math.max(0, floater.life / floater.max);
    label(ctx, floater.text, floater.x, floater.y, 20, floater.colour, 'bold', 'center');
  }
  ctx.globalAlpha = 1;
  drawVignette(ctx);

  const phaseBanner = stall.phaseBannerUntil > stall.time && stall.mode === MODE_PLAY;
  if (phaseBanner) {
    const pulse = 1 + Math.sin(stall.time * 8) * 0.04;
    ctx.save(); // push banner state
    ctx.translate(VIEW_WIDTH / 2, 168);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = 'rgba(201,138,61,0.95)';
    roundRect(ctx, -190, -20, 380, 40, 20);
    ctx.fill(); // paint the banner
    label(ctx, stall.phaseLabel, 0, 1, 22, '#fbf3dd', 'bold', 'center');
    ctx.restore(); // pop banner state
  }
  if (stall.rushUntil > stall.time && stall.mode === MODE_PLAY) {
    const pulse = 1 + Math.sin(stall.time * 8) * 0.04;
    ctx.save(); // push rush state
    ctx.translate(VIEW_WIDTH / 2, phaseBanner ? 216 : 168);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = 'rgba(228,87,46,0.92)';
    roundRect(ctx, -110, -20, 220, 40, 20);
    ctx.fill(); // paint the rush pill
    label(ctx, 'RUSH HOUR!', 0, 1, 22, '#fbf3dd', 'bold', 'center');
    ctx.restore(); // pop rush state
  }

  if (stall.mode === MODE_TITLE) {
    drawOverlay(ctx, 'LADLE & EMBER', [
      'Run the night-market noodle stall. Take orders, boil, chop, sear — and serve before the ticket walks.',
      'Move with WASD or arrows — or click a counter to walk there. Press E to grab, cook, plate and serve.',
      'Five dishes on the menu. Match a plate to its ticket exactly, and serve it at the window.',
      'From lunch on, some tickets want a cold drink too — pour it at the drinks shelf, carry it to the window.',
      'From the dinner rush on, gold VIP tickets pay double — and the Golden Laksa joins the menu.',
      'Press ENTER or click to start the shift.  P pauses.  M mutes.',
    ], PALETTE.gold);
    label(ctx, `Best score: ${best}`, VIEW_WIDTH / 2, 500, 18, '#c9d4c9', 'normal', 'center');
  } else if (stall.mode === MODE_PAUSED) {
    drawOverlay(ctx, 'PAUSED', ['Take a breath. The noodles will wait.', 'Press P to carry on.']);
  } else if (stall.mode === MODE_OVER) {
    drawOverlay(ctx, 'THE CROWD WALKED OUT', [
      `The shift ended early. Score ${stall.score} — ${stall.served} dishes served, ${stall.lost} orders lost.`,
      'Press R to open the stall again.',
    ], '#e4572e');
  } else if (stall.mode === MODE_DONE) {
    drawOverlay(ctx, 'SHIFT COMPLETE!', [
      `Score ${stall.score}  •  $${stall.coins} earned  •  ${stall.served} dishes served  •  Best ${best}`,
      'Press R to run another shift.',
    ], '#7bc950');
  }
  ctx.restore(); // pop frame state
}; // one frame of the stall
