import type { Mission } from "./missions";

export type Counts = Record<string, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function emptyCounts(mission: Mission): Counts {
  return Object.fromEntries(
    mission.objectives.map((objective) => [objective.id, 0]),
  );
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

  return { counts, invalid };
}
