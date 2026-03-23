"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { scheduleAvNWN, TaskGroup, AssessmentItem } from "@/lib/assessments/schedule-av-nwn";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
}

type Responses = Record<string, Record<string, string>>;

// ── Color maps ────────────────────────────────────────────────────────────────

const COLOR_HEADER: Record<string, string> = {
  purple: "bg-purple-600 text-white",
};
const COLOR_SUBGROUP: Record<string, string> = {
  purple: "border-purple-200 bg-purple-50/30",
};
const COLOR_SUBHEAD: Record<string, string> = {
  purple: "bg-purple-100/60 text-purple-900",
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

function calcGroupScore(items: AssessmentItem[], responses: Responses) {
  const ciItems = items.filter((i) =>
    i.responseFields.some((f) => f.type === "correct_incorrect")
  );

  if (ciItems.length === 0) return null;

  const ciCorrect = ciItems.filter((i) => {
    const f = i.responseFields.find((f) => f.type === "correct_incorrect");
    return f ? responses[i.id]?.[f.label] === "correct" : false;
  }).length;

  return {
    correct: ciCorrect,
    total: ciItems.length,
  };
}

// ── Scoring logic ──────────────────────────────────────────────────────────────

function calculateResults(responses: Responses) {
  // FNWS Level (0–5)
  const tg1a = responses["tg1-a"]?.Correct === "correct";
  const tg1b = responses["tg1-b"]?.Correct === "correct";
  const tg1c = responses["tg1-c"]?.Correct === "correct";
  const tg1d = responses["tg1-d"]?.Correct === "correct";

  const nwa0to10 = ["nwa-5","nwa-9","nwa-7","nwa-3","nwa-6"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwa11to30 = ["nwa-14","nwa-20","nwa-11","nwa-29","nwa-23","nwa-12","nwa-19"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwa31to100 = ["nwa-59","nwa-65","nwa-32","nwa-70","nwa-99"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  let fnwsLevel = 0;
  if (tg1a) fnwsLevel = 1;
  if (tg1a && nwa0to10 >= 2) fnwsLevel = Math.max(fnwsLevel, 2);
  if (tg1a && nwa0to10 >= 4) fnwsLevel = Math.max(fnwsLevel, 3);
  if (tg1b && nwa11to30 >= 4) fnwsLevel = Math.max(fnwsLevel, 4);
  if ((tg1c || tg1d) && nwa31to100 >= 3) fnwsLevel = Math.max(fnwsLevel, 5);

  // BNWS Level (0–5)
  const tg4a = responses["tg4-a"]?.Correct === "correct";
  const tg4b = responses["tg4-b"]?.Correct === "correct";
  const tg4c = responses["tg4-c"]?.Correct === "correct";
  const tg4d = responses["tg4-d"]?.Correct === "correct";

  const nwb0to10 = ["nwb-7","nwb-10","nwb-4","nwb-8","nwb-3"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwb11to30 = ["nwb-24","nwb-17","nwb-20","nwb-11","nwb-14","nwb-21","nwb-30"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nwb31to100 = ["nwb-53","nwb-70","nwb-88","nwb-41","nwb-96"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  let bnwsLevel = 0;
  if (tg4a) bnwsLevel = 1;
  if ((tg4a || tg4b) && nwb0to10 >= 2) bnwsLevel = Math.max(bnwsLevel, 2);
  if ((tg4a || tg4b) && nwb0to10 >= 4) bnwsLevel = Math.max(bnwsLevel, 3);
  if (tg4b && nwb11to30 >= 4) bnwsLevel = Math.max(bnwsLevel, 4);
  if ((tg4c || tg4d) && nwb31to100 >= 3) bnwsLevel = Math.max(bnwsLevel, 5);

  // NID Level (0–5)
  const nr0to10 = ["nid-r6","nid-r8","nid-r2","nid-r9","nid-r7","nid-r5"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid0to10 = ["nid-4","nid-2","nid-9","nid-6","nid-0","nid-8","nid-10","nid-3","nid-1","nid-7","nid-5"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid11to100 = ["nid-19","nid-34","nid-15","nid-90","nid-41","nid-12","nid-17","nid-20","nid-66","nid-25"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid101to1000 = ["nid-168","nid-400","nid-117","nid-354","nid-205","nid-620"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  const nid1001to1M = ["nid-7462","nid-5026","nid-46803","nid-90380","nid-247641","nid-700090"].filter(
    (id) => responses[id]?.Correct === "correct"
  ).length;

  let nidLevel = 0;
  if (nr0to10 >= 3 || nid0to10 >= 6) nidLevel = 1;
  if (nid0to10 >= 9) nidLevel = Math.max(nidLevel, 2);
  if (nid11to100 >= 7) nidLevel = Math.max(nidLevel, 3);
  if (nid101to1000 >= 4) nidLevel = Math.max(nidLevel, 4);
  if (nid1001to1M >= 4) nidLevel = Math.max(nidLevel, 5);

  return {
    fnwsLevel,
    bnwsLevel,
    nidLevel,
    scores: {
      tg1: { correct: [tg1a, tg1b, tg1c, tg1d].filter(Boolean).length, total: 4 },
      nwa0to10: { correct: nwa0to10, total: 5 },
      nwa11to30: { correct: nwa11to30, total: 7 },
      nwa31to100: { correct: nwa31to100, total: 5 },
      tg4: { correct: [tg4a, tg4b, tg4c, tg4d].filter(Boolean).length, total: 4 },
      nwb0to10: { correct: nwb0to10, total: 5 },
      nwb11to30: { correct: nwb11to30, total: 7 },
      nwb31to100: { correct: nwb31to100, total: 5 },
      nr0to10: { correct: nr0to10, total: 6 },
      nid0to10: { correct: nid0to10, total: 11 },
      nid11to100: { correct: nid11to100, total: 10 },
      nid101to1000: { correct: nid101to1000, total: 6 },
      nid1001to1M: { correct: nid1001to1M, total: 6 },
    },
  };
}

// ── Get relevant model levels based on current task group ───────────────────

function getModelForTaskGroup(groupIdx: number) {
  if (groupIdx === 0 || groupIdx === 1) return "FNWS";
  if (groupIdx === 2 || groupIdx === 5) return "NID";
  if (groupIdx === 3 || groupIdx === 4) return "BNWS";
  return "FNWS";
}

function getModelTitle(model: string) {
  if (model === "FNWS") return "Forward Number Word Sequences";
  if (model === "BNWS") return "Backward Number Word Sequences";
  if (model === "NID") return "Numeral Identification";
  return "Model";
}

function getModelLevels(model: string) {
  if (model === "FNWS") return scheduleAvNWN.fnwsLevels;
  if (model === "BNWS") return scheduleAvNWN.bnwsLevels;
  if (model === "NID") return scheduleAvNWN.nidLevels;
  return [];
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

  const groups = scheduleAvNWN.taskGroups;
  const currentGroup = groups[currentGroupIdx];
  const isFirst = currentGroupIdx === 0;
  const isLast = currentGroupIdx === groups.length - 1;

  const currentModel = getModelForTaskGroup(currentGroupIdx);
  const modelTitle = getModelTitle(currentModel);
  const modelLevels = getModelLevels(currentModel);

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
    return subLevels
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
        assessment_id: "av-nwn",
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

  // ── Results screen ──────────────────────────────────────────────────────────
  if (done && student && results) {
    const fnwsLevelInfo = scheduleAvNWN.fnwsLevels[results.fnwsLevel];
    const bnwsLevelInfo = scheduleAvNWN.bnwsLevels[results.bnwsLevel];
    const nidLevelInfo = scheduleAvNWN.nidLevels[results.nidLevel];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-gray-900">Assessment Complete</h2>
              <p className="text-gray-500 text-sm mt-1">
                Add+VantageMR Number Words & Numerals — {student.first_name} {student.last_name} (Grade {gradeLabel(student.grade_level)})
              </p>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Suggested Placements</h3>
            <div className="space-y-3 mb-6">
              <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">FNWS</div>
                  <div className="text-5xl font-black text-purple-700">{results.fnwsLevel}</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-800 text-sm">{fnwsLevelInfo?.name}</div>
                  <div className="text-purple-700 text-xs mt-1 leading-snug">{fnwsLevelInfo?.description}</div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-4 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">BNWS</div>
                  <div className="text-5xl font-black text-green-700">{results.bnwsLevel}</div>
                </div>
                <div>
                  <div className="font-semibold text-green-800 text-sm">{bnwsLevelInfo?.name}</div>
                  <div className="text-green-700 text-xs mt-1 leading-snug">{bnwsLevelInfo?.description}</div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">NID</div>
                  <div className="text-5xl font-black text-blue-700">{results.nidLevel}</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-800 text-sm">{nidLevelInfo?.name}</div>
                  <div className="text-blue-700 text-xs mt-1 leading-snug">{nidLevelInfo?.description}</div>
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Evidence Summary</h3>
            <div className="space-y-1 text-sm mb-4">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">TG1 — FNWS Sequences</span>
                <span className={`font-semibold text-xs ${results.scores.tg1.correct / results.scores.tg1.total >= 0.75 ? "text-green-600" : results.scores.tg1.correct === 0 ? "text-red-500" : "text-yellow-600"}`}>
                  {results.scores.tg1.correct} / {results.scores.tg1.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">NWA 0–10</span>
                <span className={`font-semibold text-xs ${results.scores.nwa0to10.correct >= 2 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nwa0to10.correct} / {results.scores.nwa0to10.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">NWA 11–30</span>
                <span className={`font-semibold text-xs ${results.scores.nwa11to30.correct >= 4 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nwa11to30.correct} / {results.scores.nwa11to30.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">NWA 31–100</span>
                <span className={`font-semibold text-xs ${results.scores.nwa31to100.correct >= 3 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nwa31to100.correct} / {results.scores.nwa31to100.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">TG4 — BNWS Sequences</span>
                <span className={`font-semibold text-xs ${results.scores.tg4.correct / results.scores.tg4.total >= 0.75 ? "text-green-600" : results.scores.tg4.correct === 0 ? "text-red-500" : "text-yellow-600"}`}>
                  {results.scores.tg4.correct} / {results.scores.tg4.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">NWB 0–10</span>
                <span className={`font-semibold text-xs ${results.scores.nwb0to10.correct >= 2 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nwb0to10.correct} / {results.scores.nwb0to10.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">NWB 11–30</span>
                <span className={`font-semibold text-xs ${results.scores.nwb11to30.correct >= 4 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nwb11to30.correct} / {results.scores.nwb11to30.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">NWB 31–100</span>
                <span className={`font-semibold text-xs ${results.scores.nwb31to100.correct >= 3 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nwb31to100.correct} / {results.scores.nwb31to100.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">Numeral Recognition 0–10</span>
                <span className={`font-semibold text-xs ${results.scores.nr0to10.correct >= 3 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nr0to10.correct} / {results.scores.nr0to10.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">Numeral ID 0–10</span>
                <span className={`font-semibold text-xs ${results.scores.nid0to10.correct >= 6 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nid0to10.correct} / {results.scores.nid0to10.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">Numeral ID 11–100</span>
                <span className={`font-semibold text-xs ${results.scores.nid11to100.correct >= 7 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nid11to100.correct} / {results.scores.nid11to100.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-600 text-xs">Numeral ID 101–1,000</span>
                <span className={`font-semibold text-xs ${results.scores.nid101to1000.correct >= 4 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nid101to1000.correct} / {results.scores.nid101to1000.total}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-gray-600 text-xs">Numeral ID 1,001–1,000,000</span>
                <span className={`font-semibold text-xs ${results.scores.nid1001to1M.correct >= 4 ? "text-green-600" : "text-red-500"}`}>
                  {results.scores.nid1001to1M.correct} / {results.scores.nid1001to1M.total}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              * Suggested placements based on performance evidence. Teacher judgment should confirm final level.
            </p>

            <div className="flex gap-3">
              <button onClick={() => router.push("/assess/select")}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg py-2.5 text-sm">
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
          <span className="text-gray-500 text-sm">{scheduleAvNWN.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button key={i} onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx ? "bg-purple-600" : i < currentGroupIdx ? "bg-purple-200" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials banner on TG1 */}
      {currentGroupIdx === 0 && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 text-xs text-purple-700 flex items-center gap-2 flex-wrap">
          <span>📦 Materials needed:</span>
          {scheduleAvNWN.materials.map((m) => (
            <span key={m} className="bg-purple-100 border border-purple-300 rounded px-2 py-0.5">{m}</span>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: Model level descriptions */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className={`${COLOR_HEADER[currentGroup.color] ?? "bg-gray-700 text-white"} px-4 py-3`}>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — {currentModel}
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Model Level descriptions */}
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="mb-3 text-center">
                <div className="text-sm font-bold text-gray-700">{modelTitle}</div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">Levels 0–5</div>
              </div>
              <div className="space-y-1.5">
                {modelLevels.map(({ level, name, description }) => (
                  <div key={level} className="flex items-start gap-2 rounded-lg px-3 py-2 border bg-gray-50 border-gray-100">
                    <span className="text-xs font-bold text-purple-600 w-4 shrink-0 mt-0.5">{level}</span>
                    <div>
                      <div className="text-xs font-semibold leading-snug text-gray-800">{name}</div>
                      <div className="text-xs leading-snug text-gray-500 mt-0.5">{description}</div>
                    </div>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {groupBySubLevel(currentGroup.items).map(([subLevel, items]) => {
              return (
                <SubGroupSection
                  key={subLevel}
                  subLevel={subLevel}
                  items={items}
                  color={currentGroup.color}
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
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
  subLevel, items, color, responses, getResponse, setResponse,
}: {
  subLevel: string;
  items: AssessmentItem[];
  color: string;
  responses: Responses;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const score = calcGroupScore(items, responses);

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${COLOR_SUBGROUP[color] ?? "border-gray-200 bg-gray-50/30"}`}>
      {score && (
        <div className={`px-3 py-1.5 flex items-center justify-end ${COLOR_SUBHEAD[color] ?? "bg-gray-100 text-gray-900"}`}>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            score.correct / score.total >= 0.75 ? "bg-green-200 text-green-800" :
            score.correct / score.total >= 0.5  ? "bg-yellow-200 text-yellow-800" :
            "bg-red-100 text-red-700"
          }`}>
            {score.correct}/{score.total} ✓
          </span>
        </div>
      )}

      <div className={`${score ? "divide-y divide-white/60 bg-white/60" : "bg-white/60"}`}>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
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
  item, getResponse, setResponse,
}: {
  item: AssessmentItem;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div className="px-3 py-3">
      <div className="flex items-start gap-3 flex-wrap">

        {/* Large display text */}
        {item.displayText && (
          <span className="text-xl font-black text-gray-700 min-w-[3rem] text-center shrink-0">
            {item.displayText}
          </span>
        )}

        {/* Prompt */}
        <span className="text-sm text-gray-700 flex-1 min-w-0 pt-0.5">{item.prompt}</span>

        {/* Response fields */}
        <div className="flex flex-col gap-1.5 shrink-0">
          {item.responseFields.map((field) => (
            <span key={field.label} className="flex items-center gap-1">
              {field.type === "correct_incorrect" && (
                <InlineCorrectIncorrect
                  value={getResponse(item.id, field.label)}
                  onChange={(v) => setResponse(item.id, field.label, v)}
                />
              )}
              {field.type === "text_input" && (
                <input
                  type="text"
                  placeholder={field.placeholder ?? "Enter response"}
                  value={getResponse(item.id, field.label)}
                  onChange={(e) => setResponse(item.id, field.label, e.target.value)}
                  className="w-32 border border-purple-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-purple-500"
                />
              )}
            </span>
          ))}
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className="text-gray-300 hover:text-gray-500 text-xs ml-1 pt-0.5"
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
          className="mt-1.5 w-full text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 focus:outline-none focus:border-gray-400"
          autoFocus
        />
      )}

      {item.notes && (
        <div className="text-xs text-purple-600 mt-0.5 italic">{item.notes}</div>
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

// ── Page export ───────────────────────────────────────────────────────────────

export default function InterviewAvNWNPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
