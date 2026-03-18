import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch teacher's students
  const { data: students } = await supabase
    .from("students")
    .select("id, first_name, last_name, grade_level")
    .eq("teacher_id", user.id)
    .eq("is_active", true)
    .order("last_name");

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from("assessment_sessions")
    .select(`
      id, date_administered, status,
      students(first_name, last_name, grade_level),
      assessments(name, short_name)
    `)
    .eq("teacher_id", user.id)
    .order("date_administered", { ascending: false })
    .limit(5);

  const teacherName = user.email?.split("@")[0] ?? "Teacher";
  const studentCount = students?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName={teacherName} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {teacherName}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-blue-600">{studentCount}</div>
            <div className="text-sm text-gray-500 mt-1">Students</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-green-600">—</div>
            <div className="text-sm text-gray-500 mt-1">Assessments This Week</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-3xl font-bold text-orange-500">—</div>
            <div className="text-sm text-gray-500 mt-1">Students At Risk</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/assess/select"
                className="flex items-center gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <span className="text-xl">📋</span>
                <div>
                  <div className="text-sm font-medium text-blue-800">Start an Assessment</div>
                  <div className="text-xs text-blue-600">Select a student and begin</div>
                </div>
              </Link>
              <Link
                href="/students/add"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">➕</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">Add a Student</div>
                  <div className="text-xs text-gray-500">Add a student to your roster</div>
                </div>
              </Link>
              <Link
                href="/students"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">👥</span>
                <div>
                  <div className="text-sm font-medium text-gray-800">View My Students</div>
                  <div className="text-xs text-gray-500">See all students and their progress</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Recent Assessments</h2>
            {recentSessions && recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">
                        {session.students?.first_name} {session.students?.last_name}
                      </span>
                      <span className="text-gray-400 ml-2">
                        {session.assessments?.short_name}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {new Date(session.date_administered).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm">No assessments yet.</div>
                <div className="text-xs mt-1">Start by assessing a student!</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
