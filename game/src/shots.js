// The four staged scenes behind ?shot=kitchen|chopping|serving|rush, third
// pass. Each scene plays the real stall forward from a fresh seed, steered
// by a small script of walk-there / press-E / wait steps, so the frame is a
// moment a real shift reaches — never a painting. A couple of scenes then
// nudge the clock or the ticket rack so the frame shows the moment the brief
// asks for (a timer nearly out, a dinner rush in full swing); the state they
// show is one the game can reach on its own. The kitchen scene now ends
// with the cook carrying a poured drink to the window.

import {
  MODE_PLAY,
  STEP,
  dishById,
  guideChef,
  pressInteract,
  startShift,
  stationById,
  stepStall,
} from './kitchen.js';

const SHOT_SEED = 7; // every staged scene plays from this seed
const SIM_CAP = 2400; // ceiling on steps a staged walk may take

const makeRunner = (stall) => ({ // the scripted cook
  advance(seconds) {
    const steps = Math.min(SIM_CAP, Math.round(seconds / STEP));
    for (let i = 0; i < steps; i += 1) {
      stepStall(stall, STEP, null);
    }
  },
  walkTo(id) {
    const station = stationById(stall, id);
    const target = { x: station.approach[0], y: station.approach[1] };
    for (let i = 0; i < SIM_CAP; i += 1) {
      if (guideChef(stall, target, STEP)) {
        return;
      }
      stepStall(stall, STEP, null);
    }
  },
  use(id) {
    const station = stationById(stall, id);
    const target = { x: station.approach[0], y: station.approach[1] };
    // Walk all the way onto the station's approach spot before pressing:
    // stopping the moment any counter is merely in reach can leave the
    // cook closer to a neighbouring counter, and E would use that one.
    for (let i = 0; i < SIM_CAP; i += 1) {
      if (guideChef(stall, target, STEP)) {
        break;
      }
      stepStall(stall, STEP, null);
    }
    pressInteract(stall);
    stepStall(stall, STEP, null);
  },
  waitReady(id) {
    const station = stationById(stall, id);
    for (let i = 0; i < SIM_CAP; i += 1) {
      if (station.ready) {
        return;
      }
      stepStall(stall, STEP, null);
    }
  },
  wait(seconds) {
    this.advance(seconds);
  },
}); // end of the scripted cook

const addNoodlesToPlate = (run) => { // noodles onto plate 1
  run.use('bin-noodle');
  run.use('pot');
  run.waitReady('pot');
  run.use('pot');
  run.use('plate-1');
}; // end of noodles onto plate 1

const addBrothToPlate = (run) => { // broth onto plate 1
  run.use('ladle');
  run.use('plate-1');
}; // end of broth onto plate 1

const cookOn = (run, stationId, binId) => { // fetch, cook, take back
  run.use(binId);
  run.use(stationId);
  run.waitReady(stationId);
  run.use(stationId);
}; // end of fetch, cook, take back

const setTicketRack = (stall, entries) => { // pin a rack of tickets
  stall.tickets = entries.map((entry, i) => {
    const dish = dishById(entry.dish);
    const vip = entry.vip ?? false;
    return {
      id: stall.ticketSeq + 1 + i,
      dish,
      patience: entry.patience,
      maxPatience: 40,
      coins: vip ? dish.coins * 2 : dish.coins,
      vip,
      drink: entry.drink ?? null,
      drinkServed: false,
    };
  });
  stall.ticketSeq += entries.length;
}; // end of pin a rack of tickets

const stageKitchen = (stall) => { // the kitchen scene
  const run = makeRunner(stall);
  addNoodlesToPlate(run);
  addBrothToPlate(run);
  cookOn(run, 'grill', 'bin-egg');
  run.use('plate-1');
  run.use('bin-herbs');
  run.walkTo('plate-1');
  run.use('plate-1');
  stall.time = 50;
  setTicketRack(stall, [{ dish: 'garden', patience: 40, drink: 'es-teh' }]);
  run.use('drinks');
  run.waitReady('drinks');
  run.use('drinks');
  run.walkTo('window');
}; // end of the kitchen scene

const stageChopping = (stall) => { // the chopping scene
  const run = makeRunner(stall);
  run.wait(5);
  addNoodlesToPlate(run);
  run.use('bin-chicken');
  run.use('board');
  run.wait(1.8);
}; // end of the chopping scene

const stageServing = (stall) => { // the serving scene
  const run = makeRunner(stall);
  addNoodlesToPlate(run);
  addBrothToPlate(run);
  cookOn(run, 'grill', 'bin-egg');
  run.use('plate-1');
  run.use('bin-herbs');
  run.use('plate-1');
  run.use('plate-1');
  run.walkTo('window');
  stall.time = 148;
  stall.phase = 'closing';
  stall.phaseLabel = 'CLOSING RUSH';
  stall.coins = 56;
  stall.score = 640;
  stall.streak = 4;
  stall.served = 5;
  setTicketRack(stall, [{ dish: 'sunrise', patience: 10, drink: 'es-teh' }]);
}; // end of the serving scene

const stageRush = (stall) => { // the dinner-rush scene
  const run = makeRunner(stall);
  addNoodlesToPlate(run);
  addBrothToPlate(run);
  run.use('bin-beef');
  run.walkTo('grill');
  stall.time = 100;
  stall.phase = 'dinner';
  stall.phaseLabel = 'DINNER RUSH';
  stall.phaseBannerUntil = 102.5;
  stall.rushUntil = 106;
  stall.coins = 84;
  stall.score = 920;
  stall.streak = 6;
  stall.served = 8;
  stall.drinksServed = 2;
  stationById(stall, 'drinks').ready = 'es-jeruk';
  setTicketRack(stall, [
    { dish: 'laksa', patience: 9, vip: true },
    { dish: 'ember', patience: 22, drink: 'es-jeruk' },
    { dish: 'firecracker', patience: 31 },
    { dish: 'sunrise', patience: 38 },
  ]);
}; // end of the dinner-rush scene

// Aim `stall` at the named scene and hand back the screen to paint.
export const stageScene = (name, seed) => { // stage one scene
  const stall = startShift({ seed: seed ?? SHOT_SEED });
  stall.mode = MODE_PLAY;
  if (name === 'chopping') {
    stageChopping(stall);
  } else if (name === 'serving') {
    stageServing(stall);
  } else if (name === 'rush') {
    stageRush(stall);
  } else {
    stageKitchen(stall);
  }
  return stall;
}; // end of stage one scene
