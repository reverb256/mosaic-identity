# Mosiac Identity Service

Self-sovereign identity for everyone. Ed25519 keys, WebAuthn passkeys, QR contact exchange.

**Part of the [Mosaic](https://github.com/reverb256/Mosaic) project.**

## How It Works

- Generate an Ed25519 keypair — your identity is your public key
- Register a Passkey (WebAuthn) — hardware-backed, phishing-resistant
- Share your pubkey via QR code — no addresses, no usernames, no DNS
- Scan someone's QR to add them as a contact
- Sign and verify JSON payloads — foundation for posts, DMs, federation

## Run Anywhere

| Platform | Command |
|----------|---------|
| **Linux / macOS** | `git clone && npm install && node server.js` |
| **Docker** | `docker compose -f oci/docker-compose.yml up -d` |
| **Termux (Android)** | `npm start` (sql.js fallback auto-activates) |
| **Railway / Fly.io** | `docker build -f oci/Dockerfile .` |
| **Homebrew / apt** | `npm install && node server.js` |

## Architecture

```
mosiac-identity/
├── server.js           ← entry point (same file, every platform)
├── start.sh            ← friendly wrapper
├── src/
│   ├── identity.js     ← Ed25519 keygen/sign/verify (pure JS)
│   ├── qr.js           ← QR encoding/scanning
│   ├── passkey.js      ← WebAuthn registration/login
│   ├── routes.js       ← Express router (all API endpoints)
│   └── sqlite-adapter.js ← auto-selects native or WASM SQLite
├── public/             ← identity management SPA
├── oci/                ← Docker multi-arch build
└── docs/
    └── termux.md       ← Android setup guide
```

## API

All endpoints live under `/mosiac/*`:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/mosiac/identity` | List identities |
| POST | `/mosiac/identity/generate` | New Ed25519 keypair |
| POST | `/mosiac/auth/register/begin` | Start passkey registration |
| POST | `/mosiac/auth/register/complete` | Complete passkey registration |
| POST | `/mosiac/auth/login/begin` | Start passkey login |
| POST | `/mosiac/auth/login/complete` | Complete passkey login |
| GET | `/mosiac/qr/:pubkey` | QR code SVG |
| POST | `/mosiac/qr/scan` | Process scanned QR |
| POST | `/mosiac/sign` | Sign JSON |
| POST | `/mosiac/verify` | Verify envelope |

## SQLite Backend

Detects the best available SQLite engine at startup:

1. **better-sqlite3** (native) — fastest, requires C++ build tools
2. **sql.js** (WASM) — zero native deps, runs on any platform

No configuration needed. If your platform can't compile better-sqlite3, the WASM fallback activates automatically. Data persists to disk regardless.

## License

AGPL-3.0 — same as upstream [Haven](https://github.com/ancsemi/Haven).
