// Score-3b: Structuring Numbers 1 to 20 Extended (Schedule 3B)
// SN20 expanded with additional levels

export type Responses = Record<string, Record<string, string>>;

function countCorrect(itemIds: string[], responses: Responses): number {
  return itemIds.filter((id) => responses[id]?.Correct === "correct").length;
}

export function calculateResults3B(responses: Responses) {
  // TG1: Finger patterns 1–5 (6 items)
  const tg1Items = ["1.1a", "1.1b", "1.1c", "1.1d", "1.1e", "1.1f"];

  // TG2: Regular configurations (4 items)
  const tg2Items = ["2.1a", "2.1b", "2.1c", "2.1d"];

  // TG3: Small partitions and bigger partitions
  const tg3_L2Items = ["3.1a", "3.1b"];  // Level 2 (2 items)
  const tg3_L3Items = ["3.2a", "3.2b"];  // Level 3 (2 items)

  // TG4: Partitions (3 items)
  const tg4Items = ["4.1a", "4.1b", "4.1c"];

  // TG5: Partitions of 5 (6 items)
  const tg5Items = ["5.1a", "5.1b", "5.1c", "5.1d", "5.1e", "5.1f"];

  // TG6: Partitions 1–9 (4 items)
  const tg6Items = ["6.1a", "6.1b", "6.1c", "6.1d"];

  // TG7: Related facts/automaticity (4 items)
  const tg7Items = ["7.1a", "7.1b", "7.1c", "7.1d"];

  // TG8: Addition facts to 20 (8 items)
  const tg8Items = ["8.1a", "8.1b", "8.1c", "8.1d", "8.1e", "8.1f", "8.1g", "8.1h"];

  // TG9: Mixed operations (5 items)
  const tg9Items = ["9.1a", "9.1b", "9.1c", "9.1d", "9.1e"];

  // TG10: Range 2 addition (3 items)
  const tg10Items = ["10.1a", "10.1b", "10.1c"];

  // TG11: Addition with standard notation (3 items)
  const tg11Items = ["11.1a", "11.1b", "11.1c"];

  // TG12: Subtraction with standard notation (3 items)
  const tg12Items = ["12.1a", "12.1b", "12.1c"];

  // TG13: Mixed addition/subtraction standard notation (4 items)
  const tg13Items = ["13.1a", "13.1b", "13.1c", "13.1d"];

  const scores = {
    tg1: countCorrect(tg1Items, responses),
    tg2: countCorrect(tg2Items, responses),
    tg3_1: countCorrect(tg3_L2Items, responses),
    tg3_2: countCorrect(tg3_L3Items, responses),
    tg4: countCorrect(tg4Items, responses),
    tg5: countCorrect(tg5Items, responses),
    tg6: countCorrect(tg6Items, responses),
    tg7: countCorrect(tg7Items, responses),
    tg8: countCorrect(tg8Items, responses),
    tg9: countCorrect(tg9Items, responses),
    tg10: countCorrect(tg10Items, responses),
    tg11: countCorrect(tg11Items, responses),
    tg12: countCorrect(tg12Items, responses),
    tg13: countCorrect(tg13Items, responses),
  };

  let sn20Level = 0;

  if (scores.tg1 >= 3) sn20Level = Math.max(sn20Level, 1);
  if (scores.tg2 >= 2 || scores.tg3_1 >= 1) sn20Level = Math.max(sn20Level, 2);
  if (scores.tg3_2 >= 1 || scores.tg4 >= 2 || scores.tg5 >= 3) sn20Level = Math.max(sn20Level, 3);
  if (scores.tg6 >= 2 || scores.tg10 >= 2) sn20Level = Math.max(sn20Level, 4);
  if (scores.tg8 >= 4) sn20Level = Math.max(sn20Level, 5);
  if (scores.tg9 >= 3) sn20Level = Math.max(sn20Level, 5);
  if (scores.tg11 >= 2) sn20Level = Math.max(sn20Level, 6);
  if (scores.tg12 >= 2) sn20Level = Math.max(sn20Level, 6);
  if (scores.tg13 >= 2 || scores.tg7 >= 3) sn20Level = Math.max(sn20Level, 7);

  return { sn20Level, scores };
}
