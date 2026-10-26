import { describe, expect, it } from "vitest";
import { missions, type Mission } from "./missions";
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
};

describe("stored tracker progress", () => {
  it("initializes every objective at zero", () => {
    expect(emptyCounts(sampleMission)).toEqual({ suspects: 0, hostages: 0 });
  });

  it("loads saved progress and defaults missing objectives to zero", () => {
    expect(parseStoredCounts('{"suspects":2}', sampleMission)).toEqual({
      counts: { suspects: 2, hostages: 0 },
      invalid: false,
    });
  });

  it("clamps invalid counts to each objective's valid range", () => {
    expect(
      parseStoredCounts('{"suspects":9,"hostages":-1}', sampleMission),
    ).toEqual({
      counts: { suspects: 3, hostages: 0 },
      invalid: true,
    });
  });

  it("resets malformed or non-object saved data", () => {
    for (const raw of ["{", "null", "[]", '"not counts"']) {
      expect(parseStoredCounts(raw, sampleMission)).toEqual({
        counts: { suspects: 0, hostages: 0 },
        invalid: true,
      });
    }
  });

  it("ignores invalid objective values and reports them", () => {
    expect(
      parseStoredCounts('{"suspects":"two","hostages":1}', sampleMission),
    ).toEqual({
      counts: { suspects: 0, hostages: 1 },
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
      expect(mission.objectives.length).toBeGreaterThan(0);
      expect(
        new Set(mission.objectives.map((objective) => objective.id)).size,
      ).toBe(mission.objectives.length);

      for (const objective of mission.objectives) {
        expect(Number.isInteger(objective.target)).toBe(true);
        expect(objective.target).toBeGreaterThan(0);
        if (objective.kind === "check") {
          expect(objective.target).toBe(1);
        }
      }
    }
  });
});
