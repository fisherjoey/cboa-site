-- =============================================================================
-- Season Stats — Arbiter ingestion tables
-- =============================================================================
-- Feeds the /portal/statistics dashboard from uploaded Arbiter "Game Info"
-- exports. Idempotent (safe to re-run). Apply via the Supabase SQL Editor —
-- Netlify deploys do not run SQL.
--
-- Tables:
--   stat_games          one row per game, keyed by Arbiter GameID (idempotency)
--   stat_game_imports   one row per uploaded file (audit + whole-file dedupe)
--   stat_org_mappings   BillToName -> league/tournament classification (seeded)
--   stat_manual_entries Active/Ready head-counts per period (until Arbiter roster)
-- =============================================================================

-- Shared updated_at trigger fn (created in 001_initial_schema.sql; guard anyway)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- stat_game_imports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stat_game_imports (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  filename           VARCHAR(500) NOT NULL,
  file_hash          VARCHAR(64) NOT NULL,          -- sha-256 of the uploaded bytes
  source             VARCHAR(50) DEFAULT 'game_info' NOT NULL,
  season             VARCHAR(20) NOT NULL,          -- e.g. '2025-2026'
  row_count          INTEGER DEFAULT 0 NOT NULL,
  game_count         INTEGER DEFAULT 0 NOT NULL,
  assignment_count   INTEGER DEFAULT 0 NOT NULL,
  inserted_count     INTEGER DEFAULT 0 NOT NULL,
  updated_count      INTEGER DEFAULT 0 NOT NULL,
  status             VARCHAR(20) DEFAULT 'completed' NOT NULL, -- completed|failed|partial
  uploaded_by        UUID,
  uploaded_by_email  VARCHAR(255),
  notes              TEXT
);
-- Whole-file idempotency: identical re-upload is rejected (409).
CREATE UNIQUE INDEX IF NOT EXISTS idx_stat_game_imports_hash ON stat_game_imports(file_hash);
CREATE INDEX IF NOT EXISTS idx_stat_game_imports_created_at ON stat_game_imports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stat_game_imports_season ON stat_game_imports(season);

-- ---------------------------------------------------------------------------
-- stat_games  (game_id = Arbiter GameID = idempotency key)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stat_games (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  game_id           BIGINT NOT NULL,               -- Arbiter GameID
  season            VARCHAR(20) NOT NULL,
  game_date         DATE,
  game_time         VARCHAR(10),
  status            VARCHAR(30) DEFAULT 'Normal' NOT NULL,
  site_name         VARCHAR(255),
  sub_site_name     VARCHAR(255),
  bill_to_name      VARCHAR(255),
  sport_name        VARCHAR(100),
  level_name        VARCHAR(255),
  home_teams        VARCHAR(255),
  away_teams        VARCHAR(255),
  officials         JSONB DEFAULT '[]'::jsonb NOT NULL, -- array of official names
  assignment_count  INTEGER DEFAULT 0 NOT NULL,
  import_id         UUID REFERENCES stat_game_imports(id) ON DELETE SET NULL
);
-- Row-level idempotency: upsert ON CONFLICT (game_id).
CREATE UNIQUE INDEX IF NOT EXISTS idx_stat_games_game_id ON stat_games(game_id);
CREATE INDEX IF NOT EXISTS idx_stat_games_season ON stat_games(season);
CREATE INDEX IF NOT EXISTS idx_stat_games_season_date ON stat_games(season, game_date);
CREATE INDEX IF NOT EXISTS idx_stat_games_bill_to ON stat_games(bill_to_name);

-- ---------------------------------------------------------------------------
-- stat_org_mappings  (BillToName -> league/tournament classification)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stat_org_mappings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  bill_to_name  VARCHAR(255) NOT NULL,
  display_name  VARCHAR(255) NOT NULL,
  kind          VARCHAR(20) NOT NULL DEFAULT 'league', -- league|tournament|excluded
  category      VARCHAR(50),                            -- HS|JH|Club|CJBL|Recreational Adult
  active        BOOLEAN DEFAULT TRUE NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stat_org_mappings_bill_to ON stat_org_mappings(bill_to_name);

-- ---------------------------------------------------------------------------
-- stat_manual_entries  (Active/Ready head-counts per period)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stat_manual_entries (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  season            VARCHAR(20) NOT NULL,
  period            VARCHAR(10) NOT NULL DEFAULT 'ytd', -- 'ytd' | 'YYYY-MM'
  active_officials  INTEGER,
  ready_officials   INTEGER,
  updated_by        UUID,
  updated_by_email  VARCHAR(255)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stat_manual_entries_period ON stat_manual_entries(season, period);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_stat_games_updated_at ON stat_games;
CREATE TRIGGER trg_stat_games_updated_at BEFORE UPDATE ON stat_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_stat_game_imports_updated_at ON stat_game_imports;
CREATE TRIGGER trg_stat_game_imports_updated_at BEFORE UPDATE ON stat_game_imports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_stat_org_mappings_updated_at ON stat_org_mappings;
CREATE TRIGGER trg_stat_org_mappings_updated_at BEFORE UPDATE ON stat_org_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS trg_stat_manual_entries_updated_at ON stat_manual_entries;
CREATE TRIGGER trg_stat_manual_entries_updated_at BEFORE UPDATE ON stat_manual_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Row Level Security
--   Netlify Functions use the service-role key (bypass RLS) — that is the
--   write path. Direct browser reads (anon key) require admin/executive.
-- ---------------------------------------------------------------------------
ALTER TABLE stat_games          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_game_imports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_org_mappings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stat_manual_entries ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['stat_games','stat_game_imports','stat_org_mappings','stat_manual_entries']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_service_all" ON %I', t, t);
    EXECUTE format('CREATE POLICY "%s_service_all" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_admin_all" ON %I', t, t);
    EXECUTE format('CREATE POLICY "%s_admin_all" ON %I FOR ALL USING (is_admin_or_executive(auth.uid())) WITH CHECK (is_admin_or_executive(auth.uid()))', t, t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Seed: org classifications confirmed from the GameCounts workbook.
-- Unlisted orgs stay unmapped -> surfaced in the admin "needs review" list and
-- rolled up under "Unclassified" (never silently dropped).
-- Re-runnable: ON CONFLICT refreshes the mapping, preserving any manual edits'
-- display_name only if you remove this seed. (Upsert overwrites to seed values.)
-- ---------------------------------------------------------------------------
INSERT INTO stat_org_mappings (bill_to_name, display_name, kind, category) VALUES
  ('Calgary Senior Mens Basketball Association', 'Calgary Senior Mens', 'league', NULL),
  ('Calgary High School Athletic Association', 'CSHSAA', 'league', NULL),
  ('Calgary Catholic Jr. High Schools', 'Calgary Catholic Junior High', 'league', NULL),
  ('Calgary Sr Women''s Basketball Association', 'Calgary Senior Womens', 'league', NULL),
  ('Rocky View Sports Association', 'Rocky View', 'league', NULL),
  ('Foothills Basketball Association', 'Foothills', 'league', NULL),
  ('Calgary High School Sports League (CHSSL)', 'CHSSL', 'league', NULL),
  ('Foothills Exhibition Series c/o HTA', 'Foothills Exhibition', 'league', NULL),
  ('Calgary Chinese Basketball Club', 'Calgary Chinese Basketball Club', 'league', NULL),
  ('Calgary Middle Level School Athletics Association', 'Calgary Middle Level School Athletics', 'league', NULL),
  ('ISAA', 'ISAA', 'league', NULL),
  ('Calgary Corporate Challenge', 'Calgary Corporate Challenge', 'league', NULL),
  ('Calgary Korean Basketball Association', 'Calgary Korean Basketball', 'league', NULL),
  ('CBE Jr High - Division 1', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 2', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 3', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 4', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 5', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 6', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 7', 'CBE Junior High', 'league', NULL),
  ('CBE Jr High - Division 8', 'CBE Junior High', 'league', NULL),
  ('Airdrie Christian Academy', 'Airdrie Christian Academy', 'tournament', 'High School'),
  ('All Saints High School', 'All Saints High School', 'tournament', 'High School'),
  ('Bert Church High School', 'Bert Church High School', 'tournament', 'High School'),
  ('Bishop Carroll High School', 'Bishop Carroll High School', 'tournament', 'High School'),
  ('Central Memorial High School', 'Central Memorial High School', 'tournament', 'High School'),
  ('Cochrane High School', 'Cochrane High School', 'tournament', 'High School'),
  ('Holy Cross Collegiate', 'Holy Cross Collegiate', 'tournament', 'High School'),
  ('Holy Trinity Academy', 'Holy Trinity Academy', 'tournament', 'High School'),
  ('John G Diefenbaker High School', 'John G Diefenbaker High School', 'tournament', 'High School'),
  ('Nelson Mandela High School', 'Nelson Mandela High School', 'tournament', 'High School'),
  ('Sir Winston Churchill High School', 'Sir Winston Churchill High School', 'tournament', 'High School'),
  ('Springbank High School', 'Springbank High School', 'tournament', 'High School'),
  ('St. Francis High School', 'St. Francis High School', 'tournament', 'High School'),
  ('St. Martin des Porres High School', 'St. Martin des Porres High School', 'tournament', 'High School'),
  ('Strathmore High School', 'Strathmore High School', 'tournament', 'High School'),
  ('Western Canada High School', 'Western Canada High School', 'tournament', 'High School'),
  ('Crowther Memorial School', 'Crowther Memorial School', 'tournament', 'Junior High'),
  ('Rundle College', 'Rundle College', 'tournament', 'Junior High')
ON CONFLICT (bill_to_name) DO UPDATE
  SET display_name = EXCLUDED.display_name,
      kind         = EXCLUDED.kind,
      category     = EXCLUDED.category,
      updated_at   = NOW();

-- Table docs
COMMENT ON TABLE stat_games IS 'Arbiter Game Info rows, keyed by game_id (idempotency). Feeds /portal/statistics.';
COMMENT ON TABLE stat_game_imports IS 'One row per uploaded Arbiter export; file_hash gives whole-file idempotency.';
COMMENT ON TABLE stat_org_mappings IS 'BillToName -> league/tournament classification for stats roll-up.';
COMMENT ON TABLE stat_manual_entries IS 'Active/Ready official head-counts per period (manual until Arbiter roster export).';
