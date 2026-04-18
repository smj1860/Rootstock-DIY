/**
 * auth.js — Supabase Auth helpers
 *
 * Initializes the Supabase client by fetching public config from /api/config
 * (which reads SUPABASE_URL + SUPABASE_ANON_KEY from Netlify env vars).
 *
 * Usage: import { getSession, requireAuth, signOut, supabase } from '/js/auth.js'
 *
 * Note: All exports are async-safe. The client is initialized lazily on first use.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Lazy client initialization ───────────────────────────────────
let _client = null

async function getClient() {
  if (_client) return _client

  const res = await fetch('/api/config')
  if (!res.ok) throw new Error('Failed to load app config')

  const { supabaseUrl, supabaseAnonKey } = await res.json()
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true,   // handles email confirmation magic links
    }
  })
  return _client
}

// Export a proxy so callers can do `await supabase` or use it after init
export async function supabase() { return getClient() }

// ─── Get current session ──────────────────────────────────────────
export async function getSession() {
  const client = await getClient()
  const { data: { session } } = await client.auth.getSession()
  return session
}

// ─── Get current user profile ─────────────────────────────────────
export async function getProfile() {
  const session = await getSession()
  if (!session) return null

  const client = await getClient()
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) { console.error('getProfile error:', error); return null }
  return data
}

// ─── Redirect to login if not authenticated ───────────────────────
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    window.location.href = `/app/login.html?next=${encodeURIComponent(window.location.pathname)}`
    return null
  }
  return session
}

// ─── Redirect to /app if already authenticated ───────────────────
export async function redirectIfAuthed() {
  const session = await getSession()
  if (session) {
    const params = new URLSearchParams(window.location.search)
    window.location.href = params.get('next') || '/app/'
  }
}

// ─── Sign up ─────────────────────────────────────────────────────
export async function signUp(email, password) {
  const client = await getClient()
  const { data, error } = await client.auth.signUp({ email, password })
  if (error) throw error
  return data
}

// ─── Sign in ─────────────────────────────────────────────────────
export async function signIn(email, password) {
  const client = await getClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ─── Update profile (e.g. skill level after signup) ──────────────
export async function updateProfile(fields) {
  const session = await getSession()
  if (!session) throw new Error('Not authenticated')

  const client = await getClient()
  const { error } = await client
    .from('profiles')
    .update(fields)
    .eq('id', session.user.id)

  if (error) throw error
}

// ─── Send password reset email ────────────────────────────────────
export async function sendPasswordReset(email) {
  const client = await getClient()
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/app/login.html`,
  })
  if (error) throw error
}

// ─── Sign out ────────────────────────────────────────────────────
export async function signOut() {
  const client = await getClient()
  const { error } = await client.auth.signOut()
  if (error) throw error
  window.location.href = '/'
}
