"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
export default function SavedQuotationsPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState("Agent");
  const [quotes, setQuotes] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadPage() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      const userEmail = session.user.email;

      const { data: agentRow, error: agentError } = await supabase
        .from("agents")
        .select("full_name, role, is_active, email")
        .ilike("email", userEmail)
        .maybeSingle();

      if (agentError || !agentRow || agentRow.is_active === false) {
        await supabase.auth.signOut();
        router.replace("/agent/login");
        return;
      }

      setAgentName(agentRow.full_name || "Agent");
      setChecking(false);

      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMsg("Failed to load quotations.");
        setLoading(false);
        return;
      }

      setQuotes(data || []);
      setLoading(false);
    }

    loadPage();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/agent/login");
  }

  if (checking || loading) {
    return (
      <div style={styles.loadingWrap}>
        Loading saved quotations...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
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
            <Link href="/agent/dashboard" style={styles.navItem}>
              Dashboard
            </Link>
            <div style={{ ...styles.navItem, ...styles.navItemActive }}>
              Quotations
            </div>
            <div style={styles.navItem}>Packages</div>
            <div style={styles.navItem}>Bookings</div>
            <div style={styles.navItem}>Settings</div>
          </div>

          <div style={styles.sidebarFooter}>
            <div style={styles.smallMuted}>Logged in as</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>{agentName}</div>

            <button style={styles.logoutBtnSide} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <main style={styles.main}>
          <div style={styles.topbar}>
            <div>
              <div style={styles.h1}>Saved Quotations</div>
              <div style={styles.muted}>
                View all saved Umrah quotations created in the system.
              </div>
            </div>

            <div style={styles.topButtons}>
              <Link href="/agent/quotations/new" style={styles.primaryBtn}>
                + New Quotation
              </Link>

              <Link href="/agent/dashboard" style={styles.secondaryBtn}>
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {msg ? <div style={styles.alert}>{msg}</div> : null}

          <div style={styles.infoBar}>
            <div>
              Logged in as <b>{agentName}</b>
            </div>
            <div>
              Total quotations: <b>{quotes.length}</b>
            </div>
          </div>

          {quotes.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyTitle}>No quotations yet</div>
              <div style={styles.emptyText}>
                Abhi tak koi quotation save nahi hui.
              </div>

              <Link href="/agent/quotations/new" style={styles.primaryBtn}>
                Create First Quotation
              </Link>
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Booking Ref</th>
                    <th style={styles.th}>Client</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Destination</th>
                    <th style={styles.th}>Travel Date</th>
                    <th style={styles.th}>Total Price</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {quotes.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.refBadge}>
                          {safe(item.booking_reference)}
                        </span>
                      </td>

                      <td style={styles.td}>{safe(item.client_name)}</td>
                      <td style={styles.td}>{safe(item.client_phone)}</td>
                      <td style={styles.td}>{safe(item.destination)}</td>
                      <td style={styles.td}>{safe(item.travel_date)}</td>
                      <td style={styles.td}>{formatPrice(item.total_price)}</td>

                      <td style={styles.td}>
                        <span style={statusBadgeStyle(item.quotation_status)}>
                          {safe(item.quotation_status)}
                        </span>
                      </td>

                      <td style={styles.td}>{formatDate(item.created_at)}</td>

                      <td style={styles.td}>
                        <Link
                          href={`/agent/quotations/${item.id}`}
                          style={styles.viewBtn}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function safe(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value).startsWith("£") ? String(value) : `£${value}`;
}

function statusBadgeStyle(status) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "capitalize",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const s = String(status || "").toLowerCase();

  if (s === "confirmed") {
    return {
      ...base,
      background: "rgba(0,200,120,0.14)",
      color: "#b9ffd9",
    };
  }

  if (s === "sent") {
    return {
      ...base,
      background: "rgba(80,140,255,0.14)",
      color: "#c8dcff",
    };
  }

  return {
    ...base,
    background: "rgba(255,255,255,0.07)",
    color: "#f1f1f7",
  };
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
    maxWidth: "1280px",
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
    color: "white",
    textDecoration: "none",
  },

  navItemActive: {
    background:
      "linear-gradient(135deg, rgba(123,47,247,0.25), rgba(241,7,163,0.12))",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  sidebarFooter: { marginTop: "auto", paddingTop: "14px" },

  smallMuted: { opacity: 0.65, fontSize: "12px" },

  logoutBtnSide: {
    marginTop: "14px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
    color: "white",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 700,
    fontSize: "13px",
    width: "100%",
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
    marginBottom: "16px",
  },

  h1: { fontSize: "24px", fontWeight: 800 },

  muted: { opacity: 0.75, fontSize: "13px", marginTop: "4px" },

  topButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    color: "white",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    fontWeight: 700,
    fontSize: "13px",
    textDecoration: "none",
  },

  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 700,
    fontSize: "13px",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },

  alert: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,70,70,.10)",
    color: "#ffb4b4",
  },

  infoBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  emptyCard: {
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.22)",
    display: "grid",
    gap: "12px",
    justifyItems: "start",
  },

  emptyTitle: {
    fontSize: "20px",
    fontWeight: 800,
  },

  emptyText: {
    opacity: 0.78,
    fontSize: "14px",
  },

  tableWrap: {
    overflowX: "auto",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
  },

  th: {
    textAlign: "left",
    padding: "14px 12px",
    fontSize: "12px",
    fontWeight: 800,
    opacity: 0.78,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
  },

  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  td: {
    padding: "14px 12px",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  refBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(123,47,247,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontWeight: 700,
    fontSize: "12px",
  },

  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "10px",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "12px",
  },

  loadingWrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(1200px 700px at 15% 20%, rgba(123,47,247,0.35), transparent 55%), radial-gradient(900px 600px at 85% 30%, rgba(241,7,163,0.25), transparent 55%), radial-gradient(700px 500px at 50% 95%, rgba(0,255,200,0.10), transparent 60%), #070712",
    color: "white",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    padding: "24px",
  },
};
