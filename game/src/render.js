// Every pixel of the stall. The painter takes the stall state and draws one
// frame: the kitchen floor, every counter, the cook, the order board, the
// timer and the floating feedback. It never changes the state.

import {
  BOARD,
  INGREDIENTS,
  PALETTE,
  SHIFT_LENGTH,
  TICKET,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  patienceTone,
} from './config.js';
import { MODE_DONE, MODE_OVER, MODE_PAUSED, MODE_PLAY, MODE_TITLE, dishById } from './kitchen.js';

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, colour, weight, align) {
  ctx.fillStyle = colour;
  ctx.font = `${weight ?? 'bold'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function heart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -3, -5, -10, 0, -5);
  ctx.bezierCurveTo(5, -10, 9, -3, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e4572e' : '#5a3a32';
  ctx.fill();
  ctx.restore();
}

// One recognisable drawing of each ingredient, centred on (x, y).
export function paintPiece(ctx, piece, x, y, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (piece === 'noodle') {
    ctx.fillStyle = '#f4d58d';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(i * s * 0.4, 0, s * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, -s * 0.2);
    ctx.quadraticCurveTo(0, -s * 0.7, s * 0.8, -s * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, s * 0.35, s * 0.62, 0, Math.PI);
    ctx.fillStyle = '#e8b4b8';
    ctx.fill();
  } else if (piece === 'chicken') {
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(-s * 0.15, s * 0.1, s * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b98a2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-s * 0.15, s * 0.1, s * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fdf6d8';
    ctx.lineWidth = s * 0.28;
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.3);
    ctx.lineTo(s * 0.85, -s * 0.8);
    ctx.stroke();
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.arc(s * 0.85, -s * 0.8, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (piece === 'beef') {
    ctx.fillStyle = '#a34d2d';
    rounded(ctx, -s * 0.85, -s * 0.55, s * 1.7, s * 1.1, s * 0.4);
    ctx.fill();
    ctx.strokeStyle = '#6e2f1a';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.5 + i * s * 0.5, -s * 0.45);
      ctx.lineTo(-s * 0.2 + i * s * 0.5, s * 0.45);
      ctx.stroke();
    }
  } else if (piece === 'egg') {
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.85, s * 0.7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0b429';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.05, s * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (piece === 'chili') {
    ctx.strokeStyle = '#d9381e';
    ctx.lineWidth = s * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.7, Math.PI * 0.15, Math.PI * 0.95);
    ctx.stroke();
    ctx.strokeStyle = '#3e7d32';
    ctx.lineWidth = s * 0.22;
    ctx.beginPath();
    ctx.moveTo(-s * 0.62, -s * 0.62);
    ctx.lineTo(-s * 0.85, -s * 0.95);
    ctx.stroke();
  } else if (piece === 'herbs') {
    ctx.fillStyle = '#69b455';
    for (let i = -1; i <= 1; i += 1) {
      ctx.save();
      ctx.rotate(i * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.45, s * 0.28, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#3e7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.2);
    ctx.lineTo(0, s * 0.85);
    ctx.stroke();
  } else if (piece === 'broth') {
    ctx.fillStyle = '#d97b2b';
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.7, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fbf3dd';
    ctx.fillRect(-s * 0.75, -s * 0.15, s * 1.5, s * 0.18);
    ctx.strokeStyle = 'rgba(251,243,221,0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.5);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.9, -s * 0.3, -s * 1.1);
    ctx.moveTo(s * 0.25, -s * 0.5);
    ctx.quadraticCurveTo(s * 0.45, -s * 0.9, s * 0.25, -s * 1.1);
    ctx.stroke();
  }
  ctx.restore();
}

function paintCounterShell(ctx, rect, topColour) {
  const [x, y, w, h] = rect;
  ctx.fillStyle = PALETTE.counterFront;
  rounded(ctx, x, y + 8, w, h - 8, 8);
  ctx.fill();
  ctx.fillStyle = topColour;
  rounded(ctx, x - 2, y, w + 4, 18, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = 1; i < 3; i += 1) {
    ctx.fillRect(x + 8, y + 8 + ((h - 16) * i) / 3, w - 16, 2);
  }
}

// A cooking timer as a bar across the station's top, with its label in a
// cream pill pinned to the bottom inside the station, clear of the label
// that hangs in the gap above it.
function paintStationProgress(ctx, station, fraction, label) {
  const [x, y, w, h] = station.rect;
  const cx = x + w / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  rounded(ctx, x + 10, y + 8, w - 20, 8, 4);
  ctx.fill();
  ctx.fillStyle = '#f2b544';
  rounded(ctx, x + 10, y + 8, (w - 20) * Math.min(1, fraction), 8, 4);
  ctx.fill();
  const pillW = 18 + label.length * 7.5;
  ctx.fillStyle = '#fbf3dd';
  rounded(ctx, cx - pillW / 2, y + h - 24, pillW, 18, 9);
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  rounded(ctx, cx - pillW / 2, y + h - 24, pillW, 18, 9);
  ctx.stroke();
  text(ctx, label, cx, y + h - 14, 12, '#3a2a18', 'bold', 'center');
}

// A green READY pill in the same spot at the station's bottom.
function paintReadyPill(ctx, station) {
  const [x, y, w, h] = station.rect;
  const cx = x + w / 2;
  ctx.fillStyle = '#7bc950';
  rounded(ctx, cx - 31, y + h - 24, 62, 18, 9);
  ctx.fill();
  ctx.strokeStyle = '#17221f';
  ctx.lineWidth = 2;
  rounded(ctx, cx - 31, y + h - 24, 62, 18, 9);
  ctx.stroke();
  text(ctx, 'READY', cx, y + h - 14, 12, '#17221f', 'bold', 'center');
}

function paintStation(ctx, stall, station) {
  const [x, y, w, h] = station.rect;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const time = stall.time;

  if (station.kind === 'bin') {
    paintCounterShell(ctx, station.rect, PALETTE.counterTop);
    paintPiece(ctx, station.stock, cx, cy - 4, 30);
    text(ctx, station.label, cx, y + h - 8, 12, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'ladle') {
    ctx.fillStyle = '#3a2a18';
    rounded(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#d97b2b';
    rounded(ctx, x + 10, y + 12, w - 20, h - 26, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(251,243,221,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 6);
    ctx.quadraticCurveTo(x + 10, y - 8, x + 22, y - 18);
    ctx.moveTo(x + w - 22, y + 6);
    ctx.quadraticCurveTo(x + w - 10, y - 8, x + w - 22, y - 18);
    ctx.stroke();
    text(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'pot') {
    ctx.fillStyle = '#20262b';
    rounded(ctx, x, y + 14, w, h - 14, 12);
    ctx.fill();
    ctx.fillStyle = '#d97b2b';
    ctx.beginPath();
    ctx.ellipse(cx, y + 20, w / 2 - 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i += 1) {
      const bx = cx - 50 + i * 50 + Math.sin(time * 2 + i * 2) * 6;
      ctx.fillStyle = '#f0b429';
      ctx.beginPath();
      ctx.arc(bx, y + 18 + Math.cos(time * 3 + i) * 2, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (station.job) {
      paintStationProgress(ctx, station, station.job.done / station.job.total, 'Boiling…');
    } else if (station.ready) {
      paintPiece(ctx, station.ready, cx, y + 20, 26);
      paintReadyPill(ctx, station);
    }
    text(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'board') {
    ctx.fillStyle = '#c9a24a';
    rounded(ctx, x + 6, y + 10, w - 12, h - 20, 8);
    ctx.fill();
    ctx.strokeStyle = '#8a6a2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 14, y + 18, w - 28, h - 36);
    if (station.job) {
      paintPiece(ctx, station.job.piece, cx - 24, cy, 30);
      ctx.save();
      ctx.translate(cx + 44, cy - 8);
      ctx.rotate(Math.sin(time * 14) * 0.35 - 0.5);
      ctx.fillStyle = '#dfe3e6';
      ctx.fillRect(-4, -22, 8, 34);
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(-4, 12, 8, 14);
      ctx.restore();
      paintStationProgress(ctx, station, station.job.done / station.job.total, 'Chopping…');
    } else if (station.ready) {
      paintPiece(ctx, station.ready, cx, cy, 32);
      paintReadyPill(ctx, station);
    } else {
      ctx.save();
      ctx.translate(cx + 44, cy - 8);
      ctx.rotate(-0.5);
      ctx.fillStyle = '#dfe3e6';
      ctx.fillRect(-4, -22, 8, 34);
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(-4, 12, 8, 14);
      ctx.restore();
    }
    text(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'grill') {
    ctx.fillStyle = '#26221f';
    rounded(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = station.job ? '#e4572e' : '#4a3a30';
    for (let i = 0; i < 4; i += 1) {
      const gy = y + 16 + i * 18;
      ctx.beginPath();
      ctx.moveTo(x + 14, gy);
      ctx.quadraticCurveTo(cx, gy - 10, x + w - 14, gy);
      ctx.lineWidth = 5;
      ctx.strokeStyle = station.job ? `rgba(228,87,46,${0.5 + 0.3 * Math.sin(time * 6 + i)})` : '#5a4636';
      ctx.stroke();
    }
    ctx.strokeStyle = '#8a7a68';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 16 + i * ((w - 32) / 4), y + 8);
      ctx.lineTo(x + 16 + i * ((w - 32) / 4), y + h - 8);
      ctx.stroke();
    }
    if (station.job) {
      paintPiece(ctx, station.job.piece, cx, cy, 30);
      paintStationProgress(ctx, station, station.job.done / station.job.total, 'Searing…');
    } else if (station.ready) {
      paintPiece(ctx, station.ready, cx, cy, 32);
      paintReadyPill(ctx, station);
    }
    text(ctx, station.label, cx, y + h + 12, 13, '#fbf3dd', 'bold', 'center');
    return;
  }
  if (station.kind === 'plate') {
    ctx.fillStyle = '#3a2a18';
    rounded(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9c9a0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 26, 0, Math.PI * 2);
    ctx.stroke();
    station.pieces.forEach((piece, i) => {
      const angle = (i / Math.max(1, station.pieces.length)) * Math.PI * 2 - Math.PI / 2;
      paintPiece(ctx, piece, cx + Math.cos(angle) * 14, cy + 2 + Math.sin(angle) * 14, 20);
    });
    text(ctx, station.label, x + 16, y - 8, 13, '#fbf3dd', 'bold', 'left');
    return;
  }
  if (station.kind === 'window') {
    ctx.fillStyle = '#c98a3d';
    rounded(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#f6e8c8';
    rounded(ctx, x + 10, y + 10, w - 20, h - 20, 8);
    ctx.fill();
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.arc(cx - 60, cy, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - 76, cy - 4, 32, 6);
    text(ctx, 'SERVE', cx + 30, cy, 26, '#3a2a18', 'bold', 'center');
    text(ctx, 'pick up a finished plate, bring it here', cx + 30, cy + 26, 12, '#6e4525', 'normal', 'center');
    return;
  }
  if (station.kind === 'trash') {
    ctx.fillStyle = '#3f4a44';
    rounded(ctx, x + 10, y + 8, w - 20, h - 16, 8);
    ctx.fill();
    ctx.fillStyle = '#2c3430';
    rounded(ctx, x + 4, y, w - 8, 14, 7);
    ctx.fill();
    text(ctx, station.label, x + 16, y - 8, 13, '#fbf3dd', 'bold', 'left');
  }
}

function paintChef(ctx, stall) {
  const chef = stall.chef;
  const bob = stall.mode === MODE_PLAY ? Math.sin(stall.time * 8) * 1.5 : 0;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 24, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbf3dd';
  ctx.beginPath();
  ctx.arc(0, 8, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e6f6a';
  ctx.beginPath();
  ctx.arc(0, 12, 17, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.arc(0, -12, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(-6, -22, 8, 0, Math.PI * 2);
  ctx.arc(6, -22, 8, 0, Math.PI * 2);
  ctx.arc(0, -26, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-11, -22, 22, 6);
  ctx.fillStyle = '#1d3230';
  ctx.beginPath();
  ctx.arc(-4.5 * chef.face, -12, 1.8, 0, Math.PI * 2);
  ctx.arc(4.5 * chef.face, -12, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1d3230';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -7, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (chef.carry) {
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.arc(0, -46, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9c9a0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -46, 17, 0, Math.PI * 2);
    ctx.stroke();
    if (chef.carry.type === 'piece') {
      paintPiece(ctx, chef.carry.piece, 0, -46, 24);
    } else {
      chef.carry.pieces.forEach((piece, i) => {
        const angle = (i / Math.max(1, chef.carry.pieces.length)) * Math.PI * 2 - Math.PI / 2;
        paintPiece(ctx, piece, Math.cos(angle) * 8, -46 + Math.sin(angle) * 8, 13);
      });
    }
  }
  ctx.restore();
}

function paintTicket(ctx, ticket, x, y) {
  const urgent = ticket.patience / ticket.maxPatience < 0.25;
  ctx.save();
  if (urgent && Math.floor(ticket.patience * 4) % 2 === 0) {
    ctx.shadowColor = '#e4572e';
    ctx.shadowBlur = 12;
  }
  ctx.fillStyle = PALETTE.board;
  rounded(ctx, x, y, TICKET.w, TICKET.h, 10);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#c9a24a';
  ctx.fillRect(x + 10, y + 8, 4, TICKET.h - 16);
  text(ctx, ticket.dish.name, x + 24, y + 18, 17, PALETTE.boardInk, 'bold');
  text(ctx, `$${ticket.coins}`, x + TICKET.w - 12, y + 18, 16, '#9c5518', 'bold', 'right');
  ticket.dish.pieces.forEach((piece, i) => {
    const ix = x + 40 + i * 34;
    ctx.fillStyle = '#e8d5a8';
    ctx.beginPath();
    ctx.arc(ix, y + 46, 14, 0, Math.PI * 2);
    ctx.fill();
    paintPiece(ctx, piece, ix, y + 46, 24);
  });
  const fraction = Math.max(0, ticket.patience / ticket.maxPatience);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  rounded(ctx, x + 24, y + TICKET.h - 14, TICKET.w - 48, 7, 3);
  ctx.fill();
  ctx.fillStyle = patienceTone(fraction);
  rounded(ctx, x + 24, y + TICKET.h - 14, (TICKET.w - 48) * fraction, 7, 3);
  ctx.fill();
}

function paintBoard(ctx, stall) {
  const { x, y, w, h } = BOARD;
  ctx.fillStyle = 'rgba(23,34,31,0.85)';
  rounded(ctx, x, y, w, h, 12);
  ctx.fill();
  text(ctx, 'ORDERS', x + 14, y + h / 2, 15, PALETTE.gold, 'bold');
  stall.tickets.forEach((ticket, i) => {
    paintTicket(ctx, ticket, x + 96 + i * (TICKET.w + TICKET.gap), y + 4);
  });
  if (stall.tickets.length === 0) {
    text(ctx, 'No orders yet — the first ticket is coming…', x + 110, y + h / 2, 15, '#fbf3dd', 'normal');
  }
}

function paintHud(ctx, stall, best) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, VIEW_WIDTH, 56);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, 54, VIEW_WIDTH, 2);
  text(ctx, 'LADLE & EMBER', 18, 29, 21, PALETTE.gold, 'bold');
  text(ctx, 'night-market noodle stall', 196, 31, 13, '#c9d4c9', 'normal');

  const remain = Math.max(0, SHIFT_LENGTH - stall.time);
  const mins = Math.floor(remain / 60);
  const secs = Math.floor(remain % 60);
  const low = remain <= 30 && stall.mode === MODE_PLAY;
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  if (low && Math.floor(stall.time * 2) % 2 === 0) {
    text(ctx, clock, VIEW_WIDTH / 2, 26, 30, '#e4572e', 'bold', 'center');
  } else {
    text(ctx, clock, VIEW_WIDTH / 2, 26, 30, '#fbf3dd', 'bold', 'center');
  }
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  rounded(ctx, VIEW_WIDTH / 2 - 110, 44, 220, 6, 3);
  ctx.fill();
  ctx.fillStyle = low ? '#e4572e' : '#7bc950';
  rounded(ctx, VIEW_WIDTH / 2 - 110, 44, 220 * (remain / SHIFT_LENGTH), 6, 3);
  ctx.fill();

  for (let i = 0; i < 3; i += 1) {
    heart(ctx, VIEW_WIDTH - 480 + i * 26, 28, 20, i < stall.hearts);
  }
  text(ctx, `SCORE ${stall.score}`, VIEW_WIDTH - 280, 28, 16, '#fbf3dd', 'bold', 'right');
  text(ctx, `$${stall.coins}`, VIEW_WIDTH - 150, 28, 16, PALETTE.gold, 'bold', 'right');
  text(ctx, `BEST ${best}`, VIEW_WIDTH - 18, 28, 13, '#c9d4c9', 'normal', 'right');
  if (stall.streak >= 2) {
    text(ctx, `COMBO x${stall.streak}`, VIEW_WIDTH - 18, 48, 13, '#7bc950', 'bold', 'right');
  }
}

function paintFloor(ctx) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 20; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(8 + col * 63, 156 + row * 62, 63, 62);
    }
  }
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 148, VIEW_WIDTH, 10);
  for (let i = 0; i < 9; i += 1) {
    const lx = 60 + i * 140;
    ctx.fillStyle = i % 2 === 0 ? '#e4572e' : '#f2b544';
    ctx.beginPath();
    ctx.arc(lx, 150, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbf3dd';
    ctx.fillRect(lx - 1, 138, 2, 6);
  }
}

function paintOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(12,20,18,0.72)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  text(ctx, title, VIEW_WIDTH / 2, 250, 54, accent ?? PALETTE.gold, 'bold', 'center');
  lines.forEach((line, i) => {
    text(ctx, line, VIEW_WIDTH / 2, 320 + i * 34, 20, '#fbf3dd', 'normal', 'center');
  });
}

export function paintStall(ctx, stall, best) {
  ctx.save();
  if (stall.shake > 0) {
    const mag = stall.shake * 14;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  paintFloor(ctx);
  paintHud(ctx, stall, best);
  paintBoard(ctx, stall);
  for (const station of stall.stations) paintStation(ctx, stall, station);
  for (const part of stall.particles) {
    ctx.globalAlpha = Math.max(0, part.life / part.max);
    ctx.fillStyle = part.colour;
    ctx.beginPath();
    ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  paintChef(ctx, stall);
  for (const floater of stall.floaters) {
    ctx.globalAlpha = Math.max(0, floater.life / floater.max);
    text(ctx, floater.text, floater.x, floater.y, 20, floater.colour, 'bold', 'center');
  }
  ctx.globalAlpha = 1;

  if (stall.rushUntil > stall.time && stall.mode === MODE_PLAY) {
    const pulse = 1 + Math.sin(stall.time * 8) * 0.04;
    ctx.save();
    ctx.translate(VIEW_WIDTH / 2, 168);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = 'rgba(228,87,46,0.92)';
    rounded(ctx, -110, -20, 220, 40, 20);
    ctx.fill();
    text(ctx, 'RUSH HOUR!', 0, 1, 22, '#fbf3dd', 'bold', 'center');
    ctx.restore();
  }

  if (stall.mode === MODE_TITLE) {
    paintOverlay(ctx, 'LADLE & EMBER', [
      'Run the night-market noodle stall. Take orders, boil, chop, sear — and serve before the ticket walks.',
      'Move with WASD or arrows — or click a counter to walk there. Press E to grab, cook, plate and serve.',
      'Four dishes on the menu. Match a plate to its ticket exactly, and serve it at the window.',
      'Press ENTER or click to start the shift.  P pauses.  M mutes.',
    ], PALETTE.gold);
    text(ctx, `Best score: ${best}`, VIEW_WIDTH / 2, 480, 18, '#c9d4c9', 'normal', 'center');
  } else if (stall.mode === MODE_PAUSED) {
    paintOverlay(ctx, 'PAUSED', ['Take a breath. The noodles will wait.', 'Press P to carry on.']);
  } else if (stall.mode === MODE_OVER) {
    paintOverlay(ctx, 'THE CROWD WALKED OUT', [
      `The shift ended early. Score ${stall.score} — ${stall.served} dishes served, ${stall.lost} orders lost.`,
      'Press R to open the stall again.',
    ], '#e4572e');
  } else if (stall.mode === MODE_DONE) {
    paintOverlay(ctx, 'SHIFT COMPLETE!', [
      `Score ${stall.score}  •  $${stall.coins} earned  •  ${stall.served} dishes served  •  Best ${best}`,
      'Press R to run another shift.',
    ], '#7bc950');
  }
  ctx.restore();
}

export { dishById };
