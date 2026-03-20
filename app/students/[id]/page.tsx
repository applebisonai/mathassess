import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";
import LevelChart, { ChartPoint, ModelDef } from "./LevelChart";

const gradeLabel = (g: number) =>
  g === 0 ? "Kindergarten" : `Grade ${g}`;

// ── Per-assessment config ──────────────────────────────────────────────────

const ASSESSMENT_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  modelDefs: ModelDef[];
}> = {
  "schedule-2a": {
    label: "Schedule 2A — Early Number Words and Numerals",
    subtitle: "2A · NID · FNWS · BNWS",
    modelDefs: [
      {
        key: "NID", color: "#22c55e", maxLevel: 4,
        labels: { 0: "Emergent", 1: "Numerals to 10", 2: "Numerals to 20", 3: "Numerals to 100", 4: "Numerals to 1,000" },
      },
      {
        key: "FNWS", color: "#15803d", maxLevel: 7,
        labels: { 0: "Emergent", 1: "Initial to 'ten'", 2: "Intermediate to 'ten'", 3: "Facile to 'ten'", 4: "Facile to 'thirty'", 5: "Facile to 'hundred'", 6: "Facile to 'thousand'", 7: "Facile to 'ten thousand'" },
      },
      {
        key: "BNWS", color: "#4ade80", maxLevel: 5,
        labels: { 0: "Emergent", 1: "Initial to 'ten'", 2: "Intermediate to 'ten'", 3: "Facile to 'ten'", 4: "Facile to 'thirty'", 5: "Facile to 'hundred'" },
      },
    ],
  },
  "schedule-2b": {
    label: "Schedule 2B — Early Structuring",
    subtitle: "2B · SN20",
    modelDefs: [
      {
        key: "SN20", color: "#eab308", maxLevel: 7,
        labels: {
          0: "Emergent spatial patterns and finger patterns",
          1: "Finger patterns 1–5 and spatial patterns 1–6",
          2: "Small doubles and small partitions of 10",
          3: "Five-plus and partitions of 5",
          4: "Facile structuring numbers 1 to 10",
          5: "Formal addition (parts ≤ 10)",
          6: "Formal addition & subtraction (parts ≤ 10)",
          7: "Formal addition & subtraction (whole ≤ 20)",
        },
      },
    ],
  },
};

// All known model → level name mappings (for history cards)
const ALL_MODEL_LEVELS: Record<string, Record<number, string>> = Object.fromEntries(
  Object.values(ASSESSMENT_CONFIG).flatMap((cfg) =>
    cfg.modelDefs.map((m) => [m.key, m.labels])
  )
);

const ALL_MODEL_COLORS: Record<string, string> = Object.fromEntries(
  Object.values(ASSESSMENT_CONFIG).flatMap((cfg) =>
    cfg.modelDefs.map((m) => [m.key, m.color])
  )
);

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

  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name, grade_level, created_at")
    .eq("id", params.id)
    .eq("teacher_id", user.id)
    .single();

  if (!student) notFound();

  const { data: sessions } = await supabase
    .from("assessment_sessions")
    .select("id, date_administered, status, assessment_id, created_at")
    .eq("student_id", student.id)
    .order("date_administered", { ascending: false });

  const { data: placements } = await supabase
    .from("construct_placements")
    .select("id, session_id, model_name, confirmed_level, suggested_level, date_placed")
    .eq("student_id", student.id)
    .order("date_placed", { ascending: false });

  // Most recent level per model (across all assessments)
  const currentLevels: Record<string, { level: number; date: string; assessmentId: string }> = {};
  const sessionAssessmentMap: Record<string, string> = {};
  for (const s of sessions ?? []) sessionAssessmentMap[s.id] = s.assessment_id;

  for (const p of placements ?? []) {
    const level = p.confirmed_level ?? p.suggested_level;
    if (level !== null && level !== undefined && !(p.model_name in currentLevels)) {
      currentLevels[p.model_name] = {
        level, date: p.date_placed,
        assessmentId: sessionAssessmentMap[p.session_id] ?? "",
      };
    }
  }

  // Group placements by session
  const placementsBySession: Record<string, typeof placements> = {};
  for (const p of placements ?? []) {
    if (!placementsBySession[p.session_id]) placementsBySession[p.session_id] = [];
    placementsBySession[p.session_id]!.push(p);
  }

  // Build per-assessment chart data (sorted chronologically)
  const sortedSessions = [...(sessions ?? [])].sort(
    (a, b) => new Date(a.date_administered).getTime() - new Date(b.date_administered).getTime()
  );

  // Always show all configured assessments in defined order
  const assessmentIdsOrdered = Object.keys(ASSESSMENT_CONFIG);

  // Build chart data per assessment
  const chartsByAssessment: Record<string, ChartPoint[]> = {};
  for (const assessId of assessmentIdsOrdered) {
    const sessionsForAssess = sortedSessions.filter(
      (s) => s.assessment_id === assessId && (placementsBySession[s.id] ?? []).length > 0
    );
    chartsByAssessment[assessId] = sessionsForAssess.map((s) => {
      const d = new Date(s.date_administered);
      const point: ChartPoint = {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      };
      for (const p of placementsBySession[s.id] ?? []) {
        const level = p.confirmed_level ?? p.suggested_level;
        if (level !== null && level !== undefined) point[p.model_name] = level;
      }
      return point;
    });
  }

  const teacherName = user.email?.split("@")[0] ?? "Teacher";
  const allModels = Object.keys(currentLevels);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName={teacherName} />
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Back */}
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
              <p className="text-gray-400 text-xs mt-1">Added {formatDate(student.created_at)}</p>
            </div>
            <Link
              href={`/assess/select?student=${student.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + New Assessment
            </Link>
          </div>
        </div>

        {/* Progress charts — one per assessment, always shown */}
        <div className="mb-2">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Progress Over Time</h2>
          {assessmentIdsOrdered.map((assessId) => {
            const cfg = ASSESSMENT_CONFIG[assessId];
            if (!cfg) return null;
            return (
              <LevelChart
                key={assessId}
                title={cfg.label}
                subtitle={cfg.subtitle}
                data={chartsByAssessment[assessId] ?? []}
                modelDefs={cfg.modelDefs}
              />
            );
          })}
        </div>

        {/* Current levels */}
        <h2 className="text-base font-semibold text-gray-700 mb-3">Current Levels</h2>
        {allModels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {allModels.map((model) => {
              const entry = currentLevels[model];
              const levelName = ALL_MODEL_LEVELS[model]?.[entry.level] ?? `Level ${entry.level}`;
              const color = ALL_MODEL_COLORS[model] ?? "#6b7280";
              return (
                <div key={model} className="rounded-xl border-2 p-3 bg-white"
                  style={{ borderColor: color }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color }}>{model}</div>
                  <div className="text-2xl font-black mb-0.5" style={{ color }}>{entry.level}</div>
                  <div className="text-xs text-gray-600 leading-snug">{levelName}</div>
                  <div className="text-xs text-gray-400 mt-1.5">as of {formatDate(entry.date)}</div>
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
              const cfg = ASSESSMENT_CONFIG[session.assessment_id];
              const modelOrder = cfg?.modelDefs.map((m) => m.key) ?? [];
              const rawPlacements = placementsBySession[session.id] ?? [];
              const sessionPlacements = [...rawPlacements].sort((a, b) => {
                const ai = modelOrder.indexOf(a.model_name);
                const bi = modelOrder.indexOf(b.model_name);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
              });
              const assessLabel = cfg?.label ?? session.assessment_id;
              return (
                <div key={session.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{assessLabel}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
                          ? (ALL_MODEL_LEVELS[p.model_name]?.[level] ?? `Level ${level}`)
                          : "—";
                        const color = ALL_MODEL_COLORS[p.model_name] ?? "#6b7280";
                        return (
                          <div key={p.id}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium bg-white"
                            style={{ borderColor: color, color }}>
                            <span className="font-bold">{p.model_name}</span>
                            <span className="text-gray-600">
                              {level !== null && level !== undefined ? `${level} — ${levelName}` : "—"}
                            </span>
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
