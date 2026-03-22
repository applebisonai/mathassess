"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule3B, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-3b";

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

function calculateResults(responses: Responses) {
  const tg1 = schedule3B.taskGroups.find((g) => g.id === "tg1")!;
  const tg2 = schedule3B.taskGroups.find((g) => g.id === "tg2")!;
  const tg3 = schedule3B.taskGroups.find((g) => g.id === "tg3")!;
  const tg4 = schedule3B.taskGroups.find((g) => g.id === "tg4")!;
  const tg5 = schedule3B.taskGroups.find((g) => g.id === "tg5")!;

  // TG1: Spatial patterns
  const tg1Level3Items = tg1.items.filter((item) => item.targetLevel === 3);
  const tg1Level4Items = tg1.items.filter((item) => item.targetLevel === 4);
  const tg1Level5Items = tg1.items.filter((item) => item.targetLevel === 5);
  const tg1L3Correct = tg1Level3Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg1L4Correct = tg1Level4Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg1L5Correct = tg1Level5Items.filter((item) => isCorrect(responses, item.id)).length;

  // TG2: Partitions
  const tg2Level4Items = tg2.items.filter((item) => item.targetLevel === 4);
  const tg2Level5Items = tg2.items.filter((item) => item.targetLevel === 5);
  const tg2L4Correct = tg2Level4Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg2L5Correct = tg2Level5Items.filter((item) => isCorrect(responses, item.id)).length;

  // TG3: Doubles
  const tg3Level4Items = tg3.items.filter((item) => item.targetLevel === 4);
  const tg3Level5Items = tg3.items.filter((item) => item.targetLevel === 5);
  const tg3Level6Items = tg3.items.filter((item) => item.targetLevel === 6);
  const tg3L4Correct = tg3Level4Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg3L5Correct = tg3Level5Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg3L6Correct = tg3Level6Items.filter((item) => isCorrect(responses, item.id)).length;

  // TG4: Addition
  const tg4Level5Items = tg4.items.filter((item) => item.targetLevel === 5);
  const tg4Level6Items = tg4.items.filter((item) => item.targetLevel === 6);
  const tg4Level7Items = tg4.items.filter((item) => item.targetLevel === 7);
  const tg4L5Correct = tg4Level5Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg4L6Correct = tg4Level6Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg4L7Correct = tg4Level7Items.filter((item) => isCorrect(responses, item.id)).length;

  // TG5: Subtraction
  const tg5Level6Items = tg5.items.filter((item) => item.targetLevel === 6);
  const tg5Level7Items = tg5.items.filter((item) => item.targetLevel === 7);
  const tg5L6Correct = tg5Level6Items.filter((item) => isCorrect(responses, item.id)).length;
  const tg5L7Correct = tg5Level7Items.filter((item) => isCorrect(responses, item.id)).length;

  // Calculate SN20 level based on ≥50% correct at each level
  let sn20Level = 0;
  if (tg1L3Correct >= 2 || tg2L4Correct >= 2 || tg3L4Correct >= 1) sn20Level = Math.max(sn20Level, 3);
  if (tg1L4Correct >= 2 || tg2L4Correct >= 2) sn20Level = Math.max(sn20Level, 4);
  if (tg1L5Correct >= 2 || tg2L5Correct >= 2 || tg3L5Correct >= 2 || tg4L5Correct >= 1) sn20Level = Math.max(sn20Level, 5);
  if (tg3L6Correct >= 2 || tg4L6Correct >= 2 || tg5L6Correct >= 2) sn20Level = Math.max(sn20Level, 6);
  if (tg4L7Correct >= 2 || tg5L7Correct >= 3) sn20Level = Math.max(sn20Level, 7);

  return {
    sn20Level,
    scores: {
      tg1_l3: tg1L3Correct,
      tg1_l4: tg1L4Correct,
      tg1_l5: tg1L5Correct,
      tg2_l4: tg2L4Correct,
      tg2_l5: tg2L5Correct,
      tg3_l4: tg3L4Correct,
      tg3_l5: tg3L5Correct,
      tg3_l6: tg3L6Correct,
      tg4_l5: tg4L5Correct,
      tg4_l6: tg4L6Correct,
      tg4_l7: tg4L7Correct,
      tg5_l6: tg5L6Correct,
      tg5_l7: tg5L7Correct,
    },
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
  }, [studentId]);

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
        assessment_id: "schedule-3b",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

    if (sessionData?.id) {
      const placements = [
        { model_name: "SN20", suggested_level: calc.sn20Level, confirmed_level: calc.sn20Level },
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
    const sn20Info = schedule3B.sn20Levels[results.sn20Level];

    const scoreRows = [
      { label: "TG1 — Level 3 (Spatial)", value: `${results.scores.tg1_l3}/3` },
      { label: "TG1 — Level 4 (Ten-wise)", value: `${results.scores.tg1_l4}/3` },
      { label: "TG1 — Level 5 (Tens frame)", value: `${results.scores.tg1_l5}/3` },
      { label: "TG2 — Level 4 (Complements)", value: `${results.scores.tg2_l4}/4` },
      { label: "TG2 — Level 5 (Partitions)", value: `${results.scores.tg2_l5}/3` },
      { label: "TG3 — Level 4 (Doubles)", value: `${results.scores.tg3_l4}/2` },
      { label: "TG3 — Level 5 (Near-doubles)", value: `${results.scores.tg3_l5}/3` },
      { label: "TG3 — Level 6 (Fluency)", value: `${results.scores.tg3_l6}/2` },
      { label: "TG4 — Level 5 (Add parts)", value: `${results.scores.tg4_l5}/2` },
      { label: "TG4 — Level 6 (Add crosses)", value: `${results.scores.tg4_l6}/3` },
      { label: "TG4 — Level 7 (Add whole)", value: `${results.scores.tg4_l7}/3` },
      { label: "TG5 — Level 6 (Sub parts)", value: `${results.scores.tg5_l6}/3` },
      { label: "TG5 — Level 7 (Sub whole)", value: `${results.scores.tg5_l7}/4` },
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

          {/* SN20 Placement */}
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
          <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 flex flex-col items-center gap-2 mb-5">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">SN20 Level</div>
            <div className="text-4xl font-black text-indigo-700">{results.sn20Level}</div>
            <div className="text-indigo-700 text-xs text-center leading-snug">{sn20Info?.name ?? ""}</div>
          </div>

          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
          <div className="space-y-1 text-sm mb-6">
            {scoreRows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between py-1.5 border-b border-gray-100 gap-2">
                <span className="text-gray-600 text-xs">{label}</span>
                <span className="font-semibold text-xs shrink-0 text-indigo-700">{value}</span>
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
          </div>
        </div>

        {/* RIGHT: Scoring */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">✏️ Teacher Scoring — {currentGroup.name}</div>
            {currentGroup.branchingNote && (
              <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-2 py-1.5 mt-2 font-medium">
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
