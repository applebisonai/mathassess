// Score-av-as: Assessment Variant - Addition and Subtraction
// CAS assessment variant

export type Responses = Record<string, Record<string, string>>;

export function calculateResultsAvAS(responses: Responses) {
  const resp = (id: string) => responses[id]?.["Response"] === "correct";

  // TG1
  const countCollection = resp("as1-count-13");
  const unscreened = resp("as1-unsc-8p7");
  const partiallyScreened = resp("as1-part-7p2");
  const ts4p2 = resp("as1-ts-4p2");
  const ts6p3 = resp("as1-ts-6p3");
  const ts9p5 = resp("as1-ts-9p5");
  const missingAddend = resp("as1-ma-8pbox11");

  // TG2
  const removed7m3 = resp("as2-ri-7m3");
  const removed16m4 = resp("as2-ri-16m4");
  const missingSubtrahend = resp("as2-ms-9mbox7");

  // TG3
  const bare8p4 = resp("as3-add-8p4");
  const bare13p3 = resp("as3-add-13p3");
  const bare17m6 = resp("as3-sub-17m6");
  const bare11m8 = resp("as3-sub-11m8");

  // TG4
  const comm4p12 = resp("as4-comm-4p12");
  const link15p3 = resp("as4-link-15p3");
  const link18m3 = resp("as4-link-18m3");
  const rel21m4 = resp("as4-rel-21m4");
  const rel21m17 = resp("as4-rel-21m17");

  let casLevel = 0;

  // Construct 1: Can count a visible collection
  if (countCollection || unscreened) casLevel = Math.max(casLevel, 1);

  // Construct 2: Can add partially screened (figurative — counts from 1)
  if (partiallyScreened) casLevel = Math.max(casLevel, 2);

  // Construct 3: Counts-on for totally screened / basic subtraction
  if ([ts4p2, ts6p3, removed7m3, removed16m4].filter(Boolean).length >= 2)
    casLevel = Math.max(casLevel, 3);

  // Construct 4: Facile addition with missing addend / basic CDT
  if (missingAddend || (ts9p5 && ts9p5)) casLevel = Math.max(casLevel, 4);

  // Construct 5: Facile subtraction with missing subtrahend / advanced strategies
  if (missingSubtrahend || [bare8p4, bare13p3].filter(Boolean).length >= 2)
    casLevel = Math.max(casLevel, 5);

  // Construct 6: Flexible strategies with bare numbers
  if ([bare17m6, bare11m8].filter(Boolean).length >= 2 || [comm4p12, link15p3, link18m3].filter(Boolean).length >= 2)
    casLevel = Math.max(casLevel, 6);

  return { casLevel };
}
