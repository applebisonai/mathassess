"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SomatLogo } from "./somat-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/assess", label: "Assessments" },
];

function Initials({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = [
    "bg-blue-500", "bg-indigo-500", "bg-violet-500",
    "bg-teal-500", "bg-emerald-500", "bg-orange-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

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
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-0 flex items-center justify-between h-14 sticky top-0 z-40">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
        <SomatLogo size={30} />
        <span className="font-extrabold text-gray-900 text-base tracking-tight">SOMAT</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-1 text-sm font-medium transition-colors rounded-md ${
                active
                  ? "text-blue-700 bg-blue-50"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Teacher + Sign Out */}
      <div className="flex items-center gap-3 shrink-0">
        <Initials name={teacherName} />
        <span className="text-sm font-medium text-gray-700 hidden sm:block">{teacherName}</span>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-md px-2.5 py-1 transition-colors hover:border-gray-300"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
