#!/usr/bin/env node
'use strict';

/**
 * Mosaic Identity Service — standalone sidecar.
 * Runs alongside Haven (or any chat server), providing:
 *   - Ed25519 key management
 *   - WebAuthn (Passkey) registration/login
 *   - QR code pubkey exchange
 *   - Contact book
 *   - Signing/verification for event bus foundation
 *
 * All routes under /mosiac/* so a reverse proxy can route cleanly.
 */

const express = require('express');
const path = require('path');

const { initDatabase } = require('./src/sqlite-adapter');
const identityRoutes = require('./src/routes');
const { detectLocale } = require('./i18n');

// ─── Config ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.MOSIAC_PORT || '3002', 10);
const HOST = process.env.MOSIAC_HOST || '0.0.0.0';

// ─── Init ────────────────────────────────────────────────────────────────
initDatabase();
console.log(`  Mosaic identity DB initialized`);

// ─── App ─────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '1mb' }));

// Attach locale detection to req for downstream use
app.use((req, res, next) => {
  req.locale = detectLocale(req);
  next();
});

// CORS for cross-origin from Haven
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────
// Identity/QR/contacts/signing at /mosaic/* (canonical).
// /mosiac/* is kept as a backwards-compatible alias for existing clients.
app.use('/mosaic', identityRoutes);
app.use('/mosiac', identityRoutes);

// Health at root
app.get('/health', (req, res) => res.json({ ok: true, service: 'mosaic-identity' }));

// ─── Static files (identity SPA) ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Start ───────────────────────────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log(`  Mosaic identity service running on http://${HOST}:${PORT}`);
  console.log(`  API:     http://${HOST}:${PORT}/mosaic/`);
  console.log(`  SPA:     http://${HOST}:${PORT}/identity.html`);
});
