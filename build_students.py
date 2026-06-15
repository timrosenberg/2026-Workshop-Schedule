#!/usr/bin/env python3
"""
build_students.py — Generate data/students.json for the 2026 Workshop app.

Usage:
  python3 build_students.py <slate.csv> [results.csv] > data/students.json

  slate.csv   — Slate roster export (CSV, any encoding)
  results.csv — Scoring sheet RESULTS tab, exported as CSV (optional)
                If omitted, placement fields are left empty (shown as TBD in app).

Ensemble is derived from grade: 7–9 → Concert, 10+ → Symphonic.
Join between files is on (Last, First) — case-insensitive.
"""

import csv, json, re, sys

DIETARY_NOISE = {
    'no', 'none', 'n/a', 'na', 'nope', 'not applicable',
    'no dietary restrictions', 'no restrictions', 'no restrictions.',
}

# Normalized forms for known raw strings from Slate.
# Keys are lowercase-stripped raw values; values are the clean display strings.
DIETARY_NORMALIZED = {
    'celiac - no gluten':                                                    'No gluten (celiac)',
    'gluten free diet - celiac disease':                                     'No gluten (celiac)',
    'limited dairy':                                                         'Limited dairy',
    'no pork products':                                                      'No pork',
    'no cheese (strong preference/not allergy - just needs something else if pizza is only option)': 'No cheese (preference)',
    'no coconut':                                                            'No coconut',
    'no peanut':                                                             'No peanuts',
    'no peanuts pistachios or cashews':                                      'No peanuts, no tree nuts',
    'dairy free please':                                                     'No dairy',
    'no dairy':                                                              'No dairy',
    'no milk protein':                                                       'No dairy',
    'no pork':                                                               'No pork',
    'no shellfish, no pig products, no mixing red meat and cheese':          'No shellfish, no pork, no mixing meat and dairy',
    'no shellfish, no pig products, no mixing red meat and cheesef':         'No shellfish, no pork, no mixing meat and dairy',
    'peanut allergy':                                                        'No peanuts',
    'peanut, almond allergy':                                                'No peanuts, no almonds',
}


def fix_name(s):
    """Title-case a name only if it arrived as all-caps or all-lowercase."""
    return s.title() if (s == s.upper() or s == s.lower()) else s


def parse_grade(s):
    m = re.search(r'\d+', s or '')
    return int(m.group()) if m else 0


def ensemble_from_grade(grade):
    return 'concert' if 1 <= grade <= 9 else 'symphonic'


def normalize_dietary(primary, detail):
    """Return a normalized dietary string, or None if no real restriction."""
    d = detail.strip()
    if d and d.lower() not in DIETARY_NOISE:
        raw = d
    elif primary.strip().lower() not in DIETARY_NOISE:
        raw = primary.strip()
    else:
        return None
    return DIETARY_NORMALIZED.get(raw.lower(), raw)


def open_csv(path):
    """Open CSV handling UTF-8 BOM."""
    return open(path, newline='', encoding='utf-8-sig')


def load_slate(path):
    students = {}
    with open_csv(path) as f:
        for row in csv.DictReader(f):
            first = fix_name(row.get('First', '').strip())
            last  = fix_name(row.get('Last', '').strip())
            if not first or not last:
                continue
            grade_str = row.get('Grade as of Fall 2026', '').strip()
            grade_int = parse_grade(grade_str)
            key = (last.lower(), first.lower())
            students[key] = {
                'first':             first,
                'last':              last,
                'grade':             grade_str,
                'school':            row.get('School:Name', '').strip(),
                'primary':           row.get('What is your primary instrument?', '').strip(),
                'bringing':          row.get('What instruments will you bring to the workshop?', '').strip(),
                'ensemble':          ensemble_from_grade(grade_int),
                'chamberCoach':      '',
                'chamberInstrument': '',
                'jazzClass':         '',
                'yaAudition':        row.get('Are you interested in auditioning for the Young ', '').strip().lower() in ('yes', 'maybe'),
                'firstTime':         row.get('Is this your first time attending the Stetson Sa', '').strip().lower() == 'yes',
                'dietary':           normalize_dietary(
                                         row.get('Do you have any dietary restrictions?', ''),
                                         row.get('If yes, please explain:2', '')
                                     ),
            }
    return students


def apply_results(students, path):
    """Merge placement data from the RESULTS tab CSV export."""
    with open_csv(path) as f:
        for row in csv.DictReader(f):
            first = row.get('First', '').strip()
            last  = row.get('Last', '').strip()
            key   = (last.lower(), first.lower())
            if key not in students:
                continue
            coach = row.get('Chamber Coach', '').strip()
            students[key]['chamberCoach']      = coach.title() if coach else ''
            students[key]['chamberInstrument'] = row.get('Chamber Inst.', '').strip()
            jazz = row.get('Jazz Class', '').strip()
            students[key]['jazzClass']         = jazz.title() if jazz else ''
    return students


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    students = load_slate(sys.argv[1])

    if len(sys.argv) >= 3:
        apply_results(students, sys.argv[2])

    output = sorted(students.values(), key=lambda s: (s['last'].lower(), s['first'].lower()))
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
