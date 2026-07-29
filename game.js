"use strict";

const PLAYER_COLORS = ["#7ce6d2", "#ff9d6c", "#c9a6ff", "#ff8b9d"];
const TRACK_LENGTH = 30;
const RACE_POINTS = [[3, 1], [5, 2], [7, 3], [10, 5]];
const STEP_DELAY = 135;
const CHAOS_SPACES = {
  5: { type: "boost", label: "+2", amount: 2 },
  9: { type: "setback", label: "-2", amount: -2 },
  12: { type: "boost", label: "+2", amount: 2 },
  15: { type: "trip", label: "trip" },
  18: { type: "setback", label: "-3", amount: -3 },
  22: { type: "boost", label: "+3", amount: 3 },
  26: { type: "setback", label: "-2", amount: -2 }
};


const BOARD_SPACES = [
  { x: 70, y: 525 },
  { x: 135, y: 525 },
  { x: 195, y: 500 },
  { x: 245, y: 455 },
  { x: 280, y: 400 },
  { x: 290, y: 340 },
  { x: 270, y: 280 },
  { x: 225, y: 230 },
  { x: 175, y: 190 },
  { x: 130, y: 145 },
  { x: 180, y: 95 },
  { x: 250, y: 80 },
  { x: 320, y: 95 },
  { x: 375, y: 135 },
  { x: 405, y: 190 },
  { x: 430, y: 245 },
  { x: 490, y: 275 },
  { x: 555, y: 260 },
  { x: 610, y: 225 },
  { x: 650, y: 175 },
  { x: 690, y: 120 },
  { x: 755, y: 95 },
  { x: 820, y: 115 },
  { x: 870, y: 160 },
  { x: 900, y: 215 },
  { x: 900, y: 280 },
  { x: 875, y: 340 },
  { x: 830, y: 395 },
  { x: 770, y: 440 },
  { x: 735, y: 500 },
  { x: 820, y: 540 }
];

const RACERS = [
  { id: "clockwork-hare", name: "Clockwork Hare", icon: "🐇", tagline: "A spring in every step", powerName: "Second Chance", power: "When you roll a 1, reroll it once.", rating: 4 },
  { id: "moss-golem", name: "Moss Golem", icon: "🗿", tagline: "Slow, steady, exact", powerName: "Measured March", power: "Move exactly 4 instead of rolling.", rating: 4 },
  { id: "comet-kid", name: "Comet Kid", icon: "☄️", tagline: "Maximum velocity", powerName: "Flare Up", power: "A natural 6 gains 2 extra movement.", rating: 4 },
  { id: "bubble-witch", name: "Bubble Witch", icon: "🫧", tagline: "Trouble slides right off", powerName: "Protective Orb", power: "Ignore setbacks and trip spaces.", rating: 4 },
  { id: "echo-fox", name: "Echo Fox", icon: "🦊", tagline: "Every cheer carries", powerName: "Resonance", power: "Whenever another runner rolls a natural 6, move 1.", rating: 3 },
  { id: "anchor-knight", name: "Anchor Knight", icon: "⚓", tagline: "Never gives ground", powerName: "Hold Fast", power: "Cannot be moved backward by powers or track spaces.", rating: 4 },
  { id: "lantern-sprite", name: "Lantern Sprite", icon: "🏮", tagline: "Brightest from behind", powerName: "Catch-Up Glow", power: "Gain 2 movement when starting your turn in last place.", rating: 4 },
  { id: "prism-slime", name: "Prism Slime", icon: "🟣", tagline: "Personal space is optional", powerName: "Slick Landing", power: "After moving, runners sharing your space slide back 1.", rating: 3 },
  { id: "storm-crow", name: "Storm Crow", icon: "🌩️", tagline: "Bad rolls summon good weather", powerName: "Thunder Jump", power: "On a natural 1, jump to two spaces behind the leader.", rating: 4 },
  { id: "moon-moth", name: "Moon Moth", icon: "🦋", tagline: "Odd numbers feel lucky", powerName: "Lunar Drift", power: "Odd rolls gain 1 extra movement.", rating: 3 },
  { id: "gear-goblin", name: "Gear Goblin", icon: "⚙️", tagline: "Always tuning something", powerName: "Overclock", power: "Gain 1 movement while at least 6 spaces behind the leader.", rating: 3 },
  { id: "frost-yak", name: "Frost Yak", icon: "🦬", tagline: "A portable cold front", powerName: "Chill Field", power: "Opponents sharing your space lose 1 movement on their turns.", rating: 3 },
  { id: "portal-pup", name: "Portal Pup", icon: "🐕", tagline: "Doors are everywhere", powerName: "Blink", power: "After landing on another runner, move 2 more.", rating: 4 },
  { id: "quake-beetle", name: "Quake Beetle", icon: "🪲", tagline: "Tiny feet, huge impact", powerName: "Ground Pound", power: "On a natural 6, nearby opponents slide back 1.", rating: 3 },
  { id: "lucky-turnip", name: "Lucky Turnip", icon: "🥬", tagline: "Rooting for a reroll", powerName: "Fresh Start", power: "Once per race, reroll a result of 1 or 2.", rating: 4 },
  { id: "shadow-cat", name: "Shadow Cat", icon: "🐈‍⬛", tagline: "Crowds are shortcuts", powerName: "Slipstream", power: "Occupied spaces do not count while you move.", rating: 4 },
  { id: "crown-crab", name: "Crown Crab", icon: "🦀", tagline: "First place is a lifestyle", powerName: "Royal Pace", power: "Gain 2 movement when starting your turn tied for the lead.", rating: 3 },
  { id: "nap-dragon", name: "Nap Dragon", icon: "🐉", tagline: "Wakes up unpredictably", powerName: "Dream Die", power: "Roll an eight-sided die instead of a six-sided die.", rating: 4 },
  { id: "spark-snail", name: "Spark Snail", icon: "🐌", tagline: "Charges between turns", powerName: "Stored Energy", power: "Gain 2 movement on every second turn.", rating: 3 },
  { id: "wisp-twins", name: "Wisp Twins", icon: "👻", tagline: "One pushes, one pulls", powerName: "Alternating Current", power: "Gain 2 on odd turns and lose 1 on even turns.", rating: 3 },
  { id: "river-otter", name: "River Otter", icon: "🦦", tagline: "Momentum loves company", powerName: "Draft Current", power: "Gain 1 movement for each runner sharing your starting space.", rating: 3 },
  { id: "meteor-mouse", name: "Meteor Mouse", icon: "🐁", tagline: "Small target, big launch", powerName: "Slingshot", power: "If you begin 10 or more spaces behind the leader, move directly 5 spaces.", rating: 4 },
  { id: "mirror-owl", name: "Mirror Owl", icon: "🦉", tagline: "Watching closely", powerName: "Reflection", power: "If the previous runner rolled 5 or 6, gain 1 movement.", rating: 3 },
  { id: "pepper-pixie", name: "Pepper Pixie", icon: "🌶️", tagline: "A little too energetic", powerName: "Spicy Finish", power: "Gain 3 movement after crossing space 20 for the first time.", rating: 3 }
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

function updateSoundButton() {
  soundButton.textContent = `Sound: ${audio.enabled ? "on" : "off"}`;
  soundButton.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
}

function renderCharacterLibrary(filter = "") {
  const normalized = filter.trim().toLowerCase();
  const matches = RACERS.filter((racer) => [racer.name, racer.tagline, racer.powerName, racer.power].join(" ").toLowerCase().includes(normalized));
  characterGrid.innerHTML = matches.length ? matches.map((racer) => {
    const index = RACERS.findIndex((item) => item.id === racer.id) + 1;
    return `
      <article class="archive-card">
        <span class="archive-number">${String(index).padStart(2, "0")}</span>
        <div class="racer-icon">${racer.icon}</div>
        <h3>${racer.name}</h3>
        <p class="tagline">${racer.tagline}</p>
        <p class="power"><strong>${racer.powerName}:</strong> ${racer.power}</p>
      </article>`;
  }).join("") : `<p class="sidebar-note">No runners match that search.</p>`;
}

function openCharacters() {
  characterSearch.value = "";
  renderCharacterLibrary();
  charactersDialog.showModal();
  window.setTimeout(() => characterSearch.focus(), 0);
}

document.getElementById("rulesButton").addEventListener("click", () => rulesDialog.showModal());
document.getElementById("closeRulesButton").addEventListener("click", () => rulesDialog.close());
document.getElementById("charactersButton").addEventListener("click", openCharacters);
document.getElementById("closeCharactersButton").addEventListener("click", () => charactersDialog.close());
characterSearch.addEventListener("input", () => renderCharacterLibrary(characterSearch.value));
soundButton.addEventListener("click", () => audio.toggle());
document.addEventListener("pointerdown", () => audio.ensure(), { once: true });
updateSoundButton();
renderCharacterLibrary();

function lobbyCodeFromUrl() {
  if (typeof URLSearchParams === "undefined") return "";
  return new URLSearchParams(browserLocation.search || "").get("lobby") || "";
}

let setupMode = lobbyCodeFromUrl() ? "join" : "local";

function renderSetup() {
  state.phase = "setup";
  state.busy = false;
  const lobbyCode = lobbyCodeFromUrl();
  const serverNote = network.supported
    ? "Online server connected. Players can join from any internet connection."
    : "Online lobbies require this game to be served by the included Node server.";
  app.innerHTML = `
    <section class="hero-grid">
      <div class="panel hero-copy">
        <p class="eyebrow">Draft, race, disrupt</p>
        <h2>Build a strange team and survive four chaotic races.</h2>
        <p>Play on one screen, or create an online lobby that friends can join from their own devices.</p>
        <div class="feature-row">
          <div class="feature"><strong>4</strong><span>runners per team</span></div>
          <div class="feature"><strong>4</strong><span>escalating races</span></div>
          <div class="feature"><strong>ONLINE</strong><span>join from anywhere</span></div>
        </div>
        <div class="hero-actions">
          <button id="browseRunnersButton" class="ghost-button" type="button">Browse all 24 runners</button>
        </div>
        <div class="notice">${network.notice || serverNote}</div>
      </div>
      <div class="panel setup-panel">
        <div>
          <p class="eyebrow">Game mode</p>
          <h2>Start or join</h2>
        </div>
        <div class="mode-tabs" role="tablist" aria-label="Game mode">
          <button class="mode-tab ${setupMode === "local" ? "active" : ""}" data-setup-mode="local" type="button">Local</button>
          <button class="mode-tab ${setupMode === "create" ? "active" : ""}" data-setup-mode="create" type="button" ${network.supported ? "" : "disabled"}>Create lobby</button>
          <button class="mode-tab ${setupMode === "join" ? "active" : ""}" data-setup-mode="join" type="button" ${network.supported ? "" : "disabled"}>Join lobby</button>
        </div>

        <div id="localSetup" class="setup-mode" ${setupMode === "local" ? "" : "hidden"}>
          <div class="form-row">
            <label for="playerCount">Number of teams</label>
            <select id="playerCount">
              <option value="2">2 teams</option>
              <option value="3" selected>3 teams</option>
              <option value="4">4 teams</option>
            </select>
          </div>
          <div id="playerConfigList" class="player-config-list"></div>
          <button id="startButton" class="primary-button" type="button">Start local draft</button>
        </div>

        <div id="createSetup" class="setup-mode" ${setupMode === "create" ? "" : "hidden"}>
          <div class="form-row">
            <label for="createPlayerName">Your team name</label>
            <input id="createPlayerName" maxlength="18" value="Host Team" autocomplete="nickname" />
          </div>
          <div class="form-row">
            <label for="lobbySize">Maximum teams</label>
            <select id="lobbySize">
              <option value="2">2 teams</option>
              <option value="3">3 teams</option>
              <option value="4" selected>4 teams</option>
            </select>
          </div>
          <label class="check-row" for="fillBots">
            <input id="fillBots" type="checkbox" />
            <span>Fill empty seats with bots when the host starts</span>
          </label>
          <button id="createLobbyButton" class="primary-button" type="button">Create online lobby</button>
          <p class="sidebar-note">The creator's browser is the game authority. Keep the host browser open while the match is running.</p>
        </div>

        <div id="joinSetup" class="setup-mode" ${setupMode === "join" ? "" : "hidden"}>
          <div class="form-row">
            <label for="joinPlayerName">Your team name</label>
            <input id="joinPlayerName" maxlength="18" value="Guest Team" autocomplete="nickname" />
          </div>
          <div class="form-row">
            <label for="joinLobbyCode">Lobby code</label>
            <input id="joinLobbyCode" class="code-input" maxlength="5" value="${lobbyCode.toUpperCase()}" placeholder="ABCDE" autocomplete="off" />
          </div>
          <button id="joinLobbyButton" class="primary-button" type="button">Join lobby</button>
          <p class="sidebar-note">Open this public game site, then enter the five-character lobby code.</p>
        </div>
        <p id="networkStatus" class="network-status" aria-live="polite"></p>
      </div>
    </section>`;

  document.querySelectorAll("[data-setup-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setupMode = button.dataset.setupMode;
      renderSetup();
    });
  });
  document.getElementById("browseRunnersButton").addEventListener("click", openCharacters);

  const playerCount = document.getElementById("playerCount");
  if (playerCount) {
    playerCount.addEventListener("change", renderPlayerConfig);
    document.getElementById("startButton").addEventListener("click", startGame);
    renderPlayerConfig();
  }

  const createButton = document.getElementById("createLobbyButton");
  if (createButton) createButton.addEventListener("click", async () => {
    setNetworkStatus("Creating lobby...");
    createButton.disabled = true;
    try {
      await network.createLobby(
        document.getElementById("createPlayerName").value,
        Number(document.getElementById("lobbySize").value),
        document.getElementById("fillBots").checked
      );
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

function setNetworkStatus(message, isError = false) {
  const element = document.getElementById("networkStatus");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function renderPlayerConfig() {
  const countElement = document.getElementById("playerCount");
  const list = document.getElementById("playerConfigList");
  if (!countElement || !list) return;
  const count = Number(countElement.value);
  list.innerHTML = Array.from({ length: count }, (_, index) => `
    <div class="player-config">
      <input id="playerName${index}" maxlength="18" value="${index === 0 ? "You" : `Team ${index + 1}`}" aria-label="Team ${index + 1} name" />
      <select id="playerType${index}" aria-label="Team ${index + 1} control type">
        <option value="human" ${index === 0 ? "selected" : ""}>Human</option>
        <option value="bot" ${index > 0 ? "selected" : ""}>Bot</option>
      </select>
    </div>`).join("");
}

function renderLobby() {
  state.phase = "lobby";
  const lobby = network.lobby;
  if (!lobby) {
    renderSetup();
    return;
  }
  const shareUrls = lobby.joinUrl ? [lobby.joinUrl] : [`${browserLocation.origin}/?lobby=${lobby.code}`];
  const canStart = network.isHost && (lobby.members.length >= 2 || lobby.fillBots);
  app.innerHTML = `
    <section class="panel lobby-panel">
      <div class="phase-head">
        <div>
          <p class="eyebrow">Online lobby</p>
          <h2>${network.isHost ? "Your lobby is ready" : "Waiting for the host"}</h2>
          <p>Players can join through the public game URL from any modern browser.</p>
        </div>
        <div class="lobby-code" aria-label="Lobby code ${lobby.code}">${lobby.code}</div>
      </div>
      <div class="lobby-layout">
        <div>
          <div class="share-box">
            <label for="shareUrlSelect">Share this lobby link</label>
            <select id="shareUrlSelect">
              ${shareUrls.map((url) => `<option value="${url}">${url}</option>`).join("")}
            </select>
            <button id="copyLobbyLinkButton" class="small-button" type="button">Copy invite link</button>
          </div>
          <div class="member-list">
            ${lobby.members.map((member, index) => `
              <div class="member-row">
                <span class="member-color" style="--member-color:${PLAYER_COLORS[index]}"></span>
                <div><strong>${member.name}</strong><span>${member.isHost ? "Host" : "Player"}${member.connected ? " · connected" : " · reconnecting"}</span></div>
                <span class="member-seat">Seat ${index + 1}</span>
              </div>`).join("")}
            ${Array.from({ length: Math.max(0, lobby.maxPlayers - lobby.members.length) }, (_, index) => `
              <div class="member-row empty">
                <span class="member-color"></span>
                <div><strong>Open seat</strong><span>${lobby.fillBots ? "Bot fills on start" : "Waiting for player"}</span></div>
                <span class="member-seat">Seat ${lobby.members.length + index + 1}</span>
              </div>`).join("")}
          </div>
        </div>
        <aside class="lobby-actions">
          <div class="connection-card">
            <p class="eyebrow">Host model</p>
            <strong>${network.isHost ? "This browser runs the game" : "The lobby creator runs the game"}</strong>
            <p>Draft picks and turns travel through the online server, then synchronize to every screen.</p>
          </div>
          ${network.isHost ? `<button id="startLobbyGameButton" class="primary-button" type="button" ${canStart ? "" : "disabled"}>Start game</button>` : `<div class="waiting-pulse">Waiting for host to start...</div>`}
          <button id="leaveLobbyButton" class="ghost-button" type="button">Leave lobby</button>
          ${network.notice ? `<p class="network-status error">${network.notice}</p>` : ""}
        </aside>
      </div>
    </section>`;

  document.getElementById("copyLobbyLinkButton").addEventListener("click", async () => {
    const button = document.getElementById("copyLobbyLinkButton");
    try {
      const selectedUrl = document.getElementById("shareUrlSelect").value;
      await navigator.clipboard.writeText(selectedUrl);
      button.textContent = "Copied";
    } catch (error) {
      button.textContent = "Copy unavailable";
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
        state.players.push({
          id: `p${index}`,
          name: `Bot Team ${index + 1}`,
          isBot: true,
          controllerId: null,
          color: PLAYER_COLORS[index],
          team: [],
          score: 0
        });
      }
    }
    state.deck = shuffle(RACERS);
    state.draftWave = 1;
    beginDraftWave();
  } catch (error) {
    network.notice = error.message;
    renderLobby();
  }
}

function startGame() {
  audio.ensure();
  audio.playUi();
  const count = Number(document.getElementById("playerCount").value);
  state.players = Array.from({ length: count }, (_, index) => ({
    id: `p${index}`,
    name: document.getElementById(`playerName${index}`).value.trim() || `Team ${index + 1}`,
    isBot: document.getElementById(`playerType${index}`).value === "bot",
    controllerId: null,
    color: PLAYER_COLORS[index],
    team: [],
    score: 0
  }));
  state.deck = shuffle(RACERS);
  state.draftWave = 1;
  beginDraftWave();
}

function makeSnakeOrder(startIndex) {
  const count = state.players.length;
  const forward = Array.from({ length: count }, (_, index) => (startIndex + index) % count);
  return [...forward, ...[...forward].reverse()];
}

function beginDraftWave() {
  const startIndex = state.draftWave === 1 ? 0 : 1 % state.players.length;
  state.draftPool = state.deck.splice(0, state.players.length * 2);
  state.draftOrder = makeSnakeOrder(startIndex);
  state.draftIndex = 0;
  state.phase = "draft";
  renderDraft();
  maybeRunBotDraft();
}

function renderDraft() {
  const player = currentDraftPlayer();
  app.innerHTML = `
    <section class="panel">
      <div class="phase-head">
        <div>
          <p class="eyebrow">Draft wave ${state.draftWave} of 2</p>
          <h2>${player.name} chooses next</h2>
          <p>Select one runner from the open pool. Each team receives two runners per wave.</p>
        </div>
        <div class="status-pill">Pick ${state.draftIndex + 1} of ${state.draftOrder.length}</div>
      </div>
      <div class="draft-layout">
        <div class="racer-grid">
          ${state.draftPool.map((racer) => racerCardHtml(racer, { disabled: !canControlPlayer(player), action: "draft" })).join("")}
        </div>
        <aside>
          <div class="team-list">
            ${state.players.map((team) => teamBoxHtml(team, team.id === player.id)).join("")}
          </div>
          <p class="sidebar-note">The draft order reverses after every pass. The second wave starts with the next team.</p>
        </aside>
      </div>
    </section>`;

  if (canControlPlayer(player)) {
    document.querySelectorAll("[data-draft-id]").forEach((button) => {
      button.addEventListener("click", () => requestDraftRacer(button.dataset.draftId));
    });
  }
  network.broadcastState();
}

function racerCardHtml(racer, options = {}) {
  const attrs = options.action === "draft" ? `data-draft-id="${racer.id}"` : options.action === "select" ? `data-select-id="${racer.id}"` : "";
  const classNames = ["racer-card", options.used ? "used" : "", options.selected ? "selected" : ""].filter(Boolean).join(" ");
  return `
    <button class="${classNames}" type="button" ${attrs} ${options.disabled ? "disabled" : ""}>
      <div class="racer-icon">${racer.icon}</div>
      <h3>${racer.name}</h3>
      <p class="tagline">${racer.tagline}</p>
      <p class="power"><strong>${racer.powerName}:</strong> ${racer.power}</p>
    </button>`;
}

function teamBoxHtml(player, active = false) {
  return `
    <div class="team-box ${active ? "active" : ""}">
      <div class="team-title"><strong style="color:${player.color}">${player.name}</strong><span>${player.team.length}/4</span></div>
      <div class="team-icons">${player.team.length ? player.team.map((slot) => `<span class="team-icon" title="${racerById(slot.racerId).name}">${racerById(slot.racerId).icon}</span>`).join("") : "<span class=\"sidebar-note\">No runners yet</span>"}</div>
    </div>`;
}

function chooseDraftRacer(racerId) {
  audio.playUi();
  const player = currentDraftPlayer();
  const index = state.draftPool.findIndex((racer) => racer.id === racerId);
  if (index < 0) return;
  const [racer] = state.draftPool.splice(index, 1);
  player.team.push({ racerId: racer.id, used: false });
  state.draftIndex += 1;

  if (state.draftIndex >= state.draftOrder.length) {
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
    const ranked = [...state.draftPool].sort((a, b) => (b.rating + Math.random() * 1.8) - (a.rating + Math.random() * 1.8));
    chooseDraftRacer(ranked[0].id);
  }, 500);
}

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
  const trackName = state.raceNumber % 2 === 0 ? "Calm Course" : "Chaos Circuit";
  const points = RACE_POINTS[state.raceNumber];
  const available = player.team.filter((slot) => !slot.used);

  app.innerHTML = `
    <section class="panel">
      <div class="phase-head">
        <div>
          <p class="eyebrow">Race ${state.raceNumber + 1} of 4</p>
          <h2>${player.name}, choose a runner</h2>
          <p>${trackName}. First place scores ${points[0]}, second place scores ${points[1]}.</p>
        </div>
        <div class="status-pill">${state.selectionIndex + 1}/${state.players.length} selected</div>
      </div>
      <div class="selection-layout">
        <div class="racer-grid">
          ${available.map((slot) => racerCardHtml(racerById(slot.racerId), { disabled: !canControlPlayer(player), action: "select" })).join("")}
        </div>
        <aside>
          <div class="score-list">${state.players.map((team) => scoreBoxHtml(team, team.id === player.id)).join("")}</div>
          <p class="sidebar-note">Each runner may enter only one race. Later races award more points.</p>
        </aside>
      </div>
    </section>`;

  if (canControlPlayer(player)) {
    document.querySelectorAll("[data-select-id]").forEach((button) => {
      button.addEventListener("click", () => requestRaceRacer(button.dataset.selectId));
    });
  }
  network.broadcastState();
}

function scoreBoxHtml(player, active = false) {
  return `<div class="score-box ${active ? "active" : ""}"><div class="team-title"><strong style="color:${player.color}">${player.name}</strong><strong>${player.score} pts</strong></div><div class="team-icons">${player.team.map((slot) => `<span class="team-icon" style="opacity:${slot.used ? 0.35 : 1}" title="${racerById(slot.racerId).name}">${racerById(slot.racerId).icon}</span>`).join("")}</div></div>`;
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
    crossedTwenty: false
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
    const available = player.team.filter((slot) => !slot.used).map((slot) => racerById(slot.racerId));
    const raceWeight = state.raceNumber / 3;
    const ranked = [...available].sort((a, b) => ((b.rating * (0.75 + raceWeight * 0.25)) + Math.random() * 1.4) - ((a.rating * (0.75 + raceWeight * 0.25)) + Math.random() * 1.4));
    chooseRaceRacer(ranked[0].id);
  }, 550);
}

function startRace() {
  state.phase = "race";
  state.turnOrder = Array.from({ length: state.players.length }, (_, index) => (state.raceNumber + index) % state.players.length).map((index) => state.players[index].id);
  state.turnIndex = 0;
  addLog(`Race ${state.raceNumber + 1} begins on the ${state.raceNumber % 2 === 0 ? "Calm Course" : "Chaos Circuit"}.`);
  renderRace();
  maybeRunBotTurn();
}

function renderRace() {
  const entrant = currentEntrant();
  const player = entrant ? playerById(entrant.playerId) : null;
  const racer = entrant ? racerById(entrant.racerId) : null;
  const points = RACE_POINTS[state.raceNumber];
  const isChaos = state.raceNumber % 2 === 1;
  const buttonLabel = entrant?.tripped ? "Stand up" : racer?.id === "moss-golem" ? "Use measured march" : "Roll and move";

  app.innerHTML = `
    <section class="race-layout">
      <div class="panel track-panel">
        <div class="race-topline">
          <div class="track-name"><strong>Race ${state.raceNumber + 1}</strong><span>${isChaos ? "Chaos Circuit" : "Calm Course"}</span></div>
          <div class="status-pill">🥇 ${points[0]} pts · 🥈 ${points[1]} pts</div>
        </div>
        ${abilityBurstHtml()}
        ${effectBurstHtml()}
        <div class="board-scroll">${trackCellsHtml(entrant?.playerId, isChaos)}</div>
        <p class="board-help">Hover a runner token, or focus it with the keyboard, to inspect its ability.</p>
      </div>
      <aside class="panel turn-panel">
        ${entrant ? `
          <div class="active-racer-card ${state.abilityFlash?.playerId === entrant.playerId ? "ability-active" : ""}">
            <p class="eyebrow">Current turn</p>
            <div class="big-icon">${racer.icon}</div>
            <h3 style="color:${player.color}">${player.name}</h3>
            <strong>${racer.name}</strong>
            <p class="sidebar-note">${racer.powerName}: ${racer.power}</p>
          </div>
          ${dieHtml()}
          <button id="rollButton" class="primary-button" type="button" ${!canControlPlayer(player) || state.busy ? "disabled" : ""}>${buttonLabel}</button>
        ` : ""}
        <div class="race-roster">
          <div class="race-roster-title"><strong>Runners in play</strong><span>Live positions</span></div>
          ${raceRosterHtml(entrant?.playerId)}
        </div>
        <div>
          <p class="eyebrow">Race log</p>
          <div class="log">${state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join("")}</div>
        </div>
      </aside>
    </section>`;

  const rollButton = document.getElementById("rollButton");
  if (rollButton && canControlPlayer(player)) rollButton.addEventListener("click", requestTakeTurn);
  network.broadcastState();
}

function abilityBurstHtml() {
  if (!state.abilityFlash) return "";
  const player = playerById(state.abilityFlash.playerId);
  const racer = racerById(state.abilityFlash.racerId);
  return `
    <div class="ability-burst" style="--burst-color:${player.color}">
      <div class="ability-burst-icon">${racer.icon}</div>
      <div>
        <p class="eyebrow">Ability activated</p>
        <h3>${state.abilityFlash.name}</h3>
        <p>${state.abilityFlash.detail}</p>
      </div>
    </div>`;
}

function effectBurstHtml() {
  if (!state.effectFlash) return "";
  return `<div class="effect-burst">${state.effectFlash.icon} ${state.effectFlash.text}</div>`;
}

function dieHtml() {
  const value = state.lastRoll ?? "?";
  return `
    <div class="dice-stage ${state.diceRolling ? "rolling" : ""}">
      <div class="die d${state.diceSides}" aria-label="Die result ${value}"><span id="dieValue">${value}</span></div>
      <span class="dice-caption">${state.diceCaption}</span>
    </div>`;
}

function raceRosterHtml(activePlayerId) {
  return [...state.entrants]
    .sort((a, b) => Number(b.finished) - Number(a.finished) || b.pos - a.pos)
    .map((entrant) => {
      const player = playerById(entrant.playerId);
      const racer = racerById(entrant.racerId);
      const status = entrant.finished ? `Place ${entrant.finishPlace}` : entrant.pos === 0 ? "Start" : `Space ${entrant.pos}`;
      return `
        <div class="roster-card ${entrant.playerId === activePlayerId ? "active" : ""}" style="--player-color:${player.color}">
          <div class="roster-icon">${racer.icon}</div>
          <div class="roster-copy"><strong>${player.name}</strong><span>${racer.name} · ${racer.powerName}</span></div>
          <div class="roster-position">${status}</div>
        </div>`;
    }).join("");
}

function trackCellsHtml(activePlayerId, isChaos) {
  const routePoints = BOARD_SPACES.map((point) => `${point.x},${point.y}`).join(" ");
  const terrain = isChaos ? "chaos-board" : "calm-board";

  return `
    <div class="race-board ${terrain}" role="group" aria-label="A winding 30-space fantasy race course from the start gate to the finish arch">
      <svg class="route-map" viewBox="0 0 1000 620" aria-hidden="true" preserveAspectRatio="none">
        <polyline class="route-shadow" points="${routePoints}"></polyline>
        <polyline class="route-ribbon" points="${routePoints}"></polyline>
        <polyline class="route-centerline" points="${routePoints}"></polyline>
      </svg>
      ${boardLandmarksHtml(isChaos)}
      ${BOARD_SPACES.map((point, space) => {
        const effect = isChaos ? CHAOS_SPACES[space] : null;
        const hasMovingToken = state.motionPlayerId && entrantByPlayer(state.motionPlayerId)?.pos === space;
        const classes = [
          "route-space",
          effect?.type || "",
          space === 0 ? "start-space" : "",
          space === TRACK_LENGTH ? "finish-space" : "",
          hasMovingToken ? "motion-cell" : ""
        ].filter(Boolean).join(" ");
        const label = space === 0 ? "START" : space === TRACK_LENGTH ? "FINISH" : String(space);
        const effectIcon = effect ? (effect.type === "boost" ? "⬆" : effect.type === "setback" ? "⬇" : "💫") : "";
        return `
          <div class="${classes}" style="--space-x:${point.x / 10}%;--space-y:${point.y / 6.2}%" aria-label="${space === 0 ? "Start" : `Space ${space}`}${effect ? `, ${effect.type} ${effect.label}` : ""}">
            <span class="space-marker">${label}</span>
            ${effect ? `<span class="space-effect" aria-hidden="true">${effectIcon}<small>${effect.label}</small></span>` : ""}
            <div class="token-stack">${tokensAtPosition(space, activePlayerId)}</div>
          </div>`;
      }).join("")}
      ${isChaos ? `<div class="board-legend" aria-hidden="true">
        <span><i class="legend-dot boost"></i> Boost</span>
        <span><i class="legend-dot setback"></i> Setback</span>
        <span><i class="legend-dot trip"></i> Trip</span>
      </div>` : `<div class="board-mode-badge" aria-hidden="true">Calm course · no hazard spaces</div>`}
    </div>`;
}

function boardLandmarksHtml(isChaos) {
  return `
    <div class="board-landmark landmark-grove"><span>🌲</span><strong>Whisper Grove</strong></div>
    <div class="board-landmark landmark-pool"><span>🌙</span><strong>Moon Pool</strong></div>
    <div class="board-landmark landmark-ruins"><span>🏛️</span><strong>Echo Ruins</strong></div>
    <div class="board-landmark landmark-ridge"><span>${isChaos ? "🌋" : "⛰️"}</span><strong>${isChaos ? "Ember Ridge" : "Cloud Ridge"}</strong></div>
    <div class="finish-banner" aria-hidden="true">🏁</div>`;
}

function tokensAtPosition(position, activePlayerId) {
  const point = BOARD_SPACES[position] || BOARD_SPACES[0];
  const tooltipClasses = [
    point.x < 190 ? "tooltip-edge-left" : "",
    point.x > 820 ? "tooltip-edge-right" : "",
    point.y < 165 ? "tooltip-below" : ""
  ].filter(Boolean).join(" ");

  return state.entrants
    .filter((entrant) => entrant.pos === position && !entrant.finished)
    .map((entrant) => {
      const player = playerById(entrant.playerId);
      const racer = racerById(entrant.racerId);
      const classes = [
        "race-token",
        entrant.playerId === activePlayerId ? "active" : "",
        entrant.playerId === state.motionPlayerId ? "moving" : "",
        entrant.playerId === state.abilityFlash?.playerId ? "ability-active" : "",
        entrant.tripped ? "tripped" : ""
      ].filter(Boolean).join(" ");
      const status = position === 0 ? "at the start" : `on space ${position}`;
      return `
        <button type="button" class="${classes}" style="--token-color:${player.color}" aria-label="${player.name}'s ${racer.name}, ${status}. ${racer.powerName}: ${racer.power}">
          <span class="token-glyph" aria-hidden="true">${racer.icon}</span>
          <span class="token-tooltip ${tooltipClasses}" role="tooltip">
            <span class="tooltip-team" style="color:${player.color}">${player.name}</span>
            <strong>${racer.name}</strong>
            <span class="tooltip-power"><b>${racer.powerName}</b>${racer.power}</span>
            <span class="tooltip-position">${status}</span>
          </span>
        </button>`;
    }).join("");
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
  window.setTimeout(takeTurn, 720);
}

async function animateDice(finalValue, sides = 6, caption = "Rolling") {
  state.diceSides = sides;
  state.diceRolling = true;
  state.diceCaption = caption;
  state.lastRoll = "?";
  renderRace();

  const cycles = 10;
  for (let index = 0; index < cycles; index += 1) {
    const dieValue = document.getElementById("dieValue");
    if (dieValue) dieValue.textContent = String(randomInt(1, sides));
    audio.playDice();
    await wait(72 + index * 3);
  }

  state.lastRoll = finalValue;
  state.diceRolling = false;
  state.diceCaption = `Result: ${finalValue}`;
  renderRace();
  await wait(300);
}

async function showAbility(entrant, name, detail) {
  if (!entrant) return;
  const racer = racerById(entrant.racerId);
  state.abilityFlash = { playerId: entrant.playerId, racerId: entrant.racerId, name, detail };
  audio.playAbility();
  renderRace();
  await wait(620);
  state.abilityFlash = null;
  renderRace();
}

async function showEffect(icon, text, type = "boost") {
  state.effectFlash = { icon, text };
  audio.playHazard(type);
  renderRace();
  await wait(460);
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

  if (entrant.tripped) {
    entrant.tripped = false;
    state.lastRoll = "↟";
    state.diceCaption = "Standing up";
    await showEffect("🌀", `${racer.name} stands up`, "trip");
    addLog(`<strong>${player.name}</strong>'s ${racer.name} stands up and misses the move.`);
    await finishTurn();
    return;
  }

  let naturalRoll = null;
  let movement = 0;
  const notes = [];

  if (racer.id === "moss-golem") {
    await showAbility(entrant, racer.powerName, "No random result. The march is always exactly 4.");
    movement = 4;
    await animateDice(4, 6, "Measured march");
  } else {
    const sides = racer.id === "nap-dragon" ? 8 : 6;
    if (racer.id === "nap-dragon") await showAbility(entrant, racer.powerName, "The dream die has eight possible results.");
    naturalRoll = randomInt(1, sides);
    movement = naturalRoll;
    await animateDice(naturalRoll, sides, sides === 8 ? "Rolling dream die" : "Rolling die");
  }

  if (racer.id === "clockwork-hare" && naturalRoll === 1) {
    await showAbility(entrant, racer.powerName, "A roll of 1 gets one automatic reroll.");
    naturalRoll = randomInt(1, 6);
    movement = naturalRoll;
    notes.push(`rerolled to ${naturalRoll}`);
    await animateDice(naturalRoll, 6, "Second chance reroll");
  }

  if (racer.id === "lucky-turnip" && naturalRoll <= 2 && !entrant.usedReroll) {
    entrant.usedReroll = true;
    await showAbility(entrant, racer.powerName, "The low result is replaced once this race.");
    naturalRoll = randomInt(1, 6);
    movement = naturalRoll;
    notes.push(`rerolled to ${naturalRoll}`);
    await animateDice(naturalRoll, 6, "Fresh start reroll");
  }

  const leader = getLeaderPosition();
  const last = getLastPosition();

  if (racer.id === "storm-crow" && naturalRoll === 1) {
    const target = Math.max(entrant.pos, leader - 2);
    movement = target - entrant.pos;
    await showAbility(entrant, racer.powerName, `Leap toward the leader and stop at space ${target}.`);
    notes.push(`jumped ${movement}`);
  }
  if (racer.id === "comet-kid" && naturalRoll === 6) {
    movement += 2;
    await showAbility(entrant, racer.powerName, "A perfect roll adds 2 movement.");
    notes.push("gained +2");
  }
  if (racer.id === "moon-moth" && naturalRoll % 2 === 1) {
    movement += 1;
    await showAbility(entrant, racer.powerName, "An odd roll adds 1 movement.");
    notes.push("gained +1");
  }
  if (racer.id === "gear-goblin" && leader - entrant.pos >= 6) {
    movement += 1;
    await showAbility(entrant, racer.powerName, "The gap to the leader is at least 6, adding 1 movement.");
    notes.push("gained +1");
  }
  if (racer.id === "lantern-sprite" && entrant.pos === last) {
    movement += 2;
    await showAbility(entrant, racer.powerName, "Starting in last place adds 2 movement.");
    notes.push("gained +2");
  }
  if (racer.id === "crown-crab" && entrant.pos === leader) {
    movement += 2;
    await showAbility(entrant, racer.powerName, "Starting tied for the lead adds 2 movement.");
    notes.push("gained +2");
  }
  if (racer.id === "spark-snail" && entrant.turns % 2 === 0) {
    movement += 2;
    await showAbility(entrant, racer.powerName, "Stored energy releases on every second turn for +2 movement.");
    notes.push("gained +2");
  }
  if (racer.id === "wisp-twins") {
    if (entrant.turns % 2 === 1) {
      movement += 2;
      await showAbility(entrant, racer.powerName, "The bright twin adds 2 movement on this odd turn.");
      notes.push("gained +2");
    } else {
      movement = Math.max(1, movement - 1);
      await showAbility(entrant, racer.powerName, "The dim twin removes 1 movement on this even turn.");
      notes.push("lost 1");
    }
  }
  if (racer.id === "river-otter") {
    const companions = state.entrants.filter((other) => other.playerId !== entrant.playerId && !other.finished && other.pos === entrant.pos).length;
    if (companions) {
      movement += companions;
      await showAbility(entrant, racer.powerName, `${companions} nearby runner${companions === 1 ? "" : "s"} add ${companions} movement.`);
      notes.push(`gained +${companions}`);
    }
  }
  if (racer.id === "meteor-mouse" && leader - entrant.pos >= 10) {
    movement = 5;
    await showAbility(entrant, racer.powerName, "The leader is at least 10 spaces away, setting movement to 5.");
    notes.push("set movement to 5");
  }
  if (racer.id === "mirror-owl" && state.previousNaturalRoll >= 5) {
    movement += 1;
    await showAbility(entrant, racer.powerName, `The previous natural roll was ${state.previousNaturalRoll}, adding 1 movement.`);
    notes.push("gained +1");
  }

  const frostEntrant = state.entrants.find((other) => other.playerId !== entrant.playerId && !other.finished && other.pos === entrant.pos && other.racerId === "frost-yak");
  if (frostEntrant) {
    movement = Math.max(1, movement - 1);
    await showAbility(frostEntrant, racerById(frostEntrant.racerId).powerName, `${racer.name} starts in the chill field and loses 1 movement.`);
    notes.push("lost 1 in a chill field");
  }

  const startPos = entrant.pos;
  if (racer.id === "shadow-cat" && shadowPathUsesSlipstream(entrant, movement)) {
    await showAbility(entrant, racer.powerName, "Occupied spaces are crossed without spending movement.");
  }

  if (racer.id === "shadow-cat") await moveShadowCatAnimated(entrant, movement);
  else await moveEntrantAnimated(entrant, movement, "main move");

  if (!entrant.finished && racer.id === "portal-pup" && hasOpponentAt(entrant.pos, entrant.playerId)) {
    await showAbility(entrant, racer.powerName, "Landing on a rival opens a portal for 2 extra movement.");
    await moveEntrantAnimated(entrant, 2, "Blink");
    notes.push("blinked +2");
  }

  if (!entrant.finished && racer.id === "prism-slime") {
    const targets = state.entrants.filter((other) => other.playerId !== entrant.playerId && !other.finished && other.pos === entrant.pos);
    if (targets.length) {
      await showAbility(entrant, racer.powerName, `${targets.length} rival${targets.length === 1 ? "" : "s"} slide back 1.`);
      for (const target of targets) await moveEntrantAnimated(target, -1, "Slick Landing");
      notes.push("slid rivals back");
    }
  }

  if (racer.id === "quake-beetle" && naturalRoll === 6) {
    const targets = state.entrants.filter((other) => other.playerId !== entrant.playerId && !other.finished && Math.abs(other.pos - entrant.pos) <= 1);
    if (targets.length) {
      await showAbility(entrant, racer.powerName, `${targets.length} nearby rival${targets.length === 1 ? "" : "s"} slide back 1.`);
      for (const target of targets) await moveEntrantAnimated(target, -1, "Ground Pound");
      notes.push("shook rivals back");
    }
  }

  if (!entrant.finished && racer.id === "pepper-pixie" && !entrant.crossedTwenty && startPos < 20 && entrant.pos >= 20) {
    entrant.crossedTwenty = true;
    await showAbility(entrant, racer.powerName, "Crossing space 20 triggers a 3-space surge.");
    await moveEntrantAnimated(entrant, 3, "Spicy Finish");
    notes.push("surged +3");
  }

  if (!entrant.finished) await applyTrackEffectAnimated(entrant);
  if (naturalRoll === 6) await triggerEchoFoxAnimated(entrant.playerId);
  state.previousNaturalRoll = naturalRoll;

  const netMovement = entrant.pos - startPos;
  addLog(`<strong>${player.name}</strong>'s ${racer.name} ended ${Math.max(0, netMovement)} space${Math.abs(netMovement) === 1 ? "" : "s"} ahead${notes.length ? `, ${notes.join(", ")}` : ""}.`);
  renderRace();

  if (state.finishers.length >= 2) {
    await endRace();
    return;
  }
  await finishTurn();
}

function hasOpponentAt(position, playerId) {
  return state.entrants.some((other) => other.playerId !== playerId && !other.finished && other.pos === position);
}

function shadowPathUsesSlipstream(entrant, amount) {
  if (amount <= 0) return false;
  const maxPosition = Math.min(TRACK_LENGTH, entrant.pos + amount + state.entrants.length);
  for (let position = entrant.pos + 1; position <= maxPosition; position += 1) {
    if (hasOpponentAt(position, entrant.playerId)) return true;
  }
  return false;
}

async function moveShadowCatAnimated(entrant, amount) {
  let remaining = Math.max(0, amount);
  let physicalStep = 0;
  while (remaining > 0 && entrant.pos < TRACK_LENGTH) {
    const nextPosition = entrant.pos + 1;
    const occupied = hasOpponentAt(nextPosition, entrant.playerId);
    physicalStep += 1;
    if (!occupied) remaining -= 1;
    await stepEntrantTo(entrant, nextPosition, physicalStep, 1);
    if (entrant.finished) break;
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
    await showEffect("⬆", `Boost space ${effect.label}`, "boost");
    await moveEntrantAnimated(entrant, effect.amount, "boost space");
  } else if (effect.type === "setback") {
    await showEffect("⬇", `Setback space ${effect.label}`, "setback");
    await moveEntrantAnimated(entrant, effect.amount, "setback space");
  } else if (effect.type === "trip") {
    await showEffect("💫", "Trip space", "trip");
    entrant.tripped = true;
    renderRace();
  }
}

async function triggerEchoFoxAnimated(sourcePlayerId) {
  const foxes = state.entrants.filter((entrant) => entrant.playerId !== sourcePlayerId && !entrant.finished && entrant.racerId === "echo-fox");
  for (const entrant of foxes) {
    await showAbility(entrant, racerById(entrant.racerId).powerName, "Another runner rolled a natural 6, so Echo Fox moves 1.");
    await moveEntrantAnimated(entrant, 1, "Resonance");
    addLog(`<strong>Echo Fox</strong> moved 1 from Resonance.`);
  }
}

async function finishTurn() {
  state.motionPlayerId = null;
  renderRace();
  await wait(560);
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

async function endRace() {
  state.raceOver = true;
  state.motionPlayerId = null;
  renderRace();
  await wait(850);
  showRaceResults();
}

function showRaceResults() {
  const points = RACE_POINTS[state.raceNumber];
  state.finishers.slice(0, 2).forEach((entrant, index) => {
    playerById(entrant.playerId).score += points[index];
  });
  state.phase = "results";
  renderRaceResults();
}

function renderRaceResults() {
  const points = RACE_POINTS[state.raceNumber];
  const first = state.finishers[0];
  const second = state.finishers[1];
  app.innerHTML = `
    <section class="panel">
      <p class="eyebrow">Race ${state.raceNumber + 1} complete</p>
      <h2>The podium is set</h2>
      <div class="race-result-grid">
        ${podiumHtml(first, 1, points[0])}
        ${podiumHtml(second, 2, points[1])}
      </div>
      <div class="score-list">${[...state.players].sort((a, b) => b.score - a.score).map((player) => scoreBoxHtml(player)).join("")}</div>
      <div style="margin-top:18px">
        ${canAdvanceGame() ? `<button id="nextRaceButton" class="primary-button" type="button">${state.raceNumber === 3 ? "Show final standings" : "Prepare next race"}</button>` : `<div class="waiting-pulse">Waiting for the host to continue...</div>`}
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

function podiumHtml(entrant, place, points) {
  if (!entrant) return "";
  const player = playerById(entrant.playerId);
  const racer = racerById(entrant.racerId);
  return `<div class="podium-card"><div class="place">${place === 1 ? "First place" : "Second place"}</div><div class="podium-icon">${racer.icon}</div><h3 style="color:${player.color}">${player.name}</h3><p>${racer.name}</p><strong>+${points} points</strong></div>`;
}

function showFinalResults() {
  state.phase = "final";
  renderFinalResults();
}

function renderFinalResults() {
  const standings = [...state.players].sort((a, b) => b.score - a.score);
  const topScore = standings[0].score;
  const winners = standings.filter((player) => player.score === topScore);
  app.innerHTML = `
    <section class="panel">
      <p class="eyebrow">League complete</p>
      <h2>${winners.length > 1 ? "Shared victory" : `${winners[0].name} wins the Arcane Dash League`}</h2>
      <p class="sidebar-note">Four drafts, four runners, four races, and one very strange final table.</p>
      <div class="final-table">
        ${standings.map((player, index) => `<div class="final-row ${player.score === topScore ? "winner" : ""}"><div class="rank">#${index + 1}</div><div><strong style="color:${player.color}">${player.name}</strong><div class="team-icons" style="margin-top:7px">${player.team.map((slot) => `<span class="team-icon">${racerById(slot.racerId).icon}</span>`).join("")}</div></div><div class="final-score">${player.score} pts</div></div>`).join("")}
      </div>
      ${canAdvanceGame() ? `<button id="playAgainButton" class="primary-button" type="button">${network.online ? "Return everyone to lobby" : "Play again"}</button>` : `<div class="waiting-pulse">Waiting for the host...</div>`}
    </section>`;
  const playAgainButton = document.getElementById("playAgainButton");
  if (playAgainButton) playAgainButton.addEventListener("click", async () => {
    audio.playUi();
    if (network.online) {
      try {
        await network.resetLobby();
      } catch (error) {
        showNetworkError(error);
      }
    } else renderSetup();
  });
  network.broadcastState();
}

renderSetup();
