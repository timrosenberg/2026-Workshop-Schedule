# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static site (vanilla HTML/CSS/JS + JSON data) deployed to GitHub Pages at `2026.sax.camp`. No build step. Deploy by pushing to `master`.

Student-facing pages are at the root; faculty-only pages live under `faculty/`. Both share `js/script.js` for core logic.

## Vault Cross-References

Source-of-truth data for this app lives in Tim's Obsidian vault at `/Users/trosenberg/Vaults/The Vault`:

- **Student rosters, historical data, budgets, schedules**: `Notes/Saxophone Workshop Reference Material`
- **Ensemble placement rule**: grades 7–9 → Concert, grades 10+ → Symphonic (sole criterion)
- **Push notification skill** (`/sax-banner`): editing `data/banners.json` or `data/rooms.json` — invoke from vault session
- **Sax Camp historical reference**: `reference_saxcamp_historical_data.md` (memory entry)

## Key Data Files

### `data/schedule.json`
Array of day objects. Each activity:
```json
{
  "time": "12:25 - 2:10 PM",
  "activity": "Event Name",
  "location": "Lee Chapel",
  "mapUrl": "https://maps.app.goo.gl/...",
  "notes": ["HTML string shown in overlay", "second note"],
  "assignments": [{ "person": "tim", "role": "duty", "detail": "Description" }],
  "groupMap": []
}
```
`notes[]` renders as a "Notes" section in the event detail overlay. Supports inline HTML.

### `data/banners.json`
Time-triggered push notification banners keyed by ISO date. Use the `/sax-banner` vault skill to edit.

### `data/rooms.json`
Venue directory sections. Items support optional `roster` (links chamber ensemble) and `ensemble` keys.

### `data/students.json`
Generated — do not edit manually. Rebuild with `build_students.py` (see below).

## Python Utility: Roster Build

```bash
python3 build_students.py <slate.csv> [results.csv] > data/students.json
```

- `slate.csv`: enrollment export from Slate (required)
- `results.csv`: audition scoring data (optional; adds placement results)
- Derives ensemble from grade automatically (7–9 = Concert, 10+ = Symphonic)
- Normalizes dietary restrictions

## Faculty Features

`faculty/schedule.js` resolves `?name=` URL param to faculty slug:
- `rosenberg`, `dr-rosenberg`, `dr. rosenberg` → `tim`
- Demo/testing: append `?time=2026-06-25T15:30` to override current time

## Hardcoded JS Mappings

These live in `js/script.js` and must stay in sync with data files:
- `JAZZ_DATA[]` — Jazz ensembles 1–6 (instructors + rooms)
- `CHAMBER_ROSTERS{}` — 15 chamber groups with rosters
- `LARGE_ENSEMBLE_INFO{}` — Concert vs. Symphonic (conductors, grades)
- `FUNDAMENTALS_DATA{}` — Saxophone section room assignments

## Campus Locations

Stetson University, DeLand FL. Key venues: Lee Chapel, Presser Hall (studios: 112, 113, 120, 128, 202, 333, 349, 352), Feasel Hall, Tinsley Hall, Hatter Hall (dorm), Elizabeth Hall, Hollis Hall.

## Push Notifications

OneSignal App ID: `9e1ae8eb-4c86-4b27-b078-2d98c6190f76`. Triggered by banner schedule in `data/banners.json`. To send manual notifications, use the `/sax-notify` vault skill.
