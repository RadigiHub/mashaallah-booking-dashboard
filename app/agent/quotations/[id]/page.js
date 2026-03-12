"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params?.id;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [agentName, setAgentName] = useState("Agent");
  const [msg, setMsg] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      const userEmail = session.user.email;

      const { data: agentRow } = await supabase
        .from("agents")
        .select("full_name, role, is_active, email")
        .ilike("email", userEmail)
        .maybeSingle();

      if (!agentRow || agentRow.is_active === false) {
        await supabase.auth.signOut();
        router.replace("/agent/login");
        return;
      }

      setAgentName(agentRow.full_name || "Agent");
      setChecking(false);

      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .maybeSingle();

      if (error || !data || data.is_archived === true) {
        setMsg("Quotation not found.");
        setLoading(false);
        return;
      }

      setQuote(data);
      setLoading(false);
    }

    if (quotationId) {
      loadPage();
    }
  }, [quotationId, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/agent/login");
  }

  async function handleCopyWhatsapp() {
    if (!quote) return;

    const text = `
*MashaAllah Trips - Umrah Quotation*

*Booking Ref:* ${safe(quote.booking_reference)}
*Client:* ${safe(quote.client_name)}
*Phone:* ${safe(quote.client_phone)}
*Email:* ${safe(quote.client_email)}

*Package:* ${safe(quote.package_title)}
*Destination:* ${safe(quote.destination)}
*Travel Date:* ${safe(quote.travel_date)}
*Umrah Type:* ${safe(quote.umrah_type)}

*Makkah Nights:* ${safe(quote.makkah_nights)}
*Madinah Nights:* ${safe(quote.madinah_nights)}
*Total Nights:* ${safe(quote.total_nights)}

*Makkah Hotel:* ${safe(quote.makkah_hotel_name)} ${safe(quote.makkah_hotel_rating)}
*Makkah Room:* ${safe(quote.makkah_room_type)}
*Makkah Distance:* ${safe(quote.makkah_distance)}

*Madinah Hotel:* ${safe(quote.madinah_hotel_name)} ${safe(quote.madinah_hotel_rating)}
*Madinah Room:* ${safe(quote.madinah_room_type)}
*Madinah Distance:* ${safe(quote.madinah_distance)}

*Airline:* ${safe(quote.airline)}
*Outbound:* ${safe(quote.outbound_sector)}
*Return:* ${safe(quote.return_sector)}
*Baggage:* ${safe(quote.baggage)}

*Visa Included:* ${yesNo(quote.visa_included)}
*Transport Included:* ${yesNo(quote.transport_included)}
*Ziyarat Included:* ${yesNo(quote.ziyarat_included)}
*Meals Included:* ${yesNo(quote.meals_included)}

*Total Price:* ${safe(quote.total_price)}
*Deposit:* ${safe(quote.deposit_amount)}
*Remaining Balance:* ${safe(quote.remaining_balance)}
*Payment Plan:* ${safe(quote.payment_plan)}

*Status:* ${safe(quote.quotation_status)}

*Notes:* ${safe(quote.notes)}
`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setMsg("WhatsApp summary copied.");
      setTimeout(() => setMsg(""), 2500);
    } catch {
      setMsg("Copy failed.");
      setTimeout(() => setMsg(""), 2500);
    }
  }

  async function handleArchive() {
    const ok = window.confirm("Archive this quotation?");
    if (!ok) return;

    setArchiving(true);
    setMsg("");

    const { error } = await supabase
      .from("quotations")
      .update({ is_archived: true })
      .eq("id", quotationId);

    if (error) {
      setMsg("Failed to archive quotation.");
      setArchiving(false);
      return;
    }

    router.push("/agent/quotations");
  }

  async function handleStatusChange(newStatus) {
    setStatusSaving(true);
    setMsg("");

    const { error } = await supabase
      .from("quotations")
      .update({ quotation_status: newStatus })
      .eq("id", quotationId);

    if (error) {
      setMsg("Failed to update status.");
      setStatusSaving(false);
      return;
    }

    setQuote((prev) => ({ ...prev, quotation_status: newStatus }));
    setMsg(`Quotation status updated to ${newStatus}.`);
    setStatusSaving(false);
  }

  if (checking || loading) {
    return <div style={styles.loadingWrap}>Loading quotation...</div>;
  }

  if (!quote) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.notFoundCard}>
          <h2 style={{ marginTop: 0 }}>Quotation not found</h2>
          <Link href="/agent/quotations" style={styles.linkBtn}>
            ← Back to Saved Quotations
          </Link>
        </div>
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
            <Link
              href="/agent/quotations"
              style={{ ...styles.navItem, ...styles.navItemActive }}
            >
              Quotations
            </Link>
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
              <div style={styles.h1}>Quotation Detail</div>
              <div style={styles.muted}>
                Booking Ref: <b>{safe(quote.booking_reference)}</b>
              </div>
            </div>

            <div style={styles.topButtons}>
              <button style={styles.primaryBtn} onClick={handleCopyWhatsapp}>
                Copy WhatsApp Summary
              </button>

              <Link
                href={`/agent/quotations/${quotationId}/edit`}
                style={styles.secondaryBtn}
              >
                Edit Quotation
              </Link>

              <button
                type="button"
                style={styles.archiveBtn}
                onClick={handleArchive}
                disabled={archiving}
              >
                {archiving ? "Archiving..." : "Archive"}
              </button>

              <Link href="/agent/quotations" style={styles.secondaryBtn}>
                ← Back to Saved Quotations
              </Link>
            </div>
          </div>

          {msg ? <div style={styles.alert}>{msg}</div> : null}

          <div style={styles.statusBar}>
            <div>
              Current Status:{" "}
              <span style={statusBadgeStyle(quote.quotation_status)}>
                {safe(quote.quotation_status)}
              </span>
            </div>

            <div style={styles.statusControls}>
              <div style={styles.selectWrap}>
                <select
                  value={quote.quotation_status || "draft"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={styles.select}
                  disabled={statusSaving}
                >
                  <option style={styles.option} value="draft">
                    Draft
                  </option>
                  <option style={styles.option} value="sent">
                    Sent
                  </option>
                  <option style={styles.option} value="confirmed">
                    Confirmed
                  </option>
                </select>
              </div>
            </div>
          </div>

          <section style={styles.grid3}>
            <InfoCard
              title="Client"
              items={[
                ["Name", quote.client_name],
                ["Phone", quote.client_phone],
                ["Email", quote.client_email],
                ["Departure City", quote.departure_city],
                ["Adults", quote.adults],
                ["Children", quote.children],
                ["Infants", quote.infants],
              ]}
            />

            <InfoCard
              title="Package Basics"
              items={[
                ["Package Title", quote.package_title],
                ["Destination", quote.destination],
                ["Travel Date", quote.travel_date],
                ["Umrah Type", quote.umrah_type],
                ["Makkah Nights", quote.makkah_nights],
                ["Madinah Nights", quote.madinah_nights],
                ["Total Nights", quote.total_nights],
                ["Status", quote.quotation_status],
              ]}
            />

            <InfoCard
              title="Included"
              items={[
                ["Visa Included", yesNo(quote.visa_included)],
                ["Transport Included", yesNo(quote.transport_included)],
                ["Ziyarat Included", yesNo(quote.ziyarat_included)],
                ["Meals Included", yesNo(quote.meals_included)],
              ]}
            />
          </section>

          <section style={styles.grid2}>
            <InfoCard
              title="Makkah Hotel"
              items={[
                ["Hotel Name", quote.makkah_hotel_name],
                ["Rating", quote.makkah_hotel_rating],
                ["Room Type", quote.makkah_room_type],
                ["Distance", quote.makkah_distance],
              ]}
            />

            <InfoCard
              title="Madinah Hotel"
              items={[
                ["Hotel Name", quote.madinah_hotel_name],
                ["Rating", quote.madinah_hotel_rating],
                ["Room Type", quote.madinah_room_type],
                ["Distance", quote.madinah_distance],
              ]}
            />
          </section>

          <section style={styles.grid2}>
            <InfoCard
              title="Flight Details"
              items={[
                ["Airline", quote.airline],
                ["Outbound Sector", quote.outbound_sector],
                ["Return Sector", quote.return_sector],
                ["Baggage", quote.baggage],
              ]}
            />

            <InfoCard
              title="Pricing"
              items={[
                ["Hotel Cost", quote.hotel_cost],
                ["Flight Cost", quote.flight_cost],
                ["Visa Cost", quote.visa_cost],
                ["Transport Cost", quote.transport_cost],
                ["Ziyarat Cost", quote.ziyarat_cost],
                ["Other Cost", quote.other_cost],
                ["Agent Profit", quote.agent_profit],
                ["Total Selling Price", quote.total_price],
              ]}
            />
          </section>

          <section style={styles.grid2}>
            <InfoCard
              title="Payment"
              items={[
                ["Deposit Amount", quote.deposit_amount],
                ["Remaining Balance", quote.remaining_balance],
                ["Payment Plan", quote.payment_plan],
              ]}
            />

            <InfoCard
              title="System Info"
              items={[
                ["Created By", quote.created_by],
                ["Created At", formatDateTime(quote.created_at)],
                ["Booking Ref", quote.booking_reference],
              ]}
            />
          </section>

          <section style={styles.fullCard}>
            <div style={styles.sectionTitle}>Flight Notes</div>
            <div style={styles.longText}>{safe(quote.flight_notes)}</div>
          </section>

          <section style={styles.fullCard}>
            <div style={styles.sectionTitle}>Notes</div>
            <div style={styles.longText}>{safe(quote.notes)}</div>
          </section>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardBody}>
        {items.map(([label, value]) => (
          <div key={label} style={styles.infoRow}>
            <div style={styles.infoLabel}>{label}</div>
            <div style={styles.infoValue}>{safe(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function safe(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
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
    minWidth: "88px",
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
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    color: "white",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    fontWeight: 700,
    fontSize: "13px",
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
  archiveBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,120,120,0.20)",
    color: "#ffd2d2",
    background: "rgba(255,80,80,0.12)",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
  alert: {
    marginBottom: 16,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(0,200,120,.10)",
    color: "#b9ffd9",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  statusControls: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  selectWrap: {
    width: "180px",
  },
  select: {
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: "rgba(255,255,255,.06)",
    color: "#e9e9f2",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 12,
    padding: "10px 12px",
    outline: "none",
    fontSize: 13,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  option: {
    backgroundColor: "#141421",
    color: "#e9e9f2",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "12px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginBottom: "12px",
  },
  card: {
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "14px",
  },
  fullCard: {
    background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "12px",
  },
  cardTitle: {
    fontWeight: 800,
    fontSize: "15px",
    marginBottom: "12px",
  },
  cardBody: {
    display: "grid",
    gap: "10px",
  },
  infoRow: {
    display: "grid",
    gap: "4px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    paddingBottom: "8px",
  },
  infoLabel: {
    fontSize: "12px",
    opacity: 0.7,
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  sectionTitle: {
    fontWeight: 800,
    fontSize: "15px",
    marginBottom: "10px",
  },
  longText: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
    fontSize: "14px",
    opacity: 0.92,
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
  notFoundCard: {
    padding: "24px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
  },
  linkBtn: {
    display: "inline-flex",
    marginTop: "10px",
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
  },
};
