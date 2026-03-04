"use client";

import { useState } from "react";

export default function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert("Login connected nahi hai abhi. Next step me authentication add karenge.");
  }

  return (
    <main style={styles.bg}>
      <div style={styles.overlay} />

      <section style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logo} aria-hidden="true">
            M
          </div>
          <div>
            <div style={styles.brandName}>MashaAllah Trips</div>
            <div style={styles.brandSub}>Agent Login</div>
          </div>
        </div>

        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.text}>
          Use your agent credentials to access the internal dashboard.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="agent@mashaallahtrips.com"
              autoComplete="email"
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" style={styles.primaryBtn}>
            Sign in
          </button>

          <div style={styles.helperRow}>
            <a href="/" style={styles.link}>
              ← Back to Home
            </a>
            <a href="mailto:admin@mashaallahtrips.com" style={styles.linkMuted}>
              Forgot access?
            </a>
          </div>
        </form>

        <div style={styles.note}>
          This login is UI-only right now. Next we will connect real authentication + protected dashboard routes.
        </div>
      </section>
    </main>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "28px 16px",
    background:
      "radial-gradient(900px 450px at 20% 15%, rgba(164, 97, 255, 0.35), transparent 55%), radial-gradient(900px 450px at 85% 25%, rgba(255, 85, 170, 0.22), transparent 55%), radial-gradient(900px 450px at 40% 90%, rgba(0, 255, 210, 0.10), transparent 55%), #07060b",
    position: "relative",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.00) 40%, rgba(0,0,0,0.25) 100%)",
    pointerEvents: "none",
  },
  card: {
    width: "min(520px, 92vw)",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(16, 14, 24, 0.72)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 20px 70px rgba(0,0,0,0.55)",
    padding: "22px 22px 18px",
    position: "relative",
    zIndex: 1,
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "white",
    background:
      "linear-gradient(135deg, rgba(164,97,255,0.85), rgba(255,85,170,0.75))",
    boxShadow: "0 10px 30px rgba(164,97,255,0.22)",
    letterSpacing: "0.5px",
  },
  brandName: {
    color: "rgba(255,255,255,0.95)",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  brandSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "13px",
    marginTop: "2px",
  },
  title: {
    margin: "10px 0 8px",
    fontSize: "28px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "-0.3px",
  },
  text: {
    margin: 0,
    color: "rgba(255,255,255,0.70)",
    lineHeight: 1.55,
    fontSize: "15px",
  },
  form: { marginTop: "14px", display: "grid", gap: "12px" },
  label: {
    display: "grid",
    gap: "6px",
    color: "rgba(255,255,255,0.70)",
    fontSize: "13px",
  },
  input: {
    height: "44px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.35)",
    color: "rgba(255,255,255,0.92)",
    padding: "0 12px",
    outline: "none",
  },
  primaryBtn: {
    height: "44px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: 800,
    background:
      "linear-gradient(135deg, rgba(164,97,255,0.95), rgba(255,85,170,0.90))",
    boxShadow: "0 14px 40px rgba(164,97,255,0.18)",
  },
  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "2px",
  },
  link: { color: "rgba(255,255,255,0.80)", textDecoration: "none", fontSize: "13px" },
  linkMuted: { color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "13px" },
  note: {
    marginTop: "14px",
    color: "rgba(255,255,255,0.40)",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};
