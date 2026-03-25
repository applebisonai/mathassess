"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/nav";
import { ASSESSMENT_CATALOG } from "@/lib/assessments/catalog";

const COLOR_HEADER: Record<string, string> = {
  blue:   "bg-blue-600",
  green:  "bg-green-600",
  orange: "bg-orange-500",
  teal:   "bg-teal-600",
  purple: "bg-purple-600",
};
const COLOR_BADGE: Record<string, string> = {
  blue:   "bg-blue-100 text-blue-700",
  green:  "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  teal:   "bg-teal-100 text-teal-700",
  purple: "bg-purple-100 text-purple-700",
};
const COLOR_BORDER: Record<string, string> = {
  blue:   "border-blue-200",
  green:  "border-green-200",
  orange: "border-orange-200",
  teal:   "border-teal-200",
  purple: "border-purple-200",
};

export default function AssessCatalogPage() {
  const [expanded, setExpanded] = useState<string | null>("lfin");

  return (
    <div className="min-h-screen bg-slate-200">
      <Nav teacherName="" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessment Categories</h1>
            <p className="text-gray-500 text-sm mt-1">Browse all available and upcoming assessments.</p>
          </div>
          <Link
            href="/assess/select"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Start an Assessment →
          </Link>
        </div>

        <div className="space-y-3">
          {ASSESSMENT_CATALOG.map((cat) => {
            const isOpen = expanded === cat.id;
            const availableCount = cat.assessments.filter((a) => a.available).length;

            return (
              <div
                key={cat.id}
                className={`rounded-xl border-2 overflow-hidden ${COLOR_BORDER[cat.color]}`}
              >
                {/* Category Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : cat.id)}
                  className="w-full text-left"
                >
                  <div className={`${COLOR_HEADER[cat.color]} px-5 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="font-bold text-white text-base">{cat.name}</div>
                        <div className="text-white/80 text-xs">{cat.fullName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white text-xs">{cat.description}</div>
                        {availableCount > 0 && (
                          <div className="text-white/80 text-xs mt-0.5">
                            {availableCount} available now
                          </div>
                        )}
                      </div>
                      <span className="text-white text-lg">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>

                {/* Assessment List */}
                {isOpen && (
                  <div className="bg-white divide-y divide-gray-100">
                    {cat.id === "teacher" ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-3">📤</div>
                        <div className="font-medium text-gray-600 mb-1">PDF Upload Coming Soon</div>
                        <div className="text-sm px-8">Upload a scanned classroom assessment and it will be auto-converted to a digital clickable form.</div>
                      </div>
                    ) : cat.assessments.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 text-sm">No assessments listed yet.</div>
                    ) : (
                      cat.assessments.map((a) => (
                        <div
                          key={a.id}
                          className={`flex items-center justify-between px-5 py-3 ${!a.available ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${COLOR_BADGE[cat.color]}`}>
                              {a.name}
                            </span>
                            <span className="text-sm text-gray-700 truncate">{a.description}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {a.models.map((m) => (
                              <span key={m} className={`text-xs px-1.5 py-0.5 rounded ${COLOR_BADGE[cat.color]}`}>{m}</span>
                            ))}
                            <span className="text-xs text-gray-400 whitespace-nowrap">Gr. {a.gradeRange}</span>
                            {a.available ? (
                              <Link
                                href={`/assess/select?assessment=${a.id}`}
                                className={`text-xs font-medium px-2 py-1 rounded ${COLOR_HEADER[cat.color]} text-white hover:opacity-90 transition-opacity`}
                              >
                                Start
                              </Link>
                            ) : (
                              <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded">Coming soon</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
