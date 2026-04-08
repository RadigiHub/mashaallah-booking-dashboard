"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import jsPDF from "jspdf";
import QRCode from "qrcode";

function safe(value) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  const stringValue = String(value).trim();
  if (stringValue.startsWith("£")) return stringValue;
  return `£${stringValue}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB");
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function safeFile(value) {
  return String(value || "quotation")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-");
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

export default function QuotationPdfPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [msg, setMsg] = useState("");
  const [agentName, setAgentName] = useState("Travel Consultant");

  useEffect(() => {
    async function loadQuotation() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      const userEmail = session.user.email;

      const [quotationResult, agentResult] = await Promise.all([
        supabase.from("quotations").select("*").eq("id", quotationId).maybeSingle(),
        supabase
          .from("agents")
          .select("full_name")
          .ilike("email", userEmail)
          .maybeSingle(),
      ]);

      if (quotationResult.error || !quotationResult.data) {
        setMsg("Quotation not found.");
        setLoading(false);
        return;
      }

      if (agentResult?.data?.full_name) {
        setAgentName(agentResult.data.full_name);
      }

      setQuote(quotationResult.data);
      setLoading(false);
    }

    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId, router]);

  async function blobToBase64(blob) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function addImageFromUrl(doc, url, format, x, y, w, h) {
    const res = await fetch(url);
    const blob = await res.blob();
    const base64 = await blobToBase64(blob);
    doc.addImage(base64, format, x, y, w, h);
  }

  async function addPdfAssets(doc) {
    try {
      const mainLogoUrl =
        "https://mashaallahtrips.com/wp-content/uploads/2026/01/cropped-Mashaallah-6-scaled-1.webp";

      const trustLogoUrl =
        "https://mashaallahtrips.com/wp-content/uploads/2026/01/Iata-Atol-confidence-1-3.png";

      await addImageFromUrl(doc, mainLogoUrl, "WEBP", 14, 8, 48, 16);
      await addImageFromUrl(doc, trustLogoUrl, "PNG", 134, 8, 62, 18);
      return true;
    } catch (error) {
      return false;
    }
  }

  function drawWrappedText(doc, text, x, y, maxWidth, opts = {}) {
    const {
      size = 10,
      style = "normal",
      color = [0, 0, 0],
      lineHeight = 5,
    } = opts;

    doc.setFont("times", style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(String(text), maxWidth);
    doc.text(lines, x, y);

    return y + lines.length * lineHeight;
  }

  function drawSectionHeading(doc, text, y) {
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(text, 14, y);

    const width = doc.getTextWidth(text);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, y + 1, 14 + width, y + 1);

    return y + 8;
  }

  function buildFlightRowsFromQuote() {
    if (!quote) return [];
    return [
      [
        safe(quote.travel_date),
        "—",
        safe(quote.airline),
        safe(quote.outbound_sector),
        safe(quote.return_sector),
        "—",
        "—",
      ],
    ];
  }

  function drawFlightTable(doc, startY) {
    const headers = ["Date", "Flight", "Carrier", "Departs", "Arrives", "Duration", "Layover"];
    const rows = buildFlightRowsFromQuote();

    const startX = 14;
    const colWidths = [19, 16, 20, 54, 54, 18, 15];
    const headerH = 7;
    const rowH = 12;

    let x = startX;
    doc.setDrawColor(215, 215, 215);
    doc.setFillColor(255, 255, 255);

    headers.forEach((header, i) => {
      doc.rect(x, startY, colWidths[i], headerH, "FD");
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(header, x + 2, startY + 4.8);
      x += colWidths[i];
    });

    let y = startY + headerH;

    rows.forEach((row) => {
      let rowX = startX;

      row.forEach((cell, i) => {
        doc.rect(rowX, y, colWidths[i], rowH);

        doc.setFont("times", i === 0 ? "bold" : "normal");
        doc.setFontSize(9.3);
        doc.setTextColor(35, 35, 35);

        const lines = doc.splitTextToSize(String(cell), colWidths[i] - 4);
        doc.text(lines, rowX + 2, y + 4.6);

        rowX += colWidths[i];
      });

      y += rowH;
    });

    doc.setDrawColor(0, 0, 0);
    doc.line(14, y + 1, 196, y + 1);

    return y + 8;
  }

  function drawHotelBox(doc, title, hotelName, roomType, dateText, nightsText, startY) {
    const startX = 24;
    const colWidths = [35, 35, 36, 24];
    const headerH = 7;
    const bodyH = 24;

    const headers = [title, "Room Type", "Date", "No. Of Nights"];
    const body = [hotelName, roomType, dateText, nightsText];

    let x = startX;
    headers.forEach((header, i) => {
      doc.setFillColor(47, 117, 181);
      doc.setDrawColor(0, 0, 0);
      doc.rect(x, startY, colWidths[i], headerH, "FD");
      doc.setFont("times", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(header, x + 2, startY + 4.7);
      x += colWidths[i];
    });

    x = startX;
    body.forEach((cell, i) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(0, 0, 0);
      doc.rect(x, startY + headerH, colWidths[i], bodyH, "FD");
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);

      const lines = doc.splitTextToSize(String(cell), colWidths[i] - 6);
      doc.text(lines, x + 3, startY + headerH + 10);

      x += colWidths[i];
    });

    return startY + headerH + bodyH;
  }

  async function handleDownloadPdf() {
    if (!quote) return;

    try {
      setDownloading(true);

      const doc = new jsPDF("p", "mm", "a4");
      await addPdfAssets(doc);

      // subtle royal header strip
      doc.setFillColor(245, 238, 255);
      doc.rect(0, 28, 210, 22, "F");

      doc.setFont("times", "bold");
      doc.setFontSize(20);
      doc.setTextColor(42, 20, 84);
      doc.text("Umrah Package Proposal", 14, 41);

      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      doc.setTextColor(88, 88, 88);
      doc.text("Tailored by MashaAllah Trips for your sacred journey", 14, 47);

      // quotation box
      doc.setDrawColor(190, 190, 190);
      doc.rect(148, 31, 48, 18);
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text("Quotation Ref", 151, 37);
      doc.setFont("times", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(20, 20, 20);
      doc.text(safe(quote.booking_reference), 151, 44);

      let y = 58;

      y = drawWrappedText(doc, "Dear Customer,", 14, y, 180, {
        size: 11.5,
        style: "bold",
        lineHeight: 5,
      }) + 2;

      y = drawWrappedText(
        doc,
        "Greetings from MashaAllah Trips. We are pleased to share your Umrah quotation based on the requested travel details. Please review the flights, hotel stay, pricing and payment details below.",
        14,
        y,
        180,
        { size: 10.5, style: "normal", lineHeight: 5, color: [45, 45, 45] }
      ) + 2;

      y = drawWrappedText(
        doc,
        "Should you have any questions or concerns, please feel free to reach out. We are always happy to assist you.",
        14,
        y,
        180,
        { size: 10.5, style: "normal", lineHeight: 5, color: [45, 45, 45] }
      ) + 8;

      y = drawSectionHeading(doc, "Flights Details:", y);
      y = drawFlightTable(doc, y);

      y = drawSectionHeading(doc, "HOTEL DETAILS:", y);

      const mealLabel = quote.meals_included ? "(Breakfast)" : "(Room Only)";
      const makkahRoom = `${safe(quote.makkah_room_type)}\n${mealLabel}`;
      const madinahRoom = `${safe(quote.madinah_room_type)}\n${mealLabel}`;

      const makkahDate = `Check in: ${safe(quote.travel_date)}\nCheck Out: As per plan`;
      const madinahDate = `Check in: ${safe(quote.travel_date)}\nCheck Out: As per plan`;

      y =
        drawHotelBox(
          doc,
          "Makkah Hotel",
          safe(quote.makkah_hotel_name),
          makkahRoom,
          makkahDate,
          `${safe(quote.makkah_nights)} Nights`,
          y + 1
        ) + 6;

      y =
        drawHotelBox(
          doc,
          "Madinah Hotel",
          safe(quote.madinah_hotel_name),
          madinahRoom,
          madinahDate,
          `${safe(quote.madinah_nights)} Nights`,
          y
        ) + 10;

      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      doc.text("Total Package includes Flights, Hotels and Visa:", 17, y);

      y += 11;

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text("Total Prices for 01 Adult:", 17, y);

      const priceX = 68;
      const priceValue = formatCurrency(quote.total_price);
      const priceW = doc.getTextWidth(priceValue) + 4;
      doc.setFillColor(255, 242, 0);
      doc.rect(priceX - 1, y - 5, priceW, 7, "F");
      doc.setTextColor(20, 20, 20);
      doc.text(priceValue, priceX, y);
      doc.text("including all.", priceX + priceW + 1, y);

      y += 12;

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Exclusive Offer:", 17, y);

      y += 7;

      doc.setFont("times", "bold");
      doc.setTextColor(220, 0, 0);
      doc.text("BOOK NOW AND PAY LATER", 17, y);

      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      const offerText = ` in which you can pay ${formatCurrency(
        quote.deposit_amount
      )} now and rest you can pay in easy installments which will have to be cleared one month Before Traveling.`;
      const offerLines = doc.splitTextToSize(offerText, 132);
      doc.text(offerLines, 67, y);

      y += offerLines.length * 5 + 10;

      doc.setFont("times", "italic");
      doc.setFontSize(12.5);
      doc.setTextColor(0, 102, 204);
      doc.text("Why you should book with Us:", 17, y);

      y += 7;

      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(
        "• Every trip is customized to match your preferences, budget, and travel style.",
        25,
        y
      );
      y += 5;
      doc.text(
        "• Special rates and insider perks through our strong relationships with top travel providers.",
        25,
        y
      );
      y += 5;
      doc.text(
        "• We're here for you before, during, and after your trip to handle any issues and ensure a smooth journey.",
        25,
        y
      );

      y += 11;

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Kind Regards,", 17, y);

      y += 6;
      doc.setFont("times", "bolditalic");
      doc.setFontSize(12);
      doc.setTextColor(220, 0, 0);
      doc.text(agentName, 17, y);

      y += 6;
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Travel Consultant", 17, y);

      // QR code block
      const qrUrl = "https://api.whatsapp.com/send?phone=447845733642";
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        margin: 1,
        width: 220,
      });

      doc.setDrawColor(200, 200, 200);
      doc.rect(140, y - 12, 48, 48);
      doc.addImage(qrDataUrl, "PNG", 145, y - 7, 24, 24);

      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text("Scan for WhatsApp", 143, y + 22);

      doc.setFont("times", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text("+44 7845 733642", 148, y + 27);

      y += 42;

      // trust strip
      doc.setFillColor(248, 248, 248);
      doc.rect(14, y, 182, 18, "F");
      doc.setDrawColor(210, 210, 210);
      doc.rect(14, y, 182, 18);

      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(25, 25, 25);
      doc.text("MashaAllah Trips", 18, y + 11);
      doc.text("Trustpilot", 78, y + 11);
      doc.text("IATA & ATOL Accredited", 125, y + 11);

      // Page 2
      doc.addPage();

      // soft kaaba watermark feel using transparent text block imitation
      doc.setTextColor(245, 245, 245);
      doc.setFont("times", "bold");
      doc.setFontSize(60);
      doc.text("UMRAH", 58, 120, { angle: 0 });

      let ty = 18;
      doc.setTextColor(20, 20, 20);
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("Umrah Booking Terms Summary", 14, ty);

      ty += 11;

      const terms = [
        "All quotations are subject to availability at the time of booking confirmation.",
        "Prices may change until flights, hotels, transport and all services are fully confirmed.",
        "Deposit payments may be non-refundable or partially refundable depending on supplier terms.",
        "Visa approval is subject to the rules and final decision of the relevant authorities.",
        "Flight timings, baggage allowance and routing may change as per airline operational updates.",
        "Hotel distance, room type and star rating remain subject to final booking confirmation.",
        "Full balance must be paid before travel as per agreed payment schedule.",
        "Special requests are not guaranteed unless confirmed in final booking documents.",
        "By proceeding, the client agrees to MashaAllah Trips booking and cancellation policy.",
      ];

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(45, 45, 45);

      terms.forEach((term) => {
        const lines = doc.splitTextToSize(`• ${term}`, 180);
        doc.text(lines, 14, ty);
        ty += lines.length * 6 + 3;
      });

      ty += 8;
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text("Notes:", 14, ty);

      ty += 7;
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      const noteLines = doc.splitTextToSize(safe(quote.notes), 180);
      doc.text(noteLines, 14, ty);

      doc.setDrawColor(180, 180, 180);
      doc.line(14, 282, 196, 282);
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text("MashaAllah Trips", 14, 288);
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.text("+44 204 5557 373 • www.mashaallahtrips.com", 60, 288);

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
              <div style={styles.logoHtmlWrap}>
                <img
                  src="https://mashaallahtrips.com/wp-content/uploads/2026/01/cropped-Mashaallah-6-scaled-1.webp"
                  alt="MashaAllah Trips"
                  style={styles.logoHtml}
                />
              </div>
              <div style={styles.brandSub}>Royal Umrah Proposal</div>

              <div style={styles.accreditationRow}>
                <span style={styles.badgeGold}>IATA Accredited</span>
                <span style={styles.badgeGold}>ATOL Accredited</span>
                <span style={styles.badgeGold}>Trustpilot Trusted</span>
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
              <div style={styles.heroTitle}>Umrah Package Proposal</div>
              <div style={styles.heroText}>
                A premium quotation prepared by MashaAllah Trips for your blessed journey.
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
                items={[["Notes", safe(quote.flight_notes)]]}
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
            <div style={styles.totalIncludeBox}>
              Total Package Includes Flights, Hotels and Visa
            </div>
            <div style={styles.totalPriceBox}>
              Total Price: {formatCurrency(quote.total_price)}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.offerBox}>
              BOOK NOW AND PAY LATER — Secure your Umrah package with deposit and pay the remaining balance in easy instalments.
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Why You Should Book With Us</div>
            <div style={styles.whyBookBox}>
              <div>• Customized Umrah packages based on your travel needs</div>
              <div>• Best rates through trusted travel suppliers</div>
              <div>• Ongoing support before and during your journey</div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Consultant</div>
            <div style={styles.notesBox}>
              <div style={{ fontWeight: 800, color: "#dc2626", marginBottom: 6 }}>
                {agentName}
              </div>
              <div style={{ fontWeight: 700 }}>Travel Consultant</div>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>WhatsApp QR</div>
            <div style={styles.notesBox}>
              Scan the downloadable PDF QR code to contact us directly on WhatsApp.
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
              IATA • ATOL • Trustpilot • Premium Umrah Travel Services
            </div>
          </footer>
        </div>
      </div>
    </>
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
  logoHtmlWrap: {
    minHeight: "52px",
    display: "flex",
    alignItems: "center",
  },
  logoHtml: {
    maxWidth: "250px",
    maxHeight: "60px",
    objectFit: "contain",
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
  totalIncludeBox: {
    padding: "14px 16px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "12px",
  },
  totalPriceBox: {
    padding: "16px 18px",
    borderRadius: "14px",
    background: "#effcf3",
    border: "1px solid #ccefd7",
    fontWeight: 900,
    fontSize: "20px",
    color: "#0f7a38",
  },
  offerBox: {
    padding: "16px 18px",
    borderRadius: "14px",
    background: "#fff2f2",
    border: "1px solid #ffd4d4",
    fontWeight: 800,
    color: "#b91c1c",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  whyBookBox: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#fff",
    padding: "16px",
    lineHeight: 1.8,
    fontSize: "14px",
    color: "#374151",
    display: "grid",
    gap: "6px",
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
