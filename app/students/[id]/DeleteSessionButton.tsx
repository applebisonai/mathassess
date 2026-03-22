"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();

    // Delete placements first (FK → sessions), then the session itself
    await supabase.from("construct_placements").delete().eq("session_id", sessionId);
    await supabase.from("assessment_sessions").delete().eq("id", sessionId);

    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-red-500">Are you sure? This cannot be undone.</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded"
      title="Delete session"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </button>
  );
}
