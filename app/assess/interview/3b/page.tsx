"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3B, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-3b";
import InlineCorrectIncorrect from "@/components/InlineCorrectIncorrect";
import TeacherOverride from "@/components/TeacherOverride";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_HEADER: Record<string, string> = {
  indigo: "bg-indigo-600 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  indigo: "border-indigo-200 bg-indigo-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  indigo: "bg-indigo-100/60 text-indigo-900",
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

function countCorrect(responses: Responses, items: AssessmentItem[]): number {
  return items.filter((item) => isCorrect(responses, item.id)).length;
}

function calculateResults(responses: Responses) {
  const tg = (id: string) => schedule3B.taskGroups.find((g) => g.id === id)!;

  const tg1  = tg("tg1");
  const tg2  = tg("tg2");
  const tg3  = tg("tg3");
  const tg4  = tg("tg4");
  const tg5  = tg("tg5");
  const tg6  = tg("tg6");
  const tg7  = tg("tg7");
  const tg8  = tg("tg8");
  const tg9  = tg("tg9");
  const tg10 = tg("tg10");
  const tg11 = tg("tg11");
  const tg12 = tg("tg12");
  const tg13 = tg("tg13");

  const tg3_L2 = tg3.items.filter((i) => i.targetLevel === 2);
  const tg3_L3 = tg3.items.filter((i) => i.targetLevel === 3);

  const scores = {
    tg1:    countCorrect(responses, tg1.items),   // 6 items — Level 1
    tg2:    countCorrect(responses, tg2.items),   // 4 items — Level 2
    tg3_1:  countCorrect(responses, tg3_L2),      // 2 items — Level 2
    tg3_2:  countCorrect(responses, tg3_L3),      // 2 items — Level 3
    tg4:    countCorrect(responses, tg4.items),   // 3 items — Level 3
    tg5:    countCorrect(responses, tg5.items),   // 6 items — Level 3
    tg6:    countCorrect(responses, tg6.items),   // 4 items — Level 4
    tg7:    countCorrect(responses, tg7.items),   // 4 items — Level 7
    tg8:    countCorrect(responses, tg8.items),   // 8 items — Level 5
    tg9:    countCorrect(responses, tg9.items),   // 5 items — Level 5
    tg10:   countCorrect(responses, tg10.items),  // 3 items — Level 4
    tg11:   countCorrect(responses, tg11.items),  // 3 items — Level 5
    tg12:   countCorrect(responses, tg12.items),  // 3 items — Level 6
    tg13:   countCorrect(responses, tg13.items),  // 4 items — Level 7
  };

  // SN20 level: highest level with majority-correct evidence
  let sn20Level = 0;

  // Level 1 — TG1: ≥3/6 finger patterns correct
  if (scores.tg1 >= 3) sn20Level = Math.max(sn20Level, 1);

  // Level 2 — TG2 (≥2/4) OR TG3 small partitions (≥1/2)
  if (scores.tg2 >= 2 || scores.tg3_1 >= 1) sn20Level = Math.max(sn20Level, 2);

  // Level 3 — TG3 big partitions (≥1/2) OR TG4 (≥2/3) OR TG5 (≥3/6)
  if (scores.tg3_2 >= 1 || scores.tg4 >= 2 || scores.tg5 >= 3) sn20Level = Math.max(sn20Level, 3);

  // Level 4 — TG6 partitions 1-9 (≥2/4) OR TG10 Range 2 addition (≥2/3)
  if (scores.tg6 >= 2 || scores.tg10 >= 2) sn20Level = Math.max(sn20Level, 4);

  // Level 5 — TG8 ten-plus (≥4/8) OR TG9 big doubles (≥3/5) OR TG11 Range 3 add (≥2/3)
  if (scores.tg8 >= 4 || scores.tg9 >= 3 || scores.tg11 >= 2) sn20Level = Math.max(sn20Level, 5);

  // Level 6 — TG12 Range 3 subtraction (≥2/3)
  if (scores.tg12 >= 2) sn20Level = Math.max(sn20Level, 6);

  // Level 7 — TG7 partitions 11-20 (≥2/4) OR TG13 Range 4 (≥2/4)
  if (scores.tg7 >= 2 || scores.tg13 >= 2) sn20Level = Math.max(sn20Level, 7);

  return { sn20Level, scores };
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [isBorderline, setIsBorderline] = useState(false);

  const groups = schedule3B.taskGroups;
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
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill items above START HERE as correct/efficient when entering a group
  useEffect(() => {
    const group = groups[currentGroupIdx];
    if (!group.startAtItem) return;
    const subLevels = groupBySubLevel(group.items);
    const startIdx = subLevels.findIndex(([s]) => s === group.startAtItem);
    if (startIdx <= 0) return;
    setResponses((prev) => {
      const updated = { ...prev };
      for (let i = 0; i < startIdx; i++) {
        for (const item of subLevels[i][1]) {
          const existing = updated[item.id] ?? {};
          const itemUpdate: Record<string, string> = { ...existing };
          for (const field of item.responseFields) {
            if (!itemUpdate[field.label]) {
              if (field.type === "correct_incorrect") itemUpdate[field.label] = "correct";
              else if (field.type === "fluency_scale" && field.options?.length) itemUpdate[field.label] = field.options[0];
            }
          }
          updated[item.id] = itemUpdate;
        }
      }
      return updated;
    });
    setValidationError(null);
  }, [currentGroupIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Returns items required but unanswered (AT/BELOW startAtItem, or all if no startAtItem)
  function getRequiredButUnanswered(group: TaskGroup): AssessmentItem[] {
    const subLevels = groupBySubLevel(group.items);
    let startIdx = 0;
    if (group.startAtItem) {
      const found = subLevels.findIndex(([s]) => s === group.startAtItem);
      if (found >= 0) startIdx = found;
    }
    return subLevels
      .slice(startIdx)
      .flatMap(([, items]) => items)
      .filter((item) =>
        item.responseFields.some(
          (f) =>
            (f.type === "correct_incorrect" || f.type === "fluency_scale") &&
            !responses[item.id]?.[f.label]
        )
      );
  }

  function setResponse(itemId: string, field: string, value: string) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), [field]: value },
    }));
    if (validationError) setValidationError(null);
  }

  function getResponse(itemId: string, field: string) {
    return responses[itemId]?.[field] ?? "";
  }

  function handleTryNext() {
    const missing = getRequiredButUnanswered(currentGroup);
    if (missing.length > 0) {
      setValidationError(`Please answer all ${missing.length} required item${missing.length > 1 ? "s" : ""} before continuing.`);
      return;
    }
    setValidationError(null);
    setCurrentGroupIdx((i) => Math.min(groups.length - 1, i + 1));
  }

  function handleTryFinish() {
    const missing = getRequiredButUnanswered(currentGroup);
    if (missing.length > 0) {
      setValidationError(`Please answer all ${missing.length} required item${missing.length > 1 ? "s" : ""} before submitting.`);
      return;
    }
    setValidationError(null);
    handleFinish();
  }

  async function handleFinish() {
    if (!student) return;
    setSaving(true);
    const calc = calculateResults(responses);
    setResults(calc);

    // Set borderline flag (suggested level between 1 and maxLevel-1)
    setIsBorderline(calc.sn20Level > 0 && calc.sn20Level < 7);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "schedule-3b",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

      if (sessionData?.id) {
      setSavedSessionId(sessionData.id);
      await supabase.from("construct_placements").insert({
        session_id: sessionData.id,
        student_id: student.id,
        date_placed: today,
        model_name: "SN20",
        suggested_level: calc.sn20Level,
        confirmed_level: calc.sn20Level,
      });
      }

      setDone(true);
    } catch (err) {
      console.error("Failed to save assessment:", err);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Results screen ────────────────────────────────────────────────────────────
  if (done && student && results) {
    const sn20Info = schedule3B.sn20Levels[results.sn20Level];
    const s = results.scores;

    const scoreRows = [
      { label: "TG1 — Finger Patterns (6–10)",          value: `${s.tg1}/6`,  level: 1 },
      { label: "TG2 — Small Doubles",                   value: `${s.tg2}/4`,  level: 2 },
      { label: "TG3.1 — Small Partitions of 10",        value: `${s.tg3_1}/2`, level: 2 },
      { label: "TG3.2 — Big Partitions of 10",          value: `${s.tg3_2}/2`, level: 3 },
      { label: "TG4 — Partitions of 5",                 value: `${s.tg4}/3`,  level: 3 },
      { label: "TG5 — Five-plus Facts",                 value: `${s.tg5}/6`,  level: 3 },
      { label: "TG6 — Partitions 1–9",                  value: `${s.tg6}/4`,  level: 4 },
      { label: "TG7 — Partitions 11–20",                value: `${s.tg7}/4`,  level: 7 },
      { label: "TG8 — Ten-plus & Teen+10",              value: `${s.tg8}/8`,  level: 5 },
      { label: "TG9 — Big Doubles",                     value: `${s.tg9}/5`,  level: 5 },
      { label: "TG10 — Range 2 Addition (Whole ≤ 10)",  value: `${s.tg10}/3`, level: 4 },
      { label: "TG11 — Range 3 Addition (Parts ≤ 10)",  value: `${s.tg11}/3`, level: 5 },
      { label: "TG12 — Range 3 Subtraction (Parts ≤ 10)", value: `${s.tg12}/3`, level: 6 },
      { label: "TG13 — Range 4 (Whole ≤ 20)",          value: `${s.tg13}/4`, level: 7 },
    ];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-lg shadow-sm">
          <div className="mb-5">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Assessment Complete</div>
            <p className="text-gray-500 text-sm mt-1">
              Schedule 3B — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
            </p>
          </div>

          {isBorderline && (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 mb-4 flex gap-2 items-start">
              <span className="text-orange-500 text-sm">🔍</span>
              <p className="text-xs text-orange-700 leading-snug">
                <strong>Review before finalizing:</strong> Some task groups show borderline results.
                Consider the full evidence below — your professional judgment may call for a different level.
              </p>
            </div>
          )}

          {/* SN20 Placement */}
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
          <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 flex flex-col items-center gap-2 mb-5">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">SN20 Level</div>
            <div className="text-4xl font-black text-indigo-700">{results.sn20Level}</div>
            <div className="text-indigo-700 text-xs text-center leading-snug">{sn20Info?.name ?? ""}</div>
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
          <div className="space-y-1 text-sm mb-6">
            {scoreRows.map(({ label, value, level }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 gap-2">
                <span className="text-gray-600 text-xs flex-1">{label}</span>
                <span className="text-xs text-gray-400 shrink-0">L{level}</span>
                <span className="font-semibold text-xs shrink-0 text-indigo-700 w-10 text-right">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            * Suggested placement based on observed responses. Teacher judgment should confirm final level.
          </p>

          {savedSessionId && (
            <TeacherOverride
              sessionId={savedSessionId}
              modelName="SN20"
              suggestedLevel={results.sn20Level}
              maxLevel={7}
              levelLabels={Object.fromEntries(
                Object.entries(schedule3B.sn20Levels).map(([k, v]) => [Number(k), v.name])
              )}
            />
          )}

          <div className="flex gap-3 mt-4">
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
          <span className="text-gray-500 text-sm">{schedule3B.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-indigo-600" : i < currentGroupIdx ? "bg-indigo-300" : "bg-gray-200"
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
          {schedule3B.materials.map((m) => (
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
                <div className="text-sm font-bold text-gray-700">Structuring Numbers to 20</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">SN20 Levels</div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {schedule3B.sn20Levels.map(({ level, name }) => (
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

            {/* Counting reminder */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-3">
              <div className="text-xs text-indigo-700 leading-snug">
                <span className="font-semibold">If student counts:</span> Ask "Can you do it without counting?" If they can only count, stop the task group.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Scoring */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">✏️ Teacher Scoring — {currentGroup.name}</div>
            {currentGroup.branchingNote && (
              <div className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1.5 mt-2 font-medium">
                {currentGroup.branchingNote}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groupBySubLevel(currentGroup.items).map(([subLevel, items]) => {
              const isStartHere = !!currentGroup.startAtItem && subLevel === currentGroup.startAtItem;
              const startNote = isStartHere ? (currentGroup.startNote ?? null) : null;
              return (
                <SubGroupSection
                  key={subLevel}
                  subLevel={subLevel}
                  items={items}
                  color={currentGroup.color}
                  responses={responses}
                  getResponse={getResponse}
                  setResponse={setResponse}
                  isFirst={isStartHere}
                  startNote={startNote}
                />
              );
            })}
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <p className="text-xs text-red-600 font-medium">⚠ {validationError}</p>
            </div>
          )}

          {saveError && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200">
              <p className="text-xs text-red-600 font-medium">⚠ {saveError}</p>
            </div>
          )}

          {/* Early-exit note */}
          {currentGroup.allowEarlyExit && (
            <div className="px-4 py-2 bg-orange-50 border-t border-orange-200">
              <p className="text-xs text-orange-700 font-medium">⚠ {currentGroup.earlyExitNote}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => { setValidationError(null); setCurrentGroupIdx((i) => Math.max(0, i - 1)); }}
              disabled={isFirst}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <div className="text-xs text-gray-400">Tap dots above to jump</div>
            <div className="flex gap-2">
              {currentGroup.allowEarlyExit && (
                <button
                  onClick={handleTryFinish}
                  disabled={saving}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Saving…" : "End Assessment Here"}
                </button>
              )}
              {isLast ? (
                <button
                  onClick={handleTryFinish}
                  disabled={saving}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:bg-green-400"
                >
                  {saving ? "Saving…" : "✓ Finish & Score"}
                </button>
              ) : (
                <button
                  onClick={handleTryNext}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                  Next Group →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-group section ──────────────────────────────────────────────────────────

function SubGroupSection({
  subLevel, items, color, responses, getResponse, setResponse, isFirst, startNote,
}: {
  subLevel: string;
  items: AssessmentItem[];
  color: string;
  responses: Responses;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
  isFirst?: boolean;
  startNote?: string | null;
}) {
  const correctCount = items.filter((item) => responses[item.id]?.Correct === "correct").length;
  const scored = items.filter((item) => responses[item.id]?.Correct).length;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${COLOR_SUBGROUP[color] ?? "border-gray-200 bg-gray-50/30"}`}>
      {isFirst && (
        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
          <span>▶</span> START HERE
          {startNote && <span className="ml-2 font-normal text-green-100">— {startNote}</span>}
        </div>
      )}
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
            className="w-full border border-indigo-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400 bg-indigo-50/40"
          />
        </div>
      )}
    </div>
  );
}

// ── Inline correct/incorrect ───────────────────────────────────────────────────


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
              ? "bg-indigo-100 border-indigo-400 text-indigo-700"
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

export default function Schedule3BPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
