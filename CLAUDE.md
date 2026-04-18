# CLAUDE.md — Rootstock
> Read this file at the start of every session. This is the single source of truth for the Rootstock project.

---

## 1. WHAT ROOTSTOCK IS

Rootstock is an **AI-powered homesteading platform** that gives users expert-level, step-by-step DIY guidance for homesteading and self-sufficiency projects. Think of it as the "instant expert neighbor" — someone who can walk you through wiring a solar panel, canning tomatoes, fixing a tractor engine, or raising your first flock, right now, tailored to your skill level.

**Core product promise:** Real answers, not search results. Actionable guides in seconds, not hours of research.

**Target user:** Rural and suburban American homeowners aged 28–55 who want to build, grow, fix, and maintain their own land — but who often lack the generational knowledge that used to get passed down in person.

---

## 2. TECH STACK (CONFIRMED)

| Layer | Tool | Notes |
|---|---|---|
| Hosting & Serverless | **Netlify** | Static site + Netlify Functions for backend logic |
| Database & Auth | **Supabase** | Postgres, Row Level Security, Auth, Storage |
| AI / Guide Generation | **Google Gemini API** | Free tier to start (Gemini 2.0 Flash); upgrade path to paid |
| Payments | **Stripe** | Subscriptions: Free tier + $9/month Pro tier |
| Frontend | **Vanilla HTML/CSS/JS** | No framework; Playfair Display + DM Sans typography |

> **Drizzle ORM** was previously considered as a TypeScript ORM layer on top of Supabase Postgres. It's lightweight and avoids Prisma cold-start issues in serverless. It is NOT confirmed in the current stack — use Supabase JS client (`@supabase/supabase-js`) directly for now.
>
> **Resend** was previously considered for transactional email (confirmations, newsletter). NOT confirmed. Use Supabase's built-in Auth emails for now; revisit Resend when newsletter/email automation is needed.

---

## 3. DESIGN SYSTEM (DO NOT DEVIATE)

### Typography
- **Display / Headings:** `Playfair Display` (Google Fonts) — weights 400, 500, 600
- **Body / UI:** `DM Sans` (Google Fonts) — weights 300, 400, 500
- Always import both from Google Fonts in every HTML page

### Color Palette (CSS variables)
```css
:root {
  --green-deep:  #1f3d0c;   /* Primary dark — nav, headers, dark backgrounds */
  --green-mid:   #3B6D11;   /* Primary brand green — buttons, accents, links */
  --green-light: #C0DD97;   /* Light accent — icon fills, badges on dark BG */
  --green-pale:  #EAF3DE;   /* Pale tint — hover states, subtle backgrounds */
  --cream:       #F7F4EE;   /* Page background */
  --bark:        #5C4A2A;   /* Brown accent — borders, earthy details */
  --bark-light:  #A0845C;   /* Muted brown — secondary text, labels */
  --text:        #1a1a14;   /* Primary text */
  --muted:       #6b6b58;   /* Secondary / body text */
  --border:      rgba(92,74,42,0.14); /* Subtle border color */
}
```

### Logo SVG (use verbatim — do not recreate)
```html
<!-- Large format (about page, media kit) -->
<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 6 C22 6 13 14 13 24 C13 30 17 34 22 36 C27 34 31 30 31 24 C31 14 22 6 22 6Z" fill="#C0DD97"/>
  <path d="M22 36 L22 42" stroke="#C0DD97" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M22 30 C22 30 16 27 12 29" stroke="#C0DD97" stroke-width="2" stroke-linecap="round"/>
  <path d="M22 33 C22 33 27 30 31 32" stroke="#C0DD97" stroke-width="2" stroke-linecap="round"/>
  <path d="M22 10 L22 34" stroke="#3B6D11" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
</svg>

<!-- Small format (nav, favicon) -->
<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 3 C11 3 7 7 7 12 C7 15 9 17 11 18 C13 17 15 15 15 12 C15 7 11 3 11 3Z" fill="#C0DD97"/>
  <path d="M11 18 L11 21" stroke="#C0DD97" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M11 15 C11 15 8 13 6 14" stroke="#C0DD97" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M11 17 C11 17 13.5 15 15.5 16" stroke="#C0DD97" stroke-width="1.2" stroke-linecap="round"/>
</svg>
```

### UI Patterns
- Buttons: `background: #3B6D11; color: #EAF3DE; border-radius: 8px; font-size: 15px; font-weight: 500;`
- Cards: `background: white; border: 0.5px solid var(--border); border-radius: 12–16px;`
- Section labels: `font-size: 11px; font-weight: 500; letter-spacing: 0.14em; color: var(--green-mid); text-transform: uppercase;`
- Dark accent cards: `background: var(--green-deep); border-radius: 16px; color: var(--green-light);`

---

## 4. PAGES BUILT (DO NOT REBUILD FROM SCRATCH)

| File | Status | Description |
|---|---|---|
| `rootstock_landing_page_v2.html` | ✅ Complete | Landing page with email waitlist CTA, features, categories, partners, footer |
| `rootstock-about.html` | ✅ Complete | About page with full brand treatment, Playfair Display |
| `rootstock-media-kit.html` | ✅ Complete | Full media/affiliate kit — audience stats, category affiliate map, partnership tiers |

These files live in the project root. They share the design system above. The landing page email form currently uses a placeholder endpoint — needs connection to an email provider (Mailchimp, Beehiiv, or ConvertKit; undecided).

---

## 5. DATABASE SCHEMA (SUPABASE POSTGRES)

A 16-table schema has been designed across 5 domains. Here is the full architecture:

### Domain 1: Users & Auth
- `profiles` — extends Supabase `auth.users`; stores display name, avatar, zip code, skill level (`beginner` / `intermediate` / `advanced`), subscription tier (`free` / `pro`), project count (enforces free tier limit)
- `user_preferences` — notification settings, newsletter opt-in, preferred categories

### Domain 2: Inventory
- `inventory_items` — tools and supplies a user owns; fields: name, category, condition, quantity, notes, optional image URL
- `inventory_images` — Supabase Storage references for uploaded inventory photos

### Domain 3: Projects & AI Guides
- `categories` — the 10 top-level homesteading categories (seeded data)
- `subcategories` — 70+ subcategories linked to categories (seeded data)
- `projects` — a user's saved project; links to subcategory, stores the user's original question/prompt, skill level at time of generation, zip code at time of generation
- `guide_outputs` — the full AI-generated guide stored as JSONB with this structure:
```json
{
  "safety_checklist": ["item1", "item2"],
  "tools_and_materials": [
    { "item": "name", "notes": "why needed", "affiliate_url": "optional" }
  ],
  "steps": [
    { "step_number": 1, "title": "Step title", "instructions": "...", "pro_tip": "optional" }
  ],
  "macguyver_substitutions": [
    { "standard_item": "item", "substitute": "what user has", "notes": "how to adapt" }
  ],
  "contractor_note": "When to call a pro instead",
  "estimated_time": "2–4 hours",
  "difficulty": "intermediate"
}
```
- `guide_feedback` — user thumbs up/down and notes per guide

### Domain 4: Build Journal (Pro only)
- `journal_entries` — linked to a project; title, body text (markdown), date
- `journal_images` — Supabase Storage references for build photos

### Domain 5: Community & Content
- `forum_posts` — title, body, category tag, author, created_at
- `forum_replies` — threaded replies to posts
- `tool_reviews` — user-submitted tool reviews; tool name, rating (1–5), pros, cons, verified_purchase flag
- `newsletter_subscribers` — email, confirmed (boolean), source tag (landing page / in-app / referral)

### Supabase RLS Policy Summary
- All tables enforce Row Level Security
- Users can only read/write their own rows (profiles, inventory, projects, journal, guide_feedback)
- Forum posts and tool reviews are readable by all authenticated users
- Newsletter subscribers table is restricted to service-role only (server-side inserts)
- An auth trigger (`handle_new_user`) auto-creates a `profiles` row on signup
- Supabase Storage: two buckets — `inventory-images` (private, user-scoped) and `journal-images` (private, user-scoped)

### Supabase Project Info
- Project URL: stored in env as `SUPABASE_URL`
- Anon key: stored in env as `SUPABASE_ANON_KEY`
- Service role key: stored in env as `SUPABASE_SERVICE_KEY` (server-side only, never exposed to client)
- Database password: stored securely in env as `SUPABASE_DB_PASSWORD`

---

## 6. PRODUCT TIERS & FEATURE GATES

### Free Tier
- 2 AI project guides total (lifetime, not per month)
- Access to all 10 categories
- Inventory (text input only, no image upload)
- Basic forum access (read + post)
- No MacGuyver mode
- No build journal

### Pro Tier — $9/month (via Stripe)
- Unlimited AI project guides
- **MacGuyver mode** (see Section 8)
- Inventory with image uploads (Supabase Storage)
- Build journal with photo uploads
- Full forum access
- Access to monthly/quarterly workshops
- Tool reviews and comparisons
- Newsletter

### Enforcement
- `profiles.project_count` increments on each guide generation
- Netlify Function checks `profiles.subscription_tier` and `project_count` before calling Gemini API
- Stripe webhook updates `profiles.subscription_tier` on payment success/cancellation

---

## 7. AI GUIDE GENERATION — NETLIFY FUNCTION

**File:** `netlify/functions/generate-guide.js`

**Trigger:** POST request from the app with:
```json
{
  "question": "How do I install a 200-amp solar panel system on my cabin?",
  "category": "solar",
  "subcategory": "solar-panel-installation",
  "skill_level": "intermediate",
  "zip_code": "35661",
  "macguyver_mode": false,
  "inventory_items": []
}
```

**Auth:** Extract Supabase JWT from `Authorization: Bearer <token>` header. Verify with Supabase service client. Fetch user profile to check tier and project count.

**Guard logic:**
1. If no valid JWT → 401
2. If `subscription_tier === 'free'` AND `project_count >= 2` → 403 with upgrade prompt
3. If `macguyver_mode === true` AND `subscription_tier !== 'pro'` → 403

**Gemini API call:**
- Model: `gemini-2.0-flash` (free tier) — upgrade to `gemini-1.5-pro` for paid
- Use `@google/generative-ai` npm package
- Env var: `GEMINI_API_KEY`

---

## 8. THE MASTER AI PROMPT (use this exactly in the Netlify Function)

```
You are Rootstock, an expert AI homesteading assistant with deep practical knowledge across all areas of rural and suburban self-sufficiency. You have the combined wisdom of a master electrician, master plumber, experienced farmer, skilled carpenter, expert canner, solar installer, mechanic, and seasoned homesteader. You speak plainly, like a knowledgeable neighbor — never condescending, always practical.

Your task is to generate a complete, actionable project guide for the following request:

PROJECT: {question}
CATEGORY: {category}
SUBCATEGORY: {subcategory}
USER SKILL LEVEL: {skill_level}
USER LOCATION (ZIP): {zip_code}
MACGUYVER MODE: {macguyver_mode}
USER INVENTORY: {inventory_items_list}

Generate your response as a single valid JSON object matching this exact schema — no markdown, no preamble, no explanation outside the JSON:

{
  "project_title": "Clear, specific title for this project",
  "estimated_time": "e.g. 4–6 hours over 2 days",
  "difficulty": "beginner | intermediate | advanced",
  "overview": "2–3 sentence plain-English summary of what the user is doing and why",
  "safety_checklist": [
    "Specific safety precaution or required PPE item",
    "..."
  ],
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
      "instructions": "Clear, detailed instructions. Assume the user is competent but not an expert. Include measurements, settings, and specific techniques. If skill_level is beginner, add more foundational explanation. If advanced, be more concise and technical.",
      "pro_tip": "Optional expert insight, common mistake to avoid, or time-saving trick. Null if not applicable.",
      "warning": "Optional safety warning specific to this step. Null if not applicable."
    }
  ],
  "macguyver_substitutions": [
    {
      "standard_item": "The item typically needed",
      "user_has": "Item from user inventory that can substitute",
      "substitution_notes": "How to adapt the technique to use this substitute, including any limitations"
    }
  ],
  "when_to_call_a_pro": "Honest, specific guidance on which parts of this project — if any — should be handled by a licensed professional, and why. If the entire project is DIY-safe, say so clearly.",
  "regional_note": "Optional: Any region-specific consideration based on the user's zip code (climate zone, local code requirements, frost dates, etc.). Null if not applicable.",
  "next_steps": [
    "Suggested follow-on project or maintenance task related to this project"
  ]
}

IMPORTANT RULES:
- Safety checklist must come FIRST — never skip it, even for simple projects
- Tailor step detail to the stated skill_level — beginner steps are longer and more explanatory; advanced steps are technical and concise
- tools_and_materials must be specific (brand/spec where it matters) — never generic
- If macguyver_mode is true AND inventory_items is not empty, you MUST attempt to incorporate items from the user's inventory into macguyver_substitutions. If an inventory item cannot reasonably substitute for anything, omit it. If macguyver_mode is false, return an empty array for macguyver_substitutions.
- Be honest in when_to_call_a_pro — do not minimize real electrical, structural, or code-compliance risks
- Return ONLY the JSON object. No markdown fences, no commentary.
```

---

## 9. MACGUYVER MODE (Pro Feature)

MacGuyver mode modifies guide generation to incorporate items from the user's personal inventory as substitutes for standard tools/materials. 

**How it works:**
1. User has a saved inventory of tools and supplies they own
2. Before generating a guide, fetch `inventory_items` for the user from Supabase
3. Pass the inventory list into the Gemini prompt as `{inventory_items_list}` (formatted as a plain text list: "- [item name]: [notes/condition]")
4. The prompt instructs Gemini to match inventory items to `macguyver_substitutions`
5. The UI displays substitutions with a wrench icon and "Using what you have:" label

**Fallback behavior:** If no inventory items are relevant, the `macguyver_substitutions` array is empty and the UI hides that section. If the user has no inventory at all, MacGuyver mode still runs but returns empty substitutions — never errors.

---

## 10. CONTRACTOR REFERRAL (Pro Feature)

After a guide is generated, Pro users see a "Find a Local Pro" section.

**Implementation:**
- Use **Google Places API** (free tier has generous limits)
- Search query: `{subcategory} contractor near {zip_code}`
- Display top 3 results: name, rating, phone, website link
- Netlify Function: `netlify/functions/find-contractors.js`
- Env var: `GOOGLE_PLACES_API_KEY`

**Fallback:** If Google Places returns no results or API fails, show a static message: "We couldn't find local pros automatically. Try searching [Angi.com](https://angi.com) or [HomeAdvisor.com](https://homeadvisor.com) for licensed contractors in your area."

---

## 11. STRIPE INTEGRATION

- **Products:** One product — "Rootstock Pro", $9/month recurring
- **Checkout:** Use Stripe Checkout hosted page (simplest, most secure)
- **Netlify Functions:**
  - `netlify/functions/create-checkout-session.js` — creates Stripe Checkout session, redirects user
  - `netlify/functions/stripe-webhook.js` — listens for `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_failed` events; updates `profiles.subscription_tier` in Supabase
- **Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Customer portal:** Enable Stripe's hosted billing portal for users to manage/cancel subscriptions

---

## 12. PROJECT FOLDER STRUCTURE

```
rootstock/
├── CLAUDE.md                          ← This file
├── netlify.toml                       ← Netlify build config
├── package.json                       ← Node deps for Netlify Functions
├── .env                               ← Local env vars (gitignored)
├── .gitignore
│
├── public/                            ← Static frontend
│   ├── index.html                     ← Landing page (from rootstock_landing_page_v2.html)
│   ├── about.html
│   ├── media-kit.html
│   ├── app/
│   │   ├── index.html                 ← Main app dashboard (auth required)
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── project.html               ← Guide generation + output page
│   │   ├── inventory.html             ← Inventory manager
│   │   ├── journal.html               ← Build journal (Pro)
│   │   ├── forum.html
│   │   └── settings.html
│   ├── css/
│   │   └── rootstock.css              ← Global styles / design system
│   └── js/
│       ├── auth.js                    ← Supabase auth helpers
│       ├── api.js                     ← Fetch wrappers for Netlify Functions
│       └── app.js                     ← App initialization
│
├── netlify/
│   └── functions/
│       ├── generate-guide.js          ← AI guide generation (Gemini)
│       ├── find-contractors.js        ← Google Places contractor lookup
│       ├── create-checkout-session.js ← Stripe Checkout
│       └── stripe-webhook.js          ← Stripe webhook handler
│
├── supabase/
│   ├── schema.sql                     ← Full 16-table schema DDL
│   ├── rls.sql                        ← All RLS policies
│   └── seed.sql                       ← Categories and subcategories seed data
│
└── docs/
    ├── rootstock-about.html
    └── rootstock-media-kit.html
```

---

## 13. ENVIRONMENT VARIABLES

All env vars go in `.env` locally and in Netlify dashboard under Site Settings → Environment Variables.

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key   # Server-side only

# Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...   # The $9/month price ID

# Google Places
GOOGLE_PLACES_API_KEY=your-places-api-key

# App
APP_URL=https://rootstockapp.com             # or localhost:8888 for dev
```

---

## 14. CATEGORIES & SUBCATEGORIES (SEEDED DATA)

These are the 10 confirmed top-level categories and their subcategories. This is seeded into the `categories` and `subcategories` tables.

```
1. Landscape & Gardening
   - Raised bed & container gardens
   - Soil & composting
   - Irrigation & watering systems
   - Fruit trees & food forests
   - Pest & weed control
   - Greenhouse & cold frames
   - Lawn care & pasture
   - Seed saving & propagation

2. Cooking & Baking
   - Cast iron & wood stove cooking
   - Bread & sourdough baking
   - Fermentation & cultures
   - Outdoor & open-fire cooking
   - Dairy — butter, cheese, yogurt
   - Meal planning from scratch
   - Dehydrating & drying food

3. Canning & Preservation
   - Water bath canning
   - Pressure canning
   - Pickling & brining
   - Jams, jellies & preserves
   - Freezing & vacuum sealing
   - Root cellar & cold storage
   - Smoking & curing meats

4. Auto & Small Engine Repair
   - Tractors & farm equipment
   - ATVs & UTVs
   - Generators & engines
   - Chainsaws & power tools
   - Lawn mowers & tillers
   - Trucks & trailers
   - Welding & metalwork

5. Plumbing
   - Well systems & pumps
   - Pipe repair & replacement
   - Water heater install & repair
   - Irrigation & outdoor lines
   - Septic & greywater systems
   - Rainwater harvesting
   - Fixtures & faucets

6. Electrical
   - Panel upgrades & breakers
   - Outlets, switches & wiring
   - Generator hookups & transfer switches
   - Outbuilding & barn wiring
   - Low-voltage & lighting
   - EV & equipment charging

7. Solar & Off-Grid Energy
   - Solar panel installation
   - Battery banks & storage
   - Inverters & charge controllers
   - Wind & micro-hydro power
   - Off-grid cabin power systems
   - Propane & backup fuel systems
   - Energy efficiency & insulation

8. Animals & Livestock
   - Chickens & poultry
   - Goats & sheep
   - Cattle & pigs
   - Rabbits & small animals
   - Beekeeping
   - Fencing & pasture management
   - Barn & shelter building
   - Animal health & first aid

9. Building & Renovation
   - Sheds & outbuildings
   - Fencing & gates
   - Decks & porches
   - Roofing & gutters
   - Framing & foundations
   - Flooring & interior finishes
   - Concrete & masonry
   - Insulation & weatherproofing

10. Other Self-Sufficiency
    - Herbal medicine & first aid
    - Hunting & fishing
    - Foraging & wild edibles
    - Fiber arts — spinning & weaving
    - Candle & soap making
    - Water filtration & storage
    - Emergency preparedness
    - Natural building materials
```

---

## 15. AFFILIATE STRATEGY

Affiliate links appear **inside tool lists** in generated guides — this is the natural, non-intrusive placement. Each `tools_and_materials` item can have an affiliate URL attached. This is populated in post-processing after Gemini returns the guide, based on item category matching.

### Affiliate Partner Targets (not yet connected — future milestone)
- **General:** Amazon (Associates), Home Depot, Tractor Supply Co.
- **Specialized / High-commission:** Renogy Solar, EcoFlow, Bluetti, Harvest Right Freeze Dryers, Lehman's, Northern Tool + Equipment, Mann Lake Beekeeping, Lodge Cast Iron, Cultures for Health

### Affiliate Network
- Primary network: **Impact** (impact.com)
- FTC disclosure is present on every page (already in landing page and about page footers)

---

## 16. KEY DECISIONS (DO NOT REVISIT WITHOUT GOOD REASON)

| Decision | Choice | Why |
|---|---|---|
| ORM | Supabase JS client directly | Drizzle/Prisma add complexity; JS client is sufficient at this scale |
| AI provider | Google Gemini | Free tier is generous; Gemini 2.0 Flash is fast and capable |
| Auth | Supabase Auth | Built-in, no extra service needed |
| Email (transactional) | Supabase built-in auth emails | Sufficient for now; revisit Resend when newsletter automation is needed |
| Hosting | Netlify | Free tier covers static + serverless functions; easy Supabase integration |
| Payments | Stripe | Industry standard; excellent docs and webhook reliability |
| Frontend framework | Vanilla HTML/CSS/JS | No build step, no framework overhead, fastest to ship |
| Contractor lookup | Google Places API | Free tier is generous; covers most use cases |

---

## 17. CURRENT STATUS & WHAT TO BUILD NEXT

### ✅ Done
- Landing page (`public/index.html`)
- About page (`public/about.html`)
- Media kit (`docs/rootstock-media-kit.html`)
- Full database schema designed (16 tables, 5 domains)
- RLS policies designed
- Brand/design system locked

### 🔲 Immediate Next Steps (in order)
1. **`netlify.toml`** — scaffold Netlify config
2. **`package.json`** — add `@supabase/supabase-js`, `@google/generative-ai`, `stripe` dependencies
3. **`supabase/schema.sql`** — write and run the DDL to create all 16 tables in Supabase
4. **`supabase/rls.sql`** — write and apply RLS policies + auth trigger
5. **`supabase/seed.sql`** — insert all 10 categories and 70+ subcategories
6. **`netlify/functions/generate-guide.js`** — the core AI guide generation function
7. **`public/css/rootstock.css`** — extract design system into shared stylesheet
8. **`public/app/login.html` + `signup.html`** — auth pages using Supabase Auth
9. **`public/app/index.html`** — main app dashboard
10. **`public/app/project.html`** — guide generation UI + output display
11. **`netlify/functions/create-checkout-session.js`** — Stripe integration
12. **`netlify/functions/stripe-webhook.js`** — Stripe webhook handler
13. **`public/app/inventory.html`** — inventory manager
14. **`netlify/functions/find-contractors.js`** — contractor lookup
15. **Email capture** — connect landing page form to Mailchimp/Beehiiv/ConvertKit

### 🔮 Later Milestones
- Build journal (Pro feature)
- Forum
- Tool reviews & comparisons
- Workshop feature
- Newsletter automation
- Affiliate link matching engine

---

## 18. CODING STANDARDS

- **JavaScript:** ES modules where possible in Netlify Functions (`type: module` or CommonJS `.cjs` — check Netlify docs for current recommendation)
- **Error handling:** All Netlify Functions must return proper HTTP status codes (200, 400, 401, 403, 500) with a JSON body `{ error: "message" }` on failure
- **Auth pattern:** Always verify JWT server-side in every protected Netlify Function using the Supabase service client — never trust client-side claims
- **Env vars:** Never hardcode keys. Always use `process.env.VARIABLE_NAME`. Fail loudly if required env vars are missing.
- **CSS:** Use the design system CSS variables exclusively. Never hardcode hex colors that exist as variables.
- **Comments:** Comment non-obvious logic. Keep functions short and single-purpose.

---

*Last updated: April 2026. Generated from full Rootstock project context.*
