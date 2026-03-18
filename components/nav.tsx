"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/students", label: "My Students", icon: "👥" },
  { href: "/assess", label: "Assess", icon: "📋" },
];

export default function Nav({ teacherName }: { teacherName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">M</span>
        </div>
        <span className="font-bold text-gray-900 text-sm">MathAssess</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Teacher Name + Sign Out */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-600">{teacherName}</span>
        <button
          onClick={handleSignOut}
          className="text-gray-400 hover:text-gray-600 text-xs border border-gray-200 rounded px-2 py-1"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
