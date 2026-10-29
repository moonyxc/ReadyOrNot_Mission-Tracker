import { describe, expect, it } from "vitest";
import {
  getManualPersonnelCounters,
  missions,
  personnelCounterKeys,
  type Mission,
} from "./missions";
import { emptyCounts, parseStoredCounts } from "./tracker-storage";

const sampleMission: Mission = {
  id: "test-mission",
  number: 0,
  name: "Test Mission",
  group: "Test",
  objectives: [
    {
      id: "suspects",
      title: "Secure suspects",
      description: "",
      kind: "count",
      target: 3,
      type: "main",
    },
    {
      id: "hostages",
      title: "Rescue hostages",
      description: "",
      kind: "check",
      target: 1,
      type: "soft",
    },
  ],
  scoreStats: [
    { id: "performance-score", title: "Performance Score", target: 4 },
    { id: "no-officers-dead", title: "No Officers Dead", target: 1 },
  ],
};

const emptySampleCounts = {
  suspects: 0,
  hostages: 0,
  [personnelCounterKeys.suspects]: 0,
  [personnelCounterKeys.civilians]: 0,
  "performance-score": 0,
  "no-officers-dead": 0,
};

function missionById(id: string): Mission {
  const mission = missions.find((candidate) => candidate.id === id);
  if (!mission) throw new Error(`Missing mission: ${id}`);
  return mission;
}

describe("stored tracker progress", () => {
  it("initializes objectives, personnel counters, and score stats at zero", () => {
    expect(emptyCounts(sampleMission)).toEqual(emptySampleCounts);
  });

  it("loads saved progress and defaults missing objectives to zero", () => {
    expect(parseStoredCounts('{"suspects":2}', sampleMission)).toEqual({
      counts: { ...emptySampleCounts, suspects: 2 },
      invalid: false,
    });
  });

  it("clamps saved counts to their configured targets", () => {
    expect(
      parseStoredCounts(
        '{"suspects":9,"hostages":-1,"performance-score":9,"no-officers-dead":-1}',
        sampleMission,
      ),
    ).toEqual({
      counts: {
        ...emptySampleCounts,
        suspects: 3,
        hostages: 0,
        "performance-score": 4,
      },
      invalid: true,
    });
  });

  it("loads manual personnel counts without a fixed target", () => {
    expect(
      parseStoredCounts(
        '{"personnel-suspects":8,"personnel-civilians":2}',
        sampleMission,
      ),
    ).toEqual({
      counts: {
        ...emptySampleCounts,
        [personnelCounterKeys.suspects]: 8,
        [personnelCounterKeys.civilians]: 2,
      },
      invalid: false,
    });
  });

  it("normalizes invalid manual personnel counts", () => {
    expect(
      parseStoredCounts(
        '{"personnel-suspects":-1,"personnel-civilians":1.8}',
        sampleMission,
      ),
    ).toEqual({
      counts: {
        ...emptySampleCounts,
        [personnelCounterKeys.civilians]: 1,
      },
      invalid: true,
    });
  });

  it("resets malformed or non-object saved data", () => {
    for (const raw of ["{", "null", "[]", '"not counts"']) {
      expect(parseStoredCounts(raw, sampleMission)).toEqual({
        counts: emptySampleCounts,
        invalid: true,
      });
    }
  });

  it("ignores invalid objective values and reports them", () => {
    expect(
      parseStoredCounts('{"suspects":"two","hostages":1}', sampleMission),
    ).toEqual({
      counts: { ...emptySampleCounts, suspects: 0, hostages: 1 },
      invalid: true,
    });
  });
});

describe("mission data", () => {
  it("has unique mission IDs and numbers", () => {
    expect(new Set(missions.map((mission) => mission.id)).size).toBe(
      missions.length,
    );
    expect(new Set(missions.map((mission) => mission.number)).size).toBe(
      missions.length,
    );
  });

  it("uses unique objective IDs and valid targets within each mission", () => {
    for (const mission of missions) {
      const scoreStats = mission.scoreStats ?? [];
      const ids = [
        ...mission.objectives.map((objective) => objective.id),
        ...scoreStats.map((stat) => stat.id),
      ];

      expect(mission.objectives.length).toBeGreaterThan(0);
      expect(
        new Set(mission.objectives.map((objective) => objective.id)).size,
      ).toBe(mission.objectives.length);
      expect(new Set(ids).size).toBe(ids.length);

      for (const objective of mission.objectives) {
        expect(Number.isInteger(objective.target)).toBe(true);
        expect(objective.target).toBeGreaterThan(0);
        if (objective.kind === "check") {
          expect(objective.target).toBe(1);
        }
      }

      for (const stat of scoreStats) {
        expect(Number.isInteger(stat.target)).toBe(true);
        expect(stat.target).toBeGreaterThan(0);
      }
    }
  });

  it("tracks suspects and civilians in every mission", () => {
    for (const mission of missions) {
      const manualCounters = getManualPersonnelCounters(mission);
      const scoreStatIds = new Set(
        (mission.scoreStats ?? []).map((stat) => stat.id),
      );
      const suspectObjectiveCount = mission.objectives.some(
        (objective) =>
          objective.id === "bring-order-to-chaos" &&
          objective.kind === "count",
      );
      const civilianObjectiveCount = mission.objectives.some(
        (objective) =>
          objective.id === "rescue-all-of-the-civilians" &&
          objective.kind === "count",
      );

      expect(
        suspectObjectiveCount ||
          manualCounters.includes("suspects") ||
          scoreStatIds.has(personnelCounterKeys.suspects),
      ).toBe(true);
      expect(
        civilianObjectiveCount ||
          manualCounters.includes("civilians") ||
          scoreStatIds.has(personnelCounterKeys.civilians),
      ).toBe(true);
    }
  });

  it("tracks non-evidence score stats without duplicate personnel counters", () => {
    const mission = missionById("thank-you-come-again");

    expect(
      mission.scoreStats?.map(({ title, target }) => ({ title, target })),
    ).toEqual([
      { title: "Suspects Secured", target: 4 },
      { title: "Civilians Secured", target: 6 },
      { title: "No Officers Dead", target: 1 },
    ]);
    expect(getManualPersonnelCounters(mission)).toEqual([]);
  });

  it("clamps previously saved personnel values to the new score-stat targets", () => {
    const mission = missionById("thank-you-come-again");

    expect(
      parseStoredCounts(
        '{"personnel-suspects":9,"personnel-civilians":7}',
        mission,
      ),
    ).toEqual({
      counts: {
        ...emptyCounts(mission),
        [personnelCounterKeys.suspects]: 4,
        [personnelCounterKeys.civilians]: 6,
      },
      invalid: true,
    });
  });

  it("keeps Mission 10's existing suspect and civilian targets", () => {
    const missionTen = missions.find((mission) => mission.number === 10);
    expect(
      missionTen?.objectives
        .filter(
          (objective) =>
            objective.id === "bring-order-to-chaos" ||
            objective.id === "rescue-all-of-the-civilians",
        )
        .map(({ id, kind, target }) => ({ id, kind, target })),
    ).toEqual([
      { id: "bring-order-to-chaos", kind: "count", target: 15 },
      { id: "rescue-all-of-the-civilians", kind: "count", target: 11 },
    ]);
  });

  it("tracks Rust Belt's suspect and civilian targets", () => {
    const rustBelt = missions.find((mission) => mission.id === "rust-belt");
    expect(
      rustBelt?.objectives
        .filter(
          (objective) =>
            objective.id === "bring-order-to-chaos" ||
            objective.id === "rescue-all-of-the-civilians",
        )
        .map(({ id, kind, target }) => ({ id, kind, target })),
    ).toEqual([
      { id: "bring-order-to-chaos", kind: "count", target: 14 },
      { id: "rescue-all-of-the-civilians", kind: "count", target: 2 },
    ]);
    expect(rustBelt && getManualPersonnelCounters(rustBelt)).toEqual([]);
  });

  it("tracks Carriers of the Vine's suspect and civilian targets", () => {
    const carriers = missions.find(
      (mission) => mission.id === "carriers-of-the-vine",
    );
    expect(
      carriers?.objectives
        .filter(
          (objective) =>
            objective.id === "bring-order-to-chaos" ||
            objective.id === "rescue-all-of-the-civilians",
        )
        .map(({ id, kind, target }) => ({ id, kind, target })),
    ).toEqual([
      { id: "bring-order-to-chaos", kind: "count", target: 13 },
      { id: "rescue-all-of-the-civilians", kind: "count", target: 5 },
    ]);
    expect(carriers && getManualPersonnelCounters(carriers)).toEqual([]);
  });
});
