/**
 * generate-guide.js — AI guide generation
 *
 * POST /api/generate-guide
 * Body: { question, category, subcategory, skill_level, zip_code, macguyver_mode, inventory_items }
 * Auth: Authorization: Bearer <supabase-jwt>
 *
 * Guard logic:
 *   1. No valid JWT        → 401
 *   2. Free tier + count >= 2 → 403 (upgrade prompt)
 *   3. MacGuyver + not Pro → 403
 */

const { createClient } = require('@supabase/supabase-js')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const { injectAffiliateLinks } = require('./affiliate-lookup')

// ─── Fail loudly if env vars are missing ─────────────────────────
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'GEMINI_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,  // service role — never exposed to client
)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ─── Master prompt — see CLAUDE.md Section 8 ─────────────────────
function buildPrompt({ question, category, subcategory, skill_level, zip_code, macguyver_mode, inventory_items }) {
  const inventoryList = inventory_items?.length
    ? inventory_items.map(i => `- ${i.name}: ${i.notes || i.condition || ''}`).join('\n')
    : '(none)'

  return `
You are Rootstock, an expert AI homesteading assistant with deep practical knowledge across all areas of rural and suburban self-sufficiency. You have the combined wisdom of a master electrician, master plumber, experienced farmer, skilled carpenter, expert canner, solar installer, mechanic, and seasoned homesteader. You speak plainly, like a knowledgeable neighbor — never condescending, always practical.

Your task is to generate a complete, actionable project guide for the following request:

PROJECT: ${question}
CATEGORY: ${category}
SUBCATEGORY: ${subcategory || 'general'}
USER SKILL LEVEL: ${skill_level || 'intermediate'}
USER LOCATION (ZIP): ${zip_code || 'unknown'}
MACGUYVER MODE: ${macguyver_mode ? 'true' : 'false'}
USER INVENTORY:
${inventoryList}

Generate your response as a single valid JSON object matching this exact schema — no markdown, no preamble, no explanation outside the JSON:

{
  "project_title": "Clear, specific title for this project",
  "estimated_time": "e.g. 4–6 hours over 2 days",
  "difficulty": "beginner | intermediate | advanced",
  "overview": "2–3 sentence plain-English summary",
  "safety_checklist": ["Specific safety precaution or required PPE item"],
  "tools_and_materials": [
    {
      "item": "Item name",
      "quantity": "e.g. 1, 10 ft, as needed",
      "purpose": "Why this item is needed",
      "estimated_cost": "e.g. $12–$18",
      "affiliate_search_term": "Best search term to find this on Amazon or at a hardware store"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Short step title",
      "instructions": "Clear, detailed instructions tailored to skill_level.",
      "pro_tip": "Optional expert insight, or null",
      "warning": "Optional safety warning, or null"
    }
  ],
  "macguyver_substitutions": [
    {
      "standard_item": "The item typically needed",
      "user_has": "Item from user inventory that can substitute",
      "substitution_notes": "How to adapt"
    }
  ],
  "when_to_call_a_pro": "Honest guidance on which parts require a licensed professional",
  "regional_note": "Region-specific consideration based on zip, or null",
  "next_steps": ["Suggested follow-on project or maintenance task"]
}

IMPORTANT RULES:
- Safety checklist must come FIRST — never skip it
- Tailor step detail to the stated skill_level
- tools_and_materials must be specific
- If macguyver_mode is true AND inventory_items is not empty, incorporate items from inventory into macguyver_substitutions
- If macguyver_mode is false, return empty array for macguyver_substitutions
- Return ONLY the JSON object. No markdown fences, no commentary.
`.trim()
}

// ─── Handler ──────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // 1. Verify JWT
  const authHeader = event.headers?.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing authorization token' }) }
  }

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid or expired token' }) }
  }

  // 2. Fetch user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier, project_count')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load user profile' }) }
  }

  // 3. Parse request body
  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { question, category, subcategory, skill_level, zip_code, macguyver_mode, inventory_items } = body

  if (!question || !category) {
    return { statusCode: 400, body: JSON.stringify({ error: 'question and category are required' }) }
  }

  // 4. Tier guards
  if (profile.subscription_tier === 'free' && profile.project_count >= 2) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'Free tier limit reached',
        message: "You've used your 2 free project guides. Upgrade to Pro for unlimited guides.",
        upgrade_url: `${process.env.APP_URL}/app/settings.html`,
      }),
    }
  }

  if (macguyver_mode && profile.subscription_tier !== 'pro') {
    return {
      statusCode: 403,
      body: JSON.stringify({
        error: 'MacGuyver mode is a Pro feature',
        message: 'Upgrade to Pro to use MacGuyver mode.',
        upgrade_url: `${process.env.APP_URL}/app/settings.html`,
      }),
    }
  }

  // 5. Fetch user inventory for MacGuyver mode
  let inventoryItems = inventory_items || []
  if (macguyver_mode && inventoryItems.length === 0) {
    const { data: inv } = await supabaseAdmin
      .from('inventory_items')
      .select('name, notes, condition')
      .eq('user_id', user.id)
    inventoryItems = inv || []
  }

  // 6. Call Gemini
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature:      0.4,
        topP:             0.85,
        maxOutputTokens:  8192,
        responseMimeType: 'application/json',
      },
    })

    const result   = await model.generateContent(buildPrompt({ question, category, subcategory, skill_level, zip_code, macguyver_mode, inventory_items: inventoryItems }))
    const guideRaw = result.response.text().trim()
    const guide    = injectAffiliateLinks(JSON.parse(guideRaw))

    // 7. Save project + guide to Supabase
    const { data: project } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id:      user.id,
        question,
        category,
        subcategory:  subcategory || null,
        skill_level:  skill_level || 'intermediate',
        zip_code:     zip_code || null,
      })
      .select('id')
      .single()

    if (project?.id) {
      await supabaseAdmin.from('guide_outputs').insert({
        project_id: project.id,
        guide_json: guide,
      })

      // Increment project count (free tier enforcement)
      await supabaseAdmin
        .from('profiles')
        .update({ project_count: profile.project_count + 1 })
        .eq('id', user.id)
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guide, project_id: project?.id }),
    }
  } catch (err) {
    console.error('generate-guide error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Guide generation failed. Please try again.' }),
    }
  }
}
