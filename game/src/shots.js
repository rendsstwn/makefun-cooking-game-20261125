// The four staged scenes behind ?shot=kitchen|chopping|serving|rush. Each
// one plays the real stall forward from a fresh seed, steered by a small
// script of walk-there / press-E / wait steps, so the frame is a moment a
// real shift reaches — never a painting. A couple of scenes then nudge the
// clock or the ticket rack so the frame shows the moment the brief asks for
// (a timer nearly out, a rush in full swing); the state they show is one the
// game can reach on its own.

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

const SHOT_SEED = 7;
const SIM_CAP = 2400;

function makeRunner(stall) {
  return {
    advance(seconds) {
      const steps = Math.min(SIM_CAP, Math.round(seconds / STEP));
      for (let i = 0; i < steps; i += 1) stepStall(stall, STEP, null);
    },
    walkTo(id) {
      const station = stationById(stall, id);
      const target = { x: station.approach[0], y: station.approach[1] };
      for (let i = 0; i < SIM_CAP; i += 1) {
        if (guideChef(stall, target, STEP)) return;
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
        if (guideChef(stall, target, STEP)) break;
        stepStall(stall, STEP, null);
      }
      pressInteract(stall);
      stepStall(stall, STEP, null);
    },
    waitReady(id) {
      const station = stationById(stall, id);
      for (let i = 0; i < SIM_CAP; i += 1) {
        if (station.ready) return;
        stepStall(stall, STEP, null);
      }
    },
    wait(seconds) {
      this.advance(seconds);
    },
  };
}

function addNoodlesToPlate(run) {
  run.use('bin-noodle');
  run.use('pot');
  run.waitReady('pot');
  run.use('pot');
  run.use('plate-1');
}

function addBrothToPlate(run) {
  run.use('ladle');
  run.use('plate-1');
}

function cookOn(run, stationId, binId) {
  run.use(binId);
  run.use(stationId);
  run.waitReady(stationId);
  run.use(stationId);
}

function setTicketRack(stall, entries) {
  stall.tickets = entries.map((entry, i) => {
    const dish = dishById(entry.dish);
    return {
      id: stall.ticketSeq + 1 + i,
      dish,
      patience: entry.patience,
      maxPatience: 40,
      coins: dish.coins,
    };
  });
  stall.ticketSeq += entries.length;
}

function stageKitchen(stall) {
  const run = makeRunner(stall);
  addNoodlesToPlate(run);
  addBrothToPlate(run);
  cookOn(run, 'grill', 'bin-egg');
  run.use('plate-1');
  run.use('bin-herbs');
  run.walkTo('plate-1');
}

function stageChopping(stall) {
  const run = makeRunner(stall);
  run.wait(5);
  addNoodlesToPlate(run);
  run.use('bin-chicken');
  run.use('board');
  run.wait(1.8);
}

function stageServing(stall) {
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
  stall.coins = 56;
  stall.score = 640;
  stall.streak = 4;
  stall.served = 5;
  setTicketRack(stall, [{ dish: 'sunrise', patience: 10 }]);
}

function stageRush(stall) {
  const run = makeRunner(stall);
  addNoodlesToPlate(run);
  addBrothToPlate(run);
  run.use('bin-beef');
  run.walkTo('grill');
  stall.time = 126;
  stall.rushUntil = 132;
  stall.coins = 84;
  stall.score = 920;
  stall.streak = 6;
  stall.served = 8;
  setTicketRack(stall, [
    { dish: 'ember', patience: 9 },
    { dish: 'garden', patience: 22 },
    { dish: 'firecracker', patience: 31 },
    { dish: 'sunrise', patience: 38 },
  ]);
}

// Set `stall` to the named scene and return the screen to paint over it.
export function stageScene(name, seed) {
  const stall = startShift({ seed: seed ?? SHOT_SEED });
  stall.mode = MODE_PLAY;
  if (name === 'chopping') stageChopping(stall);
  else if (name === 'serving') stageServing(stall);
  else if (name === 'rush') stageRush(stall);
  else stageKitchen(stall);
  return stall;
}
