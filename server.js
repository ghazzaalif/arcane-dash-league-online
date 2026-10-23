"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = clampInteger(process.env.PORT, 1, 65535, 4173);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const NODE_ENV = process.env.NODE_ENV || "development";
const PUBLIC_ORIGIN = normalizeOrigin(process.env.PUBLIC_ORIGIN || "");
const MAX_LOBBIES = clampInteger(process.env.MAX_LOBBIES, 10, 10000, 1000);
const LOBBY_TTL_MS = clampInteger(process.env.LOBBY_TTL_MINUTES, 15, 1440, 360) * 60_000;
const BODY_LIMIT_BYTES = clampInteger(process.env.BODY_LIMIT_KB, 64, 2048, 768) * 1024;
const LOBBY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const UMAMI = umamiConfig(process.env);
const lobbies = new Map();
const rateBuckets = new Map();

const STATIC_FILES = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/game.js", "game.js"],
  ["/styles.css", "styles.css"],
  ["/runners-art.js", "runners-art.js"],
  ["/maps.js", "maps.js"],
  ["/fonts/jersey-15.woff2", "fonts/jersey-15.woff2"],
  ["/fonts/body-400.woff2", "fonts/body-400.woff2"],
  ["/fonts/body-700.woff2", "fonts/body-700.woff2"]
]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2"
};

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function normalizeOrigin(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return "";
    return url.origin;
  } catch (error) {
    return "";
  }
}

// Umami analytics is off unless UMAMI_WEBSITE_ID is set. The tracker is cookieless;
// the script tag is injected into index.html and the CSP is opened only to the
// Umami origins it needs (script host and data endpoint).
function umamiConfig(env) {
  const websiteId = String(env.UMAMI_WEBSITE_ID || "").trim().toLowerCase();
  if (!websiteId) return null;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(websiteId)) {
    console.warn("Warning: UMAMI_WEBSITE_ID is not a valid UUID. Analytics is off.");
    return null;
  }
  let scriptUrl;
  let hostUrl = "";
  try {
    scriptUrl = new URL(String(env.UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js").trim());
    if (env.UMAMI_HOST_URL) hostUrl = new URL(String(env.UMAMI_HOST_URL).trim()).origin;
  } catch (error) {
    console.warn("Warning: UMAMI_SCRIPT_URL or UMAMI_HOST_URL is not a valid URL. Analytics is off.");
    return null;
  }
  if (!/^https?:$/.test(scriptUrl.protocol)) {
    console.warn("Warning: UMAMI_SCRIPT_URL must be http(s). Analytics is off.");
    return null;
  }
  const scriptOrigin = scriptUrl.origin;
  const connectOrigins = new Set([hostUrl || scriptOrigin]);
  // Umami Cloud serves the script from cloud.umami.is but receives data on gateway.umami.is.
  if (!hostUrl && scriptUrl.hostname === "cloud.umami.is") connectOrigins.add("https://gateway.umami.is");
  const domains = String(env.UMAMI_DOMAINS || (PUBLIC_ORIGIN ? new URL(PUBLIC_ORIGIN).hostname : ""))
    .split(",").map((entry) => entry.trim().toLowerCase()).filter((entry) => /^[a-z0-9.-]+$/.test(entry)).join(",");
  const attrs = [
    `defer src="${escapeAttr(scriptUrl.href)}"`,
    `data-website-id="${websiteId}"`,
    hostUrl ? `data-host-url="${escapeAttr(hostUrl)}"` : "",
    domains ? `data-domains="${domains}"` : "",
    // Invite links carry the lobby code in ?lobby=, so never send query strings.
    `data-exclude-search="true"`,
    `data-do-not-track="true"`
  ].filter(Boolean);
  return {
    scriptOrigin,
    connectOrigins: [...connectOrigins],
    tag: `<script ${attrs.join(" ")}></script>`
  };
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function contentSecurityPolicy() {
  const scriptSrc = ["'self'", ...(UMAMI ? [UMAMI.scriptOrigin] : [])];
  const connectSrc = ["'self'", ...(UMAMI ? UMAMI.connectOrigins : [])];
  return `default-src 'self'; script-src ${[...new Set(scriptSrc)].join(" ")}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src ${[...new Set(connectSrc)].join(" ")}; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
}

function requestOrigin(req) {
  if (PUBLIC_ORIGIN) return PUBLIC_ORIGIN;
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const protocol = forwardedProto === "https" ? "https" : "http";
  const host = forwardedHost || String(req.headers.host || `localhost:${PORT}`);
  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch (error) {
    return `http://localhost:${PORT}`;
  }
}

function applySecurityHeaders(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", contentSecurityPolicy());
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  if (forwardedProto === "https" || PUBLIC_ORIGIN.startsWith("https://")) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
}

function json(res, status, value, extraHeaders = {}) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > BODY_LIMIT_BYTES) {
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        const parseError = new Error("Invalid JSON body.");
        parseError.statusCode = 400;
        reject(parseError);
      }
    });
    req.on("error", reject);
  });
}

function sanitizeName(value, fallback = "Player") {
  const cleaned = String(value || "")
    .replace(/[<>\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18);
  return cleaned || fallback;
}

function sanitizeClientId(value) {
  return String(value || "")
    .replace(/[^a-zA-Z0-9._:-]/g, "")
    .slice(0, 80);
}

function normalizeCode(value) {
  const code = String(value || "").trim().toUpperCase();
  return /^[A-HJ-NP-Z2-9]{5}$/.test(code) ? code : "";
}

function generateCode() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let code = "";
    for (let index = 0; index < 5; index += 1) {
      code += LOBBY_ALPHABET[crypto.randomInt(0, LOBBY_ALPHABET.length)];
    }
    if (!lobbies.has(code)) return code;
  }
  throw new Error("Unable to create a unique lobby code.");
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function secureEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

function memberById(lobby, clientId) {
  return lobby.members.find((member) => member.clientId === clientId);
}

function authenticatedMember(lobby, clientId, sessionToken) {
  const member = lobby && memberById(lobby, clientId);
  if (!member || !secureEqual(member.sessionToken, sessionToken)) return null;
  return member;
}

function touchLobby(lobby) {
  lobby.lastActivityAt = Date.now();
}

function safeLobby(lobby) {
  return {
    code: lobby.code,
    hostId: lobby.hostId,
    maxPlayers: lobby.maxPlayers,
    fillBots: lobby.fillBots,
    started: lobby.started,
    joinUrl: lobby.joinUrl,
    createdAt: lobby.createdAt,
    members: lobby.members.map((member) => ({
      clientId: member.clientId,
      name: member.name,
      isHost: member.clientId === lobby.hostId,
      connected: member.connections.size > 0
    }))
  };
}

function writeEvent(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function broadcast(lobby, event, targetClientId = null) {
  for (const member of lobby.members) {
    if (targetClientId && member.clientId !== targetClientId) continue;
    for (const response of member.connections) {
      writeEvent(response, event);
    }
  }
}

function broadcastLobby(lobby) {
  broadcast(lobby, { type: "lobby", lobby: safeLobby(lobby) });
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function allowRate(req, res, bucket, maxRequests, windowMs) {
  const now = Date.now();
  const key = `${bucket}:${clientIp(req)}`;
  let entry = rateBuckets.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    rateBuckets.set(key, entry);
  }
  entry.count += 1;
  if (entry.count <= maxRequests) return true;
  const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  json(res, 429, { error: "Too many requests. Try again shortly." }, { "Retry-After": retryAfter });
  return false;
}

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    json(res, 405, { error: "Method not allowed." }, { Allow: "GET, HEAD" });
    return;
  }
  const filename = STATIC_FILES.get(pathname);
  if (!filename) {
    json(res, 404, { error: "Not found." });
    return;
  }
  const filePath = path.join(ROOT, filename);
  if (filename === "index.html" && UMAMI) {
    serveIndexWithAnalytics(req, res, filePath);
    return;
  }
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      json(res, 404, { error: "Not found." });
      return;
    }
    const headers = {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": stats.size,
      "Cache-Control": filename === "index.html" ? "no-cache" : filename.startsWith("fonts/") ? "public, max-age=604800, immutable" : "public, max-age=3600",
      ETag: `W/\"${stats.size}-${Math.trunc(stats.mtimeMs)}\"`
    };
    if (req.headers["if-none-match"] === headers.ETag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

function serveIndexWithAnalytics(req, res, filePath) {
  fs.readFile(filePath, "utf8", (error, html) => {
    if (error) {
      json(res, 404, { error: "Not found." });
      return;
    }
    const body = Buffer.from(html.replace("</head>", `  ${UMAMI.tag}\n</head>`), "utf8");
    const headers = {
      "Content-Type": MIME_TYPES[".html"],
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
      ETag: `W/"${crypto.createHash("sha1").update(body).digest("base64url").slice(0, 16)}"`
    };
    if (req.headers["if-none-match"] === headers.ETag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : body);
  });
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && (url.pathname === "/healthz" || url.pathname === "/api/health")) {
    json(res, 200, { ok: true, service: "arcane-dash-online", lobbies: lobbies.size });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/info") {
    json(res, 200, {
      ok: true,
      mode: "online",
      publicOrigin: requestOrigin(req),
      lobbyCount: lobbies.size,
      maxLobbyPlayers: 4
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    if (!allowRate(req, res, "events", 30, 60_000)) return;
    const clientId = sanitizeClientId(url.searchParams.get("clientId"));
    const code = normalizeCode(url.searchParams.get("code"));
    const sessionToken = String(url.searchParams.get("sessionToken") || "");
    const lobby = lobbies.get(code);
    const member = authenticatedMember(lobby, clientId, sessionToken);
    if (!lobby || !member) {
      json(res, 401, { error: "Lobby session was not found or has expired." });
      return;
    }

    touchLobby(lobby);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write("retry: 1500\n\n");
    member.connections.add(res);
    writeEvent(res, { type: "lobby", lobby: safeLobby(lobby) });
    if (lobby.stateSnapshot) {
      writeEvent(res, { type: "state", seq: lobby.stateSeq, state: lobby.stateSnapshot });
    }
    broadcastLobby(lobby);

    const heartbeat = setInterval(() => {
      if (!res.destroyed) res.write(": heartbeat\n\n");
    }, 15_000);
    req.on("close", () => {
      clearInterval(heartbeat);
      member.connections.delete(res);
      touchLobby(lobby);
      broadcastLobby(lobby);
    });
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed." }, { Allow: "GET, POST" });
    return;
  }

  const body = await parseBody(req);

  if (url.pathname === "/api/lobbies") {
    if (!allowRate(req, res, "create", 12, 10 * 60_000)) return;
    if (lobbies.size >= MAX_LOBBIES) {
      json(res, 503, { error: "The lobby service is at capacity. Try again shortly." });
      return;
    }
    const clientId = sanitizeClientId(body.clientId);
    if (!clientId) return json(res, 400, { error: "A client ID is required." });
    const code = generateCode();
    const maxPlayers = Math.min(4, Math.max(2, Number(body.maxPlayers) || 4));
    const sessionToken = generateSessionToken();
    const now = Date.now();
    const lobby = {
      code,
      hostId: clientId,
      maxPlayers,
      fillBots: Boolean(body.fillBots),
      started: false,
      joinUrl: `${requestOrigin(req)}/?lobby=${code}`,
      members: [{
        clientId,
        name: sanitizeName(body.name, "Host"),
        sessionToken,
        connections: new Set()
      }],
      stateSnapshot: null,
      stateSeq: 0,
      createdAt: now,
      lastActivityAt: now
    };
    lobbies.set(code, lobby);
    json(res, 201, { ok: true, lobby: safeLobby(lobby), isHost: true, sessionToken });
    return;
  }

  if (url.pathname === "/api/lobbies/join") {
    if (!allowRate(req, res, "join", 60, 10 * 60_000)) return;
    const code = normalizeCode(body.code);
    const clientId = sanitizeClientId(body.clientId);
    const lobby = lobbies.get(code);
    if (!lobby) return json(res, 404, { error: "Lobby not found or expired." });
    if (!clientId) return json(res, 400, { error: "A client ID is required." });

    let member = memberById(lobby, clientId);
    let sessionToken = String(body.sessionToken || "");
    if (!member) {
      if (lobby.started) return json(res, 409, { error: "This game has already started." });
      if (lobby.members.length >= lobby.maxPlayers) return json(res, 409, { error: "This lobby is full." });
      sessionToken = generateSessionToken();
      member = {
        clientId,
        name: sanitizeName(body.name),
        sessionToken,
        connections: new Set()
      };
      lobby.members.push(member);
    } else {
      if (!secureEqual(member.sessionToken, sessionToken)) {
        return json(res, 401, { error: "This seat belongs to another browser session." });
      }
      member.name = sanitizeName(body.name, member.name);
      sessionToken = member.sessionToken;
    }

    touchLobby(lobby);
    broadcastLobby(lobby);
    json(res, 200, {
      ok: true,
      lobby: safeLobby(lobby),
      isHost: lobby.hostId === clientId,
      sessionToken
    });
    return;
  }

  const code = normalizeCode(body.code);
  const clientId = sanitizeClientId(body.clientId);
  const lobby = lobbies.get(code);
  const member = authenticatedMember(lobby, clientId, body.sessionToken);
  if (!lobby || !member) {
    json(res, 401, { error: "Lobby session was not found or has expired." });
    return;
  }
  touchLobby(lobby);

  if (url.pathname === "/api/action") {
    if (!allowRate(req, res, "action", 600, 60_000)) return;
    const actionType = String(body.type || "");
    if (actionType === "start") {
      if (clientId !== lobby.hostId) return json(res, 403, { error: "Only the host can start the game." });
      if (lobby.started) return json(res, 409, { error: "The game has already started." });
      const connectedHumans = lobby.members.filter((entry) => entry.connections.size > 0).length;
      if (connectedHumans < 2 && !lobby.fillBots) {
        return json(res, 409, { error: "At least two connected players are required, or enable bot fill." });
      }
      lobby.started = true;
      broadcastLobby(lobby);
      json(res, 200, { ok: true, lobby: safeLobby(lobby) });
      return;
    }

    if (actionType === "reset_lobby") {
      if (clientId !== lobby.hostId) return json(res, 403, { error: "Only the host can reset the lobby." });
      lobby.started = false;
      lobby.stateSnapshot = null;
      lobby.stateSeq = 0;
      broadcast(lobby, { type: "reset" });
      broadcastLobby(lobby);
      json(res, 200, { ok: true, lobby: safeLobby(lobby) });
      return;
    }

    if (!lobby.started) return json(res, 409, { error: "The game has not started yet." });
    const allowed = new Set(["draft_pick", "select_racer", "take_turn"]);
    if (!allowed.has(actionType)) return json(res, 400, { error: "Unknown game action." });
    broadcast(lobby, {
      type: "action",
      senderId: clientId,
      action: actionType,
      payload: body.payload || {}
    }, lobby.hostId);
    json(res, 202, { ok: true });
    return;
  }

  if (url.pathname === "/api/state") {
    if (!allowRate(req, res, "state", 1200, 60_000)) return;
    if (clientId !== lobby.hostId) return json(res, 403, { error: "Only the lobby host can publish game state." });
    const seq = Number(body.seq);
    if (!Number.isFinite(seq) || seq <= lobby.stateSeq) {
      return json(res, 202, { ok: true, ignored: true });
    }
    if (!body.state || typeof body.state !== "object") {
      return json(res, 400, { error: "A valid game state is required." });
    }
    lobby.stateSeq = seq;
    lobby.stateSnapshot = body.state;
    broadcast(lobby, { type: "state", seq, state: lobby.stateSnapshot });
    json(res, 202, { ok: true });
    return;
  }

  if (url.pathname === "/api/leave") {
    if (clientId === lobby.hostId) {
      broadcast(lobby, { type: "host_closed" });
      closeLobbyConnections(lobby);
      lobbies.delete(code);
      return json(res, 200, { ok: true });
    }
    for (const connection of member.connections) connection.end();
    lobby.members = lobby.members.filter((entry) => entry.clientId !== clientId);
    broadcastLobby(lobby);
    json(res, 200, { ok: true });
    return;
  }

  json(res, 404, { error: "API route not found." });
}

function closeLobbyConnections(lobby) {
  for (const member of lobby.members) {
    for (const connection of member.connections) connection.end();
    member.connections.clear();
  }
}

function cleanupExpiredState() {
  const now = Date.now();
  for (const [code, lobby] of lobbies) {
    if (now - lobby.lastActivityAt <= LOBBY_TTL_MS) continue;
    broadcast(lobby, { type: "host_closed", reason: "Lobby expired after inactivity." });
    closeLobbyConnections(lobby);
    lobbies.delete(code);
  }
  for (const [key, entry] of rateBuckets) {
    if (entry.resetAt + 60_000 < now) rateBuckets.delete(key);
  }
}

const cleanupTimer = setInterval(cleanupExpiredState, 60_000);
cleanupTimer.unref();

const server = http.createServer((req, res) => {
  applySecurityHeaders(req, res);
  let url;
  try {
    url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  } catch (error) {
    json(res, 400, { error: "Invalid request URL." });
    return;
  }
  if (url.pathname === "/healthz" || url.pathname.startsWith("/api/")) {
    handleApi(req, res, url).catch((error) => {
      console.error(error);
      const status = Number(error.statusCode) || 500;
      if (!res.headersSent) json(res, status, { error: status >= 500 ? "Server error." : error.message });
      else res.end();
    });
    return;
  }
  serveStatic(req, res, url.pathname);
});

server.keepAliveTimeout = 75_000;
server.headersTimeout = 80_000;
server.requestTimeout = 30_000;

server.on("clientError", (error, socket) => {
  if (!socket.writable) return;
  socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}. Closing online lobby server...`);
  clearInterval(cleanupTimer);
  for (const lobby of lobbies.values()) {
    broadcast(lobby, { type: "host_closed", reason: "Server is restarting." });
    closeLobbyConnections(lobby);
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

server.listen(PORT, HOST, () => {
  const origin = PUBLIC_ORIGIN || `http://localhost:${PORT}`;
  console.log("\nArcane Dash League online server is running.\n");
  console.log(`Open: ${origin}`);
  console.log(`Health: ${origin}/healthz`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Analytics: ${UMAMI ? `Umami (${UMAMI.scriptOrigin})` : "off"}`);
  if (!PUBLIC_ORIGIN && NODE_ENV === "production") {
    console.warn("Warning: PUBLIC_ORIGIN is not set. Share links will use the incoming request host.");
  }
  console.log("\nLobby state is stored in memory. Run one server instance unless you add shared storage.\n");
});
