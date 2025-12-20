-- ============================================
-- RLS PATTERNS TEMPLATE
-- Copy and adapt these patterns for new tables
-- ============================================

-- ============================================
-- PATTERN 1: User-owned resource (most common)
-- Example: user_settings, user_files, etc.
-- ============================================

-- CREATE TABLE user_files (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   name TEXT NOT NULL,
--   path TEXT NOT NULL
-- );

-- ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- -- Users can only see their own files
-- CREATE POLICY "Users read own files"
--   ON user_files FOR SELECT
--   USING (auth.uid() = user_id);

-- -- Users can only insert files for themselves (user_id auto-set via DEFAULT)
-- CREATE POLICY "Users insert own files"
--   ON user_files FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- -- Users can only update their own files
-- CREATE POLICY "Users update own files"
--   ON user_files FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- -- Users can only delete their own files
-- CREATE POLICY "Users delete own files"
--   ON user_files FOR DELETE
--   USING (auth.uid() = user_id);

-- -- Index for RLS performance (CRITICAL)
-- CREATE INDEX idx_user_files_user_id ON user_files(user_id);


-- ============================================
-- PATTERN 2: Org/team-owned resource (multi-tenant)
-- Example: projects, documents, team_settings
-- ============================================

-- CREATE TABLE org_memberships (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
--   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   UNIQUE(org_id, user_id)
-- );

-- CREATE TABLE projects (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   name TEXT NOT NULL
-- );

-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- -- Helper function for cleaner policies
-- CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
-- RETURNS BOOLEAN AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM org_memberships 
--     WHERE org_id = check_org_id AND user_id = auth.uid()
--   );
-- $$ LANGUAGE sql SECURITY DEFINER STABLE;

-- CREATE POLICY "Org members read projects"
--   ON projects FOR SELECT
--   USING (is_org_member(org_id));

-- CREATE POLICY "Org members insert projects"
--   ON projects FOR INSERT
--   WITH CHECK (is_org_member(org_id));

-- CREATE POLICY "Org members update projects"
--   ON projects FOR UPDATE
--   USING (is_org_member(org_id))
--   WITH CHECK (is_org_member(org_id));

-- CREATE POLICY "Org members delete projects"
--   ON projects FOR DELETE
--   USING (is_org_member(org_id));

-- -- Indexes for RLS performance (CRITICAL)
-- CREATE INDEX idx_projects_org_id ON projects(org_id);
-- CREATE INDEX idx_org_memberships_org_user ON org_memberships(org_id, user_id);
-- CREATE INDEX idx_org_memberships_user_id ON org_memberships(user_id);


-- ============================================
-- PATTERN 3: Public read, authenticated write
-- Example: blog posts, public profiles
-- ============================================

-- CREATE TABLE posts (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   author_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
--   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
--   title TEXT NOT NULL,
--   content TEXT NOT NULL,
--   published BOOLEAN DEFAULT false
-- );

-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- -- Anyone can read published posts
-- CREATE POLICY "Public read published posts"
--   ON posts FOR SELECT
--   USING (published = true);

-- -- Authors can read their own drafts
-- CREATE POLICY "Authors read own drafts"
--   ON posts FOR SELECT
--   USING (auth.uid() = author_id AND published = false);

-- -- Only authors can insert
-- CREATE POLICY "Authors insert posts"
--   ON posts FOR INSERT
--   WITH CHECK (auth.uid() = author_id);

-- -- Only authors can update their posts
-- CREATE POLICY "Authors update own posts"
--   ON posts FOR UPDATE
--   USING (auth.uid() = author_id)
--   WITH CHECK (auth.uid() = author_id);


-- ============================================
-- PATTERN 4: Storage bucket policies
-- ============================================

-- User-owned files bucket
-- INSERT INTO storage.buckets (id, name, public) VALUES ('user-files', 'user-files', false);

-- CREATE POLICY "Users upload to own folder"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'user-files' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- CREATE POLICY "Users read own files"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'user-files' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- CREATE POLICY "Users delete own files"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'user-files' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );


-- ============================================
-- PATTERN 5: Demo/anonymous access (your current case)
-- Use sparingly - no auth required
-- ============================================

-- Jobs table: open access for demos
-- In production, add user_id and proper RLS

-- CREATE POLICY "Allow all for demos"
--   ON jobs FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- Storage: open access for demos
-- CREATE POLICY "Allow uploads"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'analysis-uploads');

-- CREATE POLICY "Allow reads"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'analysis-uploads');

-- CREATE POLICY "Allow deletes"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'analysis-uploads');

