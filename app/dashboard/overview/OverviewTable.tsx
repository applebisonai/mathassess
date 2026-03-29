"use client";

import { useState } from "react";
import Link from "next/link";

const MODEL_COLORS: Record<string, string> = {
  "NID": "#22c55e",
  "FNWS": "#15803d",
  "BNWS": "#4ade80",
  "SEAL": "#f97316",
  "SN20": "#ef4444",
  "CPV": "#8b5cf6",
  "A&S": "#0ea5e9",
  "CAS": "#2563eb",
  "SN": "#ea580c",
  "M&D": "#d97706",
  "EM&D": "#f59e0b",
  "MBF": "#ec4899",
};

const MODELS = ["NID", "FNWS", "BNWS", "SEAL", "SN20", "CPV", "A&S", "CAS", "SN", "M&D", "EM&D", "MBF"];

const GRADE_LABEL = (g: number) => (g === 0 ? "K" : `${g}`);
const GRADE_OPTIONS = [
  { value: "all", label: "All Grades" },
  { value: "0",   label: "Kindergarten" },
  { value: "1",   label: "Grade 1" },
  { value: "2",   label: "Grade 2" },
  { value: "3",   label: "Grade 3" },
  { value: "4",   label: "Grade 4" },
  { value: "5",   label: "Grade 5" },
];

function getLevelColor(level: number | null | undefined): string {
  if (level === null || level === undefined) return "bg-gray-100 text-gray-500";
  if (level <= 1) return "bg-red-100 text-red-700";
  if (level <= 3) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: number;
};

type Props = {
  students: Student[];
  latestLevels: Record<string, Record<string, number>>;
};

export default function OverviewTable({ students, latestLevels }: Props) {
  const [search, setSearch]           = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  const filtered = students.filter((s) => {
    const matchesGrade = gradeFilter === "all" || s.grade_level === Number(gradeFilter);
    const q = search.toLowerCase();
    const matchesName = !q ||
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q);
    return matchesGrade && matchesName;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5 print:hidden">
        {/* Name search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-48"
          />
        </div>

        {/* Grade filter */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {GRADE_OPTIONS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>

        {/* Result count */}
        <span className="text-sm text-gray-400">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto print:rounded-none print:border-0 print:shadow-none">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Student</th>
              <th className="px-3 py-3 text-center font-semibold text-gray-700 w-12">Grade</th>
              {MODELS.map((model) => (
                <th
                  key={model}
                  className="px-3 py-3 text-center font-semibold w-16"
                  style={{ color: MODEL_COLORS[model] || "#6b7280" }}
                >
                  {model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={MODELS.length + 2} className="px-5 py-8 text-center text-gray-400 text-sm">
                  No students match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10">
                    <Link
                      href={`/students/${student.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {student.first_name} {student.last_name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-600">
                    {GRADE_LABEL(student.grade_level)}
                  </td>
                  {MODELS.map((model) => {
                    const level = latestLevels[student.id]?.[model];
                    return (
                      <td key={`${student.id}-${model}`} className="px-3 py-3 text-center">
                        {level !== undefined ? (
                          <span className={`inline-block px-2.5 py-1 rounded-full font-semibold ${getLevelColor(level)}`}>
                            {level}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
