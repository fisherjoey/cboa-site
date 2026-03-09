-- =============================================
-- Migrate attachment_url (single TEXT) → attachment_urls (JSONB array)
-- Supports multiple attachment links per submission
-- =============================================

-- 1. Add new JSONB column
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS attachment_urls JSONB;

-- 2. Migrate existing single URLs into a JSON array
UPDATE contact_submissions
SET attachment_urls = jsonb_build_array(attachment_url)
WHERE attachment_url IS NOT NULL AND attachment_url != '';

-- 3. Drop the old single-value column
ALTER TABLE contact_submissions DROP COLUMN IF EXISTS attachment_url;
