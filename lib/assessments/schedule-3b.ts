// Schedule 3B: Multiplication and Division
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Grade range: 2–5
// Materials: Counters, screen card, paper
// Model: MAS (Multiplication and Division Assessment Stages) levels 0–5

export type ResponseFieldType =
  | "correct_incorrect"
  | "fluency_scale";

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
  startAtItem?: string;   // sub-level key where START HERE badge appears
  startNote?: string;     // optional note shown on the START HERE banner
}

const FLUENCY_OPTIONS = ["Immediate", "Hesitant", "Counted up", "Not known"];
const STRATEGY_OPTIONS = ["Recalled fact", "Skip counting", "Repeated addition", "Counts by ones", "Other"];
const DIVISION_STRATEGY_OPTIONS = ["Recalled fact", "Trial multiplication", "Sharing by ones", "Other"];

export const schedule3B = {
  id: "schedule-3b",
  name: "Schedule 3B: Multiplication and Division",
  shortName: "3B",
  gradeRange: "2–5",
  materials: ["Counters", "Screen card", "Paper"],
  models: ["MAS"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Equal Grouping — Visible (MAS Stage 1–2)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Equal Grouping — Visible",
      shortName: "Equal Groups (Visible)",
      model: "MAS",
      color: "orange",
      instructions: "Place counters in equal groups. Ask the student to find the total.",
      teacherScript: '"Here are ___ groups of ___. How many counters altogether?"',
      materials: "Counters (visible)",
      items: [
        {
          id: "1.1", number: "1.1", prompt: "3 groups of 2 (visible)", displayText: "3 groups of 2",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.2", number: "1.2", prompt: "4 groups of 2 (visible)", displayText: "4 groups of 2",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.3", number: "1.3", prompt: "2 groups of 5 (visible)", displayText: "2 groups of 5",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.4", number: "1.4", prompt: "3 groups of 4 (visible)", displayText: "3 groups of 4",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.5", number: "1.5", prompt: "4 groups of 5 (visible)", displayText: "4 groups of 5",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Equal Grouping — Screened (MAS Stage 2–3)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Equal Grouping — Screened",
      shortName: "Equal Groups (Screened)",
      model: "MAS",
      color: "orange",
      instructions: "Place counters in equal groups then cover with a screen card.",
      teacherScript: '"I have ___ groups of ___ under here. How many counters altogether?"',
      materials: "Counters, screen card",
      startAtItem: "Stage 2",
      items: [
        // Stage 2
        {
          id: "2.1", number: "Stage 2", prompt: "3 groups of 2 (screened)", displayText: "3 groups of 2",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.2", number: "Stage 2", prompt: "4 groups of 2 (screened)", displayText: "4 groups of 2",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Stage 3
        {
          id: "2.3", number: "Stage 3", prompt: "3 groups of 4 (screened)", displayText: "3 groups of 4",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.4", number: "Stage 3", prompt: "4 groups of 3 (screened)", displayText: "4 groups of 3",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.5", number: "Stage 3", prompt: "5 groups of 4 (screened)", displayText: "5 groups of 4",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.6", number: "Stage 3", prompt: "3 groups of 6 (screened)", displayText: "3 groups of 6",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Skip Counting (MAS Stage 3–4)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Skip Counting",
      shortName: "Skip Counting",
      model: "MAS",
      color: "orange",
      instructions: "Ask the student to count by the given number.",
      teacherScript: '"Count by ___ from 0."',
      materials: "None",
      startAtItem: "3.1",
      items: [
        // Stage 3
        {
          id: "3.1", number: "3.1", prompt: "Count by 2s to 20", displayText: "2, 4, 6…20",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.2", number: "3.2", prompt: "Count by 5s to 50", displayText: "5, 10, 15…50",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.3", number: "3.3", prompt: "Count by 10s to 100", displayText: "10, 20, 30…100",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        // Stage 4
        {
          id: "3.4", number: "3.4", prompt: "Count by 3s to 30", displayText: "3, 6, 9…30",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.5", number: "3.5", prompt: "Count by 4s to 40", displayText: "4, 8, 12…40",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.6", number: "3.6", prompt: "Count by 6s to 60", displayText: "6, 12, 18…60",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: Multiplication Tasks (MAS Stage 3–5)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Multiplication Tasks",
      shortName: "Multiplication",
      model: "MAS",
      color: "orange",
      instructions: "Present multiplication tasks verbally or with written notation.",
      teacherScript: '"What is ___ times ___?"',
      materials: "Paper (optional)",
      startAtItem: "Stage 3",
      items: [
        // Stage 3
        {
          id: "4.1", number: "Stage 3", prompt: "2 × 6", displayText: "2 × 6",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        {
          id: "4.2", number: "Stage 3", prompt: "3 × 5", displayText: "3 × 5",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        {
          id: "4.3", number: "Stage 3", prompt: "4 × 4", displayText: "4 × 4",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        // Stage 4
        {
          id: "4.4", number: "Stage 4", prompt: "6 × 7", displayText: "6 × 7",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        {
          id: "4.5", number: "Stage 4", prompt: "8 × 9", displayText: "8 × 9",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        {
          id: "4.6", number: "Stage 4", prompt: "7 × 6", displayText: "7 × 6",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        // Stage 5
        {
          id: "4.7", number: "Stage 5", prompt: "12 × 4", displayText: "12 × 4",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        {
          id: "4.8", number: "Stage 5", prompt: "15 × 3", displayText: "15 × 3",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
        {
          id: "4.9", number: "Stage 5", prompt: "6 × 13", displayText: "6 × 13",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: STRATEGY_OPTIONS },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Division Tasks (MAS Stage 4–5)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Division Tasks",
      shortName: "Division",
      model: "MAS",
      color: "orange",
      instructions: "Present division tasks verbally.",
      teacherScript: '"If I share ___ equally among ___ children, how many each?"',
      materials: "None",
      startAtItem: "Stage 4",
      items: [
        // Stage 4
        {
          id: "5.1", number: "Stage 4", prompt: "12 ÷ 3 (share)", displayText: "12 ÷ 3",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: DIVISION_STRATEGY_OPTIONS },
          ],
        },
        {
          id: "5.2", number: "Stage 4", prompt: "20 ÷ 4 (share)", displayText: "20 ÷ 4",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: DIVISION_STRATEGY_OPTIONS },
          ],
        },
        {
          id: "5.3", number: "Stage 4", prompt: "15 ÷ 5 (share)", displayText: "15 ÷ 5",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: DIVISION_STRATEGY_OPTIONS },
          ],
        },
        // Stage 5
        {
          id: "5.4", number: "Stage 5", prompt: "36 ÷ 6 (share)", displayText: "36 ÷ 6",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: DIVISION_STRATEGY_OPTIONS },
          ],
        },
        {
          id: "5.5", number: "Stage 5", prompt: "42 ÷ 7 (share)", displayText: "42 ÷ 7",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: DIVISION_STRATEGY_OPTIONS },
          ],
        },
        {
          id: "5.6", number: "Stage 5", prompt: "56 ÷ 8 (share)", displayText: "56 ÷ 8",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Strategy", type: "fluency_scale", options: DIVISION_STRATEGY_OPTIONS },
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // MAS levels — Wright & Ellemor-Collins, 2018
  masLevels: [
    { level: 0, name: "Emergent", description: "Cannot use equal grouping or repeated addition" },
    { level: 1, name: "Perceptual Counting", description: "Counts visible items in groups by ones" },
    { level: 2, name: "Figurative Counting", description: "Uses repeated addition or skip counting for visible groups" },
    { level: 3, name: "Initial Repeated Grouping", description: "Skip counts screened groups; solves using repeated addition" },
    { level: 4, name: "Composite Grouping", description: "Uses grouping strategies; beginning known facts" },
    { level: 5, name: "Facile Multiplicative", description: "Efficient strategies; uses recalled multiplication and division facts" },
  ],
};
