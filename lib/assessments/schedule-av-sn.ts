// Add+VantageMR: Structuring Numbers Assessment Schedule
// Based on PDF pages 116–118
// Model: Structuring Numbers (SN) — Levels 0–5

export type ResponseFieldType =
  | "correct_incorrect"
  | "text_input"
  | "strategy";

export interface ResponseField {
  label: string;
  type: ResponseFieldType;
  placeholder?: string;
  options?: string[]; // for strategy type
}

export interface AssessmentItem {
  id: string;
  number: string; // sub-group key (used by groupBySubLevel)
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

// ── Shared response field templates ──────────────────────────────────────────
const RESP: ResponseField = { label: "Response", type: "correct_incorrect" };
const KPC: ResponseField  = { label: "Strategy", type: "strategy", options: ["K", "P", "C"] };
const KCF: ResponseField  = { label: "Strategy", type: "strategy", options: ["K", "CF1", "CF_"] };
const KCF_A: ResponseField = { label: "Strategy", type: "strategy", options: ["K", "CF1", "CF_", "A5", "A10"] };

export const scheduleAvSN = {
  id: "av-sn",
  name: "Add+VantageMR: Structuring Numbers",
  shortName: "SN",
  gradeRange: "K–3",
  materials: [
    "Spatial pattern cards",
    "Arithmetic rack / bead string",
  ],
  models: ["SN"],

  taskGroups: [

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 1: Spatial Patterns
    // Strategy codes: K = Knows Immediately, P = Partitions, C = Counts
    // START HERE is at the very first sub-group (Regular Patterns)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Spatial Patterns",
      shortName: "Spatial",
      model: "SN",
      color: "orange",
      instructions: "Briefly show each dot pattern card. Ask: \"How many dots?\" Record response and strategy.",
      teacherScript: "\"How many dots?\"",
      materials: "Spatial pattern cards",
      startAtItem: "sn1-reg-4",
      startNote: "START HERE",
      items: [
        // ── Regular Patterns: 4, 3, 6, 5 ────────────────────────────────────
        {
          id: "sn1-reg-4", number: "Regular Patterns",
          prompt: "Flash regular dot card: 4",
          displayText: "4",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        {
          id: "sn1-reg-3", number: "Regular Patterns",
          prompt: "Flash regular dot card: 3",
          displayText: "3",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        {
          id: "sn1-reg-6", number: "Regular Patterns",
          prompt: "Flash regular dot card: 6",
          displayText: "6",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        {
          id: "sn1-reg-5", number: "Regular Patterns",
          prompt: "Flash regular dot card: 5",
          displayText: "5",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        // ── Irregular Patterns: 4, 6, 3, 5 ──────────────────────────────────
        {
          id: "sn1-irr-4", number: "Irregular Patterns",
          prompt: "Flash irregular dot card: 4",
          displayText: "4",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        {
          id: "sn1-irr-6", number: "Irregular Patterns",
          prompt: "Flash irregular dot card: 6",
          displayText: "6",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        {
          id: "sn1-irr-3", number: "Irregular Patterns",
          prompt: "Flash irregular dot card: 3",
          displayText: "3",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
        {
          id: "sn1-irr-5", number: "Irregular Patterns",
          prompt: "Flash irregular dot card: 5",
          displayText: "5",
          targetLevel: 1,
          responseFields: [RESP, KPC],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 2: Finger Patterns
    // Strategy codes: K = Knows Immediately, CF1 = Counts From 1, CF_ = Counts From other
    // START HERE at Displaying Finger Patterns (first sub-group)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Finger Patterns",
      shortName: "Fingers",
      model: "SN",
      color: "orange",
      instructions: "Part A — Display finger patterns and student identifies the number. Part B — Student displays the number in more than one way. Record: K=Knows Immediately, CF1=Counts From 1, CF_=Counts From other.",
      teacherScript: "\"How many fingers am I showing?\" / \"Show me ___ on your fingers a different way.\"",
      startAtItem: "sn2-disp-4",
      startNote: "START HERE",
      items: [
        // ── Displaying Finger Patterns: 4, 3, 9, 6, 8 ───────────────────────
        {
          id: "sn2-disp-4", number: "Displaying Finger Patterns",
          prompt: "Display 4 fingers. Student identifies number.",
          displayText: "4",
          targetLevel: 1,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-disp-3", number: "Displaying Finger Patterns",
          prompt: "Display 3 fingers. Student identifies number.",
          displayText: "3",
          targetLevel: 1,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-disp-9", number: "Displaying Finger Patterns",
          prompt: "Display 9 fingers. Student identifies number.",
          displayText: "9",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-disp-6", number: "Displaying Finger Patterns",
          prompt: "Display 6 fingers. Student identifies number.",
          displayText: "6",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-disp-8", number: "Displaying Finger Patterns",
          prompt: "Display 8 fingers. Student identifies number.",
          displayText: "8",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        // ── Displaying in More Than One Way: 5, 5, 7, 7 ─────────────────────
        {
          id: "sn2-mtow-5a", number: "Displaying in More Than One Way",
          prompt: "\"Show me 5 on your fingers.\" (first way)",
          displayText: "5",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-mtow-5b", number: "Displaying in More Than One Way",
          prompt: "\"Show me 5 a different way.\" (second way)",
          displayText: "5",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-mtow-7a", number: "Displaying in More Than One Way",
          prompt: "\"Show me 7 on your fingers.\" (first way)",
          displayText: "7",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn2-mtow-7b", number: "Displaying in More Than One Way",
          prompt: "\"Show me 7 a different way.\" (second way)",
          displayText: "7",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 3: Combinations and Partitions — WITH Materials
    // Uses arithmetic rack / bead string
    // START HERE at Partitions of 10 (skip Partitions of 5)
    // Combinations to 20: record Top row, Bottom row, Altogether, Strategy
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Combinations and Partitions — WITH Materials",
      shortName: "WITH Materials",
      model: "SN",
      color: "orange",
      instructions: "Use arithmetic rack or bead string. For partitions, show beads and ask student to complete. For combinations to 20, record what student says for top row, bottom row, altogether, and strategy used.",
      teacherScript: "\"I have ___ beads. How many more to make ___?\"",
      materials: "Arithmetic rack / bead string",
      startAtItem: "sn3-p10-8",
      startNote: "START HERE — Introduce the Setting",
      items: [
        // ── Partitions of 5: 4+?, 2+?, 1+?, 3+? ────────────────────────────
        {
          id: "sn3-p5-4", number: "Partitions of 5",
          prompt: "Show 4 beads. \"How many more to make 5?\" (Answer: 1)",
          displayText: "4 + ?",
          targetLevel: 2,
          responseFields: [
            RESP,
            { label: "Student said", type: "text_input", placeholder: "#" },
            { label: "Strategy", type: "strategy", options: ["K", "CF1", "CF_", "F"] },
          ],
        },
        {
          id: "sn3-p5-2", number: "Partitions of 5",
          prompt: "Show 2 beads. \"How many more to make 5?\" (Answer: 3)",
          displayText: "2 + ?",
          targetLevel: 2,
          responseFields: [
            RESP,
            { label: "Student said", type: "text_input", placeholder: "#" },
            { label: "Strategy", type: "strategy", options: ["K", "CF1", "CF_", "F"] },
          ],
        },
        {
          id: "sn3-p5-1", number: "Partitions of 5",
          prompt: "Show 1 bead. \"How many more to make 5?\" (Answer: 4)",
          displayText: "1 + ?",
          targetLevel: 2,
          responseFields: [
            RESP,
            { label: "Student said", type: "text_input", placeholder: "#" },
            { label: "Strategy", type: "strategy", options: ["K", "CF1", "CF_", "F"] },
          ],
        },
        {
          id: "sn3-p5-3", number: "Partitions of 5",
          prompt: "Show 3 beads. \"How many more to make 5?\" (Answer: 2)",
          displayText: "3 + ?",
          targetLevel: 2,
          responseFields: [
            RESP,
            { label: "Student said", type: "text_input", placeholder: "#" },
            { label: "Strategy", type: "strategy", options: ["K", "CF1", "CF_", "F"] },
          ],
        },
        // ── Partitions of 10: 8+?, 6+?, 3+?, 4+? ── START HERE ──────────────
        {
          id: "sn3-p10-8", number: "Partitions of 10",
          prompt: "Show 8 beads. \"How many more to make 10?\" (Answer: 2)",
          displayText: "8 + ?",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn3-p10-6", number: "Partitions of 10",
          prompt: "Show 6 beads. \"How many more to make 10?\" (Answer: 4)",
          displayText: "6 + ?",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn3-p10-3", number: "Partitions of 10",
          prompt: "Show 3 beads. \"How many more to make 10?\" (Answer: 7)",
          displayText: "3 + ?",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        {
          id: "sn3-p10-4", number: "Partitions of 10",
          prompt: "Show 4 beads. \"How many more to make 10?\" (Answer: 6)",
          displayText: "4 + ?",
          targetLevel: 2,
          responseFields: [RESP, KCF],
        },
        // ── Combinations to 20: 8+8, 7+6, 10+4, 5+2 ────────────────────────
        // Record Top row, Bottom row, Altogether (CI), Strategy
        {
          id: "sn3-c20-8p8", number: "Combinations to 20",
          prompt: "Set up 8 + 8 on rack. Record top, bottom, altogether, strategy.",
          displayText: "8 + 8",
          targetLevel: 4,
          responseFields: [
            { label: "Top",       type: "text_input",        placeholder: "top" },
            { label: "Bottom",    type: "text_input",        placeholder: "bottom" },
            { label: "Altogether",type: "correct_incorrect"                        },
            { label: "Strategy",  type: "strategy",          options: ["K", "CF1", "CF_"] },
          ],
        },
        {
          id: "sn3-c20-7p6", number: "Combinations to 20",
          prompt: "Set up 7 + 6 on rack. Record top, bottom, altogether, strategy.",
          displayText: "7 + 6",
          targetLevel: 4,
          responseFields: [
            { label: "Top",       type: "text_input",        placeholder: "top" },
            { label: "Bottom",    type: "text_input",        placeholder: "bottom" },
            { label: "Altogether",type: "correct_incorrect"                        },
            { label: "Strategy",  type: "strategy",          options: ["K", "CF1", "CF_"] },
          ],
        },
        {
          id: "sn3-c20-10p4", number: "Combinations to 20",
          prompt: "Set up 10 + 4 on rack. Record top, bottom, altogether, strategy.",
          displayText: "10 + 4",
          targetLevel: 4,
          responseFields: [
            { label: "Top",       type: "text_input",        placeholder: "top" },
            { label: "Bottom",    type: "text_input",        placeholder: "bottom" },
            { label: "Altogether",type: "correct_incorrect"                        },
            { label: "Strategy",  type: "strategy",          options: ["K", "CF1", "CF_"] },
          ],
        },
        {
          id: "sn3-c20-5p2", number: "Combinations to 20",
          prompt: "Set up 5 + 2 on rack. Record top, bottom, altogether, strategy.",
          displayText: "5 + 2",
          targetLevel: 4,
          responseFields: [
            { label: "Top",       type: "text_input",        placeholder: "top" },
            { label: "Bottom",    type: "text_input",        placeholder: "bottom" },
            { label: "Altogether",type: "correct_incorrect"                        },
            { label: "Strategy",  type: "strategy",          options: ["K", "CF1", "CF_"] },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 4: Combining and Partitioning — NO Materials
    // START HERE at To 10 (skip To 5)
    // "tell me two numbers" items use two text inputs
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Combining and Partitioning — NO Materials",
      shortName: "NO Materials",
      model: "SN",
      color: "orange",
      instructions: "No materials. Ask student to combine and partition mentally. For open-ended items, record any two numbers the student gives.",
      teacherScript: "\"What goes with ___ to make ___?\" / \"Tell me two numbers to make ___.\"",
      startAtItem: "sn4-c10-7",
      startNote: "START HERE — most students begin at To 10",
      items: [
        // ── To 5 ─────────────────────────────────────────────────────────────
        {
          id: "sn4-c5-3", number: "To 5",
          prompt: "\"What goes with 3 to make 5?\" (Answer: 2)",
          displayText: "3 / 5",
          targetLevel: 3,
          responseFields: [RESP],
        },
        {
          id: "sn4-c5-1", number: "To 5",
          prompt: "\"What goes with 1 to make 5?\" (Answer: 4)",
          displayText: "1 / 5",
          targetLevel: 3,
          responseFields: [RESP],
        },
        {
          id: "sn4-p5-make4", number: "To 5",
          prompt: "\"Tell me two numbers to make 4.\"",
          displayText: "make 4",
          targetLevel: 3,
          responseFields: [
            { label: "Number 1", type: "text_input", placeholder: "#" },
            { label: "Number 2", type: "text_input", placeholder: "#" },
          ],
        },
        // ── To 10 ── START HERE ───────────────────────────────────────────────
        {
          id: "sn4-c10-7", number: "To 10",
          prompt: "\"What goes with 7 to make 10?\" (Answer: 3)",
          displayText: "7 / 10",
          targetLevel: 3,
          responseFields: [RESP],
        },
        {
          id: "sn4-c10-4", number: "To 10",
          prompt: "\"What goes with 4 to make 10?\" (Answer: 6)",
          displayText: "4 / 10",
          targetLevel: 3,
          responseFields: [RESP],
        },
        {
          id: "sn4-c10-1", number: "To 10",
          prompt: "\"What goes with 1 to make 10?\" (Answer: 9)",
          displayText: "1 / 10",
          targetLevel: 3,
          responseFields: [RESP],
        },
        {
          id: "sn4-p10-make9", number: "To 10",
          prompt: "\"Tell me two numbers for 9.\"",
          displayText: "make 9",
          targetLevel: 3,
          responseFields: [
            { label: "Number 1", type: "text_input", placeholder: "#" },
            { label: "Number 2", type: "text_input", placeholder: "#" },
          ],
        },
        // ── To 20 ─────────────────────────────────────────────────────────────
        {
          id: "sn4-c20-10of18", number: "To 20",
          prompt: "\"What goes with 10 to make 18?\" (Answer: 8)",
          displayText: "10 / 18",
          targetLevel: 5,
          responseFields: [RESP],
        },
        {
          id: "sn4-c20-7of20", number: "To 20",
          prompt: "\"What goes with 7 to make 20?\" (Answer: 13)",
          displayText: "7 / 20",
          targetLevel: 5,
          responseFields: [RESP],
        },
        {
          id: "sn4-c20-9of16", number: "To 20",
          prompt: "\"What goes with 9 to make 16?\" (Answer: 7)",
          displayText: "9 / 16",
          targetLevel: 5,
          responseFields: [RESP],
        },
        {
          id: "sn4-p20-make17", number: "To 20",
          prompt: "\"Tell me two numbers for 17.\"",
          displayText: "make 17",
          targetLevel: 5,
          responseFields: [
            { label: "Number 1", type: "text_input", placeholder: "#" },
            { label: "Number 2", type: "text_input", placeholder: "#" },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TASK GROUP 5: Bare Number Problems
    // Strategy codes: K, CF1, CF_, A5, A10
    // START HERE at 5+4 row (skip 2+3 starter)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Bare Number Problems",
      shortName: "Bare Nums",
      model: "SN",
      color: "orange",
      instructions: "Present problems orally — no materials. Record response and strategy: K=Knows Immediately, CF1=Counts From 1, CF_=Counts From other number, A5=Add through 5, A10=Add through 10.",
      teacherScript: "\"What is ___ plus ___?\" / \"What is ___ take away ___?\"",
      startAtItem: "sn5-5p4",
      startNote: "START HERE — most students begin here",
      items: [
        // ── Basic ─────────────────────────────────────────────────────────────
        {
          id: "sn5-2p3", number: "Basic",
          prompt: "\"What is 2 plus 3?\" (Answer: 5)",
          displayText: "2 + 3",
          targetLevel: 2,
          responseFields: [RESP, KCF_A],
        },
        // ── To 10 ── START HERE ───────────────────────────────────────────────
        {
          id: "sn5-5p4", number: "To 10",
          prompt: "\"What is 5 plus 4?\" (Answer: 9)",
          displayText: "5 + 4",
          targetLevel: 3,
          responseFields: [RESP, KCF_A],
        },
        {
          id: "sn5-3p3", number: "To 10",
          prompt: "\"What is 3 plus 3?\" (Answer: 6)",
          displayText: "3 + 3",
          targetLevel: 3,
          responseFields: [RESP, KCF_A],
        },
        {
          id: "sn5-9m6", number: "To 10",
          prompt: "\"What is 9 take away 6?\" (Answer: 3)",
          displayText: "9 − 6",
          targetLevel: 3,
          responseFields: [RESP, KCF_A],
        },
        {
          id: "sn5-8m4", number: "To 10",
          prompt: "\"What is 8 take away 4?\" (Answer: 4)",
          displayText: "8 − 4",
          targetLevel: 3,
          responseFields: [RESP, KCF_A],
        },
        // ── To 20 ─────────────────────────────────────────────────────────────
        {
          id: "sn5-9p9", number: "To 20",
          prompt: "\"What is 9 plus 9?\" (Answer: 18)",
          displayText: "9 + 9",
          targetLevel: 5,
          responseFields: [RESP, KCF_A],
        },
        {
          id: "sn5-10p6", number: "To 20",
          prompt: "\"What is 10 plus 6?\" (Answer: 16)",
          displayText: "10 + 6",
          targetLevel: 5,
          responseFields: [RESP, KCF_A],
        },
        {
          id: "sn5-13m5", number: "To 20",
          prompt: "\"What is 13 take away 5?\" (Answer: 8)",
          displayText: "13 − 5",
          targetLevel: 5,
          responseFields: [RESP, KCF_A],
        },
        {
          id: "sn5-20m6", number: "To 20",
          prompt: "\"What is 20 take away 6?\" (Answer: 14)",
          displayText: "20 − 6",
          targetLevel: 5,
          responseFields: [RESP, KCF_A],
        },
      ],
    },

  ] as TaskGroup[],

  // ── SN Level Descriptions (from PDF) ──────────────────────────────────────
  snLevels: [
    {
      level: 0,
      name: "Emergent",
      description: "Subitizes only to 3; counts larger collections; builds finger patterns sequentially.",
    },
    {
      level: 1,
      name: "Facile Structures to 5",
      description: "Facile with regular spatial patterns to 6 and irregular to 5; simultaneous finger patterns 1–5; combines/partitions 1–5 without counting.",
    },
    {
      level: 2,
      name: "Intermediate Structures to 10",
      description: "Uses 5-plus and doubles in range 1–10; simultaneous finger patterns to 10; combines/partitions 1–10 WITH materials.",
    },
    {
      level: 3,
      name: "Facile Structures to 10",
      description: "Uses 5-plus and doubles to combine/partition 1–10 WITHOUT materials; facile with bare number problems to 10.",
    },
    {
      level: 4,
      name: "Intermediate Structures to 20",
      description: "Uses sub-base-5, 10-plus, and doubles 6–10; combines/partitions 1–20 WITH materials (arithmetic rack).",
    },
    {
      level: 5,
      name: "Facile Structures to 20",
      description: "Uses 5, 10, and doubles to combine/partition 1–20 WITHOUT materials; facile with bare number problems to 20.",
    },
  ],
};
