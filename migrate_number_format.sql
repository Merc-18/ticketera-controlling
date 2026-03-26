-- ============================================================
-- Migration: REQ-XXX → REQ26-XXX  |  INT-XXX → INT26-XXX
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Migrate existing requests (uses year from created_at)
UPDATE requests
SET request_number =
  'REQ' || TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YY') || '-' ||
  SUBSTRING(request_number FROM 5)
WHERE request_number ~ '^REQ-\d+$';

-- 2. Migrate existing internal projects (uses year from created_at)
UPDATE projects
SET project_number =
  'INT' || TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YY') || '-' ||
  SUBSTRING(project_number FROM 5)
WHERE project_number ~ '^INT-\d+$';

-- 3. Replace trigger function with year-aware version
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(NOW() AT TIME ZONE 'America/Lima', 'YY');

  -- Count max number for current year only (resets each year)
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 7) AS INTEGER)), 0) + 1
  INTO next_number
  FROM requests
  WHERE request_number ~ ('^REQ' || year_suffix || '-\d+$');

  NEW.request_number := 'REQ' || year_suffix || '-' || LPAD(next_number::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify
SELECT request_number FROM requests ORDER BY created_at DESC LIMIT 5;
SELECT project_number FROM projects WHERE project_number IS NOT NULL ORDER BY created_at DESC LIMIT 5;
