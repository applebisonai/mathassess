// Schedule 3C: Conceptual Place Value
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Task Cards, 15 × 10-stick bundles, 13 × 100-dot squares, Cover
// Model: Conceptual Place Value (CPV) levels 0–4

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
  allowEarlyExit?: boolean;
  earlyExitNote?: string;
}

const STRATEGY_FIELD: ResponseField = {
  label: "Strategy",
  type: "fluency_scale",
  options: ["Immediate", "Without counting", "Counted by ones"],
};

export const schedule3C = {
  id: "schedule-3c",
  name: "Schedule 3C: Conceptual Place Value",
  shortName: "3C",
  gradeRange: "1–3",
  materials: ["Task Cards", "15 × 10-stick bundles", "13 × 100-dot squares", "Cover"],
  models: ["CPV"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Incrementing by 10s ON the Decuple     Level ①
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Incrementing by 10s ON the Decuple",
      shortName: "Inc. by 10s (ON)",
      model: "CPV",
      color: "teal",
      instructions: 'Establish there are 10 sticks in each bundle. Place one bundle under cover. "How many sticks are under there?" (10). Continue placing bundles. "Now how many sticks are under there?" At 70, also ask "How many sticks? How many bundles?"',
      teacherScript: '"Now how many sticks are under there?" (continue adding bundles one at a time)',
      materials: "15 × 10-stick bundles, Cover",
      items: [
        { id: "1a", number: "Incrementing by 10s (ON decuple)", prompt: "After 2 bundles — how many sticks?", displayText: "20", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1b", number: "Incrementing by 10s (ON decuple)", prompt: "After 3 bundles — how many sticks?", displayText: "30", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1c", number: "Incrementing by 10s (ON decuple)", prompt: "After 4 bundles — how many sticks?", displayText: "40", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1d", number: "Incrementing by 10s (ON decuple)", prompt: "After 5 bundles — how many sticks?", displayText: "50", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1e", number: "Incrementing by 10s (ON decuple)", prompt: "After 6 bundles — how many sticks?", displayText: "60", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1f", number: "Incrementing by 10s (ON decuple)", prompt: "After 7 bundles — how many sticks?", displayText: "70", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }], notes: "Also ask: How many bundles?" },
        { id: "1g", number: "Incrementing by 10s (ON decuple)", prompt: "After 8 bundles — how many sticks?", displayText: "80", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1h", number: "Incrementing by 10s (ON decuple)", prompt: "After 9 bundles — how many sticks?", displayText: "90", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1i", number: "Incrementing by 10s (ON decuple)", prompt: "After 10 bundles — how many sticks?", displayText: "100", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1j", number: "Incrementing by 10s (ON decuple)", prompt: "After 11 bundles — how many sticks?", displayText: "110", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "1k", number: "Incrementing by 10s (ON decuple)", prompt: "After 12 bundles — how many sticks?", displayText: "120", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Incrementing by 10s OFF the Decuple    Level ①
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Incrementing by 10s OFF the Decuple",
      shortName: "Inc. by 10s (OFF)",
      model: "CPV",
      color: "teal",
      instructions: 'Place out 4 sticks. "How many sticks?" (4). Place sticks under cover. Place a bundle beside cover. "If I add this bundle under the cover, how many sticks will that be?" (14). After answer, place bundle under cover. Continue adding bundles.',
      teacherScript: '"If I add this bundle under the cover, how many sticks will that be?"',
      materials: "10-stick bundles, Cover",
      branchingNote: "IF STUDENT IS NOT SUCCESSFUL ON TASK 2 → SKIP TASKS 3 and 4",
      items: [
        { id: "2a", number: "Incrementing by 10s (OFF decuple)", prompt: "4 sticks + 1 bundle → how many sticks?", displayText: "14", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2b", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "24", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2c", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "34", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2d", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "44", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2e", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "54", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2f", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "64", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2g", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "74", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "2h", number: "Incrementing by 10s (OFF decuple)", prompt: "Add 1 more bundle → how many sticks?", displayText: "84", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Decrementing by 10s OFF the Decuple    Level ①
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Decrementing by 10s OFF the Decuple",
      shortName: "Dec. by 10s (OFF)",
      model: "CPV",
      color: "teal",
      instructions: 'Place out 147 sticks: one big bundle (10 bundles = 100), 4 more bundles (40), and 7 sticks. Explain the big bundle has 100. "How many sticks altogether?" Tell student 147 if needed. Cover all sticks. Remove a bundle. "Now how many sticks are there?" Continue removing bundles.',
      teacherScript: '"Now how many sticks are there?" (remove one bundle at a time)',
      materials: "10-stick bundles, 100-bundle, Cover",
      items: [
        { id: "3a", number: "Decrementing by 10s (OFF decuple)", prompt: "147 − 1 bundle → how many sticks?", displayText: "137", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "3b", number: "Decrementing by 10s (OFF decuple)", prompt: "Remove 1 more bundle → how many sticks?", displayText: "127", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "3c", number: "Decrementing by 10s (OFF decuple)", prompt: "Remove 1 more bundle → how many sticks?", displayText: "117", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "3d", number: "Decrementing by 10s (OFF decuple)", prompt: "Remove 1 more bundle → how many sticks?", displayText: "107", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "3e", number: "Decrementing by 10s (OFF decuple)", prompt: "Remove 1 more bundle → how many sticks?", displayText: "97", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "3f", number: "Decrementing by 10s (OFF decuple)", prompt: "Remove 1 more bundle → how many sticks?", displayText: "87", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "3g", number: "Decrementing by 10s (OFF decuple)", prompt: "Remove 1 more bundle → how many sticks?", displayText: "77", targetLevel: 1, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 4: Incrementing Flexibly by 10s and 1s   Level ②
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Incrementing Flexibly by 10s and 1s",
      shortName: "Flexible Incrementing",
      model: "CPV",
      color: "teal",
      instructions: 'Place 1 bundle under cover. "How many sticks?" (10). Place the indicated bundles (B) and/or sticks (s) beside the cover. "If I put this under the cover, how many sticks will that be?" After answer, place amount under cover. If successful without counting-by-ones in Sequence 1, continue with Sequence 2.',
      teacherScript: '"If I put this under the cover, how many sticks will that be?"',
      materials: "10-stick bundles, Cover",
      items: [
        // Sequence 1
        { id: "4a", number: "Sequence 1", prompt: "Start: 1B under cover → how many sticks?", displayText: "1B → 10", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4b", number: "Sequence 1", prompt: "Add 4 sticks (4s) → how many?", displayText: "+4s → 14", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4c", number: "Sequence 1", prompt: "Add 2 bundles (2B) → how many?", displayText: "+2B → 34", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4d", number: "Sequence 1", prompt: "Add 4 sticks (4s) → how many?", displayText: "+4s → 38", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4e", number: "Sequence 1", prompt: "Add 2 sticks (2s) → how many?", displayText: "+2s → 40", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4f", number: "Sequence 1", prompt: "Add 1 bundle (1B) → how many?", displayText: "+1B → 50", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4g", number: "Sequence 1", prompt: "Add 2 sticks (2s) → how many?", displayText: "+2s → 52", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4h", number: "Sequence 1", prompt: "Add 2 bundles (2B) → how many?", displayText: "+2B → 72", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        // Sequence 2
        { id: "4i", number: "Sequence 2", prompt: "Start: 5 sticks (5s) under cover → how many?", displayText: "5s → 5", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4j", number: "Sequence 2", prompt: "Add 1 bundle (1B) → how many?", displayText: "+1B → 15", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4k", number: "Sequence 2", prompt: "Add 2 bundles (2B) → how many?", displayText: "+2B → 35", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4l", number: "Sequence 2", prompt: "Add 1 bundle 3 sticks (1B 3s) → how many?", displayText: "+1B 3s → 48", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "4m", number: "Sequence 2", prompt: "Add 2 bundles 1 stick (2B 1s) → how many?", displayText: "+2B 1s → 69", targetLevel: 2, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 5: Jump of 10 More                        Level ③–④
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Jump of 10 More",
      shortName: "Jump +10",
      model: "CPV",
      color: "teal",
      instructions: 'Show number on card. "Which number is ten more than this?" If student jumps without counting-by-ones in the 2-digit range, try the 3-digit range tasks.',
      teacherScript: '"Which number is ten more than this?" (show numeral card)',
      materials: "Numeral Cards",
      items: [
        { id: "5a", number: "2-digit range", prompt: "Ten more than 40?", displayText: "40 + 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "5b", number: "2-digit range", prompt: "Ten more than 90?", displayText: "90 + 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "5c", number: "2-digit range", prompt: "Ten more than 79?", displayText: "79 + 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "5d", number: "2-digit range", prompt: "Ten more than 44?", displayText: "44 + 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "5e", number: "3-digit range", prompt: "Ten more than 356?", displayText: "356 + 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD], notes: "Only if 2-digit range successful without counting-by-ones" },
        { id: "5f", number: "3-digit range", prompt: "Ten more than 306?", displayText: "306 + 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "5g", number: "3-digit range", prompt: "Ten more than 195?", displayText: "195 + 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "5h", number: "Across 1000", prompt: "Ten more than 999?", displayText: "999 + 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD], notes: "Only if 3-digit range successful" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 6: Jump of 10 Less                        Level ③–④
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Jump of 10 Less",
      shortName: "Jump −10",
      model: "CPV",
      color: "teal",
      instructions: 'Show number on card. "Which number is ten less than this?" If student jumps without counting-by-ones in the 2-digit range, try the 3-digit range tasks.',
      teacherScript: '"Which number is ten less than this?" (show numeral card)',
      materials: "Numeral Cards",
      items: [
        { id: "6a", number: "2-digit range", prompt: "Ten less than 40?", displayText: "40 − 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "6b", number: "2-digit range", prompt: "Ten less than 79?", displayText: "79 − 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "6c", number: "2-digit range", prompt: "Ten less than 44?", displayText: "44 − 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "6d", number: "2-digit range", prompt: "Ten less than 101?", displayText: "101 − 10", targetLevel: 3, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "6e", number: "3-digit range", prompt: "Ten less than 356?", displayText: "356 − 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD], notes: "Only if 2-digit range successful without counting-by-ones" },
        { id: "6f", number: "3-digit range", prompt: "Ten less than 306?", displayText: "306 − 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "6g", number: "Across 1000", prompt: "Ten less than 1005?", displayText: "1005 − 10", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD], notes: "Only if 3-digit range successful" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 7: Jump of 100                            Level ④
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg7",
      number: 7,
      name: "Jump of 100",
      shortName: "Jump ±100",
      model: "CPV",
      color: "teal",
      instructions: 'Show number on card. "Which number is one hundred more than this?" or "Which number is one hundred less than this?"',
      teacherScript: '"Which number is one hundred more/less than this?" (show numeral card)',
      materials: "Numeral Cards",
      items: [
        { id: "7a", number: "Jump of 100", prompt: "One hundred more than 50?", displayText: "50 + 100", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "7b", number: "Jump of 100", prompt: "One hundred more than 306?", displayText: "306 + 100", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "7c", number: "Jump of 100", prompt: "One hundred more than 973?", displayText: "973 + 100", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
        { id: "7d", number: "Jump of 100", prompt: "One hundred less than 108?", displayText: "108 − 100", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }, STRATEGY_FIELD] },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // TASK GROUP 8: Incrementing by 100s on the Hundred   Level ④
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "tg8",
      number: 8,
      name: "Incrementing by 100s on the Hundred",
      shortName: "Inc. by 100s",
      model: "CPV",
      color: "teal",
      instructions: 'Establish there are 100 dots on each 100-dot square. Place one square under cover. "How many dots are under there?" (100). Continue placing squares. "Now how many dots are under there?" At 600, also ask "How many dots? How many squares?"',
      teacherScript: '"Now how many dots are under there?" (continue adding 100-dot squares)',
      materials: "13 × 100-dot squares, Cover",
      items: [
        { id: "8a", number: "Incrementing by 100s", prompt: "After 2 squares → how many dots?", displayText: "200", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8b", number: "Incrementing by 100s", prompt: "After 3 squares → how many dots?", displayText: "300", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8c", number: "Incrementing by 100s", prompt: "After 4 squares → how many dots?", displayText: "400", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8d", number: "Incrementing by 100s", prompt: "After 5 squares → how many dots?", displayText: "500", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8e", number: "Incrementing by 100s", prompt: "After 6 squares → how many dots?", displayText: "600", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }], notes: "Also ask: How many squares?" },
        { id: "8f", number: "Incrementing by 100s", prompt: "After 7 squares → how many dots?", displayText: "700", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8g", number: "Incrementing by 100s", prompt: "After 8 squares → how many dots?", displayText: "800", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8h", number: "Incrementing by 100s", prompt: "After 9 squares → how many dots?", displayText: "900", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8i", number: "Incrementing by 100s", prompt: "After 10 squares → how many dots?", displayText: "1000", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8j", number: "Incrementing by 100s", prompt: "After 11 squares → how many dots?", displayText: "1100", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8k", number: "Incrementing by 100s", prompt: "After 12 squares → how many dots?", displayText: "1200", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
        { id: "8l", number: "Incrementing by 100s", prompt: "After 13 squares → how many dots?", displayText: "1300", targetLevel: 4, responseFields: [{ label: "Correct", type: "correct_incorrect" }] },
      ],
    },

  ] as TaskGroup[],

  // Conceptual Place Value Model — Wright & Ellemor-Collins, 2018
  cpvLevels: [
    { level: 0, name: "Emergent incrementing & decrementing by 10",                                         description: "Cannot yet increment or decrement by 10 using materials" },
    { level: 1, name: "Incrementing & decrementing by 10, with materials, in range to 100",                 description: "Uses bundling sticks to increment and decrement by 10, on and off the decuple, in range to 100" },
    { level: 2, name: "Incrementing & decrementing flexibly by 10s and 1s, with materials, in range to 100", description: "Uses materials to increment flexibly by combinations of tens and ones" },
    { level: 3, name: "Incrementing & decrementing by 10, without materials, in range to 100",              description: "Jumps 10 more or 10 less without physical materials in the 2-digit range" },
    { level: 4, name: "Incrementing & decrementing by 10, without materials, in range to 1000",             description: "Jumps 10 more/less and 100 more/less without materials in the 3-digit range" },
  ],
};
