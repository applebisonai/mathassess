"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3E, TaskGroup, AssessmentItem, ResponseField } from "@/lib/assessments/schedule-3e";
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
  const resp = (id: string, label = "Response") => responses[id]?.[label] === "correct";

  // TG1: Forming equal groups
  const formGroups = resp("e1-form-4x5");
  const countTotal = resp("e1-count-total", "Total");

  // TG2: Multiplication with equal groups
  const mult4x3Screened   = resp("e2-mult-4x3");
  const mult4x3Unscreened = resp("e2-mult-unscreen");
  const mult4x3Flash      = resp("e2-mult-flash");
  const mult4x3AllUp      = resp("e2-mult-all-up");
  const mult8x3Ext        = resp("e2-mult-ext-8x3");

  // TG3: Quotition division
  const div20by4 = resp("e3-div-20by4");

  // TG4: Array introduction
  const introArray = resp("e4-intro-array");

  // TG5: Array multiplication
  const arr5x3Screened  = resp("e5-arr-5x3");
  const arr5x3UnTop     = resp("e5-arr-unscreen-top");
  const arr5x3UnAll     = resp("e5-arr-unscreen-all");
  const arr5x6Ext       = resp("e5-arr-ext-5x6");

  // TG6: Array division
  const div12by2 = resp("e6-div-12by2");
  const div12by4 = resp("e6-div-12by4");

  // TG7: Skip counting
  const skip2s = resp("e7-skip-2s");
  const skip5s = resp("e7-skip-5s");
  const skip3s = resp("e7-skip-3s");

  // TG8: Basic facts ranges 1–2
  const basicFacts1 = ["e8-fact-7x2","e8-fact-10x8","e8-fact-5x4","e8-fact-4x3"].filter((id) => resp(id)).length;

  // TG9: Basic facts range 3
  const basicFacts2 = ["e9-fact-3x8","e9-fact-9x4","e9-div-18by3","e9-div-40by5"].filter((id) => resp(id)).length;

  // TG10: Multiplicative relations
  const relations = ["e10-assoc-4x13","e10-inverse-12x9","e10-dist-10x15","e10-dist-5x14"].filter((id) => resp(id)).length;

  let emdLevel = 0;

  // Level 1: Can count items by ones in visible groups
  if (formGroups || mult4x3AllUp) emdLevel = Math.max(emdLevel, 1);

  // Level 2: Perceptual items, counted in multiples (skip counts visible items)
  if (countTotal && (skip2s || skip5s) && (mult4x3Flash || introArray)) emdLevel = Math.max(emdLevel, 2);

  // Level 3: Figurative — screened arrays/groups with skip counting
  if ((mult4x3Screened || arr5x3Screened) && (skip2s && skip5s && skip3s)) emdLevel = Math.max(emdLevel, 3);

  // Level 4: Abstract groups
  if ((div20by4 || div12by2 || div12by4) && basicFacts1 >= 3) emdLevel = Math.max(emdLevel, 4);

  // Level 5: Facile repeated addition
  if (basicFacts2 >= 3 && (mult8x3Ext || arr5x6Ext)) emdLevel = Math.max(emdLevel, 5);

  // Level 6: Multiplicative strategies
  if (relations >= 3) emdLevel = Math.max(emdLevel, 6);

  return {
    emdLevel,
    scores: {
      formingGroups:    { correct: [formGroups, countTotal].filter(Boolean).length,                       total: 2 },
      equalGroupsMult:  { correct: [mult4x3Screened, mult4x3Unscreened, mult4x3Flash, mult4x3AllUp].filter(Boolean).length, total: 4 },
      quotitionDiv:     { correct: div20by4 ? 1 : 0,                                                     total: 1 },
      arrayMult:        { correct: [arr5x3Screened, arr5x3UnTop, arr5x3UnAll].filter(Boolean).length,    total: 3 },
      arrayDiv:         { correct: [div12by2, div12by4].filter(Boolean).length,                          total: 2 },
      skipCounting:     { correct: [skip2s, skip5s, skip3s].filter(Boolean).length,                      total: 3 },
      basicFacts1And2:  { correct: basicFacts1,                                                           total: 4 },
      basicFacts3:      { correct: basicFacts2,                                                           total: 4 },
      multiplicative:   { correct: relations,                                                             total: 4 },
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

  const groups       = schedule3E.taskGroups;
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

  async function handleFinish() {
    if (!student) return;
    setSaving(true);
    const calc = calculateResults(responses);
    setResults(calc);
    setIsBorderline(calc.emdLevel > 0 && calc.emdLevel < 6);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData, error: sessionError } = await supabase
        .from("assessment_sessions")
        .insert({
          student_id:        student.id,
          teacher_id:        user.id,
          assessment_id:     "schedule-3e",
          date_administered: today,
          status:            "completed",
          raw_responses:     responses,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      if (sessionData?.id) {
      setSavedSessionId(sessionData.id);
        const { error: placementError } = await supabase.from("construct_placements").insert([{
          session_id:      sessionData.id,
          student_id:      student.id,
          model_name:      "EM&D",
          suggested_level: calc.emdLevel,
          confirmed_level: calc.emdLevel,
          date_placed:     today,
        }]);
        if (placementError) throw placementError;
      }

      setDone(true);
    } catch (err) {
      console.error("Failed to save assessment:", err);
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (done && student && results) {
    const levelInfo = schedule3E.emdLevels[results.emdLevel];
    const scoreRows: [string, { correct: number; total: number }, number][] = [
      ["Forming Groups",          results.scores.formingGroups,   2],
      ["Mult w/ Equal Groups",    results.scores.equalGroupsMult, 2],
      ["Quotition Division",      results.scores.quotitionDiv,    1],
      ["Array Multiplication",    results.scores.arrayMult,       2],
      ["Array Division",          results.scores.arrayDiv,        2],
      ["Skip Counting",           results.scores.skipCounting,    3],
      ["Basic Facts (Ranges 1–2)",results.scores.basicFacts1And2, 3],
      ["Basic Facts (Range 3)",   results.scores.basicFacts3,     3],
      ["Multiplicative Relations",results.scores.multiplicative,  3],
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Schedule 3E: Early Multiplication &amp; Division — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">EM&D</div>
                <div className="text-5xl font-black text-emerald-700">{results.emdLevel}</div>
              </div>
              <div>
                <div className="font-semibold text-emerald-800 text-sm">{levelInfo?.name}</div>
                <div className="text-emerald-700 text-xs mt-1 leading-snug">{levelInfo?.description}</div>
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
              * Suggested placement based on performance evidence and strategies observed. Teacher judgment should confirm final level.
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
              modelName="EM&D"
              suggestedLevel={results.emdLevel}
              maxLevel={6}
              levelLabels={Object.fromEntries(
                Object.entries(schedule3E.emdLevels).map(([k, v]) => [Number(k), v.name])
              )}
            />
          )}

          <div className="flex gap-3 mt-4">
              <button onClick={() => router.push("/assess/select")} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg py-2.5 text-sm">
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
          <span className="text-gray-500 text-sm">{schedule3E.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${i === currentGroupIdx ? "bg-emerald-600" : i < currentGroupIdx ? "bg-emerald-200" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>
      </div>

      {currentGroupIdx === 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {schedule3E.materials.map((m) => (
            <span key={m} className="bg-emerald-100 border border-emerald-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* LEFT: Level descriptions */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-emerald-700 text-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Task Group {currentGroup.number} — EM&D</div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Early Multiplication &amp; Division</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">Levels 0–6</div>
              </div>
              <div className="space-y-1.5">
                {schedule3E.emdLevels.map(({ level, name, description }) => (
                  <div key={level} className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100">
                    <span className="text-xs font-bold text-emerald-600 w-4 shrink-0 mt-0.5">{level}</span>
                    <div>
                      <div className="text-xs font-semibold leading-snug text-gray-800">{name}</div>
                      <div className="text-xs leading-snug text-gray-500 mt-0.5">{description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Teacher Script:</div>
              <div className="text-sm text-gray-800 italic">{currentGroup.teacherScript ?? currentGroup.instructions}</div>
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

          <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
            <button onClick={() => { setValidationError(null); setCurrentGroupIdx((i) => Math.max(0, i - 1)); }}
              disabled={isFirst} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              ← Previous
            </button>
            <div className="text-xs text-gray-400">Tap dots above to jump</div>
            {isLast ? (
              <button onClick={handleTryFinish} disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:bg-emerald-400">
                {saving ? "Saving…" : "✓ Finish & Score"}
              </button>
            ) : (
              <button onClick={handleTryNext}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
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
    <div className={`rounded-xl border-2 overflow-hidden ${isStartHere ? "border-green-400" : "border-emerald-200 bg-emerald-50/20"}`}>
      {isStartHere && (
        <div className="bg-green-500 px-3 py-1.5 flex items-center gap-2">
          <span className="text-white font-bold text-xs tracking-wide">▶ START HERE</span>
          {startNote && <span className="text-green-100 text-xs">{startNote}</span>}
        </div>
      )}
      <div className="px-3 py-1.5 flex items-center justify-between bg-emerald-100/60 text-emerald-900">
        <span className="text-xs font-semibold text-emerald-800">{subLevel}</span>
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
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
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
  const hasMultiStrategy = item.responseFields.some((f) => f.type === "multi_strategy");
  const useMulti = hasMultiStrategy || item.responseFields.length >= 3;

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
      {item.notes && <div className="text-xs text-emerald-600 mt-0.5 italic">{item.notes}</div>}
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
  if (field.type === "multi_strategy" && field.options) {
    return <MultiStrategySelector options={field.options} value={value} onChange={onChange} />;
  }
  return null;
}

function MultiStrategySelector({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const selected = value ? value.split(",").filter(Boolean) : [];
  function toggle(opt: string) {
    const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
    onChange(next.join(","));
  }
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button key={opt} onClick={() => toggle(opt)}
          className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
            selected.includes(opt) ? "bg-emerald-600 border-emerald-700 text-white" : "bg-white border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600"
          }`}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function Schedule3EPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
