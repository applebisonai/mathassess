// Shared response toggle used by all interview pages.
// Four states: correct | attempted | incorrect | not_attempted (empty = no response yet)
//
// Scoring rules applied in calculateResults() in each interview page:
//   "correct"       → counts as correct (awards level credit)
//   "attempted"     → student tried but was not fluent; treated as NOT correct (conservative)
//   "incorrect"     → clearly wrong; NOT correct
//   "not_attempted" → item was skipped/not administered; EXCLUDED from scoring
//                     (neither helps nor hurts — used for start/stop rules)
//
// Toggling the already-active button deselects it (returns to "").

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Show the "Not attempted" (—) button. Only needed when skipping an item
   *  changes the scoring outcome (e.g., items under start/stop rules). */
  showNotAttempted?: boolean;
}

export default function InlineCorrectIncorrect({
  value,
  onChange,
  showNotAttempted = false,
}: Props) {
  function toggle(target: string) {
    onChange(value === target ? "" : target);
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {/* Correct */}
      <button
        onClick={() => toggle("correct")}
        title="Correct — student answered fluently and accurately"
        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
          value === "correct"
            ? "bg-green-100 border-green-400 text-green-700"
            : "bg-white border-gray-200 text-gray-400 hover:border-green-300"
        }`}
      >
        ✓
      </button>

      {/* Attempted — orange ~ */}
      <button
        onClick={() => toggle("attempted")}
        title="Attempted — student tried but was not fluent (scores as NOT correct)"
        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
          value === "attempted"
            ? "bg-orange-100 border-orange-400 text-orange-700"
            : "bg-white border-gray-200 text-gray-400 hover:border-orange-300"
        }`}
      >
        ~
      </button>

      {/* Incorrect */}
      <button
        onClick={() => toggle("incorrect")}
        title="Incorrect — student gave a wrong answer or could not respond"
        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
          value === "incorrect"
            ? "bg-red-100 border-red-400 text-red-700"
            : "bg-white border-gray-200 text-gray-400 hover:border-red-300"
        }`}
      >
        ✗
      </button>

      {/* Not attempted — only rendered when relevant to scoring */}
      {showNotAttempted && (
        <button
          onClick={() => toggle("not_attempted")}
          title="Not attempted — item was skipped or not administered; excluded from scoring"
          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
            value === "not_attempted"
              ? "bg-gray-200 border-gray-400 text-gray-600"
              : "bg-white border-gray-200 text-gray-300 hover:border-gray-400"
          }`}
        >
          —
        </button>
      )}
    </div>
  );
}
