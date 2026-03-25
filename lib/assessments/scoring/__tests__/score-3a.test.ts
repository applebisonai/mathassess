import { describe, it, expect } from "vitest";
import { calculateResults3A } from "../score-3a";
import type { Responses } from "../score-3a";

function correct(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Correct: "correct" };
  });
  return resp;
}

function incorrect(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Correct: "incorrect" };
  });
  return resp;
}

function merge(...maps: Responses[]): Responses {
  return Object.assign({}, ...maps);
}

describe("score-3a (Schedule 3A - NID, FNWS, BNWS)", () => {
  describe("NID Levels", () => {
    it("Level 0: No items correct", () => {
      const responses = incorrect(["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10"]);
      const result = calculateResults3A(responses);
      expect(result.nidLevel).toBe(0);
    });

    it("Level 3: 50% of level 3 items (2-digit) correct", () => {
      const responses = merge(
        correct(["1.1", "1.2", "1.3"]),
        incorrect(["1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10"])
      );
      const result = calculateResults3A(responses);
      expect(result.nidLevel).toBe(3);
    });

    it("Level 4: 50% of level 4 items (3-digit) correct", () => {
      const responses = merge(
        correct(["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"]),
        correct(["1.7", "1.8"]),
        incorrect(["1.9", "1.10"])
      );
      const result = calculateResults3A(responses);
      expect(result.nidLevel).toBe(4);
    });
  });

  describe("FNWS Sequence Levels", () => {
    it("Level 0: No sequence items correct", () => {
      const responses = incorrect(["5.1", "5.2", "5.3", "5.4", "5.5"]);
      const result = calculateResults3A(responses);
      expect(result.fnwsLevel).toBe(0);
    });

    it("Level 3: Only level 3 sequence item correct", () => {
      const responses = merge(
        correct(["5.1"]),
        incorrect(["5.2", "5.3", "5.4", "5.5"])
      );
      const result = calculateResults3A(responses);
      expect(result.fnwsLevel).toBe(3);
    });

    it("Level 7: Highest level 7 sequence item correct", () => {
      const responses = merge(
        correct(["5.1", "5.2", "5.3", "5.4", "5.5"])
      );
      const result = calculateResults3A(responses);
      expect(result.fnwsLevel).toBe(7);
    });
  });

  describe("BNWS Sequence Levels", () => {
    it("Level 0: No sequence items correct", () => {
      const responses = incorrect(["3.1", "3.2", "3.3", "3.4", "3.5"]);
      const result = calculateResults3A(responses);
      expect(result.bnwsLevel).toBe(0);
    });

    it("Level 5: Level 5 sequence item correct", () => {
      const responses = merge(
        correct(["3.1", "3.2", "3.3", "3.4", "3.5"])
      );
      const result = calculateResults3A(responses);
      expect(result.bnwsLevel).toBe(7);
    });
  });

  describe("Combined NWS Level", () => {
    it("Level 0: Both FNWS and BNWS level 0", () => {
      const responses = merge(
        incorrect(["5.1", "5.2", "5.3", "5.4", "5.5"]),
        incorrect(["3.1", "3.2", "3.3", "3.4", "3.5"])
      );
      const result = calculateResults3A(responses);
      expect(result.nwsCombinedLevel).toBe(0);
    });

    it("Takes max of FNWS (5) and BNWS (3)", () => {
      const responses = merge(
        correct(["5.1", "5.2", "5.3", "5.4", "5.5"]),
        correct(["3.1", "3.2", "3.3"]),
        incorrect(["3.4", "3.5"])
      );
      const result = calculateResults3A(responses);
      expect(result.nwsCombinedLevel).toBe(7);
    });
  });
});
