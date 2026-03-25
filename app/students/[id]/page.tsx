export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";
import LevelChart, { ChartPoint, ModelDef } from "./LevelChart";
import SessionNotes from "./SessionNotes";
import DeleteSessionButton from "./DeleteSessionButton";
import { schedule2A } from "@/lib/assessments/schedule-2a";
import { schedule2B } from "@/lib/assessments/schedule-2b";
import { schedule2C } from "@/lib/assessments/schedule-2c";
import { scheduleAvPV } from "@/lib/assessments/schedule-av-pv";
import { scheduleAvNWN } from "@/lib/assessments/schedule-av-nwn";
import { scheduleAvSN } from "@/lib/assessments/schedule-av-sn";
import { scheduleAvAS } from "@/lib/assessments/schedule-av-as";
import { schedule3A } from "@/lib/assessments/schedule-3a";
import { schedule3B } from "@/lib/assessments/schedule-3b";
import { schedule3C } from "@/lib/assessments/schedule-3c";
import { schedule3D } from "@/lib/assessments/schedule-3d";

const gradeLabel = (g: number) =>
  g === 0 ? "Kindergarten" : `Grade ${g}`;

// ── Per-assessment config ──────────────────────────────────────────────────

const ASSESSMENT_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  modelDefs: ModelDef[];
}> = {
  "av-sn": {
    label: "Add+VantageMR: Structuring Numbers",
    subtitle: "SN · Spatial · Finger · Partitions · Doubles",
    modelDefs: [
      {
        key: "SN", color: "#ea580c", maxLevel: 5,
        labels: {
          0: "Emergent",
          1: "Perceptual Patterns",
          2: "Figurative Patterns",
          3: "Initial Structuring",
          4: "Intermediate Structuring",
          5: "Facile Structuring",
        },
      },
    ],
  },
  "av-as": {
    label: "Add+VantageMR: Addition & Subtraction",
    subtitle: "A&S · CAS · Counting Strategies",
    modelDefs: [
      {
        key: "CAS", color: "#2563eb", maxLevel: 5,
        labels: {
          0: "Emergent Counting",
          1: "Perceptual Counting",
          2: "Figurative Counting",
          3: "Initial Number Sequence",
          4: "Intermediate Number Sequence",
          5: "Facile Number Sequence",
        },
      },
    ],
  },
  "av-nwn": {
    label: "Add+VantageMR: Number Words and Numerals",
    subtitle: "NWN · FNWS · BNWS · NID",
    modelDefs: [
      {
        key: "FNWS", color: "#15803d", maxLevel: 5,
        labels: {
          0: "Emergent FNWS",
          1: "Initial FNWS to 'ten'",
          2: "Intermediate FNWS to 'ten'",
          3: "Facile FNWS to 'ten'",
          4: "Facile FNWS to 'thirty'",
          5: "Facile FNWS to 'one hundred'",
          6: "Facile FNWS up to 'one thousand'",
          7: "Facile FNWS up to 'ten thousand'",
        },
      },
      {
        key: "BNWS", color: "#4ade80", maxLevel: 5,
        labels: {
          0: "Emergent BNWS",
          1: "Initial BNWS to 'ten'",
          2: "Intermediate BNWS to 'ten'",
          3: "Facile BNWS to 'ten'",
          4: "Facile BNWS to 'thirty'",
          5: "Facile BNWS to 'one hundred'",
          6: "Facile BNWS up to 'one thousand'",
          7: "Facile BNWS up to 'ten thousand'",
        },
      },
      {
        key: "NID", color: "#22c55e", maxLevel: 5,
        labels: {
          0: "Emergent numeral identification",
          1: "Numerals to 10 — Identify",
          2: "Numerals to 20 — Identify",
          3: "Numerals to 100 — Identify",
          4: "Numerals to 1,000 — Identify & write",
          5: "Numerals to 1,000,000 — Identify",
        },
      },
    ],
  },
  "schedule-2a": {
    label: "Schedule 2A — Early Number Words and Numerals",
    subtitle: "2A · NID · FNWS · BNWS",
    modelDefs: [
      {
        key: "NID", color: "#22c55e", maxLevel: 4,
        labels: {
          0: "Emergent numeral identification",
          1: "Numerals to 10 — Identify",
          2: "Numerals to 20 — Identify",
          3: "Numerals to 100 — Identify",
          4: "Numerals to 1,000 — Identify & write",
        },
      },
      {
        key: "FNWS", color: "#15803d", maxLevel: 7,
        labels: {
          0: "Emergent FNWS",
          1: "Initial FNWS up to 'ten'",
          2: "Intermediate FNWS up to 'ten'",
          3: "Facile FNWS up to 'ten'",
          4: "Facile FNWS up to 'thirty'",
          5: "Facile FNWS up to 'one hundred'",
          6: "Facile FNWS up to 'one thousand'",
          7: "Facile FNWS up to 'ten thousand'",
        },
      },
      {
        key: "BNWS", color: "#4ade80", maxLevel: 7,
        labels: {
          0: "Emergent BNWS",
          1: "Initial BNWS up to 'ten'",
          2: "Intermediate BNWS up to 'ten'",
          3: "Facile BNWS up to 'ten'",
          4: "Facile BNWS up to 'thirty'",
          5: "Facile BNWS up to 'one hundred'",
          6: "Facile BNWS up to 'one thousand'",
          7: "Facile BNWS up to 'ten thousand'",
        },
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
  "schedule-2c": {
    label: "Schedule 2C — Early Arithmetical Strategies",
    subtitle: "2C · SEAL",
    modelDefs: [
      {
        key: "SEAL", color: "#ec4899", maxLevel: 5,
        labels: {
          0: "Emergent counting",
          1: "Perceptual counting",
          2: "Figurative counting",
          3: "Initial number sequence — Counting-on and -back",
          4: "Intermediate number sequence — Counting-down-to",
          5: "Facile number sequence — Non-count-by-ones strategies",
        },
      },
    ],
  },
  "av-pv": {
    label: "Add+VantageMR Place Value",
    subtitle: "PV · CPV",
    modelDefs: [
      {
        key: "CPV", color: "#0d9488", maxLevel: 5,
        labels: {
          0: "Emergent",
          1: "Tens or Ones",
          2: "Tens and Ones with Material",
          3: "Tens and Ones without Material",
          4: "Facile — Structuring to 100",
          5: "Facile — Structuring to 1000",
        },
      },
    ],
  },
  "schedule-3a": {
    label: "Schedule 3A — Number Words and Numerals",
    subtitle: "3A · NID · FNWS · BNWS",
    modelDefs: [
      {
        key: "NID", color: "#7c3aed", maxLevel: 6,
        labels: {
          0: "Emergent numeral identification",
          1: "Numerals to 10 — Identify",
          2: "Numerals to 20 — Identify",
          3: "Numerals to 100 — Identify",
          4: "Numerals to 1,000 — Identify & write",
          5: "Numerals to 10,000 — Identify & write",
          6: "Numerals to 100,000 — Identify & write",
        },
      },
      {
        key: "FNWS", color: "#8b5cf6", maxLevel: 7,
        labels: {
          0: "Emergent FNWS",
          1: "Initial FNWS up to 'ten'",
          2: "Intermediate FNWS up to 'ten'",
          3: "Facile FNWS up to 'ten'",
          4: "Facile FNWS up to 'thirty'",
          5: "Facile FNWS up to 'one hundred'",
          6: "Facile FNWS up to 'one thousand'",
          7: "Facile FNWS up to 'ten thousand'",
        },
      },
      {
        key: "BNWS", color: "#a78bfa", maxLevel: 7,
        labels: {
          0: "Emergent BNWS",
          1: "Initial BNWS up to 'ten'",
          2: "Intermediate BNWS up to 'ten'",
          3: "Facile BNWS up to 'ten'",
          4: "Facile BNWS up to 'thirty'",
          5: "Facile BNWS up to 'one hundred'",
          6: "Facile BNWS up to 'one thousand'",
          7: "Facile BNWS up to 'ten thousand'",
        },
      },
    ],
  },
  "schedule-3b": {
    label: "Schedule 3B — Structuring Numbers to 20",
    subtitle: "3B · SN20",
    modelDefs: [
      {
        key: "SN20", color: "#4f46e5", maxLevel: 7,
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
  "schedule-3c": {
    label: "Schedule 3C — Conceptual Place Value",
    subtitle: "3C · CPV",
    modelDefs: [
      {
        key: "CPV", color: "#0f766e", maxLevel: 4,
        labels: {
          0: "Emergent incrementing & decrementing by 10",
          1: "Incrementing & decrementing by 10, with materials, to 100",
          2: "Incrementing & decrementing flexibly by 10s and 1s, with materials, to 100",
          3: "Incrementing & decrementing by 10, without materials, to 100",
          4: "Incrementing & decrementing by 10, without materials, to 1000",
        },
      },
    ],
  },
  "schedule-3d": {
    label: "Schedule 3D — Addition & Subtraction to 100",
    subtitle: "3D · A&S",
    modelDefs: [
      {
        key: "A&S", color: "#ea580c", maxLevel: 6,
        labels: {
          0: "Emergent addition & subtraction to 100",
          1: "Add-up-from / subtract-down-to a decuple",
          2: "Add-up-to / subtract-down-from a decuple — small (1–5)",
          3: "Add-up-to / subtract-down-from a decuple — large (6–9)",
          4: "Add/subtract across a decuple",
          5: "2-digit addition with regrouping",
          6: "2-digit addition & subtraction with regrouping",
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

// ── Notes extraction ──────────────────────────────────────────────────────────

// Build a flat itemId → { prompt, groupName } lookup from any schedule
function buildItemLookup(assessmentId: string): Record<string, { prompt: string; groupName: string }> {
  const schedules: Record<string, { taskGroups: { name: string; items: { id: string; prompt: string }[] }[] }> = {
    "schedule-2a": schedule2A as never,
    "schedule-2b": schedule2B as never,
    "schedule-2c": schedule2C as never,
    "av-pv":       scheduleAvPV as never,
    "av-nwn":      scheduleAvNWN as never,
    "av-sn":       scheduleAvSN as never,
    "av-as":       scheduleAvAS as never,
    "schedule-3a": schedule3A as never,
    "schedule-3b": schedule3B as never,
    "schedule-3c": schedule3C as never,
    "schedule-3d": schedule3D as never,
  };
  const schedule = schedules[assessmentId];
  if (!schedule) return {};
  const lookup: Record<string, { prompt: string; groupName: string }> = {};
  for (const group of schedule.taskGroups) {
    for (const item of group.items) {
      lookup[item.id] = { prompt: item.prompt, groupName: group.name };
    }
  }
  return lookup;
}

type NoteEntry = { itemId: string; prompt: string; groupName: string; fields: { label: string; value: string }[] };

const SKIP_RESPONSE_FIELDS = new Set(["Response"]);
const SKIP_RESPONSE_VALUES = new Set(["correct", "incorrect"]);

function extractSessionNotes(rawResponses: unknown, assessmentId: string): NoteEntry[] {
  if (!rawResponses || typeof rawResponses !== "object") return [];
  const responses = rawResponses as Record<string, Record<string, string>>;
  const lookup = buildItemLookup(assessmentId);
  const result: NoteEntry[] = [];

  for (const [itemId, fields] of Object.entries(responses)) {
    if (!fields || typeof fields !== "object") continue;
    const entries: { label: string; value: string }[] = [];

    for (const [fieldName, value] of Object.entries(fields)) {
      if (SKIP_RESPONSE_FIELDS.has(fieldName)) continue;
      if (!value || SKIP_RESPONSE_VALUES.has(String(value))) continue;

      if (fieldName === "_slashed") {
        entries.push({ label: "Incorrect numbers", value: String(value).split(",").join(", ") });
      } else if (fieldName === "_student_said") {
        // legacy field — skip
      } else {
        entries.push({ label: fieldName, value: String(value) });
      }
    }

    if (entries.length > 0) {
      const info = lookup[itemId] ?? { prompt: `Item ${itemId}`, groupName: "" };
      result.push({ itemId, prompt: info.prompt, groupName: info.groupName, fields: entries });
    }
  }

  return result;
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
    .select("id, date_administered, status, assessment_id, created_at, raw_responses")
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

  // Show assessments in reverse order (highest/most recent schedule first)
  const assessmentIdsOrdered = Object.keys(ASSESSMENT_CONFIG).reverse();

  // Build chart data per assessment
  const chartsByAssessment: Record<string, ChartPoint[]> = {};
  for (const assessId of assessmentIdsOrdered) {
    const sessionsForAssess = sortedSessions.filter(
      (s) => s.assessment_id === assessId && (placementsBySession[s.id] ?? []).length > 0
    );
    chartsByAssessment[assessId] = sessionsForAssess.map((s, idx) => {
      const point: ChartPoint = {
        // Unique key per session so two sessions on the same calendar date
        // don't collide on the x-axis.  LevelChart's tickFormatter strips the suffix.
        date: `${s.date_administered}_${idx}`,
        fullDate: s.date_administered,   // raw "YYYY-MM-DD"; LevelChart formats it
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
    <div className="min-h-screen bg-slate-200">
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
              const assessCfg = ASSESSMENT_CONFIG[entry.assessmentId];
              const assessModelDef = assessCfg?.modelDefs.find((m) => m.key === model);
              const levelName = assessModelDef?.labels[entry.level] ?? ALL_MODEL_LEVELS[model]?.[entry.level] ?? `Level ${entry.level}`;
              const color = ALL_MODEL_COLORS[model] ?? "#6b7280";
              const assessType =
                entry.assessmentId.startsWith("av-") ? "Add+VantageMR" :
                entry.assessmentId.startsWith("schedule-") ? "LFIN" : "";
              return (
                <div key={model} className="rounded-xl border-2 p-3 bg-white"
                  style={{ borderColor: color }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{model}</div>
                    {assessType && (
                      <span className="text-xs font-medium text-gray-400">{assessType}</span>
                    )}
                  </div>
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{formatDate(session.date_administered)}</span>
                      <DeleteSessionButton sessionId={session.id} />
                    </div>
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

                  {/* Session notes — collapsible dropdown */}
                  <SessionNotes notes={extractSessionNotes(session.raw_responses, session.assessment_id)} />
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
