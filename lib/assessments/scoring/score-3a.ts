// Score-3a: Number Words and Numerals (Schedule 3A)
// NID, FNWS, BNWS

export type Responses = Record<string, Record<string, string>>;

function isCorrect(responses: Responses, itemId: string): boolean {
  return responses[itemId]?.Correct === "correct";
}

function highestPassedLevel(
  responses: Responses,
  items: Array<{ id: string; targetLevel: number }>
): number {
  const byLevel = new Map<number, { correct: number; total: number }>();
  items.forEach((item) => {
    if (!byLevel.has(item.targetLevel)) byLevel.set(item.targetLevel, { correct: 0, total: 0 });
    const entry = byLevel.get(item.targetLevel)!;
    entry.total++;
    if (isCorrect(responses, item.id)) entry.correct++;
  });
  let highest = 0;
  byLevel.forEach(({ correct, total }, level) => {
    if (correct / total >= 0.5) highest = Math.max(highest, level);
  });
  return highest;
}

function highestSequenceLevel(
  responses: Responses,
  items: Array<{ id: string; targetLevel: number }>
): number {
  let highest = 0;
  items.forEach((item) => {
    if (isCorrect(responses, item.id) && item.targetLevel > highest) {
      highest = item.targetLevel;
    }
  });
  return highest;
}

export function calculateResults3A(responses: Responses) {
  // Task Group 1: Numeral Identification (NID)
  const tg1Items = [
    { id: "1.1", targetLevel: 3 },
    { id: "1.2", targetLevel: 3 },
    { id: "1.3", targetLevel: 3 },
    { id: "1.4", targetLevel: 3 },
    { id: "1.5", targetLevel: 3 },
    { id: "1.6", targetLevel: 3 },
    { id: "1.7", targetLevel: 4 },
    { id: "1.8", targetLevel: 4 },
    { id: "1.9", targetLevel: 4 },
    { id: "1.10", targetLevel: 4 },
  ];

  // Task Group 2: Writing Numerals
  const tg2Items = [
    { id: "2.1", targetLevel: 3 },
    { id: "2.2", targetLevel: 3 },
    { id: "2.3", targetLevel: 3 },
    { id: "2.4", targetLevel: 4 },
    { id: "2.5", targetLevel: 4 },
    { id: "2.6", targetLevel: 4 },
    { id: "2.7", targetLevel: 4 },
    { id: "2.8", targetLevel: 5 },
    { id: "2.9", targetLevel: 5 },
  ];

  // Task Group 3: Backward Number Word Sequences (BNWS)
  const tg3Items = [
    { id: "3.1", targetLevel: 3 },
    { id: "3.2", targetLevel: 4 },
    { id: "3.3", targetLevel: 5 },
    { id: "3.4", targetLevel: 6 },
    { id: "3.5", targetLevel: 7 },
  ];

  // Task Group 4: Number Word Before (NWB)
  const tg4Items = [
    { id: "4.1", targetLevel: 3 },
    { id: "4.2", targetLevel: 3 },
    { id: "4.3", targetLevel: 3 },
    { id: "4.4", targetLevel: 4 },
    { id: "4.5", targetLevel: 4 },
    { id: "4.6", targetLevel: 4 },
    { id: "4.7", targetLevel: 5 },
    { id: "4.8", targetLevel: 5 },
  ];

  // Task Group 5: Forward Number Word Sequences (FNWS)
  const tg5Items = [
    { id: "5.1", targetLevel: 3 },
    { id: "5.2", targetLevel: 4 },
    { id: "5.3", targetLevel: 5 },
    { id: "5.4", targetLevel: 6 },
    { id: "5.5", targetLevel: 7 },
  ];

  // Task Group 6: Number Word After (NWA)
  const tg6Items = [
    { id: "6.1", targetLevel: 3 },
    { id: "6.2", targetLevel: 3 },
    { id: "6.3", targetLevel: 3 },
    { id: "6.4", targetLevel: 4 },
    { id: "6.5", targetLevel: 4 },
    { id: "6.6", targetLevel: 4 },
    { id: "6.7", targetLevel: 5 },
    { id: "6.8", targetLevel: 5 },
  ];

  const nidLevel = highestPassedLevel(responses, tg1Items);
  const writingLevel = highestPassedLevel(responses, tg2Items);
  const bnwsLevel = highestSequenceLevel(responses, tg3Items);
  const nwbLevel = highestPassedLevel(responses, tg4Items);
  const fnwsLevel = highestSequenceLevel(responses, tg5Items);
  const nwaLevel = highestPassedLevel(responses, tg6Items);

  // Combined NWS level = max of FNWS and BNWS sequence performance
  const nwsCombinedLevel = Math.max(fnwsLevel, bnwsLevel);

  return {
    nidLevel,
    writingLevel,
    bnwsLevel,
    nwbLevel,
    fnwsLevel,
    nwaLevel,
    nwsCombinedLevel,
  };
}
