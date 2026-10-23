# Arcane Dash League Online Edition

A deployable 2D browser racing game with local play and internet-accessible multiplayer lobbies.

## What changed from the LAN edition

- One public Node server serves the game and relays all lobby traffic.
- Players join through the same HTTPS website from any internet connection.
- Lobby invite links use the deployed public origin instead of local IP addresses.
- Every lobby seat receives a cryptographically random session token.
- The server includes request limits, security headers, health checks, lobby expiration, and graceful shutdown handling.
- Docker, Compose, Procfile, and environment templates are included for deployment.

The lobby creator's browser remains the game authority. The deployed server relays actions and synchronized state, so the creator must keep the game tab open during a match.

## Run locally

Node.js 18 or newer is required.

```bash
npm start
```

Open `http://localhost:4173` in two browser windows to test create and join behavior.

## Deploy online

The application must run as a Node web service. Static-only hosting cannot run the lobby API or the live event stream.

Minimum configuration:

```text
Start command: node server.js
Health check: /healthz
Environment: NODE_ENV=production
Environment: PUBLIC_ORIGIN=https://your-domain.example
```

The hosting platform normally supplies `PORT` automatically. The server listens on `0.0.0.0` and honors that port.

See `DEPLOYMENT.md` for Docker, managed Node hosting, reverse-proxy, and operational instructions.

## Create and join

1. Open the deployed HTTPS site.
2. Select **Create lobby**.
3. Choose a team name, lobby size, and optional bot fill.
4. Copy the invite link or share the five-character code.
5. Other players open the same site and join from any supported browser.
6. The creator starts the league after players connect.

## Online architecture

- **Browser host:** Runs the authoritative game rules and animations.
- **Node service:** Creates lobbies, authenticates seats, relays actions, and broadcasts snapshots with server-sent events.
- **Guest browsers:** Send only actions for their assigned team and render host snapshots.
- **Transport:** Same-origin HTTPS requests plus a persistent server-sent event stream.

## Important operational limits

- Lobby data is stored in server memory.
- Use one running server instance. Multiple replicas require shared lobby storage and cross-instance event delivery.
- A server restart clears active lobbies.
- Idle lobbies expire after six hours by default.
- The host browser must remain open during the match.
- Use an HTTPS public URL in production.
- Your host must support long-lived HTTP responses for server-sent events.

## Environment variables

| Variable | Default | Purpose |
| --- | ---: | --- |
| `PORT` | `4173` | HTTP listening port |
| `HOST` | `0.0.0.0` | Listening interface |
| `PUBLIC_ORIGIN` | Request origin | Canonical HTTPS origin used in invite links |
| `MAX_LOBBIES` | `1000` | Maximum in-memory lobbies |
| `LOBBY_TTL_MINUTES` | `360` | Idle lobby lifetime |
| `BODY_LIMIT_KB` | `768` | Maximum JSON request size |
| `NODE_ENV` | `development` | Runtime environment label |
| `UMAMI_WEBSITE_ID` | off | Umami website ID (UUID). Setting it turns analytics on |
| `UMAMI_SCRIPT_URL` | `https://cloud.umami.is/script.js` | Tracker script; change for self-hosted Umami |
| `UMAMI_HOST_URL` | script's host | Where events are sent, if not the script's host |
| `UMAMI_DOMAINS` | `PUBLIC_ORIGIN` host | Comma-separated hostnames to count (keeps localhost out) |

## Analytics (Umami)

Analytics is off unless `UMAMI_WEBSITE_ID` is set. Then the server adds the
[Umami](https://umami.is) tracker to the page and opens the Content-Security-Policy only to
the Umami hosts it needs. Umami is cookieless, so no consent banner is needed. Query strings
are never sent (invite links carry the lobby code), browsers with Do Not Track are skipped,
and no team names or other typed text are sent.

Custom events, sent once per game by the solo player or online host:

| Event | Data | Answers |
| --- | --- | --- |
| `game-start` | `mode` (local/online), `teams`, `humans`, `bots` | How many games start, and in which setup |
| `draft-pick` | `runner`, `role`, `wave`, `mode` (human picks only) | Which runners players actually want |
| `race-finish` | `race`, `track` (calm/chaos), `teams`, `first`, `second`, `winnerIsBot` | Which runners win real races |
| `game-finish` | `mode`, `teams`, `humans`, `bots`, `winner` (human/bot/tie), `topScore` | Completion rate (vs `game-start`), human win rate |
| `play-again` | `mode` | Replay rate |
| `lobby-create` | `seats`, `bots` | Online play uptake |
| `lobby-join` | `rejoin` | Invite conversion (vs `lobby-create`) |
| `rules-open`, `runners-open` | none | Whether the help is used |

Pageviews are tracked automatically. The GitHub Pages preview has no server, so it is never tracked.

## Files

- `index.html` - game page and dialogs
- `styles.css` - responsive interface, race board, lobby, and animations
- `game.js` - rules, UI, audio, host authority, online sessions, and synchronization
- `runners-art.js` - original 16x16 pixel-art sprites for all 24 runners
- `maps.js` - the compact race board: a loop of 31 tiles plus a start/finish gate, with four pixel-art themes (10x8 tiles on desktop, 8x10 on phones)
- `fonts/` - self-hosted Big Shoulders Display and Atkinson Hyperlegible (SIL Open Font License)
- `server.js` - public HTTP server, lobby API, authentication, SSE relay, and health checks
- `Dockerfile` - production container image
- `compose.yaml` - local container or VPS launch configuration
- `Procfile` - generic managed Node process declaration
- `.env.example` - production environment template
- `DEPLOYMENT.md` - deployment and operations guide

## Testing

Every change is tested before it reaches `main` (and so before Render deploys it).

```bash
npm ci
npm test              # syntax check, rules and asset tests, server/API tests (~5s)
npm run test:balance  # seeded balance simulation across 2, 3 and 4-team games (~1 min)
npm run test:e2e      # Playwright play-throughs on desktop and phone (~2 min)
npm run test:all      # everything
```

The first `test:e2e` run needs a browser: `npx playwright install chromium`.

- `tests/unit/rules.test.js` drives the real `game.js` with scripted dice: draft, selection,
  scoring, track spaces and every runner power.
- `tests/unit/assets.test.js` checks the board layout (compact, no overlapping tiles, fits on
  screen) and that every runner has a valid 16x16 sprite.
- `tests/balance/` fails if any runner drifts outside 0.84x-1.16x of a fair share of points.
- `tests/server/` covers static files, security headers, the lobby API and the Umami
  tag/CSP wiring.
- `tests/unit/analytics.test.js` plays a full game and checks which analytics events fire.
- `tests/e2e/` plays a full four-race game, a human turn on desktop and phone, the dialogs,
  an online host/guest game and the static-hosting fallback.

GitHub Actions runs all of it on every pull request and push to `main`. The Preview workflow
can publish any branch to GitHub Pages as a playable preview (same-screen play only) once its
tests pass; see the setup note at the top of `.github/workflows/preview.yml`.

## Runner balance

Every runner power is tuned against a headless simulation of the real rules in `game.js`:
tens of thousands of races in 2, 3 and 4-team fields, measuring each runner's expected
points (first place weighted double). Every runner now lands within about 5% of a fair
share. If you change a power, re-run the numbers before shipping; the `tune` values on each
runner in `RACERS` hold the numbers the rules read.

## Tracks

Races alternate calm and chaos rules, and each race has its own map:
Whisper Grove (calm), Ember Ridge (chaos), Moon Pool (calm), Storm Spire (chaos finale).

## Local-only mode

Opening `index.html` directly still allows local single-screen play. Online lobby controls require the Node server.
