"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AgentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Supabase Auth login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setError(authError.message || "Login failed. Please try again.");
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        setError("Login failed: user not found.");
        return;
      }

      // 2) Check Agent access in `agents` table
      //    Expecting columns like: user_id, email, status, role
      const { data: agentRow, error: agentError } = await supabase
        .from("agents")
        .select("id, email, role, status, user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (agentError) {
        setError("Agent access check failed. Please contact admin.");
        return;
      }

      if (!agentRow) {
        setError("Access not found. Please contact admin.");
        return;
      }

      const status = String(agentRow.status || "").toLowerCase();
      if (status && status !== "active") {
        setError("Your account is not active. Please contact admin.");
        return;
      }

      // 3) Success → go to dashboard
      router.push("/agent/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 24,
        paddingBottom: 24,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>MashaAllah Trips</div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Agent Login
          </div>
        </div>

        <h1 style={{ margin: "8px 0 8px", fontSize: 34, lineHeight: 1.15 }}>
          Sign in
        </h1>
        <p style={{ margin: "0 0 18px", color: "var(--muted)" }}>
          Use your agent credentials to access the internal dashboard.
        </p>

        {error ? (
          <div
            style={{
              border: "1px solid rgba(255,80,80,.35)",
              background: "rgba(255,80,80,.10)",
              padding: 12,
              borderRadius: 14,
              marginBottom: 14,
              color: "#ffb3b3",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 14 }}>
            <div className="label">Email</div>
            <input
              className="input"
              type="email"
              placeholder="agent@mashaallahtrips.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              opacity: loading ? 0.8 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
            <a href="/" style={{ opacity: 0.95 }}>
              ← Back to Home
            </a>
            <span>Need access? Contact admin</span>
          </div>
        </form>
      </div>
    </div>
  );
}
