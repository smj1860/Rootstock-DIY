-- ═══════════════════════════════════════════════════════════════
-- rls.sql — Row Level Security policies + auth trigger
-- Run AFTER schema.sql
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────
-- AUTH TRIGGER — auto-create profiles row on new user signup
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_outputs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_feedback         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 1: USERS & AUTH
-- ─────────────────────────────────────────────────────────────────

-- profiles: users see and edit only their own row
CREATE POLICY "profiles: own row read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: own row update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_preferences: own row only
CREATE POLICY "prefs: own row read"   ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "prefs: own row insert" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "prefs: own row update" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "prefs: own row delete" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 2: INVENTORY
-- ─────────────────────────────────────────────────────────────────

-- inventory_items: own rows only
CREATE POLICY "inventory: own read"   ON public.inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inventory: own insert" ON public.inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inventory: own update" ON public.inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "inventory: own delete" ON public.inventory_items FOR DELETE USING (auth.uid() = user_id);

-- inventory_images: own rows only
CREATE POLICY "inv_images: own read"   ON public.inventory_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "inv_images: own insert" ON public.inventory_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "inv_images: own delete" ON public.inventory_images FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 3: PROJECTS & AI GUIDES
-- ─────────────────────────────────────────────────────────────────

-- categories: readable by all authenticated users (seeded reference data)
CREATE POLICY "categories: authenticated read" ON public.categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- subcategories: readable by all authenticated users
CREATE POLICY "subcategories: authenticated read" ON public.subcategories
  FOR SELECT USING (auth.role() = 'authenticated');

-- projects: own rows only
CREATE POLICY "projects: own read"   ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects: own insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects: own delete" ON public.projects FOR DELETE USING (auth.uid() = user_id);
-- Note: projects are not updated directly — guide_outputs is the separate table

-- guide_outputs: readable if the user owns the parent project
CREATE POLICY "guide_outputs: own project read" ON public.guide_outputs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = guide_outputs.project_id AND p.user_id = auth.uid()
    )
  );
-- Insert/update is service-role only (done via Netlify Function using service key)

-- guide_feedback: own rows only
CREATE POLICY "feedback: own read"   ON public.guide_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "feedback: own insert" ON public.guide_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "feedback: own update" ON public.guide_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "feedback: own delete" ON public.guide_feedback FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 4: BUILD JOURNAL
-- ─────────────────────────────────────────────────────────────────

-- journal_entries: own rows only
CREATE POLICY "journal: own read"   ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal: own insert" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal: own update" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal: own delete" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- journal_images: own rows only
CREATE POLICY "j_images: own read"   ON public.journal_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "j_images: own insert" ON public.journal_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "j_images: own delete" ON public.journal_images FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────
-- DOMAIN 5: COMMUNITY & CONTENT
-- ─────────────────────────────────────────────────────────────────

-- forum_posts: readable by all authenticated; writable by owner
CREATE POLICY "forum_posts: authenticated read" ON public.forum_posts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "forum_posts: own insert" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_posts: own update" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "forum_posts: own delete" ON public.forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- forum_replies: readable by all authenticated; writable by owner
CREATE POLICY "forum_replies: authenticated read" ON public.forum_replies
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "forum_replies: own insert" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_replies: own update" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "forum_replies: own delete" ON public.forum_replies
  FOR DELETE USING (auth.uid() = user_id);

-- tool_reviews: readable by all authenticated; writable by owner
CREATE POLICY "reviews: authenticated read" ON public.tool_reviews
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reviews: own insert" ON public.tool_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews: own update" ON public.tool_reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reviews: own delete" ON public.tool_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- newsletter_subscribers: NO client access — service-role only
-- The Netlify Function inserts using SUPABASE_SERVICE_KEY, bypassing RLS.
-- No policies needed; the table is fully locked to anon/authenticated roles.
-- (If you ever need a client-facing "unsubscribe" flow, add a targeted policy then.)
