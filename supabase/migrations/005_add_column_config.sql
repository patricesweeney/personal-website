-- Add column_config to store user's column selections for flexible schema handling
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS column_config JSONB;

-- Example structure:
-- {
--   "format": "wide" | "long",
--   "customerIdColumn": "customer_id",
--   "featureColumns": ["logins", "purchases", ...],  -- for wide format
--   "featureNameColumn": "feature_name",              -- for long format
--   "featureValueColumn": "feature_value"             -- for long format
-- }

