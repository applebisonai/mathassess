// Add+VantageMR: Structuring Numbers Assessment Schedule — Course 1
// Model: Structuring Numbers (SN) — Levels 0–5
// Materials: Dot cards, 5-frames, 10-frames, counters

export type ResponseFieldType =
  | "correct_incorrect"
  | "text_input";

export interface ResponseField {
  label: string;
  type: ResponseFieldType;
  placeholder?: string;
}

export interface AssessmentItem {
  id: string;
  number: string;
  prompt: string;
  displayText?: string;
  responseFields: ResponseField[];
  targetLevel: number;
  notes?: string;
  identifySequence?: number[];
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

export const scheduleAvSN = {
  id: "av-sn",
  name: "Add+VantageMR: Structuring Numbers",
  shortName: "SN",
  gradeRange: "K–3",
  materials: [
    "Dot cards",
    "5-frame cards",
    "10-frame cards",
    "Counters / tiles",
  ],
  models: ["SN"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Spatial Patterns (Subitizing)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Spatial Patterns",
      shortName: "Spatial",
      model: "SN",
      color: "orange",
      instructions: "Flash each dot card briefly (2–3 seconds). Say: \"How many dots did you see?\" Do not allow counting.",
      teacherScript: "\"How many dots did you see?\"",
      materials: "Dot cards",
      branchingNote: "If student is not facile with patterns to 6, go back and administer patterns to 5 first.",
      startAtItem: "sp-7",
      startNote: "START HERE — most students begin at patterns 6–10",
      items: [
        // Sub-group: Patterns to 6
        {
          id: "sp-3", number: "Patterns to 6",
          prompt: "Flash dot card — 3 dots (triangular arrangement)",
          displayText: "• • •",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "sp-4", number: "Patterns to 6",
          prompt: "Flash dot card — 4 dots (square arrangement)",
          displayText: "⠿ 4",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "sp-5", number: "Patterns to 6",
          prompt: "Flash dot card — 5 dots (standard dice arrangement)",
          displayText: "⠿ 5",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "sp-6", number: "Patterns to 6",
          prompt: "Flash dot card — 6 dots (2 rows of 3)",
          displayText: "⠿ 6",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Sub-group: Patterns 6–10
        {
          id: "sp-7", number: "Patterns 6–10",
          prompt: "Flash dot card — 7 dots (structured arrangement)",
          displayText: "⠿ 7",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "sp-8", number: "Patterns 6–10",
          prompt: "Flash dot card — 8 dots (structured arrangement)",
          displayText: "⠿ 8",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "sp-9", number: "Patterns 6–10",
          prompt: "Flash dot card — 9 dots (3 rows of 3)",
          displayText: "⠿ 9",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "sp-10", number: "Patterns 6–10",
          prompt: "Flash dot card — 10 dots (2 rows of 5)",
          displayText: "⠿ 10",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Finger Patterns
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Finger Patterns",
      shortName: "Fingers",
      model: "SN",
      color: "orange",
      instructions: "Part A — Show fingers: Show finger arrangements and ask student to name the number. Part B — Make fingers: Ask student to show the number using fingers.",
      teacherScript: "Part A: \"How many fingers am I showing?\" Part B: \"Show me ___ on your fingers.\"",
      branchingNote: "If student is not facile with finger patterns to 5, go back and assess patterns to 5 first.",
      startAtItem: "fp-b-6",
      startNote: "START HERE — most students begin at finger patterns 6–10",
      items: [
        // Sub-group: Finger patterns to 5
        {
          id: "fp-a-3", number: "Show Fingers to 5",
          prompt: "Show 3 fingers — student names the number",
          displayText: "Show 3",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-a-4", number: "Show Fingers to 5",
          prompt: "Show 4 fingers — student names the number",
          displayText: "Show 4",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-a-5", number: "Show Fingers to 5",
          prompt: "Show 5 fingers — student names the number",
          displayText: "Show 5",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-b-3", number: "Show Fingers to 5",
          prompt: "\"Show me 3 on your fingers.\"",
          displayText: "Make 3",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-b-4", number: "Show Fingers to 5",
          prompt: "\"Show me 4 on your fingers.\"",
          displayText: "Make 4",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Sub-group: Finger patterns 6–10
        {
          id: "fp-b-6", number: "Finger Patterns 6–10",
          prompt: "\"Show me 6 on your fingers.\"",
          displayText: "Make 6",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-b-7", number: "Finger Patterns 6–10",
          prompt: "\"Show me 7 on your fingers.\"",
          displayText: "Make 7",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-b-8", number: "Finger Patterns 6–10",
          prompt: "\"Show me 8 on your fingers.\"",
          displayText: "Make 8",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-b-9", number: "Finger Patterns 6–10",
          prompt: "\"Show me 9 on your fingers.\"",
          displayText: "Make 9",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "fp-b-10", number: "Finger Patterns 6–10",
          prompt: "\"Show me 10 on your fingers.\"",
          displayText: "Make 10",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Partitions of 5
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Partitions of 5",
      shortName: "Part. 5",
      model: "SN",
      color: "orange",
      instructions: "Use a 5-frame card with counters. Hide some counters under a cover. Say: \"There are 5 altogether. I can see ___. How many are hiding?\"",
      teacherScript: "\"There are 5 altogether. I can see ___. How many are hiding?\"",
      materials: "5-frame card, counters, cover",
      items: [
        {
          id: "p5-4", number: "Partitions of 5",
          prompt: "\"There are 5 altogether. I can see 4. How many are hiding?\" (Answer: 1)",
          displayText: "5 − 4",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p5-2", number: "Partitions of 5",
          prompt: "\"There are 5 altogether. I can see 2. How many are hiding?\" (Answer: 3)",
          displayText: "5 − 2",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p5-1", number: "Partitions of 5",
          prompt: "\"There are 5 altogether. I can see 1. How many are hiding?\" (Answer: 4)",
          displayText: "5 − 1",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p5-3", number: "Partitions of 5",
          prompt: "\"There are 5 altogether. I can see 3. How many are hiding?\" (Answer: 2)",
          displayText: "5 − 3",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p5-0", number: "Partitions of 5",
          prompt: "\"There are 5 altogether. I can see 0. How many are hiding?\" (Answer: 5)",
          displayText: "5 − 0",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: Partitions of 10
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Partitions of 10",
      shortName: "Part. 10",
      model: "SN",
      color: "orange",
      instructions: "Use a 10-frame card with counters. Hide some counters. Say: \"There are 10 altogether. I can see ___. How many are hiding?\"",
      teacherScript: "\"There are 10 altogether. I can see ___. How many are hiding?\"",
      materials: "10-frame card, counters, cover",
      items: [
        {
          id: "p10-7", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 7. How many are hiding?\" (Answer: 3)",
          displayText: "10 − 7",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-6", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 6. How many are hiding?\" (Answer: 4)",
          displayText: "10 − 6",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-4", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 4. How many are hiding?\" (Answer: 6)",
          displayText: "10 − 4",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-8", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 8. How many are hiding?\" (Answer: 2)",
          displayText: "10 − 8",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-3", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 3. How many are hiding?\" (Answer: 7)",
          displayText: "10 − 3",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-5", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 5. How many are hiding?\" (Answer: 5)",
          displayText: "10 − 5",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-2", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 2. How many are hiding?\" (Answer: 8)",
          displayText: "10 − 2",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "p10-9", number: "Partitions of 10",
          prompt: "\"There are 10 altogether. I can see 9. How many are hiding?\" (Answer: 1)",
          displayText: "10 − 9",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Doubles and Near Doubles
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Doubles and Near Doubles",
      shortName: "Doubles",
      model: "SN",
      color: "orange",
      instructions: "Say: \"What is double ___?\" and \"What is one more than double ___?\" Do not use fingers or materials.",
      teacherScript: "\"What is double ___?\" / \"What is one more than double ___?\"",
      items: [
        // Sub-group: Doubles to 10
        {
          id: "d-2", number: "Doubles to 10",
          prompt: "\"What is double 2?\" (Answer: 4)",
          displayText: "2 + 2",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "d-3", number: "Doubles to 10",
          prompt: "\"What is double 3?\" (Answer: 6)",
          displayText: "3 + 3",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "d-4", number: "Doubles to 10",
          prompt: "\"What is double 4?\" (Answer: 8)",
          displayText: "4 + 4",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "d-5", number: "Doubles to 10",
          prompt: "\"What is double 5?\" (Answer: 10)",
          displayText: "5 + 5",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Sub-group: Near Doubles
        {
          id: "nd-3", number: "Near Doubles",
          prompt: "\"What is one more than double 3?\" (Answer: 7)",
          displayText: "3+4",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nd-4", number: "Near Doubles",
          prompt: "\"What is one more than double 4?\" (Answer: 9)",
          displayText: "4+5",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nd-5", number: "Near Doubles",
          prompt: "\"What is one more than double 5?\" (Answer: 11)",
          displayText: "5+6",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 6: Structuring to 20
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Structuring to 20",
      shortName: "To 20",
      model: "SN",
      color: "orange",
      instructions: "Ask each question orally. No materials. Say: \"How much is 10 and ___?\" Then: \"What goes with ___ to make 20?\"",
      teacherScript: "\"How much is 10 and ___?\" / \"What goes with ___ to make 20?\"",
      items: [
        // Sub-group: 10 + _
        {
          id: "s20-10-3", number: "10 + _ (teens)",
          prompt: "\"How much is 10 and 3?\" (Answer: 13)",
          displayText: "10 + 3",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "s20-10-7", number: "10 + _ (teens)",
          prompt: "\"How much is 10 and 7?\" (Answer: 17)",
          displayText: "10 + 7",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "s20-10-5", number: "10 + _ (teens)",
          prompt: "\"How much is 10 and 5?\" (Answer: 15)",
          displayText: "10 + 5",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "s20-10-9", number: "10 + _ (teens)",
          prompt: "\"How much is 10 and 9?\" (Answer: 19)",
          displayText: "10 + 9",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Sub-group: Partitions of 20
        {
          id: "s20-14", number: "Partitions of 20",
          prompt: "\"What goes with 14 to make 20?\" (Answer: 6)",
          displayText: "20 − 14",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "s20-12", number: "Partitions of 20",
          prompt: "\"What goes with 12 to make 20?\" (Answer: 8)",
          displayText: "20 − 12",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "s20-17", number: "Partitions of 20",
          prompt: "\"What goes with 17 to make 20?\" (Answer: 3)",
          displayText: "20 − 17",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "s20-15", number: "Partitions of 20",
          prompt: "\"What goes with 15 to make 20?\" (Answer: 5)",
          displayText: "20 − 15",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

  ] as TaskGroup[],

  // ── SN Model Levels ──────────────────────────────────────────────────────
  snLevels: [
    {
      level: 0, name: "Emergent",
      description: "Cannot perceptually subitize small collections or use finger patterns.",
    },
    {
      level: 1, name: "Perceptual Patterns",
      description: "Facile with spatial patterns to 6 and finger patterns to 5.",
    },
    {
      level: 2, name: "Figurative Patterns",
      description: "Facile with spatial patterns to 10; finger patterns to 10.",
    },
    {
      level: 3, name: "Initial Structuring",
      description: "Facile with partitions of 5 and 10 using 5 as an organizer.",
    },
    {
      level: 4, name: "Intermediate Structuring",
      description: "Facile with doubles and near doubles to 20; partitions of 10 without materials.",
    },
    {
      level: 5, name: "Facile Structuring",
      description: "Facile with structures to 20; uses 10 as organizer for teen numbers.",
    },
  ],
};
