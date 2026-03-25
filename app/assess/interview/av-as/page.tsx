"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { scheduleAvAS, TaskGroup, AssessmentItem, ResponseField } from "@/lib/assessments/schedule-av-as";
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
  const ciItems = items.filter((i) =>
    i.responseFields.some((f) => f.type === "correct_incorrect")
  );
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

  // TG1
  const countCollection  = resp("as1-count-13");
  const unscreened       = resp("as1-unsc-8p7");
  const partiallyScreened= resp("as1-part-7p2");
  const ts4p2            = resp("as1-ts-4p2");
  const ts6p3            = resp("as1-ts-6p3");
  const ts9p5            = resp("as1-ts-9p5");
  const missingAddend    = resp("as1-ma-8pbox11");

  // TG2
  const removed7m3       = resp("as2-ri-7m3");
  const removed16m4      = resp("as2-ri-16m4");
  const missingSubtrahend= resp("as2-ms-9mbox7");

  // TG3
  const bare8p4          = resp("as3-add-8p4");
  const bare13p3         = resp("as3-add-13p3");
  const bare17m6         = resp("as3-sub-17m6");
  const bare11m8         = resp("as3-sub-11m8");

  // TG4
  const comm4p12         = resp("as4-comm-4p12");
  const link15p3         = resp("as4-link-15p3");
  const link18m3         = resp("as4-link-18m3");
  const rel21m4          = resp("as4-rel-21m4");
  const rel21m17         = resp("as4-rel-21m17");

  let casLevel = 0;

  // Construct 1: Can count a visible collection
  if ((countCollection && !notAttempted("as1-count-13")) || (unscreened && !notAttempted("as1-unsc-8p7"))) casLevel = Math.max(casLevel, 1);

  // Construct 2: Can add partially screened (figurative — counts from 1)
  if (partiallyScreened && !notAttempted("as1-part-7p2")) casLevel = Math.max(casLevel, 2);

  // Construct 3: Counts-on for totally screened / basic subtraction
  if ([ts4p2 && !notAttempted("as1-ts-4p2"), ts6p3 && !notAttempted("as1-ts-6p3"), removed7m3 && !notAttempted("as2-ri-7m3"), removed16m4 && !notAttempted("as2-ri-16m4")].filter(Boolean).length >= 2)
    casLevel = Math.max(casLevel, 3);

  // Construct 4: Missing addend / missing subtrahend
  if ((missingAddend && !notAttempted("as1-ma-8pbox11")) || (missingSubtrahend && !notAttempted("as2-ms-9mbox7"))) casLevel = Math.max(casLevel, 4);

  // Construct 5: Facile — bare numbers + relational thinking
  const bareCorrect       = [bare8p4 && !notAttempted("as3-add-8p4"), bare13p3 && !notAttempted("as3-add-13p3"), bare17m6 && !notAttempted("as3-sub-17m6"), bare11m8 && !notAttempted("as3-sub-11m8")].filter(Boolean).length;
  const relationalCorrect = [comm4p12 && !notAttempted("as4-comm-4p12"), link15p3 && !notAttempted("as4-link-15p3"), link18m3 && !notAttempted("as4-link-18m3"), rel21m4 && !notAttempted("as4-rel-21m4"), rel21m17 && !notAttempted("as4-rel-21m17")].filter(Boolean).length;
  if (bareCorrect >= 3 && relationalCorrect >= 2) casLevel = Math.max(casLevel, 5);

  return {
    casLevel,
    scores: {
      countCollection:   { correct: countCollection   ? 1 : 0, total: 1 },
      unscreened:        { correct: unscreened         ? 1 : 0, total: 1 },
      partiallyScreened: { correct: partiallyScreened  ? 1 : 0, total: 1 },
      totallyScreened:   { correct: [ts4p2, ts6p3, ts9p5].filter(Boolean).length, total: 3 },
      missingAddend:     { correct: missingAddend      ? 1 : 0, total: 1 },
      subtraction:       { correct: [removed7m3, removed16m4].filter(Boolean).length, total: 2 },
      missingSubtrahend: { correct: missingSubtrahend  ? 1 : 0, total: 1 },
      bareNumbers:       { correct: bareCorrect,                total: 4 },
      relational:        { correct: relationalCorrect,          total: 5 },
    },
  };
}

// ── Main interview component ──────────────────────────────────────────────────

function InterviewContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");
  const router    = useRouter();
  const supabase  = createClient();

  const [student, setStudent]               = useState<Student | null>(null);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [responses, setResponses]           = useState<Responses>({});
  const [saving, setSaving]                 = useState(false);
  const [done, setDone]                     = useState(false);
  const [results, setResults]               = useState<ReturnType<typeof calculateResults> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [isBorderline, setIsBorderline] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const groups       = scheduleAvAS.taskGroups;
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

  // Auto-mark CI items before START HERE as correct when navigating to a group
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
    return groupBySubLevel(group.items)
      .flatMap(([, items]) => items)
      .filter((item) =>
        item.responseFields.some(
          (f) => f.type === "correct_incorrect" && !responses[item.id]?.[f.label]
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
      setValidationError(
        `Please answer all ${missing.length} required item${missing.length > 1 ? "s" : ""} before continuing.`
      );
      return;
    }
    setValidationError(null);
    setCurrentGroupIdx((i) => Math.min(groups.length - 1, i + 1));
  }

  function handleTryFinish() {
    const missing = getRequiredButUnanswered(currentGroup);
    if (missing.length > 0) {
      setValidationError(
        `Please answer all ${missing.length} required item${missing.length > 1 ? "s" : ""} before submitting.`
      );
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

    // Set borderline flag (suggested level between 1 and maxLevel-1)
    setIsBorderline(calc.casLevel > 0 && calc.casLevel < 5);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData, error: sessionError } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id:         student.id,
        teacher_id:         user.id,
        assessment_id:      "av-as",
        date_administered:  today,
        status:             "completed",
        raw_responses:      responses,
      })
      .select("id")
      .single();

      if (sessionError) throw sessionError;

      setSavedSessionId(sessionData!.id);
      const { error: placementError } = await supabase.from("construct_placements").insert([{
        session_id:      sessionData!.id,
        student_id:      student.id,
        model_name:      "CAS",
        suggested_level: calc.casLevel,
        confirmed_level: calc.casLevel,
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
    const casLevelInfo = scheduleAvAS.casLevels[results.casLevel];
    const scoreRows: [string, { correct: number; total: number }, number][] = [
      ["Counting a Collection",    results.scores.countCollection,   1],
      ["Unscreened Collections",   results.scores.unscreened,        1],
      ["Partially Screened",       results.scores.partiallyScreened, 1],
      ["Totally Screened",         results.scores.totallyScreened,   2],
      ["Missing Addend",           results.scores.missingAddend,     1],
      ["Subtraction (Screened)",   results.scores.subtraction,       2],
      ["Missing Subtrahend",       results.scores.missingSubtrahend, 1],
      ["Bare Number Problems",     results.scores.bareNumbers,       3],
      ["Relational Thinking",      results.scores.relational,        2],
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Add+VantageMR Addition and Subtraction — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
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

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
            <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">CAS</div>
                <div className="text-5xl font-black text-blue-700">{results.casLevel}</div>
              </div>
              <div>
                <div className="font-semibold text-blue-800 text-sm">{casLevelInfo?.name}</div>
                <div className="text-blue-700 text-xs mt-1 leading-snug">{casLevelInfo?.description}</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
            <div className="space-y-1 text-sm mb-4">
              {scoreRows.map(([label, score, threshold]) => {
                const color =
                  score.correct >= threshold ? "text-green-600" :
                  score.correct === 0         ? "text-red-500"   : "text-yellow-600";
                return (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-600 text-xs">{label}</span>
                    <span className={`font-semibold text-xs ${color}`}>{score.correct}/{score.total}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mb-4">
              * Suggested placement based on performance evidence and strategies observed. Teacher judgment should confirm final level.
            </p>

            {savedSessionId && (
              <TeacherOverride
                sessionId={savedSessionId}
                modelName="CAS"
                suggestedLevel={results.casLevel}
                maxLevel={5}
                levelLabels={Object.fromEntries(
                  Object.entries(scheduleAvAS.casLevels).map(([k, v]) => [Number(k), v.name])
                )}
              />
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => router.push("/assess/select")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm"
              >
                Assess Another Student
              </button>
              <button
                onClick={() => router.push("/students")}
                className="flex-1 border border-gray-200 text-gray-600 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-50"
              >
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

  // ── Interview screen ──────────────────────────────────────────────────────
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
          <span className="text-gray-500 text-sm">{scheduleAvAS.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-blue-600" : i < currentGroupIdx ? "bg-blue-200" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials banner (first group) */}
      {currentGroupIdx === 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {scheduleAvAS.materials.map((m) => (
            <span key={m} className="bg-blue-100 border border-blue-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: CAS level descriptions + teacher script */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — CAS
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* CAS construct descriptions */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Addition &amp; Subtraction</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">Constructs 0–5</div>
              </div>
              <div className="space-y-1.5">
                {scheduleAvAS.casLevels.map(({ level, name, description }) => (
                  <div
                    key={level}
                    className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100"
                  >
                    <span className="text-xs font-bold text-blue-600 w-4 shrink-0 mt-0.5">{level}</span>
                    <div>
                      <div className="text-xs font-semibold leading-snug text-gray-800">{name}</div>
                      <div className="text-xs leading-snug text-gray-500 mt-0.5">{description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher script + materials */}
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
            {groupBySubLevel(currentGroup.items).map(([subLevel, items]) => (
              <SubGroupSection
                key={subLevel}
                subLevel={subLevel}
                items={items}
                responses={responses}
                getResponse={getResponse}
                setResponse={setResponse}
                startAtItem={currentGroup.startAtItem}
                startNote={currentGroup.startNote}
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
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
  subLevel, items, responses, getResponse, setResponse, startAtItem, startNote,
}: {
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
    items.forEach((item) => {
      item.responseFields.forEach((f) => {
        if (f.type === "correct_incorrect") setResponse(item.id, f.label, "correct");
      });
    });
  }

  const hasCIFields = items.some((item) =>
    item.responseFields.some((f) => f.type === "correct_incorrect")
  );

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isStartHere ? "border-green-400" : "border-blue-200 bg-blue-50/20"}`}>
      {/* START HERE banner */}
      {isStartHere && (
        <div className="bg-green-500 px-3 py-1.5 flex items-center gap-2">
          <span className="text-white font-bold text-xs tracking-wide">▶ START HERE</span>
          {startNote && <span className="text-green-100 text-xs">{startNote}</span>}
        </div>
      )}

      {/* Sub-group header */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-blue-100/60 text-blue-900">
        <span className="text-xs font-semibold text-blue-800">{subLevel}</span>
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

      {/* Item rows */}
      <div className="divide-y divide-white/60 bg-white/60">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} getResponse={getResponse} setResponse={setResponse} />
        ))}
      </div>

      {/* All Correct button */}
      {hasCIFields && (
        <div className="px-3 py-2 bg-white/40 border-t border-white/60 flex justify-end">
          <button
            onClick={markAllCorrect}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
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

  // If there's a multi_strategy field or 2+ fields, use vertical layout with labels
  const hasMultiStrategy = item.responseFields.some((f) => f.type === "multi_strategy");
  const useMulti = hasMultiStrategy || item.responseFields.length >= 3;

  return (
    <div className="px-3 py-3">
      {useMulti ? (
        // ── Vertical layout for items with multi_strategy ──────────────────
        <div className="flex items-start gap-3">
          {item.displayText && (
            <span className="text-base font-black text-gray-700 min-w-[4rem] text-center shrink-0 pt-0.5">
              {item.displayText}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-700 mb-2 leading-snug">{item.prompt}</div>
            <div className="flex flex-col gap-2">
              {item.responseFields.map((field) => (
                <FieldWithLabel
                  key={field.label}
                  field={field}
                  value={getResponse(item.id, field.label)}
                  onChange={(v) => setResponse(item.id, field.label, v)}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => setNotesOpen((o) => !o)}
            className="text-gray-300 hover:text-gray-500 text-xs shrink-0"
            title="Add note"
          >📝</button>
        </div>
      ) : (
        // ── Inline layout for simple CI-only items ─────────────────────────
        <div className="flex items-center gap-3 flex-wrap">
          {item.displayText && (
            <span className="text-base font-black text-gray-700 min-w-[3.5rem] text-center shrink-0">
              {item.displayText}
            </span>
          )}
          <span className="text-sm text-gray-700 flex-1 min-w-0">{item.prompt}</span>
          <div className="flex items-center gap-2 shrink-0">
            {item.responseFields.map((field) => (
              <FieldRenderer
                key={field.label}
                field={field}
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            ))}
          </div>
          <button
            onClick={() => setNotesOpen((o) => !o)}
            className="text-gray-300 hover:text-gray-500 text-xs"
            title="Add note"
          >📝</button>
        </div>
      )}

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

      {item.notes && (
        <div className="text-xs text-blue-600 mt-0.5 italic">{item.notes}</div>
      )}
    </div>
  );
}

// ── FieldWithLabel ────────────────────────────────────────────────────────────

function FieldWithLabel({
  field, value, onChange,
}: {
  field: ResponseField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-20 text-right shrink-0 pt-1">{field.label}:</span>
      <FieldRenderer field={field} value={value} onChange={onChange} />
    </div>
  );
}

// ── FieldRenderer ─────────────────────────────────────────────────────────────

function FieldRenderer({
  field, value, onChange,
}: {
  field: ResponseField;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "correct_incorrect") {
    return <InlineCorrectIncorrect value={value} onChange={onChange} />;
  }
  if (field.type === "multi_strategy" && field.options) {
    return <MultiStrategySelector options={field.options} value={value} onChange={onChange} />;
  }
  return null;
}


// ── MultiStrategySelector — toggle checkboxes for multi-select strategies ─────

function MultiStrategySelector({
  options, value, onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const selected = value ? value.split(",").filter(Boolean) : [];

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.join(","));
  }

  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => toggle(opt)}
          className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
            selected.includes(opt)
              ? "bg-blue-600 border-blue-700 text-white"
              : "bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function InterviewAvASPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
