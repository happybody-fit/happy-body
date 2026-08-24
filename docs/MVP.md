# Happy Body personal movement guide

## Product promise

Happy Body answers one central question: **What would be useful for my body today?**

It is an educational movement companion, not a workout generator, diagnostic tool, competition or bodybuilding dashboard. A user can choose a suggestion, check an unknown movement, practise something else, or rest.

## Screen map

```text
Onboarding (7 short steps)
└── Optional initial movement check

Today
├── Optional body/time check-in
├── Deterministic useful options
└── Quick practice log

Progress
├── Foundation Body Map
├── Strength pathway states
└── Repeat assessments

Explore
├── Squat — 9 levels
├── Push-up — 10 levels
├── Pull-up — 11 levels
└── Honest future-goal placeholders

Diary
├── Practice entries
└── Assessment observations

Settings
├── Context and usual time
├── Account and optional sync
├── Repeat onboarding/assessment
└── Export, import and confirmed reset
```

## Architecture

```text
React screen components
        ↓
Structured movement content (`data/`)
        ↓
Pure recommendation engine (`lib/recommendations.ts`)
        ↓
Versioned HappyBodyData document (`lib/types.ts`)
        ↓
localStorage repository (`lib/storage.ts`)
        ↓ optional
Supabase document adapter (`lib/cloud-progress.ts`)
```

The UI never hardcodes a four-level assumption. Pathways, levels, checkpoints, exercise fields and video placeholders live in structured data. The recommendation engine is pure: the same data and date produce the same ordered suggestions.

## Body Map

Every movement has one explicit state:

- `unknown`
- `assessed`
- `in-progress`
- `achieved`
- `needs-reassessment`
- `temporarily-limited`
- `pain-flagged`

`currentLevel` is nullable. New users receive no chosen goals, avatar, progression level or fake practice history. “Unsure” and “No equipment” keep the relevant movement unknown unless an earlier checkpoint already established a lower capability. Pain flags the movement and suppresses loading suggestions.

## Assessment

The initial movement check covers deep squat, overhead reach, floor sitting and getting up from the floor. Goal-specific pushing or pulling checks appear only when relevant.

Every check offers: comfortable, limited, not yet, unsure, no equipment and pain. Pathway assessment saves the highest consecutively comfortable checkpoint. A non-comfortable result stops that pathway assessment; it never forces an unknown person into level one.

## Recommendation rules

Candidates are generated from chosen primary, secondary and skill goals. If no implemented pathway matches, all three developed pathways remain available as optional exploration.

Hard behavior:

1. Active pain flags suppress practice for that movement and produce a safety/attention card.
2. Missing required equipment suppresses the exercise and preserves an unknown level.
3. An unknown pathway produces an assessment suggestion, not a guessed exercise.
4. Undeveloped goals such as front split remain visible without invented levels or exercises.

Scoring:

- primary goal: +35
- secondary goal: +18 each
- matching skill interest: +10
- unknown movement: +22
- reassessment due: +16
- neglected pathway: +3 per day, capped at +24
- practised today: −32
- practised yesterday: −20
- challenging practice yesterday: an additional −14
- temporarily limited: −8
- stiff today: −4
- tired today: −12
- sore today: −22 and a high-priority gentle-day card

Five to fourteen available minutes returns one option, fifteen to twenty-nine returns two, and thirty or more returns three. Active suggestion time is divided across the returned options. Movement-break preference changes the delivery wording, not the underlying capability logic.

## Practice tracking

The required quick log is three choices:

1. completed: yes / partly / not today;
2. difficulty: easy / good / challenging;
3. body after: better / good / tired / sore / pain.

Optional details add date, sets, repetitions or hold time, body during, notes and a YouTube progress link. “I worked on something else” opens the same log with a user-chosen movement. A pain response creates a pain flag.

## Persistence and migration

The current document version is `2` and the browser key is `happy-body-data-v2`.

Migration reads `happy-body-progress-v1` without deleting it. The original untouched prototype default is treated as non-meaningful and becomes a fresh onboarding state. Meaningful practices and assessments are retained, with old compressed levels mapped onto equivalent expanded pathway steps.

Export and import move the full version 2 JSON document. Reset requires the word `RESET`.

## Content boundaries

- All current external YouTube demonstrations are labelled prototype placeholders.
- Handstand, front split and middle split stay visible as planned pathways without generated content.
- Pass criteria, prescriptions, cautions and final teaching videos still require review by a qualified movement professional before a broad content launch.
- Happy Body never diagnoses pain or injury.
