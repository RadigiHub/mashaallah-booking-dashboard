"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import jsPDF from "jspdf";

const BRAND_LOGO_URL =
  "https://mashaallahtrips.com/wp-content/uploads/2026/01/cropped-Mashaallah-6-scaled-1.webp";
const TRUSTPILOT_LOGO_URL =
  "https://mashaallahtrips.com/wp-content/uploads/2026/04/Trustpilot-logo-Mashaallah-trips-.webp";
const IATA_ATOL_LOGO_URL =
  "https://mashaallahtrips.com/wp-content/uploads/2026/04/iata-atol-logo-mashaallah-trips-.webp";
const WHATSAPP_QR_URL =
  "https://mashaallahtrips.com/wp-content/uploads/2026/04/wa.link_b7jw9k.webp";

function safe(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function formatCurrency(v) {
  if (v === null || v === undefined || v === "") return "—";
  const s = String(v).trim();
  return s.startsWith("£") ? s : `£${s}`;
}

function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-GB");
}

function yesNo(v) {
  return v ? "Yes" : "No";
}

function safeFile(v) {
  return String(v || "quotation")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-");
}

function InfoBox({ title, rows }) {
  return (
    <div style={sheetStyles.infoCard}>
      <div style={sheetStyles.infoCardTitle}>{title}</div>
      <div style={sheetStyles.infoCardBody}>
        {rows.map(([label, value]) => (
          <div key={label} style={sheetStyles.infoRow}>
            <div style={sheetStyles.infoLabel}>{label}</div>
            <div style={sheetStyles.infoValue}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function loadHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas;

  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-html2canvas="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    script.setAttribute("data-html2canvas", "true");
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return window.html2canvas;
}

async function urlToDataUrl(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export default function QuotationPdfPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;
  const pageRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [agentName, setAgentName] = useState("Travel Consultant");
  const [errorText, setErrorText] = useState("");

  const [brandLogo, setBrandLogo] = useState(BRAND_LOGO_URL);
  const [trustpilotLogo, setTrustpilotLogo] = useState(TRUSTPILOT_LOGO_URL);
  const [iataLogo, setIataLogo] = useState(IATA_ATOL_LOGO_URL);
  const [qrLogo, setQrLogo] = useState(WHATSAPP_QR_URL);

  useEffect(() => {
    async function loadAssets() {
      const [b, t, i, q] = await Promise.all([
        urlToDataUrl(BRAND_LOGO_URL),
        urlToDataUrl(TRUSTPILOT_LOGO_URL),
        urlToDataUrl(IATA_ATOL_LOGO_URL),
        urlToDataUrl(WHATSAPP_QR_URL),
      ]);
      setBrandLogo(b);
      setTrustpilotLogo(t);
      setIataLogo(i);
      setQrLogo(q);
    }
    loadAssets();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session?.user?.email) {
          router.replace("/agent/login");
          return;
        }

        const userEmail = session.user.email;

        const [quoteRes, agentRes] = await Promise.all([
          supabase.from("quotations").select("*").eq("id", quotationId).maybeSingle(),
          supabase
            .from("agents")
            .select("full_name")
            .ilike("email", userEmail)
            .maybeSingle(),
        ]);

        if (quoteRes.error || !quoteRes.data) {
          setErrorText("Quotation not found.");
          setLoading(false);
          return;
        }

        if (agentRes?.data?.full_name) {
          setAgentName(agentRes.data.full_name);
        }

        setQuote(quoteRes.data);
        setLoading(false);
      } catch (e) {
        setErrorText("Something went wrong while loading quotation.");
        setLoading(false);
      }
    }

    if (quotationId) loadData();
  }, [quotationId, router]);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    if (!pageRef.current) return;

    try {
      setDownloading(true);

      const html2canvas = await loadHtml2Canvas();

      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: pageRef.current.scrollWidth,
        windowHeight: pageRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const canvasRatio = canvas.width / canvas.height;
      const boxRatio = printableWidth / printableHeight;

      let finalWidth;
      let finalHeight;

      if (canvasRatio > boxRatio) {
        finalWidth = printableWidth;
        finalHeight = finalWidth / canvasRatio;
      } else {
        finalHeight = printableHeight;
        finalWidth = finalHeight * canvasRatio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight, "", "FAST");
      pdf.save(`quotation-${safeFile(quote?.booking_reference)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Download PDF failed.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div style={uiStyles.loadingWrap}>
        <div style={uiStyles.loadingCard}>Loading quotation…</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div style={uiStyles.loadingWrap}>
        <div style={uiStyles.loadingCard}>
          <h2 style={{ marginTop: 0 }}>Quotation not found</h2>
          <p>{errorText || "No quotation record found."}</p>
          <Link href="/agent/quotations" style={uiStyles.darkBtn}>
            ← Back to Quotations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{printStyles}</style>

      <div className="pdf-screen-bg" style={uiStyles.screenBg}>
        <div className="no-print" style={uiStyles.toolbar}>
          <div style={uiStyles.toolbarLeft}>
            <Link href={`/agent/quotations/${quotationId}`} style={uiStyles.darkBtn}>
              ← Back to Detail
            </Link>
            <Link href="/agent/quotations" style={uiStyles.darkBtn}>
              Saved Quotations
            </Link>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={handlePrint} style={uiStyles.darkBtnBtn}>
              Preview / Print
            </button>
            <button onClick={handleDownloadPdf} style={uiStyles.primaryBtn}>
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div ref={pageRef} className="pdf-sheet" style={sheetStyles.sheet}>
          <div style={sheetStyles.header}>
            <div style={sheetStyles.headerTop}>
              <img
                src={brandLogo}
                alt="MashaAllah Trips"
                style={sheetStyles.brandLogo}
              />

              <div style={sheetStyles.headerRight}>
                <div style={sheetStyles.refBox}>
                  <div style={sheetStyles.refLabel}>Quotation Ref</div>
                  <div style={sheetStyles.refValue}>{safe(quote.booking_reference)}</div>
                </div>
              </div>
            </div>

            <div style={sheetStyles.trustRowTop}>
              <img
                src={trustpilotLogo}
                alt="Trustpilot"
                style={sheetStyles.trustpilotTop}
              />
              <img
                src={iataLogo}
                alt="IATA ATOL"
                style={sheetStyles.iataTop}
              />
            </div>

            <div style={sheetStyles.royalBand}>
              <div style={sheetStyles.proposalTitle}>Umrah Package Proposal</div>
              <div style={sheetStyles.proposalSub}>
                Premium Travel Experience by MashaAllah Trips
              </div>
            </div>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.metaLine}>
              <span>
                <strong>Status:</strong> {safe(quote.quotation_status)}
              </span>
              <span>
                <strong>Date:</strong> {formatDate(quote.created_at)}
              </span>
            </div>

            <p style={sheetStyles.para}><strong>Dear Customer,</strong></p>
            <p style={sheetStyles.para}>
              We are pleased to present your Umrah quotation with carefully selected flights,
              hotel stay, services, and pricing. Please review the proposal below.
            </p>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.sectionHeading}>Client Details</div>
            <div style={sheetStyles.twoColGrid}>
              <InfoBox
                title="Client Information"
                rows={[
                  ["Client Name", safe(quote.client_name)],
                  ["Phone", safe(quote.client_phone)],
                  ["Email", safe(quote.client_email)],
                  ["Departure City", safe(quote.departure_city)],
                ]}
              />
              <InfoBox
                title="Travellers"
                rows={[
                  ["Adults", safe(quote.adults)],
                  ["Children", safe(quote.children)],
                  ["Infants", safe(quote.infants)],
                  ["Travel Date", safe(quote.travel_date)],
                ]}
              />
            </div>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.sectionHeading}>Flights Details</div>
            <table style={sheetStyles.table}>
              <thead>
                <tr>
                  <th style={sheetStyles.th}>Date</th>
                  <th style={sheetStyles.th}>Flight</th>
                  <th style={sheetStyles.th}>Carrier</th>
                  <th style={sheetStyles.th}>Departs</th>
                  <th style={sheetStyles.th}>Arrives</th>
                  <th style={sheetStyles.th}>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={sheetStyles.td}>{safe(quote.travel_date)}</td>
                  <td style={sheetStyles.td}>—</td>
                  <td style={sheetStyles.td}>{safe(quote.airline)}</td>
                  <td style={sheetStyles.td}>{safe(quote.outbound_sector)}</td>
                  <td style={sheetStyles.td}>{safe(quote.return_sector)}</td>
                  <td style={sheetStyles.td}>—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.sectionHeading}>Hotel Details</div>

            <table style={{ ...sheetStyles.table, marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={sheetStyles.th}>Makkah Hotel</th>
                  <th style={sheetStyles.th}>Room Type</th>
                  <th style={sheetStyles.th}>Distance</th>
                  <th style={sheetStyles.th}>No. Of Nights</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={sheetStyles.td}>{safe(quote.makkah_hotel_name)}</td>
                  <td style={sheetStyles.td}>{safe(quote.makkah_room_type)}</td>
                  <td style={sheetStyles.td}>{safe(quote.makkah_distance)}</td>
                  <td style={sheetStyles.td}>{safe(quote.makkah_nights)}</td>
                </tr>
              </tbody>
            </table>

            <table style={sheetStyles.table}>
              <thead>
                <tr>
                  <th style={sheetStyles.th}>Madinah Hotel</th>
                  <th style={sheetStyles.th}>Room Type</th>
                  <th style={sheetStyles.th}>Distance</th>
                  <th style={sheetStyles.th}>No. Of Nights</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={sheetStyles.td}>{safe(quote.madinah_hotel_name)}</td>
                  <td style={sheetStyles.td}>{safe(quote.madinah_room_type)}</td>
                  <td style={sheetStyles.td}>{safe(quote.madinah_distance)}</td>
                  <td style={sheetStyles.td}>{safe(quote.madinah_nights)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.packageInclude}>
              Total Package includes Flights, Hotels and Visa
            </div>

            <div style={sheetStyles.priceHighlight}>
              Total Price: <span style={sheetStyles.priceChip}>{formatCurrency(quote.total_price)}</span> including all.
            </div>

            <div style={sheetStyles.offerText}>
              BOOK NOW & PAY LATER — pay {formatCurrency(quote.deposit_amount)} now and the rest in easy instalments.
            </div>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.whyHeading}>Why you should book with Us:</div>
            <ul style={sheetStyles.bulletList}>
              <li>Every trip is customized to match your preferences, budget, and travel style.</li>
              <li>Special rates and insider perks through trusted supplier relationships.</li>
              <li>Support before, during, and after your journey for a smooth Umrah experience.</li>
            </ul>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.bottomGrid}>
              <div style={sheetStyles.consultantCard}>
                <div style={sheetStyles.consultantLabel}>Kind Regards,</div>
                <div style={sheetStyles.consultantName}>{agentName}</div>
                <div style={sheetStyles.consultantRole}>Travel Consultant</div>
              </div>

              <div style={sheetStyles.qrCard}>
                <div style={sheetStyles.qrTitle}>Scan to Contact on WhatsApp</div>
                <img
                  src={qrLogo}
                  alt="WhatsApp QR"
                  style={sheetStyles.qrImg}
                />
                <div style={sheetStyles.qrCaption}>Quick direct contact with MashaAllah Trips</div>
              </div>
            </div>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.sectionHeading}>Notes</div>
            <div style={sheetStyles.notesBox}>{safe(quote.notes)}</div>
          </div>

          <div style={sheetStyles.section}>
            <div style={sheetStyles.sectionHeading}>Terms & Conditions</div>
            <div style={sheetStyles.termsBox}>
              <ol style={sheetStyles.termList}>
                <li>All quotations are subject to availability at the time of booking confirmation.</li>
                <li>Prices may change until flights, hotels, transport and all services are fully confirmed.</li>
                <li>Deposit payments may be non-refundable or partially refundable depending on supplier terms.</li>
                <li>Visa approval is subject to the rules and final decision of the relevant authorities.</li>
                <li>Flight timings, baggage allowance and routing may change as per airline operational updates.</li>
                <li>Hotel distance, room type and star rating remain subject to final booking confirmation.</li>
                <li>Full balance must be paid before travel as per agreed payment schedule.</li>
                <li>Special requests are not guaranteed unless confirmed in final booking documents.</li>
              </ol>
            </div>
          </div>

          <div style={sheetStyles.footer}>
            <div style={sheetStyles.footerBrand}>MashaAllah Trips</div>
            <div style={sheetStyles.footerText}>
              +44 204 5557 373 • www.mashaallahtrips.com • 13 Station Rd, London SE25 5AH, UK
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const uiStyles = {
  screenBg: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 700px at 15% 20%, rgba(123,47,247,0.18), transparent 55%), radial-gradient(900px 600px at 85% 30%, rgba(241,7,163,0.16), transparent 55%), #070712",
    padding: 28,
    boxSizing: "border-box",
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  toolbar: {
    maxWidth: 780,
    margin: "0 auto 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  toolbarLeft: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  darkBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
  },
  darkBtnBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#7b2ff7,#f107a3)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  loadingWrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0d0f16",
    padding: 24,
  },
  loadingCard: {
    color: "#fff",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 24,
    maxWidth: 540,
  },
};

const sheetStyles = {
  sheet: {
    width: "740px",
    maxWidth: "740px",
    margin: "0 auto",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  header: {
    padding: "18px 20px 0",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },
  brandLogo: {
    width: "auto",
    height: 48,
    objectFit: "contain",
  },
  headerRight: {
    minWidth: 200,
  },
  refBox: {
    border: "1px solid #dbe4ef",
    background: "#f8fbff",
    borderRadius: 12,
    padding: "10px 12px",
  },
  refLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  refValue: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
  },
  trustRowTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 8,
    paddingBottom: 8,
  },
  trustpilotTop: {
    height: 20,
    width: "auto",
    objectFit: "contain",
  },
  iataTop: {
    height: 24,
    width: "auto",
    objectFit: "contain",
  },
  royalBand: {
    textAlign: "center",
    padding: "14px 12px 15px",
    borderTop: "2px solid #0b4772",
    borderBottom: "2px solid #0b4772",
    background: "linear-gradient(90deg,#f7fbff,#fff8fc)",
  },
  proposalTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: "#0b4772",
    marginBottom: 4,
  },
  proposalSub: {
    fontSize: 12,
    color: "#475569",
  },
  section: {
    padding: "14px 20px 0",
  },
  metaLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 12,
    color: "#334155",
    marginBottom: 8,
  },
  para: {
    margin: "0 0 8px",
    color: "#334155",
    lineHeight: 1.45,
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 8,
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 210px",
    gap: 12,
    alignItems: "stretch",
  },
  infoCard: {
    border: "1px solid #dbe4ef",
    borderRadius: 12,
    background: "#ffffff",
    overflow: "hidden",
  },
  infoCardTitle: {
    background: "#0b4772",
    color: "#fff",
    fontWeight: 700,
    padding: "8px 12px",
    fontSize: 12,
  },
  infoCardBody: {
    padding: "6px 12px",
  },
  infoRow: {
    display: "grid",
    gap: 3,
    padding: "6px 0",
    borderBottom: "1px solid #eef2f7",
  },
  infoLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: 600,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #d8e0ea",
    tableLayout: "fixed",
  },
  th: {
    background: "#0b4772",
    color: "#fff",
    fontWeight: 700,
    fontSize: 11,
    padding: "7px 5px",
    border: "1px solid #0b4772",
    textAlign: "center",
  },
  td: {
    border: "1px solid #d8e0ea",
    padding: "7px 5px",
    fontSize: 11,
    color: "#0f172a",
    verticalAlign: "top",
    wordBreak: "break-word",
  },
  packageInclude: {
    fontSize: 14,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 8,
  },
  priceHighlight: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
  },
  priceChip: {
    background: "#fff176",
    padding: "2px 6px",
    fontWeight: 900,
    borderRadius: 4,
  },
  offerText: {
    fontSize: 12,
    fontWeight: 800,
    color: "#dc2626",
    lineHeight: 1.45,
  },
  whyHeading: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0b4772",
    fontStyle: "italic",
    marginBottom: 6,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 18,
    lineHeight: 1.6,
    color: "#111827",
    fontSize: 12,
  },
  consultantCard: {
    border: "1px solid #dbe4ef",
    borderRadius: 12,
    background: "#fcfcfd",
    padding: 12,
  },
  consultantLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111827",
  },
  consultantName: {
    fontSize: 18,
    fontWeight: 900,
    color: "#dc2626",
    marginBottom: 4,
  },
  consultantRole: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
  },
  qrCard: {
    border: "1px solid #dbe4ef",
    borderRadius: 12,
    background: "#ffffff",
    padding: 12,
    textAlign: "center",
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 8,
  },
  qrImg: {
    width: 96,
    height: 96,
    objectFit: "contain",
    display: "block",
    margin: "0 auto 8px",
  },
  qrCaption: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.35,
  },
  notesBox: {
    border: "1px solid #dbe4ef",
    borderRadius: 12,
    background: "#ffffff",
    padding: 12,
    fontSize: 11,
    lineHeight: 1.5,
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  termsBox: {
    border: "1px solid #dbe4ef",
    borderRadius: 12,
    background: "#ffffff",
    padding: 12,
  },
  termList: {
    margin: 0,
    paddingLeft: 18,
    lineHeight: 1.55,
    color: "#111827",
    fontSize: 11,
  },
  footer: {
    marginTop: 16,
    padding: "14px 20px 18px",
    borderTop: "1px solid #dbe4ef",
  },
  footerBrand: {
    fontSize: 14,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 4,
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#475569",
    textAlign: "center",
  },
};

const printStyles = `
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @media print {
    .no-print {
      display: none !important;
    }

    .pdf-screen-bg {
      background: #ffffff !important;
      padding: 0 !important;
    }

    .pdf-sheet {
      box-shadow: none !important;
      border-radius: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
    }
  }
`;
