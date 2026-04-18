/**
 * stripe-webhook.js — Stripe webhook handler
 *
 * POST /api/stripe-webhook  (Netlify raw body required — see netlify.toml)
 *
 * Listens for:
 *   - customer.subscription.created  → set subscription_tier = 'pro'
 *   - customer.subscription.deleted  → set subscription_tier = 'free'
 *   - invoice.payment_failed         → log / notify (future: send email)
 *
 * Verifies Stripe signature using STRIPE_WEBHOOK_SECRET to prevent spoofing.
 */

const { createClient } = require('@supabase/supabase-js')
const Stripe           = require('stripe')

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
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

  // Verify Stripe signature
  const sig = event.headers['stripe-signature']
  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return { statusCode: 400, body: JSON.stringify({ error: `Webhook error: ${err.message}` }) }
  }

  // client_reference_id was set to the Supabase user ID in create-checkout-session.js
  const getSupabaseUserId = async (customerId) => {
    // Look up by stripe_customer_id if you store it, otherwise fall back to
    // the client_reference_id stored in the checkout session
    const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 1 })
    return sessions.data[0]?.client_reference_id || null
  }

  try {
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'checkout.session.completed': {
        const obj    = stripeEvent.data.object
        const userId = obj.client_reference_id || await getSupabaseUserId(obj.customer)
        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'pro' })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub    = stripeEvent.data.object
        const userId = await getSupabaseUserId(sub.customer)
        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        // TODO: Send notification email (Supabase Auth emails for now)
        console.warn('Payment failed for customer:', stripeEvent.data.object.customer)
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook processing failed' }) }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
