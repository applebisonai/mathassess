"use client";

/**
 * SessionResponsesView
 *
 * Shows the full response log for a single assessment session:
 *  • Every task group as a collapsible section header
 *  • Every item with its prompt and a colour-coded response icon
 *  • Any extra fields (strategy notes, etc.) shown inline
 *  • Suggested level vs teacher-confirmed level for each model
 */

import { useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export interface SessionGroup {
  groupName: string;
  groupNumber: string;
  items: Array<{
    id: string;
    prompt: string;
    /** labels of extra fields beyond the main "Response" toggle */
    extraFields: string[];
  }>;
}

export interface SessionPlacement {
  model_name: string;
  suggested_level: number | null;
  confirmed_level: number | null;
}

interface Props {
  groups: SessionGroup[];
  rawResponses: Record<string, Record<string, string>>;
  placements: SessionPlacement[];
  modelLevelLabels: Record<string, Record<number, string>>;
  modelColors: Record<string, string>;
}

// ── Response icon ────────────────────────────────────────────────────────────

function ResponseIcon({ value }: { value: string | undefined }) {
  if (value === "correct")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex-shrink-0">
        ✓
      </span>
    );
  if (value === "attempted")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex-shrink-0">
        ~
      </span>
    );
  if (value === "incorrect")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex-shrink-0">
        ✗
      </span>
    );
  if (value === "not_attempted")
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs font-bold flex-shrink-0">
        —
      </span>
    );
  // No response recorded
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-200 text-gray-300 text-xs flex-shrink-0">
      ·
    </span>
  );
}

function responseLabel(value: string | undefined): string {
  if (value === "correct")       return "Correct";
  if (value === "attempted")     return "Attempted";
  if (value === "incorrect")     return "Incorrect";
  if (value === "not_attempted") return "Not attempted";
  return "No response";
}

function responseBgClass(value: string | undefined): string {
  if (value === "correct")       return "bg-green-50";
  if (value === "attempted")     return "bg-orange-50";
  if (value === "incorrect")     return "bg-red-50";
  if (value === "not_attempted") return "bg-gray-50";
  return "bg-white";
}

// ── Score explanation banner ─────────────────────────────────────────────────

function ScoreBanner({ placements, modelLevelLabels, modelColors }: {
  placements: SessionPlacement[];
  modelLevelLabels: Record<string, Record<number, string>>;
  modelColors: Record<string, string>;
}) {
  return (
    <div className="space-y-2 mb-3">
      {placements.map((p) => {
        const color = modelColors[p.model_name] ?? "#6b7280";
        const sugLevel = p.suggested_level;
        const confLevel = p.confirmed_level;
        const displayLevel = confLevel ?? sugLevel;
        const levelName =
          displayLevel !== null && displayLevel !== undefined
            ? (modelLevelLabels[p.model_name]?.[displayLevel] ?? `Level ${displayLevel}`)
            : "—";
        const wasOverridden =
          confLevel !== null &&
          confLevel !== undefined &&
          sugLevel !== null &&
          sugLevel !== undefined &&
          confLevel !== sugLevel;

        return (
          <div
            key={p.model_name}
            className="rounded-xl border-2 p-3 bg-white"
            style={{ borderColor: color }}
          >
            {/* Model + level */}
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
                  {p.model_name}
                </span>
                <div className="text-2xl font-black leading-none mt-0.5" style={{ color }}>
                  {displayLevel ?? "—"}
                </div>
                <div className="text-xs text-gray-600 mt-0.5 leading-snug">{levelName}</div>
              </div>

              {/* Override badge */}
              {wasOverridden && (
                <div className="text-right">
                  <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                    Teacher override
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    Algorithm: {sugLevel} → Teacher: {confLevel}
                  </div>
                </div>
              )}
              {!wasOverridden && (
                <span className="text-xs text-gray-400 mt-1">
                  Algorithm score
                </span>
              )}
            </div>

            {/* Scoring basis note */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 leading-snug">
                <span className="font-semibold text-gray-600">Scoring basis: </span>
                {wasOverridden
                  ? `Algorithm computed Level ${sugLevel} from recorded responses. Teacher reviewed and set Level ${confLevel}.`
                  : `Algorithm computed Level ${displayLevel ?? "—"} from recorded responses below.`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function SessionResponsesView({
  groups,
  rawResponses,
  placements,
  modelLevelLabels,
  modelColors,
}: Props) {
  const [open, setOpen] = useState(false);

  // Count total items and how many have a response
  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);
  const answeredItems = groups.reduce(
    (n, g) =>
      n +
      g.items.filter((item) => {
        const r = rawResponses[item.id]?.["Response"];
        return r && r !== "";
      }).length,
    0
  );

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors w-full text-left"
      >
        <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>▶</span>
        View Responses &amp; Scoring
        <span className="ml-1 text-gray-400 font-normal">
          ({answeredItems}/{totalItems} items recorded)
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {/* Score explanations */}
          <ScoreBanner
            placements={placements}
            modelLevelLabels={modelLevelLabels}
            modelColors={modelColors}
          />

          {/* Per-group item list */}
          {groups.map((group) => {
            const groupItems = group.items;
            const groupAnswered = groupItems.filter(
              (item) => rawResponses[item.id]?.["Response"]
            ).length;

            return (
              <div key={group.groupName} className="rounded-xl border border-gray-200 overflow-hidden">
                {/* Group header */}
                <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-700">{group.groupName}</span>
                    {group.groupNumber && (
                      <span className="ml-1.5 text-xs text-gray-400">#{group.groupNumber}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {groupAnswered}/{groupItems.length}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {groupItems.map((item) => {
                    const itemResp = rawResponses[item.id] ?? {};
                    const mainResponse = itemResp["Response"];

                    return (
                      <div
                        key={item.id}
                        className={`px-3 py-2.5 flex gap-2.5 ${responseBgClass(mainResponse)}`}
                      >
                        <ResponseIcon value={mainResponse} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-snug">{item.prompt}</p>

                          {/* Extra fields (strategies, notes) */}
                          {item.extraFields.map((fieldLabel) => {
                            const fieldVal = itemResp[fieldLabel];
                            if (!fieldVal) return null;
                            return (
                              <p key={fieldLabel} className="text-xs text-gray-500 mt-0.5">
                                <span className="font-semibold">{fieldLabel}:</span>{" "}
                                {fieldVal.split(",").join(", ")}
                              </p>
                            );
                          })}
                        </div>

                        {/* Response label */}
                        <span
                          className={`text-xs flex-shrink-0 font-medium ${
                            mainResponse === "correct"       ? "text-green-600" :
                            mainResponse === "attempted"     ? "text-orange-500" :
                            mainResponse === "incorrect"     ? "text-red-500"   :
                            mainResponse === "not_attempted" ? "text-gray-400"  :
                            "text-gray-300"
                          }`}
                        >
                          {responseLabel(mainResponse)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
