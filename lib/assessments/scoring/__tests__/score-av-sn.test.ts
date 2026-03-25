import { describe, it, expect } from "vitest";
import { calculateResultsAvSN } from "../score-av-sn";
import type { Responses } from "../score-av-sn";

function correct(ids: string[]): Responses {
  const resp: Responses = {};
  ids.forEach((id) => {
    resp[id] = { Response: "correct" };
  });
  return resp;
}

function merge(...maps: Responses[]): Responses {
  return Object.assign({}, ...maps);
}

describe("score-av-sn (Assessment Variant - Structuring Numbers)", () => {
  it("Level 0: No items correct", () => {
    const result = calculateResultsAvSN({});
    expect(result.snLevel).toBe(0);
  });

  it("Level 1: regularSpatial ≥ 3 AND irregularSpatial ≥ 3", () => {
    const responses = correct([
      "sn1-reg-4",
      "sn1-reg-3",
      "sn1-reg-6",
      "sn1-irr-4",
      "sn1-irr-6",
      "sn1-irr-3",
    ]);
    const result = calculateResultsAvSN(responses);
    expect(result.snLevel).toBe(1);
  });

  it("Level 2: displayFingers ≥ 4 AND moreThanOneWay ≥ 3 AND partOf5 ≥ 3 AND partOf10 ≥ 3", () => {
    const responses = merge(
      correct([
        "sn1-reg-4",
        "sn1-reg-3",
        "sn1-reg-6",
        "sn1-irr-4",
        "sn1-irr-6",
        "sn1-irr-3",
        "sn1-irr-5",
      ]),
      correct([
        "sn2-disp-4",
        "sn2-disp-3",
        "sn2-disp-9",
        "sn2-disp-6",
      ]),
      correct([
        "sn2-mtow-5a",
        "sn2-mtow-5b",
        "sn2-mtow-7a",
      ]),
      correct([
        "sn3-p5-4",
        "sn3-p5-2",
        "sn3-p5-1",
      ]),
      correct([
        "sn3-p10-8",
        "sn3-p10-6",
        "sn3-p10-3",
      ])
    );
    const result = calculateResultsAvSN(responses);
    expect(result.snLevel).toBe(2);
  });

  it("Level 3: noMatTo5 ≥ 2 AND noMatTo10 ≥ 2 AND bareTo10 ≥ 3", () => {
    const responses = merge(
      correct([
        "sn1-reg-4",
        "sn1-reg-3",
        "sn1-reg-6",
        "sn1-irr-4",
        "sn1-irr-6",
        "sn1-irr-3",
        "sn1-irr-5",
      ]),
      correct([
        "sn2-disp-4",
        "sn2-disp-3",
        "sn2-disp-9",
        "sn2-disp-6",
        "sn2-disp-8",
      ]),
      correct([
        "sn2-mtow-5a",
        "sn2-mtow-5b",
        "sn2-mtow-7a",
        "sn2-mtow-7b",
      ]),
      correct([
        "sn3-p5-4",
        "sn3-p5-2",
        "sn3-p5-1",
        "sn3-p5-3",
      ]),
      correct([
        "sn3-p10-8",
        "sn3-p10-6",
        "sn3-p10-3",
        "sn3-p10-4",
      ]),
      correct(["sn4-c5-3", "sn4-c5-1"]),
      correct([
        "sn4-c10-7",
        "sn4-c10-4",
        "sn4-c10-1",
      ]),
      correct(["sn5-5p4", "sn5-3p3", "sn5-9m6"])
    );
    const result = calculateResultsAvSN(responses);
    expect(result.snLevel).toBe(3);
  });

  it("Level 4: bareTo20 ≥ 3", () => {
    const responses = merge(
      correct([
        "sn1-reg-4",
        "sn1-reg-3",
        "sn1-reg-6",
        "sn1-irr-4",
        "sn1-irr-6",
        "sn1-irr-3",
        "sn1-irr-5",
      ]),
      correct([
        "sn2-disp-4",
        "sn2-disp-3",
        "sn2-disp-9",
        "sn2-disp-6",
        "sn2-disp-8",
      ]),
      correct([
        "sn2-mtow-5a",
        "sn2-mtow-5b",
        "sn2-mtow-7a",
        "sn2-mtow-7b",
      ]),
      correct([
        "sn3-p5-4",
        "sn3-p5-2",
        "sn3-p5-1",
        "sn3-p5-3",
      ]),
      correct([
        "sn3-p10-8",
        "sn3-p10-6",
        "sn3-p10-3",
        "sn3-p10-4",
      ]),
      correct(["sn4-c5-3", "sn4-c5-1"]),
      correct([
        "sn4-c10-7",
        "sn4-c10-4",
        "sn4-c10-1",
      ]),
      correct(["sn5-5p4", "sn5-3p3", "sn5-9m6", "sn5-8m4"]),
      correct(["sn5-9p9", "sn5-10p6", "sn5-13m5"])
    );
    const result = calculateResultsAvSN(responses);
    expect(result.snLevel).toBe(4);
  });

  it("Level 5: combTo20 ≥ 3 AND bareTo20 ≥ 4", () => {
    // combTo20 uses "Altogether" field, not "Response"
    const combTo20Responses: Responses = {};
    ["sn3-c20-8p8", "sn3-c20-7p6", "sn3-c20-10p4", "sn3-c20-5p2"].forEach((id) => {
      combTo20Responses[id] = { Altogether: "correct" };
    });

    const responses = merge(
      correct([
        "sn1-reg-4",
        "sn1-reg-3",
        "sn1-reg-6",
        "sn1-irr-4",
        "sn1-irr-6",
        "sn1-irr-3",
        "sn1-irr-5",
      ]),
      correct([
        "sn2-disp-4",
        "sn2-disp-3",
        "sn2-disp-9",
        "sn2-disp-6",
        "sn2-disp-8",
      ]),
      correct([
        "sn2-mtow-5a",
        "sn2-mtow-5b",
        "sn2-mtow-7a",
        "sn2-mtow-7b",
      ]),
      correct([
        "sn3-p5-4",
        "sn3-p5-2",
        "sn3-p5-1",
        "sn3-p5-3",
      ]),
      correct([
        "sn3-p10-8",
        "sn3-p10-6",
        "sn3-p10-3",
        "sn3-p10-4",
      ]),
      correct(["sn4-c5-3", "sn4-c5-1"]),
      correct([
        "sn4-c10-7",
        "sn4-c10-4",
        "sn4-c10-1",
      ]),
      correct(["sn5-5p4", "sn5-3p3", "sn5-9m6", "sn5-8m4"]),
      correct(["sn5-9p9", "sn5-10p6", "sn5-13m5", "sn5-20m6"]),
      combTo20Responses
    );
    const result = calculateResultsAvSN(responses);
    expect(result.snLevel).toBe(5);
  });
});
