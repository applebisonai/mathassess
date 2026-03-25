"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/nav";
import { ASSESSMENT_CATALOG } from "@/lib/assessments/catalog";
import { gradeLabel } from "@/lib/utils";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

const COLOR_SELECTED: Record<string, string> = {
  blue:   "border-blue-500 bg-blue-50",
  green:  "border-green-500 bg-green-50",
  purple: "border-purple-500 bg-purple-50",
  orange: "border-orange-500 bg-orange-50",
  teal:   "border-teal-500 bg-teal-50",
};
const COLOR_BADGE: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700",
  teal:   "bg-teal-100 text-teal-700",
};

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
        .eq("is_active", true)
        .order("last_name");
      if (data) setStudents(data);
      if (preSelectedStudent) setSelectedStudent(preSelectedStudent);
      setLoading(false);
    }
    loadStudents();
  }, [preSelectedStudent]); // eslint-disable-line react-hooks/exhaustive-deps

  const category = ASSESSMENT_CATALOG.find((c) => c.id === selectedCategory);
  const assessment = category?.assessments.find((a) => a.id === selectedAssessmentId);
  const student = students.find((s) => s.id === selectedStudent);
  const canStart = selectedStudent && assessment?.available;

  function handleStart() {
    if (!selectedStudent || !assessment?.route) return;
    router.push(`${assessment.route}?student=${selectedStudent}`);
  }

  return (
    <div className="min-h-screen bg-slate-200">
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
                    <div className="text-xs text-gray-400 mt-0.5">Grade {gradeLabel(s.grade_level)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Step 2: Choose Assessment Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {ASSESSMENT_CATALOG.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedAssessmentId(""); }}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedCategory === cat.id
                      ? COLOR_SELECTED[cat.color]
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

          {/* STEP 3: Specific Assessment */}
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
                          ? `border-2 ${COLOR_SELECTED[category.color]}`
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
                  {(assessment.materials ?? ["Numeral cards (0–100)", "Paper and pen for the student"]).map((m) => (
                    <li key={m}>• {m}</li>
                  ))}
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
