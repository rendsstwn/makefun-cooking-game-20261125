// Keys and mouse for the stall. The input reader owns the pressed keys and
// the click-to-walk target; the loop asks it each frame where the cook should
// go and whether the interact key was just tapped.

import { nearestUsableStation, pressInteract, stationInReach } from './kitchen.js';

const MOVE_KEYS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  KeyW: { x: 0, y: -1 },
  KeyS: { x: 0, y: 1 },
  KeyA: { x: -1, y: 0 },
  KeyD: { x: 1, y: 0 },
};

export function createInput(screen, hooks) {
  const held = new Set();
  let interactQueued = false;
  let pendingStation = null;

  function logicalPoint(event) {
    const rect = screen.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * screen.width,
      y: ((event.clientY - rect.top) / rect.height) * screen.height,
    };
  }

  function stationAtPoint(point) {
    // The counter whose rectangle (grown a little) the click landed on.
    let found = null;
    let foundGap = Infinity;
    for (const station of hooks.stall().stations) {
      const [x, y, w, h] = station.rect;
      const inside = point.x >= x - 20 && point.x <= x + w + 20 && point.y >= y - 20 && point.y <= y + h + 20;
      if (!inside) continue;
      const gap = Math.hypot(point.x - (x + w / 2), point.y - (y + h / 2));
      if (gap < foundGap) {
        found = station;
        foundGap = gap;
      }
    }
    return found;
  }

  window.addEventListener('keydown', (event) => {
    if (MOVE_KEYS[event.code] || event.code === 'Space') event.preventDefault();
    if (event.repeat) return;
    held.add(event.code);
    if (event.code === 'KeyE' || event.code === 'Space') interactQueued = true;
    if (event.code === 'Enter') hooks.onConfirm();
    if (event.code === 'KeyP') hooks.onPause();
    if (event.code === 'KeyR') hooks.onRestart();
    if (event.code === 'KeyM') hooks.onMute();
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
  });
  window.addEventListener('blur', () => {
    held.clear();
  });

  screen.addEventListener('pointerdown', (event) => {
    const stall = hooks.stall();
    if (stall.mode !== 'play') {
      hooks.onConfirm();
      return;
    }
    const point = logicalPoint(event);
    const station = stationAtPoint(point);
    if (station) {
      stall.moveTarget = { x: station.approach[0], y: station.approach[1] };
      pendingStation = station.id;
    } else {
      stall.moveTarget = { x: point.x, y: point.y };
      pendingStation = null;
    }
  });

  return {
    // The direction the held keys ask for, or null when none are held.
    moveVector() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        const dir = MOVE_KEYS[code];
        if (dir) {
          x += dir.x;
          y += dir.y;
        }
      }
      if (x === 0 && y === 0) return null;
      return { x, y };
    },
    // True once per tap of E or Space.
    takeInteract() {
      const was = interactQueued;
      interactQueued = false;
      return was;
    },
    // Run once a frame: finish a click-to-walk errand when the cook arrives.
    update(stall) {
      if (pendingStation && stationInReach(stall, pendingStation)) {
        pressInteract(stall);
        pendingStation = null;
      }
      if (this.moveVector()) {
        pendingStation = null;
        stall.moveTarget = null;
      }
    },
    // The counter nearest the cook right now, for the hint line.
    nearestStation(stall) {
      return nearestUsableStation(stall);
    },
  };
}
