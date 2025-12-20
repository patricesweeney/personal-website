-- Add progress column to jobs table for progress bar support
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Reset progress when job starts
COMMENT ON COLUMN jobs.progress IS 'Job progress percentage (0-100). Updated by Modal during processing.';

