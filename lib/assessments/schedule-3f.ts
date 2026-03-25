// Schedule 3F: Multiplicative Basic Facts
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Based on PDF pages 69–70 (LFIN Assessments.pdf)
// Model: Multiplicative Basic Facts (MBF) — 5 Ranges × 4 Stages

export type ResponseFieldType =
  | "correct_incorrect"
  | "strategy_select";

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

// ── Shared response field ───────────────────────────────────────────────────

const RESP: ResponseField = { label: "Response", type: "correct_incorrect" };

const STRATEGY_FIELD: ResponseField = {
  label: "Strategy",
  type: "strategy_select",
  options: ["Counting-based", "Multiplicative strategy", "Facile - known fact"],
};

export const schedule3F = {
  id: "schedule-3f",
  name: "Schedule 3F: Multiplicative Basic Facts",
  shortName: "3F",
  gradeRange: "3–5",
  materials: ["Task cards (expression cards)"],
  models: ["MBF"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Range 1 — 2s and 10s (facile)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Range 1: 2s and 10s",
      shortName: "Range 1",
      model: "MBF",
      color: "purple",
      instructions: "Present on cards. Assess strategies by enquiring about reasoning, even for known facts. If student uses counting-based strategies (e.g. skip-counting by 2 six times), ask 'Can you do it without counting?'",
      materials: "Task cards",
      startAtItem: "f1-mult-2x6",
      startNote: "START HERE for most students",
      items: [
        // ── Multiplication ───────────────────────────────────────────────────
        {
          id: "f1-mult-2x6",
          number: "1.1 Multiplication",
          prompt: "2 × 6",
          displayText: "2 × 6",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f1-mult-5x10",
          number: "1.2 Multiplication",
          prompt: "5 × 10",
          displayText: "5 × 10",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f1-mult-8x2",
          number: "1.3 Multiplication",
          prompt: "8 × 2",
          displayText: "8 × 2",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f1-mult-10x7",
          number: "1.4 Multiplication",
          prompt: "10 × 7",
          displayText: "10 × 7",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },

        // ── Division ─────────────────────────────────────────────────────────
        {
          id: "f1-div-90by10",
          number: "1.5 Division",
          prompt: "90 ÷ 10",
          displayText: "90 ÷ 10",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f1-div-14by7",
          number: "1.6 Division",
          prompt: "14 ÷ 7",
          displayText: "14 ÷ 7",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f1-div-18by2",
          number: "1.7 Division",
          prompt: "18 ÷ 2",
          displayText: "18 ÷ 2",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f1-div-80by8",
          number: "1.8 Division",
          prompt: "80 ÷ 8",
          displayText: "80 ÷ 8",
          targetLevel: 1,
          responseFields: [RESP, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Range 2 — Low × Low (3s, 4s, 5s)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Range 2: Low × Low (3s, 4s, 5s)",
      shortName: "Range 2",
      model: "MBF",
      color: "purple",
      instructions: "Present on cards. Assess strategies.",
      materials: "Task cards",
      items: [
        // ── Multiplication ───────────────────────────────────────────────────
        {
          id: "f2-mult-3x4",
          number: "2.1 Multiplication",
          prompt: "3 × 4",
          displayText: "3 × 4",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f2-mult-5x3",
          number: "2.2 Multiplication",
          prompt: "5 × 3",
          displayText: "5 × 3",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f2-mult-3x3",
          number: "2.3 Multiplication",
          prompt: "3 × 3",
          displayText: "3 × 3",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f2-mult-4x5",
          number: "2.4 Multiplication",
          prompt: "4 × 5",
          displayText: "4 × 5",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },

        // ── Division ─────────────────────────────────────────────────────────
        {
          id: "f2-div-15by5",
          number: "2.5 Division",
          prompt: "15 ÷ 5",
          displayText: "15 ÷ 5",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f2-div-16by4",
          number: "2.6 Division",
          prompt: "16 ÷ 4",
          displayText: "16 ÷ 4",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f2-div-25by5",
          number: "2.7 Division",
          prompt: "25 ÷ 5",
          displayText: "25 ÷ 5",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f2-div-12by3",
          number: "2.8 Division",
          prompt: "12 ÷ 3",
          displayText: "12 ÷ 3",
          targetLevel: 2,
          responseFields: [RESP, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Range 3 — Low × High (High 3s, 4s, 5s)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Range 3: Low × High (High 3s, 4s, 5s)",
      shortName: "Range 3",
      model: "MBF",
      color: "purple",
      instructions: "Present on cards. Assess strategies.",
      materials: "Task cards",
      items: [
        // ── Multiplication ───────────────────────────────────────────────────
        {
          id: "f3-mult-6x3",
          number: "3.1 Multiplication",
          prompt: "6 × 3",
          displayText: "6 × 3",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f3-mult-4x7",
          number: "3.2 Multiplication",
          prompt: "4 × 7",
          displayText: "4 × 7",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f3-mult-3x9",
          number: "3.3 Multiplication",
          prompt: "3 × 9",
          displayText: "3 × 9",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f3-mult-5x7",
          number: "3.4 Multiplication",
          prompt: "5 × 7",
          displayText: "5 × 7",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },

        // ── Division ─────────────────────────────────────────────────────────
        {
          id: "f3-div-21by3",
          number: "3.5 Division",
          prompt: "21 ÷ 3",
          displayText: "21 ÷ 3",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f3-div-32by8",
          number: "3.6 Division",
          prompt: "32 ÷ 8",
          displayText: "32 ÷ 8",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f3-div-30by6",
          number: "3.7 Division",
          prompt: "30 ÷ 6",
          displayText: "30 ÷ 6",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f3-div-45by5",
          number: "3.8 Division",
          prompt: "45 ÷ 5",
          displayText: "45 ÷ 5",
          targetLevel: 3,
          responseFields: [RESP, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 4: Range 4 — High × High (6s, 7s, 8s, 9s)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Range 4: High × High (6s, 7s, 8s, 9s)",
      shortName: "Range 4",
      model: "MBF",
      color: "purple",
      instructions: "Present on cards. Assess strategies.",
      materials: "Task cards",
      items: [
        // ── Multiplication ───────────────────────────────────────────────────
        {
          id: "f4-mult-6x6",
          number: "4.1 Multiplication",
          prompt: "6 × 6",
          displayText: "6 × 6",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f4-mult-8x7",
          number: "4.2 Multiplication",
          prompt: "8 × 7",
          displayText: "8 × 7",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f4-mult-9x8",
          number: "4.3 Multiplication",
          prompt: "9 × 8",
          displayText: "9 × 8",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f4-mult-7x6",
          number: "4.4 Multiplication",
          prompt: "7 × 6",
          displayText: "7 × 6",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },

        // ── Division ─────────────────────────────────────────────────────────
        {
          id: "f4-div-48by8",
          number: "4.5 Division",
          prompt: "48 ÷ 8",
          displayText: "48 ÷ 8",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f4-div-63by9",
          number: "4.6 Division",
          prompt: "63 ÷ 9",
          displayText: "63 ÷ 9",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f4-div-54by6",
          number: "4.7 Division",
          prompt: "54 ÷ 6",
          displayText: "54 ÷ 6",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f4-div-49by7",
          number: "4.8 Division",
          prompt: "49 ÷ 7",
          displayText: "49 ÷ 7",
          targetLevel: 4,
          responseFields: [RESP, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 5: Range 5 — Factor > 10
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Range 5: Factor > 10",
      shortName: "Range 5",
      model: "MBF",
      color: "purple",
      instructions: "Present on cards. Assess strategies.",
      materials: "Task cards",
      items: [
        // ── Multiplication ───────────────────────────────────────────────────
        {
          id: "f5-mult-3x12",
          number: "5.1 Multiplication",
          prompt: "3 × 12",
          displayText: "3 × 12",
          targetLevel: 5,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f5-mult-15x7",
          number: "5.2 Multiplication",
          prompt: "15 × 7",
          displayText: "15 × 7",
          targetLevel: 5,
          responseFields: [RESP, STRATEGY_FIELD],
        },

        // ── Division ─────────────────────────────────────────────────────────
        {
          id: "f5-div-65by5",
          number: "5.3 Division",
          prompt: "65 ÷ 5",
          displayText: "65 ÷ 5",
          targetLevel: 5,
          responseFields: [RESP, STRATEGY_FIELD],
        },
        {
          id: "f5-div-96by4",
          number: "5.4 Division",
          prompt: "96 ÷ 4",
          displayText: "96 ÷ 4",
          targetLevel: 5,
          responseFields: [RESP, STRATEGY_FIELD],
        },
      ],
    },

  ] as TaskGroup[],

  // ── MBF Model Levels (from PDF — Multiplicative Basic Facts) ──
  mbfLevels: [
    {
      level: 1,
      name: "Range 1: 2s and 10s",
      description: "Facile multiplication and division facts for 2s and 10s",
    },
    {
      level: 2,
      name: "Range 2: Low × Low",
      description: "Facile multiplication and division facts for 3s, 4s, and 5s (low factors)",
    },
    {
      level: 3,
      name: "Range 3: Low × High",
      description: "Facile multiplication and division facts for high 3s, 4s, and 5s (e.g., 6×3, 4×7, 3×9, 5×7)",
    },
    {
      level: 4,
      name: "Range 4: High × High",
      description: "Facile multiplication and division facts for 6s, 7s, 8s, and 9s",
    },
    {
      level: 5,
      name: "Range 5: Factor > 10",
      description: "Multiplication and division facts where one factor exceeds 10",
    },
  ],
};
