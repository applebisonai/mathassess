"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { scheduleAvPV, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-av-pv";
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

function calcGroupScore(items: AssessmentItem[], responses: Responses) {
  // Items with correct/incorrect buttons
  const ciItems = items.filter((i) =>
    i.responseFields.some((f) => f.type === "correct_incorrect")
  );
  // Items with typed answer boxes (expectedAnswer)
  const inputItems = items.filter((i) => i.expectedAnswer !== undefined);

  if (ciItems.length === 0 && inputItems.length === 0) return null;

  const ciCorrect = ciItems.filter((i) => {
    const f = i.responseFields.find((f) => f.type === "correct_incorrect");
    return f ? responses[i.id]?.[f.label] === "correct" : false;
  }).length;

  const inputCorrect = inputItems.filter((i) => {
    const f = i.responseFields.find((f) => f.type === "number_entry");
    const entered = parseInt(responses[i.id]?.[f?.label ?? ""] ?? "");
    return !isNaN(entered) && entered === i.expectedAnswer;
  }).length;

  return {
    correct: ciCorrect + inputCorrect,
    total: ciItems.length + inputItems.length,
  };
}

// ── CPV Scoring ───────────────────────────────────────────────────────────────
// Level 0: Cannot produce counting sequences by tens
// Level 1: Counts by 10s — TG1 at least 1 sequence correct
// Level 2: Uses bundles/sticks correctly — TG2 ≥6 of 14 (or ≥4 of Seq1)
//          Strategy (Jump/Split) is recorded as evidence, NOT a gate
// Level 3: Solves 2-digit +/− without materials — TG3 ≥2 of first 4
//          (Level 3 is reachable directly from Level 1 if TG3 evidence is clear)
// Level 4: 2-digit correct with efficient strategies (Jump/Split/SJ), no counting by 1s
// Level 5: Solves 3-digit tasks — TG3 ≥2 of last 4

function calculateResults(responses: Responses) {
  // Helper to exclude not_attempted items
  const isCorrect = (id: string) => {
    const val = responses[id]?.Response;
    return val === "correct";
  };
  const isNotAttempted = (id: string) => responses[id]?.Response === "not_attempted";

  const tg1Correct = ["1.1", "1.2", "1.3", "1.4"].filter(
    (id) => isCorrect(id) && !isNotAttempted(id)
  ).length;

  const tg2Seq1 = ["2.2a","2.2b","2.2c","2.2d","2.2e","2.2f","2.2g","2.2h"];
  const tg2Seq2 = ["2.3a","2.3b","2.3c","2.3d","2.3e","2.3f"];
  const TG2_EXPECTED: Record<string, number> = {
    "2.2a": 10, "2.2b": 13, "2.2c": 33, "2.2d": 37,
    "2.2e": 40, "2.2f": 50, "2.2g": 52, "2.2h": 72,
    "2.3a":  4, "2.3b": 14, "2.3c": 44, "2.3d": 48,
    "2.3e": 61, "2.3f": 85,
  };
  const tg2Seq1Correct = tg2Seq1.filter((id) => {
    const entered = parseInt(responses[id]?.["Student said"] ?? "");
    return !isNaN(entered) && entered === TG2_EXPECTED[id];
  }).length;
  const tg2Correct = tg2Seq2.reduce((count, id) => {
    const entered = parseInt(responses[id]?.["Student said"] ?? "");
    return count + (!isNaN(entered) && entered === TG2_EXPECTED[id] ? 1 : 0);
  }, tg2Seq1Correct);
  const tg2Total = tg2Seq1.length + tg2Seq2.length;

  // Strategy is recorded for evidence but does NOT gate level advancement
  const tg2Strat1 = responses["2.2s"]?.Strategy ?? "";
  const tg2Strat2 = responses["2.3s"]?.Strategy ?? "";
  const tg2UsesJumpOrSplit =
    tg2Strat1 === "Jump" || tg2Strat1 === "Split" ||
    tg2Strat2 === "Jump" || tg2Strat2 === "Split";

  const tg3_2digit = ["3.1","3.2","3.3","3.4"];
  const tg3_3digit = ["3.5","3.6","3.7","3.8"];
  const tg3Correct2 = tg3_2digit.filter((id) => isCorrect(id) && !isNotAttempted(id)).length;
  const tg3Correct3 = tg3_3digit.filter((id) => isCorrect(id) && !isNotAttempted(id)).length;

  const tg3EfficientCount = tg3_2digit.filter((id) => {
    const s = responses[id]?.Strategy;
    return s === "Jump" || s === "Split" || s === "Split-Jump";
  }).length;
  const tg3CountingBy1s = [...tg3_2digit, ...tg3_3digit].some(
    (id) => responses[id]?.Strategy === "Counts by 1's"
  );

  let cpvLevel = 0;

  // Level 1: TG1 — at least 1 sequence correct
  if (tg1Correct >= 1) cpvLevel = 1;

  // Level 2: TG2 — bundles/sticks correctly handled (≥6/14 overall, or ≥4/8 in Seq1)
  // Strategy is informational only — does NOT gate this level
  if (tg1Correct >= 1 && (tg2Correct >= 6 || tg2Seq1Correct >= 4)) {
    cpvLevel = Math.max(cpvLevel, 2);
  }

  // Level 3: TG3 — 2-digit without materials (≥2 of 4)
  // Reachable from Level 1 directly if TG3 evidence is clear
  if (tg3Correct2 >= 2) cpvLevel = Math.max(cpvLevel, 3);

  // Level 4: Efficient strategies for 2-digit (Jump/Split/SJ), not counting by 1s
  if (tg3Correct2 >= 3 && tg3EfficientCount >= 2 && !tg3CountingBy1s) {
    cpvLevel = Math.max(cpvLevel, 4);
  }

  // Level 5: TG3 — 3-digit tasks (≥2 of 4)
  if (tg3Correct3 >= 2) cpvLevel = Math.max(cpvLevel, 5);

  return {
    cpvLevel,
    scores: {
      tg1: { correct: tg1Correct, total: 4 },
      tg2: { correct: tg2Correct, total: tg2Total },
      tg3_2digit: { correct: tg3Correct2, total: 4 },
      tg3_3digit: { correct: tg3Correct3, total: 4 },
    },
    tg2UsesJumpOrSplit,
    tg3EfficientCount,
  };
}

// ── Slashable Sequence (TG1 counting tasks) ───────────────────────────────────
// Tap a number to slash it through (mark incorrect); tap again to unslash.
// Stores as comma-separated string in _slashed field.

function SlashableSequence({
  numbers, slashedStr, onToggle,
}: { numbers: number[]; slashedStr: string; onToggle: (n: string) => void }) {
  const slashed = slashedStr ? slashedStr.split(",") : [];
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="text-xs text-gray-400 mb-2">Click incorrect responses:</div>
      <div className="flex flex-wrap gap-2">
        {numbers.map((n) => {
          const s = String(n);
          const isSlashed = slashed.includes(s);
          return (
            <button
              key={n}
              onClick={() => onToggle(s)}
              className={`relative text-sm font-mono font-bold px-2.5 py-1.5 rounded border transition-all select-none ${
                isSlashed
                  ? "bg-red-50 border-red-400 text-red-400"
                  : "bg-white border-gray-300 text-gray-700 hover:border-red-300 hover:bg-red-50"
              }`}
            >
              {/* Diagonal slash overlay */}
              {isSlashed && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <svg viewBox="0 0 40 24" className="w-full h-full" preserveAspectRatio="none">
                    <line x1="4" y1="20" x2="36" y2="4" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              )}
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Counting Number Bar (generic, for non-sequence items) ─────────────────────

const COUNTING_NUMBERS = Array.from({ length: 15 }, (_, i) => (i + 1) * 10); // 10…150

function CountingNumberBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      <div className="text-xs text-gray-400 mb-1.5">Student said:</div>
      <div className="flex flex-wrap gap-1">
        {COUNTING_NUMBERS.map((n) => {
          const s = String(n);
          const selected = value === s;
          return (
            <button
              key={n}
              onClick={() => onChange(selected ? "" : s)}
              className={`text-xs px-2 py-1 rounded-full border font-semibold transition-colors ${
                selected
                  ? "bg-red-500 border-red-600 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Sequence Input (TG2 typed answer box) ────────────────────────────────────
// Teacher types what the student said; turns green/red vs expected answer.

function SequenceInput({
  value, onChange, expectedAnswer,
}: { value: string; onChange: (v: string) => void; expectedAnswer: number }) {
  const entered = parseInt(value);
  const hasValue = value.trim() !== "";
  const isCorrect = hasValue && !isNaN(entered) && entered === expectedAnswer;
  const isWrong   = hasValue && !isNaN(entered) && entered !== expectedAnswer;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <input
        type="number"
        inputMode="numeric"
        placeholder="___"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-16 border-2 rounded-lg px-2 py-1.5 text-center text-base font-bold focus:outline-none transition-colors ${
          isCorrect ? "border-green-400 bg-green-50 text-green-700" :
          isWrong   ? "border-red-400 bg-red-50 text-red-600"       :
          "border-gray-300 bg-white text-gray-700 focus:border-teal-400"
        }`}
      />
      {hasValue && (
        <span className={`text-sm font-bold ${isCorrect ? "text-green-600" : "text-red-500"}`}>
          {isCorrect ? "✓" : "✗"}
        </span>
      )}
    </div>
  );
}

// ── Strategy Picker ───────────────────────────────────────────────────────────

function StrategyPicker({
  options, value, onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`text-xs px-2 py-1 rounded-full border font-medium transition-colors ${
            value === opt
              ? "bg-teal-600 border-teal-700 text-white"
              : "bg-white border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Main interview component ──────────────────────────────────────────────────

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

  const groups = scheduleAvPV.taskGroups;
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
        item.responseFields.some((f) => f.type === "correct_incorrect" && !responses[item.id]?.[f.label])
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
    setResults(calc);
    setIsBorderline(calc.cpvLevel > 0 && calc.cpvLevel < 5);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData, error: sessionError } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "av-pv",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

      if (sessionError) throw sessionError;

      setSavedSessionId(sessionData!.id);
      const { error: placementError } = await supabase.from("construct_placements").insert([
        {
          session_id: sessionData!.id,
          student_id: student.id,
          model_name: "CPV",
          suggested_level: calc.cpvLevel,
          confirmed_level: calc.cpvLevel,
          date_placed: today,
        },
      ]);
      if (placementError) throw placementError;

      setDone(true);
    } catch (err) {
      console.error("Failed to save assessment:", err);
      let msg: string;
      try {
        const serialized = JSON.stringify(err, Object.getOwnPropertyNames(err as object));
        const parsed = serialized ? JSON.parse(serialized) : null;
        msg = parsed?.message ?? parsed?.details ?? serialized ?? String(err);
      } catch {
        msg = String(err);
      }
      setSaveError(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (done && student && results) {
    const levelInfo = scheduleAvPV.cpvLevels[results.cpvLevel];
    const scoreRows = [
      { label: "TG1 — Number Word Sequences (Tens)", score: results.scores.tg1 },
      { label: "TG2 — Two-Digit +/− With Materials", score: results.scores.tg2 },
      { label: "TG3 — Two-Digit +/− No Materials",  score: results.scores.tg3_2digit },
      { label: "TG3 — Three-Digit +/− No Materials", score: results.scores.tg3_3digit },
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Add+VantageMR Place Value — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested CPV Placement</h3>
            <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-5 flex items-center gap-5 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">CPV</div>
                <div className="text-5xl font-black text-teal-700">{results.cpvLevel}</div>
              </div>
              <div>
                <div className="font-semibold text-teal-800 text-sm">{levelInfo?.name}</div>
                <div className="text-teal-700 text-xs mt-1 leading-snug">{levelInfo?.description}</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
            <div className="space-y-1 text-sm mb-4">
              {scoreRows.map(({ label, score }) => score ? (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs">{label}</span>
                  <span className={`font-semibold text-xs ${
                    score.correct / score.total >= 0.75 ? "text-green-600" :
                    score.correct / score.total >= 0.5  ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {score.correct} / {score.total}
                    {score.correct / score.total >= 0.75 ? " ✓" : score.correct === 0 ? " ✗" : ""}
                  </span>
                </div>
              ) : null)}
            </div>

            {/* Strategy observed — informational only */}
            <div className={`text-xs rounded-lg px-3 py-2 mb-4 ${
              results.tg2UsesJumpOrSplit
                ? "bg-teal-50 border border-teal-200 text-teal-700"
                : "bg-gray-50 border border-gray-200 text-gray-500"
            }`}>
              {results.tg2UsesJumpOrSplit
                ? "✓ Jump/Split strategy observed in TG2 (materials tasks)"
                : "ℹ No Jump/Split strategy recorded for TG2 — note for instruction"}
            </div>
            {results.tg3EfficientCount >= 2 && (
              <div className="text-xs bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-teal-700 mb-4">
                ✓ Efficient strategies (Jump/Split) observed in TG3
              </div>
            )}

            <p className="text-xs text-gray-400 mb-4">
              * Suggested placement based on performance evidence. Teacher judgment should confirm final level.
            </p>

            {isBorderline && (
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 mb-4 flex gap-2 items-start">
              <span className="text-orange-500 text-sm">🔍</span>
              <p className="text-xs text-orange-700 leading-snug">
                <strong>Review before finalizing:</strong> Some task groups show borderline results.
                Consider the full evidence below — your professional judgment may call for a different level.
              </p>
            </div>
          )}

          {savedSessionId && (
            <TeacherOverride
              sessionId={savedSessionId}
              modelName="CPV"
              suggestedLevel={results.cpvLevel}
              maxLevel={5}
              levelLabels={Object.fromEntries(
                Object.entries(scheduleAvPV.cpvLevels).map(([k, v]) => [Number(k), v.name])
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

  // ── Interview screen ────────────────────────────────────────────────────────
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
          <span className="text-gray-500 text-sm">{scheduleAvPV.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-teal-600" : i < currentGroupIdx ? "bg-teal-200" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials banner on TG1 */}
      {currentGroupIdx === 0 && (
        <div className="bg-teal-50 border-b border-teal-200 px-4 py-2 text-xs text-teal-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {scheduleAvPV.materials.map((m) => (
            <span key={m} className="bg-teal-100 border border-teal-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: CPV level descriptions */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — CPV
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* CPV Level descriptions */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Place Value Construct Model</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">CPV Levels</div>
              </div>
              <div className="space-y-1.5">
                {scheduleAvPV.cpvLevels.map(({ level, name, description }) => (
                  <div key={level} className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100">
                    <span className="text-xs font-bold text-teal-600 w-4 shrink-0 mt-0.5">{level}</span>
                    <div>
                      <div className="text-xs font-semibold leading-snug text-gray-800">{name}</div>
                      <div className="text-xs leading-snug text-gray-500 mt-0.5">{description}</div>
                    </div>
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
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 mt-2 font-medium">
                ⚠️ {currentGroup.branchingNote}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {groupBySubLevel(currentGroup.items).map(([subLevel, items]) => {
              const isStartHere = !!currentGroup.startAtItem && subLevel === currentGroup.startAtItem;
              const startNote = isStartHere ? (currentGroup.startNote ?? null) : null;
              return (
                <SubGroupSection
                  key={subLevel}
                  subLevel={subLevel}
                  items={items}
                  isFirst={isStartHere}
                  startNote={startNote}
                  color={currentGroup.color}
                  responses={responses}
                  getResponse={getResponse}
                  setResponse={setResponse}
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
  );
}

// ── Sub-group section ─────────────────────────────────────────────────────────

function SubGroupSection({
  subLevel, items, isFirst, startNote, color, responses, getResponse, setResponse,
}: {
  subLevel: string;
  items: AssessmentItem[];
  isFirst: boolean;
  startNote?: string | null;
  color: string;
  responses: Responses;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const score = calcGroupScore(items, responses);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${COLOR_SUBGROUP[color] ?? "border-gray-200 bg-gray-50/30"}`}>
      {isFirst && (
        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
          <span>▶</span> START HERE
          {startNote && <span className="ml-2 font-normal text-green-100">— {startNote}</span>}
        </div>
      )}

      {score && (
        <div className={`px-3 py-1.5 flex items-center justify-end ${COLOR_SUBHEAD[color] ?? "bg-gray-100 text-gray-900"}`}>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            score.correct / score.total >= 0.75 ? "bg-green-200 text-green-800" :
            score.correct / score.total >= 0.5  ? "bg-yellow-200 text-yellow-800" :
            "bg-red-100 text-red-700"
          }`}>
            {score.correct}/{score.total} ✓
          </span>
        </div>
      )}

      <div className="divide-y divide-white/60 bg-white/60">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            getResponse={getResponse}
            setResponse={setResponse}
          />
        ))}
      </div>

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

// ── Item row ──────────────────────────────────────────────────────────────────

function ItemRow({
  item, getResponse, setResponse,
}: {
  item: AssessmentItem;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="px-3 py-3">
      <div className="flex items-start gap-3 flex-wrap">

        {/* Large display text */}
        {item.displayText && (
          <span className="text-xl font-black text-gray-700 min-w-[3rem] text-center shrink-0">
            {item.displayText}
          </span>
        )}

        {/* Prompt */}
        <span className="text-sm text-gray-700 flex-1 min-w-0 pt-0.5">{item.prompt}</span>

        {/* Response fields */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {item.responseFields.map((field) => (
            <span key={field.label} className="flex items-center gap-1">
              {field.type === "correct_incorrect" && (
                <InlineCorrectIncorrect
                  value={getResponse(item.id, field.label)}
                  onChange={(v) => setResponse(item.id, field.label, v)}
                />
              )}
              {field.type === "number_entry" && item.expectedAnswer !== undefined && (
                <SequenceInput
                  value={getResponse(item.id, field.label)}
                  onChange={(v) => setResponse(item.id, field.label, v)}
                  expectedAnswer={item.expectedAnswer}
                />
              )}
              {field.type === "number_entry" && item.expectedAnswer === undefined && (
                <input
                  type="text"
                  placeholder={field.placeholder ?? "Enter #"}
                  value={getResponse(item.id, field.label)}
                  onChange={(e) => setResponse(item.id, field.label, e.target.value)}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-400"
                />
              )}
            </span>
          ))}
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className="text-gray-300 hover:text-gray-500 text-xs ml-1 pt-0.5"
          title="Add note"
        >
          📝
        </button>
      </div>

      {/* Strategy pickers — rendered below the main row */}
      {item.responseFields.map((field) =>
        field.type === "strategy_observed" && field.options ? (
          <div key={field.label} className="mt-1.5 ml-1">
            <div className="text-xs text-gray-400 mb-1">{field.label}:</div>
            <StrategyPicker
              options={field.options}
              value={getResponse(item.id, field.label)}
              onChange={(v) => setResponse(item.id, field.label, v)}
            />
          </div>
        ) : null
      )}

      {/* Expandable teacher note */}
      {notesOpen && (
        <input
          type="text"
          placeholder="Teacher note…"
          value={getResponse(item.id, "notes")}
          onChange={(e) => setResponse(item.id, "notes", e.target.value)}
          className="mt-1.5 w-full text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none focus:border-gray-400"
          autoFocus
        />
      )}

      {/* Slashable sequence (TG1) — specific numbers the student should say */}
      {item.countingSequence && item.countingSequence.length > 0 && (
        <SlashableSequence
          numbers={item.countingSequence}
          slashedStr={getResponse(item.id, "_slashed")}
          onToggle={(n) => {
            const current = getResponse(item.id, "_slashed");
            const arr = current ? current.split(",") : [];
            const isAlreadySlashed = arr.includes(n);
            const next = isAlreadySlashed ? arr.filter((x) => x !== n) : [...arr, n];
            setResponse(item.id, "_slashed", next.join(","));
            // Auto-mark incorrect when a number is first slashed
            if (!isAlreadySlashed) {
              const ciField = item.responseFields.find((f) => f.type === "correct_incorrect");
              if (ciField) setResponse(item.id, ciField.label, "incorrect");
            }
          }}
        />
      )}


      {item.notes && (
        <div className="text-xs text-teal-600 mt-0.5 italic">{item.notes}</div>
      )}
    </div>
  );
}

// ── Inline controls ───────────────────────────────────────────────────────────


// ── Page export ───────────────────────────────────────────────────────────────

export default function InterviewAvPVPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
