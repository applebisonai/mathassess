// Shared correct/incorrect toggle used by all interview pages.
// Renders ✓ and ✗ buttons; toggling the active value deselects it.

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function InlineCorrectIncorrect({ value, onChange }: Props) {
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
