# TwentyFour Studio

A polished Next.js 14 web app for the classic 24 Game. Practice in Normal mode with hints and timers, sprint through Speedrun mode with live
leaderboards, and import real difficulty data from 4nums.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

The development server runs on <http://localhost:3000>.

## Data pipeline

1. Run `npm run import:difficulties` to scrape [4nums difficulties](https://www.4nums.com/game/difficulties/) and save them to
   `data/difficulties.json`.
2. The importer falls back to `data/difficulties.sample.json` if the fetch or parse step fails, so the app always has puzzles available.
3. Each puzzle is cached in SQLite via Prisma (`Puzzle` model) for quick access or future extensions.

Difficulty tiers are derived from the 4nums difficulty score:

| Score        | Tier   |
| ------------ | ------ |
| `< 160`      | Easy   |
| `< 260`      | Medium |
| `< 420`      | Hard   |
| `>= 420`     | Expert |

## Game modes

- **Normal** (`/play`): switch tiers, toggle timer, reveal hints (3 levels) and the full solution.
- **Speedrun** (`/speedrun`): selectable limits (60/120/300s). Tracks solved puzzles, attempts, invalid attempts, and average time. Submit to
  SQLite-backed leaderboards per time limit.
- **Leaderboards** (`/leaderboard`): client-side tabs fetch `GET /api/leaderboard?timeLimit=...` (max 50 entries) and auto-refresh.
- **About** (`/about`): documentation for rules, validation, and importer.

## Core logic

- `src/lib/rational.ts`: exact fraction arithmetic with automatic reduction.
- `src/lib/parser.ts`: tokenizer + shunting-yard to convert input into RPN and evaluate safely (no `eval`).
- `src/lib/validate.ts`: verifies allowed characters, card usage, and checks equality to 24 with rational math.
- `src/lib/solver.ts`: recursive pair-combining solver with memoization and hint extraction.
- `src/lib/difficulty.ts`: loads difficulty JSON (with fallback), maps scores to tiers, and precomputes cached solutions.

## Prisma schema

```prisma
model Puzzle {
  id          String @id
  numbers     String
  difficulty  Int
  tier        String
  solveRate   Float?
  solutions   String?
  createdAt   DateTime @default(now())
}

model LeaderboardEntry {
  id               Int      @id @default(autoincrement())
  mode             String
  timeLimit        Int
  nickname         String
  puzzlesSolved    Int
  totalAttempts    Int
  invalidAttempts  Int
  averageSolveMs   Int
  createdAt        DateTime @default(now())
}
```

## Testing

Vitest covers fraction arithmetic, parser safety, validator number usage, and solver correctness.

```bash
npm test
```

## API reference

- `GET /api/leaderboard?mode=speedrun&limit=50&timeLimit=60` – fetch latest entries (max 50).
- `POST /api/leaderboard` – submit `{ mode: 'speedrun', nickname, timeLimit, puzzlesSolved, totalAttempts, invalidAttempts, averageSolveMs }`
  with lightweight in-memory rate limiting by IP.

## Notes

- The UI is mobile-first with an on-screen keypad for touch devices.
- Expression input honors keyboard shortcuts (Enter = Check, etc.).
- Solver-backed hints escalate from a gentle push to the full solution (confirmation button).
