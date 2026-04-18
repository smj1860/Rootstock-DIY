/**
 * subscribe.js — Newsletter / waitlist email capture
 *
 * POST /api/subscribe
 * Body: { email: string, source?: "landing-page" | "in-app" | "referral" }
 *
 * Uses the Supabase service-role key (server-side only) to insert into
 * newsletter_subscribers. The table has NO client-access RLS policies,
 * so this must run server-side.
 *
 * On duplicate email: returns 200 (already subscribed) — never 409.
 * This avoids leaking whether an email address is already in the list.
 */

const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // ── Validate env vars ────────────────────────────────────────────
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('subscribe: missing env vars SUPABASE_URL or SUPABASE_SERVICE_KEY')
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) }
  }

  // ── Parse body ───────────────────────────────────────────────────
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const email  = (body.email || '').trim().toLowerCase()
  const source = body.source || 'landing-page'

  // ── Validate email ───────────────────────────────────────────────
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRe.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Please enter a valid email address.' }),
    }
  }

  const validSources = ['landing-page', 'in-app', 'referral']
  const safeSource   = validSources.includes(source) ? source : 'landing-page'

  // ── Upsert into newsletter_subscribers ───────────────────────────
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source: safeSource },
      { onConflict: 'email', ignoreDuplicates: true }
    )

  if (error) {
    console.error('subscribe: upsert error', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to subscribe. Please try again.' }),
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  }
}
