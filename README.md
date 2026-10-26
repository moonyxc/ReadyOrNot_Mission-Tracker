# Ready or Not Mission Tracker

A manual mission objective tracker for Ready or Not. Progress is saved in the
browser, separately for each mission.

## Getting started

Install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint
- `npm test` — run the unit tests

## Updating mission data

Edit `src/app/missions.ts` to add or update missions. Each mission needs a
unique ID and number. Objective IDs must be unique within a mission, targets
must be positive integers, and `check` objectives must have a target of `1`.
The tests validate these data rules.

Progress is stored in the browser's local storage on the current device and
browser; it is not synchronized between devices.
