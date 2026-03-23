import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

const GRADE_LABEL = (g: number) => (g === 0 ? "Kindergarten" : `Grade ${g}`);
const GRADE_SHORT = (g: number) => (g === 0 ? "K" : `${g}`);

const AVATAR_COLORS = [
  "bg-blue-500", "bg-indigo-500", "bg-violet-500",
  "bg-teal-500", "bg-emerald-500", "bg-orange-500",
  "bg-pink-500", "bg-rose-500",
];
function studentColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const GRADE_GROUPS: Record<number, string> = {
  0: "Kindergarten", 1: "Grade 1", 2: "Grade 2", 3: "Grade 3",
  4: "Grade 4", 5: "Grade 5",
};

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, grade_level, created_at")
    .eq("teacher_id", user.id)
    .eq("is_active", true)
    .order("grade_level")
    .order("last_name");

  const teacherName = user.email?.split("@")[0] ?? "Teacher";

  // Group students by grade
  const grouped = new Map<number, typeof students>();
  for (const s of students ?? []) {
    if (!grouped.has(s.grade_level)) grouped.set(s.grade_level, []);
    grouped.get(s.grade_level)!.push(s);
  }
  const grades = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

  return (
    <div className="min-h-screen bg-slate-200">
      <Nav teacherName={teacherName} />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {students?.length ?? 0} students on your roster
            </p>
          </div>
          <Link
            href="/students/add"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            + Add Student
          </Link>
        </div>

        {students && students.length > 0 ? (
          <div className="space-y-8">
            {grades.map(([grade, gradeStudents]) => (
              <section key={grade}>
                {/* Grade divider */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {GRADE_GROUPS[grade] ?? `Grade ${grade}`}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{gradeStudents!.length}</span>
                </div>

                {/* Student cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {gradeStudents!.map((s) => {
                    const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();
                    const color = studentColor(s.first_name);
                    return (
                      <div
                        key={s.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all group"
                      >
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {s.first_name} {s.last_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Gr. {GRADE_SHORT(s.grade_level)}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            href={`/assess/select?student=${s.id}`}
                            className="flex-1 text-center text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors"
                          >
                            Assess
                          </Link>
                          <Link
                            href={`/students/${s.id}`}
                            className="flex-1 text-center text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 py-1.5 rounded-lg transition-colors"
                          >
                            Profile
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No students yet</h3>
            <p className="text-gray-400 text-sm mb-5">Add your first student to get started.</p>
            <Link
              href="/students/add"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              + Add Student
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
