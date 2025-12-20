-- Create jobs table for tracking analysis jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'error')),
  job_type TEXT NOT NULL,
  input_file_path TEXT,
  result JSONB,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (no auth required for demos)
-- TODO: Add proper RLS policies when auth is added
CREATE POLICY "Allow all operations on jobs" ON jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for polling by status
CREATE INDEX idx_jobs_status ON jobs(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for uploads (run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-uploads', 'analysis-uploads', false);

