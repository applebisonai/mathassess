import { describe, it, expect } from "vitest";
import { calculateResults3C } from "../score-3c";
import type { Responses } from "../score-3c";

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

describe("score-3c (Schedule 3C - CPV)", () => {
  it("Level 0: No items correct", () => {
    const result = calculateResults3C({});
    expect(result.cpvLevel).toBe(0);
  });

  it("Level 1: TG1 ≥ 7/11 (edge case)", () => {
    const responses = correct([
      "1.1a",
      "1.1b",
      "1.1c",
      "1.1d",
      "1.1e",
      "1.1f",
      "1.1g",
    ]);
    const result = calculateResults3C(responses);
    expect(result.cpvLevel).toBe(1);
  });

  it("Level 2: TG4 Seq1 ≥ 5/8 (edge case)", () => {
    const responses = merge(
      correct([
        "1.1a",
        "1.1b",
        "1.1c",
        "1.1d",
        "1.1e",
        "1.1f",
        "1.1g",
      ]),
      correct(["4.1a", "4.1b", "4.1c", "4.1d", "4.1e"])
    );
    const result = calculateResults3C(responses);
    expect(result.cpvLevel).toBe(2);
  });

  it("Level 3: TG5 L3 ≥ 3/4 AND TG6 L3 ≥ 3/4 (edge case)", () => {
    const responses = merge(
      correct([
        "1.1a",
        "1.1b",
        "1.1c",
        "1.1d",
        "1.1e",
        "1.1f",
        "1.1g",
      ]),
      correct(["4.1a", "4.1b", "4.1c", "4.1d", "4.1e"]),
      correct(["5.1a", "5.1b", "5.1c"]),
      correct(["6.1a", "6.1b", "6.1c"])
    );
    const result = calculateResults3C(responses);
    expect(result.cpvLevel).toBe(3);
  });

  it("Level 4: TG5 L4 ≥ 2/4 (edge case)", () => {
    const responses = merge(
      correct([
        "1.1a",
        "1.1b",
        "1.1c",
        "1.1d",
        "1.1e",
        "1.1f",
        "1.1g",
      ]),
      correct(["4.1a", "4.1b", "4.1c", "4.1d", "4.1e"]),
      correct(["5.1a", "5.1b", "5.1c"]),
      correct(["6.1a", "6.1b", "6.1c"]),
      correct(["5.2a", "5.2b"])
    );
    const result = calculateResults3C(responses);
    expect(result.cpvLevel).toBe(4);
  });

  it("Level 4: Perfect across all levels", () => {
    const responses = merge(
      correct([
        "1.1a",
        "1.1b",
        "1.1c",
        "1.1d",
        "1.1e",
        "1.1f",
        "1.1g",
        "1.1h",
        "1.1i",
        "1.1j",
        "1.1k",
      ]),
      correct([
        "2.1a",
        "2.1b",
        "2.1c",
        "2.1d",
        "2.1e",
        "2.1f",
        "2.1g",
        "2.1h",
      ]),
      correct([
        "3.1a",
        "3.1b",
        "3.1c",
        "3.1d",
        "3.1e",
        "3.1f",
        "3.1g",
      ]),
      correct([
        "4.1a",
        "4.1b",
        "4.1c",
        "4.1d",
        "4.1e",
        "4.1f",
        "4.1g",
        "4.1h",
      ]),
      correct([
        "5.1a",
        "5.1b",
        "5.1c",
        "5.1d",
        "5.2a",
        "5.2b",
        "5.2c",
        "5.2d",
      ]),
      correct([
        "6.1a",
        "6.1b",
        "6.1c",
        "6.1d",
        "6.2a",
        "6.2b",
        "6.2c",
      ]),
      correct(["7.1a", "7.1b", "7.1c", "7.1d"]),
      correct([
        "8.1a",
        "8.1b",
        "8.1c",
        "8.1d",
        "8.1e",
        "8.1f",
        "8.2a",
        "8.2b",
        "8.2c",
        "8.2d",
        "8.2e",
        "8.2f",
      ])
    );
    const result = calculateResults3C(responses);
    expect(result.cpvLevel).toBe(4);
  });
});
