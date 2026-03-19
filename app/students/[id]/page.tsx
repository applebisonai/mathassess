import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

const gradeLabel = (g: number) =>
  g === 0 ? "Kindergarten" : `Grade ${g}`;

const fnwsLevels: Record<number, string> = {
  0: "Emergent FNWS",
  1: "Initial FNWS to 'ten'",
  2: "Intermediate FNWS to 'ten'",
  3: "Facile FNWS to 'ten'",
  4: "Facile FNWS to 'thirty'",
  5: "Facile FNWS to 'one hundred'",
  6: "Facile FNWS to 'one thousand'",
  7: "Facile FNWS to 'ten thousand'",
};

const bnwsLevels: Record<number, string> = {
  0: "Emergent BNWS",
  1: "Initial BNWS to 'ten'",
  2: "Intermediate BNWS to 'ten'",
  3: "Facile BNWS to 'ten'",
  4: "Facile BNWS to 'thirty'",
  5: "Facile BNWS to 'one hundred'",
};

const nidLevels: Record<number, string> = {
  0: "Emergent NID",
  1: "Numerals to 10",
  2: "Numerals to 20",
  3: "Numerals to 100",
  4: "Numerals to 1,000",
};

const modelLevels: Record<string, Record<number, string>> = {
  FNWS: fnwsLevels,
  BNWS: bnwsLevels,
  NID: nidLevels,
};

const modelColors: Record<string, string> = {
  FNWS: "bg-blue-50 border-blue-200 text-blue-700",
  BNWS: "bg-purple-50 border-purple-200 text-purple-700",
  NID:  "bg-green-50 border-green-200 text-green-700",
};

const modelBadge: Record<string, string> = {
  FNWS: "bg-blue-100 text-blue-700",
  BNWS: "bg-purple-100 text-purple-700",
  NID:  "bg-green-100 text-green-700",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default async function StudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch student
  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name, grade_level, created_at")
    .eq("id", params.id)
    .eq("teacher_id", user.id)
    .single();

  if (!student) notFound();

  // Fetch all assessment sessions for this student
  const { data: sessions } = await supabase
    .from("assessment_sessions")
    .select("id, date_administered, status, assessment_id, created_at")
    .eq("student_id", student.id)
    .order("date_administered", { ascending: false });

  // Fetch all construct placements for this student
  const { data: placements } = await supabase
    .from("construct_placements")
    .select("id, session_id, model_name, confirmed_level, suggested_level, date_placed")
    .eq("student_id", student.id)
    .order("date_placed", { ascending: false });

  // Get most recent level per model
  const currentLevels: Record<string, { level: number; date: string }> = {};
  for (const p of placements ?? []) {
    const level = p.confirmed_level ?? p.suggested_level;
    if (level !== null && level !== undefined && !(p.model_name in currentLevels)) {
      currentLevels[p.model_name] = { level, date: p.date_placed };
    }
  }

  // Group placements by session
  const placementsBySession: Record<string, typeof placements> = {};
  for (const p of placements ?? []) {
    if (!placementsBySession[p.session_id]) placementsBySession[p.session_id] = [];
    placementsBySession[p.session_id]!.push(p);
  }

  const teacherName = user.email?.split("@")[0] ?? "Teacher";

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName={teacherName} />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Back link */}
        <Link href="/students" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-flex items-center gap-1">
          ← My Students
        </Link>

        {/* Student header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 mt-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {student.first_name} {student.last_name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">{gradeLabel(student.grade_level)}</p>
              <p className="text-gray-400 text-xs mt-1">
                Added {formatDate(student.created_at)}
              </p>
            </div>
            <Link
              href={`/assess/select?student=${student.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + New Assessment
            </Link>
          </div>
        </div>

        {/* Current levels */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">Current Levels</h2>
        {Object.keys(currentLevels).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {["FNWS", "BNWS", "NID"].map((model) => {
              const entry = currentLevels[model];
              const levelName = entry
                ? (modelLevels[model]?.[entry.level] ?? `Level ${entry.level}`)
                : null;
              return (
                <div
                  key={model}
                  className={`rounded-xl border p-4 ${entry ? modelColors[model] : "bg-gray-50 border-gray-200 text-gray-400"}`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${entry ? "" : "text-gray-400"}`}>
                    {model}
                  </div>
                  {entry ? (
                    <>
                      <div className="text-2xl font-bold mb-0.5">{entry.level}</div>
                      <div className="text-xs font-medium leading-snug">{levelName}</div>
                      <div className="text-xs mt-2 opacity-70">as of {formatDate(entry.date)}</div>
                    </>
                  ) : (
                    <div className="text-sm mt-1">Not yet assessed</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm mb-8">
            No levels recorded yet. Complete an assessment to see results here.
          </div>
        )}

        {/* Assessment history */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">Assessment History</h2>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => {
              const sessionPlacements = placementsBySession[session.id] ?? [];
              return (
                <div key={session.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {session.assessment_id === "schedule-2a" ? "Schedule 2A — Early Number Words & Numerals" : session.assessment_id}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                        session.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {session.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(session.date_administered)}</span>
                  </div>

                  {sessionPlacements.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sessionPlacements.map((p) => {
                        const level = p.confirmed_level ?? p.suggested_level;
                        const levelName = level !== null && level !== undefined
                          ? (modelLevels[p.model_name]?.[level] ?? `Level ${level}`)
                          : "—";
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium ${modelColors[p.model_name] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}
                          >
                            <span className={`px-1.5 py-0.5 rounded font-bold text-xs ${modelBadge[p.model_name] ?? "bg-gray-100 text-gray-600"}`}>
                              {p.model_name}
                            </span>
                            <span>{level !== null && level !== undefined ? `${level} — ` : ""}{levelName}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No level placements recorded for this session.</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            No assessments on record yet.
          </div>
        )}
      </main>
    </div>
  );
}
