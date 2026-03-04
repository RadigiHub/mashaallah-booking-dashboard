export default function Dashboard() {
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.brandRow}>
            <div style={styles.logo}>M</div>
            <div>
              <div style={styles.brand}>MashaAllah Trips</div>
              <div style={styles.sub}>Agent Panel</div>
            </div>
          </div>

          <div style={styles.navTitle}>Navigation</div>
          <div style={styles.nav}>
            <div style={{ ...styles.navItem, ...styles.navItemActive }}>Dashboard</div>
            <div style={styles.navItem}>Packages</div>
            <div style={styles.navItem}>Quotations</div>
            <div style={styles.navItem}>Bookings</div>
            <div style={styles.navItem}>Settings</div>
          </div>

          <div style={styles.sidebarFooter}>
            <div style={styles.smallMuted}>Status</div>
            <div style={styles.statusPill}>
              <span style={styles.dot} /> System Online
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={styles.main}>
          <header style={styles.topbar}>
            <div>
              <div style={styles.h1}>Agent Dashboard</div>
              <div style={styles.muted}>
                Manage Umrah packages, quotations and booking pipeline.
              </div>
            </div>

            <div style={styles.topRight}>
              <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>⌕</span>
                <input
                  style={styles.search}
                  placeholder="Search booking / client..."
                />
              </div>
              <button style={styles.primaryBtn}>+ New Quotation</button>
            </div>
          </header>

          {/* Stats */}
          <section style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Today’s Quotes</div>
              <div style={styles.statValue}>0</div>
              <div style={styles.smallMuted}>Track sent quotations</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Open Bookings</div>
              <div style={styles.statValue}>0</div>
              <div style={styles.smallMuted}>Pending confirmations</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statLabel}>Packages Created</div>
              <div style={styles.statValue}>0</div>
              <div style={styles.smallMuted}>Last 7 days</div>
            </div>
          </section>

          {/* Actions + Activity */}
          <section style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Quick Actions</div>
              <div style={styles.cardSub}>Start the most common tasks.</div>

              <div style={styles.actions}>
                <button style={styles.actionBtn}>Create Umrah Package</button>
                <button style={styles.actionBtn}>Generate Client Quotation</button>
                <button style={styles.actionBtn}>View Bookings</button>
                <button style={styles.actionBtn}>Send WhatsApp Quote</button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Recent Activity</div>
              <div style={styles.cardSub}>Latest actions will appear here.</div>

              <div style={styles.activity}>
                <div style={styles.activityRow}>
                  <div style={styles.bullet}></div>
                  <div>
                    <div style={styles.activityTitle}>No activity yet</div>
                    <div style={styles.smallMuted}>
                      Once you create packages/quotes, history will show here.
                    </div>
                  </div>
                </div>

                <div style={styles.hr} />

                <div style={styles.tipBox}>
                  <div style={styles.tipTitle}>Tip</div>
                  <div style={styles.tipText}>
                    Use <b>New Quotation</b> to quickly collect client details and
                    send a WhatsApp quote.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer style={styles.footer}>
            <span style={styles.smallMuted}>
              Internal use only • MashaAllah Trips
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 700px at 15% 20%, rgba(123,47,247,0.35), transparent 55%), radial-gradient(900px 600px at 85% 30%, rgba(241,7,163,0.25), transparent 55%), radial-gradient(700px 500px at 50% 95%, rgba(0,255,200,0.10), transparent 60%), #070712",
    color: "white",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    padding: "28px",
    boxSizing: "border-box",
  },
  shell: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "18px",
  },
  sidebar: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "18px",
    backdropFilter: "blur(10px)",
    minHeight: "calc(100vh - 56px)",
    display: "flex",
    flexDirection: "column",
  },
  brandRow: { display: "flex", gap: "12px", alignItems: "center" },
  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#7b2ff7,#f107a3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
  brand: { fontWeight: 700, fontSize: "14px" },
  sub: { opacity: 0.7, fontSize: "12px" },

  navTitle: { marginTop: "18px", opacity: 0.7, fontSize: "12px" },
  nav: { marginTop: "10px", display: "grid", gap: "8px" },
  navItem: {
    padding: "12px 12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    fontSize: "13px",
  },
  navItemActive: {
    background: "linear-gradient(135deg, rgba(123,47,247,0.25), rgba(241,7,163,0.12))",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  sidebarFooter: { marginTop: "auto", paddingTop: "14px" },
  statusPill: {
    marginTop: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "12px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#19ffa3",
    boxShadow: "0 0 12px rgba(25,255,163,0.8)",
    display: "inline-block",
  },

  main: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "18px",
    backdropFilter: "blur(10px)",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  h1: { fontSize: "22px", fontWeight: 800, letterSpacing: "-0.3px" },
  muted: { opacity: 0.75, fontSize: "13px", marginTop: "4px" },
  smallMuted: { opacity: 0.65, fontSize: "12px" },

  topRight: { display: "flex", gap: "10px", alignItems: "center" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "12px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  searchIcon: { opacity: 0.7 },
  search: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    width: "220px",
    fontSize: "13px",
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    color: "white",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    fontWeight: 700,
    fontSize: "13px",
  },

  stats: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },
  statCard: {
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "14px",
  },
  statLabel: { opacity: 0.75, fontSize: "12px" },
  statValue: { fontSize: "26px", fontWeight: 900, marginTop: "8px" },

  grid: {
    marginTop: "12px",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "12px",
  },
  card: {
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "14px",
  },
  cardTitle: { fontWeight: 800, fontSize: "14px" },
  cardSub: { opacity: 0.7, fontSize: "12px", marginTop: "6px" },

  actions: { marginTop: "12px", display: "grid", gap: "10px" },
  actionBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "linear-gradient(90deg, rgba(123,47,247,0.35), rgba(241,7,163,0.20))",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
  },

  activity: { marginTop: "12px" },
  activityRow: { display: "flex", gap: "10px", alignItems: "flex-start" },
  bullet: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
    marginTop: "5px",
  },
  activityTitle: { fontWeight: 700, fontSize: "13px" },
  hr: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    margin: "14px 0",
  },
  tipBox: {
    borderRadius: "12px",
    padding: "12px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  tipTitle: { fontWeight: 800, fontSize: "12px", marginBottom: "6px" },
  tipText: { fontSize: "12px", opacity: 0.85, lineHeight: 1.5 },

  footer: { marginTop: "14px", display: "flex", justifyContent: "space-between" },
};
