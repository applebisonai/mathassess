// Schedule 2B: Early Structuring
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Dice Pattern Cards
// Model: Structuring Numbers 1 to 20 (SN20)

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
  diceValue?: number;        // For Task 2: show dice dot pattern
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
  flashCard?: boolean;
  allowEarlyExit?: boolean;
  earlyExitNote?: string;
}

export const schedule2B = {
  id: "schedule-2b",
  name: "Schedule 2B: Early Structuring",
  shortName: "2B",
  gradeRange: "K–2",
  materials: ["Dice Pattern Cards"],
  models: ["SN20"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Making Finger Patterns
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Making Finger Patterns",
      shortName: "Finger Patterns",
      model: "SN20",
      color: "amber",
      instructions: 'Show me a number on your fingers, as quickly as you can. Show me ___.',
      teacherScript: '"Show me a number on your fingers, as quickly as you can." If student counts, ask: "Can you do it without counting?"',
      materials: "Hands only",
      items: [
        // 1.1 — Finger patterns 1–5
        { id: "1.1a", number: "1.1", prompt: "Show me 3", displayText: "3",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1b", number: "1.1", prompt: "Show me 5", displayText: "5",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1c", number: "1.1", prompt: "Show me 2", displayText: "2",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1d", number: "1.1", prompt: "Show me 4", displayText: "4",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 1.2 — Finger patterns 6–10
        { id: "1.2a", number: "1.2", prompt: "Show me 10", displayText: "10", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2b", number: "1.2", prompt: "Show me 8",  displayText: "8",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2c", number: "1.2", prompt: "Show me 7",  displayText: "7",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2d", number: "1.2", prompt: "Show me 9",  displayText: "9",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2e", number: "1.2", prompt: "Show me 6",  displayText: "6",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2f", number: "1.2", prompt: "Show me 6 — another way", displayText: "6 another way", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Regular Configurations (Dice Pattern Cards)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Regular Configurations",
      shortName: "Dice Patterns",
      model: "SN20",
      color: "amber",
      flashCard: true,
      instructions: 'Flash each dice pattern card for ½ second. Say: "I am going to quickly show you a card with some dots on it. Ready? How many?"',
      teacherScript: '"I am going to quickly show you a card with some dots on it. Ready? How many?"',
      materials: "Dice Pattern Cards",
      items: [
        { id: "2.1a", number: "2.1", prompt: "Flash card: 3", displayText: "3", diceValue: 3, targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1b", number: "2.1", prompt: "Flash card: 5", displayText: "5", diceValue: 5, targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1c", number: "2.1", prompt: "Flash card: 2", displayText: "2", diceValue: 2, targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1d", number: "2.1", prompt: "Flash card: 4", displayText: "4", diceValue: 4, targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1e", number: "2.1", prompt: "Flash card: 6", displayText: "6", diceValue: 6, targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Small Doubles
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Small Doubles",
      shortName: "Small Doubles",
      model: "SN20",
      color: "amber",
      instructions: 'Pose each doubles fact orally. If student counts, ask: "Can you do it without counting?"',
      teacherScript: '"What is ___ and ___?" (e.g., "What is 2 and 2?")',
      allowEarlyExit: true,
      earlyExitNote: "If student is not facile to this point → END ASSESSMENT HERE",
      items: [
        { id: "3.1a", number: "3.1", prompt: "2 and 2", displayText: "2 & 2", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1b", number: "3.1", prompt: "5 and 5", displayText: "5 & 5", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1c", number: "3.1", prompt: "3 and 3", displayText: "3 & 3", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1d", number: "3.1", prompt: "4 and 4", displayText: "4 & 4", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: Small Partitions of 10
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Small Partitions of 10",
      shortName: "Partitions of 10",
      model: "SN20",
      color: "amber",
      instructions: "I'll say a number, and you say how many more to make 10.",
      teacherScript: '"I\'ll say a number, and you say how many more to make 10. For example, I say \'5\'; you say ___ (Can prompt \'5\')." If student counts, ask: "Can you do it without counting?"',
      items: [
        { id: "4.1a", number: "4.1", prompt: "9 — how many more to make 10?", displayText: "9",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1b", number: "4.1", prompt: "7 — how many more to make 10?", displayText: "7",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1c", number: "4.1", prompt: "8 — how many more to make 10?", displayText: "8",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1d", number: "4.1", prompt: "6 — how many more to make 10?", displayText: "6",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Partitions of 5
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Partitions of 5",
      shortName: "Partitions of 5",
      model: "SN20",
      color: "amber",
      instructions: "I'll say a number, and you say how many more to make 5.",
      teacherScript: '"I\'ll say a number, and you say how many more to make 5. For example, I say \'4\'; you say ___ (Can prompt \'1\')."',
      items: [
        { id: "5.1a", number: "5.1", prompt: "2 — how many more to make 5?", displayText: "2", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "5.1b", number: "5.1", prompt: "1 — how many more to make 5?", displayText: "1", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "5.1c", number: "5.1", prompt: "3 — how many more to make 5?", displayText: "3", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 6: Five-Plus Facts
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Five-Plus Facts",
      shortName: "Five-Plus",
      model: "SN20",
      color: "amber",
      instructions: 'Pose each five-plus fact orally. Student should respond without counting.',
      teacherScript: '"What is 5 plus ___?"',
      items: [
        { id: "6.1a", number: "6.1", prompt: "5 plus 2", displayText: "5 + 2", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1b", number: "6.1", prompt: "5 plus 4", displayText: "5 + 4", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1c", number: "6.1", prompt: "5 plus 1", displayText: "5 + 1", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "6.1d", number: "6.1", prompt: "5 plus 3", displayText: "5 + 3", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
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
