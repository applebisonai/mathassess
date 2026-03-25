// Score-2c: Early Arithmetical Strategies (Schedule 2C)
// Stages of Early Arithmetical Learning (SEAL)

export type Responses = Record<string, Record<string, string>>;

function getStrategy(responses: Responses, itemId: string): string {
  return responses[itemId]?.Strategy ?? "";
}

function isCorrect(responses: Responses, itemId: string): boolean {
  return responses[itemId]?.Correct === "correct";
}

export function calculateResults2C(responses: Responses) {
  // TG1 — Two Screened Collections
  const tg1Any = ["1.1", "1.2", "1.3"].some((id) => isCorrect(responses, id));
  const tg1Strategies = ["1.1", "1.2", "1.3"].map((id) => getStrategy(responses, id));
  const tg1HasFigurative = tg1Strategies.some((s) => s === "CF1-1x" || s === "COF" || s === "Non-counting" || s === "Known Fact");
  const tg1NonCounting = tg1Strategies.some((s) => s === "Non-counting" || s === "Known Fact");

  // TG2 — Missing Addend (key branching task)
  const tg2Correct = isCorrect(responses, "2.1");
  const tg2Strategy = getStrategy(responses, "2.1");
  const tg2CountingOn = tg2Correct && (tg2Strategy === "COF" || tg2Strategy === "Non-counting" || tg2Strategy === "Known Fact");

  // TG3 — Partially Screened
  const tg3Any = ["3.1", "3.2"].some((id) => isCorrect(responses, id));
  const tg3Strategies = ["3.1", "3.2"].map((id) => getStrategy(responses, id));
  const tg3NonCounting = tg3Strategies.some((s) => s === "Non-counting" || s === "Known Fact");

  // TG5 — Removed Items
  const tg5_1Correct = isCorrect(responses, "5.1");
  const tg5_2Correct = isCorrect(responses, "5.2");
  const tg5Strategies = ["5.1", "5.2", "5.3"].map((id) => getStrategy(responses, id));
  const tg5HasAdvanced = tg5Strategies.some((s) => s === "CDT" || s === "CUT" || s === "Non-counting");
  const tg5NonCounting = tg5Strategies.some((s) => s === "Non-counting");

  // TG6 — Written Subtraction
  const tg6Strategies = ["6.1", "6.2"].map((id) => getStrategy(responses, id));
  const tg6NonCounting = tg6Strategies.some((s) => s === "Non-counting");

  // TG7 — Missing Subtrahend
  const tg7Strategy = getStrategy(responses, "7.1");
  const tg7NonCounting = tg7Strategy === "Non-counting";

  // Count total non-counting observations
  const allStrategies = [...tg1Strategies, tg2Strategy, ...tg3Strategies, ...tg5Strategies, ...tg6Strategies, tg7Strategy];
  const nonCountingTotal = allStrategies.filter((s) => s === "Non-counting" || s === "Known Fact").length;

  // Level determination
  let sealLevel = 0;

  if (tg1Any) sealLevel = 1;
  if (sealLevel >= 1 && (tg1HasFigurative || tg3Any)) sealLevel = Math.max(sealLevel, 2);
  if (tg2CountingOn) sealLevel = Math.max(sealLevel, 3);
  if (sealLevel >= 3 && (tg5_1Correct || tg5_2Correct) && tg5HasAdvanced) sealLevel = Math.max(sealLevel, 4);
  if (nonCountingTotal >= 3 || (tg5NonCounting && tg6NonCounting) || (tg3NonCounting && tg5NonCounting)) sealLevel = Math.max(sealLevel, 5);

  return {
    sealLevel,
    details: {
      tg1Any,
      tg2CountingOn,
      tg2Strategy,
      tg3Any,
      tg5_1Correct,
      tg5_2Correct,
      tg5HasAdvanced,
      nonCountingTotal,
    },
  };
}
