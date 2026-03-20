"use client";

import { useState } from "react";

interface NoteField { label: string; value: string; }
interface NoteEntry { itemId: string; prompt: string; groupName: string; fields: NoteField[]; }

export default function SessionNotes({ notes }: { notes: NoteEntry[] }) {
  const [open, setOpen] = useState(false);

  if (notes.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors w-full text-left"
      >
        <span className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}>▶</span>
        Session Notes
        <span className="ml-1 text-gray-400 font-normal">({notes.length} item{notes.length !== 1 ? "s" : ""})</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {notes.map(({ itemId, prompt, groupName, fields }) => (
            <div key={itemId} className="bg-gray-50 rounded-lg px-3 py-2">
              {groupName && (
                <div className="text-xs text-gray-400 mb-0.5">{groupName}</div>
              )}
              <div className="text-xs font-medium text-gray-700 mb-1 leading-snug">{prompt}</div>
              <div className="space-y-0.5">
                {fields.map(({ label, value }) => (
                  <div key={label} className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-500">{label}:</span>{" "}{value}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
