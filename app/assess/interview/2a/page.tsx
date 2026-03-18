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

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600",
  purple: "bg-purple-600",
};

const COLOR_LIGHT: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  green: "bg-green-50 border-green-200 text-green-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
};

function gradeLabel(g: number) {
  return g === 0 ? "K" : `${g}`;
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
      .then(({ data }) => {
        if (data) setStudent(data);
      });
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Create assessment session
    const { data: session, error: sessionError } = await supabase
      .from("assessment_sessions")
      .insert({
        student_id: student.id,
        teacher_id: user.id,
        assessment_id: "schedule-2a",
        date_administered: new Date().toISOString().split("T")[0],
        status: "completed",
        raw_responses: responses,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error saving session:", sessionError);
      setSaving(false);
      return;
    }

    setSaving(false);
    setDone(true);
  }

  if (done && student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Saved!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Schedule 2A for{" "}
            <strong>
              {student.first_name} {student.last_name}
            </strong>{" "}
            has been recorded.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/assess/select`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 text-sm"
            >
              Assess Another Student
            </button>
            <button
              onClick={() => router.push(`/students`)}
              className="w-full border border-gray-200 text-gray-600 font-medium rounded-lg py-2.5 text-sm hover:bg-gray-50"
            >
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Exit
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div>
            <span className="font-semibold text-gray-900 text-sm">
              {student.first_name} {student.last_name}
            </span>
            <span className="text-gray-400 text-sm ml-2">
              Grade {gradeLabel(student.grade_level)}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-gray-500 text-sm">{schedule2A.name}</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Task Group {currentGroupIdx + 1} of {groups.length}
          <div className="flex gap-1 ml-2">
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentGroupIdx(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentGroupIdx
                    ? "bg-blue-600"
                    : i < currentGroupIdx
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Materials reminder (first group only) */}
      {currentGroupIdx === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
          <span>📦 Materials needed:</span>
          {schedule2A.materials.map((m) => (
            <span
              key={m}
              className="bg-amber-100 border border-amber-300 rounded px-2 py-0.5"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="flex flex-1 gap-0">
        {/* LEFT: Student Prompt */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
          <div
            className={`${COLOR_MAP[currentGroup.color]} px-4 py-3 text-white`}
          >
            <div className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Task Group {currentGroup.number} — {currentGroup.model}
            </div>
            <div className="font-semibold mt-0.5">{currentGroup.name}</div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-center items-center">
            <div
              className={`text-xs font-semibold uppercase tracking-wide mb-4 px-3 py-1 rounded-full border ${
                COLOR_LIGHT[currentGroup.color]
              }`}
            >
              Show to Student / Read Aloud
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 w-full mb-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Teacher Instruction:</div>
              <div className="text-sm text-gray-800 italic">{currentGroup.instructions}</div>
              {currentGroup.materials && (
                <div className="text-xs text-gray-400 mt-2">
                  📦 {currentGroup.materials}
                </div>
              )}
            </div>

            {/* Current item display */}
            <CurrentItemDisplay group={currentGroup} />
          </div>
        </div>

        {/* RIGHT: Teacher Scoring */}
        <div className="w-3/5 flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="text-sm font-semibold text-gray-700">
              ✏️ Teacher Scoring Panel
            </div>
            {currentGroup.branchingNote && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                ℹ️ {currentGroup.branchingNote}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentGroup.items.map((item) => (
              <ItemScoringCard
                key={item.id}
                item={item}
                getResponse={getResponse}
                setResponse={setResponse}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setCurrentGroupIdx((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous Group
            </button>

            <div className="text-xs text-gray-400">
              Tap dots above to jump to any section
            </div>

            {isLast ? (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:bg-green-400"
              >
                {saving ? "Saving…" : "✓ Finish & Save"}
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

function CurrentItemDisplay({ group }: { group: TaskGroup }) {
  // Show all display texts for this group as a scrollable list
  const uniquePrompts = group.items
    .filter((item) => item.displayText)
    .reduce((acc: AssessmentItem[], item) => {
      if (!acc.find((i) => i.displayText === item.displayText)) acc.push(item);
      return acc;
    }, []);

  if (uniquePrompts.length === 0) return null;

  return (
    <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4">
      <div className="text-xs text-blue-600 font-medium mb-2 text-center">
        Items in this group:
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {uniquePrompts.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100"
          >
            <span className="text-xs text-blue-400 font-mono w-8">{item.number}</span>
            <span className="text-sm font-semibold text-gray-800">{item.displayText}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemScoringCard({
  item,
  getResponse,
  setResponse,
}: {
  item: AssessmentItem;
  getResponse: (id: string, field: string) => string;
  setResponse: (id: string, field: string, value: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Item header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono text-gray-400 mr-2">{item.number}</span>
          <span className="text-sm font-medium text-gray-800">{item.prompt}</span>
        </div>
        {item.notes && (
          <span className="text-xs text-gray-400 italic ml-2">{item.notes}</span>
        )}
      </div>

      {/* Response Fields */}
      <div className="space-y-2">
        {item.responseFields.map((field) => (
          <div key={field.label}>
            {field.type === "correct_incorrect" && (
              <CorrectIncorrectField
                label={field.label}
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
            {field.type === "fluency_scale" && (
              <FluencyField
                label={field.label}
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
            {field.type === "number_entry" && (
              <NumberEntryField
                label={field.label}
                placeholder={field.placeholder}
                value={getResponse(item.id, field.label)}
                onChange={(v) => setResponse(item.id, field.label, v)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Notes field */}
      <div className="mt-2">
        <input
          type="text"
          placeholder="Teacher notes (optional)"
          value={getResponse(item.id, "notes")}
          onChange={(e) => setResponse(item.id, "notes", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-500 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>
    </div>
  );
}

function CorrectIncorrectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20">{label}:</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(value === "correct" ? "" : "correct")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            value === "correct"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-white border-gray-200 text-gray-500 hover:border-green-300"
          }`}
        >
          ✓ Correct
        </button>
        <button
          onClick={() => onChange(value === "incorrect" ? "" : "incorrect")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            value === "incorrect"
              ? "bg-red-100 border-red-400 text-red-700"
              : "bg-white border-gray-200 text-gray-500 hover:border-red-300"
          }`}
        >
          ✗ Incorrect
        </button>
      </div>
    </div>
  );
}

function FluencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "fluent", label: "Fluent", color: "green" },
    { value: "hesitant", label: "Hesitant", color: "yellow" },
    { value: "error", label: "Errors/Stopped", color: "red" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20">{label}:</span>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(value === opt.value ? "" : opt.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              value === opt.value
                ? opt.color === "green"
                  ? "bg-green-100 border-green-400 text-green-700"
                  : opt.color === "yellow"
                  ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                  : "bg-red-100 border-red-400 text-red-700"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberEntryField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20">{label}:</span>
      <input
        type="text"
        placeholder={placeholder ?? "Enter number"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
      />
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
