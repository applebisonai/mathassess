"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/nav";
import { Suspense } from "react";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

const GRADE_LABEL = (g: number) => (g === 0 ? "K" : `${g}`);

const AVAILABLE_ASSESSMENTS = [
  {
    id: "schedule-2a",
    name: "Schedule 2A: Early Number Words & Numerals",
    shortName: "2A",
    gradeRange: "K–1",
    description: "Assesses FNWS, BNWS, and Numeral Identification",
    models: ["FNWS", "BNWS", "NID"],
    color: "blue",
    route: "/assess/interview/2a",
  },
];

function SelectContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedAssessment, setSelectedAssessment] = useState("schedule-2a");
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

  function handleStart() {
    if (!selectedStudent || !selectedAssessment) return;
    const assess = AVAILABLE_ASSESSMENTS.find((a) => a.id === selectedAssessment);
    if (!assess) return;
    router.push(`${assess.route}?student=${selectedStudent}`);
  }

  const student = students.find((s) => s.id === selectedStudent);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName="" />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Start an Assessment</h1>
          <p className="text-gray-500 text-sm">
            Select a student and choose which assessment to administer.
          </p>
        </div>

        <div className="space-y-4">
          {/* Student Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Step 1: Select Student</h2>
            {loading ? (
              <div className="text-gray-400 text-sm">Loading students…</div>
            ) : students.length === 0 ? (
              <div className="text-gray-400 text-sm">
                No students found.{" "}
                <a href="/students/add" className="text-blue-600 underline">
                  Add a student first.
                </a>
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
                    <div className="font-medium">
                      {s.first_name} {s.last_name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Grade {GRADE_LABEL(s.grade_level)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assessment Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Step 2: Choose Assessment</h2>
            <div className="space-y-2">
              {AVAILABLE_ASSESSMENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAssessment(a.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedAssessment === a.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{a.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{a.description}</div>
                      <div className="flex gap-1 mt-2">
                        {a.models.map((m) => (
                          <span
                            key={m}
                            className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded ml-4">
                      Gr. {a.gradeRange}
                    </span>
                  </div>
                </button>
              ))}
              <div className="text-xs text-gray-400 text-center py-2">
                More assessments (2B, 2C, 3A–3F) coming soon…
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Step 3: Gather Materials</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="text-sm font-medium text-amber-800 mb-1">
                📦 You will need:
              </div>
              <ul className="text-sm text-amber-700 space-y-0.5">
                <li>• Numeral cards (0–100)</li>
                <li>• Paper and pen for the student</li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              disabled={!selectedStudent || !selectedAssessment}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-lg py-3 text-sm transition-colors"
            >
              {selectedStudent && student
                ? `Start Assessment for ${student.first_name} ${student.last_name} →`
                : "Select a student to continue"}
            </button>
          </div>
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
