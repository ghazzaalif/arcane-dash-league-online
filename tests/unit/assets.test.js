"use strict";

// Spec for the board and runner art. Written before the compact board and pixel
// sprites existed, so it describes what "done" means for that work.

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadGame } = require("../helpers/load-game");

const game = loadGame();
const { ArcaneMaps, RunnerArt } = game.ctx;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ---------- Board ----------

test("board: 31 spaces (start + 30) and four themed tracks", () => {
  assert.equal(ArcaneMaps.SPACE_COUNT, game.TRACK_LENGTH + 1);
  assert.equal(ArcaneMaps.THEMES.length, 4);
  for (let race = 0; race < 4; race += 1) assert.ok(ArcaneMaps.themeFor(race).name);
});

for (const portrait of [false, true]) {
  const label = portrait ? "portrait" : "landscape";

  test(`board (${label}): every tile sits fully inside the board`, () => {
    const { w, h } = ArcaneMaps.size(portrait);
    const half = ArcaneMaps.TILE / 2;
    for (let i = 0; i <= game.TRACK_LENGTH; i += 1) {
      const [x, y] = ArcaneMaps.spacePoint(i, portrait);
      assert.ok(x - half >= 0 && x + half <= w && y - half >= 0 && y + half <= h, `space ${i} at ${x},${y} spills off a ${w}x${h} board`);
    }
  });

  test(`board (${label}): tiles touch like a printed track, evenly spaced`, () => {
    const steps = [];
    for (let i = 0; i < game.TRACK_LENGTH; i += 1) steps.push(dist(ArcaneMaps.spacePoint(i, portrait), ArcaneMaps.spacePoint(i + 1, portrait)));
    const longest = Math.max(...steps);
    const shortest = Math.min(...steps);
    assert.ok(longest <= ArcaneMaps.TILE * 1.15, `gap between neighbours (${longest.toFixed(1)}) is wider than a tile`);
    assert.ok(longest / shortest <= 1.12, "spacing should be even all the way round");
  });

  test(`board (${label}): no two tiles overlap`, () => {
    for (let i = 0; i <= game.TRACK_LENGTH; i += 1) {
      for (let j = i + 1; j <= game.TRACK_LENGTH; j += 1) {
        assert.ok(dist(ArcaneMaps.spacePoint(i, portrait), ArcaneMaps.spacePoint(j, portrait)) >= ArcaneMaps.TILE * 0.88, `spaces ${i} and ${j} overlap`);
      }
    }
  });

  test(`board (${label}): compact like a board game, with start next to the finish`, () => {
    const { w, h } = ArcaneMaps.size(portrait);
    const area = w * h;
    const trackArea = (game.TRACK_LENGTH + 1) * ArcaneMaps.TILE ** 2;
    assert.ok(area / trackArea <= 3.6, `board is ${(area / trackArea).toFixed(1)}x the track's own area: too sprawling`);
    const ratio = w / h;
    assert.ok(ratio >= 0.6 && ratio <= 1.6, `aspect ratio ${ratio.toFixed(2)} should be near square`);
    // A closed loop on a square grid always has an even number of slots, so the 31 spaces
    // share the loop with one start/finish gate tile: finish and start sit either side of it.
    assert.ok(dist(ArcaneMaps.spacePoint(0, portrait), ArcaneMaps.spacePoint(game.TRACK_LENGTH, portrait)) <= ArcaneMaps.TILE * 2.05, "the track loops back so the finish meets the start");
  });
}

test("board: every theme renders all 31 spaces and chaos tiles where the rules expect them", () => {
  for (let race = 0; race < 4; race += 1) {
    const chaos = race % 2 === 1;
    for (const portrait of [false, true]) {
      const svg = ArcaneMaps.boardSvg(race, { portrait, chaosSpaces: chaos ? game.CHAOS_SPACES : {}, idPrefix: "t" });
      assert.doesNotMatch(svg, /NaN|undefined/);
      assert.equal((svg.match(/class="map-space/g) || []).length, 31);
      const specials = (svg.match(/class="map-space special/g) || []).length;
      assert.equal(specials, chaos ? Object.keys(game.CHAOS_SPACES).length : 0);
    }
  }
});

// ---------- Runner sprites ----------

test("sprites: every runner has a 16x16 pixel sprite", () => {
  for (const racer of game.RACERS) {
    const sprite = RunnerArt.sprite(racer.id);
    assert.ok(sprite, `${racer.id} has a sprite`);
    assert.equal(sprite.grid.length, 16, `${racer.id} has 16 rows`);
    sprite.grid.forEach((row, y) => assert.equal(row.length, 16, `${racer.id} row ${y} is 16 wide`));
  }
});

test("sprites: every pixel uses a defined colour, with an outline and real detail", () => {
  for (const racer of game.RACERS) {
    const { grid, palette } = RunnerArt.sprite(racer.id);
    const used = new Set();
    let filled = 0;
    for (const row of grid) {
      for (const char of row) {
        if (char === ".") continue;
        assert.ok(palette[char], `${racer.id} uses undefined colour key "${char}"`);
        used.add(char);
        filled += 1;
      }
    }
    assert.ok(used.has("k"), `${racer.id} has an ink outline (k)`);
    assert.ok(used.size >= 4, `${racer.id} uses at least 4 colours`);
    assert.ok(filled >= 70 && filled <= 236, `${racer.id} fills ${filled} pixels`);
  }
});

test("sprites: all 24 are different and render as crisp SVG", () => {
  const seen = new Set();
  for (const racer of game.RACERS) {
    const key = RunnerArt.sprite(racer.id).grid.join("");
    assert.ok(!seen.has(key), `${racer.id} duplicates another sprite`);
    seen.add(key);
    const uri = RunnerArt.uri(racer.id);
    assert.match(uri, /^data:image\/svg\+xml/);
    assert.match(decodeURIComponent(uri), /crispEdges/);
  }
});
