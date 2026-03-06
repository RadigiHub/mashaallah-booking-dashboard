"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AgentLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      // 1) Supabase auth login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (authError) {
        setMsg({
          type: "error",
          text: authError.message || "Login failed. Please try again.",
        });
        return;
      }

      const user = authData?.user;
      if (!user?.email) {
        setMsg({
          type: "error",
          text: "Login failed. User email not found.",
        });
        return;
      }

      // 2) Check access in agents table by EMAIL only
      const { data: agentRow, error: agentError } = await supabase
        .from("agents")
        .select("id, email, role, is_active, full_name")
        .ilike("email", user.email)
        .maybeSingle();

      if (agentError) {
        await supabase.auth.signOut();
        setMsg({
          type: "error",
          text: "Agent access check failed. Please contact admin.",
        });
        return;
      }

      if (!agentRow) {
        await supabase.auth.signOut();
        setMsg({
          type: "error",
          text: "Access not found. Please contact admin.",
        });
        return;
      }

      if (agentRow.is_active === false) {
        await supabase.auth.signOut();
        setMsg({
          type: "error",
          text: "Your account is disabled. Please contact admin.",
        });
        return;
      }

      // 3) Success
      setMsg({ type: "success", text: "Login successful. Redirecting..." });
      router.push("/agent/dashboard");
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="container"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 520 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, rgba(120,0,255,.55), rgba(255,0,180,.45))",
              border: "1px solid rgba(255,255,255,.12)",
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontWeight: 800, lineHeight: 1.1 }}>
              MashaAllah Trips
            </div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Agent Login</div>
          </div>
        </div>

        <h1
          style={{ fontSize: 36, margin: "10px 0 6px", letterSpacing: "-0.02em" }}
        >
          Sign in
        </h1>
        <p style={{ marginTop: 0, color: "var(--muted)", marginBottom: 14 }}>
          Use your agent credentials to access the internal dashboard.
        </p>

        {msg?.text ? (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.12)",
              background:
                msg.type === "error"
                  ? "rgba(255, 70, 70, .10)"
                  : "rgba(0, 200, 120, .10)",
              color: msg.type === "error" ? "#ffb4b4" : "#b9ffd9",
            }}
          >
            {msg.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Email</div>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="agent@mashaallahtrips.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              opacity: canSubmit ? 1 : 0.6,
              pointerEvents: canSubmit ? "auto" : "none",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <Link href="/" style={{ opacity: 0.9 }}>
            ← Back to Home
          </Link>
          <span style={{ opacity: 0.9 }}>Need access? Contact admin</span>
        </div>
      </div>
    </main>
  );
}
