"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule2B, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-2b";
import InlineCorrectIncorrect from "@/components/InlineCorrectIncorrect";
import TeacherOverride from "@/components/TeacherOverride";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

// ── Color maps ───────────────────────────────────────────────────────────────

const COLOR_HEADER: Record<string, string> = {
  amber: "bg-amber-500 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  amber: "bg-amber-100/60 text-amber-900",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const scoreable = items.filter((i) =>
    i.responseFields.some((f) => f.type === "correct_incorrect")
  );
  if (scoreable.length === 0) return null;
  const correct = scoreable.filter((i) => {
    const f = i.responseFields.find((f) => f.type === "correct_incorrect");
    return f ? responses[i.id]?.[f.label] === "correct" : false;
  }).length;
  const attempted = scoreable.filter((i) => {
    const f = i.responseFields.find((f) => f.type === "correct_incorrect");
    const val = f ? responses[i.id]?.[f.label] : undefined;
    return val !== undefined && val !== "not_attempted";
  }).length;
  return { correct, total: attempted || scoreable.length };
}

// ── SN20 Scoring ─────────────────────────────────────────────────────────────
// Level 1: fingers 1–5 (≥3/4) AND dice patterns (≥4/5)
// Level 2: Level 1 AND small doubles (≥3/4) AND partitions of 10 (≥3/4)
// Level 3: Level 2 AND partitions of 5 (≥2/3) AND five-plus facts (≥3/4)

function calculateResults(responses: Responses) {
  const groups = schedule2B.taskGroups;

  const tg1Items11 = groups[0].items.filter((i) => i.number === "1.1");
  const tg2Items   = groups[1].items;
  const tg3Items   = groups[2].items;
  const tg4Items   = groups[3].items;
  const tg5Items   = groups[4].items;
  const tg6Items   = groups[5].items;

  const s11 = calcGroupScore(tg1Items11, responses);
  const s2  = calcGroupScore(tg2Items,   responses);
  const s3  = calcGroupScore(tg3Items,   responses);
  const s4  = calcGroupScore(tg4Items,   responses);
  const s5  = calcGroupScore(tg5Items,   responses);
  const s6  = calcGroupScore(tg6Items,   responses);

  const level1 = !!(s11 && s11.correct >= 3 && s2 && s2.correct >= 4);
  const level2 = level1 && !!(s3 && s3.correct >= 3 && s4 && s4.correct >= 3);
  const level3 = level2 && !!(s5 && s5.correct >= 2 && s6 && s6.correct >= 3);

  const sn20Level = level3 ? 3 : level2 ? 2 : level1 ? 1 : 0;

  return {
    sn20Level,
    scores: { s11, s2, s3, s4, s5, s6 },
  };
}

// ── Dice pattern component ───────────────────────────────────────────────────

// Standard dice dot positions (row/col in a 3×3 grid, 0-indexed)
const DICE_DOTS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DiceFace({ value, size = 48 }: { value: number; size?: number }) {
  const dots = DICE_DOTS[value] ?? [];
  const cellSize = size / 3;
  const dotR = cellSize * 0.28;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={1} y={1} width={size - 2} height={size - 2} rx={size * 0.12} ry={size * 0.12}
        fill="white" stroke="#d1d5db" strokeWidth={1.5} />
      {dots.map(([row, col], i) => (
        <circle
          key={i}
          cx={col * cellSize + cellSize / 2}
          cy={row * cellSize + cellSize / 2}
          r={dotR}
          fill="#1f2937"
        />
      ))}
    </svg>
  );
}

// Static dice card display — always visible as a teacher reference
function DiceCard({ value }: { value: number }) {
  return (
    <div className="border-2 border-blue-200 rounded-xl p-2 bg-white inline-flex flex-col items-center gap-0.5">
      <DiceFace value={value} size={56} />
      <span className="text-xs font-bold text-blue-400">{value}</span>
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

  const groups = schedule2B.taskGroups;
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
    setIsBorderline(calc.sn20Level > 0 && calc.sn20Level < 7);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const today = new Date().toISOString().split("T")[0];

      const { data: sessionData } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "schedule-2b",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

      if (sessionData?.id) {
      setSavedSessionId(sessionData.id);
      await supabase.from("construct_placements").insert([
        {
          session_id: sessionData.id,
          student_id: student.id,
          model_name: "SN20",
          suggested_level: calc.sn20Level,
          confirmed_level: calc.sn20Level,
          date_placed: today,
        },
      ]);
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

  // ── Results screen ──────────────────────────────────────────────────────────
  if (done && student && results) {
    const levelInfo = schedule2B.sn20Levels[results.sn20Level];
    const scoreRows = [
      { label: "1. Finger patterns 1–5",     score: results.scores.s11 },
      { label: "2. Regular configurations",  score: results.scores.s2  },
      { label: "3. Small doubles",            score: results.scores.s3  },
      { label: "4. Small partitions of 10",  score: results.scores.s4  },
      { label: "5. Partitions of 5",         score: results.scores.s5  },
      { label: "6. Five-plus facts",         score: results.scores.s6  },
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Schedule 2B — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
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

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested SN20 Placement</h3>
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 flex items-center gap-5 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">SN20</div>
                <div className="text-5xl font-black text-amber-700">{results.sn20Level}</div>
              </div>
              <div>
                <div className="font-semibold text-amber-800 text-sm">{levelInfo?.name}</div>
                <div className="text-amber-700 text-xs mt-1 leading-snug">{levelInfo?.description}</div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Score Breakdown</h3>
            <div className="space-y-1 text-sm mb-6">
              {scoreRows.map(({ label, score }) => score ? (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-semibold ${
                    score.correct / score.total >= 0.75 ? "text-green-600" :
                    score.correct / score.total >= 0.5  ? "text-yellow-600" : "text-red-500"
                  }`}>
                    {score.correct} / {score.total} {score.correct / score.total >= 0.75 ? "✓" : ""}
                  </span>
                </div>
              ) : null)}
            </div>

            <p className="text-xs text-gray-400 mb-4">
              * Suggested placement based on scoring thresholds. Teacher judgment should confirm final level.
            </p>

            {savedSessionId && (
              <TeacherOverride
                sessionId={savedSessionId}
                modelName="SN20"
                suggestedLevel={results.sn20Level}
                maxLevel={7}
                levelLabels={Object.fromEntries(
                  Object.entries(schedule2B.sn20Levels).map(([k, v]) => [Number(k), v.name])
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
          <span className="text-gray-500 text-sm">{schedule2B.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-blue-600" : i < currentGroupIdx ? "bg-blue-200" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials */}
      {currentGroupIdx === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {schedule2B.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Flash card reminder for TG2 */}
      {currentGroup.flashCard && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
          <span>🎴</span>
          <span>Use the <strong>physical dice pattern cards</strong>. Flash each card to the student for <strong>½ second</strong>. The card shown on screen is for your reference.</span>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: SN20 level descriptions */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — SN20
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* SN20 Level descriptions */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Structuring Numbers 1–20</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">SN20 Model Levels</div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {schedule2B.sn20Levels.map(({ level, name }) => {
                  const isGreyedOut = level >= 4;
                  return (
                    <div key={level} className={`flex items-start gap-2 rounded-lg px-3 py-2 border ${
                      isGreyedOut
                        ? "bg-gray-50/40 border-gray-100 opacity-40"
                        : "bg-gray-50 border-gray-100"
                    }`}>
                      <span className="text-xs font-bold text-gray-400 w-4 shrink-0 mt-0.5">{level}</span>
                      <span className={`text-xs leading-snug ${isGreyedOut ? "text-gray-400" : "text-gray-700"}`}>
                        {name}
                      </span>
                      {isGreyedOut && (
                        <span className="text-xs text-gray-300 ml-auto shrink-0">3B</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PDF notes */}
              <div className="mt-2">
                <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 leading-snug">
                  In each task group, if student uses counting, ask: <span className="italic">"Can you do it without counting?"</span>
                </div>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  isFlashCard={currentGroup.flashCard ?? false}
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
            <button
              onClick={() => setShowEndConfirm((v) => !v)}
              className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2"
            >
              End Early
            </button>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
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

// ── Sub-group section ─────────────────────────────────────────────────────────

function SubGroupSection({
  subLevel, items, isFirst, startNote, color, isFlashCard, responses, getResponse, setResponse,
}: {
  subLevel: string;
  items: AssessmentItem[];
  isFirst: boolean;
  startNote?: string | null;
  color: string;
  isFlashCard: boolean;
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

      <div className={`px-3 py-2 flex items-center justify-between ${COLOR_SUBHEAD[color] ?? "bg-gray-100 text-gray-900"}`}>
        <span className="text-xs font-bold">{subLevel}</span>
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
          <ItemRow
            key={item.id}
            item={item}
            isFlashCard={isFlashCard}
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
  item, isFlashCard, getResponse, setResponse,
}: {
  item: AssessmentItem;
  isFlashCard: boolean;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Dice card reference for regular configurations */}
        {isFlashCard && item.diceValue != null && (
          <DiceCard value={item.diceValue} />
        )}

        {/* Large display text for non-flash items */}
        {!isFlashCard && item.displayText && (
          <span className="text-2xl font-black text-gray-700 min-w-[2.5rem] text-center">
            {item.displayText}
          </span>
        )}

        {/* Prompt */}
        <span className="text-sm text-gray-700 flex-1 min-w-0">{item.prompt}</span>

        {/* Response fields */}
        {item.responseFields.map((field) => (
          <span key={field.label} className="flex items-center gap-1 shrink-0">
            {field.type === "correct_incorrect" && (
              <InlineCorrectIncorrect
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
            {field.type === "fluency_scale" && (
              <InlineFluency
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
            {field.type === "number_entry" && (
              <input
                type="text"
                placeholder={field.placeholder ?? "Enter #"}
                value={getResponse(item.id, field.label)}
                onChange={(e) => setResponse(item.id, field.label, e.target.value)}
                className="w-20 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              />
            )}
          </span>
        ))}

        {/* Notes toggle */}
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className="text-gray-300 hover:text-gray-500 text-xs ml-1"
          title="Add note"
        >
          📝
        </button>
      </div>

      {/* Expandable teacher note */}
      {notesOpen && (
        <input
          type="text"
          placeholder="Teacher note…"
          value={getResponse(item.id, "notes")}
          onChange={(e) => setResponse(item.id, "notes", e.target.value)}
          className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none focus:border-gray-400"
          autoFocus
        />
      )}

      {item.notes && (
        <div className="text-xs text-amber-600 mt-0.5 italic">{item.notes}</div>
      )}
    </div>
  );
}

// ── Inline controls ───────────────────────────────────────────────────────────


function InlineFluency({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { v: "fluent",   label: "Fluent",     active: "bg-green-500 border-green-600 text-white" },
    { v: "hesitant", label: "Hesitant",   active: "bg-yellow-500 border-yellow-600 text-white" },
    { v: "error",    label: "Not Fluent", active: "bg-red-500 border-red-600 text-white" },
  ];
  return (
    <div className="flex gap-1">
      {options.map(({ v, label, active }) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? "" : v)}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
            value === v ? active : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
          }`}
        >{label}</button>
      ))}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function Interview2BPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
