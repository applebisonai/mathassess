// Score-2a: Early Number Words and Numerals (Schedule 2A)
// Extracts FNWS, NID, BNWS scoring logic

export type Responses = Record<string, Record<string, string>>;

function calcScore(items: string[], responses: Responses): { correct: number; total: number } | null {
  const scoreableIds = items.filter((id) => responses[id]?.["Response"] !== undefined);
  if (scoreableIds.length === 0) return null;
  const correct = scoreableIds.filter((id) => responses[id]?.["Response"] === "correct").length;
  return { correct, total: scoreableIds.length };
}

export function calculateResults2A(responses: Responses) {
  // FNWS level: based on NWA (Number Word After) items
  // NWA 0–10
  const nwa01Items = ["2.1a", "2.1b", "2.1c", "2.1d", "2.1e"];
  // NWA 11–30
  const nwa1130Items = ["2.2a", "2.2b", "2.2c", "2.2d", "2.2e"];
  // NWA 31–100
  const nwa31100Items = ["2.3a", "2.3b", "2.3c", "2.3d", "2.3e"];

  const nwa01Score = calcScore(nwa01Items, responses);
  const nwa1130Score = calcScore(nwa1130Items, responses);
  const nwa31100Score = calcScore(nwa31100Items, responses);

  let fnwsLevel = 1;
  if (nwa01Score && nwa01Score.correct >= 4) fnwsLevel = 2;
  if (nwa1130Score && nwa1130Score.correct >= 4) fnwsLevel = 3;
  if (nwa31100Score && nwa31100Score.correct >= 4) fnwsLevel = 5;

  // NID level: based on numeral identification items
  const nid1Items = ["3.1a", "3.1b", "3.1c", "3.1d", "3.1e", "3.1f", "3.1g"];
  const nid2Items = ["3.2a", "3.2b", "3.2c", "3.2d", "3.2e", "3.2f", "3.2g"];
  const nid3Items = ["3.3a", "3.3b", "3.3c", "3.3d", "3.3e", "3.3f", "3.3g", "3.3h"];
  const nid4Items = ["3.4a", "3.4b", "3.4c", "3.4d", "3.4e"];

  const nid1Score = calcScore(nid1Items, responses);
  const nid2Score = calcScore(nid2Items, responses);
  const nid3Score = calcScore(nid3Items, responses);
  const nid4Score = calcScore(nid4Items, responses);

  let nidLevel = 0;
  if (nid1Score && nid1Score.correct >= 5) nidLevel = 1;
  if (nid2Score && nid2Score.correct >= 5) nidLevel = 2;
  if (nid3Score && nid3Score.correct >= 6) nidLevel = 3;
  if (nid4Score && nid4Score.correct >= 4) nidLevel = 4;

  // BNWS level: based on NWB (Number Word Before) items
  // NWB 1–10
  const nwb110Items = ["6.1a", "6.1b", "6.1c", "6.1d", "6.1e"];
  // NWB 11–30
  const nwb1130Items = ["6.2a", "6.2b", "6.2c", "6.2d", "6.2e"];
  // NWB 31–100
  const nwb31100Items = ["6.3a", "6.3b", "6.3c", "6.3d", "6.3e"];

  const nwb110Score = calcScore(nwb110Items, responses);
  const nwb1130Score = calcScore(nwb1130Items, responses);
  const nwb31100Score = calcScore(nwb31100Items, responses);

  let bnwsLevel = 1;
  if (nwb110Score && nwb110Score.correct >= 4) bnwsLevel = 2;
  if (nwb1130Score && nwb1130Score.correct >= 4) bnwsLevel = 4;
  if (nwb31100Score && nwb31100Score.correct >= 4) bnwsLevel = 5;

  return {
    fnwsLevel,
    nidLevel,
    bnwsLevel,
    details: {
      nwa01Score,
      nwa1130Score,
      nwa31100Score,
      nid1Score,
      nid2Score,
      nid3Score,
      nid4Score,
      nwb110Score,
      nwb1130Score,
      nwb31100Score,
    },
  };
}
