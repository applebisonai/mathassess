// Schedule 3E: Early Multiplication and Division
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Based on PDF pages 65–66 (LFIN Assessments.pdf)
// Model: Early Multiplication and Division (EM&D) — Levels 0–6

export type ResponseFieldType =
  | "correct_incorrect"
  | "multi_strategy";

export interface ResponseField {
  label: string;
  type: ResponseFieldType;
  options?: string[];
}

export interface AssessmentItem {
  id: string;
  number: string;
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

export const schedule3E = {
  id: "schedule-3e",
  name: "Schedule 3E: Early Multiplication and Division",
  shortName: "3E",
  gradeRange: "2–4",
  materials: [
    "Task cards",
    "Counters (30+)",
    "Screen/cover",
    "Array cards (6×4, 5×3, 5×6, 6×2, 3×4)",
    "3-dot cards (4)",
  ],
  models: ["EM&D"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Forming Equal Groups — 4×5 [COUNTERS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Forming Equal Groups",
      shortName: "Forming Groups",
      model: "EM&D",
      color: "green",
      instructions: "Present a pile of more than 30 counters. 'Using these counters, make groups of 5.' Stop the student at four groups.",
      materials: "Counters (30+)",
      items: [
        {
          id: "e1-form-4x5",
          number: "1.1 Forming Groups",
          prompt: "Present a pile of more than 30 counters. 'Using these counters, make groups of 5.' Stop the student at four groups.",
          displayText: "4 × 5 groups",
          targetLevel: 1,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e1-count-total",
          number: "1.2 Count Total",
          prompt: "Move the excess counters aside. 'How many groups of five have you made?' 'How many counters did you use altogether?'",
          displayText: "How many altogether?",
          targetLevel: 2,
          responseFields: [
            { label: "Groups", type: "correct_incorrect" },
            { label: "Total", type: "correct_incorrect" },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Multiplication with Equal Groups — 4×3 [3-DOT CARDS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Multiplication with Equal Groups",
      shortName: "Mult. Groups",
      model: "EM&D",
      color: "green",
      instructions: "Show a 3-dot card. Place screened cards and ask: 'How many dots altogether?' Use branching support as indicated.",
      materials: "3-dot cards, screen",
      items: [
        {
          id: "e2-mult-4x3",
          number: "2.1 Screened 4×3",
          prompt: "Show a 3-dot card: 'Each card has three dots.' Place four 3-dot cards face down and screen them. 'There are four cards under here. How many dots altogether?'",
          displayText: "4 × 3 (screened)",
          targetLevel: 3,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Counted all by ones", "Skip counted", "Repeated addition", "Known fact"] },
          ],
        },
        {
          id: "e2-mult-unscreen",
          number: "2.2 Unscreened",
          prompt: "If unsuccessful → unscreen the four cards.",
          displayText: "4 × 3 (unscreened)",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e2-mult-flash",
          number: "2.3 Flash One Card",
          prompt: "If still unsuccessful → flash one card briefly.",
          displayText: "Flash 1 card",
          targetLevel: 1,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e2-mult-all-up",
          number: "2.4 All Cards Up",
          prompt: "If still unsuccessful → turn up all cards.",
          displayText: "All cards visible",
          targetLevel: 1,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e2-mult-ext-8x3",
          number: "2.5 Extension 8×3",
          prompt: "Extension (if successful with 2.1–2.4): 'Can you use that to work out eight 3s?'",
          displayText: "8 × 3 extension",
          targetLevel: 6,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Quotition Division — ?×4=20 [COUNTERS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Quotition Division",
      shortName: "Quotition Division",
      model: "EM&D",
      color: "green",
      instructions: "Present 20 counters screened. 'I am putting them into groups of four.' Briefly show one group, then ask 'How many groups?'",
      materials: "Counters, screen",
      items: [
        {
          id: "e3-div-20by4",
          number: "3. Quotition Division",
          prompt: "Present a pile of 20 counters. 'There are 20 here.' Screen all the counters. 'I am putting them into groups of four' (briefly show one group of four). 'How many groups of four can I make?'",
          displayText: "? × 4 = 20",
          targetLevel: 4,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Counted by ones", "Skip counted by 4s", "Known fact / recalled"] },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 4: Introductory Array Task [ARRAYS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Array Introduction",
      shortName: "Array Intro",
      model: "EM&D",
      color: "green",
      instructions: "Present arrays. Discuss what students call them. Use a ruler to guide attention to rows.",
      materials: "Array cards",
      items: [
        {
          id: "e4-intro-array",
          number: "4. Array Introduction",
          prompt: "Present arrays. 'Have you seen these before in class work? What do you call them? We can call it an array.' Present the 6×4 array. Place a ruler under the first row. 'How many dots in the top row?' Move ruler down. 'How many in the next row?' Continue.",
          displayText: "6 × 4 array",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 5: Multiplication with an Array
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Multiplication with an Array",
      shortName: "Array Mult.",
      model: "EM&D",
      color: "green",
      instructions: "Briefly show then screen the array. Ask 'How many dots altogether?' Use branching support as indicated.",
      materials: "Array cards, screen",
      items: [
        {
          id: "e5-arr-5x3",
          number: "5.1 Screened 5×3",
          prompt: "Briefly show then screen the 5×3 array. '5 rows of 3. How many dots altogether?'",
          displayText: "5 × 3 (screened)",
          targetLevel: 3,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Counted all", "Counted rows", "Skip counted", "Known fact"] },
          ],
        },
        {
          id: "e5-arr-unscreen-top",
          number: "5.2 Unscreen Top Row",
          prompt: "If unsuccessful → unscreen top row.",
          displayText: "Top row visible",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e5-arr-unscreen-all",
          number: "5.3 Unscreen All",
          prompt: "If still unsuccessful → unscreen whole array. Observe closely how student counts.",
          displayText: "Whole array visible",
          targetLevel: 1,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e5-arr-ext-5x6",
          number: "5.4 Extension 5×6",
          prompt: "Extension (if successful with 5.1–5.3): 'What about five rows of 6?' Briefly show then screen 5×6 array. 'How many dots altogether?'",
          displayText: "5 × 6 extension",
          targetLevel: 6,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 6: Quotition Division with an Array
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Quotition Division with an Array",
      shortName: "Array Quotition",
      model: "EM&D",
      color: "green",
      instructions: "Briefly display array then screen all but top row. 'There are [total] spots altogether. Here is one row. How many rows altogether?'",
      materials: "Array cards, screen",
      items: [
        {
          id: "e6-div-12by2",
          number: "6.1 12÷2 Array",
          prompt: "Briefly display array, then screen all but the top row. 'There are 12 spots altogether. Here is one row. How many rows are there altogether?' [6×2 ARRAY]",
          displayText: "12 ÷ 2",
          targetLevel: 4,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e6-div-12by4",
          number: "6.2 12÷4 Array",
          prompt: "Briefly display array, then screen all but the top row. 'There are 12 spots altogether. Here is one row. How many rows are there altogether?' [3×4 ARRAY]",
          displayText: "12 ÷ 4",
          targetLevel: 4,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 7: Skip-Counting
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg7",
      number: 7,
      name: "Skip-Counting",
      shortName: "Skip-Counting",
      model: "EM&D",
      color: "green",
      instructions: "'Count by [multiple]. I'll tell you when to stop.' Teacher records where student stops.",
      items: [
        {
          id: "e7-skip-2s",
          number: "7.1 By 2s",
          prompt: "'Count by 2s. I'll tell you when to stop.' (to 30)",
          displayText: "By 2s (to 30)",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e7-skip-5s",
          number: "7.2 By 5s",
          prompt: "'Count by 5s. I'll tell you when to stop.' (to 50)",
          displayText: "By 5s (to 50)",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e7-skip-3s",
          number: "7.3 By 3s",
          prompt: "'Count by 3s. I'll tell you when to stop.' (to 36)",
          displayText: "By 3s (to 36)",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 8: Basic Facts Ranges 1 and 2 [EXPRESSION CARDS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg8",
      number: 8,
      name: "Basic Facts Ranges 1 and 2",
      shortName: "Facts 1–2",
      model: "EM&D",
      color: "green",
      instructions: "Present on card. 'Read this please. Can you work this out?'",
      materials: "Expression cards",
      items: [
        {
          id: "e8-fact-7x2",
          number: "8.1",
          prompt: "7 × 2",
          displayText: "7 × 2",
          targetLevel: 4,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e8-fact-10x8",
          number: "8.2",
          prompt: "10 × 8",
          displayText: "10 × 8",
          targetLevel: 4,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e8-fact-5x4",
          number: "8.3",
          prompt: "5 × 4",
          displayText: "5 × 4",
          targetLevel: 4,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e8-fact-4x3",
          number: "8.4",
          prompt: "4 × 3",
          displayText: "4 × 3",
          targetLevel: 4,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 9: Basic Facts Range 3 [EXPRESSION CARDS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg9",
      number: 9,
      name: "Basic Facts Range 3",
      shortName: "Facts Range 3",
      model: "EM&D",
      color: "green",
      instructions: "Present on card. If student uses counting-based strategies (e.g. skip-counting), ask 'Can you find the answer without skip-counting?'",
      materials: "Expression cards",
      items: [
        {
          id: "e9-fact-3x8",
          number: "9.1",
          prompt: "3 × 8",
          displayText: "3 × 8",
          targetLevel: 5,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Skip counted", "Multiplicative strategy", "Known fact"] },
          ],
        },
        {
          id: "e9-fact-9x4",
          number: "9.2",
          prompt: "9 × 4",
          displayText: "9 × 4",
          targetLevel: 5,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Skip counted", "Multiplicative strategy", "Known fact"] },
          ],
        },
        {
          id: "e9-div-18by3",
          number: "9.3",
          prompt: "18 ÷ 3",
          displayText: "18 ÷ 3",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "e9-div-40by5",
          number: "9.4",
          prompt: "40 ÷ 5",
          displayText: "40 ÷ 5",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 10: Multiplicative Relations [TASK CARDS]
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg10",
      number: 10,
      name: "Multiplicative Relations",
      shortName: "Relational",
      model: "EM&D",
      color: "green",
      instructions: "Present the complete number sentence(s) on card. 'Read this please.' Present the incomplete number sentence below. 'Can you use that to help you do this?'",
      materials: "Task cards",
      items: [
        {
          id: "e10-assoc-4x13",
          number: "10.1 Associativity",
          prompt: "Present: 4×13=52. Below: 8×13=□. 'Can you use that to help you do this?'",
          displayText: "4×13=52 → 8×13=□",
          targetLevel: 6,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Used given fact", "Doubled", "Other / independent"] },
          ],
        },
        {
          id: "e10-inverse-12x9",
          number: "10.2 Inverse",
          prompt: "Present: 12×9=108. Below: 108÷9=□. 'Can you use that to help you do this?'",
          displayText: "12×9=108 → 108÷9=□",
          targetLevel: 6,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Used inverse", "Counted", "Other / independent"] },
          ],
        },
        {
          id: "e10-dist-10x15",
          number: "10.3 Distributivity 1",
          prompt: "Present: 10×15=150. Below: 9×15=□. 'Can you use that to help you do this?'",
          displayText: "10×15=150 → 9×15=□",
          targetLevel: 6,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Used distributivity", "Other / independent"] },
          ],
        },
        {
          id: "e10-dist-5x14",
          number: "10.4 Distributivity 2",
          prompt: "Present: 5×14=70. Below: 6×14=□. 'Can you use that to help you do this?'",
          displayText: "5×14=70 → 6×14=□",
          targetLevel: 6,
          responseFields: [
            { label: "Response", type: "correct_incorrect" },
            { label: "Strategy", type: "multi_strategy", options: ["Used distributivity", "Other / independent"] },
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // ── EM&D Model Levels (from PDF — Early Multiplication and Division) ──
  emdLevels: [
    {
      level: 0,
      name: "Emergent grouping",
      description: "Cannot form or identify equal groups",
    },
    {
      level: 1,
      name: "Perceptual items, counted by ones",
      description: "Can count visible items in groups or arrays but only by counting by ones",
    },
    {
      level: 2,
      name: "Perceptual items, counted in multiples",
      description: "Can count visible items by groups (counting by 2s, 5s, etc.)",
    },
    {
      level: 3,
      name: "Figurative items, counted in multiples",
      description: "Can count non-visible items by groups using repeated counting",
    },
    {
      level: 4,
      name: "Abstract groups, items counted in multiples",
      description: "Can work with abstract groups (stated but not visible) and count by groups",
    },
    {
      level: 5,
      name: "Abstract groups, facile repeated addition",
      description: "Uses repeated addition or facile counting strategies with abstract groups",
    },
    {
      level: 6,
      name: "Multiplicative strategies",
      description: "Uses facile multiplicative thinking and properties (distributivity, inverse, doubling)",
    },
  ],
};
