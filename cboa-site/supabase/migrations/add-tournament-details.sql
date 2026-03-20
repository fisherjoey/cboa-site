-- Add tournament details JSONB column to calendar_events
-- Stores: { school, divisions, levels, genders, multiLocation }
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS tournament_details JSONB DEFAULT NULL;
