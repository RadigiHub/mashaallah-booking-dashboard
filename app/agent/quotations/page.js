"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function QuotationsPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState("Agent");
  const [rows, setRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function initPage() {
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
        .select(
          "id, client_name, client_phone, destination, travel_date, total_price, quotation_status, booking_reference, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message || "Failed to load quotations.");
        setRows([]);
      } else {
        setRows(data || []);
      }

      setLoading(false);
    }

    initPage();
  }, [router]);

  if (checking) {
    return (
      <div style={styles.loadingWrap}>
        Loading quotations...
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>Saved Quotations</h1>
            <p style={styles.subtitle}>
              View all saved Umrah quotations created in the system.
            </p>
          </div>

          <div style={styles.topActions}>
            <Link href="/agent/quotations/new" style={styles.primaryBtn}>
              + New Quotation
            </Link>

            <Link href="/agent/dashboard" style={styles.secondaryBtn}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div style={styles.infoBar}>
          <span>
            Logged in as <b>{agentName}</b>
          </span>
          <span>
            Total quotations: <b>{rows.length}</b>
          </span>
        </div>

        {errorMsg ? (
          <div style={styles.errorBox}>{errorMsg}</div>
        ) : null}

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading saved quotations...</div>
          ) : rows.length === 0 ? (
            <div style={styles.emptyState}>
              No quotations found yet. Create your first quotation.
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
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.refBadge}>
                          {item.booking_reference || "—"}
                        </span>
                      </td>
                      <td style={styles.td}>{item.client_name || "—"}</td>
                      <td style={styles.td}>{item.client_phone || "—"}</td>
                      <td style={styles.td}>{item.destination || "—"}</td>
                      <td style={styles.td}>{item.travel_date || "—"}</td>
                      <td style={styles.td}>{item.total_price || "—"}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...(item.quotation_status === "confirmed"
                              ? styles.statusConfirmed
                              : item.quotation_status === "sent"
                              ? styles.statusSent
                              : styles.statusDraft),
                          }}
                        >
                          {item.quotation_status || "draft"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
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
    maxWidth: "1250px",
    margin: "0 auto",
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
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 800,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,.72)",
  },
  topActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: "12px",
    color: "white",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    fontWeight: 700,
    fontSize: "14px",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: "12px",
    color: "white",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontWeight: 700,
    fontSize: "14px",
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
  errorBox: {
    marginBottom: "14px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,70,70,.10)",
    border: "1px solid rgba(255,255,255,.10)",
    color: "#ffb4b4",
  },
  tableCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    overflow: "hidden",
    backdropFilter: "blur(10px)",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
  },
  th: {
    textAlign: "left",
    padding: "16px 14px",
    fontSize: "12px",
    color: "rgba(255,255,255,.70)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  td: {
    padding: "16px 14px",
    fontSize: "14px",
    color: "white",
    verticalAlign: "middle",
  },
  refBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(123,47,247,0.18)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
    fontSize: "12px",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "12px",
    textTransform: "capitalize",
    border: "1px solid rgba(255,255,255,.08)",
  },
  statusDraft: {
    background: "rgba(255,255,255,.06)",
    color: "#f4f4f6",
  },
  statusSent: {
    background: "rgba(65,125,255,.15)",
    color: "#b9d3ff",
  },
  statusConfirmed: {
    background: "rgba(0,200,120,.14)",
    color: "#b9ffd9",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "rgba(255,255,255,.72)",
  },
};
