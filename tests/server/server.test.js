"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..", "..");
const PORT = 4300 + Math.floor(Math.random() * 500);
const BASE = `http://127.0.0.1:${PORT}`;
let server;

function request(method, pathname, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? null : JSON.stringify(body);
    const req = http.request(`${BASE}${pathname}`, { method, headers: { ...(payload ? { "Content-Type": "application/json" } : {}), ...headers } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json = null;
        try { json = JSON.parse(text); } catch (error) { /* not JSON */ }
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

test.before(async () => {
  server = spawn(process.execPath, ["server.js"], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1" }, stdio: "pipe" });
  for (let i = 0; i < 50; i += 1) {
    try {
      const res = await request("GET", "/healthz");
      if (res.status === 200) return;
    } catch (error) { /* not up yet */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("server did not start");
});

test.after(() => server && server.kill("SIGTERM"));

test("serves the page and every asset it references", async () => {
  const page = await request("GET", "/");
  assert.equal(page.status, 200);
  assert.match(page.headers["content-type"], /text\/html/);
  const refs = [...page.text.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((ref) => !/^https?:|^\.\/?$/.test(ref));
  assert.ok(refs.length >= 4, "page references its scripts, styles and fonts");
  for (const ref of refs) {
    const res = await request("GET", `/${ref.replace(/^\.?\//, "")}`);
    assert.equal(res.status, 200, `${ref} should be served`);
  }
  const css = await request("GET", "/styles.css");
  for (const font of css.text.matchAll(/url\("([^"]+)"\)/g)) {
    const res = await request("GET", `/${font[1]}`);
    assert.equal(res.status, 200, `${font[1]} should be served`);
    assert.equal(res.headers["content-type"], "font/woff2");
  }
});

test("sends security headers and refuses unknown paths", async () => {
  const res = await request("GET", "/");
  assert.equal(res.headers["x-content-type-options"], "nosniff");
  assert.match(res.headers["content-security-policy"], /default-src 'self'/);
  assert.equal((await request("GET", "/server.js")).status, 404);
  assert.equal((await request("GET", "/../package.json")).status, 404);
  assert.equal((await request("POST", "/")).status, 405);
});

test("lobby: create, join, reject a stolen seat, fill up, leave", async () => {
  const host = await request("POST", "/api/lobbies", { clientId: "host-1", name: "Host <b>", maxPlayers: 2 });
  assert.equal(host.status, 201);
  const { code } = host.json.lobby;
  assert.match(code, /^[A-HJ-NP-Z2-9]{5}$/);
  assert.equal(host.json.lobby.members[0].name, "Host b", "angle brackets are stripped from names");

  const guest = await request("POST", "/api/lobbies/join", { clientId: "guest-1", name: "Guest", code });
  assert.equal(guest.status, 200);
  assert.equal(guest.json.lobby.members.length, 2);

  const thief = await request("POST", "/api/lobbies/join", { clientId: "guest-1", name: "Thief", code, sessionToken: "wrong" });
  assert.equal(thief.status, 401);

  const third = await request("POST", "/api/lobbies/join", { clientId: "guest-2", name: "Late", code });
  assert.equal(third.status, 409, "lobby is full");

  const notHost = await request("POST", "/api/action", { clientId: "guest-1", code, sessionToken: guest.json.sessionToken, type: "start" });
  assert.equal(notHost.status, 403);

  const leave = await request("POST", "/api/leave", { clientId: "guest-1", code, sessionToken: guest.json.sessionToken });
  assert.equal(leave.status, 200);
  const missing = await request("POST", "/api/lobbies/join", { clientId: "x", name: "x", code: "ZZZZZ" });
  assert.equal(missing.status, 404);
});

test("rejects malformed and oversized bodies", async () => {
  const bad = await new Promise((resolve) => {
    const req = http.request(`${BASE}/api/lobbies`, { method: "POST", headers: { "Content-Type": "application/json" } }, (res) => resolve(res.statusCode));
    req.write("{not json");
    req.end();
  });
  assert.equal(bad, 400);
  const big = await request("POST", "/api/lobbies", { clientId: "x", pad: "a".repeat(900 * 1024) }).catch(() => ({ status: 413 }));
  assert.equal(big.status, 413);
});
