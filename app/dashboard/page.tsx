import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

const GRADE_LABEL = (g: number) => (g === 0 ? "K" : `Grade ${g}`);

const AVATAR_COLORS = [
  "bg-blue-500", "bg-indigo-500", "bg-violet-500",
  "bg-teal-500", "bg-emerald-500", "bg-orange-500",
  "bg-pink-500", "bg-rose-500",
];

function studentColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function greeting(name: string) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name}`;
}

const ASSESSMENT_COUNT = 6; // schedules 2A, 2B, 2C, 3A, 3B, 3C currently live

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const teacherName = user.email?.split("@")[0] ?? "Teacher";

  // Parallel data fetch
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const [
    { data: students },
    { count: weeklyCount },
    { count: totalCount },
    { data: recentSessions },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, first_name, last_name, grade_level")
      .eq("teacher_id", user.id)
      .eq("is_active", true)
      .order("last_name")
      .limit(8),
    supabase
      .from("assessment_sessions")
      .select("id", { count: "exact", head: true })
      .eq("teacher_id", user.id)
      .gte("date_administered", weekAgoStr),
    supabase
      .from("assessment_sessions")
      .select("id", { count: "exact", head: true })
      .eq("teacher_id", user.id),
    supabase
      .from("assessment_sessions")
      .select("id, date_administered, assessment_id, students(first_name, last_name)")
      .eq("teacher_id", user.id)
      .order("date_administered", { ascending: false })
      .limit(6),
  ]);

  const studentCount = students?.length ?? 0;

  const SCHEDULE_LABELS: Record<string, string> = {
    "schedule-2a": "2A", "schedule-2b": "2B", "schedule-2c": "2C",
    "schedule-3a": "3A", "schedule-3b": "3B", "schedule-3c": "3C",
    "av-pv": "PV",
  };

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName={teacherName} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-7">

        {/* ── Hero header ─────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting(teacherName)}</h1>
            <p className="text-blue-200 text-sm mt-1">{dateLabel}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/assess/select"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              ▶ Start Assessment
            </Link>
            <Link
              href="/students/add"
              className="bg-blue-500 hover:bg-blue-400 text-white font-medium text-sm px-4 py-2.5 rounded-xl border border-blue-400 transition-colors"
            >
              + Add Student
            </Link>
          </div>
        </div>

        {/* ── Stat cards ───────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Students on Roster"
            value={studentCount}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-4M9 20H4v-2a4 4 0 015-4m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zM3 7a2 2 0 114 0 2 2 0 01-4 0z" />
              </svg>
            }
          />
          <StatCard
            label="Assessments This Week"
            value={weeklyCount ?? 0}
            color="indigo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatCard
            label="Available Assessments"
            value={ASSESSMENT_COUNT}
            color="teal"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            href="/assess"
          />
        </div>

        {/* ── Bottom grid ─────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-5">

          {/* Students quick-access */}
          <div className="col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">My Students</h2>
              <Link href="/students" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                View all →
              </Link>
            </div>

            {students && students.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {students.map((s) => {
                  const initials = `${s.first_name[0]}${s.last_name[0]}`.toUpperCase();
                  const color = studentColor(s.first_name);
                  return (
                    <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                          <div className="text-xs text-gray-400">{GRADE_LABEL(s.grade_level)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/assess/select?student=${s.id}`}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium"
                        >
                          Assess
                        </Link>
                        <Link
                          href={`/students/${s.id}`}
                          className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1 rounded-lg"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">No students yet</p>
                <Link
                  href="/students/add"
                  className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium"
                >
                  + Add your first student
                </Link>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Recent Assessments */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Activity</h2>
                <span className="text-xs text-gray-400">{totalCount ?? 0} total</span>
              </div>

              {recentSessions && recentSessions.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {recentSessions.map((session: any) => {
                    const student = session.students;
                    const badge = SCHEDULE_LABELS[session.assessment_id] ?? session.assessment_id;
                    const date = new Date(session.date_administered).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    });
                    return (
                      <div key={session.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate font-medium">
                            {student?.first_name} {student?.last_name}
                          </p>
                          <p className="text-xs text-gray-400">{date}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                          {badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <svg className="w-8 h-8 mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  <p className="text-xs">No assessments yet</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/assess/select"
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors group"
                >
                  <span className="text-white text-lg">▶</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Start an Assessment</div>
                    <div className="text-xs text-blue-200">Select student &amp; schedule</div>
                  </div>
                </Link>
                <Link
                  href="/assess"
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-500 text-lg">📐</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">Browse Assessments</div>
                    <div className="text-xs text-gray-400">LFIN, AddVantage &amp; more</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

function StatCard({
  label, value, color, icon, href,
}: {
  label: string;
  value: number;
  color: "blue" | "indigo" | "teal";
  icon: React.ReactNode;
  href?: string;
}) {
  const colors = {
    blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   num: "text-blue-700" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", num: "text-indigo-700" },
    teal:   { bg: "bg-teal-50",   icon: "text-teal-600",   num: "text-teal-700" },
  };
  const c = colors[color];

  const inner = (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 ${href ? "hover:border-gray-300 transition-colors" : ""}`}>
      <div className={`${c.bg} ${c.icon} rounded-xl p-3 shrink-0`}>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-extrabold ${c.num}`}>{value}</div>
        <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
