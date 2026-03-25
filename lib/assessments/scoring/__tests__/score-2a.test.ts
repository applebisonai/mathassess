import { describe, it, expect } from "vitest";
import { calculateResults2A } from "../score-2a";
import type { Responses } from "../score-2a";

// Helper to mark items as correct
function correct(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Response: "correct" };
  });
  return resp;
}

// Helper to mark items as incorrect
function incorrect(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Response: "incorrect" };
  });
  return resp;
}

// Helper to merge response objects
function merge(...maps: Responses[]): Responses {
  return Object.assign({}, ...maps);
}

describe("score-2a (Schedule 2A)", () => {
  describe("FNWS Levels", () => {
    it("Level 0: no NWA items correct", () => {
      const responses = incorrect([
        "2.1a",
        "2.1b",
        "2.1c",
        "2.1d",
        "2.1e",
        "2.2a",
        "2.2b",
        "2.2c",
        "2.2d",
        "2.2e",
      ]);
      const result = calculateResults2A(responses);
      expect(result.fnwsLevel).toBe(1);
    });

    it("Level 1: NWA 0–10 insufficient (<4 correct)", () => {
      const responses = merge(
        correct(["2.1a", "2.1b", "2.1c"]),
        incorrect(["2.1d", "2.1e", "2.2a", "2.2b", "2.2c", "2.2d", "2.2e"])
      );
      const result = calculateResults2A(responses);
      expect(result.fnwsLevel).toBe(1);
    });

    it("Level 2: NWA 0–10 = 4 correct (edge case passing)", () => {
      const responses = merge(
        correct(["2.1a", "2.1b", "2.1c", "2.1d"]),
        incorrect(["2.1e", "2.2a", "2.2b", "2.2c", "2.2d", "2.2e"])
      );
      const result = calculateResults2A(responses);
      expect(result.fnwsLevel).toBe(2);
    });

    it("Level 2: NWA 0–10 = 5 correct (clear pass)", () => {
      const responses = merge(
        correct(["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"]),
        incorrect(["2.2a", "2.2b", "2.2c", "2.2d", "2.2e"])
      );
      const result = calculateResults2A(responses);
      expect(result.fnwsLevel).toBe(2);
    });

    it("Level 3: NWA 11–30 = 4 correct (edge case passing)", () => {
      const responses = merge(
        correct(["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"]),
        correct(["2.2a", "2.2b", "2.2c", "2.2d"]),
        incorrect(["2.2e", "2.3a", "2.3b", "2.3c", "2.3d", "2.3e"])
      );
      const result = calculateResults2A(responses);
      expect(result.fnwsLevel).toBe(3);
    });

    it("Level 5: NWA 31–100 = 4 correct (surpass level 3 threshold)", () => {
      const responses = merge(
        correct(["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"]),
        correct(["2.2a", "2.2b", "2.2c", "2.2d"]),
        correct(["2.3a", "2.3b", "2.3c", "2.3d"])
      );
      const result = calculateResults2A(responses);
      expect(result.fnwsLevel).toBe(5);
    });
  });

  describe("NID Levels", () => {
    it("Level 0: no items correct", () => {
      const responses = incorrect([
        "3.1a",
        "3.1b",
        "3.1c",
        "3.1d",
        "3.1e",
        "3.1f",
        "3.1g",
        "3.2a",
        "3.2b",
        "3.2c",
        "3.2d",
        "3.2e",
        "3.2f",
        "3.2g",
      ]);
      const result = calculateResults2A(responses);
      expect(result.nidLevel).toBe(0);
    });

    it("Level 1: NID Level 1 = 5 correct (edge case passing)", () => {
      const responses = merge(
        correct(["3.1a", "3.1b", "3.1c", "3.1d", "3.1e"]),
        incorrect(["3.1f", "3.1g", "3.2a", "3.2b", "3.2c", "3.2d", "3.2e", "3.2f", "3.2g"])
      );
      const result = calculateResults2A(responses);
      expect(result.nidLevel).toBe(1);
    });

    it("Level 2: NID Level 2 = 5 correct", () => {
      const responses = merge(
        correct(["3.1a", "3.1b", "3.1c", "3.1d", "3.1e", "3.1f", "3.1g"]),
        correct(["3.2a", "3.2b", "3.2c", "3.2d", "3.2e"]),
        incorrect(["3.3a", "3.3b", "3.3c", "3.3d", "3.3e", "3.3f", "3.3g", "3.3h"])
      );
      const result = calculateResults2A(responses);
      expect(result.nidLevel).toBe(2);
    });

    it("Level 3: NID Level 3 = 6 correct (edge case passing)", () => {
      const responses = merge(
        correct(["3.1a", "3.1b", "3.1c", "3.1d", "3.1e", "3.1f", "3.1g"]),
        correct(["3.2a", "3.2b", "3.2c", "3.2d", "3.2e", "3.2f", "3.2g"]),
        correct(["3.3a", "3.3b", "3.3c", "3.3d", "3.3e", "3.3f"]),
        incorrect(["3.3g", "3.3h", "3.4a", "3.4b", "3.4c", "3.4d", "3.4e"])
      );
      const result = calculateResults2A(responses);
      expect(result.nidLevel).toBe(3);
    });

    it("Level 4: NID Level 4 = 4 correct (edge case passing)", () => {
      const responses = merge(
        correct(["3.1a", "3.1b", "3.1c", "3.1d", "3.1e", "3.1f", "3.1g"]),
        correct(["3.2a", "3.2b", "3.2c", "3.2d", "3.2e", "3.2f", "3.2g"]),
        correct(["3.3a", "3.3b", "3.3c", "3.3d", "3.3e", "3.3f", "3.3g", "3.3h"]),
        correct(["3.4a", "3.4b", "3.4c", "3.4d"])
      );
      const result = calculateResults2A(responses);
      expect(result.nidLevel).toBe(4);
    });
  });

  describe("BNWS Levels", () => {
    it("Level 1: no NWB items correct", () => {
      const responses = incorrect([
        "6.1a",
        "6.1b",
        "6.1c",
        "6.1d",
        "6.1e",
        "6.2a",
        "6.2b",
        "6.2c",
        "6.2d",
        "6.2e",
        "6.3a",
        "6.3b",
        "6.3c",
        "6.3d",
        "6.3e",
      ]);
      const result = calculateResults2A(responses);
      expect(result.bnwsLevel).toBe(1);
    });

    it("Level 2: NWB 1–10 = 4 correct (edge case passing)", () => {
      const responses = merge(
        correct(["6.1a", "6.1b", "6.1c", "6.1d"]),
        incorrect(["6.1e", "6.2a", "6.2b", "6.2c", "6.2d", "6.2e", "6.3a", "6.3b", "6.3c", "6.3d", "6.3e"])
      );
      const result = calculateResults2A(responses);
      expect(result.bnwsLevel).toBe(2);
    });

    it("Level 4: NWB 11–30 = 4 correct (edge case passing)", () => {
      const responses = merge(
        correct(["6.1a", "6.1b", "6.1c", "6.1d", "6.1e"]),
        correct(["6.2a", "6.2b", "6.2c", "6.2d"]),
        incorrect(["6.2e", "6.3a", "6.3b", "6.3c", "6.3d", "6.3e"])
      );
      const result = calculateResults2A(responses);
      expect(result.bnwsLevel).toBe(4);
    });

    it("Level 5: NWB 31–100 = 4 correct (edge case passing)", () => {
      const responses = merge(
        correct(["6.1a", "6.1b", "6.1c", "6.1d", "6.1e"]),
        correct(["6.2a", "6.2b", "6.2c", "6.2d", "6.2e"]),
        correct(["6.3a", "6.3b", "6.3c", "6.3d"])
      );
      const result = calculateResults2A(responses);
      expect(result.bnwsLevel).toBe(5);
    });

    it("Level 5: All items perfect", () => {
      const responses = correct([
        "6.1a",
        "6.1b",
        "6.1c",
        "6.1d",
        "6.1e",
        "6.2a",
        "6.2b",
        "6.2c",
        "6.2d",
        "6.2e",
        "6.3a",
        "6.3b",
        "6.3c",
        "6.3d",
        "6.3e",
      ]);
      const result = calculateResults2A(responses);
      expect(result.bnwsLevel).toBe(5);
    });
  });
});
