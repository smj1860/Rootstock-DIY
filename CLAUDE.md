# Rootstock — Claude Code Session Brief
**Last updated:** April 2026  
**Project:** Rootstock — AI-Powered Homesteading Platform  
**Live URL:** (your Netlify URL)  
**Repo:** github.com/smj1860/Rootstock-DIY  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase · Gemini AI · Stripe · Netlify

---

## What Rootstock Is

Rootstock is an AI-powered homesteading platform that generates expert-level, step-by-step DIY guides for self-sufficiency projects — solar/off-grid, livestock, canning, plumbing, electrical, building, landscaping, and more. The core value proposition: actionable, structured guides generated in seconds by Gemini AI.

**Pricing:**
- Free tier: 2 projects
- Pro tier: $9/month — unlimited projects, MacGuyver Mode, build journal

---

## Design System — NEVER DEVIATE FROM THIS

### Colors
```css
--color-bg:        #F7F4EE   /* warm cream — page background */
--color-dark:      #1f3d0c   /* deep forest green — primary text, buttons */
--color-mid:       #3B6D11   /* medium green — hover states, accents */
--color-light:     #C0DD97   /* sage green — button text on dark bg */
--color-muted:     #6b6b58   /* warm gray — secondary text */
--color-brown:     #5C4A2A   /* brown — borders at low opacity */
--color-tan:       #A0845C   /* tan — tertiary accents */
```

### Typography
- **Display/Headings:** `font-serif` → Playfair Display (loaded via `next/font/google`)
- **Body/UI:** `font-sans` → DM Sans (loaded via `next/font/google`)
- Both fonts are set as CSS variables in `app/layout.tsx` — do not change

### Tailwind Component Classes (defined in `app/globals.css`)
```css
.input    — form inputs with green focus ring
.textarea — same as input, no resize
.label    — small uppercase-ish labels
.card     — white rounded card with subtle border and shadow
```

### UI Patterns
- Rounded corners: `rounded-xl` (inputs), `rounded-2xl` (cards), `rounded-3xl` (hero sections)
- Primary button: `bg-[#1f3d0c] text-[#C0DD97] hover:bg-[#3B6D11]`
- Secondary button: `bg-white text-[#1f3d0c] border border-[#5C4A2A]/15 hover:bg-[#EAF3DE]`
- Page max-width: `max-w-5xl` (wide) or `max-w-3xl` (content) or `max-w-2xl` (forms)

---

## Project File Structure

```
rootstock/
├── app/
│   ├── (app)/                    # Authenticated app routes
│   │   ├── layout.tsx            # App shell — needs sidebar/nav
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Project list dashboard
│   │   └── project/
│   │       ├── new/
│   │       │   └── page.tsx      # New project form
│   │       └── [id]/
│   │           └── page.tsx      # Guide display page
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          # Supabase OAuth callback
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Gemini guide generation endpoint
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Tailwind + design tokens
├── lib/
│   ├── ai.ts                     # All Gemini AI functions
│   ├── constants.ts              # Categories, subcategories, lookup fns
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       └── server.ts             # Server Supabase client
├── netlify/
│   └── functions/                # Netlify serverless functions
│       ├── subscribe.js          # Newsletter signup ✅ Working
│       ├── generate-guide.js     # Legacy guide gen (superseded by app/api/generate)
│       ├── find-contractors.js   # Google Places contractor lookup
│       ├── create-checkout-session.js  # Stripe checkout
│       ├── stripe-webhook.js     # Stripe webhook handler
│       └── config.js             # Public config endpoint
├── middleware.ts                 # Auth protection + redirects
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── package.json
```

---

## Supabase Database Tables

All tables exist in the `public` schema with RLS enabled:

| Table | Purpose |
|-------|---------|
| `projects` | User projects with guide JSON |
| `subscriptions` | Pro/free tier tracking |
| `profiles` | User profile data |
| `inventory_items` | MacGuyver mode inventory |
| `journal_entries` | Build journal entries |
| `project_messages` | Chat follow-up messages per project |
| `newsletter_subscribers` | Email waitlist/newsletter |
| `forum_posts` | Community forum |
| `forum_replies` | Forum replies |

### Critical SQL — Run in Supabase SQL Editor
```sql
-- Ensure projects table has all required columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS guide_json jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS steps jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS subcategory text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_complete boolean DEFAULT false;

-- Project messages table
CREATE TABLE IF NOT EXISTS project_messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own messages" ON project_messages
  FOR ALL USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier                   text DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  category   text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own inventory" ON inventory_items
  FOR ALL USING (auth.uid() = user_id);
```

---

## Environment Variables

### Netlify — All Must Be Set
```
NEXT_PUBLIC_SUPABASE_URL        — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   — Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY       — Supabase service role key (server only)
SUPABASE_URL                    — Same as NEXT_PUBLIC_SUPABASE_URL (for Netlify functions)
SUPABASE_ANON_KEY               — Same as NEXT_PUBLIC_SUPABASE_ANON_KEY (for Netlify functions)
SUPABASE_SERVICE_KEY            — Same as SUPABASE_SERVICE_ROLE_KEY (for Netlify functions)
GEMINI_API_KEY                  — Google AI Studio key
STRIPE_SECRET_KEY               — Stripe secret key (sk_live_...)
STRIPE_PRICE_ID                 — Stripe price ID for $9/month Pro plan
STRIPE_WEBHOOK_SECRET           — Stripe webhook signing secret
NEXT_PUBLIC_APP_URL             — Live Netlify URL
NODE_VERSION                    — 20
```

---

## Known Bugs — Fix These First

### BUG 1: Wrong redirect paths after login/signup (CRITICAL)
**Problem:** Code uses `/app/dashboard`, `/app/project/` etc. but Next.js route groups
strip the `(app)` folder — so the actual URL is `/dashboard`, `/project/` etc.
The `/app` prefix does not exist in the URL.

**Find and replace everywhere:**
```
WRONG:  /app/dashboard   →   CORRECT: /dashboard
WRONG:  /app/project/    →   CORRECT: /project/
WRONG:  /app/upgrade     →   CORRECT: /upgrade
WRONG:  /app/journal     →   CORRECT: /journal
WRONG:  /app/settings    →   CORRECT: /settings
```

**Files to audit and fix:**
- `app/(auth)/login/page.tsx` — `router.push('/app/dashboard')` → `/dashboard`
- `app/(auth)/signup/page.tsx` — same fix
- `middleware.ts` line 34 — redirect to `/dashboard` not `/app/dashboard`
- `app/(app)/layout.tsx` — all nav links
- `app/(app)/dashboard/page.tsx` — all internal links

### BUG 2: App layout missing proper navigation
**File:** `app/(app)/layout.tsx`
**Problem:** No sidebar or top nav for authenticated users.
**Fix:** Build proper app shell (see Task 2).

### BUG 3: Corrupted emoji in dashboard
**File:** `app/(app)/dashboard/page.tsx`
**Problem:** CATEGORY_ICONS object has corrupted UTF-8 emoji strings.
**Fix:** Replace the entire CATEGORY_ICONS object with:
```typescript
const CATEGORY_ICONS: Record<string, string> = {
  landscape: '🌿', cooking: '🍳', canning: '🫙', auto: '🔧',
  plumbing: '🚿', electrical: '⚡', solar: '☀️', livestock: '🐄',
  building: '🪵', other: '🌱',
}
```

---

## Tasks — Complete In This Order

### TASK 1: Fix all routing bugs
Fix every `/app/dashboard`, `/app/project/` reference. Run `npm run build` after.

### TASK 2: Build authenticated app shell layout
**File:** `app/(app)/layout.tsx`

Build a sidebar navigation layout. This is a server component.

Sidebar (background `#1f3d0c`, white/sage text):
- Rootstock logo + wordmark at top → links to `/dashboard`
- Nav items: Dashboard, New Project, Inventory, Journal, Settings
- Sign Out button at bottom → `supabase.auth.signOut()` then redirect to `/`
- Active state: `bg-[#3B6D11]` highlight on current route

Header bar (cream background, above content):
- Current page title (left)
- User email initial avatar (right, circle, `bg-[#C0DD97] text-[#1f3d0c]`)

Content area: cream `#F7F4EE` background, padding `p-6 md:p-8`

Mobile: collapsible hamburger menu or bottom tab bar.

### TASK 3: Redesign the landing page
**File:** `app/page.tsx`

Keep existing content and structure. Elevate the design:
- Larger, more dramatic hero headline with Playfair Display
- Background texture or subtle pattern on hero section
- More prominent email waitlist capture form
- "Join X,XXX homesteaders" social proof (use placeholder numbers)
- Category grid as visually rich cards with hover effects
- Stronger CTA sections
- Must be mobile responsive at 375px

Aesthetic direction: premium rural lifestyle meets serious SaaS. Warm, confident, expert.

### TASK 4: Improve guide generation loading experience
**File:** `app/(app)/project/new/page.tsx`

Replace the basic spinner with a multi-step loading experience:
- Cycle through messages every 5 seconds:
  1. "Analyzing your project..."
  2. "Consulting safety protocols..."
  3. "Writing your step-by-step guide..."
  4. "Adding expert tips and tool list..."
  5. "Finalizing your guide..."
- Show a progress indicator
- On error: clear message + retry button

### TASK 5: Build chat follow-up feature
**New file:** `app/api/chat/route.ts`
```typescript
// POST { projectId: string, message: string, history: ChatMessage[] }
// 1. Auth check
// 2. Fetch project from Supabase to get guide context
// 3. Call chatFollowUp() from lib/ai.ts
// 4. Save user message + AI reply to project_messages table
// 5. Return { reply: string }
```

**Update:** `app/(app)/project/[id]/page.tsx`
Add chat UI at the bottom of the guide page:
- Load existing messages from `project_messages` on page load
- Message bubbles: user = white/right, AI = green/left
- Input box + Send button at bottom
- "Ask a follow-up question about this project..." placeholder

### TASK 6: Stripe subscription flow
**New file:** `app/(app)/upgrade/page.tsx`

Show Free vs Pro comparison:
| Feature | Free | Pro |
|---------|------|-----|
| Projects | 2 | Unlimited |
| MacGuyver Mode | ❌ | ✅ |
| Build Journal | ❌ | ✅ |
| Chat Follow-up | ❌ | ✅ |
| Price | Free | $9/month |

"Upgrade to Pro" button → POST to `/.netlify/functions/create-checkout-session`
→ Redirect to Stripe Checkout
→ On return: show success, update UI

Review and fix `netlify/functions/create-checkout-session.js` and `stripe-webhook.js`.
The webhook must update `subscriptions` table with `tier: 'pro'` on successful payment.

**Stripe setup required:**
1. Create product at dashboard.stripe.com — $9/month recurring
2. Add Price ID to Netlify env as `STRIPE_PRICE_ID`
3. Add webhook endpoint + secret

### TASK 7: MacGuyver inventory manager
**New file:** `app/(app)/inventory/page.tsx`

- List current inventory items from `inventory_items` table
- Add items: text input, add one by one or comma-separated batch
- Display as tag chips with × delete button
- "Load my inventory" button on new project form pre-populates MacGuyver field

### TASK 8: Contractor referral integration
**Update:** `app/(app)/project/[id]/page.tsx`

Add "Find Local Contractors" section at bottom of guide:
- Shown only when `guide.when_to_call_pro` suggests professional help
- "Find contractors near me" button
- ZIP code input (pre-fill from user profile if available)
- Call `/.netlify/functions/find-contractors` with `{ category, zipCode }`
- Display contractor cards: name, rating, address, phone number
- Requires `GOOGLE_PLACES_API_KEY` in Netlify env vars

---

## After Each Task

```bash
npm run build          # Fix any TypeScript errors locally first
git add .
git commit -m "feat: [description of what you built]"
git push               # Netlify auto-deploys from main branch
```

Check Netlify deploy log — confirm green before moving to next task.

---

## Key Principles

- **Never break the design system** — use only the established color tokens and font variables
- **TypeScript strict mode is on** — all types must be explicit
- **Tailwind only** — no additional CSS libraries
- **Server components by default** — only add `'use client'` when you need interactivity
- **Supabase RLS** — every new table needs RLS enabled and policies
- **Mobile first** — test at 375px minimum width
- **Run `npm run build` before every push** — never push broken code

---

## AI Functions Available in lib/ai.ts

| Function | Purpose |
|----------|---------|
| `generateProjectGuide(input)` | Main guide generation |
| `chatFollowUp(context, history, message)` | Follow-up chat |
| `analyzeInventoryForProject(desc, cat, inventory)` | MacGuyver analysis |
| `generateNewsletterBlurb(topic, season)` | Newsletter content |

Gemini model: `gemini-1.5-flash` — free tier: 1,500 requests/day.

---

## Good luck, Claude Code. The foundation is solid — now make it great.
