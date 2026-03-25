// Add+VantageMR: Addition and Subtraction Assessment Schedule — Course 1
// Based on PDF pages 108–111
// Model: Addition and Subtraction Arithmetical Strategies (CAS) — Constructs 0–5

export type ResponseFieldType =
  | "correct_incorrect"
  | "multi_strategy";

export interface ResponseField {
  label: string;
  type: ResponseFieldType;
  options?: string[]; // for multi_strategy
}

export interface AssessmentItem {
  id: string;
  number: string; // sub-group key (used by groupBySubLevel)
  prompt: string;
  displayText?: string;
  responseFields: ResponseField[];
  targetLevel: number;
  notes?: string;
}

export interface TaskGroup {
  id: string;
  number: number;
  name: string;
  shortName: string;
  model: string;
  color: string;
  instructions: string;
  teacherScript?: string;
  materials?: string;
  items: AssessmentItem[];
  branchingNote?: string;
  startAtItem?: string;
  startNote?: string;
}

// ── Shared strategy option sets ───────────────────────────────────────────────

const STR_SCREENED_ADD: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts From 1", "Counts On", "Uses Groups", "Finger use", "Other"],
};

const STR_UNSCREENED: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts All", "Counts On", "Uses Groups", "1-to-1 corresp. error", "Num Word Seq error"],
};

const STR_COUNT_COLL: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Pull-off", "Touch each", "Eye point", "1-to-1 corresp. error", "Num Word Seq error"],
};

const STR_SUBTRACTION: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts Down From", "Counts Up From", "Uses Groups", "Finger use", "Other"],
};

const STR_ADD_BARE: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts On", "Adds through ten", "Uses Groups", "Finger use", "Other"],
};

const STR_ADD_PLACE: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts On", "Use place value", "Uses Groups", "Finger use", "Other"],
};

const STR_SUB_BARE: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts Down From", "Counts Down to", "Counts Up From", "Uses Groups", "Finger use", "Other"],
};

const STR_COMM: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts On from 4", "Counts On from 12", "Uses Groups", "Finger use", "Other"],
};

const STR_RELATIONAL: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Solves each task separately", "Uses inverse relationship", "Other"],
};

const RESP: ResponseField = { label: "Response", type: "correct_incorrect" };

export const scheduleAvAS = {
  id: "av-as",
  name: "Add+VantageMR: Addition and Subtraction",
  shortName: "A&S",
  gradeRange: "K–3",
  materials: [
    "Counters (two colors — red and blue)",
    "Screens / covers (2)",
    "Bare-number task cards",
  ],
  models: ["CAS"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Addition — Unscreened and Screened Collections
    // START HERE at "Totally Screened — Within Finger Range" (4+2)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Addition — Unscreened and Screened Collections",
      shortName: "Addition Collections",
      model: "CAS",
      color: "blue",
      instructions: "Use red and blue counters. Display and then screen collections as indicated. Ask: \"How many counters are there altogether?\"",
      teacherScript: "\"How many counters are there?\" / \"How many counters are there altogether?\"",
      materials: "Red and blue counters, screens",
      startAtItem: "as1-ts-4p2",
      startNote: "START HERE — most students begin at Totally Screened",
      items: [
        // ── Counting a Collection ────────────────────────────────────────────
        {
          id: "as1-count-13",
          number: "Counting a Collection",
          prompt: "Place out a collection of 13 counters (all one color). \"How many counters are there?\"",
          displayText: "13",
          targetLevel: 1,
          responseFields: [RESP, STR_COUNT_COLL],
        },

        // ── Unscreened Collections ───────────────────────────────────────────
        {
          id: "as1-unsc-8p7",
          number: "Unscreened Collections",
          prompt: "Place 8 red counters. \"Here are 8 red counters.\" Place 7 blue counters. \"...and here are 7 blue counters. How many altogether?\"",
          displayText: "8 + 7",
          targetLevel: 1,
          responseFields: [RESP, STR_UNSCREENED],
        },

        // ── Partially Screened Collections ───────────────────────────────────
        {
          id: "as1-part-7p2",
          number: "Partially Screened Collections",
          prompt: "Briefly display then screen 7 red counters. \"Here are 7 counters.\" Place 2 blue counters in view. \"...and here are 2 blue counters. How many altogether?\"",
          displayText: "7 + 2",
          targetLevel: 2,
          responseFields: [RESP, STR_SCREENED_ADD],
        },

        // ── Totally Screened — Within Finger Range ─── START HERE ────────────
        {
          id: "as1-ts-4p2",
          number: "Totally Screened — Within Finger Range",
          prompt: "Briefly display then screen 4 red counters. \"Here are 4 red counters.\" Briefly display then screen 2 blue counters. \"...and here are 2 blue counters. How many altogether?\"",
          displayText: "4 + 2",
          targetLevel: 3,
          responseFields: [RESP, STR_SCREENED_ADD],
        },
        {
          id: "as1-ts-6p3",
          number: "Totally Screened — Within Finger Range",
          prompt: "Present 6 + 3 as above. Screen both collections.",
          displayText: "6 + 3",
          targetLevel: 3,
          responseFields: [RESP, STR_SCREENED_ADD],
        },

        // ── Totally Screened — Outside Finger Range ──────────────────────────
        {
          id: "as1-ts-9p5",
          number: "Totally Screened — Outside Finger Range",
          prompt: "Briefly display then screen 9 red counters. \"Here are 9 red counters.\" Briefly display then screen 5 blue counters. \"...and here are 5 blue counters. How many altogether?\"",
          displayText: "9 + 5",
          targetLevel: 3,
          responseFields: [RESP, STR_SCREENED_ADD],
        },

        // ── Missing Addend ───────────────────────────────────────────────────
        {
          id: "as1-ma-8pbox11",
          number: "Missing Addend",
          prompt: "Briefly display then screen 8 red counters. \"Here are 8 red counters.\" Without child seeing, place 3 blue counters under a second screen. \"...and without you seeing, I put some blue counters under here. Altogether there are 11 counters. How many blue counters are under here?\" Indicate the second screen.",
          displayText: "8 + □ = 11",
          targetLevel: 4,
          responseFields: [RESP, STR_SCREENED_ADD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Subtraction — Screened Collections
    // START HERE at "Removed Items — Outside Finger Range" (16−4)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Subtraction — Screened Collections",
      shortName: "Subtraction Collections",
      model: "CAS",
      color: "blue",
      instructions: "Briefly display and then screen counters. Remove items from behind the screen. Display the removed items briefly before screening them with a second cover.",
      teacherScript: "\"Here are ___ counters.\" / \"If I take away ___ counters, how many counters are left?\" / \"How many counters did I take away?\"",
      materials: "Red counters, screens (2)",
      startAtItem: "as2-ri-16m4",
      startNote: "START HERE — most students begin here",
      items: [
        // ── Removed Items — Within Finger Range ──────────────────────────────
        {
          id: "as2-ri-7m3",
          number: "Removed Items — Within Finger Range",
          prompt: "Briefly display then screen 7 red counters. \"Here are 7 counters.\" Remove 3 counters, briefly display then screen with a second cover. \"If I take away 3 counters, how many counters are left?\"",
          displayText: "7 − 3",
          targetLevel: 3,
          responseFields: [RESP, STR_SUBTRACTION],
        },

        // ── Removed Items — Outside Finger Range ─── START HERE ──────────────
        {
          id: "as2-ri-16m4",
          number: "Removed Items — Outside Finger Range",
          prompt: "Briefly display then screen 16 red counters. \"Here are 16 counters.\" Remove 4 counters, briefly display then screen. \"If I take away 4 counters, how many counters are left?\"",
          displayText: "16 − 4",
          targetLevel: 3,
          responseFields: [RESP, STR_SUBTRACTION],
        },

        // ── Missing Subtrahend ────────────────────────────────────────────────
        {
          id: "as2-ms-9mbox7",
          number: "Missing Subtrahend",
          prompt: "Briefly display then screen 9 red counters. \"Here are 9 counters.\" Without child seeing, remove and screen 2 counters. \"Without you seeing, I took some away. Now there are only 7 left.\" Briefly display then screen the 7. \"How many counters did I take away?\"",
          displayText: "9 − □ = 7",
          targetLevel: 4,
          responseFields: [RESP, STR_SUBTRACTION],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Addition and Subtraction — Bare Numbers
    // START HERE at the beginning (8+4)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Addition and Subtraction — Bare Numbers",
      shortName: "Bare Numbers",
      model: "CAS",
      color: "blue",
      instructions: "Place out the written numeral card. Ask: \"Read this card. Work out the problem.\" If necessary: \"How did you work it out?\"",
      teacherScript: "\"Read this card. Work out the problem.\" If necessary: \"How did you work it out?\"",
      materials: "Bare-number task cards",
      startAtItem: "as3-add-8p4",
      startNote: "START HERE",
      items: [
        // ── Addition ─────────────────────────────────────────────────────────
        {
          id: "as3-add-8p4",
          number: "Addition",
          prompt: "Place out the card: 8 + 4. \"Read this card. Work out the problem.\"",
          displayText: "8 + 4",
          targetLevel: 3,
          responseFields: [RESP, STR_ADD_BARE],
        },
        {
          id: "as3-add-13p3",
          number: "Addition",
          prompt: "Place out the card: 13 + 3. Present as above.",
          displayText: "13 + 3",
          targetLevel: 3,
          responseFields: [RESP, STR_ADD_PLACE],
        },

        // ── Subtraction ───────────────────────────────────────────────────────
        {
          id: "as3-sub-17m6",
          number: "Subtraction",
          prompt: "Place out the card: 17 − 6. \"Read this card. Work out the problem.\"",
          displayText: "17 − 6",
          targetLevel: 3,
          responseFields: [RESP, STR_SUB_BARE],
        },
        {
          id: "as3-sub-11m8",
          number: "Subtraction",
          prompt: "Place out the card: 11 − 8. Present as above.",
          displayText: "11 − 8",
          targetLevel: 4,
          responseFields: [RESP, STR_SUB_BARE],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 4: Relational Thinking
    // START HERE at the beginning (4+12)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Relational Thinking",
      shortName: "Relational",
      model: "CAS",
      color: "blue",
      instructions: "Present bare-number cards. Probe with: \"How did you work it out?\" and \"Is there an easier way?\" For inverse tasks: \"Can you use this to work this out?\"",
      teacherScript: "\"Read this card. Work out the problem.\" / \"Is there an easier way to work it out?\" / \"Can you use this (indicate card) to work this out?\"",
      materials: "Bare-number task cards",
      startAtItem: "as4-comm-4p12",
      startNote: "START HERE",
      items: [
        // ── Commutativity of Addition ─────────────────────────────────────────
        {
          id: "as4-comm-4p12",
          number: "Commutativity of Addition",
          prompt: "Place out the card: 4 + 12. \"Read this card. Work out the problem.\" If necessary: \"How did you work it out?\" / \"Is there an easier way to work it out?\"",
          displayText: "4 + 12",
          targetLevel: 5,
          responseFields: [RESP, STR_COMM],
        },

        // ── Linking Addition and Subtraction ──────────────────────────────────
        {
          id: "as4-link-15p3",
          number: "Linking Addition and Subtraction",
          prompt: "Place out the card: 15 + 3. \"Read this card. Work out the problem.\"",
          displayText: "15 + 3",
          targetLevel: 5,
          responseFields: [RESP],
        },
        {
          id: "as4-link-18m3",
          number: "Linking Addition and Subtraction",
          prompt: "Place out the card: 18 − 3. \"Read this card. Can you use this (indicate 15 + 3) to work this out?\"",
          displayText: "18 − 3",
          targetLevel: 5,
          responseFields: [
            RESP,
            STR_RELATIONAL,
          ],
        },

        // ── Related Subtraction Tasks ─────────────────────────────────────────
        {
          id: "as4-rel-21m4",
          number: "Related Subtraction Tasks",
          prompt: "Place out the card: 21 − 4. \"Read this card. Work out the problem.\"",
          displayText: "21 − 4",
          targetLevel: 5,
          responseFields: [RESP],
        },
        {
          id: "as4-rel-21m17",
          number: "Related Subtraction Tasks",
          prompt: "Place out the card: 21 − 17. \"Read this card. Can you use this (indicate 21 − 4) to work this out?\" / \"Can you use this to tell me an addition sentence?\" / \"Can you use this to tell me another addition sentence?\"",
          displayText: "21 − 17",
          targetLevel: 5,
          responseFields: [
            RESP,
            STR_RELATIONAL,
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // ── CAS Model Levels (from PDF — Addition and Subtraction Arithmetical Strategies) ──
  casLevels: [
    {
      level: 0,
      name: "Emergent Counting",
      description: "Cannot count visible items. Does not know number words, cannot coordinate number words with items, or cannot use a cardinal number to quantify the collection.",
    },
    {
      level: 1,
      name: "Perceptual Counting",
      description: "Can count perceived items (seen, heard, or felt) but not items in concealed collections.",
    },
    {
      level: 2,
      name: "Figurative Counting",
      description: "Can count concealed items using a re-presentation, but counting typically includes redundant activity — counts from 'one' instead of counting-on.",
    },
    {
      level: 3,
      name: "Initial Number Sequence",
      description: "Counts-on (rather than from 'one') to solve addition and missing addend tasks. Uses count-down-from strategy to solve removed items tasks (e.g. 17 − 3 as 16, 15, 14 → answer 14).",
    },
    {
      level: 4,
      name: "Intermediate Number Sequence",
      description: "Counts-down-to to solve missing subtrahend tasks (e.g. 17 − 14 as 16, 15, 14 → answer 3). Can choose the more efficient of count-down-from and count-down-to strategies.",
    },
    {
      level: 5,
      name: "Facile Number Sequence",
      description: "Uses a range of non-count-by-one strategies: compensation, commutativity, using a known result, adding to ten, subtraction as the inverse of addition, and awareness of ten in teen numbers.",
    },
  ],
};
