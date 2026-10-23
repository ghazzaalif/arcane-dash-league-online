# Online Deployment Guide

## Deployment requirements

Use a service that can run a persistent Node.js process and accept long-lived HTTP connections. Do not deploy only the HTML, CSS, and JavaScript files to static hosting because `/api/*` and the server-sent event stream are required.

Run exactly one application instance for this MVP. Lobby state is stored in memory and is not shared between replicas.

## Required production settings

```text
NODE_ENV=production
PUBLIC_ORIGIN=https://game.example.com
```

The platform can provide `PORT`. When it does not, use `4173`.

`PUBLIC_ORIGIN` must be the exact externally reachable HTTPS origin without a trailing path. It is used to create invite links.

## Option A: Deploy the Docker image

Build and run locally:

```bash
docker build -t arcane-dash-league-online .
docker run --rm -p 4173:4173 \
  -e PUBLIC_ORIGIN=http://localhost:4173 \
  arcane-dash-league-online
```

For a cloud container service:

1. Create a web service from this folder or repository.
2. Choose the included `Dockerfile`.
3. Set `PUBLIC_ORIGIN` to the final HTTPS URL.
4. Set the health check path to `/healthz`.
5. Keep the service at one replica.
6. Confirm the platform does not buffer server-sent events.

## Option B: Deploy as a managed Node service

Use these settings:

```text
Build command: none, or npm install
Start command: npm start
Health check path: /healthz
Node version: 18 or newer
```

There are no third-party runtime dependencies, so `npm install` is optional.

## Option C: Self-host on a VPS

Start the server:

```bash
PUBLIC_ORIGIN=https://game.example.com \
NODE_ENV=production \
PORT=4173 \
node server.js
```

Place an HTTPS reverse proxy in front of it. Example Caddy configuration:

```text
game.example.com {
  reverse_proxy 127.0.0.1:4173
}
```

Keep proxy buffering disabled for server-sent events when your proxy enables buffering by default. Preserve the forwarded host and protocol headers so invite links resolve correctly. Setting `PUBLIC_ORIGIN` avoids ambiguity.

## Docker Compose

Copy `.env.example` to `.env`, set the real public origin, then run:

```bash
docker compose up -d --build
```

The included Compose file publishes port `4173`. Put HTTPS in front of that port for public production use.

## Optional: Umami analytics

1. In Umami (Cloud at cloud.umami.is, or self-hosted), add a website with your public domain.
2. Copy its website ID and set `UMAMI_WEBSITE_ID` on the service. For self-hosted Umami, also set
   `UMAMI_SCRIPT_URL` to your instance's `script.js`.
3. Redeploy, open the site, and confirm a visitor appears in Umami's realtime view.

Leaving `UMAMI_WEBSITE_ID` unset keeps analytics fully off. See the README for the event list.

## Verification after deployment

1. Open `/healthz` and confirm it returns `{"ok":true,...}`.
2. Open the game website over HTTPS.
3. Create a lobby and verify the invite link uses the public domain.
4. Join from a device on a different internet connection.
5. Start a two-player game.
6. Verify the guest receives draft updates and can take only its own turns.
7. Leave the lobby and verify all clients return to setup when the host closes it.

## Scaling beyond one instance

Before adding replicas, move these responsibilities to shared infrastructure:

- Lobby membership and session tokens
- Latest game snapshot and sequence number
- Action delivery to the correct host connection
- Presence and disconnect tracking
- Lobby expiration

Typical implementations use a shared database plus a pub-sub or streaming layer. The current in-memory implementation intentionally favors a simple deployable MVP.

## Persistence and recovery

A process restart removes all lobbies. This is acceptable for short MVP matches, but production persistence should store snapshots outside the process. The browser host already publishes serializable snapshots, so the server can later write them to a database without changing the game rules.

## Security notes

- Always use HTTPS in production.
- Lobby codes identify rooms, but seat actions also require a random session token.
- Invite links do not contain seat tokens.
- Security headers restrict framing, external scripts, permissions, and cross-origin resources. With Umami on, only its script and data hosts are added to the policy.
- Request limits reduce automated lobby and join abuse.
- Do not expose the Node port directly when a managed HTTPS endpoint or reverse proxy is available.
