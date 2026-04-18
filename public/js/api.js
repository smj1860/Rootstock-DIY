/**
 * api.js — Fetch wrappers for Netlify Functions
 *
 * All requests go to /api/* which Netlify rewrites to
 * /.netlify/functions/*  (see netlify.toml redirects).
 *
 * Every call attaches the Supabase JWT as Authorization: Bearer <token>
 * so the server-side function can verify the user.
 *
 * Usage: import { generateGuide, createCheckoutSession } from '/js/api.js'
 */

import { getSession } from '/js/auth.js'

// ─── Base fetch with auth header ──────────────────────────────────
async function apiFetch(path, options = {}) {
  const session = await getSession()
  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(path, { ...options, headers })
  const json = await res.json()

  if (!res.ok) {
    const msg = json?.error || `Request failed (${res.status})`
    throw Object.assign(new Error(msg), { status: res.status, body: json })
  }

  return json
}

// ─── Generate AI guide ────────────────────────────────────────────
export async function generateGuide(payload) {
  return apiFetch('/api/generate-guide', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
}

// ─── Find local contractors ───────────────────────────────────────
export async function findContractors(subcategory, zipCode) {
  return apiFetch('/api/find-contractors', {
    method: 'POST',
    body:   JSON.stringify({ subcategory, zip_code: zipCode }),
  })
}

// ─── Create Stripe Checkout session ──────────────────────────────
export async function createCheckoutSession() {
  return apiFetch('/api/create-checkout-session', { method: 'POST' })
}
