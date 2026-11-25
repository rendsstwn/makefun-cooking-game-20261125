// Boot and the one loop: input is read every frame, the stall advances in
// fixed 1/60 s steps, and the painter draws what is there. The game moves
// between five screens: title, play, paused, shift over and shift complete.
//
// ?seed=N fixes the tickets a shift deals. ?shot=kitchen|chopping|serving|
// rush (with &seed=N) stages that scene instead of running the loop, paints
// it twice and sets window.__shotReady for a screenshot.

import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import {
  MODE_DONE,
  MODE_OVER,
  MODE_PAUSED,
  MODE_PLAY,
  MODE_TITLE,
  STEP,
  createStall,
  pressInteract,
  startShift,
  stepStall,
} from './kitchen.js';
import { paintStall } from './render.js';
import { createInput } from './input.js';
import { createSounder } from './audio.js';
import { stageScene } from './shots.js';

const BEST_KEY = 'ladle-ember-best';
const MAX_CATCHUP = 0.25;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedText = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedText) ? seedText : Math.floor(Math.random() * 4294967296);

const screen = document.getElementById('board');
const statusLine = document.getElementById('status');
const ctx = screen.getContext('2d');

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private mode or no storage: the shift still counts.
  }
}

let best = readBest();
let stall = createStall(seed);
const sounder = createSounder();

function announce(text) {
  if (statusLine) statusLine.textContent = text;
}

function beginShift() {
  stall = startShift(stall);
  sounder.unlock();
  sounder.click();
  announce('Shift started. Take the first order, cook it, serve it before the ticket walks.');
}

function togglePause() {
  if (stall.mode === MODE_PLAY) {
    stall.mode = MODE_PAUSED;
    announce('Paused.');
  } else if (stall.mode === MODE_PAUSED) {
    stall.mode = MODE_PLAY;
    announce('Back to the rush.');
  }
}

function restartShift() {
  if (stall.mode === MODE_OVER || stall.mode === MODE_DONE) {
    stall = startShift({ seed: Math.floor(Math.random() * 4294967296) });
    announce('A new shift begins.');
  }
}

const input = createInput(screen, {
  stall: () => stall,
  onConfirm() {
    if (stall.mode === MODE_TITLE) beginShift();
    else if (stall.mode === MODE_OVER || stall.mode === MODE_DONE) restartShift();
  },
  onPause() {
    togglePause();
  },
  onRestart() {
    restartShift();
  },
  onMute() {
    const muted = sounder.toggleMute();
    announce(muted ? 'Sound off.' : 'Sound on.');
  },
});

let lastHint = '';
function refreshHint() {
  if (stall.mode !== MODE_PLAY) return;
  const near = input.nearestStation(stall);
  const hint = near ? `Near ${near.label} — press E to use it.` : '';
  if (hint !== lastHint) {
    lastHint = hint;
    if (hint) announce(hint);
  }
}

function frame(now) {
  requestAnimationFrame(frame);
  const elapsed = Math.min(MAX_CATCHUP, (now - frame.last) / 1000 || 0);
  frame.last = now;
  if (stall.mode === MODE_PLAY) {
    let left = elapsed;
    while (left > 0) {
      const dt = Math.min(STEP, left);
      input.update(stall);
      if (input.takeInteract()) pressInteract(stall);
      stepStall(stall, dt, input.moveVector());
      left -= dt;
    }
    refreshHint();
    if (stall.score > best) {
      best = stall.score;
      saveBest(best);
    }
    if (stall.mode === MODE_OVER) sounder.alarm();
    if (stall.mode === MODE_DONE) sounder.serve();
  }
  paintStall(ctx, stall, best);
}
frame.last = performance.now();

if (shotName) {
  stall = stageScene(shotName, seed);
  paintStall(ctx, stall, best);
  paintStall(ctx, stall, best);
  window.__shotReady = true;
} else {
  screen.width = VIEW_WIDTH;
  screen.height = VIEW_HEIGHT;
  requestAnimationFrame(frame);
}
