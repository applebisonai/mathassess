"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule2A, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-2a";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

const COLOR_HEADER: Record<string, string> = {
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50",
  green: "border-green-200 bg-green-50",
  purple: "border-purple-200 bg-purple-50",
};

const COLOR_SUBHEAD: Record<string, string> = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  purple: "bg-purple-100 text-purple-800",
};

const COLOR_LIGHT: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  green: "bg-green-50 border-green-200 text-green-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
};

function gradeLabel(g: number) {
  return g === 0 ? "K" : `${g}`;
}

// Group items by their sub-level number (e.g. all "2.1" items together)
function groupBySubLevel(items: AssessmentItem[]) {
  const map = new Map<string, AssessmentItem[]>();
  items.forEach((item) => {
    if (!map.has(item.number)) map.set(item.number, []);
    map.get(item.number)!.push(item);
  });
  return Array.from(map.entries()); // [ ["2.1", [...items]], ["2.2", [...]], ... ]
}

// Calculate score for a group of items
function calcScore(items: AssessmentItem[], responses: Responses) {
  const scoreable = items.filter((i) =>
    i.responseFields.some((f) => f.type === "correct_incorrect")
  );
  if (scoreable.length === 0) return null;
  const correct = scoreable.filter(
    (i) => responses[i.id]?.["Response"] === "correct"
  ).length;
  return { correct, total: scoreable.length };
}

// --- SCORING LOGIC ---
function calculateResults(responses: Responses) {
  const groups = schedule2A.taskGroups;

  // FNWS level: based on TG1 (sequences) and TG2 (NWA)
  const tg2 = groups[1]; // NWA
  const nwa01 = tg2.items.filter((i) => i.number === "2.1");
  const nwa1130 = tg2.items.filter((i) => i.number === "2.2");
  const nwa31100 = tg2.items.filter((i) => i.number === "2.3");
  const nwa01Score = calcScore(nwa01, responses);
  const nwa1130Score = calcScore(nwa1130, responses);
  const nwa31100Score = calcScore(nwa31100, responses);

  let fnwsLevel = 1;
  if (nwa01Score && nwa01Score.correct >= 4) fnwsLevel = 2;
  if (nwa1130Score && nwa1130Score.correct >= 4) fnwsLevel = 3;
  if (nwa31100Score && nwa31100Score.correct >= 4) fnwsLevel = 5;

  // NID level: based on TG3 (numeral ID)
  const tg3 = groups[2];
  const nid1 = tg3.items.filter((i) => i.number === "3.1");
  const nid2 = tg3.items.filter((i) => i.number === "3.2");
  const nid3 = tg3.items.filter((i) => i.number === "3.3");
  const nid4 = tg3.items.filter((i) => i.number === "3.4");
  const nid1Score = calcScore(nid1, responses);
  const nid2Score = calcScore(nid2, responses);
  const nid3Score = calcScore(nid3, responses);
  const nid4Score = calcScore(nid4, responses);

  let nidLevel = 0;
  if (nid1Score && nid1Score.correct >= 5) nidLevel = 1;
  if (nid2Score && nid2Score.correct >= 5) nidLevel = 2;
  if (nid3Score && nid3Score.correct >= 6) nidLevel = 3;
  if (nid4Score && nid4Score.correct >= 4) nidLevel = 4;

  // BNWS level: TG5 (sequences) + TG6 (NWB)
  const tg6 = groups[5]; // NWB
  const nwb110 = tg6.items.filter((i) => i.number === "6.1");
  const nwb1130 = tg6.items.filter((i) => i.number === "6.2");
  const nwb31100 = tg6.items.filter((i) => i.number === "6.3");
  const nwb110Score = calcScore(nwb110, responses);
  const nwb1130Score = calcScore(nwb1130, responses);
  const nwb31100Score = calcScore(nwb31100, responses);

  let bnwsLevel = 1;
  if (nwb110Score && nwb110Score.correct >= 4) bnwsLevel = 2;
  if (nwb1130Score && nwb1130Score.correct >= 4) bnwsLevel = 4;
  if (nwb31100Score && nwb31100Score.correct >= 4) bnwsLevel = 5;

  return {
    fnwsLevel,
    nidLevel,
    bnwsLevel,
    details: { nwa01Score, nwa1130Score, nwa31100Score, nid1Score, nid2Score, nid3Score, nid4Score, nwb110Score, nwb1130Score, nwb31100Score },
  };
}

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

  const groups = schedule2A.taskGroups;
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

  function setResponse(itemId: string, field: string, value: string) {
    setResponses((prev) => ({
      ...prev,
      [itemId]: { ...(prev[itemId] ?? {}), [field]: value },
    }));
  }

  function getResponse(itemId: string, field: string) {
    return responses[itemId]?.[field] ?? "";
  }

  async function handleFinish() {
    if (!student) return;
    setSaving(true);
    const calc = calculateResults(responses);
    setResults(calc);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data: sessionData } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "schedule-2a",
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
          model_name: "FNWS",
          suggested_level: calc.fnwsLevel,
          confirmed_level: calc.fnwsLevel,
          date_placed: today,
        },
        {
          session_id: sessionData.id,
          student_id: student.id,
          model_name: "BNWS",
          suggested_level: calc.bnwsLevel,
          confirmed_level: calc.bnwsLevel,
          date_placed: today,
        },
        {
          session_id: sessionData.id,
          student_id: student.id,
          model_name: "NID",
          suggested_level: calc.nidLevel,
          confirmed_level: calc.nidLevel,
          date_placed: today,
        },
      ]);
    }

    setSaving(false);
    setDone(true);
  }

  // --- DONE / RESULTS SCREEN ---
  if (done && student && results) {
    const fnwsDesc = schedule2A.fnwsLevels[results.fnwsLevel];
    const bnwsDesc = schedule2A.bnwsLevels[results.bnwsLevel];
    const nidDesc = schedule2A.nidLevels[results.nidLevel];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Schedule 2A — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested LFIN Placement</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "FNWS", level: results.fnwsLevel, desc: fnwsDesc?.name, color: "blue" },
                { label: "BNWS", level: results.bnwsLevel, desc: bnwsDesc?.name, color: "purple" },
                { label: "NID",  level: results.nidLevel,  desc: nidDesc?.name,  color: "green" },
              ].map(({ label, level, desc, color }) => (
                <div key={label} className={`rounded-xl border-2 p-3 text-center ${
                  color === "blue" ? "border-blue-200 bg-blue-50" :
                  color === "purple" ? "border-purple-200 bg-purple-50" :
                  "border-green-200 bg-green-50"
                }`}>
                  <div className={`text-xs font-bold uppercase mb-1 ${
                    color === "blue" ? "text-blue-600" :
                    color === "purple" ? "text-purple-600" : "text-green-600"
                  }`}>{label}</div>
                  <div className="text-3xl font-black text-gray-800">{level}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{desc}</div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Score Breakdown</h3>
            <div className="space-y-1 text-sm mb-6">
              {[
                { label: "NWA 0–10", score: results.details.nwa01Score },
                { label: "NWA 11–30", score: results.details.nwa1130Score },
                { label: "NWA 31–100", score: results.details.nwa31100Score },
                { label: "NID Single digits", score: results.details.nid1Score },
                { label: "NID Teens/2-digit", score: results.details.nid2Score },
                { label: "NID 2-digit (larger)", score: results.details.nid3Score },
                { label: "NID 3-digit", score: results.details.nid4Score },
                { label: "NWB 1–10", score: results.details.nwb110Score },
                { label: "NWB 11–30", score: results.details.nwb1130Score },
                { label: "NWB 31–100", score: results.details.nwb31100Score },
              ].map(({ label, score }) => score ? (
                <div key={label} className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600">{label}</span>
                  <span className={`font-semibold ${score.correct / score.total >= 0.8 ? "text-green-600" : score.correct / score.total >= 0.6 ? "text-yellow-600" : "text-red-500"}`}>
                    {score.correct} / {score.total}
                  </span>
                </div>
              ) : null)}
            </div>

            <p className="text-xs text-gray-400 mb-4">
              * Suggested placement is based on scoring thresholds. Teacher judgment should confirm final placement.
            </p>

            <div className="flex gap-3">
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Exit</button>
          <div className="h-4 w-px bg-gray-200" />
          <span className="font-semibold text-gray-900 text-sm">{student.first_name} {student.last_name}</span>
          <span className="text-gray-400 text-sm">Grade {gradeLabel(student.grade_level)}</span>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-gray-500 text-sm">{schedule2A.name}</span>
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

      {/* Materials reminder */}
      {currentGroupIdx === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
          <span>📦 Materials needed:</span>
          {schedule2A.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: Student Prompt */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color]} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — {currentGroup.model}
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            <StudentPromptDisplay group={currentGroup} />

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Teacher Instruction:</div>
              <div className="text-sm text-gray-800 italic">{currentGroup.instructions}</div>
              {currentGroup.materials && (
                <div className="text-xs text-gray-400 mt-2">📦 {currentGroup.materials}</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Teacher Scoring */}
        <div className="w-3/5 flex flex-col overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">✏️ Teacher Scoring — {currentGroup.name}</div>
            {currentGroup.branchingNote && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                ℹ️ {currentGroup.branchingNote}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {groupBySubLevel(currentGroup.items).map(([subLevel, items], idx) => {
              const isStartHere = currentGroup.startAtItem
                ? subLevel === currentGroup.startAtItem
                : idx === 0;
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

          {/* Navigation */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setCurrentGroupIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <div className="text-xs text-gray-400">Tap dots above to jump</div>
            {isLast ? (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:bg-green-400"
              >
                {saving ? "Saving…" : "✓ Finish & Score"}
              </button>
            ) : (
              <button
                onClick={() => setCurrentGroupIdx((i) => Math.min(groups.length - 1, i + 1))}
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

// --- Sub-group section (bordered box with all items inside) ---
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
  const score = calcScore(items, responses);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${COLOR_SUBGROUP[color]}`}>
      {/* START HERE badge */}
      {isFirst && (
        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
          <span>▶</span> START HERE
          {startNote && (
            <span className="ml-2 font-normal text-green-100">— {startNote}</span>
          )}
        </div>
      )}

      {/* Sub-group header */}
      <div className={`px-3 py-2 flex items-center justify-between ${COLOR_SUBHEAD[color]}`}>
        <span className="text-xs font-bold">{subLevel} — {items[0]?.prompt?.split("?")[0]?.split("(")[0]?.trim() ?? ""}</span>
        {score && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            score.correct / score.total >= 0.8 ? "bg-green-200 text-green-800" :
            score.correct / score.total >= 0.6 ? "bg-yellow-200 text-yellow-800" :
            "bg-red-100 text-red-700"
          }`}>
            {score.correct}/{score.total} ✓
          </span>
        )}
      </div>

      {/* Items */}
      <div className="divide-y divide-white/60 bg-white/60">
        {items.map((item, i) => (
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

// --- Individual item row ---
function ItemRow({
  item, getResponse, setResponse,
}: {
  item: AssessmentItem;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const hasNumberGrid = item.numberRangeStart !== undefined && item.numberRangeEnd !== undefined;

  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-800 flex-1 min-w-0">{item.prompt}</span>

        {/* Fluency and other inline fields */}
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

        <button
          onClick={() => setNotesOpen((o) => !o)}
          className="text-gray-300 hover:text-gray-500 text-xs ml-1"
          title="Add note"
        >
          📝
        </button>
      </div>

      {/* Clickable number grid for FNWS/BNWS items */}
      {hasNumberGrid && (
        <ClickableNumberGrid
          start={item.numberRangeStart!}
          end={item.numberRangeEnd!}
          reverse={item.id.startsWith("5.")}
          value={getResponse(item.id, "incorrect_numbers")}
          onChange={(v) => setResponse(item.id, "incorrect_numbers", v)}
        />
      )}

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

// --- Clickable number grid ---
function ClickableNumberGrid({
  start, end, value, onChange, reverse = false,
}: {
  start: number;
  end: number;
  value: string;
  onChange: (v: string) => void;
  reverse?: boolean;
}) {
  const incorrect = new Set(value ? value.split(",").map(Number) : []);

  function toggle(n: number) {
    const next = new Set(incorrect);
    if (next.has(n)) next.delete(n);
    else next.add(n);
    onChange(next.size > 0 ? Array.from(next).sort((a, b) => a - b).join(",") : "");
  }

  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  if (reverse) numbers.reverse();

  return (
    <div className="mt-2 mb-1">
      <div className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1.5">
        <span>👆</span> Click on the numbers that are incorrect
      </div>
      <div className="flex flex-wrap gap-1">
        {numbers.map((n) => {
          const isWrong = incorrect.has(n);
          return (
            <button
              key={n}
              onClick={() => toggle(n)}
              className={`w-8 h-8 rounded text-xs font-semibold border transition-all select-none ${
                isWrong
                  ? "bg-red-100 border-red-400 text-red-600 line-through opacity-70"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {incorrect.size > 0 && (
        <div className="text-xs text-red-500 mt-1.5">
          Incorrect: {Array.from(incorrect).sort((a, b) => a - b).join(", ")}
        </div>
      )}
    </div>
  );
}

// --- Inline ✓ / ✗ buttons ---
function InlineCorrectIncorrect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange(value === "correct" ? "" : "correct")}
        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
          value === "correct"
            ? "bg-green-100 border-green-400 text-green-700"
            : "bg-white border-gray-200 text-gray-400 hover:border-green-300"
        }`}
      >
        ✓
      </button>
      <button
        onClick={() => onChange(value === "incorrect" ? "" : "incorrect")}
        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
          value === "incorrect"
            ? "bg-red-100 border-red-400 text-red-700"
            : "bg-white border-gray-200 text-gray-400 hover:border-red-300"
        }`}
      >
        ✗
      </button>
    </div>
  );
}

// --- Inline Fluency buttons ---
function InlineFluency({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {[
        { v: "fluent", label: "Fluent", active: "bg-green-100 border-green-400 text-green-700" },
        { v: "hesitant", label: "Hesitant", active: "bg-yellow-100 border-yellow-400 text-yellow-700" },
        { v: "error", label: "Not Fluent", active: "bg-red-100 border-red-400 text-red-700" },
      ].map(({ v, label, active }) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? "" : v)}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
            value === v ? active : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// --- Left panel: level descriptions ---
function StudentPromptDisplay({ group }: { group: TaskGroup }) {
  const levelMap: Record<string, { level: number; name: string; description: string }[]> = {
    FNWS: schedule2A.fnwsLevels,
    BNWS: schedule2A.bnwsLevels,
    NID:  schedule2A.nidLevels,
  };
  const levels = levelMap[group.model] ?? [];

  if (levels.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <div className="mb-3 text-center">
        <div className="text-sm font-bold text-gray-700">{group.name}</div>
        <div className="text-xs text-gray-400 font-medium tracking-wide">Student Levels</div>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {levels.map(({ level, name }) => (
          <div key={level} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-xs font-bold text-gray-400 w-4 shrink-0 mt-0.5">{level}</span>
            <span className="text-xs text-gray-700 leading-snug">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Interview2APage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
