// Score-3c: Combining and Partitioning (Schedule 3C)
// Combining, Partitioning and Variation (CPV)

export type Responses = Record<string, Record<string, string>>;

function countCorrect(itemIds: string[], responses: Responses): number {
  return itemIds.filter((id) => responses[id]?.Correct === "correct").length;
}

export function calculateResults3C(responses: Responses) {
  // TG1: Visible collections (11 items)
  const tg1Items = ["1.1a", "1.1b", "1.1c", "1.1d", "1.1e", "1.1f", "1.1g", "1.1h", "1.1i", "1.1j", "1.1k"];

  // TG2: Screened collections (8 items)
  const tg2Items = ["2.1a", "2.1b", "2.1c", "2.1d", "2.1e", "2.1f", "2.1g", "2.1h"];

  // TG3: Partially screened (7 items)
  const tg3Items = ["3.1a", "3.1b", "3.1c", "3.1d", "3.1e", "3.1f", "3.1g"];

  // TG4: Sequencing (13 items with sequences)
  const tg4Seq1Items = ["4.1a", "4.1b", "4.1c", "4.1d", "4.1e", "4.1f", "4.1g", "4.1h"];  // Sequence 1

  // TG5: Splitting (8 items split by level)
  const tg5_L3Items = ["5.1a", "5.1b", "5.1c", "5.1d"];  // Level 3 (4 items)
  const tg5_L4Items = ["5.2a", "5.2b", "5.2c", "5.2d"];  // Level 4 (4 items)

  // TG6: Partitioning (7 items split by level)
  const tg6_L3Items = ["6.1a", "6.1b", "6.1c", "6.1d"];  // Level 3 (4 items)
  const tg6_L4Items = ["6.2a", "6.2b", "6.2c"];          // Level 4 (3 items)

  // TG7: Variation (4 items)
  const tg7Items = ["7.1a", "7.1b", "7.1c", "7.1d"];

  // TG8: Flexible representation (12 items)
  const tg8Items = [
    "8.1a", "8.1b", "8.1c", "8.1d", "8.1e", "8.1f",
    "8.2a", "8.2b", "8.2c", "8.2d", "8.2e", "8.2f",
  ];

  const scores = {
    tg1: countCorrect(tg1Items, responses),
    tg2: countCorrect(tg2Items, responses),
    tg3: countCorrect(tg3Items, responses),
    tg4_seq1: countCorrect(tg4Seq1Items, responses),
    tg5_L3: countCorrect(tg5_L3Items, responses),
    tg5_L4: countCorrect(tg5_L4Items, responses),
    tg6_L3: countCorrect(tg6_L3Items, responses),
    tg6_L4: countCorrect(tg6_L4Items, responses),
    tg7: countCorrect(tg7Items, responses),
    tg8: countCorrect(tg8Items, responses),
  };

  let cpvLevel = 0;

  // Level 1 — TG1 ≥7/11, OR TG2 ≥5/8, OR TG3 ≥5/7
  if (scores.tg1 >= 7 || scores.tg2 >= 5 || scores.tg3 >= 5) cpvLevel = Math.max(cpvLevel, 1);

  // Level 2 — TG4 Seq1 ≥5/8
  if (scores.tg4_seq1 >= 5) cpvLevel = Math.max(cpvLevel, 2);

  // Level 3 — TG5 2-digit ≥3/4 AND TG6 2-digit ≥3/4
  if (scores.tg5_L3 >= 3 && scores.tg6_L3 >= 3) cpvLevel = Math.max(cpvLevel, 3);

  // Level 4 — TG5 3-digit ≥2/4, OR TG6 3-digit ≥2/3, OR TG7 ≥3/4, OR TG8 ≥8/12
  if (scores.tg5_L4 >= 2 || scores.tg6_L4 >= 2 || scores.tg7 >= 3 || scores.tg8 >= 8)
    cpvLevel = Math.max(cpvLevel, 4);

  return { cpvLevel, scores };
}
