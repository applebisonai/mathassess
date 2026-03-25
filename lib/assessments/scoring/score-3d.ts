// Score-3d: Addition and Subtraction (Schedule 3D)
// Addition & Subtraction (A&S)

export type Responses = Record<string, Record<string, string>>;

function countCorrect(itemIds: string[], responses: Responses): number {
  return itemIds.filter((id) => responses[id]?.Correct === "correct").length;
}

export function calculateResults3D(responses: Responses) {
  // TG1: Add/sub decuple (6 items)
  const tg1Items = ["1.1a", "1.1b", "1.1c", "1.1d", "1.1e", "1.1f"];

  // TG2: 2-digit no regroup (5 items)
  const tg2Items = ["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"];

  // TG3: 2-digit add regroup (4 items)
  const tg3Items = ["3.1a", "3.1b", "3.1c", "3.1d"];

  // TG4: 2-digit sub regroup (4 items)
  const tg4Items = ["4.1a", "4.1b", "4.1c", "4.1d"];

  // TG5: 3-digit regroup (5 items)
  const tg5Items = ["5.1a", "5.1b", "5.1c", "5.1d", "5.1e"];

  // TG6: Decuple after/before (5 items)
  const tg6Items = ["6.1a", "6.1b", "6.1c", "6.1d", "6.1e"];

  // TG7: Add-up-from/sub-down-to (4 items)
  const tg7Items = ["7.1a", "7.1b", "7.1c", "7.1d"];

  // TG8: To/from decuple small (6 items)
  const tg8Items = ["8.1a", "8.1b", "8.1c", "8.1d", "8.1e", "8.1f"];

  // TG9: To/from decuple large (4 items)
  const tg9Items = ["9.1a", "9.1b", "9.1c", "9.1d"];

  // TG10: Across decuple (5 items)
  const tg10Items = ["10.1a", "10.1b", "10.1c", "10.1d", "10.1e"];

  const s = {
    tg1: countCorrect(tg1Items, responses),
    tg2: countCorrect(tg2Items, responses),
    tg3: countCorrect(tg3Items, responses),
    tg4: countCorrect(tg4Items, responses),
    tg5: countCorrect(tg5Items, responses),
    tg6: countCorrect(tg6Items, responses),
    tg7: countCorrect(tg7Items, responses),
    tg8: countCorrect(tg8Items, responses),
    tg9: countCorrect(tg9Items, responses),
    tg10: countCorrect(tg10Items, responses),
  };

  let asLevel = 0;
  if (s.tg6 >= 1 || s.tg7 >= 1 || s.tg1 >= 1) asLevel = 1;
  if (s.tg8 >= 1 || s.tg2 >= 1) asLevel = Math.max(asLevel, 2);
  if (s.tg9 >= 1) asLevel = Math.max(asLevel, 3);
  if (s.tg10 >= 1) asLevel = Math.max(asLevel, 4);
  if (s.tg3 >= 1) asLevel = Math.max(asLevel, 5);
  if (s.tg4 >= 1) asLevel = Math.max(asLevel, 6);

  return { asLevel, scores: s };
}
