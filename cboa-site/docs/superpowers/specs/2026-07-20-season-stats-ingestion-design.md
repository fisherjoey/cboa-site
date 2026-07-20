# Season Stats — Arbiter ingestion + real-data dashboard

**Date:** 2026-07-20
**Branch:** `feat/season-stats-ingestion`
**Status:** Design — awaiting approval before implementation

## Goal

Turn the stubbed `/portal/statistics` page (currently mock data behind an "Under
Construction" banner) into a live **Seasonal Officiating Stats** page fed by real
Arbiter data. An admin uploads the Arbiter export; the portal parses, stores,
de-duplicates, rolls up, and displays it. Design **Direction B (Dashboard)** —
the refined evolution of the page that already exists.

Source of the requirement: Jerome's Visio spec (`Officials Stats Requirements.vsdx`)
and the working `GameCounts (YTD Sep 2025 – Jan 2026)` workbook.

## Scope (v1 — full vertical slice)

In:
- Admin upload of the Arbiter **Game Info** export (`.xlsx` or `.csv`) via a modal.
- Parse (SheetJS) → validate → idempotent store, keyed by Arbiter `GameID`.
- Org → league/tournament classification via a seeded mapping table.
- Roll-up computed on read: officials, volume, per-official distribution, league
  breakdown, tournaments — season (YTD) and monthly.
- Wire `StatisticsClient` to the real roll-up; keep the existing Recharts +
  DataTable UI (Direction B).
- Admin surfaces: import history, "unmapped orgs" review, manual head-count entry.

Out (later):
- Automated Arbiter roster import for Active/Ready (kept as a manual admin form
  for now — see Open Questions).
- Per-official public leaderboards (privacy — v1 shows aggregates only).
- Prior-season backfill UI (data model supports it; no bulk tooling yet).

## Data model (Supabase — hand-applied idempotent SQL)

> No migration runner / no local Supabase in this project. SQL ships as an
> idempotent file that **Joey applies via the Supabase SQL Editor**. Conventions
> matched from `20250201_add-osa-submissions-table.sql`: `UUID
> gen_random_uuid()` PKs, snake_case, `TIMESTAMPTZ DEFAULT NOW()`,
> `idx_<table>_<col>` indexes, RLS on, `is_admin_or_executive()` helpers.

### `stat_game_imports` — one row per uploaded file (audit + whole-file idempotency)
`id`, `filename`, `file_hash` (sha-256, **UNIQUE**), `source` ('game_info'),
`season`, `row_count`, `game_count`, `assignment_count`, `inserted_count`,
`updated_count`, `status` ('completed'|'failed'|'partial'), `uploaded_by` (uuid),
`uploaded_by_email`, `notes`, `created_at`, `updated_at`.

### `stat_games` — one row per game; **`game_id` is the idempotency key**
`id`, `game_id` (BIGINT **UNIQUE NOT NULL** — Arbiter GameID), `season`,
`game_date` (DATE), `game_time`, `status` ('Normal'|'Cancelled'|…), `site_name`,
`sub_site_name`, `bill_to_name`, `sport_name`, `level_name`, `home_teams`,
`away_teams`, `officials` (JSONB array of names), `assignment_count` (INT,
= officials length, denormalized), `import_id` (uuid → last import that touched it),
`created_at`, `updated_at`.
Ingest = `upsert(rows, { onConflict: 'game_id' })`.

### `stat_org_mappings` — league/tournament classification (seeded from the workbook)
`id`, `bill_to_name` (TEXT **UNIQUE** — raw Arbiter org), `display_name` (friendly
group, e.g. "Calgary Senior Mens"), `kind` ('league'|'tournament'|'excluded'),
`category` (nullable — 'High School'|'Junior High'|'Club'|'CJBL'|'Recreational
Adult'), `active` (bool), `created_at`, `updated_at`.
Orgs present in `stat_games` but absent here are surfaced as **needs-mapping** and,
until mapped, roll up under an "Unclassified" bucket (never silently dropped).

### `stat_manual_entries` — Active/Ready head-counts per period
`id`, `season`, `period` ('ytd' | 'YYYY-MM'), `active_officials` (INT),
`ready_officials` (INT), **UNIQUE(season, period)**, `updated_by`, `updated_by_email`,
`created_at`, `updated_at`.

All tables: RLS on; `service_role` full access (functions bypass RLS via the
service key); `is_admin_or_executive(auth.uid())` for any direct browser reads.

## Idempotency & duplicate handling (explicit requirement)

1. **Whole-file** — sha-256 of the uploaded bytes stored on `stat_game_imports.file_hash`
   (UNIQUE). Re-uploading the identical file → **409, skipped** with a clear message.
2. **Row-level** — `stat_games.game_id` UNIQUE + `upsert onConflict game_id`.
   Overlapping exports (Sep–Jan, then Sep–Feb) **update** existing games and insert
   only new ones. No double counting. This is the core guarantee.
3. **Assignments** — derived from each game's `officials` array, **replaced** on
   upsert, so re-import corrects counts rather than duplicating them.
4. **Cancellations** — a game whose `status` flips to Cancelled updates in place;
   roll-ups count only `status = 'Normal'`. Games absent from a later export are
   **retained** (we never auto-delete) — the report tells the admin what changed.
5. **Reporting** — every upload returns `{ inserted, updated, skipped, gameCount,
   assignmentCount, unmappedOrgs[] }` so Jerome sees exactly what happened.

## Roll-up (computed on read — pure, testable)

`lib/stats/rollup.ts :: computeRollup(games, mappings, manual, {season, period})`
is a pure function (no DB). ~3,400 games/season → in-memory aggregation is trivial.
Produces the exact shape `StatisticsClient` already consumes: `officials`
(active/ready/refereed), `volume` (games/assignments/min/max/avg), `distribution`
(games-per-official buckets), `leagues` (grouped + subdivisions by level), and
`tournaments` (by category + breakdown). `period: 'ytd'` = whole season;
`period: 'YYYY-MM'` = that month via `game_date`.

## Server (Netlify Functions — `createHandler` + `auth` map)

- `stat-imports.ts` — `POST` (admin_or_executive): body = parsed rows + `{source,
  season, filename, fileHash}`; checks hash, creates import, upserts games, returns
  summary. `GET` (authenticated): recent imports. Audit-logged.
- `stat-summary.ts` — `GET` (authenticated): `?season=&period=` → roll-up JSON.
- `stat-org-mappings.ts` — `GET` (authenticated) / `POST`,`PUT`,`DELETE`
  (admin_or_executive): manage classifications + list unmapped orgs.
- `stat-manual-entries.ts` — `GET` (authenticated) / `PUT` (admin_or_executive).

## Client

- `lib/stats/arbiterGameInfo.ts` — pure `normalizeGameRows(rawRows)` → `{ games[],
  errors[] }` (header detection, column mapping, official counting, date/status
  normalization). **TDD core.**
- `lib/stats/rollup.ts` — pure `computeRollup(...)`. **TDD core.**
- `lib/stats/readWorkbook.ts` — thin SheetJS wrapper: File/ArrayBuffer → raw rows.
- `lib/api/stats.ts` — `statsAPI`: `uploadGames`, `getSummary`, `getImports`,
  `getMappings`/`saveMapping`, `getManual`/`saveManual`.
- `components/portal/StatsUploadModal.tsx` — dropzone (`react-dropzone`), parse,
  validate, preview (valid / invalid / unmapped orgs), confirm. Modeled on
  `BulkEventUploadModal`.
- `app/portal/statistics/StatisticsClient.tsx` — swap mock for `statsAPI.getSummary`;
  keep Recharts + DataTable UI (Direction B). Admin-only "Upload Arbiter export"
  button + last-import chip. Under-construction banner shows only when no data yet.

## Privacy decision (needs sign-off)

The raw export contains **official names**. v1 stores them in
`stat_games.officials` (needed to compute the per-official distribution) but the
officials-facing page shows **aggregates only** — no names, no per-person page.
Names live behind the admin/service-role boundary. Confirm this is acceptable, or
we hash/drop names and lose the ability to recompute distribution later.

## Testing & verification

- **Jest unit tests** (runnable now, no DB): `normalizeGameRows` and `computeRollup`
  against fixtures derived from the real workbook — this is where correctness lives.
- **Typecheck + lint + build** for the functions, API layer, and UI.
- **Full E2E** (upload → DB → page) requires the SQL applied to the hosted DB +
  `netlify dev` + env keys — a manual step Joey runs with the real Arbiter file.
  Flagged, not silently claimed.

## Open questions (non-blocking; decide before/at wire-up)

- **Active/Ready source** — manual admin form in v1; confirm whether Arbiter's
  People/roster report can export those statuses so it can be automated later.
- **Cancelled games** — the current Game Info export is all `Normal`; if cancelled
  games are wanted, Jerome includes them in the export (we already handle the status).
- **Upload cadence / who** — the page is only as fresh as the last upload.
- **Season mapping stability** — `bill_to_name` strings drift year to year; the
  mapping table absorbs that but needs occasional admin upkeep.
