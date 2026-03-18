import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Nav from "@/components/nav";
import Link from "next/link";

const gradeLabel = (g: number) =>
  g === 0 ? "Kindergarten" : `Grade ${g}`;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav teacherName={teacherName} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-500 text-sm">
              {students?.length ?? 0} students on your roster
            </p>
          </div>
          <Link
            href="/students/add"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Student
          </Link>
        </div>

        {students && students.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Grade</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Last Assessed</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {gradeLabel(student.grade_level)}
                    </td>
                    <td className="px-4 py-3 text-gray-400">—</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/assess/select?student=${student.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                      >
                        Assess
                      </Link>
                      <Link
                        href={`/students/${student.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-medium text-gray-900 mb-1">No students yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Add your first student to get started.
            </p>
            <Link
              href="/students/add"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Add Student
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
