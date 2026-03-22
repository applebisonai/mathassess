// Schedule 3B: Structuring Numbers to 20
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Dot cards (five-wise and ten-wise), tens frames, counters, screen card
// Model: Structuring Numbers 1 to 20 (SN20) levels 0–7

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

export const schedule3B = {
  id: "schedule-3b",
  name: "Schedule 3B: Structuring Numbers to 20",
  shortName: "3B",
  gradeRange: "K–3",
  materials: ["Dot cards (five-wise and ten-wise)", "Tens frames", "Counters", "Screen card"],
  models: ["SN20"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Spatial Patterns — Five-wise and Ten-wise
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Spatial Patterns — Five-wise and Ten-wise",
      shortName: "Spatial Patterns",
      model: "SN20",
      color: "indigo",
      instructions: "Show dot card briefly (2–3 seconds). Ask the student how many dots.",
      teacherScript: '"How many dots?" (show card briefly)',
      materials: "Dot cards (five-wise and ten-wise)",
      startAtItem: "Level 4",
      items: [
        // Level 3 items
        { id: "1.1a", number: "Level 3", prompt: "Five-wise pattern: 6 dots", displayText: "6 (five-wise)", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1b", number: "Level 3", prompt: "Five-wise pattern: 7 dots", displayText: "7 (five-wise)", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1c", number: "Level 3", prompt: "Five-wise pattern: 8 dots", displayText: "8 (five-wise)", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // Level 4 items
        { id: "1.2a", number: "Level 4", prompt: "Ten-wise pattern: 6 dots", displayText: "6 (ten-wise)", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2b", number: "Level 4", prompt: "Ten-wise pattern: 8 dots", displayText: "8 (ten-wise)", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2c", number: "Level 4", prompt: "Ten-wise pattern: 9 dots", displayText: "9 (ten-wise)", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // Level 5 items
        { id: "1.3a", number: "Level 5", prompt: "Tens frame: 13 dots (10+3)", displayText: "13 (tens frame)", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.3b", number: "Level 5", prompt: "Tens frame: 16 dots (10+6)", displayText: "16 (tens frame)", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.3c", number: "Level 5", prompt: "Tens frame: 18 dots (10+8)", displayText: "18 (tens frame)", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Partitions and Complements to 10
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Partitions and Complements to 10",
      shortName: "Complements to 10",
      model: "SN20",
      color: "indigo",
      instructions: "Say the number. Ask student how many more to make 10, or ask for partitions.",
      teacherScript: '"How many more to make 10?" / "What are two parts that make ___?"',
      materials: "None (mental)",
      startAtItem: "Level 4",
      items: [
        // Level 4 items
        { id: "2.1a", number: "Level 4", prompt: "How many more to make 10? Start: 7", displayText: "? + 7 = 10", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1b", number: "Level 4", prompt: "How many more to make 10? Start: 4", displayText: "? + 4 = 10", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1c", number: "Level 4", prompt: "How many more to make 10? Start: 6", displayText: "? + 6 = 10", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1d", number: "Level 4", prompt: "How many more to make 10? Start: 8", displayText: "? + 8 = 10", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // Level 5 items
        { id: "2.2a", number: "Level 5", prompt: "Two parts of 9 (not 1+8)", displayText: "___ + ___ = 9", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.2b", number: "Level 5", prompt: "Two parts of 7 (not 1+6)", displayText: "___ + ___ = 7", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.2c", number: "Level 5", prompt: "Two parts of 10 that are close", displayText: "___ + ___ = 10 (near equal)", targetLevel: 5, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Doubles and Near-Doubles
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Doubles and Near-Doubles",
      shortName: "Doubles",
      model: "SN20",
      color: "indigo",
      instructions: "Present addition problems verbally. Student responds without materials.",
      teacherScript: '"What is ___ plus ___?"',
      materials: "None (mental)",
      startAtItem: "Level 4",
      items: [
        // Level 4 items
        {
          id: "3.1a", number: "Level 4", prompt: "Double 4 (4 + 4)", displayText: "4 + 4", targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
        {
          id: "3.1b", number: "Level 4", prompt: "Double 5 (5 + 5)", displayText: "5 + 5", targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
        // Level 5 items
        {
          id: "3.2a", number: "Level 5", prompt: "Double 6 (6 + 6)", displayText: "6 + 6", targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
        {
          id: "3.2b", number: "Level 5", prompt: "Near-double: 5 + 6", displayText: "5 + 6", targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
        {
          id: "3.2c", number: "Level 5", prompt: "Near-double: 6 + 7", displayText: "6 + 7", targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
        // Level 6 items
        {
          id: "3.3a", number: "Level 6", prompt: "Near-double: 7 + 8", displayText: "7 + 8", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
        {
          id: "3.3b", number: "Level 6", prompt: "Near-double: 8 + 9", displayText: "8 + 9", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Recalled", "Derived", "Counted"] },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: Addition within 20
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Addition within 20",
      shortName: "Addition",
      model: "SN20",
      color: "indigo",
      instructions: "Present addition tasks verbally.",
      teacherScript: '"What is ___ plus ___?"',
      materials: "None (mental)",
      startAtItem: "Level 5",
      items: [
        // Level 5 items
        {
          id: "4.1a", number: "Level 5", prompt: "6 + 4", displayText: "6 + 4", targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        {
          id: "4.1b", number: "Level 5", prompt: "7 + 3", displayText: "7 + 3", targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        // Level 6 items (crosses 10)
        {
          id: "4.2a", number: "Level 6", prompt: "8 + 5", displayText: "8 + 5", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        {
          id: "4.2b", number: "Level 6", prompt: "9 + 4", displayText: "9 + 4", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        {
          id: "4.2c", number: "Level 6", prompt: "7 + 6", displayText: "7 + 6", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        // Level 7 items
        {
          id: "4.3a", number: "Level 7", prompt: "8 + 7", displayText: "8 + 7", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        {
          id: "4.3b", number: "Level 7", prompt: "9 + 8", displayText: "9 + 8", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
        {
          id: "4.3c", number: "Level 7", prompt: "6 + 9", displayText: "6 + 9", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted by ones", "Unknown"] },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Subtraction within 20
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Subtraction within 20",
      shortName: "Subtraction",
      model: "SN20",
      color: "indigo",
      instructions: "Present subtraction tasks verbally.",
      teacherScript: '"What is ___ minus ___?"',
      materials: "None (mental)",
      startAtItem: "Level 6",
      items: [
        // Level 6 items
        {
          id: "5.1a", number: "Level 6", prompt: "10 − 4", displayText: "10 − 4", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
        {
          id: "5.1b", number: "Level 6", prompt: "10 − 7", displayText: "10 − 7", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
        {
          id: "5.1c", number: "Level 6", prompt: "9 − 5", displayText: "9 − 5", targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
        // Level 7 items
        {
          id: "5.2a", number: "Level 7", prompt: "14 − 6", displayText: "14 − 6", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
        {
          id: "5.2b", number: "Level 7", prompt: "16 − 8", displayText: "16 − 8", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
        {
          id: "5.2c", number: "Level 7", prompt: "13 − 7", displayText: "13 − 7", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
        {
          id: "5.2d", number: "Level 7", prompt: "17 − 9", displayText: "17 − 9", targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: ["Immediate", "Derived", "Counted down", "Unknown"] },
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // Full SN20 model — Wright & Ellemor-Collins, 2018
  // Note: For Levels 4–7, student must use facile strategies (not counting by ones)
  sn20Levels: [
    { level: 0, name: "Emergent spatial patterns and finger patterns",        description: "Cannot identify spatial patterns or show finger patterns without counting" },
    { level: 1, name: "Finger patterns 1–5 and spatial patterns 1–6",        description: "Shows finger patterns 1–5 and recognizes spatial patterns 1–6 without counting" },
    { level: 2, name: "Small doubles and small partitions of 10",             description: "Facile with small doubles (2&2 to 5&5) and small partitions of 10" },
    { level: 3, name: "Five-plus and partitions of 5",                        description: "Facile with five-plus facts and partitions of 5" },
    { level: 4, name: "Facile structuring numbers 1 to 10",                   description: "Uses facile (non-counting) strategies to structure all numbers 1–10" },
    { level: 5, name: "Formal addition (parts ≤ 10)",                         description: "Solves formal addition tasks with parts not exceeding 10, without counting" },
    { level: 6, name: "Formal addition & subtraction (parts ≤ 10)",           description: "Solves formal addition and subtraction with parts not exceeding 10, without counting" },
    { level: 7, name: "Formal addition & subtraction (whole ≤ 20)",           description: "Solves formal addition and subtraction with whole not exceeding 20, without counting" },
  ],
};
