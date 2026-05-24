"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Completing GitHub sign in...");

  useEffect(() => {
    async function finishLogin() {
      if (!isSupabaseConfigured()) {
        setMessage("Supabase is not configured.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setMessage(error?.message ?? "No session was returned from Supabase.");
        return;
      }

      setMessage("Signed in. Redirecting to the menu...");
      router.replace("/");
    }

    finishLogin();
  }, [router]);

  return (
    <section className="section flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="app-panel w-full max-w-md p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-basil/10 text-basil">
          {message.startsWith("Signed in") ? (
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          )}
        </div>
        <h1 className="mt-5 text-2xl font-black">Authentication</h1>
        <p className="mt-3 text-sm text-muted">{message}</p>
        <Link href="/" className="focus-ring mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-bold text-white">
          Return home
        </Link>
      </div>
    </section>
  );
}
