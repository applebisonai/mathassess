// Schedule 3A: Number Words and Numerals
// LFIN Assessment Schedule — Wright & Ellemor-Collins, 2018
// Materials: Task cards, paper, marker pen
// Models: NID (0–6), FNWS (0–7), BNWS (0–7)

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

export const schedule3A = {
  id: "schedule-3a",
  name: "Schedule 3A: Number Words and Numerals",
  shortName: "3A",
  gradeRange: "K–3",
  materials: ["Task cards", "Paper", "Marker pen"],
  models: ["NID", "FNWS", "BNWS"],
  taskGroups: [

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Numeral Identification (NID)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Numeral Identification",
      shortName: "NID",
      model: "NID",
      color: "purple",
      instructions: "Show numeral card one at a time. Say: \"What number is this?\"",
      teacherScript: '"What number is this?"',
      materials: "Task cards — numeral cards",
      startAtItem: "Level 4",
      items: [
        // Level 3 — two-digit
        {
          id: "1.1", number: "Level 3", prompt: "Identify: 12", displayText: "12",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.2", number: "Level 3", prompt: "Identify: 15", displayText: "15",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.3", number: "Level 3", prompt: "Identify: 47", displayText: "47",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.4", number: "Level 3", prompt: "Identify: 21", displayText: "21",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.5", number: "Level 3", prompt: "Identify: 66", displayText: "66",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.6", number: "Level 3", prompt: "Identify: 83", displayText: "83",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 4 — three-digit
        {
          id: "1.7", number: "Level 4", prompt: "Identify: 101", displayText: "101",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.8", number: "Level 4", prompt: "Identify: 275", displayText: "275",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.9", number: "Level 4", prompt: "Identify: 400", displayText: "400",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.10", number: "Level 4", prompt: "Identify: 517", displayText: "517",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.11", number: "Level 4", prompt: "Identify: 730", displayText: "730",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.12", number: "Level 4", prompt: "Identify: 306", displayText: "306",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 5 — four-digit and beyond
        {
          id: "1.13", number: "Level 5", prompt: "Identify: 1000", displayText: "1000",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.14", number: "Level 5", prompt: "Identify: 8245", displayText: "8245",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.15", number: "Level 5", prompt: "Identify: 1006", displayText: "1006",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.16", number: "Level 5", prompt: "Identify: 3406", displayText: "3406",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.17", number: "Level 5", prompt: "Identify: 6032", displayText: "6032",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.18", number: "Level 5", prompt: "Identify: 4820", displayText: "4820",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.19", number: "Level 5", prompt: "Identify: 3010", displayText: "3010",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.20", number: "Level 5", prompt: "Identify: 1300", displayText: "1300",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.21", number: "Level 5", prompt: "Identify: 40000", displayText: "40000",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 6 — five-digit
        {
          id: "1.22", number: "Level 6", prompt: "Identify: 10235", displayText: "10235",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.23", number: "Level 6", prompt: "Identify: 12500", displayText: "12500",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.24", number: "Level 6", prompt: "Identify: 59049", displayText: "59049",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.25", number: "Level 6", prompt: "Identify: 80402", displayText: "80402",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "1.26", number: "Level 6", prompt: "Identify: 64004", displayText: "64004",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Writing Numerals (NID)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Writing Numerals",
      shortName: "Writing",
      model: "NID",
      color: "purple",
      instructions: "Say the number aloud. Say: \"Write this number for me.\" Give student paper and marker pen.",
      teacherScript: '"Write this number for me."',
      materials: "Paper, marker pen",
      items: [
        // Level 3
        {
          id: "2.1", number: "Level 3", prompt: "Write: six (6)", displayText: "6",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.2", number: "Level 3", prompt: "Write: twelve (12)", displayText: "12",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.3", number: "Level 3", prompt: "Write: eighteen (18)", displayText: "18",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.4", number: "Level 3", prompt: "Write: ninety-two (92)", displayText: "92",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 4
        {
          id: "2.5", number: "Level 4", prompt: "Write: five hundred and seventeen (517)", displayText: "517",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.6", number: "Level 4", prompt: "Write: two hundred and seventy (270)", displayText: "270",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.7", number: "Level 4", prompt: "Write: three hundred and six (306)", displayText: "306",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 5
        {
          id: "2.8", number: "Level 5", prompt: "Write: one thousand (1000)", displayText: "1,000",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.9", number: "Level 5", prompt: "Write: six thousand and five (6005)", displayText: "6,005",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.10", number: "Level 5", prompt: "Write: two thousand and twenty (2020)", displayText: "2,020",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.11", number: "Level 5", prompt: "Write: four thousand nine hundred and forty (4940)", displayText: "4,940",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 6
        {
          id: "2.12", number: "Level 6", prompt: "Write: ten thousand (10000)", displayText: "10,000",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.13", number: "Level 6", prompt: "Write: fifteen thousand six hundred and twenty-five (15625)", displayText: "15,625",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.14", number: "Level 6", prompt: "Write: thirty-four thousand seven hundred (34700)", displayText: "34,700",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "2.15", number: "Level 6", prompt: "Write: fifty thousand and fifty (50050)", displayText: "50,050",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Backward Number Word Sequences (BNWS)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Backward Number Word Sequences",
      shortName: "BNWS",
      model: "BNWS",
      color: "purple",
      instructions: "Say: \"Count backwards from ___ to ___.\"",
      teacherScript: '"Count backwards from ___ to ___."',
      materials: "None",
      startAtItem: "3.3",
      items: [
        {
          id: "3.1", number: "3.1", prompt: "Count back: 15 → 10", displayText: "15 → 10",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.2", number: "3.2", prompt: "Count back: 23 → 17", displayText: "23 → 17",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.3", number: "3.3", prompt: "Count back: 52 → 38", displayText: "52 → 38",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.4", number: "3.4", prompt: "Count back: 103 → 96", displayText: "103 → 96",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.5", number: "3.5", prompt: "Count back: 303 → 296", displayText: "303 → 296",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.6", number: "3.6", prompt: "Count back: 1003 → 987", displayText: "1003 → 987",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "3.7", number: "3.7", prompt: "Count back: 2203 → 2187", displayText: "2203 → 2187",
          targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: Number Words Before (NWB)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Number Words Before",
      shortName: "NWB",
      model: "BNWS",
      color: "purple",
      instructions: "Say: \"What number comes just before ___?\"",
      teacherScript: '"What number comes just before ___?"',
      materials: "None",
      startAtItem: "Level 4",
      items: [
        // Level 4
        {
          id: "4.1", number: "Level 4", prompt: "Number before 8", displayText: "Before 8",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.2", number: "Level 4", prompt: "Number before 13", displayText: "Before 13",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.3", number: "Level 4", prompt: "Number before 17", displayText: "Before 17",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.4", number: "Level 4", prompt: "Number before 20", displayText: "Before 20",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.5", number: "Level 4", prompt: "Number before 14", displayText: "Before 14",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.6", number: "Level 4", prompt: "Number before 25", displayText: "Before 25",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.7", number: "Level 4", prompt: "Number before 30", displayText: "Before 30",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 5
        {
          id: "4.8", number: "Level 5", prompt: "Number before 55", displayText: "Before 55",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.9", number: "Level 5", prompt: "Number before 41", displayText: "Before 41",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.10", number: "Level 5", prompt: "Number before 80", displayText: "Before 80",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.11", number: "Level 5", prompt: "Number before 100", displayText: "Before 100",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 6
        {
          id: "4.12", number: "Level 6", prompt: "Number before 170", displayText: "Before 170",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.13", number: "Level 6", prompt: "Number before 201", displayText: "Before 201",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.14", number: "Level 6", prompt: "Number before 300", displayText: "Before 300",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.15", number: "Level 6", prompt: "Number before 1000", displayText: "Before 1000",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 7
        {
          id: "4.16", number: "Level 7", prompt: "Number before 1100", displayText: "Before 1100",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.17", number: "Level 7", prompt: "Number before 2000", displayText: "Before 2000",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.18", number: "Level 7", prompt: "Number before 5050", displayText: "Before 5050",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "4.19", number: "Level 7", prompt: "Number before 10000", displayText: "Before 10000",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Forward Number Word Sequences (FNWS)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Forward Number Word Sequences",
      shortName: "FNWS",
      model: "FNWS",
      color: "purple",
      instructions: "Say: \"Count forwards from ___ to ___.\"",
      teacherScript: '"Count forwards from ___ to ___."',
      materials: "None",
      startAtItem: "5.3",
      items: [
        {
          id: "5.1", number: "5.1", prompt: "Count on: 8 → 17", displayText: "8 → 17",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.2", number: "5.2", prompt: "Count on: 15 → 33", displayText: "15 → 33",
          targetLevel: 3,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.3", number: "5.3", prompt: "Count on: 57 → 68", displayText: "57 → 68",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.4", number: "5.4", prompt: "Count on: 95 → 113", displayText: "95 → 113",
          targetLevel: 4,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.5", number: "5.5", prompt: "Count on: 197 → 210", displayText: "197 → 210",
          targetLevel: 5,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.6", number: "5.6", prompt: "Count on: 995 → 1010", displayText: "995 → 1010",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.7", number: "5.7", prompt: "Count on: 1095 → 1103", displayText: "1095 → 1103",
          targetLevel: 6,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
        {
          id: "5.8", number: "5.8", prompt: "Count on: 6595 → 6612", displayText: "6595 → 6612",
          targetLevel: 7,
          responseFields: [
            { label: "Correct", type: "correct_incorrect" },
            { label: "Fluency", type: "fluency_scale", options: FLUENCY_OPTIONS },
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 6: Number Words After (NWA)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Number Words After",
      shortName: "NWA",
      model: "FNWS",
      color: "purple",
      instructions: "Say: \"What number comes just after ___?\"",
      teacherScript: '"What number comes just after ___?"',
      materials: "None",
      startAtItem: "Level 5",
      items: [
        // Level 4
        {
          id: "6.1", number: "Level 4", prompt: "Number after 6", displayText: "After 6",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.2", number: "Level 4", prompt: "Number after 12", displayText: "After 12",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.3", number: "Level 4", prompt: "Number after 17", displayText: "After 17",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.4", number: "Level 4", prompt: "Number after 25", displayText: "After 25",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.5", number: "Level 4", prompt: "Number after 22", displayText: "After 22",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.6", number: "Level 4", prompt: "Number after 19", displayText: "After 19",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.7", number: "Level 4", prompt: "Number after 29", displayText: "After 29",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 5
        {
          id: "6.8", number: "Level 5", prompt: "Number after 50", displayText: "After 50",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.9", number: "Level 5", prompt: "Number after 39", displayText: "After 39",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.10", number: "Level 5", prompt: "Number after 65", displayText: "After 65",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.11", number: "Level 5", prompt: "Number after 77", displayText: "After 77",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.12", number: "Level 5", prompt: "Number after 89", displayText: "After 89",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 6
        {
          id: "6.13", number: "Level 6", prompt: "Number after 144", displayText: "After 144",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.14", number: "Level 6", prompt: "Number after 109", displayText: "After 109",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.15", number: "Level 6", prompt: "Number after 1000", displayText: "After 1000",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.16", number: "Level 6", prompt: "Number after 359", displayText: "After 359",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.17", number: "Level 6", prompt: "Number after 610", displayText: "After 610",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.18", number: "Level 6", prompt: "Number after 999", displayText: "After 999",
          targetLevel: 6,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // Level 7
        {
          id: "6.19", number: "Level 7", prompt: "Number after 1699", displayText: "After 1699",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.20", number: "Level 7", prompt: "Number after 1728", displayText: "After 1728",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.21", number: "Level 7", prompt: "Number after 2099", displayText: "After 2099",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "6.22", number: "Level 7", prompt: "Number after 8999", displayText: "After 8999",
          targetLevel: 7,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

  ] as TaskGroup[],

  // NID levels — Wright & Ellemor-Collins, 2018 (matches Schedule 3A header)
  nidLevels: [
    { level: 0, name: "Emergent numeral identification",    description: "Cannot identify any numerals" },
    { level: 1, name: "Numerals to 10 — Identify",         description: "Identifies single-digit numerals (1–10)" },
    { level: 2, name: "Numerals to 20 — Identify",         description: "Identifies numerals to 20, including teens" },
    { level: 3, name: "Numerals to 100 — Identify",        description: "Identifies two-digit numerals to 100" },
    { level: 4, name: "Numerals to 1,000 — Identify & write",   description: "Identifies and writes three-digit numerals to 1,000" },
    { level: 5, name: "Numerals to 10,000 — Identify & write",  description: "Identifies and writes four-digit numerals to 10,000" },
    { level: 6, name: "Numerals to 100,000 — Identify & write", description: "Identifies and writes five-digit numerals to 100,000" },
  ],

  // FNWS / BNWS levels — Wright & Ellemor-Collins, 2018 (matches Schedule 3A header)
  nwsLevels: [
    { level: 0, name: "Emergent",                       description: "Cannot produce any FNWS or BNWS" },
    { level: 1, name: "Initial — up to 'ten'",          description: "Produces FNWS or BNWS only up to 'ten'" },
    { level: 2, name: "Intermediate — up to 'ten'",     description: "Produces FNWS or BNWS up to 'ten' with some hesitation" },
    { level: 3, name: "Facile — up to 'ten'",           description: "Fluently produces FNWS and BNWS in range 1–10; can say number before/after" },
    { level: 4, name: "Facile — up to 'thirty'",        description: "Fluently produces FNWS and BNWS to 'thirty'; number before/after any 2-digit" },
    { level: 5, name: "Facile — up to 'one hundred'",   description: "Fluently produces FNWS and BNWS across tens; number before/after to 100" },
    { level: 6, name: "Facile — up to 'one thousand'",  description: "Fluently produces FNWS and BNWS across hundreds; number before/after to 1,000" },
    { level: 7, name: "Facile — up to 'ten thousand'",  description: "Fluently produces FNWS and BNWS across thousands; number before/after to 10,000" },
  ],
};
