// Score-av-sn: Assessment Variant - Structuring Numbers
// Extended SN assessment

export type Responses = Record<string, Record<string, string>>;

export function calculateResultsAvSN(responses: Responses) {
  const resp = (id: string) => responses[id]?.["Response"] === "correct";
  const altogether = (id: string) => responses[id]?.["Altogether"] === "correct";

  // TG1: Spatial Patterns
  const regularSpatial = ["sn1-reg-4", "sn1-reg-3", "sn1-reg-6", "sn1-reg-5"].filter(resp).length;
  const irregularSpatial = ["sn1-irr-4", "sn1-irr-6", "sn1-irr-3", "sn1-irr-5"].filter(resp).length;

  // TG2: Finger Patterns
  const displayFingers = ["sn2-disp-4", "sn2-disp-3", "sn2-disp-9", "sn2-disp-6", "sn2-disp-8"].filter(resp)
    .length;
  const moreThanOneWay = ["sn2-mtow-5a", "sn2-mtow-5b", "sn2-mtow-7a", "sn2-mtow-7b"].filter(resp).length;

  // TG3: WITH Materials
  const partOf5 = ["sn3-p5-4", "sn3-p5-2", "sn3-p5-1", "sn3-p5-3"].filter(resp).length;
  const partOf10 = ["sn3-p10-8", "sn3-p10-6", "sn3-p10-3", "sn3-p10-4"].filter(resp).length;
  const combTo20 = ["sn3-c20-8p8", "sn3-c20-7p6", "sn3-c20-10p4", "sn3-c20-5p2"].filter(altogether).length;

  // TG4: NO Materials
  const noMatTo5 = ["sn4-c5-3", "sn4-c5-1"].filter(resp).length;
  const noMatTo10 = ["sn4-c10-7", "sn4-c10-4", "sn4-c10-1"].filter(resp).length;
  const noMatTo20 = ["sn4-c20-10of18", "sn4-c20-7of20", "sn4-c20-9of16"].filter(resp).length;

  // TG5: Bare Numbers
  const bareBasic = ["sn5-2p3"].filter(resp).length;
  const bareTo10 = ["sn5-5p4", "sn5-3p3", "sn5-9m6", "sn5-8m4"].filter(resp).length;
  const bareTo20 = ["sn5-9p9", "sn5-10p6", "sn5-13m5", "sn5-20m6"].filter(resp).length;

  let snLevel = 0;

  // Level 1: Facile spatial patterns + basic finger patterns
  if (regularSpatial >= 3 && irregularSpatial >= 3) snLevel = Math.max(snLevel, 1);

  // Level 2: Finger patterns to 10 + partitions WITH materials
  if (displayFingers >= 4 && moreThanOneWay >= 3 && partOf5 >= 3 && partOf10 >= 3)
    snLevel = Math.max(snLevel, 2);

  // Level 3: Partitions WITHOUT materials + bare numbers to 10
  if (noMatTo5 >= 2 && noMatTo10 >= 2 && bareTo10 >= 3) snLevel = Math.max(snLevel, 3);

  // Level 4: Bare numbers to 20
  if (bareTo20 >= 3) snLevel = Math.max(snLevel, 4);

  // Level 5: Efficient/fluent across all bare
  if (combTo20 >= 3 && bareTo20 >= 4) snLevel = Math.max(snLevel, 5);

  return { snLevel };
}
