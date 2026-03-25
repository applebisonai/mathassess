"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3C, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-3c";
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
  teal: "bg-teal-600 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  teal: "border-teal-200 bg-teal-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  teal: "bg-teal-100/60 text-teal-900",
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
  const val = responses[itemId]?.Correct;
  return val === "correct";
}

function isNotAttempted(responses: Responses, itemId: string): boolean {
  return responses[itemId]?.Correct === "not_attempted";
}

function countCorrect(responses: Responses, items: AssessmentItem[]): number {
  return items.filter((item) => !isNotAttempted(responses, item.id) && isCorrect(responses, item.id)).length;
}

function calculateResults(responses: Responses) {
  const tg = (id: string) => schedule3C.taskGroups.find((g) => g.id === id)!;

  const tg1 = tg("tg1"); // 11 items — Level 1
  const tg2 = tg("tg2"); // 8 items  — Level 1
  const tg3 = tg("tg3"); // 7 items  — Level 1
  const tg4 = tg("tg4"); // 13 items — Level 2
  const tg5 = tg("tg5"); // 8 items  — Level 3/4
  const tg6 = tg("tg6"); // 7 items  — Level 3/4
  const tg7 = tg("tg7"); // 4 items  — Level 4
  const tg8 = tg("tg8"); // 12 items — Level 4

  const tg4_seq1 = tg4.items.filter((i) => i.number === "Sequence 1");   // 8 items
  const tg5_L3   = tg5.items.filter((i) => i.targetLevel === 3);          // 4 items
  const tg5_L4   = tg5.items.filter((i) => i.targetLevel === 4);          // 4 items
  const tg6_L3   = tg6.items.filter((i) => i.targetLevel === 3);          // 4 items
  const tg6_L4   = tg6.items.filter((i) => i.targetLevel === 4);          // 3 items

  const scores = {
    tg1:      countCorrect(responses, tg1.items),
    tg2:      countCorrect(responses, tg2.items),
    tg3:      countCorrect(responses, tg3.items),
    tg4_seq1: countCorrect(responses, tg4_seq1),
    tg5_L3:   countCorrect(responses, tg5_L3),
    tg5_L4:   countCorrect(responses, tg5_L4),
    tg6_L3:   countCorrect(responses, tg6_L3),
    tg6_L4:   countCorrect(responses, tg6_L4),
    tg7:      countCorrect(responses, tg7.items),
    tg8:      countCorrect(responses, tg8.items),
  };

  let cpvLevel = 0;

  // Level 1 — TG1 ≥7/11, OR TG2 ≥5/8, OR TG3 ≥5/7
  if (scores.tg1 >= 7 || scores.tg2 >= 5 || scores.tg3 >= 5) cpvLevel = Math.max(cpvLevel, 1);

  // Level 2 — TG4 Seq1 ≥5/8
  if (scores.tg4_seq1 >= 5) cpvLevel = Math.max(cpvLevel, 2);

  // Level 3 — TG5 2-digit ≥3/4 AND TG6 2-digit ≥3/4
  if (scores.tg5_L3 >= 3 && scores.tg6_L3 >= 3) cpvLevel = Math.max(cpvLevel, 3);

  // Level 4 — TG5 3-digit ≥2/4, OR TG6 3-digit ≥2/3, OR TG7 ≥3/4, OR TG8 ≥8/12
  if (scores.tg5_L4 >= 2 || scores.tg6_L4 >= 2 || scores.tg7 >= 3 || scores.tg8 >= 8) cpvLevel = Math.max(cpvLevel, 4);

  return { cpvLevel, scores };
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
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const groups = schedule3C.taskGroups;
  const currentGroup = groups[currentGroupIdx];
  const isFirst = currentGroupIdx === 0;
  const isLast = currentGroupIdx === groups.length - 1;

  function handleSkip() {
    if (!currentGroup.skipToId) return;
    const targetIdx = groups.findIndex((g) => g.id === currentGroup.skipToId);
    if (targetIdx !== -1) {
      setValidationError(null);
      setCurrentGroupIdx(targetIdx);
    }
  }

  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("students")
      .select("id, first_name, last_name, grade_level")
      .eq("id", studentId)
      .single()
      .then(({ data }) => { if (data) setStudent(data); });
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Returns items required but unanswered
  function getRequiredButUnanswered(group: TaskGroup): AssessmentItem[] {
    return group.items.filter((item) =>
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

  function handleEndEarly() {
    // Score immediately — blank/unanswered items already evaluate as incorrect
    // in calculateResults() since resp(id) checks for === "correct".
    // No validation needed; teacher is intentionally stopping early.
    setValidationError(null);
    handleFinish();
  }

  async function handleFinish() {
    if (!student) return;
    setSaving(true);
    setSaveError(null);
    const calc = calculateResults(responses);
    setIsBorderline(calc.cpvLevel > 0 && calc.cpvLevel < 4);
    setResults(calc);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "schedule-3c",
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
        model_name: "CPV",
        suggested_level: calc.cpvLevel,
        confirmed_level: calc.cpvLevel,
      });
      }

      setDone(true);
    } catch (err) {
      console.error("Failed to save assessment:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Results screen ────────────────────────────────────────────────────────────
  if (done && student && results) {
    const cpvInfo = schedule3C.cpvLevels[results.cpvLevel];
    const s = results.scores;

    const scoreRows = [
      { label: "TG1 — Inc. by 10s ON decuple (11 items)",   value: `${s.tg1}/11`,   level: 1 },
      { label: "TG2 — Inc. by 10s OFF decuple (8 items)",   value: `${s.tg2}/8`,    level: 1 },
      { label: "TG3 — Dec. by 10s OFF decuple (7 items)",   value: `${s.tg3}/7`,    level: 1 },
      { label: "TG4 — Flexible Inc. Seq. 1 (8 items)",      value: `${s.tg4_seq1}/8`, level: 2 },
      { label: "TG5 — Jump +10 (2-digit, 4 items)",         value: `${s.tg5_L3}/4`, level: 3 },
      { label: "TG5 — Jump +10 (3-digit + across, 4 items)",value: `${s.tg5_L4}/4`, level: 4 },
      { label: "TG6 — Jump −10 (2-digit, 4 items)",         value: `${s.tg6_L3}/4`, level: 3 },
      { label: "TG6 — Jump −10 (3-digit + across, 3 items)",value: `${s.tg6_L4}/3`, level: 4 },
      { label: "TG7 — Jump of 100 (4 items)",               value: `${s.tg7}/4`,    level: 4 },
      { label: "TG8 — Inc. by 100s (12 items)",             value: `${s.tg8}/12`,   level: 4 },
    ];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-lg shadow-sm">
          <div className="mb-5">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">Assessment Complete</div>
            <p className="text-gray-500 text-sm mt-1">
              Schedule 3C — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
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

          {/* CPV Placement */}
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
          <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-4 flex flex-col items-center gap-2 mb-5">
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wide">CPV Level</div>
            <div className="text-4xl font-black text-teal-700">{results.cpvLevel}</div>
            <div className="text-teal-700 text-xs text-center leading-snug">{cpvInfo?.name ?? ""}</div>
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
          <div className="space-y-1 text-sm mb-6">
            {scoreRows.map(({ label, value, level }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 gap-2">
                <span className="text-gray-600 text-xs flex-1">{label}</span>
                <span className="text-xs text-gray-400 shrink-0">L{level}</span>
                <span className="font-semibold text-xs shrink-0 text-teal-700 w-10 text-right">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            * Suggested placement based on observed responses. Teacher judgment should confirm final level.
          </p>

          {savedSessionId && (
            <TeacherOverride
              sessionId={savedSessionId}
              modelName="CPV"
              suggestedLevel={results.cpvLevel}
              maxLevel={4}
              levelLabels={Object.fromEntries(
                Object.entries(schedule3C.cpvLevels).map(([k, v]) => [Number(k), v.name])
              )}
            />
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => router.push("/assess/select")}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg py-2.5 text-sm">
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
          <span className="text-gray-500 text-sm">{schedule3C.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-teal-600" : i < currentGroupIdx ? "bg-teal-300" : "bg-gray-200"
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
          {schedule3C.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: CPV levels + script */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — {currentGroup.model}
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* CPV model levels */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Conceptual Place Value</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">CPV Levels</div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {schedule3C.cpvLevels.map(({ level, name }) => (
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

            {/* Full instructions */}
            <div className="bg-teal-50 rounded-xl border border-teal-200 p-3">
              <div className="text-xs text-teal-700 leading-snug">
                <span className="font-semibold">Instructions: </span>{currentGroup.instructions}
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
                ⚠ {currentGroup.branchingNote}
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

          {/* End Assessment Early — confirmation */}
          {showEndConfirm && (
            <div className="border-t border-orange-200 bg-orange-50 px-4 py-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-orange-800">
                End assessment now? All unanswered items will be scored as incorrect.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleEndEarly}
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg py-2"
                >
                  {saving ? "Saving…" : "Yes — Score & End Now"}
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 border border-orange-300 text-orange-700 text-xs font-medium rounded-lg py-2 hover:bg-orange-100"
                >
                  Cancel
                </button>
              </div>
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
            <button
              onClick={() => setShowEndConfirm((v) => !v)}
              className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2"
            >
              End Early
            </button>
            <div className="flex gap-2">
              {currentGroup.skipToId && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
                >
                  {currentGroup.skipLabel ?? "Skip →"}
                </button>
              )}
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
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
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
            className="w-full border border-teal-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-400 bg-teal-50/40"
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
              ? "bg-teal-100 border-teal-400 text-teal-700"
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

export default function Schedule3CPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
