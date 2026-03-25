import { describe, it, expect } from "vitest";
import { calculateResultsAvPV } from "../score-av-pv";
import type { Responses } from "../score-av-pv";

function correct(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Response: "correct" };
  });
  return resp;
}

describe("score-av-pv (Assessment Variant - Place Value)", () => {
  it("Level 0: No items correct", () => {
    const result = calculateResultsAvPV({});
    expect(result.cpvLevel).toBe(0);
  });

  it("Level 1: TG1 ≥ 2/4 (edge case)", () => {
    const responses = correct(["1.1", "1.2"]);
    const result = calculateResultsAvPV(responses);
    expect(result.cpvLevel).toBe(1);
  });

  it("Level 2: TG2 correct ≥ 6/14", () => {
    const tg2Responses: Responses = {};
    const expected: Record<string, number> = {
      "2.2a": 10, "2.2b": 13, "2.2c": 33, "2.2d": 37, "2.2e": 40, "2.2f": 50,
      "2.2g": 52, "2.2h": 72,
      "2.3a": 4, "2.3b": 14, "2.3c": 44, "2.3d": 48, "2.3e": 61, "2.3f": 85,
    };
    Object.keys(expected).forEach((id) => {
      tg2Responses[id] = { "Student said": expected[id].toString() };
    });
    const result = calculateResultsAvPV(tg2Responses);
    // All 14 tg2 correct items => level 2
    expect(result.cpvLevel).toBe(2);
  });
});
