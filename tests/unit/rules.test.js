"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadGame } = require("../helpers/load-game");

// Filler runners whose powers only act on their own turn, so they stay inert here.
const FILL = "moon-moth";

function race(racers, { raceNumber = 0, positions = [] } = {}) {
  const game = loadGame();
  game.setupRace({ racers, raceNumber, positions });
  game.turnOf = (index) => {
    game.state.turnIndex = game.state.turnOrder.indexOf(`p${index}`);
    game.state.busy = false;
  };
  game.turnOf(0);
  return game;
}

async function turn(game, index, ...rolls) {
  game.turnOf(index);
  game.rig(...rolls);
  await game.takeTurn();
  assert.equal(game.riggedLeft(), 0, "every scripted roll should be used");
  return game.entrant(index);
}

// ---------- Core flow ----------

test("draft: snake order reverses after each pass", () => {
  const game = loadGame();
  game.state.players = [{}, {}, {}];
  assert.deepEqual(Array.from(game.call("makeSnakeOrder", 0)), [0, 1, 2, 2, 1, 0]);
  assert.deepEqual(Array.from(game.call("makeSnakeOrder", 1)), [1, 2, 0, 0, 2, 1]);
});

test("draft: every team ends with four distinct runners and nobody shares one", () => {
  for (const count of [2, 3, 4]) {
    const game = loadGame({ seed: count });
    const { state } = game;
    state.players = Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `T${i}`, isBot: false, controllerId: null, color: "#fff", team: [], score: 0 }));
    state.deck = game.call("shuffle", game.RACERS);
    state.draftWave = 1;
    game.call("beginDraftWave");
    assert.equal(state.draftPool.length, count * 2 + 1, "pool offers one spare runner per wave");
    let guard = 0;
    while (state.phase === "draft" && guard++ < 50) game.call("chooseDraftRacer", state.draftPool[0].id);
    assert.equal(state.phase, "selection");
    const all = state.players.flatMap((player) => player.team.map((slot) => slot.racerId));
    assert.equal(all.length, count * 4);
    assert.equal(new Set(all).size, all.length, "no runner drafted twice");
    state.players.forEach((player) => assert.equal(player.team.length, 4));
  }
});

test("selection: each runner can race once, and the race starts when all teams pick", () => {
  const game = loadGame();
  const { state } = game;
  state.players = ["clockwork-hare", "moss-golem"].map((id, i) => ({ id: `p${i}`, name: `T${i}`, isBot: false, controllerId: null, color: "#fff", team: [{ racerId: id, used: false }, { racerId: i ? "comet-kid" : "echo-fox", used: false }], score: 0 }));
  state.raceNumber = 0;
  game.call("beginRaceSelection");
  game.call("chooseRaceRacer", "clockwork-hare");
  game.call("chooseRaceRacer", "clockwork-hare"); // not on team 2: ignored
  assert.equal(state.phase, "selection");
  game.call("chooseRaceRacer", "moss-golem");
  assert.equal(state.phase, "race");
  assert.equal(state.players[0].team[0].used, true);
  assert.equal(state.entrants.length, 2);
});

test("race: first two to space 30 finish in order and score that race's points", async () => {
  const game = race([FILL, FILL, FILL], { raceNumber: 2, positions: [27, 26, 0] });
  // raceNumber 2: turn order starts with p2
  await turn(game, 0, 4);
  assert.equal(game.entrant(0).finished, true);
  assert.equal(game.entrant(0).finishPlace, 1);
  assert.equal(game.entrant(0).pos, 30, "overshoot clamps to the finish");
  await turn(game, 1, 4);
  assert.equal(game.state.raceOver, true);
  assert.equal(game.state.phase, "results");
  const [first, second] = game.RACE_POINTS[2];
  assert.equal(game.state.players[0].score, first);
  assert.equal(game.state.players[1].score, second);
  assert.equal(game.state.players[2].score, 0);
});

test("race: turns skip runners who already finished", async () => {
  const game = race([FILL, FILL, FILL], { positions: [29, 0, 0] });
  await turn(game, 0, 2);
  assert.equal(game.state.turnOrder[game.state.turnIndex], "p1");
  await turn(game, 1, 2);
  await turn(game, 2, 2);
  assert.equal(game.state.turnOrder[game.state.turnIndex], "p1", "p0 is skipped");
});

test("track: calm races ignore chaos spaces", async () => {
  const game = race([FILL, FILL], { raceNumber: 0, positions: [3, 0] });
  await turn(game, 0, 2); // lands on 5, a boost on chaos tracks; 2 is even so no moth bonus
  assert.equal(game.entrant(0).pos, 5);
});

test("track: chaos boost, setback and trip spaces", async () => {
  const game = race(["lucky-turnip", "lucky-turnip", "lucky-turnip"], { raceNumber: 1, positions: [1, 5, 11] });
  await turn(game, 0, 4); // 1 -> 5 boost +2 -> 7
  assert.equal(game.entrant(0).pos, 7);
  await turn(game, 1, 4); // 5 -> 9 setback -2 -> 7
  assert.equal(game.entrant(1).pos, 7);
  await turn(game, 2, 4); // 11 -> 15 trip
  assert.equal(game.entrant(2).pos, 15);
  assert.equal(game.entrant(2).tripped, true);
  await turn(game, 2); // stands up: no roll consumed, no move
  assert.equal(game.entrant(2).pos, 15);
  assert.equal(game.entrant(2).tripped, false);
});

test("movement never goes below the start", async () => {
  const game = race(["quake-beetle", FILL], { positions: [3, 1] });
  await turn(game, 0, 5); // beetle to 8, rival at 1 is 7 away: out of range
  assert.equal(game.entrant(1).pos, 1);
  const game2 = race(["quake-beetle", FILL], { positions: [0, 1] });
  await turn(game2, 0, 4); // beetle 0 -> 4, rival at 1 within 4: slides back 2 but stops at 0
  assert.equal(game2.entrant(1).pos, 0);
});

// ---------- Every runner power ----------

test("Clockwork Hare rerolls a 1 and adds 1", async () => {
  const game = race(["clockwork-hare", FILL]);
  assert.equal((await turn(game, 0, 1, 4)).pos, 5);
  assert.equal((await turn(game, 0, 2)).pos, 7, "a 2 is not rerolled");
});

test("Moss Golem moves exactly 4, or 5 when 6+ behind the leader", async () => {
  const game = race(["moss-golem", FILL], { positions: [0, 3] });
  assert.equal((await turn(game, 0)).pos, 4, "no die is rolled");
  const behind = race(["moss-golem", FILL], { positions: [0, 6] });
  assert.equal((await turn(behind, 0)).pos, 5);
});

test("Comet Kid turns a natural 6 into 9", async () => {
  const game = race(["comet-kid", FILL]);
  assert.equal((await turn(game, 0, 6)).pos, 9);
  assert.equal((await turn(game, 0, 5)).pos, 14);
});

test("Bubble Witch ignores setbacks and bounces when a rival lands on her", async () => {
  const game = race(["bubble-witch", "lucky-turnip"], { raceNumber: 1, positions: [7, 1] });
  assert.equal((await turn(game, 0, 2)).pos, 9, "setback on 9 is ignored");
  const bounce = race(["bubble-witch", "lucky-turnip"], { positions: [4, 1] });
  await turn(bounce, 1, 3); // turnip lands on 4 where the witch is
  assert.equal(bounce.entrant(0).pos, 6);
});

test("Echo Fox moves 1 when a rival ahead rolls a 6, and 2 more on its own 6", async () => {
  const game = race(["echo-fox", "lucky-turnip"], { positions: [0, 2] });
  await turn(game, 1, 6);
  assert.equal(game.entrant(0).pos, 1);
  assert.equal((await turn(game, 0, 6)).pos, 9);
});

test("Anchor Knight turns a 1 into 3 and cannot be pushed back", async () => {
  const game = race(["anchor-knight", "lucky-turnip"], { raceNumber: 1, positions: [6, 0] });
  assert.equal((await turn(game, 0, 1)).pos, 9, "1 counts as 3, then the setback on 9 is ignored");
  const pushed = race(["anchor-knight", "quake-beetle"], { positions: [3, 0] });
  await turn(pushed, 1, 4);
  assert.equal(pushed.entrant(0).pos, 3);
});

test("Lantern Sprite gains 1 per runner ahead when trailing everyone by 2+", async () => {
  const game = race(["lantern-sprite", FILL, FILL], { positions: [2, 5, 6] });
  assert.equal((await turn(game, 0, 4)).pos, 8);
  const close = race(["lantern-sprite", FILL, FILL], { positions: [4, 5, 9] });
  assert.equal((await turn(close, 0, 4)).pos, 8, "only 1 behind the nearest runner: no bonus");
});

test("Prism Slime slides rivals within 3 spaces back 1", async () => {
  const game = race(["prism-slime", FILL, FILL], { positions: [0, 5, 10] });
  await turn(game, 0, 4);
  assert.equal(game.entrant(1).pos, 4);
  assert.equal(game.entrant(2).pos, 10);
});

test("Storm Crow jumps to the leader on a 1 or 2, never moving less than the roll", async () => {
  const game = race(["storm-crow", FILL], { positions: [0, 12] });
  assert.equal((await turn(game, 0, 1)).pos, 12);
  const near = race(["storm-crow", FILL], { positions: [10, 11] });
  assert.equal((await turn(near, 0, 2)).pos, 12);
  const high = race(["storm-crow", FILL], { positions: [0, 12] });
  assert.equal((await turn(high, 0, 3)).pos, 3);
});

test("Moon Moth gains 1 on odd rolls", async () => {
  const game = race(["moon-moth", "lucky-turnip"]);
  assert.equal((await turn(game, 0, 3)).pos, 4);
  assert.equal((await turn(game, 0, 4)).pos, 8);
});

test("Gear Goblin adds +1 to later rolls for each 1 rolled, up to +3", async () => {
  const game = race(["gear-goblin", FILL]);
  assert.equal((await turn(game, 0, 1)).pos, 1);
  assert.equal(game.entrant(0).charge, 1);
  assert.equal((await turn(game, 0, 3)).pos, 5);
  game.entrant(0).charge = 3;
  await turn(game, 0, 1);
  assert.equal(game.entrant(0).charge, 3, "capped at +3");
});

test("Frost Yak chills rivals starting within 3 ahead by 2, never below 1", async () => {
  const game = race(["frost-yak", "lucky-turnip"], { positions: [2, 4] });
  assert.equal((await turn(game, 1, 5)).pos, 7);
  const tiny = race(["frost-yak", "lucky-turnip"], { positions: [2, 4] });
  assert.equal((await turn(tiny, 1, 1)).pos, 5, "a 1 cannot be chilled");
  const far = race(["frost-yak", "lucky-turnip"], { positions: [2, 6] });
  assert.equal((await turn(far, 1, 5)).pos, 11);
});

test("Portal Pup blinks 3 after landing on a rival, and blinks chain", async () => {
  const game = race(["portal-pup", FILL, FILL], { positions: [0, 3, 6] });
  assert.equal((await turn(game, 0, 3)).pos, 9);
});

test("Quake Beetle slides rivals within 4 back 2 on a 4, 5 or 6", async () => {
  const game = race(["quake-beetle", FILL, FILL, FILL], { positions: [0, 5, 8, 9] });
  await turn(game, 0, 4);
  assert.equal(game.entrant(1).pos, 3);
  assert.equal(game.entrant(2).pos, 6);
  assert.equal(game.entrant(3).pos, 9, "5 away: out of range");
  const low = race(["quake-beetle", FILL], { positions: [0, 5] });
  await turn(low, 0, 3);
  assert.equal(low.entrant(1).pos, 5);
});

test("Lucky Turnip counts a 2 as 5", async () => {
  const game = race(["lucky-turnip", FILL]);
  assert.equal((await turn(game, 0, 2)).pos, 5);
});

test("Shadow Cat crosses its first 2 occupied spaces for free", async () => {
  const game = race(["shadow-cat", FILL, FILL], { positions: [0, 1, 2] });
  assert.equal((await turn(game, 0, 3)).pos, 5);
});

test("Crown Crab gains 1 within 4 of the lead", async () => {
  const game = race(["crown-crab", FILL], { positions: [0, 4] });
  assert.equal((await turn(game, 0, 3)).pos, 4);
  const far = race(["crown-crab", FILL], { positions: [0, 5] });
  assert.equal((await turn(far, 0, 3)).pos, 3);
});

test("Nap Dragon rolls a d8 and naps after an 8", async () => {
  const game = race(["nap-dragon", FILL]);
  assert.equal((await turn(game, 0, 7)).pos, 7);
  assert.equal((await turn(game, 0, 8)).pos, 15);
  assert.equal(game.entrant(0).napping, true);
  assert.equal((await turn(game, 0)).pos, 15, "nap turn rolls nothing");
  assert.equal(game.entrant(0).napping, false);
});

test("Spark Snail gains 2 every third turn", async () => {
  const game = race(["spark-snail", FILL]);
  await turn(game, 0, 1);
  await turn(game, 0, 1);
  assert.equal((await turn(game, 0, 1)).pos, 5);
});

test("Wisp Twins gain 3 on odd turns and lose 3 on even turns (min 1)", async () => {
  const game = race(["wisp-twins", FILL]);
  assert.equal((await turn(game, 0, 2)).pos, 5);
  assert.equal((await turn(game, 0, 2)).pos, 6);
  assert.equal((await turn(game, 0, 6)).pos, 15);
  assert.equal((await turn(game, 0, 6)).pos, 18);
});

test("River Otter gains 1 per rival on its space or the next, max 2", async () => {
  const game = race(["river-otter", FILL, FILL, FILL], { positions: [3, 3, 4, 4] });
  assert.equal((await turn(game, 0, 2)).pos, 7);
});

test("Meteor Mouse doubles its roll from 8+ behind the leader", async () => {
  const game = race(["meteor-mouse", FILL], { positions: [0, 8] });
  assert.equal((await turn(game, 0, 3)).pos, 6);
  const close = race(["meteor-mouse", FILL], { positions: [0, 7] });
  assert.equal((await turn(close, 0, 3)).pos, 3);
});

test("Mirror Owl gains the difference when the previous runner rolled higher, max 2", async () => {
  const game = race(["mirror-owl", "lucky-turnip"]);
  game.state.previousNaturalRoll = 6;
  assert.equal((await turn(game, 0, 1)).pos, 3);
  game.state.previousNaturalRoll = 4;
  assert.equal((await turn(game, 0, 3)).pos, 7);
});

test("Pepper Pixie surges 4 the first time it crosses space 20", async () => {
  const game = race(["pepper-pixie", FILL], { positions: [18, 0] });
  assert.equal((await turn(game, 0, 3)).pos, 25);
  game.entrant(0).pos = 18;
  assert.equal((await turn(game, 0, 3)).pos, 21, "only once per race");
});

test("every runner has a power, a role and tuning data", () => {
  const game = loadGame();
  assert.equal(game.RACERS.length, 24);
  const ids = new Set();
  for (const racer of game.RACERS) {
    assert.ok(racer.id && !ids.has(racer.id), `unique id ${racer.id}`);
    ids.add(racer.id);
    for (const key of ["name", "role", "tagline", "powerName", "power"]) assert.ok(racer[key], `${racer.id}.${key}`);
    assert.equal(typeof racer.tune, "object");
  }
});
