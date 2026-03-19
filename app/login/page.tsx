"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full opacity-10" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-400 rounded-full opacity-10" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-blue-300 rounded-full opacity-10" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-blue-700 text-lg font-black">S</span>
          </div>
          <span className="text-white text-xl font-bold tracking-wide">SOMAT</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Math assessment,<br />
            <span className="text-blue-300">made simple.</span>
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Administer LFIN and AddVantage assessments, track student progress, and drive data-informed intervention — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["LFIN Assessments", "AddVantage MR", "Progress Tracking", "RTI Risk Levels", "FERPA Secure"].map((f) => (
              <span key={f} className="bg-white/10 border border-white/20 text-blue-100 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-300 text-xs">Slade Online Math Assessment Tool</p>
          <p className="text-blue-400 text-xs mt-1">Built for K–5 Title I educators</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-black">S</span>
            </div>
            <span className="text-white text-xl font-bold">SOMAT</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your teacher account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                School Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400 text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-900/40 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-8">
            Account access is provided by your school administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
