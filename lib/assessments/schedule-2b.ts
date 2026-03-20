// Schedule 2B: Structuring Numbers
// LFIN Assessment - Interview Mode
// Materials: Dot cards, ten-frames, counters

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
  materials?: string;
  items: AssessmentItem[];
  branchingNote?: string;
  startAtItem?: string;
  startNote?: string;
  flashCard?: boolean;   // Items should be shown briefly (1–2 sec) then hidden
}

export const schedule2B = {
  id: "schedule-2b",
  name: "Schedule 2B: Structuring Numbers",
  shortName: "2B",
  gradeRange: "K–2",
  materials: ["Dot cards (1–10)", "Ten-frame cards", "Counters", "Paper", "Pen"],
  models: ["SPAT", "FING", "C&P"],
  taskGroups: [
    // ─────────────────────────────────────────────
    // TASK GROUP 1: Spatial Patterns (dot cards)
    // ─────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Spatial Patterns",
      shortName: "SPAT",
      model: "SPAT",
      color: "blue",
      flashCard: true,
      instructions: 'Flash each dot card briefly (1–2 seconds). Say: "How many dots did you see?"',
      materials: "Dot cards 1–10",
      items: [
        // 1.1 — Patterns 1–3
        { id: "1.1a", number: "1.1", prompt: "Flash card: 1 dot",  displayText: "●",         targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1b", number: "1.1", prompt: "Flash card: 2 dots", displayText: "● ●",       targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.1c", number: "1.1", prompt: "Flash card: 3 dots", displayText: "● ● ●",     targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 1.2 — Patterns 4–5
        { id: "1.2a", number: "1.2", prompt: "Flash card: 4 dots (square pattern)",  displayText: "⠿ 4", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.2b", number: "1.2", prompt: "Flash card: 5 dots (dice pattern)",    displayText: "⠿ 5", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 1.3 — Patterns 6–10 (conceptual subitizing)
        { id: "1.3a", number: "1.3", prompt: "Flash card: 6 dots (two rows of 3)",   displayText: "⠿ 6", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.3b", number: "1.3", prompt: "Flash card: 7 dots",                   displayText: "⠿ 7", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.3c", number: "1.3", prompt: "Flash card: 8 dots (two rows of 4)",   displayText: "⠿ 8", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.3d", number: "1.3", prompt: "Flash card: 9 dots (three rows of 3)", displayText: "⠿ 9", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.3e", number: "1.3", prompt: "Flash card: 10 dots (two rows of 5)",  displayText: "⠿ 10", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 1.4 — Ten-frame patterns
        { id: "1.4a", number: "1.4", prompt: "Flash ten-frame: 6 (full top row + 1)", displayText: "Ten-frame: 6", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.4b", number: "1.4", prompt: "Flash ten-frame: 8 (full top row + 3)", displayText: "Ten-frame: 8", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "1.4c", number: "1.4", prompt: "Flash ten-frame: 9 (full top row + 4)", displayText: "Ten-frame: 9", targetLevel: 4, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────
    // TASK GROUP 2: Finger Patterns
    // ─────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Finger Patterns",
      shortName: "FING",
      model: "FING",
      color: "green",
      instructions: 'Say: "Show me ___ on your fingers without counting." Then: "How many am I showing?" (display your fingers briefly).',
      materials: "Hands only",
      startAtItem: "2.2",
      startNote: "If not fluent go back and administer 2.1",
      items: [
        // 2.1 — Show fingers 1–5
        { id: "2.1a", number: "2.1", prompt: 'Say: "Show me 3 fingers."',  displayText: "3",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1b", number: "2.1", prompt: 'Say: "Show me 5 fingers."',  displayText: "5",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1c", number: "2.1", prompt: 'Say: "Show me 4 fingers."',  displayText: "4",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1d", number: "2.1", prompt: 'Say: "Show me 1 finger."',   displayText: "1",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.1e", number: "2.1", prompt: 'Say: "Show me 2 fingers."',  displayText: "2",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 2.2 — Show fingers 6–10
        { id: "2.2a", number: "2.2", prompt: 'Say: "Show me 7 fingers."',  displayText: "7",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.2b", number: "2.2", prompt: 'Say: "Show me 6 fingers."',  displayText: "6",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.2c", number: "2.2", prompt: 'Say: "Show me 9 fingers."',  displayText: "9",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.2d", number: "2.2", prompt: 'Say: "Show me 8 fingers."',  displayText: "8",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.2e", number: "2.2", prompt: 'Say: "Show me 10 fingers."', displayText: "10", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 2.3 — Recognize teacher's finger patterns
        { id: "2.3a", number: "2.3", prompt: "Show 4 fingers briefly. How many?", displayText: "👋 4",  targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.3b", number: "2.3", prompt: "Show 7 fingers briefly. How many?", displayText: "👋 7",  targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.3c", number: "2.3", prompt: "Show 9 fingers briefly. How many?", displayText: "👋 9",  targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "2.3d", number: "2.3", prompt: "Show 6 fingers briefly. How many?", displayText: "👋 6",  targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────
    // TASK GROUP 3: Temporal Patterns
    // ─────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Temporal Patterns",
      shortName: "TEMP",
      model: "TEMP",
      color: "purple",
      instructions: 'Hide your hand behind a screen or below the table. Tap or clap a sequence. Say: "How many times did I tap?"',
      materials: "No materials needed",
      startAtItem: "3.2",
      startNote: "If not fluent go back and administer 3.1",
      items: [
        // 3.1 — Sequences 1–5
        { id: "3.1a", number: "3.1", prompt: "Tap 2 times (hidden)", displayText: "2 taps",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1b", number: "3.1", prompt: "Tap 4 times (hidden)", displayText: "4 taps",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1c", number: "3.1", prompt: "Tap 3 times (hidden)", displayText: "3 taps",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.1d", number: "3.1", prompt: "Tap 5 times (hidden)", displayText: "5 taps",  targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 3.2 — Sequences 6–10
        { id: "3.2a", number: "3.2", prompt: "Tap 6 times (hidden)", displayText: "6 taps",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2b", number: "3.2", prompt: "Tap 8 times (hidden)", displayText: "8 taps",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2c", number: "3.2", prompt: "Tap 7 times (hidden)", displayText: "7 taps",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.2d", number: "3.2", prompt: "Tap 9 times (hidden)", displayText: "9 taps",  targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 3.3 — Two-part sequences (sum ≤ 10)
        { id: "3.3a", number: "3.3", prompt: "Tap 3, pause, tap 4. How many total?", displayText: "3 + 4", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3b", number: "3.3", prompt: "Tap 5, pause, tap 2. How many total?", displayText: "5 + 2", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "3.3c", number: "3.3", prompt: "Tap 4, pause, tap 4. How many total?", displayText: "4 + 4", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },

    // ─────────────────────────────────────────────
    // TASK GROUP 4: Combining and Partitioning
    // ─────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Combining and Partitioning",
      shortName: "C&P",
      model: "C&P",
      color: "orange",
      instructions: 'Place counters on the table. Screen some with your hand or a card. Say: "I have ___ counters. I\'m hiding some. I can see ___. How many am I hiding?"',
      materials: "Counters, small screen card",
      startAtItem: "4.2",
      startNote: "If not fluent go back and administer 4.1",
      items: [
        // 4.1 — Combining within 5
        { id: "4.1a", number: "4.1", prompt: "Show 2, hide 1. Total = 3. How many hidden?",   displayText: "3 — ● ●  +  ?", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1b", number: "4.1", prompt: "Show 3, hide 2. Total = 5. How many hidden?",   displayText: "5 — ● ● ●  +  ?", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.1c", number: "4.1", prompt: "Show 1, hide 3. Total = 4. How many hidden?",   displayText: "4 — ●  +  ?", targetLevel: 1, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 4.2 — Combining within 10
        { id: "4.2a", number: "4.2", prompt: "Show 4, hide 3. Total = 7. How many hidden?",   displayText: "7 — ● ● ● ●  +  ?", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.2b", number: "4.2", prompt: "Show 6, hide 2. Total = 8. How many hidden?",   displayText: "8 — ● ● ● ● ● ●  +  ?", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.2c", number: "4.2", prompt: "Show 5, hide 4. Total = 9. How many hidden?",   displayText: "9 — ● ● ● ● ●  +  ?", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.2d", number: "4.2", prompt: "Show 3, hide 7. Total = 10. How many hidden?",  displayText: "10 — ● ● ●  +  ?", targetLevel: 2, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        // 4.3 — Combining within 20
        { id: "4.3a", number: "4.3", prompt: "Show 8, hide 5. Total = 13. How many hidden?",  displayText: "13 — ● ● ● ● ● ● ● ●  +  ?", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.3b", number: "4.3", prompt: "Show 9, hide 6. Total = 15. How many hidden?",  displayText: "15 — ● ● ● ● ● ● ● ● ●  +  ?", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
        { id: "4.3c", number: "4.3", prompt: "Show 7, hide 9. Total = 16. How many hidden?",  displayText: "16 — ● ● ● ● ● ● ●  +  ?", targetLevel: 3, responseFields: [{ label: "Response", type: "correct_incorrect" }] },
      ],
    },
  ] as TaskGroup[],

  spatLevels: [
    { level: 0, name: "Emergent SPAT",          description: "Cannot identify dot patterns without counting" },
    { level: 1, name: "Perceptual — 1 to 3",    description: "Immediately recognizes patterns 1–3" },
    { level: 2, name: "Perceptual — 1 to 5",    description: "Immediately recognizes patterns 1–5 (dice/domino)" },
    { level: 3, name: "Conceptual — 6 to 10",   description: "Recognizes patterns 6–10 using part-whole thinking" },
    { level: 4, name: "Ten-frame patterns",      description: "Uses ten-frame structure to identify quantities" },
  ],

  fingLevels: [
    { level: 0, name: "Emergent FING",           description: "Cannot show finger patterns without counting" },
    { level: 1, name: "Finger patterns 1–5",     description: "Shows 1–5 finger patterns without counting" },
    { level: 2, name: "Finger patterns 6–10",    description: "Shows 6–10 finger patterns without counting" },
    { level: 3, name: "Recognizes finger patterns", description: "Immediately recognizes teacher's finger patterns" },
  ],

  tempLevels: [
    { level: 0, name: "Emergent TEMP",           description: "Cannot track temporal sequences" },
    { level: 1, name: "Temporal patterns 1–5",   description: "Correctly counts hidden taps/claps 1–5" },
    { level: 2, name: "Temporal patterns 6–10",  description: "Correctly counts hidden taps/claps 6–10" },
    { level: 3, name: "Two-part sequences",       description: "Combines two temporal sequences without re-counting" },
  ],

  cpLevels: [
    { level: 0, name: "Emergent C&P",            description: "Cannot combine or partition quantities" },
    { level: 1, name: "Combining within 5",       description: "Solves screened combining tasks within 5" },
    { level: 2, name: "Combining within 10",      description: "Solves screened combining tasks within 10" },
    { level: 3, name: "Combining within 20",      description: "Solves screened combining tasks within 20" },
  ],
};
