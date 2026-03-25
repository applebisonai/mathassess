import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

const MODEL_COLORS: Record<string, string> = {
  "NID": "#22c55e",
  "FNWS": "#15803d",
  "BNWS": "#4ade80",
  "SEAL": "#f97316",
  "SN20": "#ef4444",
  "CPV": "#8b5cf6",
  "A&S": "#0ea5e9",
  "CAS": "#2563eb",
  "SN": "#ea580c",
  "M&D": "#d97706",
  "EM&D": "#f59e0b",
  "MBF": "#ec4899",
};

const MODELS = ["NID", "FNWS", "BNWS", "SEAL", "SN20", "CPV", "A&S", "CAS", "SN", "M&D", "EM&D", "MBF"];

function getLevelColor(level: number | null | undefined): string {
  if (level === null || level === undefined) return "bg-gray-100 text-gray-500";
  if (level <= 1) return "bg-red-100 text-red-700";
  if (level <= 3) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const teacherName = user.email?.split("@")[0] ?? "Teacher";

  // Fetch all active students
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, grade_level")
    .eq("is_active", true)
    .order("last_name")
    .order("grade_level");

  // Fetch all placements
  const { data: allPlacements } = await supabase
    .from("construct_placements")
    .select("student_id, model_name, confirmed_level, suggested_level, date_placed")
    .order("date_placed", { ascending: false });

  // Build a map of latest level per student per model
  const latestLevels: Record<string, Record<string, number>> = {};
  const seenPlacements: Set<string> = new Set();

  for (const placement of allPlacements ?? []) {
    const key = `${placement.student_id}-${placement.model_name}`;
    if (!seenPlacements.has(key)) {
      if (!latestLevels[placement.student_id]) {
        latestLevels[placement.student_id] = {};
      }
      const level = placement.confirmed_level ?? placement.suggested_level;
      if (level !== null && level !== undefined) {
        latestLevels[placement.student_id][placement.model_name] = level;
      }
      seenPlacements.add(key);
    }
  }

  const GRADE_LABEL = (g: number) => (g === 0 ? "K" : `${g}`);

  return (
    <div className="min-h-screen bg-slate-200">
      <Nav teacherName={teacherName} />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Overview</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              All students and their latest assessment levels
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Student</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-700 w-12">Grade</th>
                {MODELS.map((model) => (
                  <th
                    key={model}
                    className="px-3 py-3 text-center font-semibold text-gray-700 w-16"
                    style={{ color: MODEL_COLORS[model] || "#6b7280" }}
                  >
                    {model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(students ?? []).map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10">
                    <Link
                      href={`/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {student.first_name} {student.last_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-600">
                    {GRADE_LABEL(student.grade_level)}
                  </td>
                  {MODELS.map((model) => {
                    const level = latestLevels[student.id]?.[model];
                    return (
                      <td key={`${student.id}-${model}`} className="px-3 py-3 text-center">
                        {level !== undefined ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-semibold ${getLevelColor(level)}`}
                          >
                            {level}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
          <div className="font-semibold text-gray-700 mb-2">Color Legend:</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-red-100"></span>
              <span>Level 0–1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-yellow-100"></span>
              <span>Level 2–3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-green-100"></span>
              <span>Level 4+</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
