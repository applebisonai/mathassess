// Schedule 2C: Early Arithmetical Strategies
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Task cards, counters of two colours, two screens
// Model: Stages of Early Arithmetical Learning (SEAL)

export type ResponseFieldType =
  | "correct_incorrect"
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
}

// Additive strategy options
const ADDITIVE_STRATEGIES = ["CF1-3x", "CF1-1x", "COF", "Non-counting", "Known Fact"];
// Subtractive strategy options
const SUBTRACTIVE_STRATEGIES = ["CDF", "CDT", "CUT", "Non-counting"];

export const schedule2C = {
  id: "schedule-2c",
  name: "Schedule 2C: Early Arithmetical Strategies",
  shortName: "2C",
  gradeRange: "K–2",
  materials: ["Task cards", "Counters (two colours)", "Two screens"],
  models: ["SEAL"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Two Screened Collections (Additive)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Two Screened Collections",
      shortName: "Screened Add.",
      model: "SEAL",
      color: "pink",
      instructions: "Place counters under two screens. Say: \"There are ___ red counters under here, and ___ blue counters under here. How many counters are there altogether?\"",
      teacherScript: '"There are ___ red counters under here, and ___ blue counters under here. How many counters are there altogether?"',
      materials: "Counters – two colours, two screens",
      items: [
        {
          id: "1.1", number: "1.1", prompt: "5 red & 3 blue — how many altogether?", displayText: "5 & 3",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
        {
          id: "1.2", number: "1.2", prompt: "9 red & 2 blue — how many altogether?", displayText: "9 & 2",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
        {
          id: "1.3", number: "1.3", prompt: "12 red & 4 blue — how many altogether?", displayText: "12 & 4",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Missing Addend (Additive — key branching task)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Missing Addend",
      shortName: "Missing Addend",
      model: "SEAL",
      color: "pink",
      instructions: "Place 8 red counters under screen. Add blue counters under same screen. Say: \"There are 8 red counters under here. I put some blue counters under here, and now there are 11 counters altogether. How many blue counters did I put under here?\"",
      teacherScript: '"There are 8 red counters under here. I put some blue counters under here, and now there are 11 counters altogether. How many blue counters did I put under here?"',
      materials: "Counters – two colours, two screens",
      branchingNote: "IF COUNTING-ON → continue to Task 5. IF NOT YET COUNTING-ON → do Tasks 3 & 4, then END ASSESSMENT.",
      items: [
        {
          id: "2.1", number: "2.1", prompt: "[8] & [?] = 11", displayText: "8 + ? = 11",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Partially Screened Addition
    // (Only if NOT counting-on in TG2)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Partially Screened Addition",
      shortName: "Partial Screen",
      model: "SEAL",
      color: "pink",
      instructions: "One group screened, one visible. Say the prompt.",
      teacherScript: '"___ red counters under here, ___ blue here. How many altogether?"',
      materials: "Counters – two colours, one screen",
      items: [
        {
          id: "3.1", number: "3.1", prompt: "[9] screened & 5 visible — how many altogether?", displayText: "9 & 5",
          targetLevel: 2,
          notes: "9 red counters under here, 5 blue here.",
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
        {
          id: "3.2", number: "3.2", prompt: "7 visible & [4] screened — how many altogether?", displayText: "7 & 4",
          targetLevel: 2,
          notes: "7 red counters here, 4 blue under here.",
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: 'Get Me' Task
    // (Only if NOT counting-on — STOP HERE after this)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "'Get Me' Task",
      shortName: "Get Me",
      model: "SEAL",
      color: "pink",
      instructions: "Put out a pile of about 30 counters (one colour). Say: \"Get me 13 counters from this pile of counters please.\"",
      teacherScript: '"Get me 13 counters from this pile of counters please."',
      materials: "Counters – one colour (~30)",
      branchingNote: "STOP HERE — for students not yet counting-on.",
      items: [
        {
          id: "4.1", number: "4.1", prompt: "Get me 13 counters from the pile.", displayText: "Get me 13",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: ADDITIVE_STRATEGIES },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Removed Items (Subtractive)
    // (Only if counting-on in TG2)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Removed Items",
      shortName: "Removed Items",
      model: "SEAL",
      color: "pink",
      instructions: "Screen a group of counters, remove some. Say: \"There are ___ counters under here. I'm taking ___ counters away. How many counters are left?\"",
      teacherScript: '"There are ___ counters under here. I\'m taking ___ counters away. How many counters are left?"',
      materials: "Counters – one colour, one screen",
      branchingNote: "IF UNSUCCESSFUL with 5.1 and 5.2 → STOP HERE.",
      items: [
        {
          id: "5.1", number: "5.1", prompt: "[7] remove 2 — how many left?", displayText: "7 − 2",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: SUBTRACTIVE_STRATEGIES },
          ],
        },
        {
          id: "5.2", number: "5.2", prompt: "[12] remove 3 — how many left?", displayText: "12 − 3",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: SUBTRACTIVE_STRATEGIES },
          ],
        },
        {
          id: "5.3", number: "5.3", prompt: "[15] remove 4 — how many left? (Optional)", displayText: "15 − 4",
          targetLevel: 4,
          notes: "Optional supplementary task.",
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: SUBTRACTIVE_STRATEGIES },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 6: Written Subtraction
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Written Subtraction",
      shortName: "Written Sub.",
      model: "SEAL",
      color: "pink",
      instructions: "Show number sentence card. Say: \"Read this to me. Work that out please.\" (If read incorrectly, e.g. − as +, correct the student.)",
      teacherScript: '"Read this to me. Work that out please."',
      materials: "Cards – number sentences",
      items: [
        {
          id: "6.1", number: "6.1", prompt: "15 − 12", displayText: "15 − 12",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: SUBTRACTIVE_STRATEGIES },
          ],
        },
        {
          id: "6.2", number: "6.2", prompt: "22 − 18", displayText: "22 − 18",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: SUBTRACTIVE_STRATEGIES },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 7: Missing Subtrahend
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg7",
      number: 7,
      name: "Missing Subtrahend",
      shortName: "Missing Sub.",
      model: "SEAL",
      color: "pink",
      instructions: "Screen 19 counters, remove some secretly. Say: \"There are 19 counters under here. I'm taking some counters away. There are 17 left. How many counters did I take away?\"",
      teacherScript: '"There are 19 counters under here. I\'m taking some counters away. There are 17 left. How many counters did I take away?"',
      materials: "Counters – one colour, one screen",
      items: [
        {
          id: "7.1", number: "7.1", prompt: "[19] remove [?] = 17 — how many taken?", displayText: "19 − ? = 17",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "strategy_observed", options: SUBTRACTIVE_STRATEGIES },
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // Full SEAL model — Wright & Ellemor-Collins, 2018
  sealLevels: [
    { level: 0, name: "Emergent counting",                                        description: "Cannot use counting to solve simple additive tasks, even with visible items" },
    { level: 1, name: "Perceptual counting",                                      description: "Counts visible (perceptual) items to solve additive tasks; cannot count screened items" },
    { level: 2, name: "Figurative counting",                                      description: "Can count from one to solve additive tasks with screened items (figurative counting)" },
    { level: 3, name: "Initial number sequence — Counting-on and -back",          description: "Counts on (or back) from one of the given numbers; solves missing addend by counting-on" },
    { level: 4, name: "Intermediate number sequence — Counting-down-to",          description: "Uses counting-down-to or counting-up-to strategy for subtraction tasks" },
    { level: 5, name: "Facile number sequence — Non-count-by-ones strategies",    description: "Uses non-count-by-ones strategies (known facts, derived facts) consistently" },
  ],
};
