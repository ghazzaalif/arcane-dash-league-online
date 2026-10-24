"use strict";

// Analytics: a full local game (you + bots) sends the expected Umami events, only
// when the tracker is present, and never sends player-entered names.

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadGame } = require("../helpers/load-game");

const tick = () => new Promise((resolve) => setImmediate(resolve));

async function playLocalGame(game) {
  const { state, ctx } = game;
  const local = ctx.vmRun("localConfig");
  local[0].name = "Secret Name";
  ctx.vmRun("localTeamCount = 3");
  game.call("startGame");
  for (let guard = 0; guard < 20000 && state.phase !== "final"; guard += 1) {
    const human = state.players.find((player) => !player.isBot);
    if (state.phase === "draft" && game.call("currentDraftPlayer") === human) {
      game.call("chooseDraftRacer", state.draftPool[0].id);
    } else if (state.phase === "selection" && game.call("currentSelectionPlayer") === human) {
      game.call("chooseRaceRacer", human.team.find((slot) => !slot.used).racerId);
    } else if (state.phase === "race" && !state.busy && !state.raceOver && game.call("currentEntrant")?.playerId === human.id) {
      await game.takeTurn();
    } else if (state.phase === "results") {
      if (state.raceNumber === 3) game.call("showFinalResults");
      else {
        state.raceNumber += 1;
        game.call("beginRaceSelection");
      }
    }
    await tick();
  }
  assert.equal(state.phase, "final", "the game should reach the final standings");
}

function withVmRun(game) {
  const vm = require("vm");
  game.ctx.vmRun = (code) => vm.runInContext(code, game.ctx);
  return game;
}

test("analytics: a local game sends start, human picks, four races and a finish", { timeout: 60000 }, async () => {
  const game = withVmRun(loadGame({ seed: 7 }));
  const events = [];
  game.ctx.umami = { track: (name, data) => events.push({ name, data }) };
  await playLocalGame(game);

  const names = events.map((event) => event.name);
  assert.deepEqual(names.filter((name) => name === "game-start").length, 1);
  // Data objects come from the game's VM realm, so compare as plain JSON.
  assert.deepEqual(JSON.parse(JSON.stringify(events.find((event) => event.name === "game-start").data)), { mode: "local", teams: 3, humans: 1, bots: 2, skills: true });

  const picks = events.filter((event) => event.name === "draft-pick");
  assert.equal(picks.length, 4, "only the human's four picks are sent, not the bots'");
  for (const pick of picks) assert.ok(game.RACERS.some((racer) => racer.name === pick.data.runner));

  const races = events.filter((event) => event.name === "race-finish");
  assert.deepEqual(races.map((event) => event.data.race).join(","), "1,2,3,4");
  assert.deepEqual(races.map((event) => event.data.track).join(","), "calm,chaos,calm,chaos");
  for (const race of races) assert.ok(race.data.first && race.data.second);

  const finish = events.filter((event) => event.name === "game-finish");
  assert.equal(finish.length, 1);
  assert.match(finish[0].data.winner, /^(human|bot|tie)$/);

  assert.ok(!JSON.stringify(events).includes("Secret Name"), "team names are never sent");
});

test("analytics: without the tracker the game runs and nothing throws", { timeout: 60000 }, async () => {
  const game = withVmRun(loadGame({ seed: 8 }));
  await playLocalGame(game);
});

test("analytics: a tracker that throws cannot break the game", { timeout: 60000 }, async () => {
  const game = withVmRun(loadGame({ seed: 9 }));
  game.ctx.umami = { track() { throw new Error("blocked"); } };
  await playLocalGame(game);
});
