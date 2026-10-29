import {
  getManualPersonnelCounters,
  getPersonnelCountObjective,
  personnelCounterCategories,
  personnelCounterKeys,
  type Mission,
} from "./missions";

export type Counts = Record<string, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function emptyCounts(mission: Mission): Counts {
  const scoreStats = mission.scoreStats ?? [];
  const manualPersonnelCounterIds = getManualPersonnelCounters(mission).map(
    (counter) => personnelCounterKeys[counter],
  );

  return Object.fromEntries([
    ...mission.objectives.map((objective) => [objective.id, 0]),
    ...manualPersonnelCounterIds.map((id) => [id, 0]),
    ...scoreStats.map((stat) => [stat.id, 0]),
  ]);
}

export function parseStoredCounts(
  raw: string | null,
  mission: Mission,
): { counts: Counts; invalid: boolean } {
  const counts = emptyCounts(mission);

  if (raw === null) return { counts, invalid: false };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { counts, invalid: true };
  }

  if (!isRecord(parsed)) {
    return { counts, invalid: true };
  }

  let invalid = false;
  const scoreStats = mission.scoreStats ?? [];
  const scoreStatIds = new Set(scoreStats.map((stat) => stat.id));

  for (const objective of mission.objectives) {
    const value = parsed[objective.id];
    if (value === undefined) continue;

    if (typeof value !== "number" || !Number.isFinite(value)) {
      invalid = true;
      continue;
    }

    const normalized = Math.max(
      0,
      Math.min(objective.target, Math.floor(value)),
    );
    if (normalized !== value) invalid = true;
    counts[objective.id] = normalized;
  }

  for (const stat of scoreStats) {
    const value = parsed[stat.id];
    if (value === undefined) continue;

    if (typeof value !== "number" || !Number.isFinite(value)) {
      invalid = true;
      continue;
    }

    const normalized = Math.max(0, Math.min(stat.target, Math.floor(value)));
    if (normalized !== value) invalid = true;
    counts[stat.id] = normalized;
  }

  for (const counter of personnelCounterCategories) {
    const id = personnelCounterKeys[counter];
    if (scoreStatIds.has(id)) continue;

    const value = parsed[id];
    if (value === undefined) continue;

    const objective = getPersonnelCountObjective(mission, counter);
    if (objective) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        invalid = true;
        continue;
      }

      const normalized = Math.max(
        0,
        Math.min(objective.target, Math.floor(value)),
      );
      if (normalized !== value) invalid = true;
      counts[objective.id] = Math.max(counts[objective.id] ?? 0, normalized);
      continue;
    }

    if (typeof value !== "number" || !Number.isFinite(value)) {
      invalid = true;
      continue;
    }

    const normalized = Math.max(
      0,
      Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)),
    );
    if (normalized !== value) invalid = true;
    counts[id] = normalized;
  }

  return { counts, invalid };
}
