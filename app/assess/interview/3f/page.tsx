"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3F, TaskGroup, AssessmentItem, ResponseField } from "@/lib/assessments/schedule-3f";
import InlineCorrectIncorrect from "@/components/InlineCorrectIncorrect";
import TeacherOverride from "@/components/TeacherOverride";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

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
  const ciItems = items.filter((i) => i.responseFields.some((f) => f.type === "correct_incorrect"));
  if (ciItems.length === 0) return null;
  const correct = ciItems.filter((i) => {
    const f = i.responseFields.find((f) => f.type === "correct_incorrect");
    return f ? responses[i.id]?.[f.label] === "correct" : false;
  }).length;
  return { correct, total: ciItems.length };
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function calculateResults(responses: Responses) {
  const resp = (id: string) => responses[id]?.["Response"] === "correct";
  // "not_attempted" items are excluded from scoring — they neither help nor hurt.
  // "attempted" scores as NOT correct (conservative/lower level assumption).
  const notAttempted = (id: string) => responses[id]?.["Response"] === "not_attempted";

  // Range 1: 2s and 10s
  const r1Mult = ["f1-mult-2x6","f1-mult-5x10","f1-mult-8x2","f1-mult-10x7"].filter((id) => resp(id) && !notAttempted(id)).length;
  const r1Div  = ["f1-div-90by10","f1-div-14by7","f1-div-18by2","f1-div-80by8"].filter((id) => resp(id) && !notAttempted(id)).length;

  // Range 2: Low × low
  const r2Mult = ["f2-mult-3x4","f2-mult-5x3","f2-mult-3x3","f2-mult-4x5"].filter((id) => resp(id) && !notAttempted(id)).length;
  const r2Div  = ["f2-div-15by5","f2-div-16by4","f2-div-25by5","f2-div-12by3"].filter((id) => resp(id) && !notAttempted(id)).length;

  // Range 3: Low × high
  const r3Mult = ["f3-mult-6x3","f3-mult-4x7","f3-mult-3x9","f3-mult-5x7"].filter((id) => resp(id) && !notAttempted(id)).length;
  const r3Div  = ["f3-div-21by3","f3-div-32by8","f3-div-30by6","f3-div-45by5"].filter((id) => resp(id) && !notAttempted(id)).length;

  // Range 4: High × high
  const r4Mult = ["f4-mult-6x6","f4-mult-8x7","f4-mult-9x8","f4-mult-7x6"].filter((id) => resp(id) && !notAttempted(id)).length;
  const r4Div  = ["f4-div-48by8","f4-div-63by9","f4-div-54by6","f4-div-49by7"].filter((id) => resp(id) && !notAttempted(id)).length;

  // Range 5: Factor > 10
  const r5Mult = ["f5-mult-3x12","f5-mult-15x7"].filter((id) => resp(id) && !notAttempted(id)).length;
  const r5Div  = ["f5-div-65by5","f5-div-96by4"].filter((id) => resp(id) && !notAttempted(id)).length;

  let mbfLevel = 0;

  // Level 1: Range 1 facile (≥3/4 mult + ≥3/4 div)
  if (r1Mult >= 3 && r1Div >= 3) mbfLevel = Math.max(mbfLevel, 1);

  // Level 2: Range 2 facile (≥3/4 mult + ≥3/4 div)
  if (r2Mult >= 3 && r2Div >= 3) mbfLevel = Math.max(mbfLevel, 2);

  // Level 3: Range 3 facile
  if (r3Mult >= 3 && r3Div >= 3) mbfLevel = Math.max(mbfLevel, 3);

  // Level 4: Range 4 facile
  if (r4Mult >= 3 && r4Div >= 3) mbfLevel = Math.max(mbfLevel, 4);

  // Level 5: Range 5 (factor > 10)
  if (r5Mult >= 2 && r5Div >= 2) mbfLevel = Math.max(mbfLevel, 5);

  return {
    mbfLevel,
    scores: {
      range1Mult: { correct: r1Mult, total: 4 },
      range1Div:  { correct: r1Div,  total: 4 },
      range2Mult: { correct: r2Mult, total: 4 },
      range2Div:  { correct: r2Div,  total: 4 },
      range3Mult: { correct: r3Mult, total: 4 },
      range3Div:  { correct: r3Div,  total: 4 },
      range4Mult: { correct: r4Mult, total: 4 },
      range4Div:  { correct: r4Div,  total: 4 },
      range5Mult: { correct: r5Mult, total: 2 },
      range5Div:  { correct: r5Div,  total: 2 },
    },
  };
}

// ── Main interview component ──────────────────────────────────────────────────

function InterviewContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");
  const router    = useRouter();
  const supabase  = createClient();

  const [student, setStudent]                 = useState<Student | null>(null);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [responses, setResponses]             = useState<Responses>({});
  const [saving, setSaving]                   = useState(false);
  const [done, setDone]                       = useState(false);
  const [results, setResults]                 = useState<ReturnType<typeof calculateResults> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError]             = useState<string | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [isBorderline, setIsBorderline] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const groups       = schedule3F.taskGroups;
  const currentGroup = groups[currentGroupIdx];
  const isFirst      = currentGroupIdx === 0;
  const isLast       = currentGroupIdx === groups.length - 1;

  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("students")
      .select("id, first_name, last_name, grade_level")
      .eq("id", studentId)
      .single()
      .then(({ data }) => { if (data) setStudent(data); });
  }, [studentId]);

  useEffect(() => {
    const group = groups[currentGroupIdx];
    if (!group.startAtItem) return;
    const subLevels = groupBySubLevel(group.items);
    const startSubIdx = subLevels.findIndex(([, items]) =>
      items.some((i) => i.id === group.startAtItem)
    );
    if (startSubIdx <= 0) return;
    setResponses((prev) => {
      const next = { ...prev };
      for (let s = 0; s < startSubIdx; s++) {
        const [, items] = subLevels[s];
        items.forEach((item) => {
          item.responseFields.forEach((field) => {
            if (field.type === "correct_incorrect" && !next[item.id]?.[field.label]) {
              next[item.id] = { ...(next[item.id] ?? {}), [field.label]: "correct" };
            }
          });
        });
      }
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroupIdx]);

  function getRequiredButUnanswered(group: TaskGroup): AssessmentItem[] {
    const subLevels = groupBySubLevel(group.items);
    let startIdx = 0;
    if (group.startAtItem) {
      const found = subLevels.findIndex(([, items]) => items.some((i) => i.id === group.startAtItem));
      if (found >= 0) startIdx = found;
    }
    return subLevels
      .slice(startIdx)
      .flatMap(([, items]) => items)
      .filter((item) =>
        item.responseFields.some(
          (f) => f.type === "correct_incorrect" && !responses[item.id]?.[f.label]
        )
      );
  }

  function setResponse(itemId: string, field: string, value: string) {
    setResponses((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? {}), [field]: value } }));
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
    setIsBorderline(calc.mbfLevel > 0 && calc.mbfLevel < 5);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData, error: sessionError } = await supabase
        .from("assessment_sessions")
        .insert({
          student_id:        student.id,
          teacher_id:        user.id,
          assessment_id:     "schedule-3f",
          date_administered: today,
          status:            "completed",
          raw_responses:     responses,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      setSavedSessionId(sessionData!.id);
      const { error: placementError } = await supabase.from("construct_placements").insert([{
        session_id:      sessionData!.id,
        student_id:      student.id,
        model_name:      "MBF",
        suggested_level: calc.mbfLevel,
        confirmed_level: calc.mbfLevel,
        date_placed:     today,
      }]);
      if (placementError) throw placementError;

      setDone(true);
    } catch (err) {
      console.error("Failed to save assessment:", err);
      const msg = (err as any)?.message ?? JSON.stringify(err);
      setSaveError(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (done && student && results) {
    const levelInfo = schedule3F.mbfLevels[results.mbfLevel - 1] ?? schedule3F.mbfLevels[0];
    const scoreRows: [string, { correct: number; total: number }, number][] = [
      ["Range 1 Mult (2s & 10s)", results.scores.range1Mult, 3],
      ["Range 1 Div (2s & 10s)",  results.scores.range1Div,  3],
      ["Range 2 Mult (Low×Low)",  results.scores.range2Mult, 3],
      ["Range 2 Div (Low×Low)",   results.scores.range2Div,  3],
      ["Range 3 Mult (Low×High)", results.scores.range3Mult, 3],
      ["Range 3 Div (Low×High)",  results.scores.range3Div,  3],
      ["Range 4 Mult (High×High)",results.scores.range4Mult, 3],
      ["Range 4 Div (High×High)", results.scores.range4Div,  3],
      ["Range 5 Mult (Factor>10)",results.scores.range5Mult, 2],
      ["Range 5 Div (Factor>10)", results.scores.range5Div,  2],
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Schedule 3F: Multiplicative Basic Facts — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
            <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4 flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">MBF</div>
                <div className="text-5xl font-black text-purple-700">{results.mbfLevel}</div>
              </div>
              <div>
                <div className="font-semibold text-purple-800 text-sm">{levelInfo?.name ?? "Emergent"}</div>
                <div className="text-purple-700 text-xs mt-1 leading-snug">{levelInfo?.description ?? "No range facile yet"}</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
            <div className="space-y-1 text-sm mb-4">
              {scoreRows.map(([label, score, threshold]) => {
                const color = score.correct >= threshold ? "text-green-600" : score.correct === 0 ? "text-red-500" : "text-yellow-600";
                return (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 text-xs">{label}</span>
                    <span className={`font-semibold text-xs ${color}`}>{score.correct}/{score.total}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mb-4">
              * Level reflects the highest range where student demonstrates facile (non-counting) strategies for both multiplication and division. Teacher judgment should confirm.
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
                modelName="MBF"
                suggestedLevel={results.mbfLevel}
                maxLevel={5}
                minLevel={1}
                levelLabels={Object.fromEntries(
                  Object.entries(schedule3F.mbfLevels).map(([k, v]) => [Number(k), v.name])
                )}
              />
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => router.push("/assess/select")} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg py-2.5 text-sm">
                Assess Another Student
              </button>
              <button onClick={() => router.push("/students")} className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-50">
                Back to Students
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">Loading…</div></div>;
  }

  // ── Interview screen ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Exit</button>
          <div className="h-4 w-px bg-gray-200" />
          <span className="font-semibold text-gray-900 text-sm">{student.first_name} {student.last_name}</span>
          <span className="text-gray-400 text-sm">Grade {gradeLabel(student.grade_level)}</span>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-gray-500 text-sm">{schedule3F.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Range {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${i === currentGroupIdx ? "bg-purple-600" : i < currentGroupIdx ? "bg-purple-200" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
      </div>

      {currentGroupIdx === 0 && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 text-xs text-purple-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {schedule3F.materials.map((m) => (
            <span key={m} className="bg-purple-100 border border-purple-300 rounded px-2 py-0.5">{m}</span>
          ))}
          <span className="ml-2 italic text-purple-500">Ask: "Can you do it without counting?" if student skip-counts.</span>
        </div>
      )}

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* LEFT: Level/range descriptions */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-purple-700 text-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Range {currentGroup.number} — MBF</div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Multiplicative Basic Facts</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">Ranges 1–5</div>
              </div>
              <div className="space-y-1.5">
                {schedule3F.mbfLevels.map(({ level, name, description }) => (
                  <div key={level} className={`flex items-start gap-2 rounded-lg px-3 py-2 border ${level === currentGroup.number ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-100"}`}>
                    <span className="text-xs font-bold text-purple-600 w-4 shrink-0 mt-0.5">{level}</span>
                    <div>
                      <div className="text-xs font-semibold leading-snug text-gray-800">{name}</div>
                      <div className="text-xs leading-snug text-gray-500 mt-0.5">{description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Instructions:</div>
              <div className="text-sm text-gray-800 italic">{currentGroup.instructions}</div>
              {currentGroup.materials && <div className="text-xs text-gray-400 mt-2">📦 {currentGroup.materials}</div>}
            </div>
          </div>
        </div>

        {/* RIGHT: Scoring */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">✏️ Teacher Scoring — {currentGroup.name}</div>
            {currentGroup.branchingNote && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 mt-2 font-medium">⚠️ {currentGroup.branchingNote}</div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {groupBySubLevel(currentGroup.items).map(([subLevel, items]) => (
              <SubGroupSection key={subLevel} subLevel={subLevel} items={items} responses={responses}
                getResponse={getResponse} setResponse={setResponse}
                startAtItem={currentGroup.startAtItem} startNote={currentGroup.startNote} />
            ))}
          </div>

          {validationError && <div className="px-4 py-2 bg-red-50 border-t border-red-200"><p className="text-xs text-red-600 font-medium">⚠ {validationError}</p></div>}
          {saveError && <div className="px-4 py-2 bg-red-50 border-t border-red-200"><p className="text-xs text-red-600 font-medium">⚠ {saveError}</p></div>}

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

          <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
            <button onClick={() => { setValidationError(null); setCurrentGroupIdx((i) => Math.max(0, i - 1)); }}
              disabled={isFirst} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              ← Previous
            </button>
            <button
              onClick={() => setShowEndConfirm((v) => !v)}
              className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2"
            >
              End Early
            </button>
            {isLast ? (
              <button onClick={handleTryFinish} disabled={saving}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:bg-purple-400">
                {saving ? "Saving…" : "✓ Finish & Score"}
              </button>
            ) : (
              <button onClick={handleTryNext}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                Next Range →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-group section ─────────────────────────────────────────────────────────

function SubGroupSection({ subLevel, items, responses, getResponse, setResponse, startAtItem, startNote }: {
  subLevel: string;
  items: AssessmentItem[];
  responses: Responses;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
  startAtItem?: string;
  startNote?: string;
}) {
  const score       = calcGroupScore(items, responses);
  const isStartHere = startAtItem ? items.some((i) => i.id === startAtItem) : false;

  function markAllCorrect() {
    items.forEach((item) => item.responseFields.forEach((f) => {
      if (f.type === "correct_incorrect") setResponse(item.id, f.label, "correct");
    }));
  }

  const hasCIFields = items.some((item) => item.responseFields.some((f) => f.type === "correct_incorrect"));

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isStartHere ? "border-green-400" : "border-purple-200 bg-purple-50/20"}`}>
      {isStartHere && (
        <div className="bg-green-500 px-3 py-1.5 flex items-center gap-2">
          <span className="text-white font-bold text-xs tracking-wide">▶ START HERE</span>
          {startNote && <span className="text-green-100 text-xs">{startNote}</span>}
        </div>
      )}
      <div className="px-3 py-1.5 flex items-center justify-between bg-purple-100/60 text-purple-900">
        <span className="text-xs font-semibold text-purple-800">{subLevel}</span>
        {score && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            score.correct / score.total >= 0.75 ? "bg-green-200 text-green-800" :
            score.correct / score.total >= 0.5  ? "bg-yellow-200 text-yellow-800" :
                                                   "bg-red-100 text-red-700"
          }`}>
            {score.correct}/{score.total} ✓
          </span>
        )}
      </div>
      <div className="divide-y divide-white/60 bg-white/60">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} getResponse={getResponse} setResponse={setResponse} />
        ))}
      </div>
      {hasCIFields && (
        <div className="px-3 py-2 bg-white/40 border-t border-white/60 flex justify-end">
          <button onClick={markAllCorrect}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors">
            ✓ All Correct
          </button>
        </div>
      )}
    </div>
  );
}

// ── Item row ──────────────────────────────────────────────────────────────────

function ItemRow({ item, getResponse, setResponse }: {
  item: AssessmentItem;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const hasStrategy = item.responseFields.some((f) => f.type === "strategy_select");
  const useMulti = hasStrategy || item.responseFields.length >= 3;

  return (
    <div className="px-3 py-3">
      {useMulti ? (
        <div className="flex items-start gap-3">
          {item.displayText && <span className="text-base font-black text-gray-700 min-w-[5rem] text-center shrink-0 pt-0.5">{item.displayText}</span>}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-700 mb-2 leading-snug">{item.prompt}</div>
            <div className="flex flex-col gap-2">
              {item.responseFields.map((field) => (
                <FieldWithLabel key={field.label} field={field}
                  value={getResponse(item.id, field.label)}
                  onChange={(v) => setResponse(item.id, field.label, v)} />
              ))}
            </div>
          </div>
          <button onClick={() => setNotesOpen((o) => !o)} className="text-gray-300 hover:text-gray-500 text-xs shrink-0" title="Add note">📝</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {item.displayText && <span className="text-base font-black text-gray-700 min-w-[3.5rem] text-center shrink-0">{item.displayText}</span>}
          <span className="text-sm text-gray-700 flex-1 min-w-0">{item.prompt}</span>
          <div className="flex items-center gap-2 shrink-0">
            {item.responseFields.map((field) => (
              <FieldRenderer key={field.label} field={field}
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)} />
            ))}
          </div>
          <button onClick={() => setNotesOpen((o) => !o)} className="text-gray-300 hover:text-gray-500 text-xs" title="Add note">📝</button>
        </div>
      )}
      {notesOpen && (
        <input type="text" placeholder="Teacher note…"
          value={getResponse(item.id, "notes")}
          onChange={(e) => setResponse(item.id, "notes", e.target.value)}
          className="mt-1.5 w-full text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none focus:border-gray-400"
          autoFocus />
      )}
      {item.notes && <div className="text-xs text-purple-600 mt-0.5 italic">{item.notes}</div>}
    </div>
  );
}

function FieldWithLabel({ field, value, onChange }: { field: ResponseField; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-20 text-right shrink-0 pt-1">{field.label}:</span>
      <FieldRenderer field={field} value={value} onChange={onChange} />
    </div>
  );
}

function FieldRenderer({ field, value, onChange }: { field: ResponseField; value: string; onChange: (v: string) => void }) {
  if (field.type === "correct_incorrect") {
    return <InlineCorrectIncorrect value={value} onChange={onChange} />;
  }
  // strategy_select — single select orange buttons
  if (field.type === "strategy_select" && field.options) {
    return (
      <div className="flex flex-wrap gap-1 items-center">
        {field.options.map((opt) => (
          <button key={opt} onClick={() => onChange(value === opt ? "" : opt)}
            className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${
              value === opt
                ? "bg-orange-100 border-orange-400 text-orange-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    );
  }
  return null;
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function Schedule3FPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
