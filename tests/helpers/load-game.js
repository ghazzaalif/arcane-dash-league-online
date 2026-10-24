"use strict";

// Loads the real browser scripts (runners-art.js, maps.js, game.js) into an isolated
// Node VM with a stubbed DOM, instant timers and scriptable dice. Tests drive the
// actual rules engine, not a copy of it.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..", "..");

function stubElement() {
  const target = { classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, style: { setProperty() {} }, dataset: {}, children: [] };
  return new Proxy(target, {
    get(t, key) {
      if (key in t) return t[key];
      if (key === "querySelector") return () => stubElement();
      if (key === "querySelectorAll") return () => [];
      if (typeof key === "string" && /^(add|remove|show|close|focus|set|scroll|append|insert|get|toggle|animate|contains|select)/.test(key)) {
        return () => ({ finished: Promise.resolve(), cancel() {} });
      }
      return undefined;
    },
    set(t, key, value) {
      t[key] = value;
      return true;
    }
  });
}

function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function loadGame(options = {}) {
  const seed = options.seed ?? 1;
  const random = seededRandom(seed);
  const mathWithSeed = Object.create(Math);
  mathWithSeed.random = random;

  let domReady = false;
  const document = {
    getElementById: () => (domReady ? null : stubElement()),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener() {},
    createElement: () => stubElement(),
    body: stubElement(),
    documentElement: stubElement(),
    fonts: { check: () => true }
  };

  const ctx = {
    console, JSON, Promise, Array, Object, Number, String, Set, Map, Boolean, Date, Error, URLSearchParams, Symbol, Proxy, Reflect,
    Math: mathWithSeed,
    document,
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    setTimeout: (fn) => { setImmediate(fn); return 0; },
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    requestAnimationFrame: (fn) => setImmediate(fn),
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    location: { protocol: "file:", search: "", origin: "" },
    navigator: {},
    encodeURIComponent,
    crypto: require("crypto").webcrypto
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.createContext(ctx);

  for (const file of ["runners-art.js", "maps.js", "game.js"]) {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) vm.runInContext(fs.readFileSync(full, "utf8"), ctx, { filename: file });
  }
  domReady = true;

  // Rendering is irrelevant to rules tests and is the slow part.
  for (const name of ["renderRace", "renderRaceResults", "renderDraft", "renderSelection", "renderSetup", "renderLobby", "renderFinalResults"]) {
    if (typeof ctx[name] === "function") ctx[name] = () => {};
  }

  const api = vm.runInContext("({ state, RACERS, RACE_POINTS, CHAOS_SPACES, TRACK_LENGTH, network })", ctx);
  const rigged = [];
  const originalRandomInt = ctx.randomInt;
  ctx.randomInt = (min, max) => {
    if (rigged.length) {
      const value = rigged.shift();
      if (value < min || value > max) throw new Error(`Rigged roll ${value} is outside ${min}-${max}`);
      return value;
    }
    return originalRandomInt(min, max);
  };

  function setupRace({ racers, raceNumber = 0, positions = [], bots = false }) {
    const { state } = api;
    state.players = racers.map((_, index) => ({ id: `p${index}`, name: `T${index}`, isBot: bots, controllerId: null, color: "#fff", team: [], score: 0 }));
    Object.assign(state, {
      phase: "race", raceNumber, entrants: [], finishers: [], log: [], lastRoll: null, previousNaturalRoll: null,
      busy: false, raceOver: false, motionPlayerId: null, abilityFlash: null, effectFlash: null, diceSides: 6, lastMove: 0
    });
    state.entrants = racers.map((racerId, index) => ({
      playerId: `p${index}`, racerId, pos: positions[index] || 0, tripped: false, finished: false, finishPlace: null,
      turns: 0, usedReroll: false, crossedTwenty: false, napping: false, charge: 0, skillUsed: false, wall: false, frozen: 0
    }));
    ctx.startRace();
    return state;
  }

  return {
    ctx,
    ...api,
    random,
    rig: (...values) => rigged.push(...values.flat()),
    riggedLeft: () => rigged.length,
    setupRace,
    entrant: (index) => api.state.entrants[index],
    racer: (id) => api.RACERS.find((racer) => racer.id === id),
    takeTurn: () => ctx.takeTurn(),
    call: (name, ...args) => ctx[name](...args)
  };
}

module.exports = { loadGame, seededRandom, ROOT };
