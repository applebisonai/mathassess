// Score-av-pv: Assessment Variant - Place Value
// CPV assessment variant

export type Responses = Record<string, Record<string, string>>;

export function calculateResultsAvPV(responses: Responses) {
  const tg1Correct = ["1.1", "1.2", "1.3", "1.4"].filter(
    (id) => responses[id]?.Response === "correct"
  ).length;

  const tg2Seq1 = ["2.2a", "2.2b", "2.2c", "2.2d", "2.2e", "2.2f", "2.2g", "2.2h"];
  const tg2Seq2 = ["2.3a", "2.3b", "2.3c", "2.3d", "2.3e", "2.3f"];
  const TG2_EXPECTED: Record<string, number> = {
    "2.2a": 10,
    "2.2b": 13,
    "2.2c": 33,
    "2.2d": 37,
    "2.2e": 40,
    "2.2f": 50,
    "2.2g": 52,
    "2.2h": 72,
    "2.3a": 4,
    "2.3b": 14,
    "2.3c": 44,
    "2.3d": 48,
    "2.3e": 61,
    "2.3f": 85,
  };

  const tg2Seq1Correct = tg2Seq1.filter((id) => {
    const entered = parseInt(responses[id]?.["Student said"] ?? "");
    return !isNaN(entered) && entered === TG2_EXPECTED[id];
  }).length;

  const tg2Correct = tg2Seq2.reduce((count, id) => {
    const entered = parseInt(responses[id]?.["Student said"] ?? "");
    return count + (!isNaN(entered) && entered === TG2_EXPECTED[id] ? 1 : 0);
  }, tg2Seq1Correct);

  const tg2Total = tg2Seq1.length + tg2Seq2.length;

  const tg2Strat1 = responses["2.2s"]?.Strategy ?? "";
  const tg2Strat2 = responses["2.3s"]?.Strategy ?? "";
  const tg2UsesJumpOrSplit =
    tg2Strat1 === "Jump" || tg2Strat1 === "Split" || tg2Strat2 === "Jump" || tg2Strat2 === "Split";

  const tg3_2digit = ["3.1", "3.2", "3.3", "3.4"];
  const tg3_3digit = ["3.5", "3.6", "3.7", "3.8"];
  const tg3Correct2 = tg3_2digit.filter((id) => responses[id]?.Response === "correct").length;
  const tg3Correct3 = tg3_3digit.filter((id) => responses[id]?.Response === "correct").length;

  const tg3EfficientCount = tg3_2digit.filter((id) => {
    const s = responses[id]?.Strategy;
    return s === "Jump" || s === "Split" || s === "Split-Jump";
  }).length;

  const tg3CountingBy1s = [...tg3_2digit, ...tg3_3digit].some((id) => responses[id]?.Strategy === "Counts by 1's");

  let cpvLevel = 0;

  // Level 1: Basic (≥2/4 in TG1)
  if (tg1Correct >= 2) cpvLevel = 1;

  // Level 2: Counting strategy (TG2 ≥6/14)
  if (tg2Correct >= 6) cpvLevel = Math.max(cpvLevel, 2);

  // Level 3: Partial efficiency (TG3 2-digit ≥2/4, no counting-by-1s)
  if (tg3Correct2 >= 2 && !tg3CountingBy1s) cpvLevel = Math.max(cpvLevel, 3);

  // Level 4: Efficient in range, 3-digit emerging (TG3 ≥3/4 2-digit and ≥1/4 3-digit)
  if (tg3EfficientCount >= 3 && tg3Correct3 >= 1) cpvLevel = Math.max(cpvLevel, 4);

  // Level 5: Facile in range (TG3 ≥3/4 both 2-digit and 3-digit efficient)
  if (tg3EfficientCount >= 3 && tg3Correct3 >= 3) cpvLevel = Math.max(cpvLevel, 5);

  return { cpvLevel };
}
