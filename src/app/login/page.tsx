"use client";

/**
 * Auth: email+password (sign in / sign up) and Google OAuth via Supabase.
 * When Supabase isn't configured the page explains Forge Offline mode.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SectionTitle } from "@/components/ui";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { fullSync } from "@/components/auth-listener";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <SectionTitle sub="Forge Offline mode">No Cloud Configured</SectionTitle>
        <p className="text-sm leading-relaxed text-parchment-300">
          This deployment has no Supabase credentials, so accounts are disabled and your ledger is
          kept safely in this browser. To enable sign-in and sync, add the environment variables from{" "}
          <code>.env.example</code> and redeploy.
        </p>
        <Link href="/dashboard" className="btn-gold mt-6">Continue offline</Link>
      </main>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = getSupabase()!;
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account forged. Check your email if confirmation is required, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Pull + merge the cloud ledger BEFORE navigating, so the dashboard
        // never mistakes an existing account for a first-time visitor.
        setMessage("Retrieving your ledger…");
        await fullSync();
        router.push("/dashboard");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "The gate did not open. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const supabase = getSupabase()!;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <SectionTitle sub="Sync your ledger across every gym">
        {mode === "signin" ? "Return to the Forge" : "Join the Forge"}
      </SectionTitle>

      <form onSubmit={submit} className="panel space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} className="input" value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"} />
        </div>
        <button type="submit" disabled={busy} className="btn-gold w-full">
          {busy ? "Working the bellows…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        <button type="button" onClick={google} className="btn-ghost w-full">
          Continue with Google
        </button>
        {message && <p className="text-center text-xs text-gold-bright">{message}</p>}
      </form>

      <p className="mt-4 text-center text-xs text-parchment-400">
        {mode === "signin" ? "No account yet?" : "Already sworn in?"}{" "}
        <button
          className="font-semibold text-gold-bright underline-offset-2 hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
      <p className="mt-2 text-center text-xs text-parchment-500">
        <Link href="/dashboard" className="hover:underline">Or continue offline →</Link>
      </p>
    </main>
  );
}
