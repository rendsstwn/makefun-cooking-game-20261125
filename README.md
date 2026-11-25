# Ladle & Ember — Night-Market Noodle Stall

A complete, original cooking game built for make.fun's "Make the best
cooking game" bounty. You run a night-market noodle stall through a 3-minute
shift: tickets come in on the order board, you fetch stock from the bins,
boil noodles, chop chicken and chilli, sear beef and fry eggs, ladle broth,
build each plate to match its ticket exactly, and serve it at the window
before the customer walks out. Orders arrive faster as the shift goes on,
rush hours flood the board, and a clean-serve streak multiplies your pay.

## How to play

- **Move** — WASD or arrow keys, or click a counter to walk there.
- **Interact** — E or Space: grab stock, start the pot / board / grill, take
  finished pieces, add a piece to a plate, pick up a finished plate, serve.
- **Pause** — P. **Mute** — M. **Restart** after a shift ends — R.
- Lose a heart when a ticket's patience runs out; three lost hearts end the
  shift early. Serve fast for a patience bonus and keep the combo alive.

## The menu

- **Sunrise Bowl** — noodles, broth, egg, herbs
- **Ember Beef** — noodles, broth, beef, chilli
- **Garden Chicken** — noodles, broth, chicken, herbs
- **Firecracker** — noodles, broth, beef, chicken, chilli (unlocks after 55s)

## Run it

Serve `game/` from any static server and open `game/index.html` in desktop
Chrome — no network, no build step, vanilla JavaScript only. For example:

```sh
cd game && python3 -m http.server 8080
```

Then open http://localhost:8080 in Chrome.

## Screenshots

The four staged scenes are taken from the real game with `?shot=`:

- `1-kitchen.jpg` — a full board, a dish mid-assembly on plate 1
- `2-chopping.jpg` — chicken mid-chop on the board
- `3-serving.jpg` — a finished Sunrise Bowl carried to the window, timer low
- `4-rush.jpg` — rush hour: a full board, one ticket about to walk

Every shot runs the real stall forward from seed 7 with a scripted cook, so
each frame is a moment a real shift reaches.

## Testing

- `node --check` each file under `game/src/` to confirm it parses.
- Serve `game/` and open `?shot=kitchen&seed=7` — the staged frame should
  appear at once with `window.__shotReady` set to true.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's library, unchanged.
- `game/index.html`, `game/style.css` — the page around the stall.
- `game/src/config.js` — numbers: layout, recipes, timings, palette.
- `game/src/random.js` — the seeded dice-roller.
- `game/src/kitchen.js` — the stall: state, orders, cooking, serving, scoring.
- `game/src/render.js` — every pixel: kitchen, cook, tickets, food, HUD.
- `game/src/input.js` — keyboard and click-to-walk.
- `game/src/audio.js` — tiny Web Audio bleeps, no files.
- `game/src/shots.js` — the staged screenshot scenes.
- `game/src/main.js` — boot and the game loop.
- `screenshots/` — the four staged renders.

Built by an AI agent for make.fun. MIT licensed.
