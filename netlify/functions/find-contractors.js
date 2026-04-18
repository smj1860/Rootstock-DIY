/**
 * find-contractors.js — Google Places contractor lookup
 *
 * POST /api/find-contractors
 * Body: { subcategory, zip_code }
 * Auth: Authorization: Bearer <supabase-jwt> (Pro tier required)
 *
 * Returns top 3 local contractors for the given subcategory + zip.
 * Falls back to static Angi/HomeAdvisor message on API failure.
 */

const { createClient } = require('@supabase/supabase-js')

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'GOOGLE_PLACES_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)

const FALLBACK = {
  fallback: true,
  message: "We couldn't find local pros automatically. Try searching Angi.com or HomeAdvisor.com for licensed contractors in your area.",
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Verify JWT
  const token = (event.headers?.authorization || '').replace('Bearer ', '').trim()
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Missing authorization token' }) }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }

  // Pro-only feature
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  if (profile?.subscription_tier !== 'pro') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Contractor lookup is a Pro feature' }) }
  }

  let body
  try { body = JSON.parse(event.body) }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) } }

  const { subcategory, zip_code } = body
  if (!subcategory || !zip_code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'subcategory and zip_code are required' }) }
  }

  // Google Places Text Search
  try {
    const query    = encodeURIComponent(`${subcategory} contractor near ${zip_code}`)
    const fields   = 'name,rating,formatted_phone_number,website,vicinity'
    const url      = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${process.env.GOOGLE_PLACES_API_KEY}`

    const res      = await fetch(url)
    const places   = await res.json()

    if (!places.results?.length) {
      return { statusCode: 200, body: JSON.stringify(FALLBACK) }
    }

    // Return top 3
    const contractors = places.results.slice(0, 3).map(p => ({
      name:    p.name,
      rating:  p.rating || null,
      address: p.formatted_address || p.vicinity || null,
      phone:   p.formatted_phone_number || null,
      website: p.website || null,
    }))

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractors }),
    }
  } catch (err) {
    console.error('find-contractors error:', err)
    return { statusCode: 200, body: JSON.stringify(FALLBACK) }
  }
}
