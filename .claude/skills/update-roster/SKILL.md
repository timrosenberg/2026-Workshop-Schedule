---
name: update-roster
description: Rebuild data/students.json from a Slate CSV export. Use when Tim provides a new enrollment export or audition results file, or when /update-roster is invoked with CSV path arguments.
disable-model-invocation: true
---

Rebuild `data/students.json` from a Slate enrollment export and optional audition results.

## Usage
`/update-roster <path-to-slate.csv> [path-to-results.csv]`

## Steps

**1. Verify files exist**
```bash
ls -lh <slate.csv>
ls -lh <results.csv>   # if provided
```
If a file is missing, stop and report which path wasn't found. Do not proceed.

**2. Run the build script**
```bash
python3 build_students.py <slate.csv> [results.csv] > data/students.json
```
Capture stderr separately so errors are visible:
```bash
python3 build_students.py <slate.csv> [results.csv] > data/students.json 2>&1 || echo "FAILED"
```
If the script exits non-zero or `data/students.json` is empty/missing after the run, show the error and stop.

**3. Count and report records**
```bash
python3 -c "import json; d=json.load(open('data/students.json')); print(len(d))"
```
Report: `Wrote N student records to data/students.json`

**4. Note placement status**
- **Two args**: audition placements from results.csv are merged in — `chamberCoach`, `chamberInstrument`, and `jazzClass` are populated.
- **One arg only**: those three fields are empty strings. The app displays "TBD" for chamber and jazz assignments. Remind the user to re-run once results.csv is ready.

**5. Warn about join misses (if results.csv was provided)**
The join is on `(Last, First)` case-insensitively. Any student in results.csv with no matching name in slate.csv is silently skipped — their placements won't appear. If the user suspects missing data (e.g., a known student shows TBD), they should check for name discrepancies between the two files.

## Notes
- `data/students.json` is generated — never edit it manually.
- Ensemble is derived automatically from grade: 7–9 → Concert, 10+ → Symphonic. Do not override. Slate may export graduating 12th graders as "13th grade" — this is intentional and maps correctly to Symphonic.
- The script handles UTF-8 BOM encoding from Slate/Excel exports automatically.
