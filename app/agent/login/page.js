"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AgentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Supabase Auth Sign In
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const userEmail = data?.user?.email;
      if (!userEmail) throw new Error("Login failed. Please try again.");

      // 2) Check agent exists in agents table (professional access control)
      const { data: agentRow, error: agentError } = await supabase
        .from("agents")
        .select("id, role, status")
        .eq("email", userEmail)
        .single();

      if (agentError) throw new Error("Access not found. Please contact admin.");
      if (agentRow?.status && agentRow.status !== "active") {
        throw new Error("Your access is not active. Please contact admin.");
      }

      // 3) Go to dashboard
      router.push("/agent/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-6 shadow-2xl">
        <div className="mb-5">
          <div className="text-white/90 font-semibold text-lg">MashaAllah Trips</div>
          <div className="text-white/60 text-sm">Agent Login</div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
        <p className="text-white/60 mb-6 text-sm">
          Use your agent credentials to access the internal dashboard.
        </p>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-white/70 text-sm">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/20"
              placeholder="agent@mashaallahtrips.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-white/70 text-sm">Password</label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="flex justify-between text-xs text-white/50 pt-2">
            <a href="/" className="hover:text-white/70">← Back to Home</a>
            <span>Need access? Contact admin</span>
          </div>
        </form>
      </div>
    </div>
  );
}
