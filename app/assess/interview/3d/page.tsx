"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3D, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-3d";

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
  orange: "bg-orange-500 text-white",
};
const COLOR_SUBGROUP: Record<string, string> = {
  orange: "border-orange-200 bg-orange-50/30",
};
const COLOR_SUBHEAD: Record<string, string> = {
  orange: "bg-orange-100/60 text-orange-900",
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

// ── Scoring ───────────────────────────────────────────────────────────────────

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
  const tg = (id: string) => schedule3D.taskGroups.find((g) => g.id === id)!;

  const tg1 = tg("tg1");   // Add/sub decuple
  const tg2 = tg("tg2");   // 2-digit no regroup
  const tg3 = tg("tg3");   // 2-digit add regroup (L5)
  const tg4 = tg("tg4");   // 2-digit sub regroup (L6)
  const tg5 = tg("tg5");   // 3-digit regroup (L6+)
  const tg6 = tg("tg6");   // Decuple after/before (L1)
  const tg7 = tg("tg7");   // Add-up-from/sub-down-to (L1)
  const tg8 = tg("tg8");   // To/from decuple small (L2)
  const tg9 = tg("tg9");   // To/from decuple large (L3)
  const tg10 = tg("tg10"); // Across decuple (L4)

  const s = {
    tg1:  countCorrect(responses, tg1.items),
    tg2:  countCorrect(responses, tg2.items),
    tg3:  countCorrect(responses, tg3.items),
    tg4:  countCorrect(responses, tg4.items),
    tg5:  countCorrect(responses, tg5.items),
    tg6:  countCorrect(responses, tg6.items),
    tg7:  countCorrect(responses, tg7.items),
    tg8:  countCorrect(responses, tg8.items),
    tg9:  countCorrect(responses, tg9.items),
    tg10: countCorrect(responses, tg10.items),
  };

  // A&S level determination
  // L6: facile 2-digit subtraction with regrouping (TG4 ≥1/2)
  // L5: facile 2-digit addition with regrouping (TG3 ≥1/2)
  // L4: add/sub across decuple (TG10 ≥1/2)
  // L3: to/from decuple large (TG9 ≥1/2)
  // L2: to/from decuple small (TG8 ≥1/2)
  // L1: decuple after/before or add-up-from (TG6 or TG7 ≥1/2)
  // L0: emergent

  let asLevel = 0;
  if (s.tg6 >= 1 || s.tg7 >= 1 || s.tg1 >= 1) asLevel = 1;
  if (s.tg8 >= 1 || s.tg2 >= 1) asLevel = Math.max(asLevel, 2);
  if (s.tg9 >= 1) asLevel = Math.max(asLevel, 3);
  if (s.tg10 >= 1) asLevel = Math.max(asLevel, 4);
  if (s.tg3 >= 1) asLevel = Math.max(asLevel, 5);
  if (s.tg4 >= 1) asLevel = Math.max(asLevel, 6);

  return { asLevel, scores: s };
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

  const groups = schedule3D.taskGroups;
  const currentGroup = groups[currentGroupIdx];
  const isFirst = currentGroupIdx === 0;
  const isLast = currentGroupIdx === groups.length - 1;

  function handleSkip() {
    if (!currentGroup.skipToId) return;
    const targetIdx = groups.findIndex((g) => g.id === currentGroup.skipToId);
    if (targetIdx !== -1) { setValidationError(null); setCurrentGroupIdx(targetIdx); }
  }

  useEffect(() => {
    if (!studentId) return;
    supabase
      .from("students")
      .select("id, first_name, last_name, grade_level")
      .eq("id", studentId)
      .single()
      .then(({ data }) => { if (data) setStudent(data); });
  }, [studentId]);

  function getResponse(itemId: string, field: string): string {
    return responses[itemId]?.[field] ?? "";
  }

  function setResponse(itemId: string, field: string, value: string) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), [field]: value },
    }));
    if (validationError) setValidationError(null);
  }

  function getRequiredButUnanswered(group: typeof currentGroup): AssessmentItem[] {
    return group.items.filter((item) =>
      item.responseFields.some(
          (f) =>
            (f.type === "correct_incorrect" || (f.type as string) === "fluency_scale") &&
            !responses[item.id]?.[f.label]
        )
    );
  }

  async function handleTryFinish() {
    const missing = getRequiredButUnanswered(currentGroup);
    if (missing.length > 0) {
      setValidationError(`Please answer all ${missing.length} required item${missing.length > 1 ? "s" : ""} before submitting.`);
      return;
    }
    setValidationError(null);
    setSaving(true);
    setSaveError(null);
    const calc = calculateResults(responses);
    setResults(calc);
    setIsBorderline(calc.asLevel > 0 && calc.asLevel < 6);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaving(false); return; }

      const today = new Date().toISOString().split("T")[0];
      const { data: session, error: sessionError } = await supabase
        .from("assessment_sessions")
        .insert({
          student_id: studentId,
          teacher_id: user.id,
          assessment_id: "schedule-3d",
          date_administered: today,
          status: "completed",
          raw_responses: responses,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      if (session) {
        const { error: placementError } = await supabase.from("construct_placements").insert({
          session_id: session.id,
          student_id: studentId,
          date_placed: today,
          model_name: "A&S",
          suggested_level: calc.asLevel,
          confirmed_level: calc.asLevel,
        });
        if (placementError) throw placementError;
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

  function handleEndEarly() {
    // Score immediately — blank/unanswered items already evaluate as incorrect
    // in calculateResults() since resp(id) checks for === "correct".
    // No validation needed; teacher is intentionally stopping early.
    handleTryFinish();
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  if (done && student && results) {
    const asInfo = schedule3D.asLevels[results.asLevel];
    const s = results.scores;

    const scoreRows = [
      { label: "TG1 — Add/subtract a decuple (2 items)",              value: `${s.tg1}/2`,  level: 1 },
      { label: "TG2 — 2-digit without regrouping (2 items)",          value: `${s.tg2}/2`,  level: 2 },
      { label: "TG3 — 2-digit addition with regrouping (2 items)",    value: `${s.tg3}/2`,  level: 5 },
      { label: "TG4 — 2-digit subtraction with regrouping (2 items)", value: `${s.tg4}/2`,  level: 6 },
      { label: "TG5 — 3-digit with regrouping (2 items)",             value: `${s.tg5}/2`,  level: 6 },
      { label: "TG6 — Decuple after/before (2 items)",                value: `${s.tg6}/2`,  level: 1 },
      { label: "TG7 — Add-up-from/sub-down-to decuple (2 items)",     value: `${s.tg7}/2`,  level: 1 },
      { label: "TG8 — To/from decuple, small 1–5 (2 items)",          value: `${s.tg8}/2`,  level: 2 },
      { label: "TG9 — To/from decuple, large 6–9 (2 items)",          value: `${s.tg9}/2`,  level: 3 },
      { label: "TG10 — Add/subtract across a decuple (2 items)",      value: `${s.tg10}/2`, level: 4 },
    ];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-lg shadow-sm">
          <div className="mb-5">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">Assessment Complete</div>
            <p className="text-gray-500 text-sm mt-1">
              Schedule 3D — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
            </p>
          </div>

          {/* A&S Placement */}
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
          <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-4 flex flex-col items-center gap-2 mb-5">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wide">A&S Level</div>
            <div className="text-4xl font-black text-orange-600">{results.asLevel}</div>
            <div className="text-orange-700 text-xs text-center leading-snug">{asInfo?.name ?? ""}</div>
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
          <div className="space-y-1 text-sm mb-6">
            {scoreRows.map(({ label, value, level }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-100 gap-2">
                <span className="text-gray-600 text-xs flex-1">{label}</span>
                <span className="text-xs text-gray-400 shrink-0">L{level}</span>
                <span className="font-semibold text-xs shrink-0 text-orange-600 w-10 text-right">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            * Suggested placement based on observed responses. Teacher judgment should confirm final level.
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
              modelName="A&S"
              suggestedLevel={results.asLevel}
              maxLevel={6}
              levelLabels={Object.fromEntries(
                Object.entries(schedule3D.asLevels).map(([k, v]) => [Number(k), v.name])
              )}
            />
          )}

          <button
            onClick={() => router.push(`/students/${studentId}`)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl py-3 text-sm transition-colors"
          >
            View Student Profile →
          </button>
        </div>
      </div>
    );
  }

  // ── Interview screen ───────────────────────────────────────────────────────
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
          <span className="text-gray-500 text-sm">{schedule3D.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-orange-500" : i < currentGroupIdx ? "bg-orange-300" : "bg-gray-200"
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
          {schedule3D.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Section banner for Part B */}
      {currentGroupIdx === 5 && (
        <div className="bg-orange-600 px-4 py-2 text-xs text-white font-medium">
          📐 Part B — Higher Decade Addition and Subtraction: Show Decuple Line first, then use Numeral Cards
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: A&S model levels + teacher script */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — {currentGroup.model}
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* A&S model levels */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Addition & Subtraction to 100</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">A&S Levels</div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {schedule3D.asLevels.map(({ level, name }) => (
                  <div key={level} className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0 mt-0.5">{level}</span>
                    <span className="text-xs leading-snug text-gray-700">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start note */}
            {currentGroup.startNote && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 px-3 py-2">
                <p className="text-xs text-blue-700 font-medium">▶ {currentGroup.startNote}</p>
              </div>
            )}

            {/* Teacher script */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Teacher Script:</div>
              <div className="text-sm text-gray-800 italic">{currentGroup.teacherScript ?? currentGroup.instructions}</div>
              {currentGroup.materials && (
                <div className="text-xs text-gray-400 mt-2">📦 {currentGroup.materials}</div>
              )}
            </div>

            {/* Full instructions */}
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3">
              <div className="text-xs text-orange-700 leading-snug">
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
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
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

      <div className="divide-y divide-orange-100/50">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            getResponse={getResponse}
            setResponse={setResponse}
          />
        ))}
      </div>
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

  // Split prompt into lines; detect whether this is an arrowed question list
  const lines = item.prompt.split("\n");
  const hasArrows = lines.some((l) => l.startsWith("→"));

  return (
    <div className="px-3 py-3 space-y-2">
      {/* Header row: display text (numeral card) + notes toggle */}
      <div className="flex items-start justify-between gap-2">
        {item.displayText && (
          <div className="text-2xl font-black text-gray-900 font-mono leading-none">{item.displayText}</div>
        )}
        <button
          onClick={() => setNotesOpen((v) => !v)}
          className={`text-base shrink-0 transition-opacity ml-auto ${notesOpen ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
          title="Add note"
        >📝</button>
      </div>

      {/* Prompt — arrowed lines get an input box after each question */}
      <div className="space-y-1.5">
        {hasArrows ? (
          lines.map((line, i) => {
            if (line.startsWith("Show card:")) {
              // "Show card: 58" → subtle label
              return (
                <div key={i} className="text-xs text-gray-400 font-medium tracking-wide">
                  {line}
                </div>
              );
            }
            if (line.startsWith("→")) {
              const questionText = line.slice(1).trim(); // strip "→ "
              const responseKey = `q:${i}:${questionText}`;
              return (
                <div key={i} className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-700 font-medium">{line}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="___"
                    value={getResponse(item.id, responseKey)}
                    onChange={(e) => setResponse(item.id, responseKey, e.target.value)}
                    className="w-20 border-2 border-orange-300 rounded-lg px-2 py-1 text-sm font-bold text-center text-orange-800 bg-orange-50 focus:outline-none focus:border-orange-500 placeholder-orange-200"
                  />
                </div>
              );
            }
            // Any other line
            return (
              <div key={i} className="text-xs text-gray-600">{line}</div>
            );
          })
        ) : (
          /* Non-arrowed items (TG1–5): plain prompt + displayText already shown above */
          <div className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{item.prompt}</div>
        )}
        {item.notes && (
          <div className="text-xs text-blue-600 italic">{item.notes}</div>
        )}
      </div>

      {/* Response fields (Correct / Strategy) */}
      <div className="flex flex-wrap gap-3 mt-1">
        {item.responseFields.map((field) => (
          <ResponseFieldWidget
            key={field.label}
            field={field}
            value={getResponse(item.id, field.label)}
            onChange={(v) => setResponse(item.id, field.label, v)}
          />
        ))}
      </div>

      {/* Notes input */}
      {notesOpen && (
        <div className="mt-1">
          <input
            type="text"
            placeholder="Teacher observation…"
            value={getResponse(item.id, "notes")}
            onChange={(e) => setResponse(item.id, "notes", e.target.value)}
            className="w-full border border-orange-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 bg-orange-50/40"
          />
        </div>
      )}
    </div>
  );
}

// ── Response field widget ─────────────────────────────────────────────────────

function ResponseFieldWidget({
  field, value, onChange,
}: {
  field: { label: string; type: string; options?: string[] };
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "correct_incorrect") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">{field.label}:</span>
        {["correct", "incorrect"].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              value === opt
                ? opt === "correct"
                  ? "bg-green-100 border-green-400 text-green-800"
                  : "bg-red-100 border-red-400 text-red-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {opt === "correct" ? "✓ Correct" : "✗ Incorrect"}
          </button>
        ))}
      </div>
    );
  }

  // strategy_select
  return (
    <div className="flex flex-wrap gap-1 items-center">
      <span className="text-xs text-gray-400 mr-0.5">{field.label}:</span>
      {(field.options ?? []).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${
            value === opt
              ? "bg-orange-100 border-orange-400 text-orange-700"
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

export default function Schedule3DPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
