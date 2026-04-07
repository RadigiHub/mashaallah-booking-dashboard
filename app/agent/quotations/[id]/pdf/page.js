"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function QuotationPdfPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
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

  function safeFile(value) {
    return String(value || "quotation")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");
  }

  async function addLogoToPdf(doc) {
    try {
      const logoUrl =
        "https://mashaallahtrips.com/wp-content/uploads/2026/01/cropped-Mashaallah-6-scaled-1.webp";

      const response = await fetch(logoUrl);
      const blob = await response.blob();

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      doc.addImage(base64, "WEBP", 14, 10, 46, 16);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function handleDownloadPdf() {
    if (!quote) return;

    try {
      setDownloading(true);

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      const logoAdded = await addLogoToPdf(doc);

      // Header
      if (!logoAdded) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(20, 24, 39);
        doc.text("MashaAllah Trips", 14, 18);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text("Professional Umrah Quotation", 14, 30);

      doc.setDrawColor(225, 225, 225);
      doc.roundedRect(140, 10, 56, 22, 3, 3);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Booking Reference", 144, 17);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(20, 24, 39);
      doc.text(safe(quote.booking_reference), 144, 25);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Status: ${safe(quote.quotation_status)}`, 144, 38);
      doc.text(`Date: ${formatDate(quote.created_at)}`, 144, 44);

      // Contact strip
      doc.setFillColor(255, 248, 235);
      doc.rect(0, 50, pageWidth, 14, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text("Phone: +44 204 5557 373", 14, 58);
      doc.text("Website: www.mashaallahtrips.com", 74, 58);
      doc.text("13 Station Rd, London SE25 5AH, UK", 144, 58);

      // Hero
      doc.setFillColor(247, 241, 252);
      doc.rect(0, 64, pageWidth, 20, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 24, 39);
      doc.text("Umrah Travel Proposal", 14, 74);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "Thank you for choosing MashaAllah Trips. Please review the quotation details below.",
        14,
        80
      );

      // Client details
      autoTable(doc, {
        startY: 92,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [20, 24, 39],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [40, 40, 40],
          fontSize: 10,
        },
        head: [["Client Details", "Value"]],
        body: [
          ["Client Name", safe(quote.client_name)],
          ["Client Phone", safe(quote.client_phone)],
          ["Client Email", safe(quote.client_email)],
          ["Departure City", safe(quote.departure_city)],
          ["Adults", safe(quote.adults)],
          ["Children", safe(quote.children)],
          ["Infants", safe(quote.infants)],
        ],
      });

      // Package summary
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [20, 24, 39],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [40, 40, 40],
          fontSize: 10,
        },
        head: [["Package Summary", "Value"]],
        body: [
          ["Package Title", safe(quote.package_title)],
          ["Destination", safe(quote.destination)],
          ["Travel Date", safe(quote.travel_date)],
          ["Umrah Type", safe(quote.umrah_type)],
          ["Makkah Nights", safe(quote.makkah_nights)],
          ["Madinah Nights", safe(quote.madinah_nights)],
          ["Total Nights", safe(quote.total_nights)],
        ],
      });

      // Flight details
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [20, 24, 39],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [40, 40, 40],
          fontSize: 10,
        },
        head: [["Flight Details", "Value"]],
        body: [
          ["Airline", safe(quote.airline)],
          ["Outbound Sector", safe(quote.outbound_sector)],
          ["Return Sector", safe(quote.return_sector)],
          ["Baggage", safe(quote.baggage)],
          ["Flight Notes", safe(quote.flight_notes)],
        ],
      });

      // Hotel details
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [20, 24, 39],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [40, 40, 40],
          fontSize: 10,
        },
        head: [["Hotel Details", "Value"]],
        body: [
          ["Makkah Hotel", safe(quote.makkah_hotel_name)],
          ["Makkah Rating", safe(quote.makkah_hotel_rating)],
          ["Makkah Room Type", safe(quote.makkah_room_type)],
          ["Makkah Distance", safe(quote.makkah_distance)],
          ["Madinah Hotel", safe(quote.madinah_hotel_name)],
          ["Madinah Rating", safe(quote.madinah_hotel_rating)],
          ["Madinah Room Type", safe(quote.madinah_room_type)],
          ["Madinah Distance", safe(quote.madinah_distance)],
        ],
      });

      // Included services
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [20, 24, 39],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [40, 40, 40],
          fontSize: 10,
        },
        head: [["Included Services", "Included"]],
        body: [
          ["Visa Included", yesNo(quote.visa_included)],
          ["Transport Included", yesNo(quote.transport_included)],
          ["Ziyarat Included", yesNo(quote.ziyarat_included)],
          ["Meals Included", yesNo(quote.meals_included)],
        ],
      });

      // Pricing
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [20, 24, 39],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: [40, 40, 40],
          fontSize: 10,
        },
        head: [["Pricing Breakdown", "Amount"]],
        body: [
          ["Hotel Cost", formatCurrency(quote.hotel_cost)],
          ["Flight Cost", formatCurrency(quote.flight_cost)],
          ["Visa Cost", formatCurrency(quote.visa_cost)],
          ["Transport Cost", formatCurrency(quote.transport_cost)],
          ["Ziyarat Cost", formatCurrency(quote.ziyarat_cost)],
          ["Other Cost", formatCurrency(quote.other_cost)],
          ["Agent Profit", formatCurrency(quote.agent_profit)],
          ["Total Selling Price", formatCurrency(quote.total_price)],
          ["Deposit Amount", formatCurrency(quote.deposit_amount)],
          ["Remaining Balance", formatCurrency(quote.remaining_balance)],
        ],
      });

      let y = doc.lastAutoTable.finalY + 10;

      // Total package line
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 24, 39);
      doc.text("Total Package Includes Flights, Hotels & Visa", 14, y);

      y += 8;
      doc.setFillColor(244, 252, 245);
      doc.roundedRect(14, y - 5, 80, 12, 2, 2, "F");
      doc.setTextColor(0, 120, 50);
      doc.setFontSize(13);
      doc.text(`Total Price: ${formatCurrency(quote.total_price)}`, 18, y + 3);

      // BNPL block
      y += 15;
      doc.setFillColor(255, 244, 244);
      doc.roundedRect(14, y - 4, 182, 14, 3, 3, "F");
      doc.setTextColor(180, 20, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(
        "BOOK NOW & PAY LATER - Secure with deposit and pay remaining in easy instalments.",
        18,
        y + 4
      );

      // Why book with us
      y += 22;
      doc.setTextColor(20, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Why You Should Book With Us", 14, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("• Customized Umrah packages based on your needs", 18, y + 8);
      doc.text("• Competitive pricing with trusted travel suppliers", 18, y + 14);
      doc.text("• Ongoing support before and during your journey", 18, y + 20);

      // Notes
      y += 30;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Notes", 14, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(safe(quote.notes), 180);
      doc.text(noteLines, 14, y + 8);

      // New page for terms
      doc.addPage();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(20, 24, 39);
      doc.text("Booking Terms & Conditions", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const terms = [
        "All quotations are subject to availability at the time of booking confirmation.",
        "Prices may change until flights, hotels, transport and all services are fully confirmed.",
        "Deposit payments may be non-refundable or partially refundable depending on supplier terms.",
        "Visa approval is subject to the rules and final decision of the relevant authorities.",
        "Flight timings, baggage allowance and routing may change as per airline operational updates.",
        "Hotel distance, room type and star rating remain subject to final booking confirmation.",
        "Full balance must be paid before travel as per agreed payment schedule.",
        "Special requests are not guaranteed unless confirmed in final booking documents.",
        "By proceeding, the client agrees to MashaAllah Trips booking and cancellation policy."
      ];

      let ty = 32;
      terms.forEach((term) => {
        const lines = doc.splitTextToSize(`• ${term}`, 180);
        doc.text(lines, 14, ty);
        ty += lines.length * 6 + 2;
      });

      // Footer
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 270, 196, 270);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("MashaAllah Trips", 14, 278);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("+44 204 5557 373 • www.mashaallahtrips.com", 14, 284);
      doc.text("13 Station Rd, London SE25 5AH, UK", 14, 289);
      doc.text("IATA & ATOL Accredited", 145, 284);

      const fileName = `quotation-${safeFile(
        quote.booking_reference || quote.client_name || "mashaallah-trips"
      )}.pdf`;

      doc.save(fileName);
    } catch (error) {
      console.error(error);
      alert("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return <div style={styles.loadingWrap}>Loading quotation PDF...</div>;
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
            <Link href={`/agent/quotations/${quotationId}`} style={styles.topBtnDark}>
              ← Back to Detail
            </Link>

            <Link href="/agent/quotations" style={styles.topBtnDark}>
              Saved Quotations
            </Link>
          </div>

          <div style={styles.toolbarRight}>
            <button onClick={handlePrint} style={styles.topBtnDark}>
              Print
            </button>

            <button onClick={handleDownloadPdf} style={styles.topBtnPrimary}>
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="pdf-paper" style={styles.paper}>
          <header style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.brandText}>MashaAllah Trips</div>
              <div style={styles.brandSub}>Professional Umrah Quotation</div>

              <div style={styles.accreditationRow}>
                <span style={styles.badgeGold}>IATA Accredited</span>
                <span style={styles.badgeGold}>ATOL Accredited</span>
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

          <section style={styles.contactStrip}>
            <div><b>Phone:</b> +44 204 5557 373</div>
            <div><b>Website:</b> www.mashaallahtrips.com</div>
            <div><b>Address:</b> 13 Station Rd, London SE25 5AH, UK</div>
          </section>

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
                  ["Client Name", safe(quote.client_name)],
                  ["Client Phone", safe(quote.client_phone)],
                  ["Client Email", safe(quote.client_email)],
                  ["Departure City", safe(quote.departure_city)],
                ]}
              />
              <InfoCard
                title="Travellers"
                items={[
                  ["Adults", safe(quote.adults)],
                  ["Children", safe(quote.children)],
                  ["Infants", safe(quote.infants)],
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
                  ["Package Title", safe(quote.package_title)],
                  ["Destination", safe(quote.destination)],
                  ["Travel Date", safe(quote.travel_date)],
                  ["Umrah Type", safe(quote.umrah_type)],
                  ["Status", safe(quote.quotation_status)],
                ]}
              />
              <InfoCard
                title="Stay"
                items={[
                  ["Makkah Nights", safe(quote.makkah_nights)],
                  ["Madinah Nights", safe(quote.madinah_nights)],
                  ["Total Nights", safe(quote.total_nights)],
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
                  ["Hotel Name", safe(quote.makkah_hotel_name)],
                  ["Rating", safe(quote.makkah_hotel_rating)],
                  ["Room Type", safe(quote.makkah_room_type)],
                  ["Distance", safe(quote.makkah_distance)],
                ]}
              />
              <InfoCard
                title="Madinah Hotel"
                items={[
                  ["Hotel Name", safe(quote.madinah_hotel_name)],
                  ["Rating", safe(quote.madinah_hotel_rating)],
                  ["Room Type", safe(quote.madinah_room_type)],
                  ["Distance", safe(quote.madinah_distance)],
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
                  ["Airline", safe(quote.airline)],
                  ["Outbound Sector", safe(quote.outbound_sector)],
                  ["Return Sector", safe(quote.return_sector)],
                  ["Baggage", safe(quote.baggage)],
                ]}
              />
              <InfoCard
                title="Flight Notes"
                items={[
                  ["Notes", safe(quote.flight_notes)],
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
                <PriceRow label="Total Selling Price" value={quote.total_price} strong />
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
                <li>All quotations are subject to availability at the time of booking confirmation.</li>
                <li>Prices may change until flights, hotels, transport and all services are fully confirmed.</li>
                <li>Deposit payments may be non-refundable or partially refundable depending on supplier terms.</li>
                <li>Visa approval is subject to the rules and final decision of the relevant authorities.</li>
                <li>Flight timings, baggage allowance and routing may change as per airline operational updates.</li>
                <li>Hotel distance, room type and star rating remain subject to final booking confirmation.</li>
                <li>Full balance must be paid before travel as per agreed payment schedule.</li>
                <li>Special requests are not guaranteed unless confirmed in final booking documents.</li>
                <li>By proceeding, the client agrees to MashaAllah Trips booking and cancellation policy.</li>
              </ol>
            </div>
          </section>

          <footer style={styles.footer}>
            <div style={styles.footerBrand}>MashaAllah Trips</div>
            <div style={styles.footerLine}>
              +44 204 5557 373 • www.mashaallahtrips.com • 13 Station Rd, London SE25 5AH, UK
            </div>
            <div style={styles.footerMini}>
              IATA & ATOL Accredited • Premium Umrah Travel Services
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
            <div style={styles.infoValue}>{value}</div>
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

const styles = {
  outer: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 700px at 15% 20%, rgba(123,47,247,0.20), transparent 55%), radial-gradient(900px 600px at 85% 30%, rgba(241,7,163,0.18), transparent 55%), #070712",
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
  toolbarRight: {
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
  headerLeft: {
    display: "grid",
    gap: "8px",
  },
  brandText: {
    fontSize: "30px",
    fontWeight: 900,
    color: "#111827",
  },
  brandSub: {
    color: "#6b7280",
    fontSize: "14px",
  },
  accreditationRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  badgeGold: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#fff7e6",
    color: "#8a5b00",
    border: "1px solid #f2d189",
    fontWeight: 700,
    fontSize: "12px",
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
  contactStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
    padding: "14px 32px",
    background: "#fffaf1",
    borderBottom: "1px solid #efe2c4",
    fontSize: "13px",
    color: "#4b5563",
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
    background: "#fcfcfd",
  },
  footerBrand: {
    fontWeight: 900,
    fontSize: "18px",
    marginBottom: "6px",
  },
  footerLine: {
    color: "#374151",
    fontSize: "13px",
    marginBottom: "4px",
  },
  footerMini: {
    color: "#6b7280",
    fontSize: "12px",
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
    margin: 12mm;
  }

  @media print {
    html, body {
      background: #ffffff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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
`;
