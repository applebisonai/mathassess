// Single source of truth for all assessment categories and assessments.
// Both app/assess/page.tsx and app/assess/select/page.tsx import from here.

export interface AssessmentEntry {
  id: string;
  name: string;
  description: string;
  gradeRange: string;
  models: string[];
  available: boolean;
  route?: string;
  /** Materials shown in the "Gather Materials" step before starting */
  materials?: string[];
}

export interface CategoryEntry {
  id: string;
  name: string;
  fullName: string;
  color: string;
  icon: string;
  description: string;
  assessments: AssessmentEntry[];
}

export const ASSESSMENT_CATALOG: CategoryEntry[] = [
  {
    id: "lfin",
    name: "LFIN",
    fullName: "Learning Framework in Number",
    color: "blue",
    icon: "📐",
    description: "Wright & Ellemor-Collins — Schedules 2A–3F",
    assessments: [
      {
        id: "schedule-2a",
        name: "Schedule 2A",
        description: "Forward/Backward Number Word Sequences & Numeral ID",
        gradeRange: "K–1",
        models: ["FNWS", "BNWS", "NID"],
        available: true,
        route: "/assess/interview/2a",
        materials: ["Numeral cards (0–100)", "Paper and pen for the student"],
      },
      {
        id: "schedule-2b",
        name: "Schedule 2B",
        description: "Spatial Patterns, Finger Patterns & Structuring to 20",
        gradeRange: "K–2",
        models: ["SN20"],
        available: true,
        route: "/assess/interview/2b",
        materials: ["Dice pattern cards", "Paper and pen"],
      },
      {
        id: "schedule-2c",
        name: "Schedule 2C",
        description: "Early Arithmetical Strategies — Addition & Subtraction",
        gradeRange: "K–2",
        models: ["SEAL"],
        available: true,
        route: "/assess/interview/2c",
        materials: [
          "Task cards (number sentences for TG6)",
          "Counters — two colours (~30 of each)",
          "Two screens (small boards or folders)",
        ],
      },
      {
        id: "schedule-3a",
        name: "Schedule 3A",
        description: "Number Words and Numerals — NID, FNWS & BNWS",
        gradeRange: "K–3",
        models: ["NID", "FNWS", "BNWS"],
        available: true,
        route: "/assess/interview/3a",
        materials: [
          "Numeral task cards (two-digit, three-digit, four-digit, five-digit)",
          "Paper and marker pen for student (writing numerals task)",
        ],
      },
      {
        id: "schedule-3b",
        name: "Schedule 3B",
        description: "Structuring Numbers to 20 — Spatial Patterns, Partitions & Formal Operations",
        gradeRange: "K–3",
        models: ["SN20"],
        available: true,
        route: "/assess/interview/3b",
        materials: ["Task Cards", "Addition and Subtraction Cards"],
      },
      {
        id: "schedule-3c",
        name: "Schedule 3C",
        description: "Conceptual Place Value — Incrementing & Decrementing by 10s and 100s",
        gradeRange: "1–3",
        models: ["CPV"],
        available: true,
        route: "/assess/interview/3c",
        materials: [
          "Task Cards",
          "15 × 10-stick bundles",
          "13 × 100-dot squares",
          "Cover",
        ],
      },
      {
        id: "schedule-3d",
        name: "Schedule 3D",
        description: "Addition & Subtraction to 100 — Formal & Higher Decade",
        gradeRange: "2–5",
        models: ["A&S"],
        available: true,
        route: "/assess/interview/3d",
        materials: ["10 Task Cards", "10 Numeral Cards", "Decuple Line"],
      },
      {
        id: "schedule-3e",
        name: "Schedule 3E",
        description: "Early Multiplication and Division — Equal groups, arrays, skip counting & basic facts",
        gradeRange: "2–4",
        models: ["EM&D"],
        available: true,
        route: "/assess/interview/3e",
        materials: [
          "Counters (~30)",
          "Array cards (5×3, 5×6)",
          "Screen / cover",
          "Task cards (flash cards for basic facts)",
        ],
      },
      {
        id: "schedule-3f",
        name: "Schedule 3F",
        description: "Multiplicative Basic Facts — Ranges 1–5 across all fact families",
        gradeRange: "3–5",
        models: ["MBF"],
        available: true,
        route: "/assess/interview/3f",
        materials: [
          "Basic facts flash cards (or task cards)",
        ],
      },
    ],
  },
  {
    id: "addvantage",
    name: "AddVantage MR",
    fullName: "AddVantage Math Recovery",
    color: "green",
    icon: "➕",
    description: "US Math Recovery Council — Courses 1 & 2",
    assessments: [
      {
        id: "av-nwn",
        name: "Number Words and Numerals",
        description: "Course 1 — FNWS, BNWS & Numeral Identification — Levels 0–5",
        gradeRange: "K–3",
        models: ["FNWS", "BNWS", "NID"],
        available: true,
        route: "/assess/interview/av-nwn",
        materials: [
          "Numeral cards 0–10",
          "Numeral cards 11–100",
          "Numeral cards 101–1,000",
          "Numeral sequence cards 1–10, 46–55",
        ],
      },
      {
        id: "av-sn",
        name: "Structuring Numbers",
        description: "Course 1 — Spatial patterns, finger patterns, partitions of 5 & 10, doubles to 20 — Levels 0–5",
        gradeRange: "K–3",
        models: ["SN"],
        available: true,
        route: "/assess/interview/av-sn",
        materials: ["Spatial pattern cards", "Arithmetic rack / bead string"],
      },
      {
        id: "av-as",
        name: "Addition & Subtraction",
        description: "Course 1 — Screened collections, missing addend, bare numbers, relational thinking — Levels 0–5",
        gradeRange: "K–3",
        models: ["CAS"],
        available: true,
        route: "/assess/interview/av-as",
        materials: [
          "Counters (~20)",
          "Two screens (small boards or folders)",
          "Task cards (bare number problems)",
        ],
      },
      {
        id: "av-pv",
        name: "Place Value",
        description: "Course 2 — Tens & ones sequences, two-digit addition/subtraction with & without materials",
        gradeRange: "2–4",
        models: ["CPV"],
        available: true,
        route: "/assess/interview/av-pv",
        materials: [
          "7 bundles of 10 sticks",
          "15+ loose sticks",
          "Numeral task cards (63+21, 38+24, 57−34, 43−15, 257+30, 342+120, 672+151, 304−198)",
          "Cover / screen",
        ],
      },
      {
        id: "av-md",
        name: "Multiplication & Division",
        description: "Course 2 — Number word sequences, equal groups, arrays & relational thinking — Levels 0–5",
        gradeRange: "2–5",
        models: ["M&D"],
        available: true,
        route: "/assess/interview/av-md",
        materials: [
          "Counters (~30)",
          "Array card (4×3, 6×4)",
          "Screen / cover",
        ],
      },
    ],
  },
  {
    id: "nns",
    name: "Number Screeners",
    fullName: "Number Sense Screeners",
    color: "orange",
    icon: "🎯",
    description: "Quick screeners for tier placement & progress monitoring",
    assessments: [
      {
        id: "nss-k",
        name: "Number Sense Screener — K",
        description: "Counting, subitizing, number order & simple addition (Jordan et al.)",
        gradeRange: "K",
        models: [],
        available: false,
      },
      {
        id: "nss-1",
        name: "Number Sense Screener — 1",
        description: "Number word sequences, numeral ID, counting on, fact fluency",
        gradeRange: "1",
        models: [],
        available: false,
      },
      {
        id: "ns-brief",
        name: "Brief Number Sense Check",
        description: "Quick 10-item screener — counting, magnitude, operations",
        gradeRange: "K–3",
        models: [],
        available: false,
      },
      {
        id: "tema3",
        name: "TEMA-3 Informal Tasks",
        description: "Test of Early Mathematics Ability — informal diagnostic subset",
        gradeRange: "K–2",
        models: [],
        available: false,
      },
    ],
  },
  {
    id: "bridges",
    name: "Bridges / CCSS",
    fullName: "Bridges in Mathematics & Common Core Checks",
    color: "teal",
    icon: "🌉",
    description: "Bridges curriculum assessments & CCSS unit checks",
    assessments: [
      {
        id: "br-unit-check",
        name: "Unit Pre/Post Checks",
        description: "Beginning and end-of-unit checks aligned to Bridges units",
        gradeRange: "K–5",
        models: [],
        available: false,
      },
      {
        id: "br-checkups",
        name: "Checkups 1–5",
        description: "Mid-module progress checkups embedded in Bridges curriculum",
        gradeRange: "K–5",
        models: [],
        available: false,
      },
      {
        id: "br-cumulative",
        name: "Cumulative Review",
        description: "End-of-year cumulative assessment across all domains",
        gradeRange: "K–5",
        models: [],
        available: false,
      },
    ],
  },
  {
    id: "teacher",
    name: "Teacher Created",
    fullName: "My Custom Assessments",
    color: "purple",
    icon: "📝",
    description: "Upload a PDF — auto-converted to a digital form",
    assessments: [],
  },
];

/** Flat lookup: assessmentId → AssessmentEntry */
export const ASSESSMENT_BY_ID: Record<string, AssessmentEntry> = Object.fromEntries(
  ASSESSMENT_CATALOG.flatMap((cat) => cat.assessments.map((a) => [a.id, a]))
);
