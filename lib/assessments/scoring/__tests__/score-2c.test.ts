import { describe, it, expect } from "vitest";
import { calculateResults2C } from "../score-2c";
import type { Responses } from "../score-2c";

function merge(...maps: Responses[]): Responses {
  return Object.assign({}, ...maps);
}

function correct(id: string, strategy = "Non-counting"): Responses {
  return { [id]: { Correct: "correct", Strategy: strategy } };
}

function incorrect(id: string, strategy = ""): Responses {
  return { [id]: { Correct: "incorrect", Strategy: strategy } };
}

describe("score-2c (Schedule 2C - SEAL)", () => {
  describe("SEAL Level 0: Emergent", () => {
    it("No TG1 items correct", () => {
      const responses = merge(
        incorrect("1.1"),
        incorrect("1.2"),
        incorrect("1.3"),
        incorrect("2.1"),
        incorrect("3.1"),
        incorrect("3.2"),
        incorrect("5.1"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(0);
    });
  });

  describe("SEAL Level 1: Perceptual", () => {
    it("TG1 has any correct item (any strategy)", () => {
      const responses = merge(
        correct("1.1", "CF1-3x"),
        incorrect("1.2"),
        incorrect("1.3"),
        incorrect("2.1"),
        incorrect("3.1"),
        incorrect("3.2"),
        incorrect("5.1"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(1);
    });
  });

  describe("SEAL Level 2: Figurative", () => {
    it("TG1 correct with figurative strategy OR TG3 correct", () => {
      const responses = merge(
        correct("1.1", "CF1-1x"),
        incorrect("1.2"),
        incorrect("1.3"),
        incorrect("2.1"),
        correct("3.1", "CF1-1x"),
        incorrect("3.2"),
        incorrect("5.1"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(2);
    });
  });

  describe("SEAL Level 3: Counting-on", () => {
    it("TG2 correct with counting-on strategy (COF, Non-counting, or Known Fact)", () => {
      const responses = merge(
        correct("1.1", "CF1-1x"),
        incorrect("1.2"),
        incorrect("1.3"),
        correct("2.1", "COF"),
        incorrect("3.1"),
        incorrect("3.2"),
        incorrect("5.1"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(3);
    });
  });

  describe("SEAL Level 4: CDT/CUT", () => {
    it("Level 3+ AND TG5 has correct with advanced strategy AND at least one TG5 correct", () => {
      const responses = merge(
        correct("1.1", "CF1-1x"),
        incorrect("1.2"),
        incorrect("1.3"),
        correct("2.1", "COF"),
        incorrect("3.1"),
        incorrect("3.2"),
        correct("5.1", "CDT"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(4);
    });
  });

  describe("SEAL Level 5: Facile", () => {
    it("Non-counting observed 3+ times across TG items", () => {
      const responses = merge(
        correct("1.1", "Non-counting"),
        incorrect("1.2"),
        incorrect("1.3"),
        correct("2.1", "Non-counting"),
        correct("3.1", "Non-counting"),
        incorrect("3.2"),
        incorrect("5.1"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(5);
    });

    it("TG3 non-counting AND TG5 non-counting", () => {
      const responses = merge(
        correct("1.1", "CF1-1x"),
        incorrect("1.2"),
        incorrect("1.3"),
        correct("2.1", "COF"),
        correct("3.1", "Non-counting"),
        incorrect("3.2"),
        correct("5.1", "Non-counting"),
        incorrect("5.2"),
        incorrect("5.3"),
        incorrect("6.1"),
        incorrect("6.2"),
        incorrect("7.1")
      );
      const result = calculateResults2C(responses);
      expect(result.sealLevel).toBe(5);
    });
  });
});
