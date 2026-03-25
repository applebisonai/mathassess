// Add+VantageMR: Multiplication and Division Assessment Schedule — Course 2
// Based on PDF pages 31–32 (AddVantage Assessments.pdf)
// Model: Multiplication and Division (M&D) — Levels 0–5

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

// ── Shared strategy option sets ───────────────────────────────────────────────

const RESP: ResponseField = { label: "Response", type: "correct_incorrect" };

const STR_MD_GROUPS: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Counts all by ones", "Skip counts", "Repeated addition", "Known fact"],
};

const STR_MD_RELATIONAL: ResponseField = {
  label: "Strategy",
  type: "multi_strategy",
  options: ["Solves independently", "Uses given fact", "Uses doubling", "Uses inverse", "Other"],
};

export const scheduleAvMD = {
  id: "av-md",
  name: "Add+VantageMR: Multiplication and Division",
  shortName: "M&D",
  gradeRange: "2–5",
  materials: [
    "Counters (30+)",
    "Array cards (6×4, 5×3, 5×6, 6×2, 3×4)",
    "Screens / covers",
    "Task cards with number sentences",
  ],
  models: ["M&D"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Number Word Sequences in Multiples
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Number Word Sequences in Multiples",
      shortName: "Skip Counting",
      model: "M&D",
      color: "green",
      instructions: "Script: \"Counting by ___'s, start at ___ and I will tell you when to stop.\" Teacher records where student stops.",
      teacherScript: "\"Counting by [multiple], start at [number]. I will tell you when to stop.\"",
      items: [
        {
          id: "md1-by2",
          number: "1.1 By 2's",
          prompt: "Counting by 2's, start at 2. 2, 4, 6... (to 32)",
          displayText: "By 2's",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "md1-by5",
          number: "1.2 By 5's",
          prompt: "Counting by 5's, start at 5. 5, 10... (to 55)",
          displayText: "By 5's",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "md1-back5",
          number: "1.3 Backwards by 5's",
          prompt: "Counting backwards by 5's, start at 85. 85, 80... (to 60)",
          displayText: "Backwards by 5's",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "md1-by3",
          number: "1.4 By 3's",
          prompt: "Counting by 3's, start at 3. 3, 6... (to 30)",
          displayText: "By 3's",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "md1-by4",
          number: "1.5 By 4's",
          prompt: "Counting by 4's, start at 4. 4, 8... (to 40)",
          displayText: "By 4's",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "md1-back2",
          number: "1.6 Backwards by 2's",
          prompt: "Counting backwards by 2's, start at 74. 74, 72... (to 58)",
          displayText: "Backwards by 2's",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Multiplication and Division (with materials)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Multiplication and Division with Materials",
      shortName: "Mult. / Div. Tasks",
      model: "M&D",
      color: "green",
      instructions: "Present materials as indicated. Display collections or screened items. Ask: \"How many [items] are there altogether?\"",
      materials: "Counters, Array cards, screens",
      items: [
        // ── Forming Equal Groups ─────────────────────────────────────────────
        {
          id: "md2-forming-groups",
          number: "2.1 Forming Groups",
          prompt: "Present a collection of more than 30 counters. 'Using these counters, make three groups with four in each group.' If student forms groups, remove remaining counters. 'How many counters are there altogether?'",
          displayText: "3 × 4 (groups)",
          targetLevel: 1,
          responseFields: [RESP, STR_MD_GROUPS],
        },

        // ── Items and Groups Visible – Array ──────────────────────────────────
        {
          id: "md2-array-visible",
          number: "2.2 Array Visible",
          prompt: "Present the array card (dots in rows of three, 4 rows). 'The dots on this card are in rows of three. How many dots are there altogether?'",
          displayText: "4 × 3 array (visible)",
          targetLevel: 2,
          responseFields: [RESP, STR_MD_GROUPS],
        },

        // ── Items Screened, Groups Visible – Collections ────────────────────
        {
          id: "md2-screened-collections",
          number: "2.3 Screened Collections",
          prompt: "Place out six cards face down in a line. Screen the cards. 'Each card has four dots. How many dots are there altogether?'",
          displayText: "6 × 4 screened cards",
          targetLevel: 3,
          responseFields: [RESP, STR_MD_GROUPS],
        },

        // ── Items Screened, Groups Visible – Array ───────────────────────────
        {
          id: "md2-screened-array",
          number: "2.4 Screened Array",
          prompt: "Present the partially screened array. 'The dots on this card are in rows and columns. Some of the dots have been covered.' Briefly show the complete array, then cover it. 'How many dots are there altogether?'",
          displayText: "Partially screened array",
          targetLevel: 3,
          responseFields: [RESP, STR_MD_GROUPS],
        },

        // ── Items and Groups Not Visible – Array ─────────────────────────────
        {
          id: "md2-not-visible-array",
          number: "2.5 Array Not Visible",
          prompt: "Present the fully screened array. 'On this card there are six rows. Each row has four dots.' Briefly show the complete array, then cover it. 'How many dots are there altogether?'",
          displayText: "6 × 4 screened array",
          targetLevel: 3,
          responseFields: [RESP, STR_MD_GROUPS],
        },

        // ── Verbal Division Task 1 ───────────────────────────────────────────
        {
          id: "md2-verbal-div1",
          number: "2.6 Division Task 1",
          prompt: "'If sixteen pencils are shared among four children, how many pencils would each child get?'",
          displayText: "16 among 4",
          targetLevel: 4,
          responseFields: [RESP, STR_MD_GROUPS],
        },

        // ── Verbal Division Task 2 ───────────────────────────────────────────
        {
          id: "md2-verbal-div2",
          number: "2.7 Division Task 2",
          prompt: "'If I have 27 cupcakes and I need to put them into packages of six, how many packages do I need?'",
          displayText: "27 into 6's",
          targetLevel: 4,
          responseFields: [RESP, STR_MD_GROUPS],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Relational Thinking
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Relational Thinking",
      shortName: "Relational",
      model: "M&D",
      color: "green",
      instructions: "Present task cards with number sentences. Script: 'Read this number sentence. Use this to help you...'",
      materials: "Task cards with number sentences",
      items: [
        // ── Commutativity / Doubling ─────────────────────────────────────────
        {
          id: "md3-comm-3x7",
          number: "3.1 Commutativity",
          prompt: "Present the card showing 3 × 7. 'If you know that three times seven equals twenty-one...' Present the card showing 6 × 7. '...how could you use that to help you solve six times seven?'",
          displayText: "3 × 7 → 6 × 7",
          targetLevel: 5,
          responseFields: [RESP, STR_MD_RELATIONAL],
        },

        // ── Inverse — Multiplication to Division ──────────────────────────────
        {
          id: "md3-inverse-8x7",
          number: "3.2 Inverse",
          prompt: "Use the cards to form the number sentence 8 × 7 = 56. 'Read this number sentence.' Remove the multiplication sign and present the division sign. 'Use these three numbers to make a division number sentence.' If successful: 'Can you make a different one?' 'Tell me a number story.'",
          displayText: "8 × 7 = 56 → ÷",
          targetLevel: 5,
          responseFields: [RESP, STR_MD_RELATIONAL],
        },

        // ── Distributivity ───────────────────────────────────────────────────
        {
          id: "md3-dist-25x3",
          number: "3.3 Distributivity",
          prompt: "Present the cards showing 25 × 3 = 75 and 2 × 3 = 6. 'If I told you that (read cards)...' Present the card showing 27 × 3. 'Can you use those cards to help you work out 27 × 3?'",
          displayText: "25×3=75, 2×3=6 → 27×3",
          targetLevel: 5,
          responseFields: [RESP, STR_MD_RELATIONAL],
        },

        // ── Known fact to related fact ────────────────────────────────────────
        {
          id: "md3-known-8x4",
          number: "3.4 Known Fact to Related Fact",
          prompt: "Present the card showing 8 × 4. 'What is the answer to this?' If successful, present the card showing 32 ÷ 4. 'What is the answer to this?'",
          displayText: "8 × 4 → 32 ÷ 4",
          targetLevel: 5,
          responseFields: [RESP, STR_MD_RELATIONAL],
        },

        // ── Near fact ────────────────────────────────────────────────────────
        {
          id: "md3-near-15x3",
          number: "3.5 Near Fact",
          prompt: "Present the card showing 15 × 3 = 45. 'If I told you that fifteen times three equals forty-five...' Present the card showing 16 × 3 =. '...what would sixteen times three be?'",
          displayText: "15×3=45 → 16×3",
          targetLevel: 5,
          responseFields: [RESP, STR_MD_RELATIONAL],
        },
      ],
    },

  ] as TaskGroup[],

  // ── M&D Model Levels (from PDF — Multiplication and Division Arithmetical Strategies) ──
  mdLevels: [
    {
      level: 0,
      name: "Emergent",
      description: "Cannot count items in equal groups even when visible",
    },
    {
      level: 1,
      name: "Perceptual Direct Counting",
      description: "Can form equal groups and count all when items are visible; counts by ones",
    },
    {
      level: 2,
      name: "Figurative",
      description: "Can solve multiplicative tasks using figurative counting (counting not visible items)",
    },
    {
      level: 3,
      name: "Repeated Addition",
      description: "Uses repeated addition as a strategy (counts by multiples/skip counts)",
    },
    {
      level: 4,
      name: "Multiplicative Operations",
      description: "Knows some multiplication facts; uses multiplicative thinking without counting",
    },
    {
      level: 5,
      name: "Relational Multiplicative",
      description: "Uses properties of multiplication (commutativity, distributivity, inverse) flexibly",
    },
  ],
};
