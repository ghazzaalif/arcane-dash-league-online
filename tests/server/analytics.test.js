"use strict";

// Umami analytics wiring: off by default, injected with a matching CSP when
// UMAMI_WEBSITE_ID is set, and safely off when the config is invalid.

const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const ROOT = path.join(__dirname, "..", "..");
const WEBSITE_ID = "3f2b8c1e-7a4d-4e5f-9b6a-1c2d3e4f5a6b";
let nextPort = 4900 + Math.floor(Math.random() * 400);

function get(port, pathname, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${pathname}`, { headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString("utf8") }));
    }).on("error", reject);
  });
}

async function withServer(env, run) {
  const port = nextPort++;
  const clean = { ...process.env };
  for (const key of Object.keys(clean)) if (key.startsWith("UMAMI_") || key === "PUBLIC_ORIGIN") delete clean[key];
  const server = spawn(process.execPath, ["server.js"], { cwd: ROOT, env: { ...clean, ...env, PORT: String(port), HOST: "127.0.0.1" }, stdio: "pipe" });
  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk; });
  server.stderr.on("data", (chunk) => { output += chunk; });
  try {
    for (let i = 0; i < 50; i += 1) {
      try {
        if ((await get(port, "/healthz")).status === 200) break;
      } catch (error) { /* not up yet */ }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await run(port, () => output);
  } finally {
    server.kill("SIGTERM");
  }
}

test("analytics off by default: no tracker, CSP allows only this site", async () => {
  await withServer({}, async (port) => {
    const page = await get(port, "/");
    assert.equal(page.status, 200);
    assert.doesNotMatch(page.text, /umami|data-website-id/);
    assert.match(page.headers["content-security-policy"], /script-src 'self';/);
    assert.match(page.headers["content-security-policy"], /connect-src 'self';/);
  });
});

test("Umami Cloud: tracker tag injected, CSP opened only to Umami, lobby codes excluded", async () => {
  await withServer({ UMAMI_WEBSITE_ID: WEBSITE_ID, PUBLIC_ORIGIN: "https://arcane.example.com" }, async (port, output) => {
    const page = await get(port, "/");
    assert.equal(page.status, 200);
    const tag = page.text.match(/<script [^>]*data-website-id[^>]*><\/script>/)?.[0];
    assert.ok(tag, "tracker tag is in the page");
    assert.ok(page.text.indexOf(tag) < page.text.indexOf("</head>"), "tag sits in <head>");
    assert.match(tag, /src="https:\/\/cloud\.umami\.is\/script\.js"/);
    assert.match(tag, new RegExp(`data-website-id="${WEBSITE_ID}"`));
    assert.match(tag, /data-domains="arcane\.example\.com"/, "only the live domain is counted, not localhost");
    assert.match(tag, /data-exclude-search="true"/, "?lobby= invite codes never leave the site");
    assert.match(tag, /\bdefer\b/);
    assert.equal(Number(page.headers["content-length"]), Buffer.byteLength(page.text));

    const csp = page.headers["content-security-policy"];
    assert.match(csp, /script-src 'self' https:\/\/cloud\.umami\.is;/);
    assert.match(csp, /connect-src 'self' https:\/\/cloud\.umami\.is https:\/\/gateway\.umami\.is;/);
    assert.match(csp, /default-src 'self';/);

    const again = await get(port, "/", { "if-none-match": page.headers.etag });
    assert.equal(again.status, 304, "ETag still works for the injected page");
    assert.match(output(), /Analytics: Umami/);

    // Other assets are untouched.
    const js = await get(port, "/game.js");
    assert.equal(js.status, 200);
  });
});

test("self-hosted Umami: script and data endpoint come from the configured hosts", async () => {
  await withServer({
    UMAMI_WEBSITE_ID: WEBSITE_ID,
    UMAMI_SCRIPT_URL: "https://stats.example.org/u.js",
    UMAMI_HOST_URL: "https://collect.example.org/",
    UMAMI_DOMAINS: "a.example.com, b.example.com"
  }, async (port) => {
    const page = await get(port, "/");
    assert.match(page.text, /src="https:\/\/stats\.example\.org\/u\.js"/);
    assert.match(page.text, /data-host-url="https:\/\/collect\.example\.org"/);
    assert.match(page.text, /data-domains="a\.example\.com,b\.example\.com"/);
    const csp = page.headers["content-security-policy"];
    assert.match(csp, /script-src 'self' https:\/\/stats\.example\.org;/);
    assert.match(csp, /connect-src 'self' https:\/\/collect\.example\.org;/);
    assert.doesNotMatch(csp, /umami\.is/);
  });
});

test("invalid Umami config turns analytics off instead of breaking the site", async () => {
  await withServer({ UMAMI_WEBSITE_ID: "not-a-uuid\"><script>alert(1)</script>" }, async (port, output) => {
    const page = await get(port, "/");
    assert.equal(page.status, 200);
    assert.doesNotMatch(page.text, /data-website-id|alert\(1\)/);
    assert.match(page.headers["content-security-policy"], /script-src 'self';/);
    assert.match(output(), /UMAMI_WEBSITE_ID is not a valid UUID/);
  });
});
