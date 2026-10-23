"use strict";

const PLAYER_COLORS = ["#ff7a45", "#4ea8ff", "#b8e04f", "#ff6fae"];
const TRACK_LENGTH = 30;
const RACE_POINTS = [[3, 1], [5, 2], [7, 3], [10, 5]];
const STEP_DELAY = 150;
const CHAOS_SPACES = {
  5: { type: "boost", label: "+2", amount: 2 },
  9: { type: "setback", label: "-2", amount: -2 },
  12: { type: "boost", label: "+2", amount: 2 },
  15: { type: "trip", label: "trip" },
  18: { type: "setback", label: "-3", amount: -3 },
  22: { type: "boost", label: "+3", amount: 3 },
  26: { type: "setback", label: "-2", amount: -2 }
};

// Every power is tuned against a headless simulation of these exact rules
// (thousands of 2, 3 and 4-team races) so no runner's expected points sit far from the pack.
const RACERS = [
  { id: "clockwork-hare", name: "Clockwork Hare", role: "Steady", tagline: "Wound tight, never quits", powerName: "Second Chance", power: "Reroll any 1, and the reroll gains 1.", tune: { below: 1, bonus: 1 } },
  { id: "moss-golem", name: "Moss Golem", role: "Steady", tagline: "Slow, steady, exact", powerName: "Measured March", power: "Always move exactly 4, or 5 when you start 6+ spaces behind the leader.", tune: { fixed: 4, last: 5, gap: 6 } },
  { id: "comet-kid", name: "Comet Kid", role: "Sprinter", tagline: "Maximum velocity", powerName: "Flare Up", power: "A natural 6 moves 3 extra.", tune: { bonus: 3 } },
  { id: "bubble-witch", name: "Bubble Witch", role: "Trickster", tagline: "Trouble slides right off", powerName: "Bubble Bounce", power: "Ignore setbacks and trips. When a rival lands on you, bounce forward 2.", tune: { bounce: 2 } },
  { id: "echo-fox", name: "Echo Fox", role: "Reactive", tagline: "Every cheer carries", powerName: "Resonance", power: "When a rival ahead of you rolls a 6, move 1. Your own 6 moves 2 more.", tune: { echo: 1, own: 2 } },
  { id: "anchor-knight", name: "Anchor Knight", role: "Steady", tagline: "Never gives ground", powerName: "Iron Stride", power: "A roll of 1 counts as 3. Can't be pushed backward.", tune: { floor: 3, below: 2 } },
  { id: "lantern-sprite", name: "Lantern Sprite", role: "Comeback", tagline: "Brightest from behind", powerName: "Catch-Up Glow", power: "Trailing everyone by 2 or more? Gain 1 for each runner ahead.", tune: { bonus: 1, gap: 2 } },
  { id: "prism-slime", name: "Prism Slime", role: "Trickster", tagline: "Personal space is optional", powerName: "Slick Landing", power: "After you move, rivals within 3 spaces of you slide back 1.", tune: { range: 3, push: 1 } },
  { id: "storm-crow", name: "Storm Crow", role: "Comeback", tagline: "Bad rolls summon good weather", powerName: "Thunder Jump", power: "On a 1 or 2, jump to the leader's space instead.", tune: { gap: 0, max: 2 } },
  { id: "moon-moth", name: "Moon Moth", role: "Sprinter", tagline: "Odd numbers feel lucky", powerName: "Lunar Drift", power: "Odd rolls gain 1.", tune: { bonus: 1 } },
  { id: "gear-goblin", name: "Gear Goblin", role: "Builder", tagline: "Always tuning something", powerName: "Tune-Up", power: "Each 1 you roll adds +1 to every later roll this race (max +3).", tune: { cap: 3, trigger: 1 } },
  { id: "frost-yak", name: "Frost Yak", role: "Trickster", tagline: "A portable cold front", powerName: "Chill Field", power: "Rivals starting their turn within 3 spaces ahead of you lose 2.", tune: { range: 3, chill: 2 } },
  { id: "portal-pup", name: "Portal Pup", role: "Pack", tagline: "Doors are everywhere", powerName: "Blink", power: "After landing on a rival, blink 3 more. Blinks can chain.", tune: { bonus: 3 } },
  { id: "quake-beetle", name: "Quake Beetle", role: "Trickster", tagline: "Tiny feet, huge impact", powerName: "Ground Pound", power: "On a 4, 5 or 6, rivals within 4 spaces slide back 2.", tune: { range: 4, push: 2, min: 4 } },
  { id: "lucky-turnip", name: "Lucky Turnip", role: "Wildcard", tagline: "Two is the luckiest number", powerName: "Lucky Two", power: "A roll of 2 counts as 5.", tune: { value: 5 } },
  { id: "shadow-cat", name: "Shadow Cat", role: "Pack", tagline: "Crowds are shortcuts", powerName: "Slipstream", power: "The first 2 occupied spaces you cross each turn are free.", tune: { free: 2 } },
  { id: "crown-crab", name: "Crown Crab", role: "Frontrunner", tagline: "First place is a lifestyle", powerName: "Royal Pace", power: "Gain 1 when you start within 4 spaces of the lead.", tune: { range: 4, bonus: 1 } },
  { id: "nap-dragon", name: "Nap Dragon", role: "Wildcard", tagline: "Wakes up unpredictably", powerName: "Dream Die", power: "Roll an eight-sided die. After an 8, nap through your next turn.", tune: { nap: 8 } },
  { id: "spark-snail", name: "Spark Snail", role: "Builder", tagline: "Charges between turns", powerName: "Stored Energy", power: "Every third turn, gain 2.", tune: { every: 3, bonus: 2 } },
  { id: "wisp-twins", name: "Wisp Twins", role: "Wildcard", tagline: "One pushes, one pulls", powerName: "Alternating Current", power: "Gain 3 on odd turns. Lose 3 on even turns.", tune: { up: 3, down: 3 } },
  { id: "river-otter", name: "River Otter", role: "Pack", tagline: "Momentum loves company", powerName: "Draft Current", power: "Gain 1 for each rival on your space or the next (max 2).", tune: { range: 1, max: 2 } },
  { id: "meteor-mouse", name: "Meteor Mouse", role: "Comeback", tagline: "Small target, big launch", powerName: "Slingshot", power: "Starting 8 or more spaces behind the leader doubles your roll.", tune: { gap: 8 } },
  { id: "mirror-owl", name: "Mirror Owl", role: "Reactive", tagline: "Watching closely", powerName: "Reflection", power: "If the runner before you rolled higher, gain the difference (max 2).", tune: { max: 2 } },
  { id: "pepper-pixie", name: "Pepper Pixie", role: "Closer", tagline: "A little too energetic", powerName: "Spicy Finish", power: "The first time you cross space 20, surge 4.", tune: { at: 20, bonus: 4 } }
];

const app = document.getElementById("app");
const rulesDialog = document.getElementById("rulesDialog");
const charactersDialog = document.getElementById("charactersDialog");
const characterGrid = document.getElementById("characterGrid");
const characterSearch = document.getElementById("characterSearch");
const soundButton = document.getElementById("soundButton");

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

class AudioDirector {
  constructor() {
    this.context = null;
    this.master = null;
    try {
      this.enabled = localStorage.getItem("arcaneDashSound") !== "off";
    } catch (error) {
      this.enabled = true;
    }
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  async ensure() {
    if (!this.enabled) return false;
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
    this.startBgm();
    return true;
  }

  async toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("arcaneDashSound", this.enabled ? "on" : "off");
    } catch (error) {
      // Sound still works when storage is unavailable.
    }
    if (this.enabled) {
      await this.ensure();
      this.playUi();
    } else {
      this.stopBgm();
      if (this.context) this.context.suspend();
    }
    updateSoundButton();
  }

  tone(frequency, duration = 0.12, options = {}) {
    if (!this.enabled || !this.context || this.context.state !== "running") return;
    const now = this.context.currentTime + (options.delay || 0);
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = options.type || "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    if (options.toFrequency) oscillator.frequency.exponentialRampToValueAtTime(options.toFrequency, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(options.volume || 0.08, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  startBgm() {
    if (!this.enabled || !this.context || this.bgmTimer) return;
    const melody = [220, 277.18, 329.63, 277.18, 246.94, 329.63, 369.99, 329.63];
    const bass = [110, 110, 123.47, 123.47, 98, 98, 123.47, 123.47];
    const tick = () => {
      if (!this.enabled || !this.context || this.context.state !== "running") return;
      const index = this.bgmStep % melody.length;
      this.tone(melody[index], 0.32, { type: "triangle", volume: 0.018 });
      if (index % 2 === 0) this.tone(bass[index], 0.62, { type: "sine", volume: 0.014 });
      this.bgmStep += 1;
    };
    tick();
    this.bgmTimer = window.setInterval(tick, 420);
  }

  stopBgm() {
    if (this.bgmTimer) window.clearInterval(this.bgmTimer);
    this.bgmTimer = null;
  }

  playUi() {
    this.tone(520, 0.08, { type: "square", volume: 0.035 });
  }

  playDice() {
    this.tone(150 + Math.random() * 120, 0.055, { type: "square", volume: 0.035, toFrequency: 110 });
  }

  playStep(stepIndex = 0, direction = 1) {
    const base = direction > 0 ? 185 : 145;
    this.tone(base + (stepIndex % 3) * 22, 0.07, { type: "triangle", volume: 0.045, toFrequency: base * 0.85 });
  }

  playAbility() {
    [440, 587.33, 783.99].forEach((frequency, index) => this.tone(frequency, 0.22, { delay: index * 0.07, type: "triangle", volume: 0.055 }));
  }

  playHazard(type) {
    if (type === "boost") {
      this.tone(330, 0.18, { type: "sine", volume: 0.055, toFrequency: 660 });
    } else if (type === "trip") {
      this.tone(170, 0.24, { type: "sawtooth", volume: 0.05, toFrequency: 90 });
    } else {
      this.tone(260, 0.22, { type: "square", volume: 0.04, toFrequency: 115 });
    }
  }

  playFinish() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => this.tone(frequency, 0.34, { delay: index * 0.09, type: "triangle", volume: 0.065 }));
  }
}

const audio = new AudioDirector();

const state = {
  phase: "setup",
  players: [],
  deck: [],
  draftPool: [],
  draftWave: 1,
  draftOrder: [],
  draftIndex: 0,
  raceNumber: 0,
  selectionOrder: [],
  selectionIndex: 0,
  entrants: [],
  turnOrder: [],
  turnIndex: 0,
  finishers: [],
  log: [],
  lastRoll: null,
  previousNaturalRoll: null,
  diceSides: 6,
  diceRolling: false,
  diceCaption: "Ready",
  motionPlayerId: null,
  abilityFlash: null,
  effectFlash: null,
  busy: false,
  raceOver: false
};

// Analytics: sends a custom event to Umami when the server injected its tracker
// (UMAMI_WEBSITE_ID set). A no-op otherwise, and never allowed to break the game.
// No team names, lobby codes or other player-entered text are sent.
function track(name, data) {
  try {
    const umami = typeof window !== "undefined" ? window.umami : null;
    if (umami && typeof umami.track === "function") umami.track(name, data);
  } catch (error) {
    // Analytics is optional.
  }
}

function gameMode() {
  return network.online ? "online" : "local";
}

function teamMix() {
  const bots = state.players.filter((player) => player.isBot).length;
  return { mode: gameMode(), teams: state.players.length, humans: state.players.length - bots, bots };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function racerById(id) { return RACERS.find((racer) => racer.id === id); }
function playerById(id) { return state.players.find((player) => player.id === id); }
function entrantByPlayer(id) { return state.entrants.find((entrant) => entrant.playerId === id); }
function currentDraftPlayer() { return state.players[state.draftOrder[state.draftIndex]]; }
function currentSelectionPlayer() { return state.players[state.selectionOrder[state.selectionIndex]]; }
function currentEntrant() { return state.entrants.find((entrant) => entrant.playerId === state.turnOrder[state.turnIndex]); }
function getLeaderPosition() { return Math.max(...state.entrants.filter((entrant) => !entrant.finished).map((entrant) => entrant.pos), 0); }
function getLastPosition() {
  const positions = state.entrants.filter((entrant) => !entrant.finished).map((entrant) => entrant.pos);
  return positions.length ? Math.min(...positions) : 0;
}

function getPersistentClientId() {
  try {
    const stored = localStorage.getItem("arcaneDashClientId");
    if (stored) return stored;
  } catch (error) {
    // Storage is optional.
  }
  const generated = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try {
    localStorage.setItem("arcaneDashClientId", generated);
  } catch (error) {
    // Storage is optional.
  }
  return generated;
}

const browserLocation = typeof window !== "undefined" && window.location
  ? window.location
  : { protocol: "file:", search: "", origin: "" };

const network = {
  supported: browserLocation.protocol !== "file:" && typeof fetch === "function",
  online: false,
  isHost: false,
  recovering: false,
  clientId: getPersistentClientId(),
  code: null,
  lobby: null,
  sessionToken: null,
  events: null,
  stateSeq: 0,
  lastReceivedSeq: 0,
  notice: "",

  async request(pathname, body, includeSession = true) {
    if (!this.supported) throw new Error("Online play requires the deployed game server.");
    const payload = { ...body };
    if (includeSession && this.sessionToken && !payload.sessionToken) {
      payload.sessionToken = this.sessionToken;
    }
    const response = await fetch(pathname, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Network request failed.");
    return result;
  },

  async createLobby(name, maxPlayers, fillBots) {
    const result = await this.request("/api/lobbies", {
      clientId: this.clientId,
      name,
      maxPlayers,
      fillBots
    }, false);
    this.activate(result.lobby, true, result.sessionToken);
    track("lobby-create", { seats: Number(maxPlayers) || 4, bots: Boolean(fillBots) });
  },

  async joinLobby(name, code) {
    const result = await this.request("/api/lobbies/join", {
      clientId: this.clientId,
      name,
      code,
      sessionToken: this.readSessionToken(code)
    }, false);
    this.activate(result.lobby, result.isHost, result.sessionToken);
    this.recovering = Boolean(result.lobby.started && result.isHost);
    track("lobby-join", { rejoin: Boolean(result.lobby.started) });
  },

  readSessionToken(code) {
    try {
      return localStorage.getItem(`arcaneDashLobbyToken:${String(code || "").toUpperCase()}`) || "";
    } catch (error) {
      return "";
    }
  },

  storeSessionToken(code, token) {
    if (!code || !token) return;
    try {
      localStorage.setItem(`arcaneDashLobbyToken:${code}`, token);
    } catch (error) {
      // Storage is optional.
    }
  },

  clearSessionToken(code) {
    if (!code) return;
    try {
      localStorage.removeItem(`arcaneDashLobbyToken:${code}`);
    } catch (error) {
      // Storage is optional.
    }
  },

  activate(lobby, isHost, sessionToken) {
    this.online = true;
    this.isHost = isHost;
    this.code = lobby.code;
    this.lobby = lobby;
    this.sessionToken = sessionToken || this.readSessionToken(lobby.code);
    this.storeSessionToken(lobby.code, this.sessionToken);
    this.notice = "";
    try {
      localStorage.setItem("arcaneDashLobbyCode", lobby.code);
    } catch (error) {
      // Storage is optional.
    }
    this.connectEvents();
    renderLobby();
  },

  connectEvents() {
    if (this.events) this.events.close();
    const EventSourceClass = typeof EventSource !== "undefined" ? EventSource : window.EventSource;
    if (!EventSourceClass) return;
    const url = `/api/events?clientId=${encodeURIComponent(this.clientId)}&code=${encodeURIComponent(this.code)}&sessionToken=${encodeURIComponent(this.sessionToken || "")}`;
    this.events = new EventSourceClass(url);
    this.events.onopen = () => {
      this.notice = "";
      if (state.phase === "lobby") renderLobby();
    };
    this.events.onmessage = (event) => {
      try {
        this.handleEvent(JSON.parse(event.data));
      } catch (error) {
        console.error("Invalid lobby event", error);
      }
    };
    this.events.onerror = () => {
      this.notice = "Connection interrupted. The game will retry automatically.";
      if (state.phase === "lobby") renderLobby();
    };
  },

  handleEvent(event) {
    if (event.type === "lobby") {
      this.lobby = event.lobby;
      this.isHost = event.lobby.hostId === this.clientId;
      this.notice = "";
      if (state.phase === "lobby" || !event.lobby.started) renderLobby();
      return;
    }
    if (event.type === "state") {
      this.stateSeq = Math.max(this.stateSeq, Number(event.seq) || 0);
      if (this.isHost && !this.recovering) return;
      if (Number(event.seq) <= this.lastReceivedSeq) return;
      this.lastReceivedSeq = Number(event.seq);
      this.recovering = false;
      Object.assign(state, event.state);
      renderPhaseFromState();
      return;
    }
    if (event.type === "action" && this.isHost) {
      handleRemoteAction(event.senderId, event.action, event.payload || {});
      return;
    }
    if (event.type === "reset") {
      state.phase = "lobby";
      state.players = [];
      this.lastReceivedSeq = 0;
      this.stateSeq = 0;
      renderLobby();
      return;
    }
    if (event.type === "host_closed") {
      this.leaveLocal(event.reason || "The host closed the lobby.");
    }
  },

  async markStarted() {
    const result = await this.request("/api/action", {
      clientId: this.clientId,
      code: this.code,
      type: "start"
    });
    this.lobby = result.lobby;
    return result.lobby;
  },

  sendAction(type, payload = {}) {
    return this.request("/api/action", {
      clientId: this.clientId,
      code: this.code,
      type,
      payload
    });
  },

  broadcastState() {
    if (!this.online || !this.isHost || !this.lobby?.started || state.phase === "lobby" || state.phase === "setup") return;
    const seq = ++this.stateSeq;
    const snapshot = JSON.parse(JSON.stringify(state));
    this.request("/api/state", {
      clientId: this.clientId,
      code: this.code,
      seq,
      state: snapshot
    }).catch((error) => console.error("State sync failed", error));
  },

  async resetLobby() {
    await this.request("/api/action", {
      clientId: this.clientId,
      code: this.code,
      type: "reset_lobby"
    });
  },

  async leave() {
    if (this.online) {
      try {
        await this.request("/api/leave", { clientId: this.clientId, code: this.code });
      } catch (error) {
        console.warn(error);
      }
    }
    this.leaveLocal("");
  },

  leaveLocal(message = "") {
    if (this.events) this.events.close();
    this.events = null;
    this.online = false;
    this.isHost = false;
    this.recovering = false;
    this.clearSessionToken(this.code);
    this.code = null;
    this.lobby = null;
    this.sessionToken = null;
    this.stateSeq = 0;
    this.lastReceivedSeq = 0;
    this.notice = message;
    try {
      localStorage.removeItem("arcaneDashLobbyCode");
    } catch (error) {
      // Storage is optional.
    }
    renderSetup();
  }
};

function isGameAuthority() {
  return !network.online || network.isHost;
}

function canControlPlayer(player) {
  if (!player || player.isBot) return false;
  if (!network.online) return true;
  return player.controllerId === network.clientId;
}

function canAdvanceGame() {
  return !network.online || network.isHost;
}

function requestDraftRacer(racerId) {
  if (network.online && !network.isHost) network.sendAction("draft_pick", { racerId }).catch(showNetworkError);
  else chooseDraftRacer(racerId);
}

function requestRaceRacer(racerId) {
  if (network.online && !network.isHost) network.sendAction("select_racer", { racerId }).catch(showNetworkError);
  else chooseRaceRacer(racerId);
}

function requestTakeTurn() {
  if (network.online && !network.isHost) network.sendAction("take_turn").catch(showNetworkError);
  else takeTurn();
}

function showNetworkError(error) {
  network.notice = error.message || "Network action failed.";
  if (state.phase === "lobby") renderLobby();
  else console.error(error);
}

function handleRemoteAction(senderId, action, payload) {
  if (!network.isHost) return;
  if (action === "draft_pick") {
    const player = currentDraftPlayer();
    if (state.phase === "draft" && player?.controllerId === senderId) return chooseDraftRacer(payload.racerId);
    return;
  }
  if (action === "select_racer") {
    const player = currentSelectionPlayer();
    if (state.phase === "selection" && player?.controllerId === senderId) return chooseRaceRacer(payload.racerId);
    return;
  }
  if (action === "take_turn") {
    const entrant = currentEntrant();
    const player = entrant && playerById(entrant.playerId);
    if (state.phase === "race" && player?.controllerId === senderId) return takeTurn();
  }
}

function renderPhaseFromState() {
  if (state.phase === "draft") renderDraft();
  else if (state.phase === "selection") renderSelection();
  else if (state.phase === "race") renderRace();
  else if (state.phase === "results") renderRaceResults();
  else if (state.phase === "final") renderFinalResults();
  else if (state.phase === "lobby") renderLobby();
  else renderSetup();
}

// ---------------------------------------------------------------------------
// Presentation helpers
// ---------------------------------------------------------------------------

const ROLE_NOTES = {
  Steady: "Reliable movement with a small safety net.",
  Sprinter: "Spikes of speed on good rolls.",
  Trickster: "Pushes, slows or dodges other runners.",
  Reactive: "Moves off what everyone else rolls.",
  Comeback: "Gets stronger the further behind it falls.",
  Builder: "Charges up over the course of a race.",
  Pack: "Feeds on crowded spaces.",
  Frontrunner: "Rewards staying near the lead.",
  Wildcard: "Big swings, both ways.",
  Closer: "Saves its burst for late in the race."
};

function portraitImg(racerId, className = "", alt = "") {
  return window.RunnerArt ? RunnerArt.img(racerId, className, alt) : `<span class="runner-art ${className}"></span>`;
}

function racerTint(racerId) {
  return window.RunnerArt ? RunnerArt.tint(racerId) : "#334";
}

function themeForRace(raceNumber) {
  return ArcaneMaps.themeFor(raceNumber);
}

function isChaosRace(raceNumber) {
  return raceNumber % 2 === 1;
}

function teamName(player) {
  return escapeHtml(player?.name || "Team");
}

function updateSoundButton() {
  soundButton.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
  soundButton.setAttribute("aria-label", audio.enabled ? "Sound on. Turn sound off" : "Sound off. Turn sound on");
  soundButton.querySelector(".sound-label").textContent = audio.enabled ? "Sound on" : "Sound off";
}

let archiveRole = "All";

function renderCharacterLibrary(filter = "") {
  const normalized = filter.trim().toLowerCase();
  const roles = ["All", ...new Set(RACERS.map((racer) => racer.role))];
  const roleBar = document.getElementById("archiveRoles");
  roleBar.innerHTML = roles.map((role) => `<button type="button" class="chip-button ${role === archiveRole ? "is-on" : ""}" data-role="${role}" aria-pressed="${role === archiveRole}">${role}</button>`).join("");
  roleBar.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => {
    archiveRole = button.dataset.role;
    renderCharacterLibrary(characterSearch.value);
  }));
  const matches = RACERS.filter((racer) => (archiveRole === "All" || racer.role === archiveRole)
    && [racer.name, racer.tagline, racer.powerName, racer.power, racer.role].join(" ").toLowerCase().includes(normalized));
  characterGrid.innerHTML = matches.length
    ? matches.map((racer) => runnerCardHtml(racer, { as: "article" })).join("")
    : `<p class="empty-note">No runners match that search.</p>`;
}

function openCharacters() {
  track("runners-open");
  characterSearch.value = "";
  archiveRole = "All";
  renderCharacterLibrary();
  charactersDialog.showModal();
}

document.getElementById("rulesButton").addEventListener("click", () => {
  rulesDialog.showModal();
  track("rules-open");
});
document.getElementById("closeRulesButton").addEventListener("click", () => rulesDialog.close());
document.getElementById("charactersButton").addEventListener("click", openCharacters);
document.getElementById("closeCharactersButton").addEventListener("click", () => charactersDialog.close());
characterSearch.addEventListener("input", () => renderCharacterLibrary(characterSearch.value));
soundButton.addEventListener("click", () => audio.toggle());
document.addEventListener("pointerdown", () => audio.ensure(), { once: true });
[rulesDialog, charactersDialog].forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
}));
updateSoundButton();

document.addEventListener("keydown", (event) => {
  if (state.phase !== "race" || event.repeat) return;
  if (event.key !== " " && event.key.toLowerCase() !== "r") return;
  const target = event.target;
  if (target && (target.closest?.("input, select, textarea, button, dialog[open]") || target.isContentEditable)) return;
  const button = document.getElementById("rollButton");
  if (button && !button.disabled) {
    event.preventDefault();
    button.click();
  }
});

function runnerCardHtml(racer, options = {}) {
  const tag = options.as || "button";
  const attrs = options.action === "draft" ? `data-draft-id="${racer.id}"` : options.action === "select" ? `data-select-id="${racer.id}"` : "";
  const classNames = ["runner-card", options.used ? "is-used" : "", options.compact ? "is-compact" : ""].filter(Boolean).join(" ");
  const disabled = tag === "button" && options.disabled ? "disabled" : "";
  return `
    <${tag} class="${classNames}" ${tag === "button" ? 'type="button"' : ""} ${attrs} ${disabled} style="--tint:${racerTint(racer.id)}">
      <span class="runner-card-top">
        ${portraitImg(racer.id, "runner-card-art", "")}
        <span class="role-chip" title="${ROLE_NOTES[racer.role] || ""}">${racer.role}</span>
      </span>
      <span class="runner-card-name">${racer.name}</span>
      <span class="runner-card-tag">${racer.tagline}</span>
      <span class="runner-card-power"><b>${racer.powerName}</b> ${racer.power}</span>
    </${tag}>`;
}

function teamSlotsHtml(player, options = {}) {
  const slots = Array.from({ length: 4 }, (_, index) => player.team[index]);
  return `<span class="team-slots">${slots.map((slot) => slot
    ? `<span class="team-slot ${options.showUsed && slot.used ? "is-used" : ""}" title="${racerById(slot.racerId).name}${slot.used ? " (raced)" : ""}">${portraitImg(slot.racerId, "", racerById(slot.racerId).name)}</span>`
    : `<span class="team-slot is-empty"></span>`).join("")}</span>`;
}

function teamRowHtml(player, options = {}) {
  return `
    <li class="team-row ${options.active ? "is-active" : ""}" style="--team:${player.color}">
      <span class="team-swatch"></span>
      <span class="team-row-name">${teamName(player)}${player.isBot ? ' <span class="bot-tag">Bot</span>' : ""}</span>
      ${options.score ? `<span class="team-row-score">${player.score}<small>pts</small></span>` : `<span class="team-row-count">${player.team.length}/4</span>`}
      ${teamSlotsHtml(player, options)}
    </li>`;
}

// ---------------------------------------------------------------------------
// Setup and lobby
// ---------------------------------------------------------------------------

function lobbyCodeFromUrl() {
  if (typeof URLSearchParams === "undefined") return "";
  return new URLSearchParams(browserLocation.search || "").get("lobby") || "";
}

let setupMode = lobbyCodeFromUrl() ? "join" : "local";

function heroBoardHtml() {
  const demo = [["comet-kid", 9, 0], ["bubble-witch", 7, 1], ["moss-golem", 7, 2], ["nap-dragon", 4, 3]];
  const tokens = demo.map(([id, space, team], index) => {
    const [x, y] = ArcaneMaps.spacePoint(space, false);
    const shared = demo.filter((entry) => entry[1] === space);
    const offset = stackOffsets(shared.length)[shared.findIndex((entry) => entry[0] === id)];
    return `<span class="token is-static" style="--x:${x + offset[0]};--y:${y + offset[1]};--size:${tokenSize(shared.length)};--team:${PLAYER_COLORS[team]};--delay:${index * 90}ms"><span class="token-body">${portraitImg(id)}</span></span>`;
  }).join("");
  const size = ArcaneMaps.size(false);
  return `<div class="board hero-board" style="--u:${(100 / size.w).toFixed(5)}cqw;aspect-ratio:${size.w} / ${size.h}" aria-hidden="true"><div class="board-map">${ArcaneMaps.boardSvg(0, { idPrefix: "hero" })}</div><div class="board-tokens">${tokens}</div></div>`;
}

function renderSetup() {
  state.phase = "setup";
  state.busy = false;
  const lobbyCode = lobbyCodeFromUrl();
  const serverNote = network.supported
    ? ""
    : "Online lobbies need the game to run on its Node server. Local play works anywhere.";
  app.innerHTML = `
    <section class="setup-screen">
      <div class="hero-copy">
        <h2 class="hero-title">Draft a team of misfits. Race them for the league title.</h2>
        <p class="hero-lede">Each team drafts four runners and sends one into each of four races. Finish first or second to score, and the later races pay more.</p>
      </div>
      ${heroBoardHtml()}
      <div class="setup-side">
      <div class="panel setup-card">
        <div class="mode-tabs" role="tablist" aria-label="Game mode">
          ${[["local", "Same screen"], ["create", "Host online"], ["join", "Join online"]].map(([mode, label]) => `
            <button class="mode-tab ${setupMode === mode ? "is-on" : ""}" role="tab" aria-selected="${setupMode === mode}" data-setup-mode="${mode}" type="button" ${mode !== "local" && !network.supported ? "disabled" : ""}>${label}</button>`).join("")}
        </div>

        <div class="setup-mode" ${setupMode === "local" ? "" : "hidden"}>
          <div class="field">
            <span class="field-label" id="teamCountLabel">Teams</span>
            <div class="segmented" role="radiogroup" aria-labelledby="teamCountLabel">
              ${[2, 3, 4].map((count) => `<button type="button" role="radio" class="segment ${localTeamCount === count ? "is-on" : ""}" aria-checked="${localTeamCount === count}" data-team-count="${count}">${count}</button>`).join("")}
            </div>
          </div>
          <ul id="playerConfigList" class="player-config-list"></ul>
          <button id="startButton" class="btn btn-primary btn-block" type="button">Start the draft</button>
        </div>

        <div class="setup-mode" ${setupMode === "create" ? "" : "hidden"}>
          <label class="field" for="createPlayerName"><span class="field-label">Your team name</span>
            <input id="createPlayerName" maxlength="18" value="Host Team" autocomplete="nickname" /></label>
          <div class="field">
            <span class="field-label" id="lobbySizeLabel">Seats</span>
            <div class="segmented" role="radiogroup" aria-labelledby="lobbySizeLabel">
              ${[2, 3, 4].map((count) => `<button type="button" role="radio" class="segment ${lobbySeats === count ? "is-on" : ""}" aria-checked="${lobbySeats === count}" data-lobby-size="${count}">${count}</button>`).join("")}
            </div>
          </div>
          <label class="check-row" for="fillBots">
            <input id="fillBots" type="checkbox" />
            <span>Fill empty seats with bots when you start</span>
          </label>
          <button id="createLobbyButton" class="btn btn-primary btn-block" type="button">Create lobby</button>
          <p class="fine-print">Your browser runs the match, so keep this tab open until the final race.</p>
        </div>

        <div class="setup-mode" ${setupMode === "join" ? "" : "hidden"}>
          <label class="field" for="joinPlayerName"><span class="field-label">Your team name</span>
            <input id="joinPlayerName" maxlength="18" value="Guest Team" autocomplete="nickname" /></label>
          <label class="field" for="joinLobbyCode"><span class="field-label">Lobby code</span>
            <input id="joinLobbyCode" class="code-input" maxlength="5" value="${escapeHtml(lobbyCode.toUpperCase())}" placeholder="ABCDE" autocomplete="off" inputmode="text" /></label>
          <button id="joinLobbyButton" class="btn btn-primary btn-block" type="button">Join lobby</button>
        </div>
        <p id="networkStatus" class="network-status" aria-live="polite">${escapeHtml(network.notice || serverNote)}</p>
      </div>
      <section class="roster-wall" aria-labelledby="rosterTitle">
        <div class="roster-wall-head">
          <h3 class="side-title" id="rosterTitle">This season's runners</h3>
          <button id="browseRunnersButton" class="btn btn-quiet" type="button">See all powers</button>
        </div>
        <div class="roster-grid">
          ${RACERS.map((racer) => `<button type="button" class="roster-face" data-runner="${racer.id}" title="${racer.name}: ${racer.powerName}" aria-label="${racer.name}">${portraitImg(racer.id)}</button>`).join("")}
        </div>
      </section>
      </div>
    </section>`;

  document.querySelectorAll("[data-setup-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setupMode = button.dataset.setupMode;
      renderSetup();
    });
  });
  document.getElementById("browseRunnersButton").addEventListener("click", openCharacters);
  document.querySelectorAll("[data-runner]").forEach((button) => button.addEventListener("click", () => {
    openCharacters();
    characterSearch.value = racerById(button.dataset.runner).name;
    renderCharacterLibrary(characterSearch.value);
  }));

  document.querySelectorAll("[data-team-count]").forEach((button) => button.addEventListener("click", () => {
    captureLocalConfig();
    localTeamCount = Number(button.dataset.teamCount);
    renderSetup();
  }));
  document.querySelectorAll("[data-lobby-size]").forEach((button) => button.addEventListener("click", () => {
    lobbySeats = Number(button.dataset.lobbySize);
    document.querySelectorAll("[data-lobby-size]").forEach((other) => {
      other.classList.toggle("is-on", other === button);
      other.setAttribute("aria-checked", other === button ? "true" : "false");
    });
  }));

  const startButton = document.getElementById("startButton");
  if (startButton) {
    renderPlayerConfig();
    startButton.addEventListener("click", startGame);
  }

  const createButton = document.getElementById("createLobbyButton");
  if (createButton) createButton.addEventListener("click", async () => {
    setNetworkStatus("Creating lobby...");
    createButton.disabled = true;
    try {
      await network.createLobby(document.getElementById("createPlayerName").value, lobbySeats, document.getElementById("fillBots").checked);
    } catch (error) {
      setNetworkStatus(error.message, true);
      createButton.disabled = false;
    }
  });

  const joinButton = document.getElementById("joinLobbyButton");
  if (joinButton) joinButton.addEventListener("click", async () => {
    const code = document.getElementById("joinLobbyCode").value.trim().toUpperCase();
    if (code.length !== 5) {
      setNetworkStatus("Enter the five-character lobby code.", true);
      return;
    }
    setNetworkStatus("Joining lobby...");
    joinButton.disabled = true;
    try {
      await network.joinLobby(document.getElementById("joinPlayerName").value, code);
    } catch (error) {
      setNetworkStatus(error.message, true);
      joinButton.disabled = false;
    }
  });

  const codeInput = document.getElementById("joinLobbyCode");
  if (codeInput) codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 5);
  });
}

let localTeamCount = 3;
let lobbySeats = 4;
const localConfig = [
  { name: "You", bot: false },
  { name: "Team 2", bot: true },
  { name: "Team 3", bot: true },
  { name: "Team 4", bot: true }
];

function captureLocalConfig() {
  localConfig.forEach((entry, index) => {
    const input = document.getElementById(`playerName${index}`);
    if (input) entry.name = input.value;
  });
}

function setNetworkStatus(message, isError = false) {
  const element = document.getElementById("networkStatus");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("is-error", isError);
}

function renderPlayerConfig() {
  const list = document.getElementById("playerConfigList");
  if (!list) return;
  list.innerHTML = Array.from({ length: localTeamCount }, (_, index) => {
    const entry = localConfig[index];
    return `
      <li class="player-config" style="--team:${PLAYER_COLORS[index]}">
        <span class="team-swatch"></span>
        <input id="playerName${index}" maxlength="18" value="${escapeHtml(entry.name)}" aria-label="Team ${index + 1} name" />
        <button type="button" class="control-toggle ${entry.bot ? "is-bot" : ""}" data-control="${index}" aria-label="Team ${index + 1} is ${entry.bot ? "a bot" : "human"}. Switch">${entry.bot ? "Bot" : "Human"}</button>
      </li>`;
  }).join("");
  list.querySelectorAll("[data-control]").forEach((button) => button.addEventListener("click", () => {
    captureLocalConfig();
    const entry = localConfig[Number(button.dataset.control)];
    entry.bot = !entry.bot;
    renderPlayerConfig();
  }));
}

function renderLobby() {
  state.phase = "lobby";
  const lobby = network.lobby;
  if (!lobby) {
    renderSetup();
    return;
  }
  const shareUrl = lobby.joinUrl || `${browserLocation.origin}/?lobby=${lobby.code}`;
  const canStart = network.isHost && (lobby.members.length >= 2 || lobby.fillBots);
  app.innerHTML = `
    <section class="panel lobby-screen">
      <div class="lobby-head">
        <div>
          <h2 class="screen-title">${network.isHost ? "Your lobby is open" : "You're in"}</h2>
          <p class="screen-sub">${network.isHost ? "Share the code or link. Start when everyone is seated." : "The host starts the league when everyone is seated."}</p>
        </div>
        <div class="lobby-code" aria-label="Lobby code ${lobby.code}"><small>Code</small>${lobby.code}</div>
      </div>
      <div class="share-row">
        <input id="shareUrl" readonly value="${escapeHtml(shareUrl)}" aria-label="Invite link" />
        <button id="copyLobbyLinkButton" class="btn btn-secondary" type="button">Copy link</button>
      </div>
      <ol class="seat-list">
        ${lobby.members.map((member, index) => `
          <li class="seat" style="--team:${PLAYER_COLORS[index]}">
            <span class="team-swatch"></span>
            <span class="seat-name">${escapeHtml(member.name)}${member.clientId === network.clientId ? " <small>(you)</small>" : ""}</span>
            <span class="seat-state ${member.connected ? "" : "is-off"}">${member.isHost ? "Host" : member.connected ? "Ready" : "Reconnecting"}</span>
          </li>`).join("")}
        ${Array.from({ length: Math.max(0, lobby.maxPlayers - lobby.members.length) }, (_, index) => `
          <li class="seat is-open" style="--team:${PLAYER_COLORS[lobby.members.length + index]}">
            <span class="team-swatch"></span>
            <span class="seat-name">Open seat</span>
            <span class="seat-state">${lobby.fillBots ? "Bot on start" : "Waiting"}</span>
          </li>`).join("")}
      </ol>
      <div class="lobby-actions">
        ${network.isHost ? `<button id="startLobbyGameButton" class="btn btn-primary" type="button" ${canStart ? "" : "disabled"}>Start the league</button>` : `<p class="waiting-note">Waiting for the host to start</p>`}
        <button id="leaveLobbyButton" class="btn btn-quiet" type="button">Leave lobby</button>
      </div>
      ${network.notice ? `<p class="network-status is-error">${escapeHtml(network.notice)}</p>` : ""}
    </section>`;

  document.getElementById("copyLobbyLinkButton").addEventListener("click", async () => {
    const button = document.getElementById("copyLobbyLinkButton");
    try {
      await navigator.clipboard.writeText(shareUrl);
      button.textContent = "Copied";
    } catch (error) {
      document.getElementById("shareUrl").select();
      button.textContent = "Press Ctrl+C";
    }
  });
  document.getElementById("leaveLobbyButton").addEventListener("click", () => network.leave());
  const startButton = document.getElementById("startLobbyGameButton");
  if (startButton) startButton.addEventListener("click", startHostedGame);
}

async function startHostedGame() {
  if (!network.isHost || !network.lobby) return;
  const button = document.getElementById("startLobbyGameButton");
  if (button) button.disabled = true;
  try {
    const lobby = await network.markStarted();
    state.players = lobby.members.map((member, index) => ({
      id: `p${index}`,
      name: member.name,
      isBot: false,
      controllerId: member.clientId,
      color: PLAYER_COLORS[index],
      team: [],
      score: 0
    }));
    if (lobby.fillBots) {
      while (state.players.length < lobby.maxPlayers) {
        const index = state.players.length;
        state.players.push({ id: `p${index}`, name: `Bot ${index + 1}`, isBot: true, controllerId: null, color: PLAYER_COLORS[index], team: [], score: 0 });
      }
    }
    state.deck = shuffle(RACERS);
    state.draftWave = 1;
    track("game-start", teamMix());
    beginDraftWave();
  } catch (error) {
    network.notice = error.message;
    renderLobby();
  }
}

function startGame() {
  audio.ensure();
  audio.playUi();
  captureLocalConfig();
  state.players = Array.from({ length: localTeamCount }, (_, index) => ({
    id: `p${index}`,
    name: localConfig[index].name.trim() || `Team ${index + 1}`,
    isBot: localConfig[index].bot,
    controllerId: null,
    color: PLAYER_COLORS[index],
    team: [],
    score: 0
  }));
  state.deck = shuffle(RACERS);
  state.draftWave = 1;
  track("game-start", teamMix());
  beginDraftWave();
}

// ---------------------------------------------------------------------------
// Draft
// ---------------------------------------------------------------------------

function makeSnakeOrder(startIndex) {
  const count = state.players.length;
  const forward = Array.from({ length: count }, (_, index) => (startIndex + index) % count);
  return [...forward, ...[...forward].reverse()];
}

function beginDraftWave() {
  const startIndex = state.draftWave === 1 ? 0 : 1 % state.players.length;
  state.draftPool = state.deck.splice(0, state.players.length * 2 + 1);
  state.draftOrder = makeSnakeOrder(startIndex);
  state.draftIndex = 0;
  state.phase = "draft";
  renderDraft();
  maybeRunBotDraft();
}

function turnHeadline(player, verb) {
  if (canControlPlayer(player)) return `${teamName(player)}, ${verb}`;
  if (player.isBot) return `${teamName(player)} is choosing`;
  return `Waiting for ${teamName(player)}`;
}

function renderDraft() {
  const player = currentDraftPlayer();
  const controllable = canControlPlayer(player);
  app.innerHTML = `
    <section class="phase-screen">
      <header class="phase-head" style="--team:${player.color}">
        <div>
          <p class="phase-step">Draft · wave ${state.draftWave} of 2 · pick ${state.draftIndex + 1} of ${state.draftOrder.length}</p>
          <h2 class="screen-title"><span class="team-swatch"></span>${turnHeadline(player, "pick a runner")}</h2>
        </div>
        <p class="phase-aside">Snake order: the pass reverses after every team.</p>
      </header>
      <div class="phase-layout">
        <div class="card-grid ${controllable ? "" : "is-watching"}">
          ${state.draftPool.map((racer) => runnerCardHtml(racer, { disabled: !controllable, action: "draft" })).join("")}
        </div>
        <aside class="panel side-panel">
          <h3 class="side-title">Teams</h3>
          <ol class="team-list">${state.players.map((team) => teamRowHtml(team, { active: team.id === player.id })).join("")}</ol>
        </aside>
      </div>
    </section>`;

  if (controllable) {
    document.querySelectorAll("[data-draft-id]").forEach((button) => {
      button.addEventListener("click", () => requestDraftRacer(button.dataset.draftId));
    });
  }
  network.broadcastState();
}

function chooseDraftRacer(racerId) {
  audio.playUi();
  const player = currentDraftPlayer();
  const index = state.draftPool.findIndex((racer) => racer.id === racerId);
  if (index < 0) return;
  const [racer] = state.draftPool.splice(index, 1);
  player.team.push({ racerId: racer.id, used: false });
  if (!player.isBot) track("draft-pick", { runner: racer.name, role: racer.role, wave: state.draftWave, mode: gameMode() });
  state.draftIndex += 1;

  if (state.draftIndex >= state.draftOrder.length) {
    state.deck.push(...state.draftPool);
    if (state.draftWave === 1) {
      state.draftWave = 2;
      beginDraftWave();
    } else {
      state.raceNumber = 0;
      beginRaceSelection();
    }
    return;
  }

  renderDraft();
  maybeRunBotDraft();
}

function maybeRunBotDraft() {
  if (!isGameAuthority()) return;
  const player = currentDraftPlayer();
  if (!player || !player.isBot) return;
  window.setTimeout(() => {
    if (state.phase !== "draft" || currentDraftPlayer() !== player) return;
    chooseDraftRacer(botDraftChoice(player).id);
  }, 650);
}

function botDraftChoice(player) {
  const roles = new Set(player.team.map((slot) => racerById(slot.racerId).role));
  const ranked = shuffle(state.draftPool).sort((a, b) => Number(roles.has(a.role)) - Number(roles.has(b.role)));
  return ranked[0];
}

// ---------------------------------------------------------------------------
// Race selection
// ---------------------------------------------------------------------------

function beginRaceSelection() {
  state.phase = "selection";
  state.selectionOrder = Array.from({ length: state.players.length }, (_, index) => (state.raceNumber + index) % state.players.length);
  state.selectionIndex = 0;
  state.entrants = [];
  state.finishers = [];
  state.log = [];
  state.lastRoll = null;
  state.previousNaturalRoll = null;
  state.diceSides = 6;
  state.diceRolling = false;
  state.diceCaption = "Ready";
  state.motionPlayerId = null;
  state.abilityFlash = null;
  state.effectFlash = null;
  state.busy = false;
  state.raceOver = false;
  renderSelection();
  maybeRunBotSelection();
}

function renderSelection() {
  const player = currentSelectionPlayer();
  const controllable = canControlPlayer(player);
  const theme = themeForRace(state.raceNumber);
  const chaos = isChaosRace(state.raceNumber);
  const points = RACE_POINTS[state.raceNumber];
  const available = player.team.filter((slot) => !slot.used);
  const picked = state.entrants.map((entrant) => `<li style="--team:${playerById(entrant.playerId).color}">${portraitImg(entrant.racerId, "", racerById(entrant.racerId).name)}<span>${teamName(playerById(entrant.playerId))}</span></li>`).join("");

  app.innerHTML = `
    <section class="phase-screen">
      <header class="phase-head" style="--team:${player.color}">
        <div>
          <p class="phase-step">Race ${state.raceNumber + 1} of 4 · lineup ${state.selectionIndex + 1} of ${state.players.length}</p>
          <h2 class="screen-title"><span class="team-swatch"></span>${turnHeadline(player, "who runs this one?")}</h2>
        </div>
        <p class="phase-aside">Each runner races once. Save strong picks for the bigger races.</p>
      </header>
      <div class="phase-layout">
        <div>
          <div class="next-track">
            <div class="next-track-map">${ArcaneMaps.boardSvg(state.raceNumber, { chaosSpaces: chaos ? CHAOS_SPACES : {}, idPrefix: "pv" })}</div>
            <div class="next-track-copy">
              <span class="mood-tag ${chaos ? "is-chaos" : ""}">${chaos ? "Chaos track" : "Calm track"}</span>
              <h3>${theme.name}</h3>
              <p>${theme.blurb}</p>
              <p class="stakes"><span class="medal is-gold">1st</span> +${points[0]} <span class="medal is-silver">2nd</span> +${points[1]}</p>
              ${picked ? `<ul class="picked-list" aria-label="Already entered">${picked}</ul>` : ""}
            </div>
          </div>
          <div class="card-grid ${controllable ? "" : "is-watching"}">
            ${available.map((slot) => runnerCardHtml(racerById(slot.racerId), { disabled: !controllable, action: "select" })).join("")}
          </div>
        </div>
        <aside class="panel side-panel">
          <h3 class="side-title">League table</h3>
          <ol class="team-list">${[...state.players].sort((a, b) => b.score - a.score).map((team) => teamRowHtml(team, { active: team.id === player.id, score: true, showUsed: true })).join("")}</ol>
        </aside>
      </div>
    </section>`;

  if (controllable) {
    document.querySelectorAll("[data-select-id]").forEach((button) => {
      button.addEventListener("click", () => requestRaceRacer(button.dataset.selectId));
    });
  }
  network.broadcastState();
}

function chooseRaceRacer(racerId) {
  audio.playUi();
  const player = currentSelectionPlayer();
  const slot = player.team.find((entry) => entry.racerId === racerId && !entry.used);
  if (!slot) return;
  slot.used = true;
  state.entrants.push({
    playerId: player.id,
    racerId,
    pos: 0,
    tripped: false,
    finished: false,
    finishPlace: null,
    turns: 0,
    usedReroll: false,
    crossedTwenty: false,
    napping: false,
    charge: 0
  });
  state.selectionIndex += 1;

  if (state.selectionIndex >= state.selectionOrder.length) {
    startRace();
    return;
  }

  renderSelection();
  maybeRunBotSelection();
}

function maybeRunBotSelection() {
  if (!isGameAuthority()) return;
  const player = currentSelectionPlayer();
  if (!player || !player.isBot) return;
  window.setTimeout(() => {
    if (state.phase !== "selection" || currentSelectionPlayer() !== player) return;
    const available = player.team.filter((slot) => !slot.used).map((slot) => racerById(slot.racerId));
    const chaosFans = ["bubble-witch", "anchor-knight"];
    const chaos = isChaosRace(state.raceNumber);
    const ranked = shuffle(available).sort((a, b) => {
      const score = (racer) => (chaosFans.includes(racer.id) ? (chaos ? 1 : -1) : 0);
      return score(b) - score(a);
    });
    chooseRaceRacer(ranked[0].id);
  }, 650);
}

function startRace() {
  state.phase = "race";
  state.turnOrder = Array.from({ length: state.players.length }, (_, index) => (state.raceNumber + index) % state.players.length).map((index) => state.players[index].id);
  state.turnIndex = 0;
  addLog(`Race ${state.raceNumber + 1} starts at ${themeForRace(state.raceNumber).name}.`);
  renderRace();
  maybeRunBotTurn();
}

// ---------------------------------------------------------------------------
// Race view: mounted once per race, then patched in place so tokens glide.
// ---------------------------------------------------------------------------

const portraitQuery = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 700px)") : { matches: false, addEventListener() {} };
let raceView = null;

if (portraitQuery.addEventListener) {
  portraitQuery.addEventListener("change", () => {
    if (state.phase === "race") {
      raceView = null;
      renderRace();
    }
  });
}

// Where runners sit inside one board tile, and how big they are, by how many share it.
function stackOffsets(count) {
  const t = ArcaneMaps.TILE;
  if (count <= 1) return [[0, 0]];
  if (count === 2) return [[-0.21 * t, 0], [0.21 * t, 0]];
  if (count === 3) return [[-0.21 * t, 0.17 * t], [0.21 * t, 0.17 * t], [0, -0.19 * t]];
  return [[-0.21 * t, -0.21 * t], [0.21 * t, -0.21 * t], [-0.21 * t, 0.21 * t], [0.21 * t, 0.21 * t]];
}

function tokenSize(count) {
  const t = ArcaneMaps.TILE;
  return count <= 1 ? 0.74 * t : count === 2 ? 0.52 * t : 0.46 * t;
}

function renderRace() {
  const portrait = portraitQuery.matches;
  const key = `${state.raceNumber}|${portrait}|${state.entrants.map((entrant) => entrant.playerId + entrant.racerId).join(",")}`;
  if (!raceView || raceView.key !== key || !document.body.contains(raceView.root)) mountRace(key, portrait);
  paintRace();
  network.broadcastState();
}

function mountRace(key, portrait) {
  const theme = themeForRace(state.raceNumber);
  const chaos = isChaosRace(state.raceNumber);
  const points = RACE_POINTS[state.raceNumber];
  const size = ArcaneMaps.size(portrait);
  app.innerHTML = `
    <section class="race-screen theme-${theme.key}">
      <div class="race-main">
        <header class="race-head">
          <div>
            <p class="phase-step">Race ${state.raceNumber + 1} of 4 · ${chaos ? "Chaos track" : "Calm track"}</p>
            <h2 class="screen-title">${theme.name}</h2>
          </div>
          <p class="stakes"><span class="medal is-gold">1st</span> +${points[0]} <span class="medal is-silver">2nd</span> +${points[1]}</p>
        </header>
        <div class="board ${portrait ? "is-portrait" : ""}" style="--u:${(100 / size.w).toFixed(5)}cqw;aspect-ratio:${size.w} / ${size.h}">
          <div class="board-map">${ArcaneMaps.boardSvg(state.raceNumber, { portrait, chaosSpaces: chaos ? CHAOS_SPACES : {}, idPrefix: "rb" })}</div>
          <div class="board-tokens" id="boardTokens"></div>
          <div class="board-callout" id="boardCallout" aria-live="polite"></div>
        </div>
        ${chaos ? `<ul class="map-legend">
          <li><i class="legend-dot is-boost"></i>Boost: jump ahead</li>
          <li><i class="legend-dot is-setback"></i>Setback: slide back</li>
          <li><i class="legend-dot is-trip"></i>Trip: lose your next move</li>
        </ul>` : `<p class="map-legend-note">Calm track: no special spaces.</p>`}
      </div>
      <div class="turn-card" id="turnCard"></div>
      <section class="panel standings-panel">
        <h3 class="side-title">Positions</h3>
        <ol class="standings" id="standings"></ol>
      </section>
      <details class="panel race-log">
        <summary class="side-title">Race log</summary>
        <ol id="raceLog"></ol>
      </details>
    </section>`;
  raceView = {
    key,
    portrait,
    root: app.querySelector(".race-screen"),
    tokens: new Map(),
    lastPos: new Map(),
    turnHtml: "",
    standingsHtml: "",
    logHtml: "",
    calloutHtml: ""
  };
}

function entrantStatus(entrant) {
  if (entrant.finished) return entrant.finishPlace === 1 ? "Finished 1st" : entrant.finishPlace === 2 ? "Finished 2nd" : `Finished ${entrant.finishPlace}th`;
  if (entrant.pos === 0) return "At the start";
  return `Space ${entrant.pos}`;
}

function paintRace() {
  const view = raceView;
  const current = currentEntrant();
  const activeId = state.raceOver ? null : current?.playerId;

  // Tokens
  const layer = document.getElementById("boardTokens");
  const groups = new Map();
  state.entrants.forEach((entrant) => {
    const spot = entrant.finished ? TRACK_LENGTH : entrant.pos;
    if (!groups.has(spot)) groups.set(spot, []);
    groups.get(spot).push(entrant);
  });
  state.entrants.forEach((entrant) => {
    const player = playerById(entrant.playerId);
    const racer = racerById(entrant.racerId);
    const spot = entrant.finished ? TRACK_LENGTH : entrant.pos;
    const group = groups.get(spot);
    const offset = stackOffsets(group.length)[group.indexOf(entrant)];
    const [x, y] = ArcaneMaps.spacePoint(spot, view.portrait);
    let token = view.tokens.get(entrant.playerId);
    if (!token) {
      token = document.createElement("button");
      token.type = "button";
      token.className = "token";
      token.innerHTML = `<span class="token-body">${portraitImg(racer.id)}</span><span class="token-badge" aria-hidden="true"></span><span class="token-tip" role="tooltip"><span class="tip-team"></span><strong>${racer.name}</strong><span class="tip-power"><b>${racer.powerName}</b> ${racer.power}</span><span class="tip-pos"></span></span>`;
      token.style.setProperty("--team", player.color);
      layer.appendChild(token);
      view.tokens.set(entrant.playerId, token);
    }
    token.style.setProperty("--size", tokenSize(group.length).toFixed(1));
    token.style.setProperty("--x", (x + offset[0]).toFixed(1));
    token.style.setProperty("--y", (y + offset[1]).toFixed(1));
    token.style.zIndex = String(entrant.playerId === activeId ? 30 : 10 + Math.round(y / 10));
    token.classList.toggle("is-active", entrant.playerId === activeId);
    token.classList.toggle("is-ability", entrant.playerId === state.abilityFlash?.playerId);
    token.classList.toggle("is-down", Boolean(entrant.tripped || entrant.napping));
    token.classList.toggle("is-finished", entrant.finished);
    const mapWidth = ArcaneMaps.size(view.portrait).w;
    token.classList.toggle("tip-below", y < 200);
    token.classList.toggle("tip-left", x > mapWidth - 170);
    token.classList.toggle("tip-right", x < 170);
    token.querySelector(".token-badge").textContent = entrant.finished ? String(entrant.finishPlace) : entrant.tripped ? "!" : entrant.napping ? "z" : "";
    token.querySelector(".tip-team").textContent = player.name;
    token.querySelector(".tip-team").style.color = player.color;
    token.querySelector(".tip-pos").textContent = entrantStatus(entrant);
    token.setAttribute("aria-label", `${player.name}: ${racer.name}, ${entrantStatus(entrant).toLowerCase()}. ${racer.powerName}: ${racer.power}`);
    const last = view.lastPos.get(entrant.playerId);
    if (last !== undefined && last !== spot && typeof token.firstElementChild.animate === "function") {
      token.firstElementChild.animate(
        [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-38%) scale(1.08)" }, { transform: "translateY(0) scale(1)" }],
        { duration: Math.min(STEP_DELAY + 20, 220), easing: "cubic-bezier(.22,.8,.3,1)" }
      );
    }
    view.lastPos.set(entrant.playerId, spot);
  });

  // Callout
  let calloutHtml = "";
  if (state.abilityFlash) {
    const player = playerById(state.abilityFlash.playerId);
    calloutHtml = `<div class="callout" style="--team:${player.color}">${portraitImg(state.abilityFlash.racerId)}<div><span class="callout-who">${teamName(player)} · ${racerById(state.abilityFlash.racerId).name}</span><strong>${escapeHtml(state.abilityFlash.name)}</strong><span class="callout-detail">${escapeHtml(state.abilityFlash.detail)}</span></div></div>`;
  } else if (state.effectFlash) {
    calloutHtml = `<div class="callout is-effect is-${state.effectFlash.type}"><i class="legend-dot is-${state.effectFlash.type}"></i><strong>${escapeHtml(state.effectFlash.text)}</strong></div>`;
  }
  if (calloutHtml !== view.calloutHtml) {
    document.getElementById("boardCallout").innerHTML = calloutHtml;
    view.calloutHtml = calloutHtml;
  }

  // Turn card
  const turnHtml = turnCardHtml(current);
  if (turnHtml !== view.turnHtml) {
    const card = document.getElementById("turnCard");
    const hadFocus = document.activeElement?.id === "rollButton";
    card.innerHTML = turnHtml;
    view.turnHtml = turnHtml;
    const roll = document.getElementById("rollButton");
    if (roll) {
      roll.addEventListener("click", requestTakeTurn);
      if (hadFocus && !roll.disabled) roll.focus({ preventScroll: true });
    }
  }

  // Standings
  const ranked = [...state.entrants].sort((a, b) => (a.finishPlace || 99) - (b.finishPlace || 99) || b.pos - a.pos);
  const standingsHtml = ranked.map((entrant, index) => {
    const player = playerById(entrant.playerId);
    const racer = racerById(entrant.racerId);
    const progress = Math.min(100, (entrant.finished ? TRACK_LENGTH : entrant.pos) / TRACK_LENGTH * 100);
    return `<li class="standing ${entrant.playerId === activeId ? "is-active" : ""}" style="--team:${player.color};--progress:${progress.toFixed(1)}%">
      <span class="standing-rank">${index + 1}</span>
      ${portraitImg(racer.id, "", "")}
      <span class="standing-copy"><strong>${teamName(player)}</strong><span>${racer.name}${entrant.tripped ? " · tripped" : entrant.napping ? " · napping" : ""}</span></span>
      <span class="standing-pos">${entrant.finished ? (entrant.finishPlace === 1 ? "1st" : entrant.finishPlace === 2 ? "2nd" : "Done") : entrant.pos}</span>
      <span class="standing-bar" aria-hidden="true"></span>
    </li>`;
  }).join("");
  if (standingsHtml !== view.standingsHtml) {
    document.getElementById("standings").innerHTML = standingsHtml;
    view.standingsHtml = standingsHtml;
  }

  const logHtml = state.log.map((entry) => `<li>${entry}</li>`).join("");
  if (logHtml !== view.logHtml) {
    document.getElementById("raceLog").innerHTML = logHtml;
    view.logHtml = logHtml;
  }
}

// Pips for 1-8 on a 3x3 grid; anything else (?, z for a nap, - for standing up) shows as text.
function dieFaceHtml(value) {
  const face = Number(value);
  if (Number.isInteger(face) && face >= 1 && face <= 8) return `<span id="dieValue" class="pips" data-face="${face}">${"<i></i>".repeat(9)}</span>`;
  return `<span id="dieValue" class="die-text">${escapeHtml(String(value))}</span>`;
}

function setDieFace(element, value) {
  if (!element) return;
  element.className = "pips";
  element.dataset.face = String(value);
  if (element.children.length !== 9) element.innerHTML = "<i></i>".repeat(9);
}

function turnCardHtml(entrant) {
  if (!entrant || state.raceOver) {
    return `<div class="panel turn-panel"><p class="turn-wait">Race complete. Tallying the podium...</p></div>`;
  }
  const player = playerById(entrant.playerId);
  const racer = racerById(entrant.racerId);
  const controllable = canControlPlayer(player);
  const label = entrant.tripped ? "Stand up" : entrant.napping ? "Wake up" : racer.id === "moss-golem" ? "March" : "Roll";
  const value = state.lastRoll ?? "";
  const shown = value === "" ? "?" : value;
  const pips = state.diceSides === 8 ? "d8" : "d6";
  const waiting = player.isBot ? `${teamName(player)} (bot) is rolling` : `Waiting for ${teamName(player)}`;
  return `
    <div class="panel turn-panel" style="--team:${player.color};--tint:${racerTint(racer.id)}">
      <div class="turn-who">
        ${portraitImg(racer.id, "turn-art", "")}
        <div class="turn-names">
          <span class="turn-team"><span class="team-swatch"></span>${teamName(player)}</span>
          <strong class="turn-runner">${racer.name}</strong>
          <span class="turn-power"><b>${racer.powerName}</b> ${racer.power}</span>
        </div>
      </div>
      <div class="turn-action">
        <div class="die-wrap ${state.diceRolling ? "is-rolling" : ""}">
          <div class="die ${pips} ${value === "" ? "is-idle" : ""}" aria-live="polite" aria-label="${value ? `Die shows ${value}` : "Die ready"}">${dieFaceHtml(shown)}</div>
          <span class="die-caption">${escapeHtml(state.diceCaption)}</span>
        </div>
        ${controllable
          ? `<button id="rollButton" class="btn btn-primary btn-roll" type="button" ${state.busy ? "disabled" : ""}>${label}<kbd class="key-hint">R</kbd></button>`
          : `<p class="turn-wait">${waiting}</p>`}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

async function endRace() {
  state.raceOver = true;
  state.motionPlayerId = null;
  renderRace();
  await wait(900);
  showRaceResults();
}

function showRaceResults() {
  const points = RACE_POINTS[state.raceNumber];
  state.finishers.slice(0, 2).forEach((entrant, index) => {
    playerById(entrant.playerId).score += points[index];
  });
  const [first, second] = state.finishers;
  track("race-finish", {
    race: state.raceNumber + 1,
    track: isChaosRace(state.raceNumber) ? "chaos" : "calm",
    teams: state.players.length,
    first: first ? racerById(first.racerId).name : "",
    second: second ? racerById(second.racerId).name : "",
    winnerIsBot: first ? Boolean(playerById(first.playerId).isBot) : false
  });
  state.phase = "results";
  renderRaceResults();
}

function podiumHtml(entrant, place, points) {
  if (!entrant) return "";
  const player = playerById(entrant.playerId);
  const racer = racerById(entrant.racerId);
  return `
    <div class="podium-spot place-${place}" style="--team:${player.color};--tint:${racerTint(racer.id)}">
      ${portraitImg(racer.id, "podium-art", racer.name)}
      <span class="medal ${place === 1 ? "is-gold" : "is-silver"}">${place === 1 ? "1st" : "2nd"}</span>
      <strong>${racer.name}</strong>
      <span class="podium-team">${teamName(player)}</span>
      <span class="podium-points">+${points}</span>
    </div>`;
}

function leagueTableHtml(players, options = {}) {
  const top = Math.max(1, ...players.map((player) => player.score));
  return `<ol class="league-table">${players.map((player, index) => `
    <li class="league-row ${options.winnerScore === player.score ? "is-winner" : ""}" style="--team:${player.color};--share:${(player.score / top * 100).toFixed(1)}%">
      <span class="league-rank">${index + 1}</span>
      <span class="league-name"><span class="team-swatch"></span>${teamName(player)}</span>
      ${teamSlotsHtml(player, { showUsed: options.showUsed })}
      <span class="league-score">${player.score}<small>pts</small></span>
      <span class="league-bar" aria-hidden="true"></span>
    </li>`).join("")}</ol>`;
}

function renderRaceResults() {
  const points = RACE_POINTS[state.raceNumber];
  const standings = [...state.players].sort((a, b) => b.score - a.score);
  const last = state.raceNumber === 3;
  app.innerHTML = `
    <section class="panel results-screen">
      <p class="phase-step">Race ${state.raceNumber + 1} of 4 · ${themeForRace(state.raceNumber).name}</p>
      <h2 class="screen-title">Podium</h2>
      <div class="podium">
        ${podiumHtml(state.finishers[0], 1, points[0])}
        ${podiumHtml(state.finishers[1], 2, points[1])}
      </div>
      <h3 class="side-title">League table</h3>
      ${leagueTableHtml(standings, { showUsed: true })}
      <div class="results-actions">
        ${canAdvanceGame()
          ? `<button id="nextRaceButton" class="btn btn-primary" type="button">${last ? "Final standings" : `On to race ${state.raceNumber + 2}: ${themeForRace(state.raceNumber + 1).name}`}</button>`
          : `<p class="waiting-note">Waiting for the host to continue</p>`}
      </div>
    </section>`;
  const nextButton = document.getElementById("nextRaceButton");
  if (nextButton) nextButton.addEventListener("click", () => {
    audio.playUi();
    if (state.raceNumber === 3) showFinalResults();
    else {
      state.raceNumber += 1;
      beginRaceSelection();
    }
  });
  network.broadcastState();
}

function showFinalResults() {
  state.phase = "final";
  const topScore = Math.max(...state.players.map((player) => player.score));
  const winners = state.players.filter((player) => player.score === topScore);
  track("game-finish", {
    ...teamMix(),
    winner: winners.length > 1 ? "tie" : winners[0].isBot ? "bot" : "human",
    topScore
  });
  renderFinalResults();
}

function renderFinalResults() {
  const standings = [...state.players].sort((a, b) => b.score - a.score);
  const topScore = standings[0].score;
  const winners = standings.filter((player) => player.score === topScore);
  const champion = winners[0];
  app.innerHTML = `
    <section class="panel final-screen" style="--team:${champion.color}">
      <div class="final-banner">
        <p class="phase-step">League complete</p>
        <h2 class="final-title">${winners.length > 1 ? `Shared title: ${winners.map(teamName).join(" & ")}` : `${teamName(champion)} ${champion.name.trim().toLowerCase() === "you" ? "win" : "wins"} the league`}</h2>
        <div class="final-cast">${champion.team.map((slot) => portraitImg(slot.racerId, "", racerById(slot.racerId).name)).join("")}</div>
      </div>
      ${leagueTableHtml(standings, { winnerScore: topScore })}
      <div class="results-actions">
        ${canAdvanceGame() ? `<button id="playAgainButton" class="btn btn-primary" type="button">${network.online ? "Back to the lobby" : "Play again"}</button>` : `<p class="waiting-note">Waiting for the host</p>`}
      </div>
    </section>`;
  const playAgainButton = document.getElementById("playAgainButton");
  if (playAgainButton) playAgainButton.addEventListener("click", async () => {
    audio.playUi();
    track("play-again", { mode: gameMode() });
    if (network.online) {
      try {
        await network.resetLobby();
      } catch (error) {
        showNetworkError(error);
      }
    } else renderSetup();
  });
  if (!network.online || network.isHost) audio.playFinish();
  network.broadcastState();
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 18);
}

function maybeRunBotTurn() {
  if (!isGameAuthority()) return;
  if (state.raceOver || state.busy) return;
  const entrant = currentEntrant();
  if (!entrant) return;
  const player = playerById(entrant.playerId);
  if (!player.isBot) return;
  window.setTimeout(takeTurn, 650);
}

async function animateDice(finalValue, sides = 6, caption = "Rolling") {
  state.diceSides = sides;
  state.diceRolling = true;
  state.diceCaption = caption;
  state.lastRoll = "?";
  renderRace();

  const cycles = 8;
  for (let index = 0; index < cycles; index += 1) {
    const dieValue = document.getElementById("dieValue");
    if (dieValue) setDieFace(dieValue, randomInt(1, sides));
    audio.playDice();
    await wait(62 + index * 6);
  }

  state.lastRoll = finalValue;
  state.diceRolling = false;
  state.diceCaption = caption === "Rolling" ? "Rolled" : caption;
  renderRace();
  await wait(260);
}

async function showAbility(entrant, name, detail) {
  if (!entrant) return;
  const racer = racerById(entrant.racerId);
  state.abilityFlash = { playerId: entrant.playerId, racerId: entrant.racerId, name, detail };
  audio.playAbility();
  renderRace();
  await wait(760);
  state.abilityFlash = null;
  renderRace();
}

async function showEffect(type, text, sound = type) {
  state.effectFlash = { type, text };
  audio.playHazard(sound);
  renderRace();
  await wait(620);
  state.effectFlash = null;
  renderRace();
}

async function takeTurn() {
  if (state.busy || state.raceOver) return;
  const entrant = currentEntrant();
  if (!entrant || entrant.finished) {
    advanceTurn();
    return;
  }

  await audio.ensure();
  state.busy = true;
  entrant.turns += 1;
  const player = playerById(entrant.playerId);
  const racer = racerById(entrant.racerId);
  const tune = racer.tune || {};

  if (entrant.tripped) {
    entrant.tripped = false;
    state.lastRoll = "–";
    state.diceCaption = "Standing up";
    await showEffect("trip", `${racer.name} stands up`, "trip");
    addLog(`<strong>${escapeHtml(player.name)}</strong>'s ${racer.name} stands up and misses the move.`);
    await finishTurn();
    return;
  }

  if (entrant.napping) {
    entrant.napping = false;
    state.lastRoll = "z";
    state.diceCaption = "Napping";
    await showAbility(entrant, racer.powerName, "Sleeping off the big dream. No move this turn.");
    addLog(`<strong>${escapeHtml(player.name)}</strong>'s ${racer.name} naps through the turn.`);
    await finishTurn();
    return;
  }

  let naturalRoll = null;
  let movement = 0;
  const notes = [];
  const leader = getLeaderPosition();

  if (racer.id === "moss-golem") {
    const lastPlace = leader - entrant.pos >= tune.gap;
    movement = lastPlace ? tune.last : tune.fixed;
    await animateDice(movement, 6, lastPlace ? "Pushing from behind" : "Measured march");
  } else if (racer.id === "nap-dragon") {
    naturalRoll = randomInt(1, 8);
    movement = naturalRoll;
    await animateDice(naturalRoll, 8, "Dream die");
  } else {
    naturalRoll = randomInt(1, 6);
    movement = naturalRoll;
    await animateDice(naturalRoll, 6, "Rolling");
  }

  if (racer.id === "clockwork-hare" && naturalRoll !== null && naturalRoll <= tune.below) {
    await showAbility(entrant, racer.powerName, `A ${naturalRoll} gets rerolled.`);
    naturalRoll = randomInt(1, 6);
    movement = naturalRoll;
    movement = naturalRoll + tune.bonus;
    notes.push(`rerolled to ${naturalRoll}, +${tune.bonus}`);
    await animateDice(naturalRoll, 6, "Reroll");
  }

  const bonus = async (amount, detail, note) => {
    movement += amount;
    await showAbility(entrant, racer.powerName, detail);
    notes.push(note || `+${amount}`);
  };

  if (racer.id === "lucky-turnip" && naturalRoll === 2) {
    movement = tune.value;
    await showAbility(entrant, racer.powerName, `The lucky 2 counts as ${tune.value}.`);
    notes.push(`2 became ${tune.value}`);
  }
  if (racer.id === "comet-kid" && naturalRoll === 6) await bonus(tune.bonus, `A perfect 6 adds ${tune.bonus}.`);
  if (racer.id === "moon-moth" && naturalRoll % 2 === 1) await bonus(tune.bonus, "An odd roll adds 1.");
  if (racer.id === "gear-goblin" && entrant.charge > 0) await bonus(entrant.charge, `Tuned gears add ${entrant.charge}.`);
  if (racer.id === "lantern-sprite" && trailsAllBy(entrant, tune.gap)) {
    const ahead = state.entrants.filter((other) => other !== entrant && !other.finished).length * tune.bonus;
    await bonus(ahead, `Trailing the pack: the lantern flares for ${ahead}.`);
  }
  if (racer.id === "crown-crab" && leader - entrant.pos <= tune.range) await bonus(tune.bonus, `Within ${tune.range} of the lead: royal pace adds ${tune.bonus}.`);
  if (racer.id === "spark-snail" && entrant.turns % tune.every === 0) await bonus(tune.bonus, `Every third turn: stored energy releases ${tune.bonus}.`);
  if (racer.id === "wisp-twins") {
    if (entrant.turns % 2 === 1) await bonus(tune.up, `The bright twin adds ${tune.up}.`);
    else {
      movement = Math.max(1, movement - tune.down);
      await showAbility(entrant, racer.powerName, `The dim twin takes ${tune.down} away.`);
      notes.push(`-${tune.down}`);
    }
  }
  if (racer.id === "river-otter") {
    const companions = state.entrants.filter((other) => other !== entrant && !other.finished && other.pos - entrant.pos >= 0 && other.pos - entrant.pos <= tune.range).length;
    if (companions) await bonus(Math.min(tune.max, companions), `${companions} rival${companions === 1 ? "" : "s"} close by add ${Math.min(tune.max, companions)}.`);
  }
  if (racer.id === "mirror-owl" && naturalRoll !== null && state.previousNaturalRoll > naturalRoll) {
    const gain = Math.min(tune.max, state.previousNaturalRoll - naturalRoll);
    await bonus(gain, `The last runner rolled ${state.previousNaturalRoll}. Reflection adds ${gain}.`);
  }
  if (racer.id === "meteor-mouse" && leader - entrant.pos >= tune.gap) {
    const before = movement;
    movement *= 2;
    await showAbility(entrant, racer.powerName, `Far behind: ${before} doubles to ${movement}.`);
    notes.push("doubled");
  }
  if (racer.id === "storm-crow" && naturalRoll !== null && naturalRoll <= tune.max) {
    const target = Math.max(entrant.pos + naturalRoll, leader - tune.gap);
    movement = target - entrant.pos;
    await showAbility(entrant, racer.powerName, `Lightning carries the crow to space ${target}.`);
    notes.push(`jumped ${movement}`);
  }

  const yak = state.entrants.find((other) => other !== entrant && !other.finished && other.racerId === "frost-yak" && entrant.pos - other.pos >= 0 && entrant.pos - other.pos <= racerById("frost-yak").tune.range);
  if (yak && movement > 1) {
    const chill = Math.min(movement - 1, racerById("frost-yak").tune.chill);
    movement -= chill;
    await showAbility(yak, racerById("frost-yak").powerName, `${racer.name} is chilled and loses ${chill}.`);
    notes.push(`chilled -${chill}`);
  }

  if (racer.id === "anchor-knight" && naturalRoll !== null && naturalRoll < tune.below && movement < tune.floor) {
    movement = tune.floor;
    await showAbility(entrant, racer.powerName, `A 1 becomes ${tune.floor}.`);
    notes.push(`raised to ${tune.floor}`);
  }

  const startPos = entrant.pos;
  if (racer.id === "shadow-cat") await moveShadowCatAnimated(entrant, movement, tune.free);
  else await moveEntrantAnimated(entrant, movement, "main move");

  if (racer.id === "gear-goblin" && naturalRoll !== null && naturalRoll <= tune.trigger && entrant.charge < tune.cap) {
    entrant.charge += 1;
    await showAbility(entrant, racer.powerName, `Low roll. Gears tuned: +${entrant.charge} on later rolls.`);
  }

  let blinks = 0;
  while (!entrant.finished && racer.id === "portal-pup" && blinks < 3 && hasOpponentAt(entrant.pos, entrant.playerId)) {
    blinks += 1;
    await showAbility(entrant, racer.powerName, blinks > 1 ? `Another rival! Blink again for ${tune.bonus}.` : `Landed on a rival. Blink ${tune.bonus} more.`);
    await moveEntrantAnimated(entrant, tune.bonus, "Blink");
    notes.push(`blinked +${tune.bonus}`);
  }

  if (!entrant.finished && racer.id === "prism-slime") {
    const targets = state.entrants.filter((other) => other !== entrant && !other.finished && Math.abs(other.pos - entrant.pos) <= tune.range && other.pos > 0);
    if (targets.length) {
      await showAbility(entrant, racer.powerName, `${targets.length} rival${targets.length === 1 ? "" : "s"} slide back ${tune.push}.`);
      for (const target of targets) await moveEntrantAnimated(target, -tune.push, "Slick Landing");
      notes.push("slid rivals back");
    }
  }

  if (racer.id === "quake-beetle" && naturalRoll >= tune.min) {
    const targets = state.entrants.filter((other) => other !== entrant && !other.finished && Math.abs(other.pos - entrant.pos) <= tune.range && other.pos > 0);
    if (targets.length) {
      await showAbility(entrant, racer.powerName, `${targets.length} nearby rival${targets.length === 1 ? "" : "s"} slide back ${tune.push}.`);
      for (const target of targets) await moveEntrantAnimated(target, -tune.push, "Ground Pound");
      notes.push("shook rivals back");
    }
  }

  if (!entrant.finished && racer.id === "pepper-pixie" && !entrant.crossedTwenty && startPos < tune.at && entrant.pos >= tune.at) {
    entrant.crossedTwenty = true;
    await showAbility(entrant, racer.powerName, `Crossing space ${tune.at} triggers a ${tune.bonus}-space surge.`);
    await moveEntrantAnimated(entrant, tune.bonus, "Spicy Finish");
    notes.push(`surged +${tune.bonus}`);
  }

  if (racer.id === "nap-dragon" && naturalRoll >= tune.nap && !entrant.finished) {
    entrant.napping = true;
    notes.push("will nap");
  }

  if (!entrant.finished) await applyTrackEffectAnimated(entrant);
  if (!entrant.finished) await triggerBubbleBounce(entrant);
  if (naturalRoll === 6) await triggerEchoFoxAnimated(entrant.playerId);
  state.previousNaturalRoll = naturalRoll;

  const netMovement = entrant.pos - startPos;
  addLog(`<strong>${escapeHtml(player.name)}</strong>'s ${racer.name} ${netMovement >= 0 ? `moved ${netMovement}` : `slipped back ${-netMovement}`}${notes.length ? ` (${notes.join(", ")})` : ""}.`);
  renderRace();

  if (state.finishers.length >= 2) {
    await endRace();
    return;
  }
  await finishTurn();
}

function trailsAllBy(entrant, gap) {
  const others = state.entrants.filter((other) => other !== entrant && !other.finished);
  return others.length > 0 && others.every((other) => other.pos - entrant.pos >= gap);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function hasOpponentAt(position, playerId) {
  return state.entrants.some((other) => other.playerId !== playerId && !other.finished && other.pos === position);
}

async function moveShadowCatAnimated(entrant, amount, freeSpaces = 1) {
  let remaining = Math.max(0, amount);
  let free = freeSpaces;
  let physicalStep = 0;
  let used = false;
  while (remaining > 0 && entrant.pos < TRACK_LENGTH) {
    const nextPosition = entrant.pos + 1;
    const occupied = hasOpponentAt(nextPosition, entrant.playerId);
    physicalStep += 1;
    if (occupied && free > 0 && remaining > 1) {
      free -= 1;
      if (!used) {
        used = true;
        await showAbility(entrant, racerById(entrant.racerId).powerName, "Slipped through a crowded space for free.");
      }
    } else remaining -= 1;
    await stepEntrantTo(entrant, nextPosition, physicalStep, 1);
    if (entrant.finished) break;
  }
}

async function triggerBubbleBounce(mover) {
  const witches = state.entrants.filter((other) => other !== mover && !other.finished && other.racerId === "bubble-witch" && other.pos === mover.pos && other.pos > 0);
  for (const witch of witches) {
    const amount = racerById("bubble-witch").tune.bounce;
    await showAbility(witch, racerById("bubble-witch").powerName, `A rival landed on the bubble. Bounce forward ${amount}.`);
    await moveEntrantAnimated(witch, amount, "Bubble Bounce");
  }
}

async function moveEntrantAnimated(entrant, amount, reason) {
  if (entrant.finished || amount === 0) return;
  const racer = racerById(entrant.racerId);
  if (amount < 0 && racer.id === "anchor-knight") {
    await showAbility(entrant, racer.powerName, `Backward movement from ${reason} is ignored.`);
    addLog(`<strong>${racer.name}</strong> ignored backward movement from ${reason}.`);
    return;
  }

  const direction = amount > 0 ? 1 : -1;
  const steps = Math.abs(amount);
  for (let index = 0; index < steps; index += 1) {
    if (entrant.finished) break;
    const nextPosition = Math.max(0, entrant.pos + direction);
    if (nextPosition === entrant.pos) break;
    await stepEntrantTo(entrant, nextPosition, index + 1, direction);
  }
}

async function stepEntrantTo(entrant, position, stepIndex, direction) {
  state.motionPlayerId = entrant.playerId;
  setEntrantPosition(entrant, position);
  audio.playStep(stepIndex, direction);
  renderRace();
  await wait(STEP_DELAY);
}

function setEntrantPosition(entrant, position) {
  entrant.pos = position;
  if (entrant.pos >= TRACK_LENGTH && !entrant.finished) {
    entrant.pos = TRACK_LENGTH;
    entrant.finished = true;
    entrant.finishPlace = state.finishers.length + 1;
    state.finishers.push(entrant);
    state.motionPlayerId = null;
    const player = playerById(entrant.playerId);
    const racer = racerById(entrant.racerId);
    addLog(`<strong>${player.name}</strong>'s ${racer.name} finished in place ${entrant.finishPlace}.`);
    audio.playFinish();
  }
}

async function applyTrackEffectAnimated(entrant) {
  if (state.raceNumber % 2 === 0) return;
  const effect = CHAOS_SPACES[entrant.pos];
  if (!effect) return;
  const racer = racerById(entrant.racerId);

  if (racer.id === "bubble-witch" && (effect.type === "setback" || effect.type === "trip")) {
    await showAbility(entrant, racer.powerName, `The ${effect.type} space is blocked by the protective orb.`);
    addLog(`<strong>${racer.name}</strong> ignored the ${effect.type} space.`);
    return;
  }

  if (effect.type === "boost") {
    await showEffect("boost", `Boost space: ${effect.label}`);
    await moveEntrantAnimated(entrant, effect.amount, "boost space");
  } else if (effect.type === "setback") {
    await showEffect("setback", `Setback space: ${effect.label}`);
    await moveEntrantAnimated(entrant, effect.amount, "setback space");
  } else if (effect.type === "trip") {
    await showEffect("trip", "Trip space: lose the next move");
    entrant.tripped = true;
    renderRace();
  }
}

async function triggerEchoFoxAnimated(sourcePlayerId) {
  const source = state.entrants.find((entrant) => entrant.playerId === sourcePlayerId);
  const foxes = state.entrants.filter((entrant) => !entrant.finished && entrant.racerId === "echo-fox" && (entrant.playerId === sourcePlayerId || (source && source.pos > entrant.pos)));
  for (const entrant of foxes) {
    const tune = racerById(entrant.racerId).tune;
    const amount = entrant.playerId === sourcePlayerId ? tune.own : tune.echo;
    await showAbility(entrant, racerById(entrant.racerId).powerName, entrant.playerId === sourcePlayerId ? `Its own 6 echoes for ${amount} more.` : `A rival ahead rolled a 6. Echo Fox moves ${amount}.`);
    await moveEntrantAnimated(entrant, amount, "Resonance");
    addLog(`<strong>Echo Fox</strong> moved ${amount} from Resonance.`);
  }
}

async function finishTurn() {
  state.motionPlayerId = null;
  renderRace();
  await wait(420);
  state.busy = false;
  advanceTurn();
}

function advanceTurn() {
  if (state.raceOver) return;
  let attempts = 0;
  do {
    state.turnIndex = (state.turnIndex + 1) % state.turnOrder.length;
    attempts += 1;
  } while (currentEntrant()?.finished && attempts <= state.turnOrder.length);
  state.lastRoll = null;
  state.diceCaption = "Ready";
  state.diceSides = 6;
  state.motionPlayerId = null;
  renderRace();
  maybeRunBotTurn();
}


renderSetup();

// Online lobbies need the Node server. On static hosting, fall back to same-screen play quietly.
if (network.supported) {
  const probe = typeof AbortController === "function" ? new AbortController() : null;
  const timer = window.setTimeout(() => probe?.abort(), 4000);
  fetch("/api/info", { signal: probe?.signal, cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("No lobby server");
    })
    .catch(() => {
      network.supported = false;
      if (state.phase === "setup") {
        if (setupMode !== "local") setupMode = "local";
        renderSetup();
      }
    })
    .finally(() => window.clearTimeout(timer));
}
