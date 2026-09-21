-- Run this in the Supabase SQL Editor
-- This will prevent duplicate progress records from being created in the future

ALTER TABLE trial_progress ADD CONSTRAINT unique_candidate_progress UNIQUE (candidate_id);
