# Happy Body MVP

## Product decisions used for this prototype

- **Audience:** adults who want accessible strength and mobility guidance, from curious beginners to experienced movers.
- **Assessment:** self-reported comfort and control. It finds a sensible starting point; it is not a medical or performance diagnosis.
- **Progression rule:** the highest consecutively comfortable checkpoint becomes the current level. Users can reassess at any time.
- **Practice guidance:** short, repeatable suggestions rather than scheduled workouts. The user chooses frequency and volume.
- **Data ownership:** goals, levels, assessments and practice notes remain in `localStorage` on the current device.
- **Video content:** reputable public demonstrations are temporary prototype content. Happy Body-owned videos should replace them before a broad public launch.
- **Mobility:** visible as planned content, but not implemented until the seven mobility pathways and assessment standards are defined.

Decisions still needed before a public content launch:

1. Confirm the exact level names, pass criteria, prescriptions and safety cues with a qualified movement professional.
2. Decide whether Happy Body should recommend a weekly rhythm or remain entirely user-led.
3. Choose the permanent domain and whether it uses the root domain or `www`.
4. Supply final Canva brand assets and Happy Body-owned YouTube demonstrations.
5. Define the first seven mobility pathways and how strength and mobility recommendations should interact.

## Screen map

```text
My Happy Body
├── Explore Goals
│   ├── Choose / remove pathway
│   └── Start assessment
├── Find My Level
│   ├── Choose pathway
│   ├── Complete 3 comfort checks
│   └── Save level → My Next Step
├── My Next Step
│   ├── Current and next level
│   ├── Exercise instructions + YouTube demos
│   └── Record practice
└── My Journey
    ├── Practice and assessment history
    ├── Milestones
    └── Record practice / reassess
```

## Architecture

```text
Presentation (React screens in app/page.tsx)
        ↓
Domain data (data/pathways.ts + lib/types.ts)
        ↓
Progress repository (lib/storage.ts)
        ↓
localStorage now → Supabase/Firebase adapter later
```

The visible app reads pathways from one structured data file. Adding a pathway, level, assessment checkpoint, exercise or video does not require redesigning a screen. The `ProgressRepository` boundary keeps persistence separate from the interface so a future authenticated cloud repository can replace browser storage.

## Data shape

```ts
Pathway {
  id, name, category, description, destination,
  levels: ProgressionLevel[],
  assessment: AssessmentCheckpoint[]
}

ProgressionLevel {
  id, title, description, milestone,
  exercises: Exercise[]
}

Exercise {
  id, title, purpose, prescription,
  metric, instructions[], videoId
}

UserProgress {
  selectedGoals[],
  currentLevels{},
  practices[],
  assessments[],
  milestones[]
}
```
