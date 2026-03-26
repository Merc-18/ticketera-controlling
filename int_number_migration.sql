-- Migration: Add project_number to projects (for manually created projects)
-- Run this in Supabase SQL Editor

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS project_number text;

CREATE INDEX IF NOT EXISTS idx_projects_project_number
  ON projects (project_number)
  WHERE project_number IS NOT NULL;
