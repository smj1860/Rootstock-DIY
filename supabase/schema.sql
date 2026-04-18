-- ═══════════════════════════════════════════════════════════════
-- schema.sql — Rootstock full 16-table schema
-- Run this in the Supabase SQL editor (Dashboard → SQL editor)
-- ═══════════════════════════════════════════════════════════════

-- Enable pgcrypto for gen_random_uuid() (already available in Supabase)
-- No extensions needed — uuid_generate_v4() is available by default.


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 1: USERS & AUTH
-- ─────────────────────────────────────────────────────────────────

-- profiles — extends auth.users (auto-created via trigger in rls.sql)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name       TEXT,
  avatar_url         TEXT,
  zip_code           TEXT,
  skill_level        TEXT        NOT NULL DEFAULT 'beginner'
                                 CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  subscription_tier  TEXT        NOT NULL DEFAULT 'free'
                                 CHECK (subscription_tier IN ('free', 'pro')),
  project_count      INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_preferences — notification and newsletter settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  newsletter_opt_in    BOOLEAN     NOT NULL DEFAULT FALSE,
  email_notifications  BOOLEAN     NOT NULL DEFAULT TRUE,
  preferred_categories TEXT[]      DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 2: INVENTORY
-- ─────────────────────────────────────────────────────────────────

-- inventory_items — tools and supplies the user owns
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  category   TEXT,                          -- e.g. 'hand tools', 'power tools', 'supplies'
  condition  TEXT        DEFAULT 'good'
             CHECK (condition IN ('new', 'good', 'fair', 'worn')),
  quantity   TEXT        DEFAULT '1',       -- stored as text ('3', '1 roll', 'as needed')
  notes      TEXT,
  image_url  TEXT,                          -- points to inventory-images bucket
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- inventory_images — Supabase Storage refs for uploaded photos
CREATE TABLE IF NOT EXISTS public.inventory_images (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID        NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,        -- path in 'inventory-images' bucket
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 3: PROJECTS & AI GUIDES
-- ─────────────────────────────────────────────────────────────────

-- categories — 10 top-level homesteading categories (seeded in seed.sql)
CREATE TABLE IF NOT EXISTS public.categories (
  id         TEXT        PRIMARY KEY,       -- slug: 'landscape', 'solar', etc.
  label      TEXT        NOT NULL,
  icon       TEXT,                          -- emoji or icon name
  sort_order INTEGER     NOT NULL DEFAULT 0
);

-- subcategories — 70+ entries linked to categories (seeded in seed.sql)
CREATE TABLE IF NOT EXISTS public.subcategories (
  id          TEXT        PRIMARY KEY,      -- slug: 'solar-panel-installation'
  category_id TEXT        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  label       TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0
);

-- projects — a user's saved project / guide request
CREATE TABLE IF NOT EXISTS public.projects (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question       TEXT        NOT NULL,      -- the user's original prompt
  category       TEXT        NOT NULL REFERENCES public.categories(id),
  subcategory    TEXT        REFERENCES public.subcategories(id),
  skill_level    TEXT        NOT NULL DEFAULT 'intermediate'
                             CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  zip_code       TEXT,
  macguyver_mode BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- guide_outputs — full AI-generated guide stored as JSONB
-- Schema mirrors the Gemini response: project_title, safety_checklist, tools_and_materials,
-- steps, macguyver_substitutions, when_to_call_a_pro, regional_note, next_steps
CREATE TABLE IF NOT EXISTS public.guide_outputs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  guide_json  JSONB       NOT NULL,
  model_used  TEXT        NOT NULL DEFAULT 'gemini-2.0-flash',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id)   -- one guide per project (regeneration replaces)
);

-- guide_feedback — user thumbs up/down + optional notes
CREATE TABLE IF NOT EXISTS public.guide_feedback (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating IN (1, -1)),  -- 1 = thumbs up, -1 = down
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 4: BUILD JOURNAL (Pro only)
-- ─────────────────────────────────────────────────────────────────

-- journal_entries — build journal posts linked to a project
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,          -- markdown
  entry_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- journal_images — Supabase Storage refs for build photos
CREATE TABLE IF NOT EXISTS public.journal_images (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id     UUID        NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,        -- path in 'journal-images' bucket
  caption      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 5: COMMUNITY & CONTENT
-- ─────────────────────────────────────────────────────────────────

-- forum_posts — community posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  body         TEXT        NOT NULL,
  category_tag TEXT        REFERENCES public.categories(id),
  is_pinned    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- forum_replies — threaded replies to posts
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID        NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tool_reviews — user-submitted tool reviews
CREATE TABLE IF NOT EXISTS public.tool_reviews (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_name         TEXT        NOT NULL,
  brand             TEXT,
  rating            SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  pros              TEXT,
  cons              TEXT,
  review_body       TEXT,
  verified_purchase BOOLEAN     NOT NULL DEFAULT FALSE,
  category_tag      TEXT        REFERENCES public.categories(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- newsletter_subscribers — email waitlist / newsletter signups
-- Insert is service-role only (never from the client directly)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL UNIQUE,
  confirmed    BOOLEAN     NOT NULL DEFAULT FALSE,
  source       TEXT        DEFAULT 'landing-page'
               CHECK (source IN ('landing-page', 'in-app', 'referral')),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────────
-- INDEXES (query-path optimizations)
-- ─────────────────────────────────────────────────────────────────

-- Projects per user (dashboard listing)
CREATE INDEX IF NOT EXISTS idx_projects_user_id        ON public.projects(user_id);
-- Guide lookup by project
CREATE INDEX IF NOT EXISTS idx_guide_outputs_project   ON public.guide_outputs(project_id);
-- Inventory per user
CREATE INDEX IF NOT EXISTS idx_inventory_user_id       ON public.inventory_items(user_id);
-- Journal entries per user + project
CREATE INDEX IF NOT EXISTS idx_journal_user_id         ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_project_id      ON public.journal_entries(project_id);
-- Forum posts by category
CREATE INDEX IF NOT EXISTS idx_forum_posts_category    ON public.forum_posts(category_tag);
-- Subcategories by parent category
CREATE INDEX IF NOT EXISTS idx_subcategories_category  ON public.subcategories(category_id);


-- ─────────────────────────────────────────────────────────────────
-- updated_at TRIGGER FUNCTION
-- Automatically sets updated_at = NOW() on any row update
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Attach trigger to all tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'user_preferences', 'inventory_items',
    'projects', 'journal_entries', 'forum_posts', 'forum_replies'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;
