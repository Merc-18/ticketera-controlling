-- Migration: Add sla_target_date to projects
-- Run this in Supabase SQL Editor

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sla_target_date date;

-- Optional: index for dashboard queries filtering/sorting by SLA date
CREATE INDEX IF NOT EXISTS idx_projects_sla_target_date
  ON projects (sla_target_date)
  WHERE sla_target_date IS NOT NULL;
