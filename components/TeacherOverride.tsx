"use client";

/**
 * TeacherOverride — shown on every assessment results screen.
 *
 * Displays a notice that the computed score is a SUGGESTION, then lets the
 * teacher select their own level.  On save the component updates
 * `confirmed_level` in the matching `construct_placements` row so the student
 * profile immediately shows the teacher's judgment.
 */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface TeacherOverrideProps {
  /** The saved assessment_session id returned after handleFinish */
  sessionId: string;
  /** Model name (e.g. "CAS", "M&D", "MBF") */
  modelName: string;
  /** The algorithm-computed level */
  suggestedLevel: number;
  /** Highest possible level for this model */
  maxLevel: number;
  /** Lowest possible level (default 0) */
  minLevel?: number;
  /** Human-readable label for each level value */
  levelLabels: Record<number, string>;
  /** Accent colour class (Tailwind) e.g. "blue", "green", "purple" */
  accentColor?: string;
}

export default function TeacherOverride({
  sessionId,
  modelName,
  suggestedLevel,
  maxLevel,
  minLevel = 0,
  levelLabels,
  accentColor = "blue",
}: TeacherOverrideProps) {
  const [isEditing, setIsEditing]   = useState(false);
  const [selected, setSelected]     = useState<number>(suggestedLevel);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [savedLevel, setSavedLevel] = useState<number | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const levels = Array.from({ length: maxLevel - minLevel + 1 }, (_, i) => minLevel + i);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("construct_placements")
        .update({ confirmed_level: selected })
        .eq("session_id", sessionId)
        .eq("model_name", modelName);
      if (err) throw err;
      setSavedLevel(selected);
      setSaved(true);
      setIsEditing(false);
    } catch (e: unknown) {
      setError("Failed to save override. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const displayLevel = savedLevel ?? suggestedLevel;
  const isOverridden = savedLevel !== null && savedLevel !== suggestedLevel;

  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      {/* Header notice */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-amber-500 text-base mt-0.5">⚠️</span>
        <div>
          <p className="text-xs font-semibold text-amber-800">
            This score is a suggestion
          </p>
          <p className="text-xs text-amber-700 leading-snug mt-0.5">
            The level above was calculated from your responses. Use your professional
            judgment — you can override it if the evidence points elsewhere.
          </p>
        </div>
      </div>

      {/* Current level badge */}
      {!isEditing && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-700 font-medium">
              {isOverridden ? "Teacher override:" : "Suggested level:"}
            </span>
            <span className={`text-sm font-black ${isOverridden ? "text-amber-700" : "text-gray-500"}`}>
              {displayLevel}
              {isOverridden && (
                <span className="ml-1 text-xs font-normal text-amber-600">
                  (was {suggestedLevel})
                </span>
              )}
            </span>
            {isOverridden && (
              <span className="text-xs bg-amber-200 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                Overridden
              </span>
            )}
          </div>
          <button
            onClick={() => { setIsEditing(true); setSelected(displayLevel); }}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
          >
            {saved ? "Change override" : "Override level"}
          </button>
        </div>
      )}

      {/* Level picker */}
      {isEditing && (
        <div>
          <p className="text-xs font-semibold text-amber-800 mb-2">
            Select the correct level ({modelName}):
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelected(lvl)}
                className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-colors ${
                  selected === lvl
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-amber-300"
                }`}
              >
                <span className="block text-center leading-none">{lvl}</span>
                <span className="block text-center font-normal mt-0.5 max-w-[80px] truncate" style={{ fontSize: "9px" }}>
                  {levelLabels[lvl] ?? ""}
                </span>
              </button>
            ))}
          </div>

          {/* Selected label preview */}
          {levelLabels[selected] && (
            <p className="text-xs text-amber-700 italic mb-3">
              &ldquo;{levelLabels[selected]}&rdquo;
            </p>
          )}

          {error && (
            <p className="text-xs text-red-600 mb-2">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg py-2"
            >
              {saving ? "Saving…" : "Save Override"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
