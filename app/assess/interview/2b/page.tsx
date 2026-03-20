"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { schedule2B, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-2b";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

const COLOR_HEADER: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  green:  "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
  orange: "bg-orange-500 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  blue:   "border-blue-200 bg-blue-50/30",
  green:  "border-green-200 bg-green-50/30",
  purple: "border-purple-200 bg-purple-50/30",
  orange: "border-orange-200 bg-orange-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  blue:   "bg-blue-100/60 text-blue-900",
  green:  "bg-green-100/60 text-green-900",
  purple: "bg-purple-100/60 text-purple-900",
  orange: "bg-orange-100/60 text-orange-900",
};

const COLOR_LIGHT: Record<string, string> = {
  blue:   "bg-blue-50 text-blue-700 border-blue-200",
  green:  "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
};

function gradeLabel(g: number) {
  return g === 0 ? "K" : `${g}`;
}

function groupBySubLevel(items: AssessmentItem[]) {
  const map = new Map<string, AssessmentItem[]>();
  items.forEach((item) => {
    if (!map.has(item.number)) map.set(item.number, []);
    map.get(item.number)!.push(item);
  });
  return Array.from(map.entries());
}

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
  const groups = schedule2B.taskGroups;

  // SPAT: TG1 (Spatial Patterns)
  const tg1 = groups[0];
  const spat1 = tg1.items.filter((i) => i.number === "1.1");
  const spat2 = tg1.items.filter((i) => i.number === "1.2");
  const spat3 = tg1.items.filter((i) => i.number === "1.3");
  const spat4 = tg1.items.filter((i) => i.number === "1.4");
  const spat1Score = calcScore(spat1, responses);
  const spat2Score = calcScore(spat2, responses);
  const spat3Score = calcScore(spat3, responses);
  const spat4Score = calcScore(spat4, responses);

  let spatLevel = 0;
  if (spat1Score && spat1Score.correct >= 2) spatLevel = 1;
  if (spat2Score && spat2Score.correct >= 2) spatLevel = 2;
  if (spat3Score && spat3Score.correct >= 4) spatLevel = 3;
  if (spat4Score && spat4Score.correct >= 2) spatLevel = 4;

  // FING: TG2 (Finger Patterns)
  const tg2 = groups[1];
  const fing1 = tg2.items.filter((i) => i.number === "2.1");
  const fing2 = tg2.items.filter((i) => i.number === "2.2");
  const fing3 = tg2.items.filter((i) => i.number === "2.3");
  const fing1Score = calcScore(fing1, responses);
  const fing2Score = calcScore(fing2, responses);
  const fing3Score = calcScore(fing3, responses);

  let fingLevel = 0;
  if (fing1Score && fing1Score.correct >= 4) fingLevel = 1;
  if (fing2Score && fing2Score.correct >= 4) fingLevel = 2;
  if (fing3Score && fing3Score.correct >= 3) fingLevel = 3;

  // TEMP: TG3 (Temporal Patterns)
  const tg3 = groups[2];
  const temp1 = tg3.items.filter((i) => i.number === "3.1");
  const temp2 = tg3.items.filter((i) => i.number === "3.2");
  const temp3 = tg3.items.filter((i) => i.number === "3.3");
  const temp1Score = calcScore(temp1, responses);
  const temp2Score = calcScore(temp2, responses);
  const temp3Score = calcScore(temp3, responses);

  let tempLevel = 0;
  if (temp1Score && temp1Score.correct >= 3) tempLevel = 1;
  if (temp2Score && temp2Score.correct >= 3) tempLevel = 2;
  if (temp3Score && temp3Score.correct >= 2) tempLevel = 3;

  // C&P: TG4 (Combining and Partitioning)
  const tg4 = groups[3];
  const cp1 = tg4.items.filter((i) => i.number === "4.1");
  const cp2 = tg4.items.filter((i) => i.number === "4.2");
  const cp3 = tg4.items.filter((i) => i.number === "4.3");
  const cp1Score = calcScore(cp1, responses);
  const cp2Score = calcScore(cp2, responses);
  const cp3Score = calcScore(cp3, responses);

  let cpLevel = 0;
  if (cp1Score && cp1Score.correct >= 2) cpLevel = 1;
  if (cp2Score && cp2Score.correct >= 3) cpLevel = 2;
  if (cp3Score && cp3Score.correct >= 2) cpLevel = 3;

  return {
    spatLevel, fingLevel, tempLevel, cpLevel,
    details: { spat1Score, spat2Score, spat3Score, spat4Score, fing1Score, fing2Score, fing3Score, temp1Score, temp2Score, temp3Score, cp1Score, cp2Score, cp3Score },
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
        assessment_id: "schedule-2b",
        date_administered: today,
        status: "completed",
        raw_responses: responses,
      })
      .select("id")
      .single();

    if (sessionData?.id) {
      await supabase.from("construct_placements").insert([
        { session_id: sessionData.id, student_id: student.id, model_name: "SPAT", suggested_level: calc.spatLevel, confirmed_level: calc.spatLevel, date_placed: today },
        { session_id: sessionData.id, student_id: student.id, model_name: "FING", suggested_level: calc.fingLevel, confirmed_level: calc.fingLevel, date_placed: today },
        { session_id: sessionData.id, student_id: student.id, model_name: "TEMP", suggested_level: calc.tempLevel, confirmed_level: calc.tempLevel, date_placed: today },
        { session_id: sessionData.id, student_id: student.id, model_name: "C&P",  suggested_level: calc.cpLevel,  confirmed_level: calc.cpLevel,  date_placed: today },
      ]);
    }

    setSaving(false);
    setDone(true);
  }

  // --- DONE / RESULTS SCREEN ---
  if (done && student && results) {
    const spatDesc = schedule2B.spatLevels[results.spatLevel];
    const fingDesc = schedule2B.fingLevels[results.fingLevel];
    const tempDesc = schedule2B.tempLevels[results.tempLevel];
    const cpDesc   = schedule2B.cpLevels[results.cpLevel];

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

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested LFIN Placement</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "SPAT", level: results.spatLevel, desc: spatDesc?.name, color: "blue" },
                { label: "FING", level: results.fingLevel, desc: fingDesc?.name, color: "green" },
                { label: "TEMP", level: results.tempLevel, desc: tempDesc?.name, color: "purple" },
                { label: "C&P",  level: results.cpLevel,  desc: cpDesc?.name,   color: "orange" },
              ].map(({ label, level, desc, color }) => (
                <div key={label} className={`rounded-xl border-2 p-3 text-center ${
                  color === "blue"   ? "border-blue-200 bg-blue-50" :
                  color === "green"  ? "border-green-200 bg-green-50" :
                  color === "purple" ? "border-purple-200 bg-purple-50" :
                  "border-orange-200 bg-orange-50"
                }`}>
                  <div className={`text-xs font-bold uppercase mb-1 ${
                    color === "blue"   ? "text-blue-600" :
                    color === "green"  ? "text-green-600" :
                    color === "purple" ? "text-purple-600" :
                    "text-orange-600"
                  }`}>{label}</div>
                  <div className="text-3xl font-black text-gray-800">{level}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{desc}</div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Score Breakdown</h3>
            <div className="space-y-1 text-sm mb-6">
              {[
                { label: "Spatial Patterns 1–3",      score: results.details.spat1Score },
                { label: "Spatial Patterns 4–5",      score: results.details.spat2Score },
                { label: "Spatial Patterns 6–10",     score: results.details.spat3Score },
                { label: "Ten-frame Patterns",        score: results.details.spat4Score },
                { label: "Finger Patterns 1–5",       score: results.details.fing1Score },
                { label: "Finger Patterns 6–10",      score: results.details.fing2Score },
                { label: "Recognize Finger Patterns", score: results.details.fing3Score },
                { label: "Temporal Patterns 1–5",     score: results.details.temp1Score },
                { label: "Temporal Patterns 6–10",    score: results.details.temp2Score },
                { label: "Two-part Sequences",        score: results.details.temp3Score },
                { label: "Combining within 5",        score: results.details.cp1Score },
                { label: "Combining within 10",       score: results.details.cp2Score },
                { label: "Combining within 20",       score: results.details.cp3Score },
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
              <button onClick={() => router.push("/assess/select")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm">
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
          <span className="text-gray-500 text-sm">{schedule2B.name}</span>
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
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {schedule2B.materials.map((m) => (
            <span key={m} className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Flash card reminder for TG1 */}
      {(currentGroup as any).flashCard && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
          <span>⚡</span>
          <span>Flash each card for <strong>1–2 seconds only</strong>, then hide it before the student responds.</span>
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: Student Prompt / Level Info */}
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

// --- Sub-group section ---
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
      {isFirst && (
        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
          <span>▶</span> START HERE
          {startNote && <span className="ml-2 font-normal text-green-100">— {startNote}</span>}
        </div>
      )}

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

      <div className="divide-y divide-white/60 bg-white/60">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} getResponse={getResponse} setResponse={setResponse} />
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

// --- Individual item row ---
function ItemRow({
  item, getResponse, setResponse,
}: {
  item: AssessmentItem;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-800 flex-1 min-w-0">{item.prompt}</span>
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
        {item.notes && (
          <div className="w-full text-xs text-gray-400 mt-0.5 italic">{item.notes}</div>
        )}
      </div>
    </div>
  );
}

// --- Inline correct/incorrect toggle ---
function InlineCorrectIncorrect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange(value === "correct" ? "" : "correct")}
        className={`w-7 h-7 rounded text-sm font-bold border transition-all ${value === "correct" ? "bg-green-500 border-green-600 text-white" : "bg-white border-gray-300 text-gray-400 hover:border-green-400"}`}
      >✓</button>
      <button
        onClick={() => onChange(value === "incorrect" ? "" : "incorrect")}
        className={`w-7 h-7 rounded text-sm font-bold border transition-all ${value === "incorrect" ? "bg-red-500 border-red-600 text-white" : "bg-white border-gray-300 text-gray-400 hover:border-red-400"}`}
      >✗</button>
    </div>
  );
}

// --- Inline fluency scale ---
function InlineFluency({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { v: "fluent",   label: "Fluent",    active: "bg-green-500 border-green-600 text-white" },
    { v: "hesitant", label: "Hesitant",  active: "bg-yellow-500 border-yellow-600 text-white" },
    { v: "error",    label: "Not Fluent", active: "bg-red-500 border-red-600 text-white" },
  ];
  return (
    <div className="flex gap-1">
      {options.map(({ v, label, active }) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? "" : v)}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${value === v ? active : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"}`}
        >{label}</button>
      ))}
    </div>
  );
}

// --- Left panel: level descriptions ---
function StudentPromptDisplay({ group }: { group: TaskGroup }) {
  const levelMap: Record<string, { level: number; name: string; description: string }[]> = {
    SPAT: schedule2B.spatLevels,
    FING: schedule2B.fingLevels,
    TEMP: schedule2B.tempLevels,
    "C&P": schedule2B.cpLevels,
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

export default function Interview2BPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>}>
      <InterviewContent />
    </Suspense>
  );
}
