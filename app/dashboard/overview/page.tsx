import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import OverviewTable from "./OverviewTable";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const teacherName = user.email?.split("@")[0] ?? "Teacher";

  // Fetch all active students ordered by grade then last name
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, grade_level")
    .eq("is_active", true)
    .order("grade_level")
    .order("last_name");

  // Fetch all placements
  const { data: allPlacements } = await supabase
    .from("construct_placements")
    .select("student_id, model_name, confirmed_level, suggested_level, date_placed")
    .order("date_placed", { ascending: false });

  // Build a map of latest level per student per model
  const latestLevels: Record<string, Record<string, number>> = {};
  const seenPlacements: Set<string> = new Set();

  for (const placement of allPlacements ?? []) {
    const key = `${placement.student_id}-${placement.model_name}`;
    if (!seenPlacements.has(key)) {
      if (!latestLevels[placement.student_id]) {
        latestLevels[placement.student_id] = {};
      }
      const level = placement.confirmed_level ?? placement.suggested_level;
      if (level !== null && level !== undefined) {
        latestLevels[placement.student_id][placement.model_name] = level;
      }
      seenPlacements.add(key);
    }
  }

  const printDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 1cm; size: landscape; }
        }
      `}</style>
      <div className="print:hidden"><Nav teacherName={teacherName} /></div>
      <main className="max-w-7xl mx-auto px-4 py-8 print:px-0 print:py-0 print:max-w-full">

        {/* Print-only header */}
        <div className="hidden print:block mb-4">
          <h1 className="text-xl font-bold text-gray-900">Class Overview — Assessment Levels</h1>
          <p className="text-gray-500 text-sm">Printed {printDate}</p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Overview</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {students?.length ?? 0} students · latest assessment levels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PrintButton />
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <OverviewTable
          students={students ?? []}
          latestLevels={latestLevels}
        />

      </main>
    </div>
  );
}
