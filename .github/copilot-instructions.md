# Mission tracking rules

Do not count ordinary evidence as a separate stat or counter; it is included
with the suspects. Keep explicit mission objectives that require reporting
evidence as objectives.

## Commands

- `npm ci` installs the locked dependencies.
- `npm run dev` starts the local development server at `http://localhost:3000`.
- `npm run build` creates the production build and runs TypeScript checks.
- `npm run lint` runs ESLint.
- `npm test` runs the full Vitest suite.
- `npm test -- src/app/tracker-storage.test.ts` runs the tracker storage test file.
- `npm test -- src/app/tracker-storage.test.ts -t "clamps saved counts"` runs one matching test.

## Architecture

- `src/app/missions.ts` is the typed source of truth for mission metadata, objectives, and personnel-counter IDs.
- `src/app/page.tsx` groups missions and links to `/mission/[id]`. The dynamic route in `src/app/mission/[id]/page.tsx` resolves the mission, calls `notFound()` for unknown IDs, and generates static params from the mission registry.
- `src/app/Tracker.tsx` is the client-side tracker. It manages objective controls, reset confirmation, and per-mission browser storage.
- `src/app/tracker-storage.ts` creates zeroed progress and validates/clamps values read from local storage. Progress is stored on the current browser/device, separately per mission; there is no server sync.

## Mission data and UI conventions

- Mission IDs and numbers must be unique. Objective IDs must be unique within a mission. `check` objectives have target `1`; `count` objectives use a positive integer target or `null` when unknown. `type: "main" | "soft"` controls objective grouping.
- Do not add score-stat or optional side-condition counters such as "No Officers Dead" or "Evidence Secured"; these vary by mission and are not mission objectives. Ordinary evidence is included with suspects. Keep explicit objectives that require reporting evidence as objectives.
- Use `count` objectives for `bring-order-to-chaos` and `rescue-all-of-the-civilians` whenever those objectives exist, as in `carriers-of-the-vine`. Use the known total or `null` when unknown; `null` displays as `/?` and is excluded from aggregate progress/completion until a target is set. For a personnel type without a corresponding objective, keep its manual `/?` counter.
- Objective IDs are local-storage keys. Keep IDs stable when editing mission data so existing progress remains associated with the same item.
- Tracker styling uses Tailwind utility classes and shared HUD classes/tokens from `src/app/globals.css`; the font variables are configured in `src/app/layout.tsx`.
- `src/app/tracker-storage.test.ts` covers storage normalization and mission-data invariants. Update it when changing those rules or adding mission data.
