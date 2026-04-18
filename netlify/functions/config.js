/**
 * config.js — Serve public Supabase config to the browser
 *
 * GET /api/config
 * No auth required — only exposes public (anon) credentials.
 * SUPABASE_SERVICE_KEY is never included here.
 *
 * Cached for 1 hour via Cache-Control so this doesn't hit on every page load.
 */

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type':  'application/json',
      'Cache-Control': 'public, max-age=3600',  // cache 1 hour — values rarely change
    },
    body: JSON.stringify({
      supabaseUrl:     process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }),
  }
}
