"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginPanel() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGithubLogin() {
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local first.");
      return;
    }

    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${origin}/auth/callback`
      }
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    }
  }

  return (
    <section className="section flex min-h-[calc(100vh-9rem)] items-center justify-center">
      <div className="app-panel w-full max-w-md p-6">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm font-bold text-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to POS
        </Link>

        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-md bg-tomato text-white">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-3xl font-black">Login to Lapo Oase</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Optional GitHub sign-in through Supabase Auth for a future synced version of the POS.
        </p>

        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={isLoading}
          className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-tomato disabled:cursor-wait disabled:bg-muted"
        >
          <Github className="h-5 w-5" aria-hidden="true" />
          {isLoading ? "Connecting..." : "Continue with GitHub"}
        </button>

        {error ? (
          <p className="mt-4 rounded-md border border-tomato/30 bg-tomato/10 px-3 py-2 text-sm font-bold text-tomato">
            {error}
          </p>
        ) : null}

        <div className="mt-6 rounded-md bg-fog px-3 py-3 text-xs leading-5 text-muted">
          In Supabase, enable GitHub under Authentication providers and add
          <span className="font-bold text-ink"> http://localhost:3000/auth/callback </span>
          as a redirect URL for local development.
        </div>
      </div>
    </section>
  );
}
