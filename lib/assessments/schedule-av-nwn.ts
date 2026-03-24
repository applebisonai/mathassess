// Add+VantageMR: Number Words and Numerals Assessment — Course 1
// US Math Recovery Council, v2.0, 2012
// Models: FNWS, BNWS, NID — Levels 0–5

export type ResponseFieldType =
  | "correct_incorrect"
  | "text_input";

export interface AssessmentItem {
  id: string;
  number: string;
  prompt: string;
  displayText?: string;
  responseFields: ResponseField[];
  targetLevel: number;
  notes?: string;
  countingSequence?: number[];
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
}

export const scheduleAvNWN = {
  id: "av-nwn",
  name: "Add+VantageMR: Number Words and Numerals",
  shortName: "NWN",
  gradeRange: "K–3",
  materials: [
    "Numeral cards 0–10",
    "Numeral cards 11–100",
    "Numeral cards 101–1,000",
    "Numeral cards 1,001–1,000,000",
    "Numeral sequence cards 1–10, 46–55",
  ],
  models: ["FNWS", "BNWS", "NID"],

  taskGroups: [
    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 1: Forward Number Word Sequences (FNWS)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg1",
      number: 1,
      name: "Forward Number Word Sequences",
      shortName: "FNWS",
      model: "FNWS",
      color: "purple",
      instructions: "Say: \"Start counting from ___ and I will tell you when to stop.\"",
      teacherScript: "\"Start counting from ___ and I will tell you when to stop.\"",
      items: [
        {
          id: "tg1-a", number: "1.a",
          prompt: "Count forward from 1, stop at 32",
          displayText: "1 (to 32)",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          countingSequence: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
        },
        {
          id: "tg1-b", number: "1.b",
          prompt: "Count forward from 38, stop at 51",
          displayText: "38 (to 51)",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          countingSequence: [38,39,40,41,42,43,44,45,46,47,48,49,50,51],
        },
        {
          id: "tg1-c", number: "1.c",
          prompt: "Count forward from 76, stop at 84",
          displayText: "76 (to 84)",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          countingSequence: [76,77,78,79,80,81,82,83,84],
        },
        {
          id: "tg1-d", number: "1.d",
          prompt: "Count forward from 93, stop at 112",
          displayText: "93 (to 112)",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          countingSequence: [93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 2: Number Word After (NWA)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg2",
      number: 2,
      name: "Number Word After",
      shortName: "NWA",
      model: "FNWS",
      color: "purple",
      instructions: "Say: \"Say the number that comes right after ___.\"\nIntroductory example: \"Say the number that comes right after two.\" Then ask each number in turn.",
      teacherScript: "\"Say the number that comes right after ___.\"\nIntroductory example: \"Say the number that comes right after two.\"",
      branchingNote: "If student is not facile in NWA 11–30, go back and administer NWA 0–10 items first.",
      startAtItem: "nwa-14",
      startNote: "START HERE — most students begin at NWA 11–30",
      items: [
        // NWA 0–10
        {
          id: "nwa-5", number: "NWA 0–10",
          prompt: "What comes right after 5?",
          displayText: "5",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-9", number: "NWA 0–10",
          prompt: "What comes right after 9?",
          displayText: "9",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-7", number: "NWA 0–10",
          prompt: "What comes right after 7?",
          displayText: "7",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-3", number: "NWA 0–10",
          prompt: "What comes right after 3?",
          displayText: "3",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-6", number: "NWA 0–10",
          prompt: "What comes right after 6?",
          displayText: "6",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // NWA 11–30
        {
          id: "nwa-14", number: "NWA 11–30",
          prompt: "What comes right after 14?",
          displayText: "14",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-20", number: "NWA 11–30",
          prompt: "What comes right after 20?",
          displayText: "20",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-11", number: "NWA 11–30",
          prompt: "What comes right after 11?",
          displayText: "11",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-29", number: "NWA 11–30",
          prompt: "What comes right after 29?",
          displayText: "29",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-23", number: "NWA 11–30",
          prompt: "What comes right after 23?",
          displayText: "23",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-12", number: "NWA 11–30",
          prompt: "What comes right after 12?",
          displayText: "12",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-19", number: "NWA 11–30",
          prompt: "What comes right after 19?",
          displayText: "19",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        // NWA 31–100
        {
          id: "nwa-59", number: "NWA 31–100",
          prompt: "What comes right after 59?",
          displayText: "59",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-65", number: "NWA 31–100",
          prompt: "What comes right after 65?",
          displayText: "65",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-32", number: "NWA 31–100",
          prompt: "What comes right after 32?",
          displayText: "32",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-70", number: "NWA 31–100",
          prompt: "What comes right after 70?",
          displayText: "70",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwa-99", number: "NWA 31–100",
          prompt: "What comes right after 99?",
          displayText: "99",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 3: Numeral Identification (NID)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg3",
      number: 3,
      name: "Numeral Identification",
      shortName: "NID",
      model: "NID",
      color: "purple",
      instructions: "For recognition: \"Which number is the ___?\" (place cards on table in random order)\nFor identification: \"What number is this?\" (show each card in turn)",
      teacherScript: "Recognition: \"Which number is the ___?\"\nIdentification: \"What number is this?\"",
      items: [
        // Numeral Recognition 0–10
        {
          id: "nid-r6", number: "Numeral Recognition 0–10",
          prompt: "Which number is 6? (show numeral cards 0–10 on table in random order)",
          displayText: "6",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          notes: "Place numeral cards 0–10 on the table in random order. Ask: \"Which number is the ___?\"",
        },
        {
          id: "nid-r8", number: "Numeral Recognition 0–10",
          prompt: "Which number is 8?",
          displayText: "8",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-r2", number: "Numeral Recognition 0–10",
          prompt: "Which number is 2?",
          displayText: "2",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-r9", number: "Numeral Recognition 0–10",
          prompt: "Which number is 9?",
          displayText: "9",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-r7", number: "Numeral Recognition 0–10",
          prompt: "Which number is 7?",
          displayText: "7",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-r5", number: "Numeral Recognition 0–10",
          prompt: "Which number is 5?",
          displayText: "5",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },

        // Numeral ID 0–10
        {
          id: "nid-4", number: "Numeral ID 0–10",
          prompt: "What number is this? (show numeral card)",
          displayText: "4",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
          notes: "Show each card in turn. \"What number is this?\"",
        },
        {
          id: "nid-2", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "2",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-9", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "9",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-6", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "6",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-0", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "0",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-8", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "8",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-10", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "10",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-3", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "3",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-1", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "1",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-7", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "7",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-5", number: "Numeral ID 0–10",
          prompt: "What number is this?",
          displayText: "5",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },

        // Numeral ID 11–100
        {
          id: "nid-19", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "19",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-34", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "34",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-15", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "15",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-90", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "90",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-41", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "41",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-12", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "12",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-17", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "17",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-20", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "20",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-66", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "66",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-25", number: "Numeral ID 11–100",
          prompt: "What number is this?",
          displayText: "25",
          targetLevel: 3,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },

        // Numeral ID 101–1,000
        {
          id: "nid-168", number: "Numeral ID 101–1,000",
          prompt: "What number is this?",
          displayText: "168",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-400", number: "Numeral ID 101–1,000",
          prompt: "What number is this?",
          displayText: "400",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-117", number: "Numeral ID 101–1,000",
          prompt: "What number is this?",
          displayText: "117",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-354", number: "Numeral ID 101–1,000",
          prompt: "What number is this?",
          displayText: "354",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-205", number: "Numeral ID 101–1,000",
          prompt: "What number is this?",
          displayText: "205",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-620", number: "Numeral ID 101–1,000",
          prompt: "What number is this?",
          displayText: "620",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },

        // Numeral ID 1,001–1,000,000
        {
          id: "nid-7462", number: "Numeral ID 1,001–1,000,000",
          prompt: "What number is this?",
          displayText: "7,462",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-5026", number: "Numeral ID 1,001–1,000,000",
          prompt: "What number is this?",
          displayText: "5,026",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-46803", number: "Numeral ID 1,001–1,000,000",
          prompt: "What number is this?",
          displayText: "46,803",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-90380", number: "Numeral ID 1,001–1,000,000",
          prompt: "What number is this?",
          displayText: "90,380",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-247641", number: "Numeral ID 1,001–1,000,000",
          prompt: "What number is this?",
          displayText: "247,641",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nid-700090", number: "Numeral ID 1,001–1,000,000",
          prompt: "What number is this?",
          displayText: "700,090",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 4: Backward Number Word Sequences (BNWS)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg4",
      number: 4,
      name: "Backward Number Word Sequences",
      shortName: "BNWS",
      model: "BNWS",
      color: "purple",
      instructions: "Say: \"Start counting backwards from ___ and I will tell you when to stop.\"",
      teacherScript: "\"Start counting backwards from ___ and I will tell you when to stop.\"",
      items: [
        {
          id: "tg4-a", number: "4.a",
          prompt: "Count backward from 10, stop at 1",
          displayText: "10 (to 1)",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "tg4-b", number: "4.b",
          prompt: "Count backward from 17, stop at 10",
          displayText: "17 (to 10)",
          targetLevel: 1,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "tg4-c", number: "4.c",
          prompt: "Count backward from 38, stop at 27",
          displayText: "38 (to 27)",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "tg4-d", number: "4.d",
          prompt: "Count backward from 72, stop at 66",
          displayText: "72 (to 66)",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 5: Number Word Before (NWB)
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg5",
      number: 5,
      name: "Number Word Before",
      shortName: "NWB",
      model: "BNWS",
      color: "purple",
      instructions: "Say: \"Say the number that comes right before ___.\"\nIntroductory example: \"Say the number that comes right before two.\" Then ask each number in turn.",
      teacherScript: "\"Say the number that comes right before ___.\"\nIntroductory example: \"Say the number that comes right before two.\"",
      branchingNote: "If student is not facile in NWB 11–30, go back and administer NWB 0–10 items first. If not facile in NWB 31–100, go back to NWB 11–30.",
      startAtItem: "nwb-24",
      startNote: "START HERE — most students begin at NWB 11–30",
      items: [
        // NWB 0–10
        {
          id: "nwb-7", number: "NWB 0–10",
          prompt: "What comes right before 7?",
          displayText: "7",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-10", number: "NWB 0–10",
          prompt: "What comes right before 10?",
          displayText: "10",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-4", number: "NWB 0–10",
          prompt: "What comes right before 4?",
          displayText: "4",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-8", number: "NWB 0–10",
          prompt: "What comes right before 8?",
          displayText: "8",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-3", number: "NWB 0–10",
          prompt: "What comes right before 3?",
          displayText: "3",
          targetLevel: 2,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },

        // NWB 11–30
        {
          id: "nwb-24", number: "NWB 11–30",
          prompt: "What comes right before 24?",
          displayText: "24",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-17", number: "NWB 11–30",
          prompt: "What comes right before 17?",
          displayText: "17",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-20", number: "NWB 11–30",
          prompt: "What comes right before 20?",
          displayText: "20",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-11", number: "NWB 11–30",
          prompt: "What comes right before 11?",
          displayText: "11",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-14", number: "NWB 11–30",
          prompt: "What comes right before 14?",
          displayText: "14",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-21", number: "NWB 11–30",
          prompt: "What comes right before 21?",
          displayText: "21",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-30", number: "NWB 11–30",
          prompt: "What comes right before 30?",
          displayText: "30",
          targetLevel: 4,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },

        // NWB 31–100
        {
          id: "nwb-53", number: "NWB 31–100",
          prompt: "What comes right before 53?",
          displayText: "53",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-70", number: "NWB 31–100",
          prompt: "What comes right before 70?",
          displayText: "70",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-88", number: "NWB 31–100",
          prompt: "What comes right before 88?",
          displayText: "88",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-41", number: "NWB 31–100",
          prompt: "What comes right before 41?",
          displayText: "41",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
        {
          id: "nwb-96", number: "NWB 31–100",
          prompt: "What comes right before 96?",
          displayText: "96",
          targetLevel: 5,
          responseFields: [{ label: "Correct", type: "correct_incorrect" }],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // TASK GROUP 6: Numeral Sequences
    // ─────────────────────────────────────────────────────────────
    {
      id: "tg6",
      number: 6,
      name: "Numeral Sequences",
      shortName: "Sequences",
      model: "NID",
      color: "purple",
      instructions: "Place the cards face up, one at a time, in random order. \"Tell me the numbers as I lay them down.\" Then: \"Put these in order.\" When finished, ask student to read the cards.",
      teacherScript: "\"Tell me the numbers as I lay them down.\" Then: \"Put these in order. Now read these numbers for me.\"",
      items: [
        {
          id: "tg6-1", number: "Numeral Sequences 1–10",
          prompt: "Lay out cards 1–10 one at a time in random order. Ask student to identify each, put them in order, and read them.",
          displayText: "Sequences 1–10",
          targetLevel: 1,
          responseFields: [
            { label: "Identify", type: "correct_incorrect" },
            { label: "Sequence", type: "correct_incorrect" },
            { label: "Read", type: "correct_incorrect" },
          ],
        },
        {
          id: "tg6-2", number: "Numeral Sequences 46–55",
          prompt: "Lay out cards 46–55 one at a time in random order. Ask student to identify each, put them in order, and read them.",
          displayText: "Sequences 46–55",
          targetLevel: 3,
          responseFields: [
            { label: "Identify", type: "correct_incorrect" },
            { label: "Sequence", type: "correct_incorrect" },
            { label: "Read", type: "correct_incorrect" },
          ],
        },
      ],
    },

  ] as TaskGroup[],

  // ── FNWS Model Levels ──────────────────────────────────────────
  fnwsLevels: [
    {
      level: 0, name: "Emergent FNWS",
      description: "Cannot produce the FNWS from 'one' to 'ten'.",
    },
    {
      level: 1, name: "Initial FNWS to 'ten'",
      description: "Can produce FNWS from 'one' to 'ten'. Cannot produce the number word just after a given number in the range 'one' to 'ten'.",
    },
    {
      level: 2, name: "Intermediate FNWS to 'ten'",
      description: "Can produce FNWS from 'one' to 'ten'. Produces number word just after a given number in range 1–10 but drops back to generate a running count.",
    },
    {
      level: 3, name: "Facile FNWS to 'ten'",
      description: "Produces number word just after a given number in range 1–10 without dropping back. Difficulty producing NWA for numbers beyond 'ten'.",
    },
    {
      level: 4, name: "Facile FNWS to 'thirty'",
      description: "Produces number word just after a given number in range 1–30 without dropping back.",
    },
    {
      level: 5, name: "Facile FNWS to 'one hundred'",
      description: "Produces number word just after a given number in range 1–100 without dropping back.",
    },
  ],

  // ── BNWS Model Levels ──────────────────────────────────────────
  bnwsLevels: [
    {
      level: 0, name: "Emergent BNWS",
      description: "Cannot produce the BNWS from 'ten' to 'one'.",
    },
    {
      level: 1, name: "Initial BNWS to 'ten'",
      description: "Can produce BNWS from 'ten' to 'one'. Cannot produce the NWB for given numbers in range 1–10.",
    },
    {
      level: 2, name: "Intermediate BNWS to 'ten'",
      description: "Can produce NWB in range 1–10 but drops back to generate a running count.",
    },
    {
      level: 3, name: "Facile BNWS to 'ten'",
      description: "Produces NWB in range 1–10 without dropping back. Difficulty producing NWB beyond 'ten'.",
    },
    {
      level: 4, name: "Facile BNWS to 'thirty'",
      description: "Produces NWB in range 1–30 without dropping back.",
    },
    {
      level: 5, name: "Facile BNWS to 'one hundred'",
      description: "Produces NWB in range 1–100 without dropping back.",
    },
  ],

  // ── NID Model Levels ───────────────────────────────────────────
  nidLevels: [
    {
      level: 0, name: "Emergent",
      description: "Cannot identify some or all numerals in the range '0' to '10'.",
    },
    {
      level: 1, name: "Numerals to '10'",
      description: "Can identify numerals in the range '0' to '10'.",
    },
    {
      level: 2, name: "Numerals to '20'",
      description: "Can identify numerals in the range '0' to '20'.",
    },
    {
      level: 3, name: "Numerals to '100'",
      description: "Can identify one and two digit numerals.",
    },
    {
      level: 4, name: "Numerals to '1,000'",
      description: "Can identify one, two, and three digit numerals.",
    },
    {
      level: 5, name: "Numerals to '1,000,000'",
      description: "Can identify numerals through six digit numerals.",
    },
  ],
};
