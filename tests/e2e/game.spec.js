"use strict";

const { test, expect } = require("@playwright/test");

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  return errors;
}

async function noHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "page should not scroll sideways").toBeLessThanOrEqual(1);
}

async function draftAndSelect(page) {
  for (let i = 0; i < 80; i += 1) {
    const phase = await page.evaluate(() => state.phase);
    if (phase === "race") return;
    const card = page.locator("[data-draft-id]:not([disabled]), [data-select-id]:not([disabled])").first();
    if (await card.count()) await card.click();
    await page.clock.runFor(800);
  }
  throw new Error("never reached the race");
}

test("local game: four races with bots end on the league table, with no errors", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one full game is enough");
  const errors = watchErrors(page);
  await page.clock.install();
  await page.goto("/");
  await noHorizontalScroll(page);
  await page.click('[data-team-count="4"]');
  await page.click('[data-control="0"]');
  await page.click("#startButton");
  const seen = new Set();
  for (let i = 0; i < 5000; i += 1) {
    await page.clock.runFor(500);
    const phase = await page.evaluate(() => `${state.phase}:${state.raceNumber}`);
    seen.add(phase);
    if (phase.startsWith("final")) break;
    if (phase.startsWith("results")) {
      const next = page.locator("#nextRaceButton");
      if (await next.count()) await next.click();
    }
  }
  expect([...seen]).toEqual(expect.arrayContaining(["race:0", "race:1", "race:2", "race:3", "final:3"]));
  await expect(page.locator(".final-title")).toBeVisible();
  await expect(page.locator(".league-row")).toHaveCount(4);
  const total = await page.evaluate(() => state.players.reduce((sum, player) => sum + player.score, 0));
  expect(total, "two runners score in every race").toBe(3 + 1 + 5 + 2 + 7 + 3 + 10 + 5);
  expect(errors).toEqual([]);
});

test("human turn: draft, pick a runner, roll with the keyboard, token moves", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.clock.install();
  await page.goto("/");
  await page.click('[data-team-count="2"]');
  await page.click("#startButton");
  await expect(page.locator(".runner-card").first()).toBeVisible();
  await noHorizontalScroll(page);
  await draftAndSelect(page);
  await page.clock.runFor(1500);
  await noHorizontalScroll(page);

  const board = page.locator(".board");
  await expect(board).toBeVisible();
  const box = await board.boundingBox();
  const viewport = page.viewportSize();
  expect(box.width).toBeLessThanOrEqual(viewport.width);

  const tokens = page.locator(".board-tokens .token");
  await expect(tokens).toHaveCount(2);
  const tokenBox = await tokens.first().boundingBox();
  expect(tokenBox.width, "tokens stay big enough to see and tap").toBeGreaterThanOrEqual(isMobile ? 22 : 30);

  for (let i = 0; i < 20; i += 1) {
    const roll = page.locator("#rollButton:not([disabled])");
    if (await roll.count()) break;
    await page.clock.runFor(700);
  }
  const before = await page.evaluate(() => state.entrants.find((e) => e.playerId === "p0").pos);
  if (isMobile) await page.locator("#rollButton").tap();
  else await page.keyboard.press("r");
  await page.clock.runFor(6000);
  const after = await page.evaluate(() => state.entrants.find((e) => e.playerId === "p0").pos);
  expect(after).not.toBe(before);
  if (isMobile) {
    const roll = await page.locator(".turn-card").boundingBox();
    expect(roll.y + roll.height, "turn card stays on screen").toBeLessThanOrEqual(viewport.height + 1);
  }
  expect(errors).toEqual([]);
});

test("runner list and rules open, filter and close", async ({ page }) => {
  await page.goto("/");
  await page.click("#charactersButton");
  await expect(page.locator("#charactersDialog .runner-card")).toHaveCount(24);
  await page.click('[data-role="Trickster"]');
  const tricksters = await page.locator("#charactersDialog .runner-card").count();
  expect(tricksters).toBeGreaterThan(0);
  expect(tricksters).toBeLessThan(24);
  await page.keyboard.press("Escape");
  await expect(page.locator("#charactersDialog")).not.toBeVisible();
  await page.click("#rulesButton");
  await expect(page.locator("#rulesDialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#rulesDialog")).not.toBeVisible();
});

test("every runner portrait loads", async ({ page }) => {
  await page.goto("/");
  const images = page.locator(".roster-grid img");
  await expect(images).toHaveCount(24);
  const broken = await images.evaluateAll((list) => list.filter((img) => !img.complete || img.naturalWidth === 0).length);
  expect(broken).toBe(0);
});

test("online: host and guest stay in sync through a race", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "already uses a desktop host and a phone guest");
  const host = await (await browser.newContext({ viewport: { width: 1280, height: 860 } })).newPage();
  const guest = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  const hostErrors = watchErrors(host);
  const guestErrors = watchErrors(guest);

  await host.goto("/");
  await host.click('[data-setup-mode="create"]');
  await host.click('[data-lobby-size="3"]');
  await host.check("#fillBots");
  await host.fill("#createPlayerName", "Host");
  await host.click("#createLobbyButton");
  const code = (await host.locator(".lobby-code").innerText()).replace(/code/i, "").trim();
  expect(code).toMatch(/^[A-Z2-9]{5}$/);

  await guest.goto(`/?lobby=${code}`);
  await expect(guest.locator("#joinLobbyCode")).toHaveValue(code);
  await guest.fill("#joinPlayerName", "Guest");
  await guest.click("#joinLobbyButton");
  await expect(guest.locator(".lobby-screen")).toBeVisible();
  await expect(host.locator(".seat")).toHaveCount(3);
  await host.click("#startLobbyGameButton");

  let done = false;
  for (let i = 0; i < 500 && !done; i += 1) {
    for (const page of [host, guest]) {
      const action = page.locator("[data-draft-id]:not([disabled]), [data-select-id]:not([disabled]), #rollButton:not([disabled])").first();
      if (await action.count()) await action.click().catch(() => {});
    }
    await host.waitForTimeout(250);
    const phases = await Promise.all([host, guest].map((page) => page.evaluate(() => state.phase)));
    done = phases.every((phase) => phase === "results");
  }
  expect(done, "both screens reach the podium").toBe(true);
  const snapshot = (page) => page.evaluate(() => JSON.stringify(state.players.map((p) => [p.name, p.score, p.team.map((slot) => slot.racerId)])));
  expect(await snapshot(guest)).toBe(await snapshot(host));
  expect([...hostErrors, ...guestErrors]).toEqual([]);
});

test("static hosting: online modes switch off, local play still works", async ({ page }) => {
  await page.route("**/api/info", (route) => route.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await expect(page.locator('[data-setup-mode="create"]')).toBeDisabled();
  await expect(page.locator('[data-setup-mode="local"]')).toBeEnabled();
  await page.click("#startButton");
  await expect(page.locator(".runner-card").first()).toBeVisible();
});
