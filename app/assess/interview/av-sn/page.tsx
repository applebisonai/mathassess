"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { scheduleAvSN, TaskGroup, AssessmentItem, ResponseField } from "@/lib/assessments/schedule-av-sn";

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

// ── Scoring logic ─────────────────────────────────────────────────────────────

function calculateResults(responses: Responses) {
  // Helper: check if the first CI field of an item is "correct"
  const resp = (id: string) => responses[id]?.["Response"] === "correct";
  const altogether = (id: string) => responses[id]?.["Altogether"] === "correct";

  // TG1: Spatial Patterns
  const regularSpatial   = ["sn1-reg-4","sn1-reg-3","sn1-reg-6","sn1-reg-5"].filter(resp).length;
  const irregularSpatial = ["sn1-irr-4","sn1-irr-6","sn1-irr-3","sn1-irr-5"].filter(resp).length;

  // TG2: Finger Patterns
  const displayFingers = ["sn2-disp-4","sn2-disp-3","sn2-disp-9","sn2-disp-6","sn2-disp-8"].filter(resp).length;
  const moreThanOneWay = ["sn2-mtow-5a","sn2-mtow-5b","sn2-mtow-7a","sn2-mtow-7b"].filter(resp).length;

  // TG3: WITH Materials
  const partOf5  = ["sn3-p5-4","sn3-p5-2","sn3-p5-1","sn3-p5-3"].filter(resp).length;
  const partOf10 = ["sn3-p10-8","sn3-p10-6","sn3-p10-3","sn3-p10-4"].filter(resp).length;
  const combTo20 = ["sn3-c20-8p8","sn3-c20-7p6","sn3-c20-10p4","sn3-c20-5p2"].filter(altogether).length;

  // TG4: NO Materials
  const noMatTo5  = ["sn4-c5-3","sn4-c5-1"].filter(resp).length;
  const noMatTo10 = ["sn4-c10-7","sn4-c10-4","sn4-c10-1"].filter(resp).length;
  const noMatTo20 = ["sn4-c20-10of18","sn4-c20-7of20","sn4-c20-9of16"].filter(resp).length;

  // TG5: Bare Numbers
  const bareBasic = ["sn5-2p3"].filter(resp).length;
  const bareTo10  = ["sn5-5p4","sn5-3p3","sn5-9m6","sn5-8m4"].filter(resp).length;
  const bareTo20  = ["sn5-9p9","sn5-10p6","sn5-13m5","sn5-20m6"].filter(resp).length;

  let snLevel = 0;

  // Level 1: Facile spatial patterns + basic finger patterns
  if (regularSpatial >= 3 && irregularSpatial >= 3) snLevel = Math.max(snLevel, 1);

  // Level 2: Finger patterns to 10 + partitions WITH materials
  if (displayFingers >= 4 && moreThanOneWay >= 3 && partOf5 >= 3 && partOf10 >= 3)
    snLevel = Math.max(snLevel, 2);

  // Level 3: Partitions WITHOUT materials + bare numbers to 10
  if (noMatTo5 >= 2 && noMatTo10 >= 2 && bareTo10 >= 3)
    snLevel = Math.max(snLevel, 3);

  // Level 4: Combinations to 20 WITH materials
  if (combTo20 >= 3) snLevel = Math.max(snLevel, 4);

  // Level 5: Partitions WITHOUT materials to 20 + bare numbers to 20
  if (noMatTo20 >= 2 && bareTo20 >= 3) snLevel = Math.max(snLevel, 5);

  return {
    snLevel,
    scores: {
      regularSpatial:   { correct: regularSpatial,   total: 4 },
      irregularSpatial: { correct: irregularSpatial, total: 4 },
      displayFingers:   { correct: displayFingers,   total: 5 },
      moreThanOneWay:   { correct: moreThanOneWay,   total: 4 },
      partOf5:          { correct: partOf5,          total: 4 },
      partOf10:         { correct: partOf10,         total: 4 },
      combTo20:         { correct: combTo20,         total: 4 },
      noMatTo5:         { correct: noMatTo5,         total: 2 },
      noMatTo10:        { correct: noMatTo10,        total: 3 },
      noMatTo20:        { correct: noMatTo20,        total: 3 },
      bareBasic:        { correct: bareBasic,        total: 1 },
      bareTo10:         { correct: bareTo10,         total: 4 },
      bareTo20:         { correct: bareTo20,         total: 4 },
    },
  };
}

// ── Main interview component ──────────────────────────────────────────────────

function InterviewContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("student");
  const router = useRouter();
  const supabase = createClient();

  const [student, setStudent]         = useState<Student | null>(null);
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [responses, setResponses]     = useState<Responses>({});
  const [saving, setSaving]           = useState(false);
  const [done, setDone]               = useState(false);
  const [results, setResults]         = useState<ReturnType<typeof calculateResults> | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const groups       = scheduleAvSN.taskGroups;
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

  // Auto-mark items BEFORE START HERE as correct when navigating to a group
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
        assessment_id: "av-sn",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

    if (sessionData?.id) {
      await supabase.from("construct_placements").insert([{
        session_id:      sessionData.id,
        student_id:      student.id,
        model_name:      "SN",
        suggested_level: calc.snLevel,
        confirmed_level: calc.snLevel,
        date_placed:     today,
      }]);
    }

    setSaving(false);
    setDone(true);
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (done && student && results) {
    const snLevelInfo = scheduleAvSN.snLevels[results.snLevel];
    const scoreRows: [string, { correct: number; total: number }, number][] = [
      ["Regular Spatial Patterns",   results.scores.regularSpatial,   3],
      ["Irregular Spatial Patterns", results.scores.irregularSpatial, 3],
      ["Displaying Finger Patterns", results.scores.displayFingers,   4],
      ["Fingers: More Than One Way", results.scores.moreThanOneWay,   3],
      ["Partitions of 5 (w/ mat.)",  results.scores.partOf5,          3],
      ["Partitions of 10 (w/ mat.)", results.scores.partOf10,         3],
      ["Combinations to 20 (w/ mat.)",results.scores.combTo20,        3],
      ["Partition to 5 (no mat.)",   results.scores.noMatTo5,         2],
      ["Partition to 10 (no mat.)",  results.scores.noMatTo10,        2],
      ["Partition to 20 (no mat.)",  results.scores.noMatTo20,        2],
      ["Bare Numbers: Basic",        results.scores.bareBasic,        1],
      ["Bare Numbers: To 10",        results.scores.bareTo10,         3],
      ["Bare Numbers: To 20",        results.scores.bareTo20,         3],
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Add+VantageMR Structuring Numbers — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placement</h3>
            <div className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-4 flex items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">SN</div>
                <div className="text-5xl font-black text-orange-700">{results.snLevel}</div>
              </div>
              <div>
                <div className="font-semibold text-orange-800 text-sm">{snLevelInfo?.name}</div>
                <div className="text-orange-700 text-xs mt-1 leading-snug">{snLevelInfo?.description}</div>
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
              * Suggested placement based on performance evidence. Teacher judgment and strategy observations should confirm final level.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/assess/select")}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg py-2.5 text-sm"
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
          <span className="text-gray-500 text-sm">{scheduleAvSN.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-orange-600" : i < currentGroupIdx ? "bg-orange-200" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials banner (first group) */}
      {currentGroupIdx === 0 && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 text-xs text-orange-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {scheduleAvSN.materials.map((m) => (
            <span key={m} className="bg-orange-100 border border-orange-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: SN level descriptions + teacher script */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-orange-600 text-white px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — SN
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* SN level descriptions */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">Structuring Numbers</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">Levels 0–5</div>
              </div>
              <div className="space-y-1.5">
                {scheduleAvSN.snLevels.map(({ level, name, description }) => (
                  <div
                    key={level}
                    className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100"
                  >
                    <span className="text-xs font-bold text-orange-600 w-4 shrink-0 mt-0.5">{level}</span>
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

            {/* Strategy key for current group */}
            <StrategyKey group={currentGroup} />
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
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium"
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

// ── Strategy key (left panel) ─────────────────────────────────────────────────

function StrategyKey({ group }: { group: TaskGroup }) {
  // Collect unique strategy option sets used in this group
  const allOptions = new Set<string>();
  group.items.forEach((item) => {
    item.responseFields.forEach((f) => {
      if (f.type === "strategy" && f.options) f.options.forEach((o) => allOptions.add(o));
    });
  });
  if (allOptions.size === 0) return null;

  const keyMap: Record<string, string> = {
    K:   "Knows Immediately",
    P:   "Partitions",
    C:   "Counts",
    CF1: "Counts From 1",
    "CF_": "Counts From another number",
    F:   "Uses Fingers",
    A5:  "Adds through 5",
    A10: "Adds through 10",
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
      <div className="text-xs font-bold text-orange-700 mb-2 uppercase tracking-wide">Strategy Key</div>
      <div className="space-y-1">
        {Array.from(allOptions).map((code) => (
          <div key={code} className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-600 w-8 shrink-0">{code}</span>
            <span className="text-xs text-gray-600">{keyMap[code] ?? code}</span>
          </div>
        ))}
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
  const score = calcGroupScore(items, responses);
  const isStartHere = startAtItem ? items.some((i) => i.id === startAtItem) : false;

  // All-correct covers only CI fields
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
    <div className={`rounded-xl border-2 overflow-hidden ${isStartHere ? "border-green-400" : "border-orange-200 bg-orange-50/30"}`}>
      {/* START HERE banner */}
      {isStartHere && (
        <div className="bg-green-500 px-3 py-1.5 flex items-center gap-2">
          <span className="text-white font-bold text-xs tracking-wide">▶ START HERE</span>
          {startNote && <span className="text-green-100 text-xs">{startNote}</span>}
        </div>
      )}

      {/* Sub-group header */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-orange-100/60 text-orange-900">
        <span className="text-xs font-semibold text-orange-800">{subLevel}</span>
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

  // Detect layout type:
  //  - "multi" → 3+ fields or mixed types (text + CI) → vertical with labels
  //  - "inline" → 1–2 fields, same or compatible types → horizontal, no labels
  const hasMixed  = item.responseFields.some((f) => f.type === "text_input");
  const useMulti  = item.responseFields.length >= 3 || (hasMixed && item.responseFields.length > 1);

  return (
    <div className="px-3 py-3">
      {useMulti ? (
        // ── Multi-field layout (e.g. TG3 Combinations to 20) ──────────────
        <div className="flex items-start gap-3">
          {item.displayText && (
            <span className="text-base font-black text-gray-700 min-w-[3.5rem] text-center shrink-0">
              {item.displayText}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-700 mb-2">{item.prompt}</div>
            <div className="flex flex-col gap-1.5">
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
        // ── Inline layout (TG1/TG2/TG4/TG5 — display + CI + strategy) ────
        <div className="flex items-center gap-3 flex-wrap">
          {item.displayText && (
            <span className="text-base font-black text-gray-700 min-w-[3rem] text-center shrink-0">
              {item.displayText}
            </span>
          )}
          <span className="text-sm text-gray-700 flex-1 min-w-0">{item.prompt}</span>
          <div className="flex items-center gap-2 shrink-0">
            {item.responseFields.map((field) => (
              <FieldInline
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
        <div className="text-xs text-orange-600 mt-0.5 italic">{item.notes}</div>
      )}
    </div>
  );
}

// ── FieldWithLabel: labelled field for multi-field layout ─────────────────────

function FieldWithLabel({
  field, value, onChange,
}: {
  field: ResponseField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-20 text-right shrink-0">{field.label}:</span>
      <FieldRenderer field={field} value={value} onChange={onChange} />
    </div>
  );
}

// ── FieldInline: no label, for inline layout ──────────────────────────────────

function FieldInline({
  field, value, onChange,
}: {
  field: ResponseField;
  value: string;
  onChange: (v: string) => void;
}) {
  return <FieldRenderer field={field} value={value} onChange={onChange} />;
}

// ── FieldRenderer: renders the correct input for a ResponseField ──────────────

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
  if (field.type === "text_input") {
    return (
      <input
        type="text"
        placeholder={field.placeholder ?? ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 border border-orange-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-orange-500 text-center"
      />
    );
  }
  if (field.type === "strategy" && field.options) {
    return (
      <StrategySelector
        options={field.options}
        value={value}
        onChange={onChange}
      />
    );
  }
  return null;
}

// ── InlineCorrectIncorrect ────────────────────────────────────────────────────

function InlineCorrectIncorrect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange(value === "correct" ? "" : "correct")}
        className={`w-7 h-7 rounded text-sm font-bold border transition-all ${
          value === "correct"
            ? "bg-green-500 border-green-600 text-white"
            : "bg-white border-gray-300 text-gray-400 hover:border-green-400"
        }`}
      >✓</button>
      <button
        onClick={() => onChange(value === "incorrect" ? "" : "incorrect")}
        className={`w-7 h-7 rounded text-sm font-bold border transition-all ${
          value === "incorrect"
            ? "bg-red-500 border-red-600 text-white"
            : "bg-white border-gray-300 text-gray-400 hover:border-red-400"
        }`}
      >✗</button>
    </div>
  );
}

// ── StrategySelector ──────────────────────────────────────────────────────────

function StrategySelector({
  options, value, onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-1.5 py-0.5 rounded text-xs font-bold border transition-all ${
            value === opt
              ? "bg-orange-500 border-orange-600 text-white"
              : "bg-white border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-600"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function InterviewAvSNPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
