"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule2C, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-2c";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_HEADER: Record<string, string> = {
  pink: "bg-pink-500 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  pink: "border-pink-200 bg-pink-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  pink: "bg-pink-100/60 text-pink-900",
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

// ── SEAL Scoring ──────────────────────────────────────────────────────────────
// L0: Cannot complete TG1
// L1: Perceptual — TG1 correct (any strategy including CF1-3x)
// L2: Figurative — TG1 or TG3 correct with CF1-1x, or TG3 accessible
// L3: Counting-on — TG2 correct with COF or Non-counting
// L4: CDT/CUT — TG5 or TG6/7 correct with CDT, CUT
// L5: Facile — Non-counting consistently across 3+ tasks

function getStrategy(responses: Responses, itemId: string): string {
  return responses[itemId]?.Strategy ?? "";
}

function isCorrect(responses: Responses, itemId: string): boolean {
  return responses[itemId]?.Correct === "correct";
}

function calculateResults(responses: Responses) {
  // TG1 — Two Screened Collections
  const tg1Any = ["1.1", "1.2", "1.3"].some((id) => isCorrect(responses, id));
  const tg1Strategies = ["1.1", "1.2", "1.3"].map((id) => getStrategy(responses, id));
  const tg1HasFigurative = tg1Strategies.some((s) => s === "CF1-1x" || s === "COF" || s === "Non-counting" || s === "Known Fact");
  const tg1NonCounting = tg1Strategies.some((s) => s === "Non-counting" || s === "Known Fact");

  // TG2 — Missing Addend (key branching task)
  const tg2Correct = isCorrect(responses, "2.1");
  const tg2Strategy = getStrategy(responses, "2.1");
  const tg2CountingOn = tg2Correct && (tg2Strategy === "COF" || tg2Strategy === "Non-counting" || tg2Strategy === "Known Fact");

  // TG3 — Partially Screened
  const tg3Any = ["3.1", "3.2"].some((id) => isCorrect(responses, id));
  const tg3Strategies = ["3.1", "3.2"].map((id) => getStrategy(responses, id));
  const tg3NonCounting = tg3Strategies.some((s) => s === "Non-counting" || s === "Known Fact");

  // TG5 — Removed Items
  const tg5_1Correct = isCorrect(responses, "5.1");
  const tg5_2Correct = isCorrect(responses, "5.2");
  const tg5Strategies = ["5.1", "5.2", "5.3"].map((id) => getStrategy(responses, id));
  const tg5HasAdvanced = tg5Strategies.some((s) => s === "CDT" || s === "CUT" || s === "Non-counting");
  const tg5NonCounting = tg5Strategies.some((s) => s === "Non-counting");

  // TG6 — Written Subtraction
  const tg6Strategies = ["6.1", "6.2"].map((id) => getStrategy(responses, id));
  const tg6NonCounting = tg6Strategies.some((s) => s === "Non-counting");

  // TG7 — Missing Subtrahend
  const tg7Strategy = getStrategy(responses, "7.1");
  const tg7NonCounting = tg7Strategy === "Non-counting";

  // Count total non-counting observations
  const allStrategies = [...tg1Strategies, tg2Strategy, ...tg3Strategies, ...tg5Strategies, ...tg6Strategies, tg7Strategy];
  const nonCountingTotal = allStrategies.filter((s) => s === "Non-counting" || s === "Known Fact").length;

  // Level determination
  let sealLevel = 0;

  if (tg1Any) sealLevel = 1;
  if (sealLevel >= 1 && (tg1HasFigurative || tg3Any)) sealLevel = Math.max(sealLevel, 2);
  if (tg2CountingOn) sealLevel = Math.max(sealLevel, 3);
  if (sealLevel >= 3 && (tg5_1Correct || tg5_2Correct) && tg5HasAdvanced) sealLevel = Math.max(sealLevel, 4);
  if (nonCountingTotal >= 3 || (tg5NonCounting && tg6NonCounting) || (tg3NonCounting && tg5NonCounting)) sealLevel = Math.max(sealLevel, 5);

  return {
    sealLevel,
    details: { tg1Any, tg2CountingOn, tg2Strategy, tg3Any, tg5_1Correct, tg5_2Correct, tg5HasAdvanced, nonCountingTotal },
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const groups = schedule2C.taskGroups;
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
        assessment_id: "schedule-2c",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

    if (sessionData?.id) {
      await supabase.from("construct_placements").insert([
        {
          session_id: sessionData.id,
          student_id: student.id,
          model_name: "SEAL",
          suggested_level: calc.sealLevel,
          confirmed_level: calc.sealLevel,
          date_placed: today,
        },
      ]);
    }

    setSaving(false);
    setDone(true);
  }

  // ── Results screen ────────────────────────────────────────────────────────────
  if (done && student && results) {
    const levelInfo = schedule2C.sealLevels[results.sealLevel];
    const scoreRows = [
      { label: "TG1 — Two Screened Collections", value: results.details.tg1Any ? "✓ Completed" : "✗ Not completed" },
      { label: "TG2 — Missing Addend (counting-on?)", value: results.details.tg2CountingOn ? `✓ Yes (${results.details.tg2Strategy})` : "✗ Not yet counting-on" },
      { label: "TG3 — Partially Screened", value: results.details.tg3Any ? "✓ Completed" : "— Not administered" },
      { label: "TG5 — Removed Items (5.1 & 5.2)", value: (results.details.tg5_1Correct || results.details.tg5_2Correct) ? `✓ Correct ${results.details.tg5HasAdvanced ? "(advanced strategy)" : ""}` : "✗ Unsuccessful" },
      { label: "Non-counting observations", value: `${results.details.nonCountingTotal} task(s)` },
    ];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-md shadow-sm">
          <div className="mb-5">
            <div className="text-xs font-bold text-pink-500 uppercase tracking-wide mb-1">Assessment Complete</div>
            <p className="text-gray-500 text-sm mt-1">
              Schedule 2C — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
            </p>
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested SEAL Placement</h3>
          <div className="rounded-2xl border-2 border-pink-300 bg-pink-50 p-5 flex items-center gap-5 mb-6">
            <div className="text-center">
              <div className="text-xs font-bold text-pink-600 uppercase tracking-wide mb-1">SEAL</div>
              <div className="text-5xl font-black text-pink-700">{results.sealLevel}</div>
            </div>
            <div>
              <div className="font-semibold text-pink-800 text-sm">{levelInfo?.name}</div>
              <div className="text-pink-700 text-xs mt-1 leading-snug">{levelInfo?.description}</div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
          <div className="space-y-1 text-sm mb-6">
            {scoreRows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between py-1.5 border-b border-gray-100 gap-2">
                <span className="text-gray-600 text-xs">{label}</span>
                <span className={`font-semibold text-xs shrink-0 ${value.startsWith("✓") ? "text-green-600" : value.startsWith("✗") ? "text-red-500" : "text-gray-500"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mb-4">
            * Suggested placement based on strategies observed. Teacher judgment should confirm final level.
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
          <span className="text-gray-500 text-sm">{schedule2C.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-pink-500" : i < currentGroupIdx ? "bg-pink-200" : "bg-gray-200"
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
          {schedule2C.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: SEAL level descriptions */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — SEAL
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* SEAL Model */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Stages of Early Arithmetical Learning</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">SEAL Model</div>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {schedule2C.sealLevels.map(({ level, name }) => (
                  <div key={level} className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0 mt-0.5">{level}</span>
                    <span className="text-xs leading-snug text-gray-700">{name}</span>
                  </div>
                ))}
              </div>

              {/* Strategy key */}
              <div className="mt-3 border-t border-gray-100 pt-2">
                <div className="text-xs font-semibold text-gray-500 mb-1.5">Strategy Codes</div>
                <div className="space-y-0.5 text-xs text-gray-500">
                  <div><span className="font-bold text-gray-600">CF1-3x</span> Count-from-one (all items)</div>
                  <div><span className="font-bold text-gray-600">CF1-1x</span> Count-from-one (figurative)</div>
                  <div><span className="font-bold text-gray-600">COF</span> Count-on-from</div>
                  <div><span className="font-bold text-gray-600">CDF</span> Count-down-from</div>
                  <div><span className="font-bold text-gray-600">CDT</span> Count-down-to</div>
                  <div><span className="font-bold text-gray-600">CUT</span> Count-up-to</div>
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
              <div className="text-xs text-pink-700 bg-pink-50 border border-pink-200 rounded px-2 py-1.5 mt-2 font-medium">
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
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium"
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
  item, getResponse, setResponse,
}: {
  item: AssessmentItem;
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
            {field.type === "strategy_observed" && field.options && (
              <StrategyPicker
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
            className="w-full border border-pink-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400 bg-pink-50/40"
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

// ── Strategy picker ────────────────────────────────────────────────────────────

function StrategyPicker({
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
              ? "bg-pink-100 border-pink-400 text-pink-700"
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

export default function Schedule2CPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
