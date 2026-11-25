// Ladle & Ember, third pass — all the numbers the night-market stall runs on.
// Canvas size, shift length, how fast the cook walks, every counter and
// what it does, the five dishes on the menu, the drinks shelf, and the
// pace of orders. kitchen.js holds the rules; render.js holds the paint.

export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const SHIFT_LENGTH = 180;
export const START_HEARTS = 3;
export const CHEF_SPEED = 265;
export const CHEF_RADIUS = 22;
export const INTERACT_REACH = 64;
export const MAX_TICKETS = 4;
export const FIRST_TICKET_AT = 2;

// Lantern gold over warm wood, steam and chilli red on a deep green wall,
// cream tickets pinned to the board above the stall.
export const PALETTE = {
  // lantern gold on warm wood
  floorA: '#8a6b45',
  floorB: '#7d6040',
  plankLine: '#6b4e33',
  wall: '#26302c',
  wallTrim: '#e8a94e',
  counterTop: '#b07a45',
  counterFront: '#5a3a20',
  counterEdge: '#c98d4f',
  board: '#f6e8c8',
  boardInk: '#3a2a18',
  hud: '#1c2420',
  cream: '#fdf3dd',
  gold: '#f2b544',
  red: '#e4572e',
  green: '#7bc950',
  tea: '#c98a3d',
  orange: '#e88030',
}; // end of palette

export const STATION_KIND = {
  // counter kinds
  BIN: 'bin',
  POT: 'pot',
  LADLE: 'ladle',
  BOARD: 'board',
  GRILL: 'grill',
  PLATE: 'plate',
  WINDOW: 'window',
  TRASH: 'trash',
  DRINKS: 'drinks',
}; // end of station kinds

// Everything the cook can carry. 'prep' names the counter that turns the
// raw stock into a finished piece, 'prepTime' the seconds it takes there.
// A null prep means the piece is ready the moment it is picked up.
export const INGREDIENTS = {
  // everything the cook can carry
  noodle: {
    label: 'Noodles',
    prep: STATION_KIND.POT,
    prepTime: 4,
    colour: '#f4d58d',
    dark: '#c9a24a',
  },
  chicken: {
    label: 'Chicken',
    prep: STATION_KIND.BOARD,
    prepTime: 3,
    colour: '#f2c14e',
    dark: '#b98a2e',
  },
  beef: {
    label: 'Beef',
    prep: STATION_KIND.GRILL,
    prepTime: 5,
    colour: '#a34d2d',
    dark: '#6e2f1a',
  },
  egg: {
    label: 'Egg',
    prep: STATION_KIND.GRILL,
    prepTime: 3,
    colour: '#fdf6d8',
    dark: '#f0b429',
  },
  chili: {
    label: 'Chilli',
    prep: STATION_KIND.BOARD,
    prepTime: 2,
    colour: '#d9381e',
    dark: '#8f1d0c',
  },
  herbs: {
    label: 'Herbs',
    prep: null,
    prepTime: 0,
    colour: '#69b455',
    dark: '#3e7d32',
  },
  broth: {
    label: 'Broth',
    prep: null,
    prepTime: 0,
    colour: '#d97b2b',
    dark: '#9c5518',
  },
}; // end of ingredients

// The drinks shelf: quick pours that ride along with a dish order. A
// ticket that wants a drink pays the drink price on top of the dish, and
// a served drink buys the ticket six more seconds of patience.
export const DRINKS = {
  // quick pours on the side
  'es-teh': {
    label: 'Es Teh',
    coins: 6,
    liquid: '#c98a3d',
    dark: '#8a5a22',
  },
  'es-jeruk': {
    label: 'Es Jeruk',
    coins: 7,
    liquid: '#e88030',
    dark: '#a34d1a',
  },
}; // end of drinks
export const DRINK_AFTER = 45;
export const DRINK_CHANCE = 0.4;
export const DRINK_POUR_TIME = 2;
export const DRINK_PATIENCE_BONUS = 6;

// The menu. A plate counts as finished only when it holds exactly these
// pieces, no more and no less. 'coins' is the base pay before the combo
// lift. The laksa only joins the menu once the dinner rush begins.
export const DISHES = [
  // the menu
  {
    id: 'sunrise',
    name: 'Sunrise Bowl',
    pieces: ['noodle', 'broth', 'egg', 'herbs'],
    coins: 14,
  },
  {
    id: 'ember',
    name: 'Ember Beef',
    pieces: ['noodle', 'broth', 'beef', 'chili'],
    coins: 16,
  },
  {
    id: 'garden',
    name: 'Garden Chicken',
    pieces: ['noodle', 'broth', 'chicken', 'herbs'],
    coins: 15,
  },
  {
    id: 'firecracker',
    name: 'Firecracker',
    pieces: ['noodle', 'broth', 'beef', 'chicken', 'chili'],
    coins: 22,
  },
  {
    id: 'laksa',
    name: 'Golden Laksa',
    pieces: ['noodle', 'broth', 'beef', 'egg', 'herbs'],
    coins: 26,
  },
]; // end of dishes

// Every counter as one small object: id, kind, stock, label, the solid
// rectangle, and the floor spot the cook walks to before pressing E. The
// drinks shelf sits in the free gap of the bottom row, between the scrap
// bin and the first plate — its approach spot clears both neighbours.
const COUNTER_ROWS = [
  // one small object per counter
  { id: 'bin-noodle', kind: 'bin', stock: 'noodle', label: 'Noodles', x: 16, y: 168, w: 118, h: 52, ax: 168, ay: 194 },
  { id: 'bin-chicken', kind: 'bin', stock: 'chicken', label: 'Chicken', x: 16, y: 242, w: 118, h: 52, ax: 168, ay: 268 },
  { id: 'bin-beef', kind: 'bin', stock: 'beef', label: 'Beef', x: 16, y: 316, w: 118, h: 52, ax: 168, ay: 342 },
  { id: 'bin-egg', kind: 'bin', stock: 'egg', label: 'Egg', x: 16, y: 390, w: 118, h: 52, ax: 168, ay: 416 },
  { id: 'bin-chili', kind: 'bin', stock: 'chili', label: 'Chilli', x: 16, y: 464, w: 118, h: 52, ax: 168, ay: 490 },
  { id: 'bin-herbs', kind: 'bin', stock: 'herbs', label: 'Herbs', x: 16, y: 538, w: 118, h: 52, ax: 168, ay: 564 },
  { id: 'pot', kind: 'pot', stock: null, label: 'Noodle Pot', x: 1078, y: 168, w: 186, h: 92, ax: 1052, ay: 214 },
  { id: 'ladle', kind: 'ladle', stock: null, label: 'Broth Ladle', x: 1078, y: 284, w: 186, h: 68, ax: 1052, ay: 318 },
  { id: 'board', kind: 'board', stock: null, label: 'Chopping Board', x: 1078, y: 376, w: 186, h: 92, ax: 1052, ay: 422 },
  { id: 'grill', kind: 'grill', stock: null, label: 'Char Grill', x: 1078, y: 492, w: 186, h: 92, ax: 1052, ay: 538 },
  { id: 'plate-1', kind: 'plate', stock: null, label: 'Plate 1', x: 330, y: 626, w: 200, h: 74, ax: 430, ay: 600 },
  { id: 'plate-2', kind: 'plate', stock: null, label: 'Plate 2', x: 560, y: 626, w: 200, h: 74, ax: 660, ay: 600 },
  { id: 'window', kind: 'window', stock: null, label: 'Serve Here', x: 880, y: 626, w: 384, h: 74, ax: 1000, ay: 600 },
  { id: 'trash', kind: 'trash', stock: null, label: 'Scrap Bin', x: 16, y: 626, w: 140, h: 74, ax: 180, ay: 600 },
  { id: 'drinks', kind: 'drinks', stock: null, label: 'Drinks', x: 170, y: 626, w: 146, h: 74, ax: 243, ay: 600 },
]; // end of counter rows

export const STATIONS = COUNTER_ROWS.map((row) => ({
  id: row.id,
  kind: row.kind,
  stock: row.stock,
  label: row.label,
  rect: [row.x, row.y, row.w, row.h],
  approach: [row.ax, row.ay],
})); // counters built

// The order board across the top of the kitchen, plus one ticket on it.
export const BOARD = {
  // the order board
  x: 16,
  y: 62,
  w: 1248,
  h: 84,
}; // end of board
export const TICKET = {
  // one ticket
  w: 276,
  h: 76,
  gap: 12,
}; // end of ticket

// How the flood of orders grows as the shift goes on. 'gap' is the seconds
// between new tickets, 'patience' how long a ticket waits before it walks.
const PACE_STEPS = [
  { until: 45, gap: 15, patience: 52 },
  { until: 90, gap: 12, patience: 46 },
  { until: 135, gap: 10, patience: 40 },
  { until: Infinity, gap: 8, patience: 34 },
];
export const orderPace = (elapsed) => { // order pace lookup
  const step = PACE_STEPS.find((row) => elapsed < row.until);
  return { gap: step.gap, patience: step.patience };
}; // end of order pace

// Rush marks: the moments the stall floods with tickets at once.
export const RUSH_MARKS = [60, 120, 165]; // three flood moments

// The four stretches of one shift, each named on the HUD.
const PHASE_STEPS = [
  { until: 45, key: 'warm-up', label: 'WARM-UP' },
  { until: 90, key: 'lunch', label: 'LUNCH RUSH' },
  { until: 135, key: 'dinner', label: 'DINNER RUSH' },
  { until: Infinity, key: 'closing', label: 'CLOSING RUSH' },
];
export const shiftPhase = (elapsed) => { // phase lookup
  const step = PHASE_STEPS.find((row) => elapsed < row.until);
  return { key: step.key, label: step.label };
}; // end of shift phase

// From the dinner rush on, some tickets turn VIP: gold tickets, double pay.
export const VIP_AFTER = 90; // VIPs start at dinner
export const VIP_CHANCE = 0.35; // a bit over one in three

// What a ticket's patience bar means: green while the customer stays calm,
// amber once half the wait is gone, red when they are close to walking out.
export const patienceTone = (fraction) => { // patience colour
  const tones = ['#e4572e', '#f2b544', '#7bc950'];
  const slot = fraction > 0.5 ? 2 : fraction > 0.25 ? 1 : 0;
  return tones[slot];
}; // end of patience tone

// A dish only appears on the board once the shift has run this long.
const DISH_GATES = { firecracker: 55, laksa: 90 };
export const dishUnlocked = (dishId, elapsed) => { // dish gate check
  const gate = DISH_GATES[dishId];
  return gate === undefined || elapsed >= gate;
}; // end of dish unlocked

// Combo pay: each clean serve in a row lifts the next serve's pay.
const COMBO_STEPS = [
  { at: 8, mult: 2 },
  { at: 5, mult: 1.75 },
  { at: 3, mult: 1.5 },
  { at: 1, mult: 1.25 },
];
export const comboMultiplier = (streak) => { // combo pay lookup
  const hit = COMBO_STEPS.find((row) => streak >= row.at);
  return hit ? hit.mult : 1;
}; // end of combo pay
