// Score-2b: Early Structuring (Schedule 2B)
// Structuring Numbers 1-20 (SN20)

export type Responses = Record<string, Record<string, string>>;

function calcGroupScore(itemIds: string[], responses: Responses): number {
  return itemIds.filter((id) => responses[id]?.["Response"] === "correct").length;
}

export function calculateResults2B(responses: Responses) {
  // TG1: Finger patterns 1–5 (1.1)
  const tg1Items11 = ["1.1a", "1.1b", "1.1c", "1.1d"];
  // TG2: Regular configurations (2.1)
  const tg2Items = ["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"];
  // TG3: Small doubles (3.1)
  const tg3Items = ["3.1a", "3.1b", "3.1c", "3.1d"];
  // TG4: Small partitions of 10 (4.1)
  const tg4Items = ["4.1a", "4.1b", "4.1c", "4.1d"];
  // TG5: Partitions of 5 (5.1)
  const tg5Items = ["5.1a", "5.1b", "5.1c"];
  // TG6: Five-plus facts (6.1)
  const tg6Items = ["6.1a", "6.1b", "6.1c", "6.1d"];

  const s11 = calcGroupScore(tg1Items11, responses);
  const s2 = calcGroupScore(tg2Items, responses);
  const s3 = calcGroupScore(tg3Items, responses);
  const s4 = calcGroupScore(tg4Items, responses);
  const s5 = calcGroupScore(tg5Items, responses);
  const s6 = calcGroupScore(tg6Items, responses);

  const level1 = !!(s11 >= 3 && s2 >= 4);
  const level2 = level1 && !!(s3 >= 3 && s4 >= 3);
  const level3 = level2 && !!(s5 >= 2 && s6 >= 3);

  const sn20Level = level3 ? 3 : level2 ? 2 : level1 ? 1 : 0;

  return {
    sn20Level,
    scores: { s11, s2, s3, s4, s5, s6 },
  };
}
