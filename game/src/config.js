// Ladle & Ember, second pass — every number the night-market stall runs on.
// Canvas size, shift length, the walk speed of the cook, the counters and
// what each one does, the five dishes on the menu, and the pace of orders.
// The stall logic lives in kitchen.js; the painter lives in render.js.

export const VIEW_WIDTH = 1280, VIEW_HEIGHT = 720, SHIFT_LENGTH = 180;
export const START_HEARTS = 3, CHEF_SPEED = 265, CHEF_RADIUS = 22;
export const INTERACT_REACH = 64, MAX_TICKETS = 4, FIRST_TICKET_AT = 2;

// The stall after the polish pass: lantern gold over warm wood, steam and
// chilli red against a deep green wall, cream tickets on top.
export const PALETTE = { /* lantern gold over warm wood */
	floorA: "#8a6b45",
	floorB: "#7d6040",
	plankLine: "#6b4e33",
	wall: "#26302c",
	wallTrim: "#e8a94e",
	counterTop: "#b07a45",
	counterFront: "#5a3a20",
	counterEdge: "#c98d4f",
	board: "#f6e8c8",
	boardInk: "#3a2a18",
	hud: "#1c2420",
	cream: "#fdf3dd",
	gold: "#f2b544",
	red: "#e4572e",
	green: "#7bc950",
}; // palette

export const STATION_KIND = { /* counter kinds */
	BIN: "bin",
	POT: "pot",
	LADLE: "ladle",
	BOARD: "board",
	GRILL: "grill",
	PLATE: "plate",
	WINDOW: "window",
	TRASH: "trash",
}; // station kinds

// Everything the cook can carry. "prep" names the counter that turns the
// raw stock into a finished piece, "prepTime" the seconds it takes there.
// A null prep means the piece is ready the second it is picked up.
export const INGREDIENTS = { /* everything the cook can carry */
	noodle: {
		label: "Noodles",
		prep: STATION_KIND.POT,
		prepTime: 4,
		colour: "#f4d58d",
		dark: "#c9a24a",
	},
	chicken: {
		label: "Chicken",
		prep: STATION_KIND.BOARD,
		prepTime: 3,
		colour: "#f2c14e",
		dark: "#b98a2e",
	},
	beef: {
		label: "Beef",
		prep: STATION_KIND.GRILL,
		prepTime: 5,
		colour: "#a34d2d",
		dark: "#6e2f1a",
	},
	egg: {
		label: "Egg",
		prep: STATION_KIND.GRILL,
		prepTime: 3,
		colour: "#fdf6d8",
		dark: "#f0b429",
	},
	chili: {
		label: "Chilli",
		prep: STATION_KIND.BOARD,
		prepTime: 2,
		colour: "#d9381e",
		dark: "#8f1d0c",
	},
	herbs: {
		label: "Herbs",
		prep: null,
		prepTime: 0,
		colour: "#69b455",
		dark: "#3e7d32",
	},
	broth: {
		label: "Broth",
		prep: null,
		prepTime: 0,
		colour: "#d97b2b",
		dark: "#9c5518",
	},
}; // ingredients

// The menu. A plate is finished when it holds exactly these pieces, no
// more and no less. "coins" is the base pay before the combo lift. The
// laksa only joins the menu once the dinner rush begins.
export const DISHES = [ /* the menu */
	{
		id: "sunrise",
		name: "Sunrise Bowl",
		pieces: ["noodle", "broth", "egg", "herbs"],
		coins: 14,
	},
	{
		id: "ember",
		name: "Ember Beef",
		pieces: ["noodle", "broth", "beef", "chili"],
		coins: 16,
	},
	{
		id: "garden",
		name: "Garden Chicken",
		pieces: ["noodle", "broth", "chicken", "herbs"],
		coins: 15,
	},
	{
		id: "firecracker",
		name: "Firecracker",
		pieces: ["noodle", "broth", "beef", "chicken", "chili"],
		coins: 22,
	},
	{
		id: "laksa",
		name: "Golden Laksa",
		pieces: ["noodle", "broth", "beef", "egg", "herbs"],
		coins: 26,
	},
]; // dishes

// Every counter, as one compact row each: id, kind, stock, label, the solid
// rectangle, and the floor spot the cook walks to before pressing E.
const STATION_ROWS = [ /* one compact row per counter */
	["bin-noodle", "bin", "noodle", "Noodles", 16, 168, 118, 52, 168, 194],
	["bin-chicken", "bin", "chicken", "Chicken", 16, 242, 118, 52, 168, 268],
	["bin-beef", "bin", "beef", "Beef", 16, 316, 118, 52, 168, 342],
	["bin-egg", "bin", "egg", "Egg", 16, 390, 118, 52, 168, 416],
	["bin-chili", "bin", "chili", "Chilli", 16, 464, 118, 52, 168, 490],
	["bin-herbs", "bin", "herbs", "Herbs", 16, 538, 118, 52, 168, 564],
	["pot", "pot", null, "Noodle Pot", 1078, 168, 186, 92, 1052, 214],
	["ladle", "ladle", null, "Broth Ladle", 1078, 284, 186, 68, 1052, 318],
	["board", "board", null, "Chopping Board", 1078, 376, 186, 92, 1052, 422],
	["grill", "grill", null, "Char Grill", 1078, 492, 186, 92, 1052, 538],
	["plate-1", "plate", null, "Plate 1", 330, 626, 200, 74, 430, 600],
	["plate-2", "plate", null, "Plate 2", 560, 626, 200, 74, 660, 600],
	["window", "window", null, "Serve Here", 880, 626, 384, 74, 1000, 600],
	["trash", "trash", null, "Scrap Bin", 16, 626, 140, 74, 180, 600],
]; // station rows

export const STATIONS = STATION_ROWS.map((row) => {
	const [id, kind, stock, label, x, y, w, h, ax, ay] = row;
	return {
		id,
		kind,
		stock,
		label,
		rect: [x, y, w, h],
		approach: [ax, ay],
	};
}); // stations built

// The order board across the top of the kitchen, and one ticket on it.
export const BOARD = { /* the order board */
	x: 16,
	y: 62,
	w: 1248,
	h: 84,
}; // board
export const TICKET = { /* one ticket */
	w: 276,
	h: 76,
	gap: 12,
}; // ticket

// How the flood of orders grows as the shift goes on. "gap" is the seconds
// between new tickets, "patience" how long a ticket waits before it walks.
export const orderPace = (elapsed) => {
	if (elapsed < 45) return { gap: 15, patience: 52 };
	if (elapsed < 90) return { gap: 12, patience: 46 };
	if (elapsed < 135) return { gap: 10, patience: 40 };
	return { gap: 8, patience: 34 };
}; // order pace

// Rush marks: the moments the stall floods with tickets all at once.
export const RUSH_MARKS = [60, 120, 165];

// The four stretches of one shift, each with its own name on the HUD.
export const shiftPhase = (elapsed) => {
	if (elapsed < 45) return { key: "warm-up", label: "WARM-UP" };
	if (elapsed < 90) return { key: "lunch", label: "LUNCH RUSH" };
	if (elapsed < 135) return { key: "dinner", label: "DINNER RUSH" };
	return { key: "closing", label: "CLOSING RUSH" };
}; // shift phase

// From the dinner rush on, some tickets are VIPs: gold tickets, double pay.
export const VIP_AFTER = 90;
export const VIP_CHANCE = 0.35;

// How a ticket's patience bar reads: green while the customer stays calm,
// amber once half the wait is gone, red when they are about to walk out.
export const patienceTone = (fraction) => {
	if (fraction > 0.5) return "#7bc950";
	if (fraction > 0.25) return "#f2b544";
	return "#e4572e";
}; // patience tone

// A dish only joins the board once the shift has run this long.
export const dishUnlocked = (dishId, elapsed) => {
	if (dishId === "firecracker") return elapsed >= 55;
	if (dishId === "laksa") return elapsed >= 90;
	return true;
}; // dish unlocked

// Combo pay: each clean serve in a row lifts the pay of the next one.
export const comboMultiplier = (streak) => {
	if (streak >= 8) return 2;
	if (streak >= 5) return 1.75;
	if (streak >= 3) return 1.5;
	if (streak >= 1) return 1.25;
	return 1;
}; // combo pay
