"use client";

// Client shell for the MVP login flow. Credentials are checked by server API routes, not in browser code.
import { FormEvent, useEffect, useState } from "react";
import { LockKeyhole, LogOut, Utensils } from "lucide-react";

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = (await response.json()) as { authenticated?: boolean };

        if (isMounted) {
          setIsAuthenticated(Boolean(data.authenticated));
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Username atau password salah.");
        return;
      }

      setIsAuthenticated(true);
      setPassword("");
    } catch {
      setError("Login gagal. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => null);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  }

  if (!isReady) {
    return <div className="min-h-screen bg-paper" />;
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
        <form onSubmit={handleSubmit} className="app-panel w-full max-w-md p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-tomato text-white">
            <Utensils className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-ocean">Lapo Oase POS</p>
          <h1 className="mt-2 text-3xl font-black">Masuk ke aplikasi</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Gunakan akun staff untuk membuka order, kitchen, report, dan inventory.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-bold" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
              />
            </div>

            <div>
              <label className="text-sm font-bold" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="focus-ring mt-2 w-full rounded-md border border-ink/10 bg-white px-3 py-3"
              />
            </div>
          </div>

          {error ? <p className="mt-4 rounded-md bg-tomato/10 px-3 py-2 text-sm font-bold text-tomato">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-tomato"
          >
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? "Memeriksa..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <div className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl justify-end px-4 py-2 sm:px-6 lg:px-8">
          <button type="button" onClick={handleLogout} className="focus-ring inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-black text-muted hover:text-ink">
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
