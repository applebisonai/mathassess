import { describe, it, expect } from "vitest";
import { calculateResults3D } from "../score-3d";
import type { Responses } from "../score-3d";

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

describe("score-3d (Schedule 3D - A&S)", () => {
  it("Level 0: No items correct", () => {
    const result = calculateResults3D({});
    expect(result.asLevel).toBe(0);
  });

  it("Level 1: TG6 ≥ 1/5", () => {
    const responses = correct(["6.1a"]);
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(1);
  });

  it("Level 1: TG7 ≥ 1/4", () => {
    const responses = correct(["7.1a"]);
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(1);
  });

  it("Level 1: TG1 ≥ 1/6", () => {
    const responses = correct(["1.1a"]);
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(1);
  });

  it("Level 2: TG8 ≥ 1/6 with level 1 met", () => {
    const responses = merge(
      correct(["6.1a"]),
      correct(["8.1a"])
    );
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(2);
  });

  it("Level 2: TG2 ≥ 1/5 with level 1 met", () => {
    const responses = merge(
      correct(["7.1a"]),
      correct(["2.1a"])
    );
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(2);
  });

  it("Level 3: TG9 ≥ 1/4 with level 2 met", () => {
    const responses = merge(
      correct(["6.1a"]),
      correct(["8.1a"]),
      correct(["9.1a"])
    );
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(3);
  });

  it("Level 4: TG10 ≥ 1/5 with level 3 met", () => {
    const responses = merge(
      correct(["6.1a"]),
      correct(["8.1a"]),
      correct(["9.1a"]),
      correct(["10.1a"])
    );
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(4);
  });

  it("Level 5: TG3 ≥ 1/4 with level 4 met", () => {
    const responses = merge(
      correct(["6.1a"]),
      correct(["8.1a"]),
      correct(["9.1a"]),
      correct(["10.1a"]),
      correct(["3.1a"])
    );
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(5);
  });

  it("Level 6: TG4 ≥ 1/4", () => {
    const responses = merge(
      correct(["6.1a"]),
      correct(["8.1a"]),
      correct(["9.1a"]),
      correct(["10.1a"]),
      correct(["3.1a"]),
      correct(["4.1a"])
    );
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(6);
  });

  it("Perfect score all items correct", () => {
    const allItems = [
      "1.1a", "1.1b", "1.1c", "1.1d", "1.1e", "1.1f",
      "2.1a", "2.1b", "2.1c", "2.1d", "2.1e",
      "3.1a", "3.1b", "3.1c", "3.1d",
      "4.1a", "4.1b", "4.1c", "4.1d",
      "5.1a", "5.1b", "5.1c", "5.1d", "5.1e",
      "6.1a", "6.1b", "6.1c", "6.1d", "6.1e",
      "7.1a", "7.1b", "7.1c", "7.1d",
      "8.1a", "8.1b", "8.1c", "8.1d", "8.1e", "8.1f",
      "9.1a", "9.1b", "9.1c", "9.1d",
      "10.1a", "10.1b", "10.1c", "10.1d", "10.1e",
    ];
    const responses = correct(allItems);
    const result = calculateResults3D(responses);
    expect(result.asLevel).toBe(6);
  });
});
