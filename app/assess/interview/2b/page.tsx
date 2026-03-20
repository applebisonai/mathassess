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

// ── Color maps ───────────────────────────────────────────────────────────────

const COLOR_HEADER: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  green:  "bg-green-600 text-white",
  purple: "bg-purple-600 text-white",
  orange: "bg-orange-500 text-white",
  teal:   "bg-teal-600 text-white",
  red:    "bg-red-600 text-white",
};

const COLOR_SUBGROUP: Record<string, string> = {
  blue:   "border-blue-200 bg-blue-50/30",
  green:  "border-green-200 bg-green-50/30",
  purple: "border-purple-200 bg-purple-50/30",
  orange: "border-orange-200 bg-orange-50/30",
  teal:   "border-teal-200 bg-teal-50/30",
  red:    "border-red-200 bg-red-50/30",
};

const COLOR_SUBHEAD: Record<string, string> = {
  blue:   "bg-blue-100/60 text-blue-900",
  green:  "bg-green-100/60 text-green-900",
  purple: "bg-purple-100/60 text-purple-900",
  orange: "bg-orange-100/60 text-orange-900",
  teal:   "bg-teal-100/60 text-teal-900",
  red:    "bg-red-100/60 text-red-900",
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
  return { correct, total: scoreable.length };
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

// Flash card button — shows the dice face for 500 ms then hides it
function FlashCardButton({ value }: { value: number }) {
  const [visible, setVisible] = useState(false);

  function flash() {
    setVisible(true);
    setTimeout(() => setVisible(false), 500);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={flash}
        className="border-2 border-blue-300 rounded-xl p-2 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
        title="Tap to flash card for ½ second"
      >
        {visible ? (
          <DiceFace value={value} size={56} />
        ) : (
          <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-blue-200 border border-blue-300">
            <span className="text-blue-500 text-lg font-bold">?</span>
          </div>
        )}
      </button>
      <span className="text-xs text-blue-500">Tap to flash</span>
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

    setSaving(false);
    setDone(true);
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

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested SN20 Placement</h3>
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 flex items-center gap-5 mb-6">
              <div className="text-center">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">SN20</div>
                <div className="text-5xl font-black text-emerald-700">{results.sn20Level}</div>
              </div>
              <div>
                <div className="font-semibold text-emerald-800 text-sm">{levelInfo?.name}</div>
                <div className="text-emerald-700 text-xs mt-1 leading-snug">{levelInfo?.description}</div>
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
          <span>⚡</span>
          <span>Flash each dice pattern card for <strong>½ second only</strong>. Tap the card in each row to flash it on screen.</span>
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
                {schedule2B.sn20Levels.map(({ level, name }) => (
                  <div key={level} className="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0 mt-0.5">{level}</span>
                    <span className="text-xs text-gray-700 leading-snug">{name}</span>
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
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1.5 mt-2 font-medium">
                ⚠️ {currentGroup.branchingNote}
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
                  isFlashCard={currentGroup.flashCard ?? false}
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
        {/* Dice flash card for regular configurations */}
        {isFlashCard && item.diceValue != null && (
          <FlashCardButton value={item.diceValue} />
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
