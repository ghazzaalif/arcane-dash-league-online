"use strict";

// Active skills (test build): each runner's once-per-race skill, driven through the
// real takeTurn with scripted dice.

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadGame } = require("../helpers/load-game");

const FILL = "moon-moth";

function race(racers, { raceNumber = 0, positions = [], skills = true } = {}) {
  const game = loadGame();
  game.state.activeSkills = skills;
  game.setupRace({ racers, raceNumber, positions });
  game.turnOf = (index) => {
    game.state.turnIndex = game.state.turnOrder.indexOf(`p${index}`);
    game.state.busy = false;
  };
  return game;
}

async function skillTurn(game, index, ...rolls) {
  game.turnOf(index);
  game.rig(...rolls);
  await game.call("takeTurn", { skill: true });
  assert.equal(game.riggedLeft(), 0, "every scripted roll should be used");
  return game.entrant(index);
}

async function turn(game, index, ...rolls) {
  game.turnOf(index);
  game.rig(...rolls);
  await game.call("takeTurn");
  assert.equal(game.riggedLeft(), 0, "every scripted roll should be used");
  return game.entrant(index);
}

// ---------- Rules shared by every skill ----------

test("skills: once per race, and only when active skills are on", async () => {
  const game = race(["lucky-turnip", FILL]);
  assert.equal((await skillTurn(game, 0)).pos, 7);
  assert.equal(game.entrant(0).skillUsed, true);
  assert.equal(game.call("skillStatus", game.entrant(0)).ready, false);
  assert.equal((await skillTurn(game, 0, 3)).pos, 10, "second use just rolls");

  const off = race(["lucky-turnip", FILL], { skills: false });
  assert.equal((await skillTurn(off, 0, 3)).pos, 3, "skills off: a skill request is a normal roll");
  assert.equal(off.entrant(0).skillUsed, false);
});

test("skills: can't be used while tripped", async () => {
  const game = race(["lucky-turnip", FILL]);
  game.entrant(0).tripped = true;
  assert.equal(game.call("skillStatus", game.entrant(0)).ready, false);
  assert.equal((await skillTurn(game, 0)).pos, 0);
  assert.equal(game.entrant(0).skillUsed, false, "the skill is kept for later");
});

test("skills: an online guest's skill request reaches the host's rules", async () => {
  const game = race(["lucky-turnip", FILL]);
  game.state.players[0].controllerId = "guest";
  game.network.isHost = true;
  game.turnOf(0);
  await game.call("handleRemoteAction", "guest", "take_turn", { skill: true });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(game.entrant(0).pos, 7);
  assert.equal(game.entrant(0).skillUsed, true);
});

test("every runner has an active skill with a name, text and tuning", () => {
  const game = loadGame();
  for (const racer of game.RACERS) {
    assert.ok(racer.active?.name && racer.active.text && racer.active.tune, racer.id);
  }
});

test("bots always end up using ready skills before the race is decided", async () => {
  const game = loadGame({ seed: 3 });
  const { state, RACERS } = game;
  let unusedAtFinish = 0;
  let finishers = 0;
  for (let i = 0; i < 200; i += 1) {
    state.activeSkills = true;
    game.setupRace({ racers: game.call("shuffle", RACERS).slice(0, 3).map((racer) => racer.id), raceNumber: i % 2 });
    let guard = 0;
    while (!state.raceOver && guard++ < 1000) await game.call("autoTurn");
    for (const entrant of state.finishers) {
      finishers += 1;
      if (!entrant.skillUsed) unusedAtFinish += 1;
    }
  }
  assert.ok(unusedAtFinish / finishers < 0.25, `${unusedAtFinish} of ${finishers} podium runners never used their skill`);
});

// ---------- Each skill ----------

test("Clockwork Hare: Overwind adds an extra d4", async () => {
  const game = race(["clockwork-hare", FILL]);
  assert.equal((await skillTurn(game, 0, 3, 2)).pos, 5);
});

test("Moss Golem: Stone Wall stops rivals at its space until its next turn", async () => {
  const game = race(["moss-golem", FILL], { positions: [10, 12] });
  assert.equal((await skillTurn(game, 0)).pos, 14);
  assert.equal(game.entrant(0).wall, true);
  assert.equal((await turn(game, 1, 5)).pos, 14, "rolled 5 (+1 odd) but stopped at the wall");
  await turn(game, 0);
  assert.equal(game.entrant(0).wall, false, "the wall drops on the golem's next turn");
});

test("Moss Golem: no wall on the start line", () => {
  const game = race(["moss-golem", FILL]);
  assert.equal(game.call("skillStatus", game.entrant(0)).ready, false);
});

test("Comet Kid: Afterburner keeps the higher of two dice and flares on a 5", async () => {
  const game = race(["comet-kid", FILL]);
  assert.equal((await skillTurn(game, 0, 2, 5)).pos, 8);
});

test("Bubble Witch: Bubble Trap trips the nearest rival ahead", async () => {
  const game = race(["bubble-witch", FILL], { positions: [0, 8] });
  assert.equal((await skillTurn(game, 0, 3)).pos, 3);
  assert.equal(game.entrant(1).tripped, true);
});

test("Echo Fox: Copycat moves what the last runner moved", async () => {
  const game = race(["echo-fox", FILL]);
  game.state.lastMove = 5;
  assert.equal((await skillTurn(game, 0)).pos, 5);
});

test("Anchor Knight: Anchor Chain pulls the nearest rival ahead back", async () => {
  const game = race(["anchor-knight", FILL], { positions: [4, 9] });
  assert.equal((await skillTurn(game, 0, 2)).pos, 6);
  assert.equal(game.entrant(1).pos, 4);
});

test("Lantern Sprite: Beacon adds 2 per runner ahead (on top of Catch-Up Glow)", async () => {
  const game = race(["lantern-sprite", FILL, FILL], { positions: [0, 5, 6] });
  assert.equal((await skillTurn(game, 0, 3)).pos, 9);
});

test("Prism Slime: Refraction swaps with the nearest rival ahead", async () => {
  const game = race(["prism-slime", FILL], { positions: [5, 8] });
  assert.equal((await skillTurn(game, 0, 2)).pos, 10);
  assert.equal(game.entrant(1).pos, 5);
});

test("Storm Crow: Lightning Rod knocks the leader back 5, and needs someone ahead", async () => {
  const game = race(["storm-crow", FILL], { positions: [2, 12] });
  assert.equal((await skillTurn(game, 0, 4)).pos, 6);
  assert.equal(game.entrant(1).pos, 7);
  const leading = race(["storm-crow", FILL], { positions: [9, 2] });
  assert.equal(leading.call("skillStatus", leading.entrant(0)).ready, false);
});

test("Moon Moth: Full Moon rolls a d12", async () => {
  const game = race(["moon-moth", "comet-kid"]);
  assert.equal((await skillTurn(game, 0, 11)).pos, 12, "11 plus the odd-roll bonus");
});

test("Gear Goblin: Overclock adds 2 plus the Tune-Up bonus again", async () => {
  const game = race(["gear-goblin", FILL]);
  game.entrant(0).charge = 2;
  assert.equal((await skillTurn(game, 0, 4)).pos, 10);
});

test("Frost Yak: Deep Freeze takes 3 off every rival's next move", async () => {
  const game = race(["frost-yak", FILL], { positions: [0, 10] });
  assert.equal((await skillTurn(game, 0, 2)).pos, 2);
  assert.equal((await turn(game, 1, 5)).pos, 13, "5 +1 odd -3 frozen");
  assert.equal((await turn(game, 1, 5)).pos, 19, "only the next move");
});

test("Portal Pup: Portal warps onto the nearest rival ahead, then Blink fires", async () => {
  const game = race(["portal-pup", FILL], { positions: [2, 6] });
  assert.equal((await skillTurn(game, 0)).pos, 9);
});

test("Quake Beetle: Earthquake slides every rival on the track back 3", async () => {
  const game = race(["quake-beetle", FILL, FILL], { positions: [0, 5, 9] });
  assert.equal((await skillTurn(game, 0, 1)).pos, 1);
  assert.equal(game.entrant(1).pos, 2);
  assert.equal(game.entrant(2).pos, 6);
});

test("Lucky Turnip: Lucky Seven moves exactly 7", async () => {
  const game = race(["lucky-turnip", FILL]);
  assert.equal((await skillTurn(game, 0)).pos, 7);
});

test("Shadow Cat: Pounce adds 3 for each rival passed", async () => {
  const game = race(["shadow-cat", FILL, FILL, FILL], { positions: [0, 2, 4, 9] });
  // Slipstream makes the two occupied spaces free (5 becomes 7), passing two rivals: +6.
  assert.equal((await skillTurn(game, 0, 5)).pos, 13);
});

test("Crown Crab: Royal Decree adds 2 per rival behind", async () => {
  const game = race(["crown-crab", FILL, FILL], { positions: [10, 2, 4] });
  assert.equal((await skillTurn(game, 0, 3)).pos, 18, "3 +1 royal pace +4 decree");
});

test("Nap Dragon: Wide Awake wakes from a nap and keeps the higher d8", async () => {
  const game = race(["nap-dragon", FILL]);
  game.entrant(0).napping = true;
  assert.equal(game.call("skillStatus", game.entrant(0)).ready, true);
  assert.equal((await skillTurn(game, 0, 3, 6)).pos, 6);
  assert.equal(game.entrant(0).napping, false);
});

test("Spark Snail: Discharge adds 1 per turn taken, max 3", async () => {
  const game = race(["spark-snail", FILL]);
  game.entrant(0).turns = 5;
  assert.equal((await skillTurn(game, 0, 1)).pos, 6, "1 +2 stored energy +3 discharge");
});

test("Wisp Twins: Twin Swap cancels the even-turn loss, and waits for an even turn", async () => {
  const game = race(["wisp-twins", FILL]);
  assert.equal(game.call("skillStatus", game.entrant(0)).ready, false, "turn 1 is odd");
  game.entrant(0).turns = 1;
  assert.equal((await skillTurn(game, 0, 4)).pos, 4);
});

test("River Otter: Whirlpool pulls rivals within 4 ahead onto its space", async () => {
  const game = race(["river-otter", FILL, FILL, FILL], { positions: [5, 7, 9, 12] });
  assert.equal((await skillTurn(game, 0, 3)).pos, 10, "3 +2 Draft Current");
  assert.equal(game.entrant(1).pos, 5);
  assert.equal(game.entrant(2).pos, 5);
  assert.equal(game.entrant(3).pos, 12);
});

test("Meteor Mouse: Early Launch doubles from 5+ behind", async () => {
  const game = race(["meteor-mouse", FILL], { positions: [4, 10] });
  assert.equal((await skillTurn(game, 0, 3)).pos, 10);
  const close = race(["meteor-mouse", FILL], { positions: [8, 10] });
  assert.equal(close.call("skillStatus", close.entrant(0)).ready, false);
});

test("Mirror Owl: Owl's Eye keeps the highest of three dice, plus 1", async () => {
  const game = race(["mirror-owl", FILL]);
  assert.equal((await skillTurn(game, 0, 2, 5, 3)).pos, 6);
});

test("Pepper Pixie: Hot Sauce adds 2, or 4 from space 20", async () => {
  const late = race(["pepper-pixie", FILL], { positions: [21, 0] });
  assert.equal((await skillTurn(late, 0, 2)).pos, 27);
  const early = race(["pepper-pixie", FILL], { positions: [3, 0] });
  assert.equal((await skillTurn(early, 0, 2)).pos, 7);
});
