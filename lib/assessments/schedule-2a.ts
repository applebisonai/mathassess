// Schedule 2A: Early Number Words and Numerals
// LFIN Assessment - Interview Mode
// Materials: Task cards, paper and pen

export type StrategyCode = "fluent" | "hesitant" | "error" | "correct" | "incorrect";

export type ResponseFieldType =
  | "correct_incorrect"          // Simple correct/incorrect
  | "fluency_scale"              // Fluent / Hesitant / Error
  | "number_reached"             // What number did they reach?
  | "number_entry"               // Teacher types a number
  | "strategy_observed";         // Which strategy did they use?

export interface AssessmentItem {
  id: string;
  number: string;           // e.g. "1.1", "1.2"
  prompt: string;           // What the teacher says
  displayText?: string;     // What appears on screen for student to see (if any)
  responseFields: ResponseField[];
  targetLevel: number;      // Which LFIN level this item assesses (0-7)
  notes?: string;           // Guidance for teacher
  numberRangeStart?: number; // For clickable number grids (FNWS/BNWS)
  numberRangeEnd?: number;
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
  model: string;            // FNWS, BNWS, NID, NWA, NWB
  color: string;            // Tailwind color class
  instructions: string;     // What the teacher does
  materials?: string;
  items: AssessmentItem[];
  branchingNote?: string;   // Note about when to stop or skip
  startAtItem?: string;     // Sub-level number where START HERE badge appears (e.g. "3.2")
  startNote?: string;       // Note shown on START HERE badge (e.g. "If not fluent go back to 3.1")
}

export interface BranchingRule {
  afterTaskGroup: number;
  condition: string;
  prompt: string;           // Question shown to teacher
  options: {
    label: string;
    action: "continue" | "end" | "skip_to";
    target?: number;
  }[];
}

export const schedule2A = {
  id: "schedule-2a",
  name: "Schedule 2A: Early Number Words and Numerals",
  shortName: "2A",
  gradeRange: "K–1",
  materials: ["Numeral cards (0–100)", "Paper", "Pen"],
  models: ["FNWS", "BNWS", "NID"],
  taskGroups: [
    {
      id: "tg1",
      number: 1,
      name: "Forward Number Word Sequences",
      shortName: "FNWS",
      model: "FNWS",
      color: "blue",
      instructions: 'Say: "Start counting from ___ and I\'ll tell you when to stop."',
      items: [
        {
          id: "1.1",
          number: "1.1",
          prompt: "Start counting from 1. (Stop at 32)",
          displayText: "Count from 1",
          targetLevel: 1,
          numberRangeStart: 1,
          numberRangeEnd: 32,
          responseFields: [
            { label: "Fluency", type: "fluency_scale" },
          ],
        },
        {
          id: "1.2",
          number: "1.2",
          prompt: "Start counting from 68. (Stop at 83)",
          displayText: "Count from 68",
          targetLevel: 5,
          numberRangeStart: 68,
          numberRangeEnd: 83,
          responseFields: [
            { label: "Fluency", type: "fluency_scale" },
          ],
        },
        {
          id: "1.3",
          number: "1.3",
          prompt: "Start counting from 97. (Stop at 112)",
          displayText: "Count from 97",
          targetLevel: 5,
          numberRangeStart: 97,
          numberRangeEnd: 112,
          notes: "Level 5+ if crosses 100 fluently",
          responseFields: [
            { label: "Fluency", type: "fluency_scale" },
          ],
        },
      ],
    },
    {
      id: "tg2",
      number: 2,
      name: "Number Word After",
      shortName: "NWA",
      model: "FNWS",
      color: "blue",
      instructions:
        'Say: "The number that comes just after 1 is 2. What is the next number after ___?"',
      items: [
        {
          id: "2.1a", number: "2.1", prompt: 'What comes after 4?', displayText: "4, ___?",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.1b", number: "2.1", prompt: 'What comes after 9?', displayText: "9, ___?",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.1c", number: "2.1", prompt: 'What comes after 7?', displayText: "7, ___?",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.1d", number: "2.1", prompt: 'What comes after 3?', displayText: "3, ___?",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.1e", number: "2.1", prompt: 'What comes after 6?', displayText: "6, ___?",
          targetLevel: 2,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2a", number: "2.2", prompt: 'What comes after 16?', displayText: "16, ___?",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2b", number: "2.2", prompt: 'What comes after 12?', displayText: "12, ___?",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2c", number: "2.2", prompt: 'What comes after 19?', displayText: "19, ___?",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2d", number: "2.2", prompt: 'What comes after 23?', displayText: "23, ___?",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.2e", number: "2.2", prompt: 'What comes after 29?', displayText: "29, ___?",
          targetLevel: 3,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3a", number: "2.3", prompt: 'What comes after 67?', displayText: "67, ___?",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3b", number: "2.3", prompt: 'What comes after 43?', displayText: "43, ___?",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3c", number: "2.3", prompt: 'What comes after 50?', displayText: "50, ___?",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3d", number: "2.3", prompt: 'What comes after 79?', displayText: "79, ___?",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
        {
          id: "2.3e", number: "2.3", prompt: 'What comes after 88?', displayText: "88, ___?",
          targetLevel: 5,
          responseFields: [{ label: "Response", type: "correct_incorrect" }],
        },
      ],
    },
    {
      id: "tg3",
      number: 3,
      name: "Numeral Identification",
      shortName: "NID",
      model: "NID",
      color: "green",
      instructions:
        "Show each numeral card in turn. Say: \"What number is this?\"",
      materials: "Numeral cards",
      notes:
        "Start with Level 1 (single digits). Progress through levels. Stop when student cannot identify most in a set.",
      startAtItem: "3.2",
      startNote: "If not fluent go back and do 3.1",
      items: [
        // Level 1 - Single digits
        { id: "3.1a", number: "3.1", prompt: "Show card: 5", displayText: "5", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1b", number: "3.1", prompt: "Show card: 3", displayText: "3", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1c", number: "3.1", prompt: "Show card: 9", displayText: "9", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1d", number: "3.1", prompt: "Show card: 4", displayText: "4", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1e", number: "3.1", prompt: "Show card: 8", displayText: "8", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1f", number: "3.1", prompt: "Show card: 6", displayText: "6", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1g", number: "3.1", prompt: "Show card: 7", displayText: "7", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // Level 2 - Teens and 2-digit
        { id: "3.2a", number: "3.2", prompt: "Show card: 10", displayText: "10", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2b", number: "3.2", prompt: "Show card: 18", displayText: "18", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2c", number: "3.2", prompt: "Show card: 12", displayText: "12", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2d", number: "3.2", prompt: "Show card: 19", displayText: "19", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2e", number: "3.2", prompt: "Show card: 14", displayText: "14", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2f", number: "3.2", prompt: "Show card: 16", displayText: "16", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2g", number: "3.2", prompt: "Show card: 13", displayText: "13", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // Level 3 - Two digit
        { id: "3.3a", number: "3.3", prompt: "Show card: 47", displayText: "47", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3b", number: "3.3", prompt: "Show card: 50", displayText: "50", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3c", number: "3.3", prompt: "Show card: 21", displayText: "21", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3d", number: "3.3", prompt: "Show card: 66", displayText: "66", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3e", number: "3.3", prompt: "Show card: 72", displayText: "72", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3f", number: "3.3", prompt: "Show card: 81", displayText: "81", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3g", number: "3.3", prompt: "Show card: 38", displayText: "38", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3h", number: "3.3", prompt: "Show card: 29", displayText: "29", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // Level 4 - Three digit
        { id: "3.4a", number: "3.4", prompt: "Show card: 100", displayText: "100", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.4b", number: "3.4", prompt: "Show card: 251", displayText: "251", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.4c", number: "3.4", prompt: "Show card: 680", displayText: "680", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.4d", number: "3.4", prompt: "Show card: 109", displayText: "109", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.4e", number: "3.4", prompt: "Show card: 417", displayText: "417", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },
    {
      id: "tg4",
      number: 4,
      name: "Writing Numerals",
      shortName: "Write",
      model: "NID",
      color: "green",
      instructions:
        "Provide paper and pen. Say: \"Write the number that I say.\"",
      materials: "Paper, pen",
      items: [
        { id: "4.1a", number: "4.1", prompt: "Write: 7", displayText: "Seven", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1b", number: "4.1", prompt: "Write: 6", displayText: "Six", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1c", number: "4.1", prompt: "Write: 3", displayText: "Three", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1d", number: "4.1", prompt: "Write: 9", displayText: "Nine", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.2a", number: "4.2", prompt: "Write: 12", displayText: "Twelve", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.2b", number: "4.2", prompt: "Write: 18", displayText: "Eighteen", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.3a", number: "4.3", prompt: "Write: 21", displayText: "Twenty-one", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.3b", number: "4.3", prompt: "Write: 30", displayText: "Thirty", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.3c", number: "4.3", prompt: "Write: 89", displayText: "Eighty-nine", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.3d", number: "4.3", prompt: "Write: 92", displayText: "Ninety-two", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.4a", number: "4.4", prompt: "Write: 513", displayText: "Five hundred thirteen", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.4b", number: "4.4", prompt: "Write: 270", displayText: "Two hundred seventy", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.4c", number: "4.4", prompt: "Write: 306", displayText: "Three hundred six", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },
    {
      id: "tg5",
      number: 5,
      name: "Backward Number Word Sequences",
      shortName: "BNWS",
      model: "BNWS",
      color: "purple",
      instructions: 'Say: "Count backwards from ___ and I\'ll tell you when to stop."',
      branchingNote: "Start with 5.1 for younger students. Jump to 5.3 for Grade 1+",
      startAtItem: "5.3",
      startNote: "If not fluent go back to 5.1",
      items: [
        { id: "5.1", number: "5.1", prompt: "Count backwards from 5 (to 1)", displayText: "5, 4, 3...", targetLevel: 1, numberRangeStart: 1, numberRangeEnd: 5, responseFields: [{ label: "Fluency", type: "fluency_scale" }] },
        { id: "5.2", number: "5.2", prompt: "Count backwards from 10 (to 1)", displayText: "10, 9, 8...", targetLevel: 1, numberRangeStart: 1, numberRangeEnd: 10, responseFields: [{ label: "Fluency", type: "fluency_scale" }] },
        { id: "5.3", number: "5.3", prompt: "Count backwards from 12 (to 1)", displayText: "12, 11, 10...", targetLevel: 2, numberRangeStart: 1, numberRangeEnd: 12, responseFields: [{ label: "Fluency", type: "fluency_scale" }] },
        { id: "5.4", number: "5.4", prompt: "Count backwards from 35 (to 17)", displayText: "35, 34...", targetLevel: 4, numberRangeStart: 17, numberRangeEnd: 35, responseFields: [{ label: "Fluency", type: "fluency_scale" }] },
        { id: "5.5", number: "5.5", prompt: "Count backwards from 72 (to 58)", displayText: "72, 71...", targetLevel: 5, numberRangeStart: 58, numberRangeEnd: 72, responseFields: [{ label: "Fluency", type: "fluency_scale" }] },
      ],
    },
    {
      id: "tg6",
      number: 6,
      name: "Number Word Before",
      shortName: "NWB",
      model: "BNWS",
      color: "purple",
      instructions:
        'Say: "The number that comes just before 2 is 1. What number comes before ___?"',
      startAtItem: "6.2",
      startNote: "If not fluent go back and do 6.1",
      items: [
        { id: "6.1a", number: "6.1", prompt: "What comes before 6?", displayText: "___,  6", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1b", number: "6.1", prompt: "What comes before 3?", displayText: "___,  3", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1c", number: "6.1", prompt: "What comes before 9?", displayText: "___,  9", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1d", number: "6.1", prompt: "What comes before 5?", displayText: "___,  5", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1e", number: "6.1", prompt: "What comes before 7?", displayText: "___,  7", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.2a", number: "6.2", prompt: "What comes before 24?", displayText: "___,  24", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.2b", number: "6.2", prompt: "What comes before 17?", displayText: "___,  17", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.2c", number: "6.2", prompt: "What comes before 30?", displayText: "___,  30", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.2d", number: "6.2", prompt: "What comes before 13?", displayText: "___,  13", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.2e", number: "6.2", prompt: "What comes before 21?", displayText: "___,  21", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.3a", number: "6.3", prompt: "What comes before 67?", displayText: "___,  67", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.3b", number: "6.3", prompt: "What comes before 38?", displayText: "___,  38", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.3c", number: "6.3", prompt: "What comes before 73?", displayText: "___,  73", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.3d", number: "6.3", prompt: "What comes before 80?", displayText: "___,  80", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.3e", number: "6.3", prompt: "What comes before 51?", displayText: "___,  51", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },
  ] as TaskGroup[],

  // Level descriptions for placement report
  fnwsLevels: [
    { level: 0, name: "Emergent FNWS", description: "Cannot produce FNWS from 1 to 10" },
    { level: 1, name: "Initial FNWS to 'ten'", description: "Can count 1–10, cannot give number after a given number in range 1–10" },
    { level: 2, name: "Intermediate FNWS to 'ten'", description: "Can give NWA in range 1–10 but drops back to running count" },
    { level: 3, name: "Facile FNWS to 'ten'", description: "Fluent with NWA 1–10, difficulty beyond 10" },
    { level: 4, name: "Facile FNWS to 'thirty'", description: "Fluent with NWA 1–30" },
    { level: 5, name: "Facile FNWS to 'one hundred'", description: "Fluent with NWA 1–100" },
    { level: 6, name: "Facile FNWS to 'one thousand'", description: "Fluent with NWA 1–1,000" },
    { level: 7, name: "Facile FNWS to 'ten thousand'", description: "Fluent with NWA 1–10,000" },
  ],

  bnwsLevels: [
    { level: 0, name: "Emergent BNWS", description: "Cannot produce BNWS from 10 to 1" },
    { level: 1, name: "Initial BNWS to 'ten'", description: "Can count backward 10–1 but cannot give number before a given number" },
    { level: 2, name: "Intermediate BNWS to 'ten'", description: "Can give NWB in range 1–10 but drops back to running count" },
    { level: 3, name: "Facile BNWS to 'ten'", description: "Fluent with NWB 1–10, difficulty beyond 10" },
    { level: 4, name: "Facile BNWS to 'thirty'", description: "Fluent with NWB 1–30" },
    { level: 5, name: "Facile BNWS to 'one hundred'", description: "Fluent with NWB 1–100" },
  ],

  nidLevels: [
    { level: 0, name: "Emergent NID", description: "Cannot identify numerals 0–10" },
    { level: 1, name: "Numerals to 10", description: "Identifies numerals 0–10" },
    { level: 2, name: "Numerals to 20", description: "Identifies numerals 0–20" },
    { level: 3, name: "Numerals to 100", description: "Identifies 1- and 2-digit numerals" },
    { level: 4, name: "Numerals to 1,000", description: "Identifies 1-, 2-, and 3-digit numerals" },
  ],
};
