"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/nav";

const CATEGORIES = [
  {
    id: "lfin",
    name: "LFIN",
    fullName: "Learning Framework in Number",
    color: "blue",
    icon: "📐",
    description: "Wright & Ellemor-Collins — Schedules 2A–3F",
    assessments: [
      { id: "schedule-2a", name: "Schedule 2A", description: "Forward/Backward Number Word Sequences & Numeral ID", gradeRange: "K–1", models: ["FNWS", "BNWS", "NID"], available: true },
      { id: "schedule-2b", name: "Schedule 2B", description: "Spatial Patterns, Finger Patterns & Structuring to 20", gradeRange: "K–2", models: ["SN20"], available: true },
      { id: "schedule-2c", name: "Schedule 2C", description: "Early Arithmetical Strategies — Addition & Subtraction", gradeRange: "K–2", models: ["SEAL"], available: true },
      { id: "schedule-3a", name: "Schedule 3A", description: "Number Words and Numerals — NID, FNWS & BNWS", gradeRange: "K–3", models: ["NID", "FNWS", "BNWS"], available: true },
      { id: "schedule-3b", name: "Schedule 3B", description: "Structuring Numbers to 20 — SN20", gradeRange: "K–3", models: ["SN20"], available: true },
      { id: "schedule-3c", name: "Schedule 3C", description: "Conceptual Place Value — Incrementing & Decrementing by 10s and 100s", gradeRange: "1–3", models: ["CPV"], available: true },
      { id: "schedule-3d", name: "Schedule 3D", description: "Addition & Subtraction to 100 — Formal & Higher Decade", gradeRange: "2–5", models: ["A&S"], available: true },
      { id: "schedule-3e", name: "Schedule 3E", description: "Decimals & Percentages — Tenths, Hundredths & Equivalence", gradeRange: "4–5", models: ["DEC"], available: false },
      { id: "schedule-3f", name: "Schedule 3F", description: "Multiplication & Division Facts — Strategies & Automaticity", gradeRange: "3–5", models: ["MDF"], available: false },
    ],
  },
  {
    id: "addvantage",
    name: "AddVantage MR",
    fullName: "AddVantage Math Recovery",
    color: "green",
    icon: "➕",
    description: "US Math Recovery Council — Courses 1 & 2",
    assessments: [
      { id: "av-nwn", name: "Number Words and Numerals", description: "Course 1 — FNWS, BNWS & Numeral Identification — Levels 0–5", gradeRange: "K–3", models: ["FNWS", "BNWS", "NID"], available: true, route: "/assess/interview/av-nwn" },
      { id: "av-sn", name: "Structuring Numbers", description: "Course 1 — Spatial patterns, finger patterns, partitions of 5 & 10, doubles to 20 — Levels 0–5", gradeRange: "K–3", models: ["SN"], available: true, route: "/assess/interview/av-sn" },
      { id: "av-addsub", name: "Addition & Subtraction", description: "Course 1 — Screened collections, missing addend, bare numbers, relational thinking", gradeRange: "K–3", models: ["SEAL"], available: false },
      { id: "av-pv", name: "Place Value", description: "Course 2 — Tens & ones sequences, two-digit addition/subtraction with & without materials", gradeRange: "2–4", models: ["CPV"], available: true },
      { id: "av-multdiv", name: "Multiplication & Division", description: "Course 2 — Equal groups, arrays, relational thinking, proportional reasoning", gradeRange: "2–5", models: ["M&D"], available: false },
    ],
  },
  {
    id: "nns",
    name: "Number Screeners",
    fullName: "Number Sense Screeners",
    color: "orange",
    icon: "🎯",
    description: "Quick screeners for tier placement & progress monitoring",
    assessments: [
      { id: "nss-k", name: "Number Sense Screener — K", description: "Counting, subitizing, number order & simple addition (Jordan et al.)", gradeRange: "K", models: [], available: false },
      { id: "nss-1", name: "Number Sense Screener — 1", description: "Number word sequences, numeral ID, counting on, fact fluency", gradeRange: "1", models: [], available: false },
      { id: "ns-brief", name: "Brief Number Sense Check", description: "Quick 10-item screener — counting, magnitude, operations", gradeRange: "K–3", models: [], available: false },
      { id: "tema3", name: "TEMA-3 Informal Tasks", description: "Test of Early Mathematics Ability — informal diagnostic subset", gradeRange: "K–2", models: [], available: false },
    ],
  },
  {
    id: "bridges",
    name: "Bridges / CCSS",
    fullName: "Bridges in Mathematics & Common Core Checks",
    color: "teal",
    icon: "🌉",
    description: "Bridges curriculum assessments & CCSS unit checks",
    assessments: [
      { id: "br-unit-check", name: "Unit Pre/Post Checks", description: "Beginning and end-of-unit checks aligned to Bridges units", gradeRange: "K–5", models: [], available: false },
      { id: "br-checkups", name: "Checkups 1–5", description: "Mid-module progress checkups embedded in Bridges curriculum", gradeRange: "K–5", models: [], available: false },
      { id: "br-cumulative", name: "Cumulative Review", description: "End-of-year cumulative assessment across all domains", gradeRange: "K–5", models: [], available: false },
    ],
  },
  {
    id: "teacher",
    name: "Teacher Created",
    fullName: "My Custom Assessments",
    color: "purple",
    icon: "📝",
    description: "Upload a PDF — auto-converted to a digital form",
    assessments: [],
  },
];

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
          {CATEGORIES.map((cat) => {
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
