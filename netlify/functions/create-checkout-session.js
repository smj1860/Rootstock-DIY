/**
 * create-checkout-session.js — Stripe Checkout
 *
 * POST /api/create-checkout-session
 * Auth: Authorization: Bearer <supabase-jwt>
 *
 * Creates a Stripe Checkout session for the $9/month Pro subscription.
 * Returns { url } — the client redirects to this Stripe-hosted URL.
 */

const { createClient } = require('@supabase/supabase-js')
const Stripe           = require('stripe')

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'APP_URL']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Verify JWT
  const token = (event.headers?.authorization || '').replace('Bearer ', '').trim()
  if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Missing authorization token' }) }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) }

  try {
    const session = await stripe.checkout.sessions.create({
      mode:               'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price:    process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email:  user.email,
      client_reference_id: user.id,  // used in webhook to link Stripe customer → Supabase user
      success_url: `${process.env.APP_URL}/app/settings.html?upgrade=success`,
      cancel_url:  `${process.env.APP_URL}/app/settings.html?upgrade=cancelled`,
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error('create-checkout-session error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    }
  }
}
