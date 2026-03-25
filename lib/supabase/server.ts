import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component – cookies set in middleware
          }
        },
      },
      // Disable keep-alive to prevent ECONNRESET on Vercel serverless.
      // Vercel may reuse a TCP connection after Supabase has closed it;
      // forcing a fresh connection per request avoids the reset error.
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) =>
          fetch(url, { ...options, keepalive: false, cache: "no-store" }),
      },
    }
  );
}
