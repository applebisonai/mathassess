"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/nav";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

const GRADE_LABEL = (g: number) => (g === 0 ? "K" : `${g}`);

// Assessment library organized by category
const CATEGORIES = [
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
        route: "/assess/interview/2a",
        available: true,
      },
      {
        id: "schedule-2b",
        name: "Schedule 2B",
        description: "Spatial Patterns, Finger Patterns & Structuring to 20",
        gradeRange: "K–2",
        models: ["SN20"],
        route: "/assess/interview/2b",
        available: true,
      },
      {
        id: "schedule-2c",
        name: "Schedule 2C",
        description: "Early Arithmetical Strategies — Addition & Subtraction",
        gradeRange: "K–2",
        models: ["SEAL"],
        route: "/assess/interview/2c",
        available: true,
      },
      {
        id: "schedule-3a",
        name: "Schedule 3A",
        description: "Number Words and Numerals — NID, FNWS & BNWS",
        gradeRange: "K–3",
        models: ["NID", "FNWS", "BNWS"],
        route: "/assess/interview/3a",
        available: true,
      },
      {
        id: "schedule-3b",
        name: "Schedule 3B",
        description: "Addition & Subtraction to 100 — Jump and Split Strategies",
        gradeRange: "2–4",
        models: ["A&S100"],
        route: "",
        available: false,
      },
      {
        id: "schedule-3c",
        name: "Schedule 3C",
        description: "Early Multiplication & Division — Grouping and Sharing",
        gradeRange: "2–5",
        models: ["M&D"],
        route: "",
        available: false,
      },
      {
        id: "schedule-3d",
        name: "Schedule 3D",
        description: "Fractions — Equal Sharing, Part-Whole & Number Line",
        gradeRange: "3–5",
        models: ["FRN"],
        route: "",
        available: false,
      },
      {
        id: "schedule-3e",
        name: "Schedule 3E",
        description: "Decimals & Percentages — Tenths, Hundredths & Equivalence",
        gradeRange: "4–5",
        models: ["DEC"],
        route: "",
        available: false,
      },
      {
        id: "schedule-3f",
        name: "Schedule 3F",
        description: "Multiplication & Division Facts — Strategies & Automaticity",
        gradeRange: "3–5",
        models: ["MDF"],
        route: "",
        available: false,
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
        name: "Number Words & Numerals",
        description: "Course 1 — FNWS, NWA, Numeral ID, BNWS, NWB, Numeral Sequences",
        gradeRange: "K–2",
        models: ["FNWS", "BNWS", "NID"],
        route: "",
        available: false,
      },
      {
        id: "av-struct",
        name: "Structuring Numbers",
        description: "Course 1 — Spatial patterns, finger patterns, combining & partitioning to 20",
        gradeRange: "K–2",
        models: ["SN"],
        route: "",
        available: false,
      },
      {
        id: "av-addsub",
        name: "Addition & Subtraction",
        description: "Course 1 — Screened collections, missing addend, bare numbers, relational thinking",
        gradeRange: "K–3",
        models: ["SEAL"],
        route: "",
        available: false,
      },
      {
        id: "av-pv",
        name: "Place Value",
        description: "Course 2 — Tens & ones sequences, two-digit addition/subtraction with & without materials",
        gradeRange: "2–4",
        models: ["CPV"],
        route: "/assess/interview/av-pv",
        available: true,
      },
      {
        id: "av-multdiv",
        name: "Multiplication & Division",
        description: "Course 2 — Equal groups, arrays, relational thinking, proportional reasoning",
        gradeRange: "2–5",
        models: ["M&D"],
        route: "",
        available: false,
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
        route: "",
        available: false,
      },
      {
        id: "nss-1",
        name: "Number Sense Screener — 1",
        description: "Number word sequences, numeral ID, counting on, fact fluency",
        gradeRange: "1",
        models: [],
        route: "",
        available: false,
      },
      {
        id: "ns-brief",
        name: "Brief Number Sense Check",
        description: "Quick 10-item screener — counting, magnitude, operations",
        gradeRange: "K–3",
        models: [],
        route: "",
        available: false,
      },
      {
        id: "tema3",
        name: "TEMA-3 Informal Tasks",
        description: "Test of Early Mathematics Ability — informal diagnostic subset",
        gradeRange: "K–2",
        models: [],
        route: "",
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
        route: "",
        available: false,
      },
      {
        id: "br-checkups",
        name: "Checkups 1–5",
        description: "Mid-module progress checkups embedded in Bridges curriculum",
        gradeRange: "K–5",
        models: [],
        route: "",
        available: false,
      },
      {
        id: "br-cumulative",
        name: "Cumulative Review",
        description: "End-of-year cumulative assessment across all domains",
        gradeRange: "K–5",
        models: [],
        route: "",
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

function SelectContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedStudent = searchParams.get("student");
  const supabase = createClient();

  useEffect(() => {
    async function loadStudents() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("students")
        .select("id, first_name, last_name, grade_level")
        .eq("teacher_id", user.id)
        .eq("is_active", true)
        .order("last_name");
      if (data) setStudents(data);
      if (preSelectedStudent) setSelectedStudent(preSelectedStudent);
      setLoading(false);
    }
    loadStudents();
  }, [preSelectedStudent]);

  const category = CATEGORIES.find((c) => c.id === selectedCategory);
  const assessment = category?.assessments.find((a) => a.id === selectedAssessmentId);
  const student = students.find((s) => s.id === selectedStudent);

  function handleStart() {
    if (!selectedStudent || !assessment?.route) return;
    router.push(`${assessment.route}?student=${selectedStudent}`);
  }

  const COLOR_BORDER: Record<string, string> = {
    blue: "border-blue-500 bg-blue-50",
    green: "border-green-500 bg-green-50",
    purple: "border-purple-500 bg-purple-50",
    orange: "border-orange-500 bg-orange-50",
    teal: "border-teal-500 bg-teal-50",
  };
  const COLOR_BADGE: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    teal: "bg-teal-100 text-teal-700",
  };

  const canStart = selectedStudent && assessment?.available;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName="" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Start an Assessment</h1>
          <p className="text-gray-500 text-sm">Select a student, choose a category, then pick the assessment.</p>
        </div>

        <div className="space-y-4">

          {/* STEP 1: Student */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Step 1: Select Student</h2>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading students…</div>
            ) : students.length === 0 ? (
              <div className="text-gray-400 text-sm">
                No students found. <a href="/students/add" className="text-blue-600 underline">Add a student first.</a>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {students.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudent(s.id)}
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                      selectedStudent === s.id
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">{s.first_name} {s.last_name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Grade {GRADE_LABEL(s.grade_level)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Step 2: Choose Assessment Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedAssessmentId(""); }}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedCategory === cat.id
                      ? COLOR_BORDER[cat.color]
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="font-bold text-sm text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Specific Assessment (only shown after category picked) */}
          {category && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3">
                Step 3: Choose {category.name} Assessment
              </h2>

              {category.id === "teacher" ? (
                <div className="text-center py-6 text-gray-400">
                  <div className="text-4xl mb-3">📤</div>
                  <div className="font-medium text-gray-600 mb-1">PDF Upload Coming Soon</div>
                  <div className="text-sm">Upload a scanned classroom assessment and it will be auto-converted to a digital clickable form.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {category.assessments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => a.available && setSelectedAssessmentId(a.id)}
                      disabled={!a.available}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        !a.available
                          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          : selectedAssessmentId === a.id
                          ? `border-2 ${COLOR_BORDER[category.color]}`
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${COLOR_BADGE[category.color]}`}>
                            {a.name}
                          </span>
                          <span className="text-sm text-gray-700">{a.description}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {a.models.map((m) => (
                            <span key={m} className={`text-xs px-1.5 py-0.5 rounded ${COLOR_BADGE[category.color]}`}>{m}</span>
                          ))}
                          <span className="text-xs text-gray-400">Gr. {a.gradeRange}</span>
                          {!a.available && (
                            <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">Coming soon</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Materials + Start */}
          {assessment?.available && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Step 4: Gather Materials & Start</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-amber-800 mb-1">📦 You will need:</div>
                <ul className="text-sm text-amber-700 space-y-0.5">
                  {selectedAssessmentId === "schedule-2b" ? (
                    <>
                      <li>• Dice pattern cards</li>
                      <li>• Paper and pen</li>
                    </>
                  ) : selectedAssessmentId === "schedule-2c" ? (
                    <>
                      <li>• Task cards (number sentences for TG6)</li>
                      <li>• Counters — two colours (~30 of each)</li>
                      <li>• Two screens (small boards or folders)</li>
                    </>
                  ) : selectedAssessmentId === "av-pv" ? (
                    <>
                      <li>• 7 bundles of 10 sticks</li>
                      <li>• 15+ loose sticks</li>
                      <li>• Numeral task cards (63+21, 38+24, 57−34, 43−15, 257+30, 342+120, 672+151, 304−198)</li>
                      <li>• Cover / screen</li>
                    </>
                  ) : selectedAssessmentId === "schedule-3a" ? (
                    <>
                      <li>• Numeral task cards (two-digit, three-digit, four-digit, five-digit)</li>
                      <li>• Paper and marker pen for student (writing numerals task)</li>
                    </>
                  ) : (
                    <>
                      <li>• Numeral cards (0–100)</li>
                      <li>• Paper and pen for the student</li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={handleStart}
                disabled={!canStart}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-lg py-3 text-sm transition-colors"
              >
                {student
                  ? `Start ${assessment.name} for ${student.first_name} ${student.last_name} →`
                  : "Select a student to continue"}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense>
      <SelectContent />
    </Suspense>
  );
}
