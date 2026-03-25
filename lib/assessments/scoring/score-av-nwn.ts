// Score-av-nwn: Assessment Variant - Number Words and Numerals
// FNWS, BNWS, NID

export type Responses = Record<string, Record<string, string>>;

export function calculateResultsAvNWN(responses: Responses) {
  // FNWS Level (0–5)
  const tg1a = responses["tg1-a"]?.Correct === "correct";
  const tg1b = responses["tg1-b"]?.Correct === "correct";
  const tg1c = responses["tg1-c"]?.Correct === "correct";
  const tg1d = responses["tg1-d"]?.Correct === "correct";

  const nwa0to10 = ["nwa-5", "nwa-9", "nwa-7", "nwa-3", "nwa-6"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwa11to30 = ["nwa-14", "nwa-20", "nwa-11", "nwa-29", "nwa-23", "nwa-12", "nwa-19"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwa31to100 = ["nwa-59", "nwa-65", "nwa-32", "nwa-70", "nwa-99"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  let fnwsLevel = 0;
  if (tg1a) fnwsLevel = 1;
  if (tg1a && nwa0to10 >= 2) fnwsLevel = Math.max(fnwsLevel, 2);
  if (tg1a && nwa0to10 >= 4) fnwsLevel = Math.max(fnwsLevel, 3);
  if (tg1b && nwa11to30 >= 4) fnwsLevel = Math.max(fnwsLevel, 4);
  if ((tg1c || tg1d) && nwa31to100 >= 3) fnwsLevel = Math.max(fnwsLevel, 5);

  // BNWS Level (0–5)
  const tg4a = responses["tg4-a"]?.Correct === "correct";
  const tg4b = responses["tg4-b"]?.Correct === "correct";
  const tg4c = responses["tg4-c"]?.Correct === "correct";
  const tg4d = responses["tg4-d"]?.Correct === "correct";

  const nwb0to10 = ["nwb-7", "nwb-10", "nwb-4", "nwb-8", "nwb-3"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwb11to30 = ["nwb-24", "nwb-17", "nwb-20", "nwb-11", "nwb-14", "nwb-21", "nwb-30"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwb31to100 = ["nwb-53", "nwb-70", "nwb-88", "nwb-41", "nwb-96"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  let bnwsLevel = 0;
  if (tg4a) bnwsLevel = 1;
  if (tg4a && nwb0to10 >= 2) bnwsLevel = Math.max(bnwsLevel, 2);
  if (tg4a && nwb0to10 >= 4) bnwsLevel = Math.max(bnwsLevel, 3);
  if (tg4b && nwb11to30 >= 4) bnwsLevel = Math.max(bnwsLevel, 4);
  if ((tg4c || tg4d) && nwb31to100 >= 3) bnwsLevel = Math.max(bnwsLevel, 5);

  // NID Level (0–5)
  const nid0to10 = ["nid-5", "nid-3", "nid-9", "nid-7"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid11to20 = ["nid-12", "nid-18", "nid-16", "nid-14"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid21to100 = ["nid-47", "nid-50", "nid-25", "nid-75"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid3digit = ["nid-100", "nid-251", "nid-680"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  let nidLevel = 0;
  if (nid0to10 >= 2) nidLevel = 1;
  if (nid11to20 >= 2) nidLevel = Math.max(nidLevel, 2);
  if (nid21to100 >= 3) nidLevel = Math.max(nidLevel, 3);
  if (nid3digit >= 2) nidLevel = Math.max(nidLevel, 4);

  return {
    fnwsLevel,
    bnwsLevel,
    nidLevel,
  };
}
