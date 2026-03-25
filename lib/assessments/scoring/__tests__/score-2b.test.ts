import { describe, it, expect } from "vitest";
import { calculateResults2B } from "../score-2b";
import type { Responses } from "../score-2b";

function correct(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Response: "correct" };
  });
  return resp;
}

function incorrect(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Response: "incorrect" };
  });
  return resp;
}

function merge(...maps: Responses[]): Responses {
  return Object.assign({}, ...maps);
}

describe("score-2b (Schedule 2B - SN20)", () => {
  describe("SN20 Level 0: Emergent", () => {
    it("All items incorrect", () => {
      const responses = incorrect([
        "1.1a",
        "1.1b",
        "1.1c",
        "1.1d",
        "2.1a",
        "2.1b",
        "2.1c",
        "2.1d",
        "2.1e",
        "3.1a",
        "3.1b",
        "3.1c",
        "3.1d",
        "4.1a",
        "4.1b",
        "4.1c",
        "4.1d",
        "5.1a",
        "5.1b",
        "5.1c",
        "6.1a",
        "6.1b",
        "6.1c",
        "6.1d",
      ]);
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(0);
    });
  });

  describe("SN20 Level 1: Finger patterns 1–5 and spatial patterns 1–6", () => {
    it("TG1 = 3/4 (edge case passing) but TG2 < 4", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c"]),
        incorrect(["1.1d", "2.1a", "2.1b", "2.1c", "2.1d", "2.1e"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(0);
    });

    it("TG1 = 3/4 AND TG2 = 4/5 (edge case passing)", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c"]),
        correct(["2.1a", "2.1b", "2.1c", "2.1d"]),
        incorrect(["1.1d", "2.1e", "3.1a", "3.1b", "3.1c", "3.1d", "4.1a", "4.1b", "4.1c", "4.1d", "5.1a", "5.1b", "5.1c"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(1);
    });

    it("TG1 = 4/4 AND TG2 = 5/5 (perfect level 1)", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c", "1.1d"]),
        correct(["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"]),
        incorrect(["3.1a", "3.1b", "3.1c", "3.1d", "4.1a", "4.1b", "4.1c", "4.1d", "5.1a", "5.1b", "5.1c"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(1);
    });
  });

  describe("SN20 Level 2: Small doubles and small partitions of 10", () => {
    it("Level 1 met, TG3 = 3/4 (edge case passing) but TG4 < 3", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c"]),
        correct(["2.1a", "2.1b", "2.1c", "2.1d"]),
        correct(["3.1a", "3.1b", "3.1c"]),
        incorrect(["3.1d", "4.1a", "4.1b", "4.1c", "5.1a", "5.1b", "5.1c"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(1);
    });

    it("Level 1 met, TG3 = 3/4 AND TG4 = 3/4 (edge case passing)", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c"]),
        correct(["2.1a", "2.1b", "2.1c", "2.1d"]),
        correct(["3.1a", "3.1b", "3.1c"]),
        correct(["4.1a", "4.1b", "4.1c"]),
        incorrect(["3.1d", "4.1d", "5.1a", "5.1b", "5.1c"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(2);
    });

    it("Perfect level 2", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c", "1.1d"]),
        correct(["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"]),
        correct(["3.1a", "3.1b", "3.1c", "3.1d"]),
        correct(["4.1a", "4.1b", "4.1c", "4.1d"]),
        incorrect(["5.1a", "5.1b", "5.1c"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(2);
    });
  });

  describe("SN20 Level 3: Five-plus and partitions of 5", () => {
    it("Level 2 met, TG5 = 2/3 AND TG6 = 3/4 (edge case passing)", () => {
      const responses = merge(
        correct(["1.1a", "1.1b", "1.1c"]),
        correct(["2.1a", "2.1b", "2.1c", "2.1d"]),
        correct(["3.1a", "3.1b", "3.1c"]),
        correct(["4.1a", "4.1b", "4.1c"]),
        correct(["5.1a", "5.1b"]),
        correct(["6.1a", "6.1b", "6.1c"]),
        incorrect(["3.1d", "4.1d", "5.1c", "6.1d"])
      );
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(3);
    });

    it("Perfect level 3", () => {
      const responses = correct([
        "1.1a",
        "1.1b",
        "1.1c",
        "1.1d",
        "2.1a",
        "2.1b",
        "2.1c",
        "2.1d",
        "2.1e",
        "3.1a",
        "3.1b",
        "3.1c",
        "3.1d",
        "4.1a",
        "4.1b",
        "4.1c",
        "4.1d",
        "5.1a",
        "5.1b",
        "5.1c",
        "6.1a",
        "6.1b",
        "6.1c",
        "6.1d",
      ]);
      const result = calculateResults2B(responses);
      expect(result.sn20Level).toBe(3);
    });
  });
});
