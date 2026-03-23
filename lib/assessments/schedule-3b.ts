// Schedule 3B: Structuring Numbers to 20
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Task Cards; Addition and Subtraction Cards (formal section)
// Model: Structuring Numbers 1 to 20 (SN20) levels 0–7
//
// Teacher note: In each task group, if student uses counting, ask "Can you do it
// without counting?" If student can only solve by counting, no need to pose
// remainder of task group.

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
  startAtItem?: string;
  startNote?: string;
}

const STRATEGY_FIELD: ResponseField = {
  label: "Strategy",
  type: "fluency_scale",
  options: ["Immediate", "Recalled", "Derived", "Counted"],
};

export const schedule3B = {
  id: "schedule-3b",
  name: "Schedule 3B: Structuring Numbers to 20",
  shortName: "3B",
  gradeRange: "K–3",
  materials: ["Task Cards", "Addition and Subtraction Cards"],
  models: ["SN20"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Making Finger Patterns (6–10)       Level ①
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Making Finger Patterns (6–10)",
      shortName: "Finger Patterns",
      model: "SN20",
      color: "indigo",
      instructions: "Ask student to show each number on their fingers. For 6, ask if they can show it another way.",
      teacherScript: '"Show me ___ on your fingers."',
      items: [
        {
          id: "1a", number: "Finger Patterns", targetLevel: 1,
          prompt: "Show me 10 on your fingers", displayText: "10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1b", number: "Finger Patterns", targetLevel: 1,
          prompt: "Show me 8 on your fingers", displayText: "8",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1c", number: "Finger Patterns", targetLevel: 1,
          prompt: "Show me 7 on your fingers", displayText: "7",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1d", number: "Finger Patterns", targetLevel: 1,
          prompt: "Show me 9 on your fingers", displayText: "9",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1e", number: "Finger Patterns", targetLevel: 1,
          prompt: "Show me 6 on your fingers", displayText: "6",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1f", number: "Finger Patterns", targetLevel: 1,
          prompt: '"Show me 6 another way"', displayText: "6 (another way)",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          notes: "Ask only after student shows one way to make 6",
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Small Doubles                        Level ②
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Small Doubles",
      shortName: "Small Doubles",
      model: "SN20",
      color: "indigo",
      instructions: "Show task card. Ask student for the total.",
      teacherScript: '"What is ___ and ___?" (show task card)',
      materials: "Task Cards",
      items: [
        {
          id: "2a", number: "Small Doubles", targetLevel: 2,
          prompt: "What is 2 and 2?", displayText: "2 & 2",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "2b", number: "Small Doubles", targetLevel: 2,
          prompt: "What is 5 and 5?", displayText: "5 & 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "2c", number: "Small Doubles", targetLevel: 2,
          prompt: "What is 3 and 3?", displayText: "3 & 3",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "2d", number: "Small Doubles", targetLevel: 2,
          prompt: "What is 4 and 4?", displayText: "4 & 4",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Partitions of 10                    Levels ② & ③
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Partitions of 10",
      shortName: "Partitions of 10",
      model: "SN20",
      color: "indigo",
      instructions: "Show task card with one part. Ask student what goes with it to make 10.",
      teacherScript: '"What goes with ___ to make 10?" (show task card)',
      materials: "Task Cards",
      items: [
        // 3.1 Small partitions — Level 2 (large number given, small complement needed)
        {
          id: "3.1a", number: "3.1 — Small Partitions", targetLevel: 2,
          prompt: "What goes with 9 to make 10?", displayText: "9 + ? = 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "3.1b", number: "3.1 — Small Partitions", targetLevel: 2,
          prompt: "What goes with 7 to make 10?", displayText: "7 + ? = 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        // 3.2 Big partitions — Level 3 (small number given, larger complement needed)
        {
          id: "3.2a", number: "3.2 — Big Partitions", targetLevel: 3,
          prompt: "What goes with 2 to make 10?", displayText: "2 + ? = 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "3.2b", number: "3.2 — Big Partitions", targetLevel: 3,
          prompt: "What goes with 4 to make 10?", displayText: "4 + ? = 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 4: Partitions of 5                      Level ③
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Partitions of 5",
      shortName: "Partitions of 5",
      model: "SN20",
      color: "indigo",
      instructions: "Show task card with one part. Ask student what goes with it to make 5.",
      teacherScript: '"What goes with ___ to make 5?" (show task card)',
      materials: "Task Cards",
      items: [
        {
          id: "4a", number: "Partitions of 5", targetLevel: 3,
          prompt: "What goes with 2 to make 5?", displayText: "2 + ? = 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "4b", number: "Partitions of 5", targetLevel: 3,
          prompt: "What goes with 1 to make 5?", displayText: "1 + ? = 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "4c", number: "Partitions of 5", targetLevel: 3,
          prompt: "What goes with 3 to make 5?", displayText: "3 + ? = 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 5: Five-plus Facts                      Level ③
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Five-plus Facts",
      shortName: "Five-plus",
      model: "SN20",
      color: "indigo",
      instructions: "Show task card. Ask student for the total.",
      teacherScript: '"What is ___?" (show task card)',
      materials: "Task Cards",
      items: [
        {
          id: "5a", number: "Five-plus Facts", targetLevel: 3,
          prompt: "What is 5 + 2?", displayText: "5 + 2",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "5b", number: "Five-plus Facts", targetLevel: 3,
          prompt: "What is 5 + 4?", displayText: "5 + 4",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "5c", number: "Five-plus Facts", targetLevel: 3,
          prompt: "What is 5 + 1?", displayText: "5 + 1",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "5d", number: "Five-plus Facts", targetLevel: 3,
          prompt: "What is 5 + 3?", displayText: "5 + 3",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "5e", number: "Five-plus Facts", targetLevel: 3,
          prompt: "What is 1 + 5?", displayText: "1 + 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "5f", number: "Five-plus Facts", targetLevel: 3,
          prompt: "What is 3 + 5?", displayText: "3 + 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 6: Partitions in Range 1 to 9           Level ④
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Partitions in Range 1–9",
      shortName: "Partitions 1–9",
      model: "SN20",
      color: "indigo",
      instructions: 'Give two examples first: "3 and 1 add up to 4, yes? Also, 2 and 2 add up to 4." Then ask for each number: "Can you tell me two numbers that add up to ___? Can you tell me another two numbers?"',
      teacherScript: '"I am going to give two examples. 3&1 add up to 4, yes? Also, 2&2 add up to 4. Now, can you tell me two numbers that add up to ___? Can you tell me another two numbers?"',
      materials: "Task Cards",
      items: [
        {
          id: "6a", number: "6.1 — Partitions of 6", targetLevel: 4,
          prompt: "Can you tell me two numbers that add up to 6? Can you tell me another two numbers?",
          displayText: "6",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "6b", number: "6.2 — Partitions of 9", targetLevel: 4,
          prompt: "Can you tell me two numbers that add up to 9? Can you tell me another two numbers?",
          displayText: "9",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 7: Partitions in Range 11 to 20         Level ⑦
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg7",
      number: 7,
      name: "Partitions in Range 11–20",
      shortName: "Partitions 11–20",
      model: "SN20",
      color: "indigo",
      instructions: 'Ask: "Can you tell me two numbers that add up to ___?...Another two?"',
      teacherScript: '"Can you tell me two numbers that add up to ___?...Another two?"',
      materials: "Task Cards",
      items: [
        {
          id: "7a", number: "Partitions 11–20", targetLevel: 7,
          prompt: "Can you tell me two numbers that add up to 12? Another two?",
          displayText: "12",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "7b", number: "Partitions 11–20", targetLevel: 7,
          prompt: "Can you tell me two numbers that add up to 19? Another two?",
          displayText: "19",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 8: Ten-plus Facts & Teen plus 10        Level ⑤
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg8",
      number: 8,
      name: "Ten-plus Facts",
      shortName: "Ten-plus",
      model: "SN20",
      color: "indigo",
      instructions: "Show task card. Ask student for the total.",
      teacherScript: '"What is ___?" (show task card)',
      materials: "Task Cards",
      items: [
        // 8.1 — Ten-plus facts
        {
          id: "8.1a", number: "8.1 — Ten-plus Facts", targetLevel: 5,
          prompt: "What is 10 + 4?", displayText: "10 + 4",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "8.1b", number: "8.1 — Ten-plus Facts", targetLevel: 5,
          prompt: "What is 10 + 8?", displayText: "10 + 8",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "8.1c", number: "8.1 — Ten-plus Facts", targetLevel: 5,
          prompt: "What is 10 + 2?", displayText: "10 + 2",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "8.1d", number: "8.1 — Ten-plus Facts", targetLevel: 5,
          prompt: "What is 7 + 10?", displayText: "7 + 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "8.1e", number: "8.1 — Ten-plus Facts", targetLevel: 5,
          prompt: "What is 5 + 10?", displayText: "5 + 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "8.1f", number: "8.1 — Ten-plus Facts", targetLevel: 5,
          prompt: "What is 1 + 10?", displayText: "1 + 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        // 8.2 — Teen plus 10
        {
          id: "8.2a", number: "8.2 — Teen plus 10", targetLevel: 5,
          prompt: "What is 16 + 10?", displayText: "16 + 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "8.2b", number: "8.2 — Teen plus 10", targetLevel: 5,
          prompt: "What is 12 + 10?", displayText: "12 + 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 9: Big Doubles                          Level ⑤
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg9",
      number: 9,
      name: "Big Doubles",
      shortName: "Big Doubles",
      model: "SN20",
      color: "indigo",
      instructions: "Show task card. Ask student for the total.",
      teacherScript: '"What is ___ and ___?" (show task card)',
      materials: "Task Cards",
      items: [
        {
          id: "9a", number: "Big Doubles", targetLevel: 5,
          prompt: "What is 10 and 10?", displayText: "10 & 10",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "9b", number: "Big Doubles", targetLevel: 5,
          prompt: "What is 6 and 6?", displayText: "6 & 6",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "9c", number: "Big Doubles", targetLevel: 5,
          prompt: "What is 8 and 8?", displayText: "8 & 8",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "9d", number: "Big Doubles", targetLevel: 5,
          prompt: "What is 9 and 9?", displayText: "9 & 9",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "9e", number: "Big Doubles", targetLevel: 5,
          prompt: "What is 7 and 7?", displayText: "7 & 7",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // FORMAL SECTION — only continue if student uses facile strategies above
    //
    // TASK GROUP 10: Range 2 — Addition (Whole ≤ 10)    Level ④
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg10",
      number: 10,
      name: "Range 2 — Addition (Whole ≤ 10)",
      shortName: "Range 2 Addition",
      model: "SN20",
      color: "indigo",
      instructions: 'Show the card. Say "Read this please… What is the answer?" Enquire about strategy. If student counts, ask "Can you do it without counting?"',
      teacherScript: '"Read this please… What is the answer?" (show addition card; enquire about strategy)',
      materials: "Addition and Subtraction Cards",
      branchingNote: "⚠ If student only used counting-by-ones in Task Groups 1–9 → END ASSESSMENT HERE",
      items: [
        {
          id: "10a", number: "Range 2 Addition", targetLevel: 4,
          prompt: "What is 4 + 3?", displayText: "4 + 3",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "10b", number: "Range 2 Addition", targetLevel: 4,
          prompt: "What is 3 + 6?", displayText: "3 + 6",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "10c", number: "Range 2 Addition", targetLevel: 4,
          prompt: "What is 2 + 7?", displayText: "2 + 7",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 11: Range 3 — Addition (Parts ≤ 10)    Level ⑤
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg11",
      number: 11,
      name: "Range 3 — Addition (Parts ≤ 10)",
      shortName: "Range 3 Addition",
      model: "SN20",
      color: "indigo",
      instructions: 'Show the card. Say "Read this please… What is the answer?" Enquire about strategy. If student counts, ask "Can you do it without counting?"',
      teacherScript: '"Read this please… What is the answer?" (show addition card; enquire about strategy)',
      materials: "Addition and Subtraction Cards",
      items: [
        {
          id: "11a", number: "Range 3 Addition", targetLevel: 5,
          prompt: "What is 6 + 5?", displayText: "6 + 5",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "11b", number: "Range 3 Addition", targetLevel: 5,
          prompt: "What is 9 + 6?", displayText: "9 + 6",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "11c", number: "Range 3 Addition", targetLevel: 5,
          prompt: "What is 8 + 7?", displayText: "8 + 7",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 12: Range 3 — Subtraction (Parts ≤ 10) Level ⑥
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg12",
      number: 12,
      name: "Range 3 — Subtraction (Parts ≤ 10)",
      shortName: "Range 3 Subtraction",
      model: "SN20",
      color: "indigo",
      instructions: 'Show the card. Say "Read this please… What is the answer?" Enquire about strategy. If student counts, ask "Can you do it without counting?"',
      teacherScript: '"Read this please… What is the answer?" (show subtraction card; enquire about strategy)',
      materials: "Addition and Subtraction Cards",
      items: [
        {
          id: "12a", number: "Range 3 Subtraction", targetLevel: 6,
          prompt: "What is 14 − 7?", displayText: "14 − 7",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "12b", number: "Range 3 Subtraction", targetLevel: 6,
          prompt: "What is 11 − 4?", displayText: "11 − 4",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "12c", number: "Range 3 Subtraction", targetLevel: 6,
          prompt: "What is 17 − 9?", displayText: "17 − 9",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 13: Range 4 — Add & Subtract (Whole ≤ 20) Level ⑦
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg13",
      number: 13,
      name: "Range 4 — Addition & Subtraction (Whole ≤ 20)",
      shortName: "Range 4",
      model: "SN20",
      color: "indigo",
      instructions: 'Show the card. Say "Read this please… What is the answer?" Enquire about strategy. If student counts, ask "Can you do it without counting?"',
      teacherScript: '"Read this please… What is the answer?" (show addition/subtraction card; enquire about strategy)',
      materials: "Addition and Subtraction Cards",
      items: [
        {
          id: "13a", number: "Range 4", targetLevel: 7,
          prompt: "What is 13 + 3?", displayText: "13 + 3",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "13b", number: "Range 4", targetLevel: 7,
          prompt: "What is 11 + 8?", displayText: "11 + 8",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "13c", number: "Range 4", targetLevel: 7,
          prompt: "What is 17 − 15?", displayText: "17 − 15",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
        {
          id: "13d", number: "Range 4", targetLevel: 7,
          prompt: "What is 19 − 13?", displayText: "19 − 13",
          responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD],
        },
      ],
    },

  ] as TaskGroup[],

  // Full SN20 model — Wright & Ellemor-Collins, 2018 (exact PDF wording)
  // Note: For levels 1–7, student has to use facile strategies, not counting by ones.
  sn20Levels: [
    { level: 0, name: "Emergent spatial patterns and finger patterns",         description: "Cannot identify spatial patterns or make finger patterns without counting" },
    { level: 1, name: "Finger patterns 1–5 and spatial patterns 1–6",         description: "Shows finger patterns 1–5 and recognises spatial patterns 1–6 without counting" },
    { level: 2, name: "Small doubles and small partitions of 10",              description: "Facile with small doubles (2&2 to 5&5) and small partitions of 10" },
    { level: 3, name: "Five-plus and partitions of 5",                        description: "Facile with five-plus facts and partitions of 5" },
    { level: 4, name: "Facile structuring numbers 1 to 10",                   description: "Facile with all partitions 1–9 and formal addition with whole ≤ 10" },
    { level: 5, name: "Formal addition (parts ≤ 10)",                         description: "Facile with formal addition tasks where parts do not exceed 10" },
    { level: 6, name: "Formal addition & subtraction (parts ≤ 10)",           description: "Facile with formal addition and subtraction where parts do not exceed 10" },
    { level: 7, name: "Formal addition & subtraction (whole ≤ 20)",           description: "Facile with formal addition and subtraction where whole does not exceed 20" },
  ],
};
