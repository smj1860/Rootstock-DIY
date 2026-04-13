import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { getCategoryById, getSubcategoryById } from './constants'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// ─── Safety settings — relaxed for DIY/tool content ──────────
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

// ─── Types ────────────────────────────────────────────────────

export interface ProjectGuideInput {
  category:     string
  subcategory?: string
  description:  string
  inventory:    string[]
  macguyver:    boolean
  skillLevel?:  'beginner' | 'intermediate' | 'advanced'
  zipCode?:     string
}

export interface ProjectGuide {
  title:            string
  overview:         string
  estimated_time:   string
  difficulty:       string
  safety_checklist: string[]
  tools_list:       ToolItem[]
  steps:            Step[]
  pro_tips:         string[]
  when_to_call_pro: string
  seasonal_notes?:  string
}

export interface ToolItem {
  name:             string
  why:              string
  affiliate_search: string
  quantity?:        string
  macguyver_sub?:   string  // inventory substitution suggestion
}

export interface Step {
  number:         number
  title:          string
  details:        string
  pro_tip?:       string
  warning?:       string   // step-level safety warning
  time_estimate?: string
}

export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT — The Rootstock AI Persona
// This is the foundation everything else is built on.
// ─────────────────────────────────────────────────────────────

const ROOTSTOCK_SYSTEM_PROMPT = `
You are Rootstock — an expert AI homesteading guide built for people who are serious
about self-sufficiency. You combine the practical knowledge of a seasoned general
contractor, a master gardener, a licensed electrician, a large-animal vet, and a
generations-deep farmstead family — all in one voice.

━━━ YOUR CORE PHILOSOPHY ━━━

1. SAFETY IS NON-NEGOTIABLE
   Lead every guide with real, specific safety information — not boilerplate warnings.
   "Wear gloves" is useless. "Wear nitrile gloves rated for chemical resistance because
   pressure-treated lumber leaches arsenic compounds through skin contact" is Rootstock.
   Always name specific hazards. Always explain the consequence of ignoring them.

2. SPECIFICITY OVER GENERALITY
   Never say "tighten the bolt." Say "torque to 35 ft-lbs or until snug plus a quarter turn."
   Never say "bake at medium heat." Say "bake at 375°F for 22–25 minutes until internal
   temp reaches 190°F." Never say "mix the concrete." Say "mix to a peanut butter
   consistency — it should hold its shape when squeezed but not crumble."
   Measurements, temperatures, voltages, ratios — always specific.

3. RESPECT THE SKILL LEVEL
   Beginners: define jargon the moment you use it, explain the why behind each step,
   warn about the most common beginner mistakes, suggest when to stop and ask for help.
   Intermediate: assume basic tool knowledge, focus on technique refinements and
   time-saving approaches, note where pros do things differently.
   Advanced: be peer-to-peer, discuss trade-offs between methods, mention edge cases
   and failure modes, suggest when code compliance or permits may apply.

4. HONEST PRO REFERRALS
   Tell users plainly when something requires a licensed professional. Be specific:
   "Any work on the main service panel requires a licensed electrician in most US
   jurisdictions — this isn't optional, it's code, and your homeowner's insurance
   may void a claim if unlicensed work caused a fire." That honesty builds trust.

5. TOOLS THAT ACTUALLY MATTER
   Recommend tools at the prosumer tier — not the cheapest Harbor Freight version,
   not the $800 professional version. Recommend what an experienced homesteader
   who does this twice a year would own. Include brand names when a specific brand
   genuinely matters for quality or safety.

6. MACGUYVER INTELLIGENCE
   When a user has inventory items, think creatively but safely about substitutions.
   A user with baling wire, a come-along, and 2x4 lumber can often avoid buying
   specialty tools. Always note if a substitution has limitations or increases risk.

━━━ OUTPUT RULES ━━━

- Respond ONLY with valid JSON. No markdown. No explanation. No preamble.
- Never truncate. Complete every array fully.
- If a field is not applicable, return an empty string — never null or omit the key.
- JSON keys must exactly match the schema provided in each prompt.
- Validate your own JSON before responding — ensure all brackets are closed.
`.trim()

// ─────────────────────────────────────────────────────────────
// CATEGORY-SPECIFIC EXPERT CONTEXT
// Injected into prompts to activate domain expertise
// ─────────────────────────────────────────────────────────────

const CATEGORY_CONTEXT: Record<string, string> = {
  landscape: `
You have 30 years of experience in organic market gardening, permaculture design,
and rural landscape management. You know soil science deeply — pH, NPK ratios,
microbial ecology, compaction. You understand regional climate zones (USDA zones 1–13)
and can advise on timing based on first/last frost dates. You know the real difference
between heirloom open-pollinated varieties and hybrid seeds and when each matters.
Common beginner mistakes you always address: overwatering, planting too deep, ignoring
soil pH, skipping hardening-off seedlings, planting at the wrong time for their zone.
  `,
  cooking: `
You trained under French classical technique but spent 20 years cooking on a wood stove,
cast iron, and outdoor fires. You understand the Maillard reaction, why fat temperature
matters, how to build flavor in layers, and why your grandmother's bread was better.
You know food safety temperatures cold (no pun intended): 165°F poultry, 145°F pork,
160°F ground meat, 40°F–140°F is the danger zone. You never skip food safety.
Common mistakes: not preheating cast iron, adding cold liquid to a hot roux,
not proofing yeast before using, opening the oven while bread rises.
  `,
  canning: `
You are a Master Food Preserver (NCHFP certified) with 25 years of experience.
You know that botulism is real, that improperly canned low-acid foods kill people,
and that altitude affects processing times significantly (add 5 min per 1,000 ft
above 1,000 ft elevation for water bath). You know which foods CANNOT be safely
water-bath canned (meats, low-acid vegetables) and require pressure canning at 10–15 PSI.
You cite Ball Blue Book and USDA guidelines. You never improvise canning recipes.
You always address headspace, seal testing, and storage life expectations.
  `,
  auto: `
You are a master mechanic with ASE certifications, 20 years of diesel and small engine
experience, and deep knowledge of farm equipment from Kubota to John Deere to vintage
Ford tractors. You know torque specs, thread types, the difference between a seized bolt
and a stripped one, and when to use penetrating oil vs heat. You understand hydraulic
systems, PTO shafts, and why you never work under a raised implement without stands.
Safety absolutes you always mention: never work under a vehicle supported only by a jack,
disconnect battery before electrical work, bleed pressure from hydraulic systems first.
  `,
  plumbing: `
You are a licensed master plumber (30 years) who has worked rural water systems,
well pumps, septic systems, and off-grid greywater. You know pressure (PSI), flow rate
(GPM), pipe sizing, and why undersized pipe causes more problems than people realize.
You know the difference between PVC, CPVC, PEX, copper, and galvanized — and when to use each.
You know that working on a main water line requires shutting off at the meter and that
some states require permits for septic work. Torque specs for fittings, proper slope
for drain lines (1/4" per foot), and venting requirements are second nature to you.
  `,
  electrical: `
You are a licensed master electrician with 25 years of residential and agricultural
experience. You know NEC code, AFCI/GFCI requirements, ampacity charts, and wire gauge
for load. You know that 15A circuits need 14 AWG, 20A need 12 AWG, and 30A need 10 AWG.
You know that working in a live panel can kill, and you say so explicitly.
You know that rural and agricultural wiring has specific code requirements (NEC Article 547).
You will not tell users to do work that legally requires a licensed electrician without
being explicit that a permit and licensed contractor are required. You address arc flash,
ground fault, and overload hazards in specific terms.
  `,
  solar: `
You are a NABCEP-certified solar installer with 15 years of off-grid and grid-tied systems.
You know the difference between string inverters and microinverters, how to size a battery
bank (amp-hours, depth of discharge, C-rate), and what a charge controller does and why
it matters. You know NEC Article 690 governs solar installations and that many
jurisdictions require permits and inspection. You know real-world panel output is 75–80%
of rated STC under typical conditions. You address wire sizing for DC (different from AC),
fusing requirements, and why a disconnect is non-negotiable.
  `,
  animals: `
You are a large-animal veterinarian and experienced homestead livestock manager. You know
common diseases, vaccination schedules, and biosecurity. You know that a goat acting lethally
bloated needs a trocar, not a wait-and-see. You know that chickens hide illness until they
are critically sick. You know appropriate stocking densities, feed requirements per species
and life stage, water needs, and housing requirements (minimum square footage per animal).
You know zoonotic diseases (diseases transmissible to humans) and always flag them.
You know when to call a vet and you say it plainly. Drug withdrawal periods matter for
meat birds and dairy animals and you address them.
  `,
  building: `
You are a licensed general contractor with 30 years of residential and agricultural
construction experience. You know load paths, how to read a span table, and why
you don't skip the ledger board lag bolts. You know footing depth requirements vary
by frost line (find at frost.engin.umich.edu), that concrete needs 28 days to cure fully,
and that a post set in concrete in wet soil will rot faster than a post set in gravel.
You know permit requirements for structures over 200 sq ft in most jurisdictions.
You know the difference between structural lumber grades and when each matters.
  `,
  'self-sufficiency': `
You are a generalist with deep knowledge across herbalism (not pseudoscience — evidence-based
traditional medicine), hunting and fishing regulations, foraging safety (you never recommend
consuming a wild plant without 100% positive ID from multiple characteristics), fiber arts,
emergency preparedness, and water safety. You know that foraging misidentification kills people.
You know that water filtration is a hierarchy (sediment, then carbon, then UV or chemical).
You know basic wilderness first aid. You never romanticize risk.
  `,
}

// ─────────────────────────────────────────────────────────────
// GENERATE PROJECT GUIDE
// ─────────────────────────────────────────────────────────────

export async function generateProjectGuide(
  input: ProjectGuideInput,
): Promise<ProjectGuide> {
  const model = genAI.getGenerativeModel({
    model:          'gemini-1.5-flash',
    systemInstruction: ROOTSTOCK_SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature:     0.4,   // Low: consistent, reliable output
      topP:            0.85,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  })

  const category    = getCategoryById(input.category)
  const subcategory = input.subcategory
    ? getSubcategoryById(input.category, input.subcategory)
    : null
  const catContext  = CATEGORY_CONTEXT[input.category] ?? ''
  const skillLevel  = input.skillLevel ?? 'intermediate'

  // ── Inventory / MacGuyver block ──
  let inventoryBlock = ''
  if (input.macguyver && input.inventory.length > 0) {
    inventoryBlock = `
MACGUYVER MODE — ACTIVE
The user already owns these items. Prioritize using them in your tool list and steps
where safe and practical. For each inventory item used, set macguyver_sub to explain
how it substitutes for the standard tool. If an inventory item is unsafe or inadequate
for this task, say so explicitly rather than recommending it.
User's inventory: ${input.inventory.join(' | ')}
    `
  } else if (input.macguyver) {
    inventoryBlock = `
MACGUYVER MODE — ACTIVE (no inventory on file)
Recommend the most commonly available household and farm tools. Suggest creative
substitutions where a specialty tool can be replaced by something most homesteaders own.
    `
  }

  // ── Skill calibration block ──
  const skillBlock = {
    beginner: `
SKILL LEVEL: BEGINNER
- Define every piece of jargon the first time you use it
- Explain WHY each step matters, not just what to do
- Flag the 3 most common beginner mistakes for this type of project
- Add a "stop and check" moment at least once in the steps
- Keep step details thorough — assume they've never done this before
    `,
    intermediate: `
SKILL LEVEL: INTERMEDIATE
- Assume familiarity with common hand and power tools
- Focus on technique and quality — the difference between okay and great results
- Include time-saving tips a pro would know
- Note where code compliance or permits may apply
    `,
    advanced: `
SKILL LEVEL: ADVANCED
- Peer-to-peer tone — they know the basics
- Discuss method trade-offs and why you're recommending this approach
- Include edge cases and failure modes to watch for
- Note where professional standards (UL, NEC, ASTM, etc.) are relevant
    `,
  }[skillLevel]

  const prompt = `
${catContext}

${inventoryBlock}
${skillBlock}

PROJECT REQUEST
Category: ${category?.label ?? input.category}
${subcategory ? `Subcategory: ${subcategory.label}` : ''}
User's description: "${input.description}"
${input.zipCode ? `User's location (ZIP): ${input.zipCode} — factor in regional considerations if relevant (climate, code requirements, soil type, etc.)` : ''}

Generate a complete, expert-level project guide. Think through safety first before
writing any steps. Ensure every step detail is specific and actionable.

Return a JSON object with EXACTLY this structure — no extra keys, no missing keys:

{
  "title": "Specific project title (8 words max, not generic)",
  "overview": "2–3 sentence expert summary of this project, what makes it complex, and the most important success factor.",
  "estimated_time": "Realistic total time range, e.g. '4–6 hours across 2 days' or 'Full weekend project'",
  "difficulty": "One of: Beginner-Friendly | Moderate | Challenging | Expert Only",

  "safety_checklist": [
    "Specific safety requirement with explanation of the actual hazard — not generic",
    "Minimum 4 items, maximum 8. Each item must be specific to THIS project."
  ],

  "tools_list": [
    {
      "name": "Exact tool or material name",
      "why": "Why this specific tool is needed for this specific project",
      "affiliate_search": "Brand + model search term, e.g. 'Marshalltown 14 inch brick trowel'",
      "quantity": "Specific quantity, e.g. '2 bags', '25 linear feet', '1 unit'",
      "macguyver_sub": "If MacGuyver mode: substitution from inventory, or empty string"
    }
  ],

  "steps": [
    {
      "number": 1,
      "title": "Action-oriented step title",
      "details": "Detailed, specific instructions. Include exact measurements, settings, temperatures, or techniques. Minimum 3 sentences per step. This is where your expertise shows.",
      "pro_tip": "Expert tip specific to this step that a beginner would never know — or empty string",
      "warning": "Step-level safety warning if this step has a specific hazard — or empty string",
      "time_estimate": "e.g. '20–30 minutes' — or empty string"
    }
  ],

  "pro_tips": [
    "Project-level expert tip 1 — something that changes the outcome significantly",
    "Project-level expert tip 2",
    "Project-level expert tip 3 — minimum 3, maximum 6"
  ],

  "when_to_call_pro": "Honest, specific assessment. Name the exact tasks that require a licensed professional and explain WHY (legal, safety, insurance). If the whole project is DIY-safe, say so confidently.",

  "seasonal_notes": "If timing matters for this project (frost dates, curing temps, breeding seasons, fire season, etc.) note it here — or empty string"
}
`.trim()

  try {
    const result = await model.generateContent(prompt)
    const text   = result.response.text().trim()
    return JSON.parse(text) as ProjectGuide
  } catch (err) {
    console.error('Gemini generate error:', err)
    throw new Error('Failed to generate project guide. Please try again.')
  }
}

// ─────────────────────────────────────────────────────────────
// FEEDBACK LOOP CHAT
// ─────────────────────────────────────────────────────────────

export async function chatFollowUp(
  projectContext: string,
  conversationHistory: ChatMessage[],
  newMessage:  string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `
${ROOTSTOCK_SYSTEM_PROMPT}

━━━ CHAT MODE RULES ━━━

You are in live feedback mode — the user is actively working on a project and has a
question or has hit a problem. Your job is to be the expert friend on the phone.

Response style in chat:
- Be direct and concise — they are in the middle of a job, not reading an essay
- Lead with the answer, then explain
- If they describe a problem, diagnose it systematically: ask one clarifying question
  if needed, or give the 2–3 most likely causes with solutions for each
- If they're about to do something dangerous, say STOP clearly before anything else
- Use line breaks generously — they may be reading on a phone with dirty hands
- If a step requires a professional, say so firmly and explain why
- Never make up specifications — if you don't know the exact torque spec or ampacity,
  say "I'd verify this in the manufacturer manual or local code" rather than guess
    `.trim(),
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature:     0.6,   // Slightly higher for natural conversation
      topP:            0.9,
      maxOutputTokens: 1024,
    },
  })

  // Build Gemini chat history format
  const history = conversationHistory.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({
    history: [
      {
        role:  'user',
        parts: [{ text: `I'm working on this project:\n\n${projectContext}\n\nI may have follow-up questions as I work through it.` }],
      },
      {
        role:  'model',
        parts: [{ text: "Got it — I've read through your project. Ask me anything as you work through it. I'm here." }],
      },
      ...history,
    ],
  })

  try {
    const result = await chat.sendMessage(newMessage)
    return result.response.text()
  } catch (err) {
    console.error('Gemini chat error:', err)
    throw new Error('Chat response failed. Please try again.')
  }
}

// ─────────────────────────────────────────────────────────────
// MACGUYVER MODE — Inventory analysis helper
// Analyzes user inventory and suggests substitutions before generation
// ─────────────────────────────────────────────────────────────

export async function analyzeInventoryForProject(
  projectDescription: string,
  category: string,
  inventory: string[],
): Promise<{ usable: string[]; gaps: string[]; notes: string }> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: ROOTSTOCK_SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature:      0.3,
      maxOutputTokens:  1024,
      responseMimeType: 'application/json',
    },
  })

  const prompt = `
Analyze this homesteader's inventory for the following project.

Project: ${projectDescription}
Category: ${category}
Inventory: ${inventory.join(', ')}

Return JSON:
{
  "usable": ["inventory items that can be directly used or substituted for this project"],
  "gaps": ["key tools or materials they will definitely need to acquire"],
  "notes": "One paragraph of honest MacGuyver analysis — what they can do with what they have, what they absolutely need, and any creative substitutions."
}
  `.trim()

  try {
    const result = await model.generateContent(prompt)
    return JSON.parse(result.response.text())
  } catch {
    return { usable: [], gaps: [], notes: '' }
  }
}

// ─────────────────────────────────────────────────────────────
// NEWSLETTER / WORKSHOP CONTENT GENERATOR
// For the monthly newsletter feature
// ─────────────────────────────────────────────────────────────

export async function generateNewsletterBlurb(
  topic: string,
  season: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: ROOTSTOCK_SYSTEM_PROMPT,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature:     0.75,  // Higher for creative writing
      maxOutputTokens: 600,
    },
  })

  const prompt = `
Write a 150–200 word newsletter blurb for Rootstock homesteaders about:
Topic: ${topic}
Season: ${season}

Tone: Like a trusted neighbor who knows a lot — warm, direct, no fluff.
Do not use bullet points. Write in paragraph form.
End with one specific actionable tip they can do this week.
  `.trim()

  const result = await model.generateContent(prompt)
  return result.response.text()
}
