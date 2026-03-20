"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3A, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-3a";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_HEADER: Record<string, string> = {
  purple: "bg-purple-600 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  purple: "border-purple-200 bg-purple-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  purple: "bg-purple-100/60 text-purple-900",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function gradeLabel(g: number) { return g === 0 ? "K" : `${g}`; }

function groupBySubLevel(items: AssessmentItem[]) {
  const map = new Map<string, AssessmentItem[]>();
  items.forEach((item) => {
    if (!map.has(item.number)) map.set(item.number, []);
    map.get(item.number)!.push(item);
  });
  return Array.from(map.entries());
}

// ── Scoring helpers ───────────────────────────────────────────────────────────

function isCorrect(responses: Responses, itemId: string): boolean {
  return responses[itemId]?.Correct === "correct";
}

/** Highest target level at which the student scored ≥ 50% correct in a group */
function highestPassedLevel(responses: Responses, items: AssessmentItem[]): number {
  const byLevel = new Map<number, { correct: number; total: number }>();
  items.forEach((item) => {
    if (!byLevel.has(item.targetLevel)) byLevel.set(item.targetLevel, { correct: 0, total: 0 });
    const entry = byLevel.get(item.targetLevel)!;
    entry.total++;
    if (isCorrect(responses, item.id)) entry.correct++;
  });
  let highest = 0;
  byLevel.forEach(({ correct, total }, level) => {
    if (correct / total >= 0.5) highest = Math.max(highest, level);
  });
  return highest;
}

/** Highest target level at which the student succeeded on a sequence item */
function highestSequenceLevel(responses: Responses, items: AssessmentItem[]): number {
  let highest = 0;
  items.forEach((item) => {
    if (isCorrect(responses, item.id) && item.targetLevel > highest) {
      highest = item.targetLevel;
    }
  });
  return highest;
}

function calculateResults(responses: Responses) {
  const tg1 = schedule3A.taskGroups.find((g) => g.id === "tg1")!;
  const tg2 = schedule3A.taskGroups.find((g) => g.id === "tg2")!;
  const tg3 = schedule3A.taskGroups.find((g) => g.id === "tg3")!;
  const tg4 = schedule3A.taskGroups.find((g) => g.id === "tg4")!;
  const tg5 = schedule3A.taskGroups.find((g) => g.id === "tg5")!;
  const tg6 = schedule3A.taskGroups.find((g) => g.id === "tg6")!;

  const nidLevel = highestPassedLevel(responses, tg1.items);
  const writingLevel = highestPassedLevel(responses, tg2.items);
  const bnwsLevel = highestSequenceLevel(responses, tg3.items);
  const nwbLevel = highestPassedLevel(responses, tg4.items);
  const fnwsLevel = highestSequenceLevel(responses, tg5.items);
  const nwaLevel = highestPassedLevel(responses, tg6.items);

  // Combined NWS level = max of FNWS and BNWS sequence performance,
  // corroborated by NWA/NWB results
  const nwsCombinedLevel = Math.max(fnwsLevel, bnwsLevel);

  return {
    nidLevel,
    writingLevel,
    bnwsLevel,
    nwbLevel,
    fnwsLevel,
    nwaLevel,
    nwsCombinedLevel,
  };
}

// ── Main interview component ───────────────────────────────────────────────────

function InterviewContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent] = useState<Student | null>(null);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [responses, setResponses] = useState<Responses>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof calculateResults> | null>(null);

  const groups = schedule3A.taskGroups;
  const currentGroup = groups[currentGroupIdx];
  const isFirst = currentGroupIdx === 0;
  const isLast = currentGroupIdx === groups.length - 1;

  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("students")
      .select("id, first_name, last_name, grade_level")
      .eq("id", studentId)
      .single()
      .then(({ data }) => { if (data) setStudent(data); });
  }, [studentId]);

  function setResponse(itemId: string, field: string, value: string) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), [field]: value },
    }));
  }

  function getResponse(itemId: string, field: string) {
    return responses[itemId]?.[field] ?? "";
  }

  async function handleFinish() {
    if (!student) return;
    setSaving(true);
    const calc = calculateResults(responses);
    setResults(calc);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const today = new Date().toISOString().split("T")[0];

    const { data: sessionData } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "schedule-3a",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

    if (sessionData?.id) {
      const placements = [
        { model_name: "NID",  suggested_level: calc.nidLevel,  confirmed_level: calc.nidLevel },
        { model_name: "FNWS", suggested_level: calc.fnwsLevel, confirmed_level: calc.fnwsLevel },
        { model_name: "BNWS", suggested_level: calc.bnwsLevel, confirmed_level: calc.bnwsLevel },
      ].map((p) => ({
        session_id: sessionData.id,
        student_id: student.id,
        date_placed: today,
        ...p,
      }));

      await supabase.from("construct_placements").insert(placements);
    }

    setSaving(false);
    setDone(true);
  }

  // ── Results screen ────────────────────────────────────────────────────────────
  if (done && student && results) {
    const nidInfo  = schedule3A.nidLevels[results.nidLevel];
    const fnwsInfo = schedule3A.nwsLevels[results.fnwsLevel];
    const bnwsInfo = schedule3A.nwsLevels[results.bnwsLevel];

    const scoreRows = [
      { label: "TG1 — Numeral Identification (NID)",      value: `Level ${results.nidLevel}` },
      { label: "TG2 — Writing Numerals",                  value: `Level ${results.writingLevel}` },
      { label: "TG3 — Backward Number Word Sequences",    value: `Level ${results.bnwsLevel}` },
      { label: "TG4 — Number Words Before (BNWS support)", value: `Level ${results.nwbLevel}` },
      { label: "TG5 — Forward Number Word Sequences",     value: `Level ${results.fnwsLevel}` },
      { label: "TG6 — Number Words After (FNWS support)", value: `Level ${results.nwaLevel}` },
    ];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-lg shadow-sm">
          <div className="mb-5">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Assessment Complete</div>
            <p className="text-gray-500 text-sm mt-1">
              Schedule 3A — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
            </p>
          </div>

          {/* NID Placement */}
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placements</h3>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "NID", level: results.nidLevel, info: nidInfo },
              { label: "FNWS", level: results.fnwsLevel, info: fnwsInfo },
              { label: "BNWS", level: results.bnwsLevel, info: bnwsInfo },
            ].map(({ label, level, info }) => (
              <div key={label} className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">{label}</div>
                <div className="text-4xl font-black text-purple-700">{level}</div>
                <div className="text-purple-700 text-xs text-center leading-snug">{info?.name?.replace(/^Level \d+ — /, "") ?? ""}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
          <div className="space-y-1 text-sm mb-6">
            {scoreRows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between py-1.5 border-b border-gray-100 gap-2">
                <span className="text-gray-600 text-xs">{label}</span>
                <span className="font-semibold text-xs shrink-0 text-purple-700">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            * Suggested placement based on observed responses. Teacher judgment should confirm final level.
          </p>

          <div className="flex gap-3">
            <button onClick={() => router.push("/assess/select")}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm">
              Assess Another Student
            </button>
            <button onClick={() => router.push("/students")}
              className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-50">
              Back to Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  // ── Interview screen ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Exit</button>
          <div className="h-4 w-px bg-gray-200" />
          <span className="font-semibold text-gray-900 text-sm">{student.first_name} {student.last_name}</span>
          <span className="text-gray-400 text-sm">Grade {gradeLabel(student.grade_level)}</span>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-gray-500 text-sm">{schedule3A.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-purple-600" : i < currentGroupIdx ? "bg-purple-300" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials banner on first group */}
      {currentGroupIdx === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {schedule3A.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: Model levels + script */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — {currentGroup.model}
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Model levels */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">
                  {currentGroup.model === "NID" ? "Numeral Identification" : "Number Word Sequences"}
                </div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">{currentGroup.model} Levels</div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {(currentGroup.model === "NID" ? schedule3A.nidLevels : schedule3A.nwsLevels).map(({ level, name }) => (
                  <div key={level} className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0 mt-0.5">{level}</span>
                    <span className="text-xs leading-snug text-gray-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher script */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Teacher Script:</div>
              <div className="text-sm text-gray-800 italic">{currentGroup.teacherScript ?? currentGroup.instructions}</div>
              {currentGroup.materials && (
                <div className="text-xs text-gray-400 mt-2">📦 {currentGroup.materials}</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Scoring */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">✏️ Teacher Scoring — {currentGroup.name}</div>
            {currentGroup.branchingNote && (
              <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded px-2 py-1.5 mt-2 font-medium">
                ⚠️ {currentGroup.branchingNote}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groupBySubLevel(currentGroup.items).map(([subLevel, items]) => (
              <SubGroupSection
                key={subLevel}
                subLevel={subLevel}
                items={items}
                color={currentGroup.color}
                responses={responses}
                getResponse={getResponse}
                setResponse={setResponse}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setCurrentGroupIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <div className="text-xs text-gray-400">Tap dots above to jump</div>
            {isLast ? (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:bg-green-400"
              >
                {saving ? "Saving…" : "✓ Finish & Score"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentGroupIdx((i) => Math.min(groups.length - 1, i + 1))}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                Next Group →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-group section ──────────────────────────────────────────────────────────

function SubGroupSection({
  subLevel, items, color, responses, getResponse, setResponse,
}: {
  subLevel: string;
  items: AssessmentItem[];
  color: string;
  responses: Responses;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const correctCount = items.filter((item) => responses[item.id]?.Correct === "correct").length;
  const scored = items.filter((item) => responses[item.id]?.Correct).length;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${COLOR_SUBGROUP[color] ?? "border-gray-200 bg-gray-50/30"}`}>
      <div className={`px-3 py-2 flex items-center justify-between ${COLOR_SUBHEAD[color] ?? "bg-gray-100 text-gray-900"}`}>
        <span className="text-xs font-bold">{subLevel}</span>
        {scored > 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            correctCount / items.length >= 0.75 ? "bg-green-200 text-green-800" :
            correctCount / items.length >= 0.5  ? "bg-yellow-200 text-yellow-800" :
            "bg-red-100 text-red-700"
          }`}>
            {correctCount}/{items.length} ✓
          </span>
        )}
      </div>

      <div className="divide-y divide-white/60 bg-white/60">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            color={color}
            getResponse={getResponse}
            setResponse={setResponse}
          />
        ))}
      </div>

      {/* All Correct button */}
      {items.some((item) => item.responseFields.some((f) => f.type === "correct_incorrect")) && (
        <div className="px-3 py-2 bg-white/40 border-t border-white/60 flex justify-end">
          <button
            onClick={() => {
              items.forEach((item) => {
                item.responseFields.forEach((f) => {
                  if (f.type === "correct_incorrect") setResponse(item.id, f.label, "correct");
                });
              });
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-1.5"
          >
            ✓ All Correct
          </button>
        </div>
      )}
    </div>
  );
}

// ── Item row ───────────────────────────────────────────────────────────────────

function ItemRow({
  item, color, getResponse, setResponse,
}: {
  item: AssessmentItem;
  color: string;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="px-3 py-2">
      {/* Prompt row */}
      <div className="flex items-center gap-3 flex-wrap mb-2">
        {item.displayText && (
          <span className="text-2xl font-black text-gray-700 min-w-[3rem] text-center">
            {item.displayText}
          </span>
        )}
        <span className="text-sm text-gray-700 flex-1 min-w-0">{item.prompt}</span>
        <button
          onClick={() => setNotesOpen((v) => !v)}
          className={`text-base shrink-0 transition-opacity ${notesOpen ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
          title="Add note"
        >📝</button>
      </div>

      {/* Response fields */}
      <div className="flex flex-wrap gap-2 items-center">
        {item.responseFields.map((field) => (
          <span key={field.label} className="flex items-center gap-1">
            {field.type === "correct_incorrect" && (
              <InlineCorrectIncorrect
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
            {field.type === "fluency_scale" && field.options && (
              <FluencyPicker
                label={field.label}
                options={field.options}
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
          </span>
        ))}
      </div>

      {item.notes && (
        <div className="text-xs text-gray-400 mt-1 italic">{item.notes}</div>
      )}

      {/* Notes input */}
      {notesOpen && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Teacher observation…"
            value={getResponse(item.id, "notes")}
            onChange={(e) => setResponse(item.id, "notes", e.target.value)}
            className="w-full border border-purple-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-purple-400 bg-purple-50/40"
          />
        </div>
      )}
    </div>
  );
}

// ── Inline correct/incorrect ───────────────────────────────────────────────────

function InlineCorrectIncorrect({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {[
        { v: "correct",   label: "✓", active: "bg-green-100 border-green-400 text-green-700" },
        { v: "incorrect", label: "✗", active: "bg-red-100 border-red-400 text-red-700" },
      ].map(({ v, label, active }) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? "" : v)}
          className={`w-8 h-8 rounded-lg border-2 font-bold text-sm transition-colors ${
            value === v ? active : "border-gray-200 text-gray-400 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Fluency picker ────────────────────────────────────────────────────────────

function FluencyPicker({
  label, options, value, onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="text-xs text-gray-400 mr-0.5">{label}:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${
            value === opt
              ? "bg-purple-100 border-purple-400 text-purple-700"
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Page wrapper ───────────────────────────────────────────────────────────────

export default function Schedule3APage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
