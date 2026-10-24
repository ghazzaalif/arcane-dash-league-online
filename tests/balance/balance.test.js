"use strict";

// Balance guard: plays thousands of seeded races with the real rules and checks that
// every runner earns close to a fair share of points in 2, 3 and 4-team games.
// Runs twice: classic rules, and with active skills on (bots use them via autoTurn).
// Seeded, so the result is the same on every run.

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadGame } = require("../helpers/load-game");

const RACES = Number(process.env.BALANCE_RACES || 4000);
const LOW = 0.84;
const HIGH = 1.16;
const CELL_LOW = 0.78;
const CELL_HIGH = 1.24;

async function simulate(field, seed, skills) {
  const game = loadGame({ seed });
  const { state, RACERS } = game;
  const tally = Object.fromEntries(RACERS.map((racer) => [racer.id, { n: 0, first: 0, second: 0 }]));
  for (let i = 0; i < RACES; i += 1) {
    const picks = game.call("shuffle", RACERS).slice(0, field).map((racer) => racer.id);
    state.activeSkills = skills;
    game.setupRace({ racers: picks, raceNumber: i % 2 });
    let guard = 0;
    while (!state.raceOver && guard++ < 1000) await game.call("autoTurn");
    const order = [...state.entrants].sort((a, b) => (a.finishPlace || 99) - (b.finishPlace || 99) || b.pos - a.pos);
    order.forEach((entrant, place) => {
      const row = tally[entrant.racerId];
      row.n += 1;
      if (place === 0) row.first += 1;
      if (place === 1) row.second += 1;
    });
  }
  return Object.fromEntries(Object.entries(tally).map(([id, row]) => [id, ((2 * row.first + row.second) / row.n) / (3 / field)]));
}

for (const skills of [false, true]) {
test(`balance${skills ? " with active skills" : ""}: every runner earns ${LOW}x-${HIGH}x of a fair share (${RACES} races per field size)`, { timeout: 600000 }, async () => {
  const fields = await Promise.all([2, 3, 4].map((field) => simulate(field, 1000 + field, skills)));
  const failures = [];
  const report = [];
  for (const id of Object.keys(fields[0])) {
    const values = fields.map((field) => field[id]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    report.push(`${id.padEnd(16)} ${values.map((v) => v.toFixed(2)).join("  ")}  avg ${avg.toFixed(2)}`);
    if (avg < LOW || avg > HIGH) failures.push(`${id} averages ${avg.toFixed(2)}`);
    values.forEach((value, index) => {
      if (value < CELL_LOW || value > CELL_HIGH) failures.push(`${id} is ${value.toFixed(2)} in ${index + 2}-team games`);
    });
  }
  if (process.env.BALANCE_REPORT) console.log([`${skills ? "skills on" : "classic"}`, "runner           f2    f3    f4", ...report].join("\n"));
  assert.deepEqual(failures, [], `\n${report.join("\n")}`);
});
}
