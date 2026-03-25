import { describe, it, expect } from "vitest";
import { calculateResultsAvAS } from "../score-av-as";
import type { Responses } from "../score-av-as";

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

describe("score-av-as (Assessment Variant - Addition and Subtraction)", () => {
  it("Level 0: No items correct", () => {
    const result = calculateResultsAvAS({});
    expect(result.casLevel).toBe(0);
  });

  it("Level 1: countCollection OR unscreened correct", () => {
    const responses = correct(["as1-count-13"]);
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(1);
  });

  it("Level 2: partiallyScreened correct with level 1 met", () => {
    const responses = merge(
      correct(["as1-count-13"]),
      correct(["as1-part-7p2"])
    );
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(2);
  });

  it("Level 3: ≥2 of [ts4p2, ts6p3, removed7m3, removed16m4] with level 2 met", () => {
    const responses = merge(
      correct(["as1-count-13"]),
      correct(["as1-part-7p2"]),
      correct(["as1-ts-4p2", "as1-ts-6p3"])
    );
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(3);
  });

  it("Level 4: missingAddend OR ts9p5 with level 3 met", () => {
    const responses = merge(
      correct(["as1-count-13"]),
      correct(["as1-part-7p2"]),
      correct(["as1-ts-4p2", "as1-ts-6p3"]),
      correct(["as1-ma-8pbox11"])
    );
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(4);
  });

  it("Level 5: missingSubtrahend OR ≥2 of [bare8p4, bare13p3] with level 4 met", () => {
    const responses = merge(
      correct(["as1-count-13"]),
      correct(["as1-part-7p2"]),
      correct(["as1-ts-4p2", "as1-ts-6p3"]),
      correct(["as1-ma-8pbox11"]),
      correct(["as2-ms-9mbox7"])
    );
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(5);
  });

  it("Level 6: ≥2 of [bare17m6, bare11m8] OR ≥2 of [comm4p12, link15p3, link18m3]", () => {
    const responses = merge(
      correct(["as1-count-13"]),
      correct(["as1-part-7p2"]),
      correct(["as1-ts-4p2", "as1-ts-6p3"]),
      correct(["as1-ma-8pbox11"]),
      correct(["as2-ms-9mbox7"]),
      correct(["as3-sub-17m6", "as3-sub-11m8"])
    );
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(6);
  });

  it("Perfect score all constructs", () => {
    const responses = correct([
      "as1-count-13",
      "as1-unsc-8p7",
      "as1-part-7p2",
      "as1-ts-4p2",
      "as1-ts-6p3",
      "as1-ts-9p5",
      "as1-ma-8pbox11",
      "as2-ri-7m3",
      "as2-ri-16m4",
      "as2-ms-9mbox7",
      "as3-add-8p4",
      "as3-add-13p3",
      "as3-sub-17m6",
      "as3-sub-11m8",
      "as4-comm-4p12",
      "as4-link-15p3",
      "as4-link-18m3",
      "as4-rel-21m4",
      "as4-rel-21m17",
    ]);
    const result = calculateResultsAvAS(responses);
    expect(result.casLevel).toBe(6);
  });
});
