import { describe, it, expect } from "vitest";
import { calculateResultsAvNWN } from "../score-av-nwn";
import type { Responses } from "../score-av-nwn";

function correct(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Correct: "correct" };
  });
  return resp;
}

function merge(...maps: Responses[]): Responses {
  return Object.assign({}, ...maps);
}

describe("score-av-nwn (Assessment Variant - Number Words and Numerals)", () => {
  describe("FNWS Levels", () => {
    it("Level 0: No tg1-a", () => {
      const result = calculateResultsAvNWN({});
      expect(result.fnwsLevel).toBe(0);
    });

    it("Level 1: tg1-a correct", () => {
      const responses = correct(["tg1-a"]);
      const result = calculateResultsAvNWN(responses);
      expect(result.fnwsLevel).toBe(1);
    });

    it("Level 2: tg1-a AND nwa 0–10 ≥ 2/5", () => {
      const responses = merge(
        correct(["tg1-a"]),
        correct(["nwa-5", "nwa-9"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.fnwsLevel).toBe(2);
    });

    it("Level 3: tg1-a AND nwa 0–10 ≥ 4/5", () => {
      const responses = merge(
        correct(["tg1-a"]),
        correct(["nwa-5", "nwa-9", "nwa-7", "nwa-3"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.fnwsLevel).toBe(3);
    });

    it("Level 4: tg1-b AND nwa 11–30 ≥ 4/7", () => {
      const responses = merge(
        correct(["tg1-a", "tg1-b"]),
        correct(["nwa-5", "nwa-9", "nwa-7", "nwa-3", "nwa-6"]),
        correct(["nwa-14", "nwa-20", "nwa-11", "nwa-29"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.fnwsLevel).toBe(4);
    });

    it("Level 5: (tg1-c OR tg1-d) AND nwa 31–100 ≥ 3/5", () => {
      const responses = merge(
        correct(["tg1-a", "tg1-b", "tg1-c"]),
        correct(["nwa-5", "nwa-9", "nwa-7", "nwa-3", "nwa-6"]),
        correct(["nwa-14", "nwa-20", "nwa-11", "nwa-29", "nwa-23", "nwa-12", "nwa-19"]),
        correct(["nwa-59", "nwa-65", "nwa-32"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.fnwsLevel).toBe(5);
    });
  });

  describe("BNWS Levels", () => {
    it("Level 0: No tg4-a", () => {
      const result = calculateResultsAvNWN({});
      expect(result.bnwsLevel).toBe(0);
    });

    it("Level 1: tg4-a correct", () => {
      const responses = correct(["tg4-a"]);
      const result = calculateResultsAvNWN(responses);
      expect(result.bnwsLevel).toBe(1);
    });

    it("Level 2: tg4-a AND nwb 0–10 ≥ 2/5", () => {
      const responses = merge(
        correct(["tg4-a"]),
        correct(["nwb-7", "nwb-10"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.bnwsLevel).toBe(2);
    });

    it("Level 3: tg4-a AND nwb 0–10 ≥ 4/5", () => {
      const responses = merge(
        correct(["tg4-a"]),
        correct(["nwb-7", "nwb-10", "nwb-4", "nwb-8"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.bnwsLevel).toBe(3);
    });

    it("Level 4: tg4-b AND nwb 11–30 ≥ 4/7", () => {
      const responses = merge(
        correct(["tg4-a", "tg4-b"]),
        correct(["nwb-7", "nwb-10", "nwb-4", "nwb-8", "nwb-3"]),
        correct(["nwb-24", "nwb-17", "nwb-20", "nwb-11"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.bnwsLevel).toBe(4);
    });

    it("Level 5: (tg4-c OR tg4-d) AND nwb 31–100 ≥ 3/5", () => {
      const responses = merge(
        correct(["tg4-a", "tg4-b", "tg4-c"]),
        correct(["nwb-7", "nwb-10", "nwb-4", "nwb-8", "nwb-3"]),
        correct(["nwb-24", "nwb-17", "nwb-20", "nwb-11", "nwb-14", "nwb-21", "nwb-30"]),
        correct(["nwb-53", "nwb-70", "nwb-88"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.bnwsLevel).toBe(5);
    });
  });

  describe("NID Levels", () => {
    it("Level 0: No items correct", () => {
      const result = calculateResultsAvNWN({});
      expect(result.nidLevel).toBe(0);
    });

    it("Level 1: nid 0–10 ≥ 2/4", () => {
      const responses = correct(["nid-5", "nid-3"]);
      const result = calculateResultsAvNWN(responses);
      expect(result.nidLevel).toBe(1);
    });

    it("Level 2: nid 11–20 ≥ 2/4", () => {
      const responses = merge(
        correct(["nid-5", "nid-3", "nid-9", "nid-7"]),
        correct(["nid-12", "nid-18"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.nidLevel).toBe(2);
    });

    it("Level 3: nid 21–100 ≥ 3/4", () => {
      const responses = merge(
        correct(["nid-5", "nid-3", "nid-9", "nid-7"]),
        correct(["nid-12", "nid-18", "nid-16", "nid-14"]),
        correct(["nid-47", "nid-50", "nid-25"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.nidLevel).toBe(3);
    });

    it("Level 4: nid 3-digit ≥ 2/3", () => {
      const responses = merge(
        correct(["nid-5", "nid-3", "nid-9", "nid-7"]),
        correct(["nid-12", "nid-18", "nid-16", "nid-14"]),
        correct(["nid-47", "nid-50", "nid-25", "nid-75"]),
        correct(["nid-100", "nid-251"])
      );
      const result = calculateResultsAvNWN(responses);
      expect(result.nidLevel).toBe(4);
    });
  });
});
