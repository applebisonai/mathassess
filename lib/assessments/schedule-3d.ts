// Schedule 3D: Addition and Subtraction to 100
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Task Cards (TG1–5), 10 Numeral Cards + Decuple Line (TG6–10)
// Model: Addition and Subtraction to 100 (A&S) levels 0–6

export type ResponseFieldType =
  | "correct_incorrect"
  | "strategy_select";

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
  startNote?: string;
  allowEarlyExit?: boolean;
  earlyExitNote?: string;
  skipToId?: string;
  skipLabel?: string;
}

const STRATEGY_FIELD: ResponseField = {
  label: "Strategy",
  type: "strategy_select",
  options: ["Facile / Non-counting", "Counting-on", "Counting-back", "Algorithm", "Unknown / Other"],
};

export const schedule3D = {
  id: "schedule-3d",
  name: "Schedule 3D: Addition and Subtraction to 100",
  shortName: "3D",
  gradeRange: "2–5",
  materials: ["10 Task Cards", "10 Numeral Cards", "Decuple Line"],
  models: ["A&S"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────
    // PART A — FORMAL ADDITION AND SUBTRACTION   (TG 1–5, Task Cards)
    // ─────────────────────────────────────────────────────────────────────

    // ─── TASK GROUP 1 ────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Add/Subtract a Decuple",
      shortName: "Add/Sub Decuple",
      model: "A&S",
      color: "orange",
      instructions: 'Present each task on a CARD. "Read this please … What is the answer?" Generally enquire about strategy used. Ask: "Can you do it without counting?"',
      teacherScript: '"Read this please. What is the answer?"',
      materials: "Task Cards",
      items: [
        {
          id: "1a",
          number: "1.1",
          prompt: "61 + 30",
          displayText: "61 + 30",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
        {
          id: "1b",
          number: "1.2",
          prompt: "87 − 50",
          displayText: "87 − 50",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 2 ────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "2-Digit Addition/Subtraction Without Regrouping",
      shortName: "2-Digit No Regroup",
      model: "A&S",
      color: "orange",
      instructions: 'Present each task on a CARD. "Read this please … What is the answer?" Enquire about strategy used.',
      teacherScript: '"Read this please. What is the answer?"',
      materials: "Task Cards",
      items: [
        {
          id: "2a",
          number: "2.1",
          prompt: "36 + 22",
          displayText: "36 + 22",
          targetLevel: 2,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
        {
          id: "2b",
          number: "2.2",
          prompt: "65 − 13",
          displayText: "65 − 13",
          targetLevel: 2,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 3 ────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "2-Digit Addition With Regrouping",
      shortName: "2-Digit Add Regroup",
      model: "A&S",
      color: "orange",
      instructions: 'Present each task on a CARD. "Read this please … What is the answer?" Enquire about strategy. START HERE for most Grade 2+ students.',
      teacherScript: '"Read this please. What is the answer?"',
      materials: "Task Cards",
      startNote: "Recommended start point for Grade 2+ students",
      branchingNote: "If unsuccessful on TG3 and TG4 → go back and pose TG1 and TG2 as well",
      items: [
        {
          id: "3a",
          number: "3.1",
          prompt: "58 + 24",
          displayText: "58 + 24",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
        {
          id: "3b",
          number: "3.2",
          prompt: "43 + 19",
          displayText: "43 + 19",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 4 ────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "2-Digit Subtraction With Regrouping",
      shortName: "2-Digit Sub Regroup",
      model: "A&S",
      color: "orange",
      instructions: 'Present each task on a CARD. "Read this please … What is the answer?" Enquire about strategy.',
      teacherScript: '"Read this please. What is the answer?"',
      materials: "Task Cards",
      items: [
        {
          id: "4a",
          number: "4.1",
          prompt: "51 − 25",
          displayText: "51 − 25",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
        {
          id: "4b",
          number: "4.2",
          prompt: "82 − 39",
          displayText: "82 − 39",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 5 ────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "3-Digit Addition & Subtraction With Regrouping",
      shortName: "3-Digit Regroup",
      model: "A&S",
      color: "orange",
      instructions: 'Present each task on a CARD. "Read this please … What is the answer?" Enquire about strategy.',
      teacherScript: '"Read this please. What is the answer?"',
      materials: "Task Cards",
      items: [
        {
          id: "5a",
          number: "5.1",
          prompt: "386 + 240",
          displayText: "386 + 240",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
        {
          id: "5b",
          number: "5.2",
          prompt: "705 − 698",
          displayText: "705 − 698",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            STRATEGY_FIELD,
          ],
        },
      ],
    } as TaskGroup,

    // ─────────────────────────────────────────────────────────────────────
    // PART B — HIGHER DECADE ADDITION AND SUBTRACTION   (TG 6–10)
    // ─────────────────────────────────────────────────────────────────────
    // Preliminaries: Show a DECUPLE LINE (10, 20, 30 … 100).
    // "What do you call these numbers?" (Tens, whole tens, round numbers, decades …?)
    // "I'm going to turn this card over, then ask questions about decuples."
    // Use whatever name the student uses for decuples.
    // Remove the decuple line. Show NUMERAL CARD for each task.

    // ─── TASK GROUP 6 ────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Decuple After/Before a Number",
      shortName: "Decuple After/Before",
      model: "A&S",
      color: "orange",
      instructions: 'Show a sample DECUPLE LINE (10, 20, 30 … 100). "What do you call these numbers?" (Tens, decades, round numbers …?) "I\'m going to turn this card over and ask you some questions about decuples." Remove the line. Show NUMERAL CARD for each task.',
      teacherScript: '"What\'s that number? What is the decuple after ___? What is the decuple before ___?"',
      materials: "Numeral Cards, Decuple Line (for intro only)",
      items: [
        {
          id: "6a",
          number: "6.1",
          prompt: "Show card: 58\n→ What's that number?\n→ What is the decuple after 58?\n→ What is the decuple before 58?",
          displayText: "58",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
        {
          id: "6b",
          number: "6.2",
          prompt: "Show card: 40\n→ What's that number?\n→ What is the decuple after 40?\n→ What is the decuple before 40?",
          displayText: "40",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 7 ────────────────────────────────────────────────────
    {
      id: "tg7",
      number: 7,
      name: "Add-Up-From/Subtract-Down-To a Decuple",
      shortName: "Add-Up/Sub-Down to Decuple",
      model: "A&S",
      color: "orange",
      instructions: 'Show NUMERAL CARD. Ask questions as shown. Use name student uses for decuples.',
      teacherScript: '"What\'s that number? What\'s ___ more than ___? How far is it back to ___?"',
      materials: "Numeral Cards",
      items: [
        {
          id: "7a",
          number: "7.1",
          prompt: "Show card: 20\n→ What's that number?\n→ What's 3 more than 20?",
          displayText: "20",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
        {
          id: "7b",
          number: "7.2",
          prompt: "Show card: 36\n→ What's that number?\n→ What is the decuple before 36?\n→ How far is it back to 30?",
          displayText: "36",
          targetLevel: 1,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 8 ────────────────────────────────────────────────────
    {
      id: "tg8",
      number: 8,
      name: "Add-Up-To/Subtract-Down-From a Decuple (Small 1–5)",
      shortName: "To/From Decuple (Small)",
      model: "A&S",
      color: "orange",
      instructions: 'Show NUMERAL CARD. Ask questions as shown. "Small" means the jump is 1–5.',
      teacherScript: '"What\'s that number? What is the decuple after ___? How far is it up to ___?"',
      materials: "Numeral Cards",
      items: [
        {
          id: "8a",
          number: "8.1",
          prompt: "Show card: 46\n→ What's that number?\n→ What is the decuple after 46?\n→ How far is it up to 50?",
          displayText: "46",
          targetLevel: 2,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
        {
          id: "8b",
          number: "8.2",
          prompt: "Show card: 60\n→ What's that number?\n→ What is 2 less than 60?",
          displayText: "60",
          targetLevel: 2,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 9 ────────────────────────────────────────────────────
    {
      id: "tg9",
      number: 9,
      name: "Add-Up-To/Subtract-Down-From a Decuple (Large 6–9)",
      shortName: "To/From Decuple (Large)",
      model: "A&S",
      color: "orange",
      instructions: 'Show NUMERAL CARD. Ask questions as shown. "Large" means the jump is 6–9.',
      teacherScript: '"What\'s that number? What is the decuple after ___? How far is it up to ___?"',
      materials: "Numeral Cards",
      items: [
        {
          id: "9a",
          number: "9.1",
          prompt: "Show card: 53\n→ What's that number?\n→ What is the decuple after 53?\n→ How far is it up to 60?",
          displayText: "53",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
        {
          id: "9b",
          number: "9.2",
          prompt: "Show card: 80\n→ What's that number?\n→ What is 8 less than 80?",
          displayText: "80",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
      ],
    } as TaskGroup,

    // ─── TASK GROUP 10 ───────────────────────────────────────────────────
    {
      id: "tg10",
      number: 10,
      name: "Add/Subtract Across a Decuple",
      shortName: "Across Decuple",
      model: "A&S",
      color: "orange",
      instructions: 'Show NUMERAL CARD. Ask questions as shown. The answer crosses a decuple (e.g. 37 + 6 = 43 crosses 40).',
      teacherScript: '"What\'s that number? What is ___ more/less than ___?"',
      materials: "Numeral Cards",
      items: [
        {
          id: "10a",
          number: "10.1",
          prompt: "Show card: 37\n→ What's that number?\n→ What is 6 more than 37?",
          displayText: "37",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
        {
          id: "10b",
          number: "10.2",
          prompt: "Show card: 63\n→ What's that number?\n→ What is 8 less than 63?",
          displayText: "63",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
          ],
        },
      ],
    } as TaskGroup,

  ],

  // Addition and Subtraction to 100 Model — Wright & Ellemor-Collins, 2018
  asLevels: [
    { level: 0, name: "Emergent addition & subtraction to 100",                      description: "Cannot yet use facile strategies for addition or subtraction to 100" },
    { level: 1, name: "Add-up-from / subtract-down-to a decuple",                   description: "Can add-up from a decuple and subtract-down to a decuple (e.g. 20 + 3, distance back to 30)" },
    { level: 2, name: "Add-up-to / subtract-down-from a decuple — small (1–5)",     description: "Can add up to a decuple or subtract down from a decuple when the jump is 1–5 (e.g. 46 → 50)" },
    { level: 3, name: "Add-up-to / subtract-down-from a decuple — large (6–9)",     description: "Can add up to a decuple or subtract down from a decuple when the jump is 6–9 (e.g. 53 → 60)" },
    { level: 4, name: "Add/subtract across a decuple",                              description: "Can add or subtract across a decuple (e.g. 37 + 6 = 43)" },
    { level: 5, name: "2-digit addition with regrouping",                           description: "Can solve 2-digit addition tasks that require regrouping using facile strategies" },
    { level: 6, name: "2-digit addition & subtraction with regrouping",              description: "Can solve both 2-digit addition and subtraction tasks requiring regrouping using facile strategies" },
  ],
};
