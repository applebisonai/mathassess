import { describe, it, expect } from "vitest";
import { calculateResults3B } from "../score-3b";
import type { Responses } from "../score-3b";

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

describe("score-3b (Schedule 3B - SN20 Extended)", () => {
  it("Level 0: No items correct", () => {
    const result = calculateResults3B({});
    expect(result.sn20Level).toBe(0);
  });

  it("Level 1: TG1 ≥ 3/6 (edge case)", () => {
    const responses = correct(["1.1a", "1.1b", "1.1c"]);
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(1);
  });

  it("Level 2: TG2 ≥ 2/4", () => {
    const responses = merge(
      correct(["1.1a", "1.1b", "1.1c"]),
      correct(["2.1a", "2.1b"])
    );
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(2);
  });

  it("Level 3: TG5 ≥ 3/6 (edge case)", () => {
    const responses = merge(
      correct(["1.1a", "1.1b", "1.1c"]),
      correct(["2.1a", "2.1b"]),
      correct(["5.1a", "5.1b", "5.1c"])
    );
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(3);
  });

  it("Level 4: TG6 ≥ 2/4", () => {
    const responses = merge(
      correct(["1.1a", "1.1b", "1.1c"]),
      correct(["2.1a", "2.1b"]),
      correct(["5.1a", "5.1b", "5.1c"]),
      correct(["6.1a", "6.1b"])
    );
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(4);
  });

  it("Level 5: TG8 ≥ 4/8", () => {
    const responses = merge(
      correct(["1.1a", "1.1b", "1.1c"]),
      correct(["2.1a", "2.1b"]),
      correct(["5.1a", "5.1b", "5.1c"]),
      correct(["6.1a", "6.1b"]),
      correct(["8.1a", "8.1b", "8.1c", "8.1d"])
    );
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(5);
  });

  it("Level 6: TG11 ≥ 2/3", () => {
    const responses = merge(
      correct(["1.1a", "1.1b", "1.1c"]),
      correct(["2.1a", "2.1b"]),
      correct(["5.1a", "5.1b", "5.1c"]),
      correct(["6.1a", "6.1b"]),
      correct(["8.1a", "8.1b", "8.1c", "8.1d"]),
      correct(["11.1a", "11.1b"])
    );
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(6);
  });

  it("Level 7: TG13 ≥ 2/4", () => {
    const responses = correct([
      "1.1a",
      "1.1b",
      "1.1c",
      "2.1a",
      "2.1b",
      "5.1a",
      "5.1b",
      "5.1c",
      "6.1a",
      "6.1b",
      "8.1a",
      "8.1b",
      "8.1c",
      "8.1d",
      "11.1a",
      "11.1b",
      "13.1a",
      "13.1b",
    ]);
    const result = calculateResults3B(responses);
    expect(result.sn20Level).toBe(7);
  });
});
