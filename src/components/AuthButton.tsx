"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Github, LogOut, UserCircle } from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthUser = {
  email?: string;
  name?: string;
};

export function AuthButton() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoaded(true);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser({
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name ?? data.user?.user_metadata?.name
      });
      setLoaded(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              email: session.user.email,
              name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name
            }
          : null
      );
      setLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  if (!loaded) {
    return <span className="h-9 w-24 rounded-md bg-fog" aria-hidden="true" />;
  }

  if (!isSupabaseConfigured()) {
    return (
      <Link
        href="/login"
        className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-bold text-muted hover:text-ink"
      >
        <Github className="h-4 w-4" aria-hidden="true" />
        Login
      </Link>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="focus-ring inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm font-bold text-muted hover:text-ink"
      >
        <Github className="h-4 w-4" aria-hidden="true" />
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-36 items-center gap-2 truncate text-sm font-bold text-muted sm:inline-flex">
        <UserCircle className="h-4 w-4 shrink-0 text-basil" aria-hidden="true" />
        <span className="truncate">{user.name ?? user.email ?? "Signed in"}</span>
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-bold text-white hover:bg-tomato"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}
