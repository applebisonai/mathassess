// Add+VantageMR: Place Value Assessment Schedule — Course 2
// US Math Recovery Council, v2.0, 2012
// Model: Place Value Base-Ten Construct (CPV) — Constructs 0–5
// Materials: 7 bundles of 10 sticks, 15+ loose sticks, numeral task cards, cover

export type ResponseFieldType =
  | "correct_incorrect"
  | "fluency_scale"
  | "number_entry"
  | "strategy_observed";

export interface AssessmentItem {
  id: string;
  number: string;
  prompt: string;
  displayText?: string;
  responseFields: ResponseField[];
  targetLevel: number;
  notes?: string;
}

export interface ResponseField {
  label: string;
  type: ResponseFieldType;
  options?: string[];
  placeholder?: string;
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

export const scheduleAvPV = {
  id: "av-pv",
  name: "Add+VantageMR: Place Value",
  shortName: "PV",
  gradeRange: "2–4",
  materials: [
    "7 bundles (10 sticks each)",
    "15+ loose sticks",
    "Numeral task cards",
    "Cover / screen",
  ],
  models: ["CPV"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Number Word Sequences Involving Tens
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Number Word Sequences Involving Tens",
      shortName: "NWS — Tens",
      model: "CPV",
      color: "teal",
      instructions: "Say: \"Counting by 10's, I will tell you when to stop.\" Then: \"Start at ___ and count up/backwards by 10's.\"",
      teacherScript: "\"Counting by 10's, I will tell you when to stop.\" / \"Start at ___ and count up/backwards by 10's, I will tell you when to stop.\"",
      items: [
        {
          id: "1.1", number: "Number Word Sequences Involving Tens",
          prompt: "Count by 10's from 10 to 150",
          displayText: "10 → 150",
          targetLevel: 1,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "1.2", number: "Number Word Sequences Involving Tens",
          prompt: "Count up by 10's starting at 4 (to 134)",
          displayText: "4 → 134",
          targetLevel: 1,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
          notes: "Non-multiple starting point — key indicator for Level 1.",
        },
        {
          id: "1.3", number: "Number Word Sequences Involving Tens",
          prompt: "Count backwards by 10's starting at 93 (to 3)",
          displayText: "93 → 3",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "1.4", number: "Number Word Sequences Involving Tens",
          prompt: "Count backwards by 10's starting at 176 (to 86)",
          displayText: "176 → 86",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Two-Digit +/− With Materials (Bundles & Sticks)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Two-Digit +/− With Materials",
      shortName: "+/− Materials",
      model: "CPV",
      color: "teal",
      instructions: "Present 15 loose sticks + 7 bundles of 10. First: \"Get 40 sticks.\" Then place bundles/sticks beside cover one section at a time. Ask: \"How many?\" / \"How many altogether?\"",
      teacherScript: "\"Get 40 sticks.\" / \"I am going to put some sticks and bundles beside this cover, one part at a time. Tell me how many each time. How many altogether?\"",
      materials: "7 bundles (10 sticks each) + 15 loose sticks, cover",
      items: [

        // 2.1 — Get 40 sticks (strategy observation)
        {
          id: "2.1", number: "Get 40 Sticks",
          prompt: "Put out 15 loose sticks + 7 bundles. \"Get 40 sticks.\" Observe strategy.",
          displayText: "Get 40",
          targetLevel: 2,
          responseFields: [
            {
              label: "Strategy",
              type: "strategy_observed",
              options: [
                "Uses 4 bundles",
                "Attempts individual sticks",
                "Uses bundles, counts sticks within",
                "Counts bundles as unit items (not tens)",
                "Counts sticks as composites of 10",
                "Other (elaborate)",
                "No strategy",
              ],
            },
          ],
          notes: "Observe whether student uses bundles as tens or counts individual sticks.",
        },

        // 2.2 — Sequence 1: place beside cover one section at a time
        {
          id: "2.2a", number: "Sequence 1: Bundles & Sticks",
          prompt: "Place: 1 bundle. \"How many?\" (= 10)",
          displayText: "1B → 10",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2b", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 3 sticks. \"How many altogether?\" (= 13)",
          displayText: "+3S → 13",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2c", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 2 bundles. \"How many altogether?\" (= 33)",
          displayText: "+2B → 33",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2d", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 4 sticks. \"How many altogether?\" (= 37)",
          displayText: "+4S → 37",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2e", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 3 sticks. \"How many altogether?\" (= 40)",
          displayText: "+3S → 40",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2f", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 1 bundle. \"How many altogether?\" (= 50)",
          displayText: "+1B → 50",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2g", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 2 sticks. \"How many altogether?\" (= 52)",
          displayText: "+2S → 52",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2h", number: "Sequence 1: Bundles & Sticks",
          prompt: "Add: 2 bundles. \"How many altogether?\" (= 72)",
          displayText: "+2B → 72",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2s", number: "Sequence 1: Bundles & Sticks",
          prompt: "Sequence 1 — Observed Strategy",
          displayText: "Strategy ↑",
          targetLevel: 2,
          responseFields: [
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Other (elaborate)"] },
          ],
        },

        // 2.3 — Sequence 2
        {
          id: "2.3a", number: "Sequence 2: Bundles & Sticks",
          prompt: "Place: 4 sticks. \"How many?\" (= 4)",
          displayText: "4S → 4",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3b", number: "Sequence 2: Bundles & Sticks",
          prompt: "Add: 1 bundle. \"How many altogether?\" (= 14)",
          displayText: "+1B → 14",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3c", number: "Sequence 2: Bundles & Sticks",
          prompt: "Add: 3 bundles. \"How many altogether?\" (= 44)",
          displayText: "+3B → 44",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3d", number: "Sequence 2: Bundles & Sticks",
          prompt: "Add: 4 sticks. \"How many altogether?\" (= 48)",
          displayText: "+4S → 48",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3e", number: "Sequence 2: Bundles & Sticks",
          prompt: "Add: 1 bundle + 3 sticks. \"How many altogether?\" (= 61)",
          displayText: "+1B,3S → 61",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3f", number: "Sequence 2: Bundles & Sticks",
          prompt: "Add: 2 bundles + 4 sticks. \"How many altogether?\" (= 85)",
          displayText: "+2B,4S → 85",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3s", number: "Sequence 2: Bundles & Sticks",
          prompt: "Sequence 2 — Observed Strategy",
          displayText: "Strategy ↑",
          targetLevel: 2,
          responseFields: [
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Other (elaborate)"] },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Addition and Subtraction — No Materials
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Addition and Subtraction — No Materials",
      shortName: "+/− No Materials",
      model: "CPV",
      color: "teal",
      instructions: "Place out the written numeral card. \"Read this card. Work out the answer.\" \"How did you work it out?\"",
      teacherScript: "\"Read this card. Work out the answer. How did you work it out?\"",
      materials: "Written numeral task cards",
      items: [
        // 2-digit tasks (Levels 3–4)
        {
          id: "3.1", number: "Two-Digit Tasks (No Materials)",
          prompt: "63 + 21",
          displayText: "63 + 21",
          targetLevel: 3,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        {
          id: "3.2", number: "Two-Digit Tasks (No Materials)",
          prompt: "38 + 24",
          displayText: "38 + 24",
          targetLevel: 3,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        {
          id: "3.3", number: "Two-Digit Tasks (No Materials)",
          prompt: "57 − 34",
          displayText: "57 − 34",
          targetLevel: 3,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        {
          id: "3.4", number: "Two-Digit Tasks (No Materials)",
          prompt: "43 − 15",
          displayText: "43 − 15",
          targetLevel: 3,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        // 3-digit tasks (Level 5)
        {
          id: "3.5", number: "Three-Digit Tasks (No Materials)",
          prompt: "257 + 30",
          displayText: "257 + 30",
          targetLevel: 5,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        {
          id: "3.6", number: "Three-Digit Tasks (No Materials)",
          prompt: "342 + 120",
          displayText: "342 + 120",
          targetLevel: 5,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        {
          id: "3.7", number: "Three-Digit Tasks (No Materials)",
          prompt: "672 + 151",
          displayText: "672 + 151",
          targetLevel: 5,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
        {
          id: "3.8", number: "Three-Digit Tasks (No Materials)",
          prompt: "304 − 198",
          displayText: "304 − 198",
          targetLevel: 5,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ["Jump", "Split", "Split-Jump", "Counts by 1's", "Written Algorithm", "Other (elaborate)", "No strategy"] },
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // Place Value Base-Ten Construct Model (CPV) — Add+VantageMR Course 2, 2012
  cpvLevels: [
    {
      level: 0, name: "Emergent",
      description: "Counts quantities only as individual unit items. No significance placed on ten. Uses count-by-one strategies for addition and subtraction.",
    },
    {
      level: 1, name: "Tens or Ones",
      description: "Ten is treated as constructed out of ten ones, but one ten and ten ones do not exist simultaneously. Counts forward and backward by ones for tasks involving tens.",
    },
    {
      level: 2, name: "Tens and Ones with Material",
      description: "Ten is treated as a single unit while still recognizing it contains ten ones. Solves two-digit +/− with materials using Jump (2J), Split (2S), or Split-Jump (2SJ).",
    },
    {
      level: 3, name: "Tens and Ones without Material",
      description: "Ten is a conceptual structure available without materials. Mentally solves two-digit addition and subtraction using Jump (3J), Split (3S), or Split-Jump (3SJ).",
    },
    {
      level: 4, name: "Facile — Structuring to 100",
      description: "Tens and ones flexibly treated as conceptual structures without materials. Efficiently chooses from a range of mental strategies for two-digit tasks.",
    },
    {
      level: 5, name: "Facile — Structuring to 1000",
      description: "Hundreds, tens, and ones flexibly treated as conceptual structures. One hundred = ten groups of ten. Efficiently solves three-digit addition and subtraction.",
    },
  ],
};
