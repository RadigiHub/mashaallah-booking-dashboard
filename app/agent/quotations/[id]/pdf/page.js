"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function QuotationPdfPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadQuotation() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .maybeSingle();

      if (error || !data) {
        setMsg("Quotation not found.");
        setLoading(false);
        return;
      }

      setQuote(data);
      setLoading(false);
    }

    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId, router]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        Loading quotation PDF...
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.notFoundCard}>
          <h2 style={{ marginTop: 0 }}>Quotation not found</h2>
          <p>{msg || "No record found."}</p>
          <Link href="/agent/quotations" style={styles.topBtnDark}>
            ← Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{printStyles}</style>

      <div className="pdf-page-shell" style={styles.outer}>
        <div className="no-print" style={styles.toolbar}>
          <div style={styles.toolbarLeft}>
            <Link
              href={`/agent/quotations/${quotationId}`}
              style={styles.topBtnDark}
            >
              ← Back to Detail
            </Link>

            <Link
              href="/agent/quotations"
              style={styles.topBtnDark}
            >
              Saved Quotations
            </Link>
          </div>

          <button onClick={handlePrint} style={styles.topBtnPrimary}>
            Print / Save PDF
          </button>
        </div>

        <div className="pdf-paper" style={styles.paper}>
          <header style={styles.header}>
            <div>
              <div style={styles.brandRow}>
                <div style={styles.logo}>M</div>
                <div>
                  <div style={styles.brandTitle}>MashaAllah Trips</div>
                  <div style={styles.brandSub}>Professional Umrah Quotation</div>
                </div>
              </div>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.refBox}>
                <div style={styles.refLabel}>Booking Reference</div>
                <div style={styles.refValue}>{safe(quote.booking_reference)}</div>
              </div>
              <div style={styles.headerMeta}>
                <div><b>Status:</b> {safe(quote.quotation_status)}</div>
                <div><b>Date:</b> {formatDate(quote.created_at)}</div>
              </div>
            </div>
          </header>

          <section style={styles.heroStrip}>
            <div style={styles.heroLeft}>
              <div style={styles.heroTitle}>Umrah Travel Proposal</div>
              <div style={styles.heroText}>
                Thank you for choosing MashaAllah Trips. Please review the quotation details below.
              </div>
            </div>
            <div style={styles.heroBadge}>Client Copy</div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Client Details</div>
            <div style={styles.grid2}>
              <InfoCard
                title="Client Information"
                items={[
                  ["Client Name", quote.client_name],
                  ["Client Phone", quote.client_phone],
                  ["Client Email", quote.client_email],
                  ["Departure City", quote.departure_city],
                ]}
              />
              <InfoCard
                title="Travellers"
                items={[
                  ["Adults", quote.adults],
                  ["Children", quote.children],
                  ["Infants", quote.infants],
                ]}
              />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Package Summary</div>
            <div style={styles.grid3}>
              <InfoCard
                title="Package Basics"
                items={[
                  ["Package Title", quote.package_title],
                  ["Destination", quote.destination],
                  ["Travel Date", quote.travel_date],
                  ["Umrah Type", quote.umrah_type],
                  ["Status", quote.quotation_status],
                ]}
              />
              <InfoCard
                title="Stay"
                items={[
                  ["Makkah Nights", quote.makkah_nights],
                  ["Madinah Nights", quote.madinah_nights],
                  ["Total Nights", quote.total_nights],
                ]}
              />
              <InfoCard
                title="Included Services"
                items={[
                  ["Visa Included", yesNo(quote.visa_included)],
                  ["Transport Included", yesNo(quote.transport_included)],
                  ["Ziyarat Included", yesNo(quote.ziyarat_included)],
                  ["Meals Included", yesNo(quote.meals_included)],
                ]}
              />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Hotel Details</div>
            <div style={styles.grid2}>
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
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Flight Details</div>
            <div style={styles.grid2}>
              <InfoCard
                title="Travel Sectors"
                items={[
                  ["Airline", quote.airline],
                  ["Outbound Sector", quote.outbound_sector],
                  ["Return Sector", quote.return_sector],
                  ["Baggage", quote.baggage],
                ]}
              />
              <InfoCard
                title="Flight Notes"
                items={[
                  ["Notes", quote.flight_notes],
                ]}
              />
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Pricing Breakdown</div>
            <div style={styles.priceWrap}>
              <div style={styles.priceTable}>
                <PriceRow label="Hotel Cost" value={quote.hotel_cost} />
                <PriceRow label="Flight Cost" value={quote.flight_cost} />
                <PriceRow label="Visa Cost" value={quote.visa_cost} />
                <PriceRow label="Transport Cost" value={quote.transport_cost} />
                <PriceRow label="Ziyarat Cost" value={quote.ziyarat_cost} />
                <PriceRow label="Other Cost" value={quote.other_cost} />
                <PriceRow label="Agent Profit" value={quote.agent_profit} />
                <div style={styles.priceDivider}></div>
                <PriceRow
                  label="Total Selling Price"
                  value={quote.total_price}
                  strong
                />
              </div>

              <div style={styles.paymentCard}>
                <div style={styles.paymentTitle}>Payment Summary</div>
                <div style={styles.paymentRow}>
                  <span>Deposit Amount</span>
                  <b>{formatCurrency(quote.deposit_amount)}</b>
                </div>
                <div style={styles.paymentRow}>
                  <span>Remaining Balance</span>
                  <b>{formatCurrency(quote.remaining_balance)}</b>
                </div>
                <div style={styles.paymentPlan}>
                  <div style={styles.paymentPlanLabel}>Payment Plan</div>
                  <div>{safe(quote.payment_plan)}</div>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Notes</div>
            <div style={styles.notesBox}>{safe(quote.notes)}</div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Terms & Conditions</div>
            <div style={styles.tcBox}>
              <ol style={styles.tcList}>
                <li>
                  All quotations are subject to availability at the time of booking confirmation.
                </li>
                <li>
                  Prices may change until flights, hotels, transport and other services are fully confirmed.
                </li>
                <li>
                  Deposit payments may be non-refundable or partially refundable depending on airline, hotel and supplier policies.
                </li>
                <li>
                  Visa approval is subject to the rules and decisions of the relevant authorities.
                </li>
                <li>
                  Flight schedules, baggage allowance and routing may change as per airline operational updates.
                </li>
                <li>
                  Full balance must be cleared before travel according to the agreed payment terms.
                </li>
                <li>
                  Hotel distance, rating and room types are subject to final supplier confirmation.
                </li>
                <li>
                  Any special request does not guarantee confirmation unless explicitly stated in final booking documents.
                </li>
                <li>
                  By proceeding with the booking, the client agrees to the agency’s booking and cancellation terms.
                </li>
              </ol>
            </div>
          </section>

          <footer style={styles.footer}>
            <div style={styles.footerBrand}>MashaAllah Trips</div>
            <div style={styles.footerText}>
              This quotation is generated for internal sales and client proposal use.
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

function InfoCard({ title, items }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.infoCardTitle}>{title}</div>
      <div style={styles.infoCardBody}>
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

function PriceRow({ label, value, strong = false }) {
  return (
    <div
      style={{
        ...styles.priceRow,
        fontWeight: strong ? 800 : 500,
        fontSize: strong ? "17px" : "14px",
      }}
    >
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
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

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString();
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const stringValue = String(value).trim();
  if (stringValue.startsWith("£")) return stringValue;
  return `£${stringValue}`;
}

const styles = {
  outer: {
    minHeight: "100vh",
    background: "#0d0f16",
    padding: "28px",
    boxSizing: "border-box",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  toolbar: {
    maxWidth: "1100px",
    margin: "0 auto 18px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  toolbarLeft: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  topBtnPrimary: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  topBtnDark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
  },
  paper: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "28px 32px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  brandRow: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
  },
  logo: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "linear-gradient(135deg,#7b2ff7,#f107a3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: 900,
    fontSize: "24px",
  },
  brandTitle: {
    fontSize: "28px",
    fontWeight: 900,
    lineHeight: 1.1,
  },
  brandSub: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "4px",
  },
  headerRight: {
    display: "grid",
    gap: "12px",
    minWidth: "260px",
  },
  refBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px 16px",
    background: "#fafafa",
  },
  refLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
  },
  refValue: {
    fontSize: "18px",
    fontWeight: 800,
  },
  headerMeta: {
    fontSize: "14px",
    color: "#374151",
    display: "grid",
    gap: "4px",
  },
  heroStrip: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "22px 32px",
    background: "linear-gradient(90deg,#f5f3ff,#fff1f8)",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap",
  },
  heroLeft: {
    display: "grid",
    gap: "6px",
  },
  heroTitle: {
    fontSize: "24px",
    fontWeight: 900,
  },
  heroText: {
    color: "#4b5563",
    fontSize: "14px",
  },
  heroBadge: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    fontWeight: 700,
    color: "#7b2ff7",
  },
  section: {
    padding: "26px 32px 0",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "14px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  infoCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#ffffff",
    overflow: "hidden",
  },
  infoCardTitle: {
    padding: "14px 16px",
    fontWeight: 800,
    borderBottom: "1px solid #e5e7eb",
    background: "#fafafa",
  },
  infoCardBody: {
    padding: "10px 16px",
  },
  infoRow: {
    display: "grid",
    gap: "4px",
    padding: "10px 0",
    borderBottom: "1px solid #f0f2f5",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: 600,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  priceWrap: {
    display: "grid",
    gridTemplateColumns: "1.3fr 0.8fr",
    gap: "14px",
  },
  priceTable: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
    background: "#fff",
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    padding: "10px 0",
    borderBottom: "1px solid #f0f2f5",
  },
  priceDivider: {
    height: "1px",
    background: "#d1d5db",
    margin: "12px 0",
  },
  paymentCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "18px",
    background: "#fafafa",
  },
  paymentTitle: {
    fontSize: "17px",
    fontWeight: 800,
    marginBottom: "14px",
  },
  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    padding: "10px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  paymentPlan: {
    marginTop: "14px",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  paymentPlanLabel: {
    fontWeight: 700,
    marginBottom: "4px",
  },
  notesBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#fff",
    padding: "16px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  tcBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#fff",
    padding: "18px",
  },
  tcList: {
    margin: 0,
    paddingLeft: "20px",
    lineHeight: 1.8,
    fontSize: "14px",
    color: "#374151",
  },
  footer: {
    marginTop: "28px",
    padding: "26px 32px 32px",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
  },
  footerBrand: {
    fontWeight: 900,
    fontSize: "18px",
    marginBottom: "6px",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "13px",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0d0f16",
    color: "white",
    padding: "24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  notFoundCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "520px",
  },
};

const printStyles = `
  @page {
    size: A4;
    margin: 14mm;
  }

  @media print {
    html, body {
      background: #ffffff !important;
    }

    .no-print {
      display: none !important;
    }

    .pdf-page-shell {
      padding: 0 !important;
      background: #ffffff !important;
    }

    .pdf-paper {
      box-shadow: none !important;
      border-radius: 0 !important;
      max-width: 100% !important;
      width: 100% !important;
      overflow: visible !important;
    }

    a {
      text-decoration: none !important;
      color: inherit !important;
    }
  }

  @media (max-width: 900px) {
    .pdf-paper {
      border-radius: 16px !important;
    }
  }
`;
