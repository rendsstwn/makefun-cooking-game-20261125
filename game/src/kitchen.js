// The stall itself: every rule the kitchen runs by. This file knows nothing
// about drawing or keys; it only keeps the state and moves it forward one
// fixed step at a time, so the same seed always plays the same shift.

import {
  BOARD,
  CHEF_RADIUS,
  CHEF_SPEED,
  DISHES,
  FIRST_TICKET_AT,
  INGREDIENTS,
  INTERACT_REACH,
  MAX_TICKETS,
  RUSH_MARKS,
  SHIFT_LENGTH,
  START_HEARTS,
  STATION_KIND,
  STATIONS,
  TICKET,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  comboMultiplier,
  dishUnlocked,
  orderPace,
} from './config.js';
import { makeDice } from './random.js';

const STEP = 1 / 60;
const FLOOR = { x: 8, y: 156, w: 1264, h: 556 };
const CENTRE = { x: 620, y: 420 };
const ARRIVE_WITHIN = 10;

export const MODE_TITLE = 'title';
export const MODE_PLAY = 'play';
export const MODE_PAUSED = 'paused';
export const MODE_OVER = 'over';
export const MODE_DONE = 'done';

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}

function freshStation(def) {
  return {
    id: def.id,
    kind: def.kind,
    stock: def.stock ?? null,
    label: def.label,
    rect: def.rect,
    approach: def.approach,
    job: null,
    ready: null,
    pieces: [],
  };
}

export function createStall(seed) {
  return {
    seed,
    dice: makeDice(seed),
    mode: MODE_TITLE,
    time: 0,
    score: 0,
    coins: 0,
    streak: 0,
    hearts: START_HEARTS,
    chef: { x: 620, y: 430, face: 1, carry: null },
    stations: STATIONS.map(freshStation),
    tickets: [],
    ticketSeq: 0,
    nextTicketIn: FIRST_TICKET_AT,
    rushMarksDone: [],
    rushUntil: -1,
    moveTarget: null,
    floaters: [],
    particles: [],
    shake: 0,
    served: 0,
    lost: 0,
  };
}

export function stationById(stall, id) {
  return stall.stations.find((station) => station.id === id);
}

function rectOf(station) {
  const [x, y, w, h] = station.rect;
  return { x, y, w, h };
}

function pointRectGap(px, py, rect) {
  const cx = Math.max(rect.x, Math.min(px, rect.x + rect.w));
  const cy = Math.max(rect.y, Math.min(py, rect.y + rect.h));
  return Math.hypot(px - cx, py - cy);
}

export function nearestUsableStation(stall) {
  let best = null;
  let bestGap = Infinity;
  for (const station of stall.stations) {
    const gap = pointRectGap(stall.chef.x, stall.chef.y, rectOf(station));
    if (gap < INTERACT_REACH && gap < bestGap) {
      best = station;
      bestGap = gap;
    }
  }
  return best;
}

export function stationInReach(stall, id) {
  const station = stationById(stall, id);
  if (!station) return false;
  return pointRectGap(stall.chef.x, stall.chef.y, rectOf(station)) < INTERACT_REACH;
}

function addFloater(stall, x, y, text, colour) {
  stall.floaters.push({ x, y, text, colour: colour ?? '#fbf3dd', life: 1.4, max: 1.4 });
}

function burst(stall, x, y, colour, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = stall.dice.float() * Math.PI * 2;
    const speed = 30 + stall.dice.float() * 90;
    stall.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      life: 0.5 + stall.dice.float() * 0.4,
      max: 0.9,
      colour,
      size: 2 + stall.dice.float() * 3,
    });
  }
}

function piecesMatch(have, want) {
  if (have.length !== want.length) return false;
  const sortedHave = [...have].sort();
  const sortedWant = [...want].sort();
  return sortedHave.every((piece, i) => piece === sortedWant[i]);
}

function ticketForDish(stall, dishId) {
  return stall.tickets.find((ticket) => ticket.dish.id === dishId);
}

function spawnTicket(stall, forcedDishId) {
  if (stall.tickets.length >= MAX_TICKETS) return;
  const unlocked = DISHES.filter((dish) => dishUnlocked(dish.id, stall.time));
  const dish = forcedDishId
    ? dishById(forcedDishId)
    : stall.dice.pick(unlocked);
  const pace = orderPace(stall.time);
  stall.tickets.push({
    id: stall.ticketSeq += 1,
    dish,
    patience: pace.patience,
    maxPatience: pace.patience,
    coins: dish.coins,
  });
}

function fireRush(stall, mark) {
  stall.rushMarksDone.push(mark);
  stall.rushUntil = stall.time + 6;
  spawnTicket(stall);
  spawnTicket(stall);
  addFloater(stall, VIEW_WIDTH / 2, 200, 'RUSH HOUR!', '#f2b544');
  burst(stall, VIEW_WIDTH / 2, 200, '#f2b544', 26);
}

function loseTicket(stall, ticket, reason) {
  stall.tickets = stall.tickets.filter((other) => other.id !== ticket.id);
  stall.lost += 1;
  stall.streak = 0;
  stall.hearts -= 1;
  stall.shake = 0.35;
  addFloater(stall, VIEW_WIDTH / 2, 220, reason, '#e4572e');
  if (stall.hearts <= 0) stall.mode = MODE_OVER;
}

function serveCarriedDish(stall) {
  const carried = stall.chef.carry;
  if (!carried || carried.type !== 'dish') return;
  const ticket = stall.tickets.find((entry) => piecesMatch(carried.pieces, entry.dish.pieces));
  if (!ticket) {
    addFloater(stall, stall.chef.x, stall.chef.y - 44, 'No order wants this', '#e4572e');
    return;
  }
  const pay = Math.round(ticket.coins * comboMultiplier(stall.streak));
  const bonus = Math.round((ticket.patience / ticket.maxPatience) * 20);
  stall.coins += pay;
  stall.score += pay * 10 + bonus;
  stall.streak += 1;
  stall.served += 1;
  stall.tickets = stall.tickets.filter((entry) => entry.id !== ticket.id);
  stall.chef.carry = null;
  const win = stationById(stall, 'window');
  burst(stall, win.approach[0], win.approach[1] - 30, '#f2b544', 30);
  addFloater(stall, win.approach[0], win.approach[1] - 60, `+${pay} coins`, '#f2b544');
  if (stall.streak >= 3) {
    addFloater(stall, win.approach[0], win.approach[1] - 84, `Combo x${comboMultiplier(stall.streak)}`, '#7bc950');
  }
}

function startPrep(stall, station, piece) {
  const spec = INGREDIENTS[piece];
  station.job = { piece, done: 0, total: spec.prepTime };
  stall.chef.carry = null;
  addFloater(stall, station.approach[0], station.approach[1] - 40, `${spec.label} on the ${station.label.toLowerCase()}`, '#fbf3dd');
}

function takeReady(stall, station) {
  stall.chef.carry = { type: 'piece', piece: station.ready };
  addFloater(stall, stall.chef.x, stall.chef.y - 44, INGREDIENTS[station.ready].label, '#fbf3dd');
  station.ready = null;
}

// One press of the interact key, aimed at the counter nearest the cook.
export function pressInteract(stall) {
  if (stall.mode !== MODE_PLAY) return;
  const station = nearestUsableStation(stall);
  if (!station) return;
  const chef = stall.chef;

  if (station.kind === STATION_KIND.BIN) {
    if (chef.carry) {
      addFloater(stall, chef.x, chef.y - 44, 'Hands full', '#e4572e');
      return;
    }
    chef.carry = { type: 'piece', piece: station.stock };
    return;
  }

  if (station.kind === STATION_KIND.LADLE) {
    if (chef.carry) {
      addFloater(stall, chef.x, chef.y - 44, 'Hands full', '#e4572e');
      return;
    }
    chef.carry = { type: 'piece', piece: 'broth' };
    addFloater(stall, chef.x, chef.y - 44, 'Broth', '#fbf3dd');
    return;
  }

  if (station.kind === STATION_KIND.POT || station.kind === STATION_KIND.BOARD || station.kind === STATION_KIND.GRILL) {
    if (station.ready) {
      if (chef.carry) {
        addFloater(stall, chef.x, chef.y - 44, 'Hands full', '#e4572e');
        return;
      }
      takeReady(stall, station);
      return;
    }
    if (station.job) {
      addFloater(stall, station.approach[0], station.approach[1] - 40, 'Not ready yet', '#fbf3dd');
      return;
    }
    if (!chef.carry || chef.carry.type !== 'piece') return;
    const piece = chef.carry.piece;
    const spec = INGREDIENTS[piece];
    if (spec.prep !== station.kind) {
      addFloater(stall, chef.x, chef.y - 44, `That goes on the ${spec.prep === STATION_KIND.POT ? 'pot' : spec.prep === STATION_KIND.BOARD ? 'board' : 'grill'}`, '#e4572e');
      return;
    }
    startPrep(stall, station, piece);
    return;
  }

  if (station.kind === STATION_KIND.PLATE) {
    if (chef.carry && chef.carry.type === 'piece') {
      const piece = chef.carry.piece;
      if (station.pieces.includes(piece)) {
        addFloater(stall, chef.x, chef.y - 44, 'Already on the plate', '#e4572e');
        return;
      }
      if (station.pieces.length >= 5) {
        addFloater(stall, chef.x, chef.y - 44, 'Plate is full', '#e4572e');
        return;
      }
      station.pieces.push(piece);
      chef.carry = null;
      return;
    }
    if (!chef.carry && station.pieces.length > 0) {
      chef.carry = { type: 'dish', pieces: [...station.pieces] };
      station.pieces = [];
      return;
    }
    if (!chef.carry) addFloater(stall, chef.x, chef.y - 44, 'Plate is empty', '#fbf3dd');
    return;
  }

  if (station.kind === STATION_KIND.WINDOW) {
    serveCarriedDish(stall);
    return;
  }

  if (station.kind === STATION_KIND.TRASH) {
    if (!chef.carry) return;
    chef.carry = null;
    addFloater(stall, chef.x, chef.y - 44, 'Scrapped', '#fbf3dd');
  }
}

function hitsSolid(stall, x, y) {
  if (x < FLOOR.x + CHEF_RADIUS || x > FLOOR.x + FLOOR.w - CHEF_RADIUS) return true;
  if (y < FLOOR.y + CHEF_RADIUS || y > FLOOR.y + FLOOR.h - CHEF_RADIUS) return true;
  for (const station of stall.stations) {
    const rect = rectOf(station);
    const nearX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const nearY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    if (Math.hypot(x - nearX, y - nearY) < CHEF_RADIUS) return true;
  }
  return false;
}

function segmentClears(stall, from, to) {
  const steps = 24;
  // The last sample is the target itself, which may sit inside a counter's
  // reach radius without blocking the walk: the cook only needs to get
  // close, not to stand on the exact spot.
  for (let i = 1; i < steps; i += 1) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    if (hitsSolid(stall, x, y)) return false;
  }
  return true;
}

function routeTo(stall, target) {
  const from = { x: stall.chef.x, y: stall.chef.y };
  if (segmentClears(stall, from, target)) return [target];
  return [CENTRE, target];
}

// Walk the cook toward `target` for one step; true once they arrive. When
// the straight line is blocked by a counter the cook detours through the
// middle of the floor, then carries on to the target.
export function guideChef(stall, target, dt) {
  const route = routeTo(stall, target);
  let leg = route[0];
  let dx = leg.x - stall.chef.x;
  let dy = leg.y - stall.chef.y;
  let dist = Math.hypot(dx, dy);
  if (dist < ARRIVE_WITHIN && route.length > 1) {
    leg = route[1];
    dx = leg.x - stall.chef.x;
    dy = leg.y - stall.chef.y;
    dist = Math.hypot(dx, dy);
  }
  if (dist < ARRIVE_WITHIN) return true;
  const step = Math.min(dist, CHEF_SPEED * dt);
  const nx = stall.chef.x + (dx / dist) * step;
  const ny = stall.chef.y + (dy / dist) * step;
  stall.chef.face = dx >= 0 ? 1 : -1;
  const beforeX = stall.chef.x;
  const beforeY = stall.chef.y;
  if (!hitsSolid(stall, nx, stall.chef.y)) stall.chef.x = nx;
  if (!hitsSolid(stall, stall.chef.x, ny)) stall.chef.y = ny;
  // Wedged against a counter with nowhere to go: stop here instead of
  // shuttling back and forth. The click-to-walk target is only a wish.
  if (stall.chef.x === beforeX && stall.chef.y === beforeY) return true;
  return Math.hypot(target.x - stall.chef.x, target.y - stall.chef.y) < ARRIVE_WITHIN;
}

// Move the cook by a raw direction, sliding along counters.
export function shiftChef(stall, dx, dy, dt) {
  const chef = stall.chef;
  const len = Math.hypot(dx, dy);
  if (len < 0.01) return;
  const nx = chef.x + (dx / len) * CHEF_SPEED * dt;
  const ny = chef.y + (dy / len) * CHEF_SPEED * dt;
  if (dx !== 0) chef.face = dx > 0 ? 1 : -1;
  if (!hitsSolid(stall, nx, chef.y)) chef.x = nx;
  if (!hitsSolid(stall, chef.x, ny)) chef.y = ny;
}

function tickStations(stall, dt) {
  for (const station of stall.stations) {
    if (!station.job) continue;
    station.job.done += dt;
    if (station.job.done >= station.job.total) {
      station.ready = station.job.piece;
      station.job = null;
      burst(stall, station.approach[0], station.approach[1] - 20, '#fbf3dd', 8);
    }
  }
}

function tickTickets(stall, dt) {
  for (const ticket of [...stall.tickets]) {
    ticket.patience -= dt;
    if (ticket.patience <= 0) loseTicket(stall, ticket, 'Order walked out!');
  }
}

function tickParticles(stall, dt) {
  for (const part of stall.particles) {
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.vy += 60 * dt;
    part.life -= dt;
  }
  stall.particles = stall.particles.filter((part) => part.life > 0);
  for (const floater of stall.floaters) {
    floater.y -= 26 * dt;
    floater.life -= dt;
  }
  stall.floaters = stall.floaters.filter((floater) => floater.life > 0);
  if (stall.shake > 0) stall.shake = Math.max(0, stall.shake - dt);
}

// One fixed step of the shift. `move` is {x, y} from the keys, or null.
export function stepStall(stall, dt, move) {
  if (stall.mode !== MODE_PLAY) return;
  stall.time += dt;

  if (move) shiftChef(stall, move.x, move.y, dt);
  if (stall.moveTarget) {
    const arrived = guideChef(stall, stall.moveTarget, dt);
    if (arrived) stall.moveTarget = null;
  }

  tickStations(stall, dt);
  tickTickets(stall, dt);
  if (stall.mode !== MODE_PLAY) return;
  tickParticles(stall, dt);

  stall.nextTicketIn -= dt;
  if (stall.nextTicketIn <= 0 && stall.tickets.length < MAX_TICKETS) {
    spawnTicket(stall);
    stall.nextTicketIn = orderPace(stall.time).gap;
  }
  for (const mark of RUSH_MARKS) {
    if (stall.time >= mark && !stall.rushMarksDone.includes(mark)) fireRush(stall, mark);
  }

  if (stall.time >= SHIFT_LENGTH && stall.mode === MODE_PLAY) {
    stall.mode = MODE_DONE;
  }
}

export function startShift(stall) {
  const fresh = createStall(stall.seed);
  fresh.mode = MODE_PLAY;
  return fresh;
}

export { STEP, TICKET, BOARD };
