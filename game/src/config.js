// Ladle & Ember — a night-market noodle stall.
// This file holds every number the stall runs on: the canvas size, the
// shift length, where each counter sits, what every ingredient needs before
// it can go on a plate, and the four dishes on the menu. Nothing here moves;
// kitchen.js owns the moving parts, render.js owns the drawing.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const SHIFT_LENGTH = 180;
export const START_HEARTS = 3;
export const CHEF_SPEED = 265;
export const CHEF_RADIUS = 22;
export const INTERACT_REACH = 64;
export const MAX_TICKETS = 4;
export const FIRST_TICKET_AT = 2;

// The stall's palette: warm lantern light over dark teal tile, wood counters.
export const PALETTE = {
  floorA: '#2e4f4a',
  floorB: '#2a4742',
  wall: '#1d3230',
  wallTrim: '#c98a3d',
  counterTop: '#8a5a33',
  counterFront: '#6e4525',
  counterEdge: '#a9713f',
  board: '#f6e8c8',
  boardInk: '#3a2a18',
  hud: '#17221f',
  cream: '#fbf3dd',
  gold: '#f2b544',
  red: '#e4572e',
  green: '#7bc950',
};

export const STATION_KIND = {
  BIN: 'bin',
  POT: 'pot',
  LADLE: 'ladle',
  BOARD: 'board',
  GRILL: 'grill',
  PLATE: 'plate',
  WINDOW: 'window',
  TRASH: 'trash',
};

// Every thing a cook can carry. `prep` names the station that turns the raw
// stock into the finished piece, and `prepTime` how many seconds it takes.
// A null prep means the piece is ready the moment it is picked up.
export const INGREDIENTS = {
  noodle: { label: 'Noodles', prep: STATION_KIND.POT, prepTime: 4, colour: '#f4d58d', dark: '#c9a24a' },
  chicken: { label: 'Chicken', prep: STATION_KIND.BOARD, prepTime: 3, colour: '#f2c14e', dark: '#b98a2e' },
  beef: { label: 'Beef', prep: STATION_KIND.GRILL, prepTime: 5, colour: '#a34d2d', dark: '#6e2f1a' },
  egg: { label: 'Egg', prep: STATION_KIND.GRILL, prepTime: 3, colour: '#fdf6d8', dark: '#f0b429' },
  chili: { label: 'Chilli', prep: STATION_KIND.BOARD, prepTime: 2, colour: '#d9381e', dark: '#8f1d0c' },
  herbs: { label: 'Herbs', prep: null, prepTime: 0, colour: '#69b455', dark: '#3e7d32' },
  broth: { label: 'Broth', prep: null, prepTime: 0, colour: '#d97b2b', dark: '#9c5518' },
};

// The menu. A dish is done when its plate holds exactly these pieces, no
// more and no less. `coins` is the base pay before the combo multiplier.
export const DISHES = [
  { id: 'sunrise', name: 'Sunrise Bowl', pieces: ['noodle', 'broth', 'egg', 'herbs'], coins: 14 },
  { id: 'ember', name: 'Ember Beef', pieces: ['noodle', 'broth', 'beef', 'chili'], coins: 16 },
  { id: 'garden', name: 'Garden Chicken', pieces: ['noodle', 'broth', 'chicken', 'herbs'], coins: 15 },
  { id: 'firecracker', name: 'Firecracker', pieces: ['noodle', 'broth', 'beef', 'chicken', 'chili'], coins: 22 },
];

// Where every counter stands. `approach` is the floor spot the cook walks to
// before pressing the interact key; `rect` is the solid counter itself.
export const STATIONS = [
  { id: 'bin-noodle', kind: STATION_KIND.BIN, stock: 'noodle', label: 'Noodles', rect: [16, 168, 118, 52], approach: [168, 194] },
  { id: 'bin-chicken', kind: STATION_KIND.BIN, stock: 'chicken', label: 'Chicken', rect: [16, 242, 118, 52], approach: [168, 268] },
  { id: 'bin-beef', kind: STATION_KIND.BIN, stock: 'beef', label: 'Beef', rect: [16, 316, 118, 52], approach: [168, 342] },
  { id: 'bin-egg', kind: STATION_KIND.BIN, stock: 'egg', label: 'Egg', rect: [16, 390, 118, 52], approach: [168, 416] },
  { id: 'bin-chili', kind: STATION_KIND.BIN, stock: 'chili', label: 'Chilli', rect: [16, 464, 118, 52], approach: [168, 490] },
  { id: 'bin-herbs', kind: STATION_KIND.BIN, stock: 'herbs', label: 'Herbs', rect: [16, 538, 118, 52], approach: [168, 564] },
  { id: 'pot', kind: STATION_KIND.POT, label: 'Noodle Pot', rect: [1078, 168, 186, 92], approach: [1052, 214] },
  { id: 'ladle', kind: STATION_KIND.LADLE, label: 'Broth Ladle', rect: [1078, 284, 186, 68], approach: [1052, 318] },
  { id: 'board', kind: STATION_KIND.BOARD, label: 'Chopping Board', rect: [1078, 376, 186, 92], approach: [1052, 422] },
  { id: 'grill', kind: STATION_KIND.GRILL, label: 'Char Grill', rect: [1078, 492, 186, 92], approach: [1052, 538] },
  { id: 'plate-1', kind: STATION_KIND.PLATE, label: 'Plate 1', rect: [330, 626, 200, 74], approach: [430, 600] },
  { id: 'plate-2', kind: STATION_KIND.PLATE, label: 'Plate 2', rect: [560, 626, 200, 74], approach: [660, 600] },
  { id: 'window', kind: STATION_KIND.WINDOW, label: 'Serve Here', rect: [880, 626, 384, 74], approach: [1000, 600] },
  { id: 'trash', kind: STATION_KIND.TRASH, label: 'Scrap Bin', rect: [16, 626, 140, 74], approach: [180, 600] },
];

// The order board across the top of the kitchen.
export const BOARD = { x: 16, y: 62, w: 1248, h: 84 };
export const TICKET = { w: 276, h: 76, gap: 12 };

// How the rush of orders grows as the shift goes on. `gap` is the seconds
// between new tickets, `patience` how long a ticket waits before it walks.
export function orderPace(elapsed) {
  if (elapsed < 45) return { gap: 15, patience: 52 };
  if (elapsed < 90) return { gap: 12, patience: 46 };
  if (elapsed < 135) return { gap: 10, patience: 40 };
  return { gap: 8, patience: 34 };
}

// Rush hours: the moments the stall floods with tickets at once.
export const RUSH_MARKS = [60, 120];

// How a ticket's patience bar should look: green while the customer is
// calm, amber at half gone, red when they are about to walk out.
export function patienceTone(fraction) {
  if (fraction > 0.5) return '#7bc950';
  if (fraction > 0.25) return '#f2b544';
  return '#e4572e';
}

// A dish only appears on the board once the shift has run this long.
export function dishUnlocked(dishId, elapsed) {
  if (dishId === 'firecracker') return elapsed >= 55;
  return true;
}

// Combo pay: each clean serve in a row lifts the next one.
export function comboMultiplier(streak) {
  if (streak >= 8) return 2;
  if (streak >= 5) return 1.75;
  if (streak >= 3) return 1.5;
  if (streak >= 1) return 1.25;
  return 1;
}
