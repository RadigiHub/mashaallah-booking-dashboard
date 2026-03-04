import Link from "next/link";

export default function Home() {
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
            <div style={styles.brandSub}>Internal Agent Dashboard</div>
          </div>
        </div>

        <h1 style={styles.title}>Agent Dashboard</h1>
        <p style={styles.text}>
          Welcome. Please continue to the agent login to create Umrah packages and send quotations.
        </p>

        <div style={styles.actions}>
          <Link href="/agent/login" style={styles.primaryBtn}>
            Go to Agent Login
          </Link>
          <a href="mailto:admin@mashaallahtrips.com" style={styles.secondaryLink}>
            Need access? Contact admin
          </a>
        </div>

        <div style={styles.note}>
          Note: This is a secure internal dashboard. If you reached here by mistake, please close this tab.
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
    width: "min(640px, 92vw)",
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
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "16px",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "white",
    fontWeight: 700,
    background:
      "linear-gradient(135deg, rgba(164,97,255,0.95), rgba(255,85,170,0.90))",
    boxShadow: "0 14px 40px rgba(164,97,255,0.18)",
  },
  secondaryLink: {
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
    fontSize: "13px",
  },
  note: {
    marginTop: "14px",
    color: "rgba(255,255,255,0.40)",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};
