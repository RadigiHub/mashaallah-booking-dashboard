"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import jsPDF from "jspdf";

const BRAND_LOGO =
  "https://mashaallahtrips.com/wp-content/uploads/2026/01/cropped-Mashaallah-6-scaled-1.webp";
const TRUSTPILOT_LOGO =
  "https://mashaallahtrips.com/wp-content/uploads/2026/04/Trustpilot-logo-Mashaallah-trips-.webp";
const IATA_ATOL_LOGO =
  "https://mashaallahtrips.com/wp-content/uploads/2026/04/iata-atol-logo-mashaallah-trips-.webp";
const WHATSAPP_QR =
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

function wrapText(doc, text, x, y, maxWidth, lineHeight = 5) {
  const lines = doc.splitTextToSize(String(text || "—"), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

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
    if (!quote) return;

    try {
      setDownloading(true);

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = 14;

      // Header logos
      try {
        await addImageFromUrl(doc, BRAND_LOGO, "WEBP", margin, y, 48, 15);
      } catch {}
      try {
        await addImageFromUrl(doc, TRUSTPILOT_LOGO, "WEBP", margin, y + 18, 26, 7);
      } catch {}
      try {
        await addImageFromUrl(doc, IATA_ATOL_LOGO, "WEBP", pageWidth - margin - 22, y + 16, 22, 9);
      } catch {}

      // Ref box
      doc.setDrawColor(196, 206, 220);
      doc.setFillColor(248, 251, 255);
      doc.roundedRect(pageWidth - margin - 52, y, 52, 24, 3, 3, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(90, 107, 130);
      doc.text("Quotation Ref", pageWidth - margin - 48, y + 7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(8, 25, 53);
      doc.text(safe(quote.booking_reference), pageWidth - margin - 48, y + 16);

      y += 34;

      // Proposal band
      doc.setDrawColor(11, 71, 114);
      doc.setFillColor(247, 245, 250);
      doc.rect(margin, y, contentWidth, 24, "FD");
      doc.line(margin, y, margin + contentWidth, y);
      doc.line(margin, y + 24, margin + contentWidth, y + 24);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(11, 71, 114);
      doc.text("Umrah Package Proposal", pageWidth / 2, y + 11, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Premium Travel Experience by MashaAllah Trips", pageWidth / 2, y + 19, {
        align: "center",
      });

      y += 34;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Status: ${safe(quote.quotation_status)}`, margin, y);
      doc.text(`Date: ${formatDate(quote.created_at)}`, pageWidth - margin, y, { align: "right" });

      y += 10;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Dear Customer,", margin, y);

      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(51, 65, 85);
      y = wrapText(
        doc,
        "We are pleased to present your Umrah quotation with carefully selected flights, hotel stay, services, and pricing. Please review the proposal below.",
        margin,
        y,
        contentWidth,
        5
      );

      y += 10;

      // Section helper
      const sectionTitle = (title) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin, y);
        y += 6;
      };

      const drawBoxTitle = (x, topY, w, title) => {
        doc.setFillColor(11, 71, 114);
        doc.setTextColor(255, 255, 255);
        doc.roundedRect(x, topY, w, 10, 3, 3, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, x + 4, topY + 6.5);
      };

      const drawInfoBox = (x, topY, w, title, rows) => {
        const boxHeight = 58;
        doc.setDrawColor(219, 228, 239);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, topY, w, boxHeight, 4, 4, "FD");
        drawBoxTitle(x, topY, w, title);

        let rowY = topY + 16;
        rows.forEach(([label, value], i) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(label, x + 4, rowY);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          const wrapped = doc.splitTextToSize(String(value || "—"), w - 8);
          doc.text(wrapped, x + 4, rowY + 5);

          rowY += 13;
          if (i < rows.length - 1) {
            doc.setDrawColor(238, 242, 247);
            doc.line(x + 3, rowY - 3, x + w - 3, rowY - 3);
          }
        });

        return boxHeight;
      };

      // Client details
      sectionTitle("Client Details");
      const halfGap = 4;
      const halfWidth = (contentWidth - halfGap) / 2;

      drawInfoBox(margin, y, halfWidth, "Client Information", [
        ["Client Name", safe(quote.client_name)],
        ["Phone", safe(quote.client_phone)],
        ["Email", safe(quote.client_email)],
        ["Departure City", safe(quote.departure_city)],
      ]);

      drawInfoBox(margin + halfWidth + halfGap, y, halfWidth, "Travellers", [
        ["Adults", safe(quote.adults)],
        ["Children", safe(quote.children)],
        ["Infants", safe(quote.infants)],
        ["Travel Date", safe(quote.travel_date)],
      ]);

      y += 68;

      // Flights
      sectionTitle("Flights Details");

      const flightCols = [24, 20, 30, 50, 50, 18];
      const flightHeaders = ["Date", "Flight", "Carrier", "Departs", "Arrives", "Duration"];
      const flightValues = [
        safe(quote.travel_date),
        "—",
        safe(quote.airline),
        safe(quote.outbound_sector),
        safe(quote.return_sector),
        "—",
      ];

      let fx = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      flightHeaders.forEach((h, i) => {
        doc.setFillColor(11, 71, 114);
        doc.setTextColor(255, 255, 255);
        doc.rect(fx, y, flightCols[i], 9, "F");
        doc.text(h, fx + flightCols[i] / 2, y + 5.8, { align: "center" });
        fx += flightCols[i];
      });

      y += 9;
      fx = margin;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      flightValues.forEach((v, i) => {
        doc.setDrawColor(216, 224, 234);
        doc.setFillColor(255, 255, 255);
        doc.rect(fx, y, flightCols[i], 11, "FD");
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(String(v || "—"), flightCols[i] - 4);
        doc.text(lines, fx + 2, y + 4.8);
        fx += flightCols[i];
      });

      y += 19;

      // Hotels
      sectionTitle("Hotel Details");

      const hotelCols = [45, 45, 45, 33];
      const hotelHeaders1 = ["Makkah Hotel", "Room Type", "Distance", "No. Of Nights"];
      const hotelValues1 = [
        safe(quote.makkah_hotel_name),
        safe(quote.makkah_room_type),
        safe(quote.makkah_distance),
        safe(quote.makkah_nights),
      ];

      let hx = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      hotelHeaders1.forEach((h, i) => {
        doc.setFillColor(47, 117, 181);
        doc.setTextColor(255, 255, 255);
        doc.rect(hx, y, hotelCols[i], 9, "F");
        doc.text(h, hx + hotelCols[i] / 2, y + 5.8, { align: "center" });
        hx += hotelCols[i];
      });

      y += 9;
      hx = margin;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      hotelValues1.forEach((v, i) => {
        doc.setDrawColor(216, 224, 234);
        doc.setFillColor(255, 255, 255);
        doc.rect(hx, y, hotelCols[i], 11, "FD");
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(String(v || "—"), hotelCols[i] - 4);
        doc.text(lines, hx + 2, y + 4.8);
        hx += hotelCols[i];
      });

      y += 16;

      const hotelHeaders2 = ["Madinah Hotel", "Room Type", "Distance", "No. Of Nights"];
      const hotelValues2 = [
        safe(quote.madinah_hotel_name),
        safe(quote.madinah_room_type),
        safe(quote.madinah_distance),
        safe(quote.madinah_nights),
      ];

      hx = margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      hotelHeaders2.forEach((h, i) => {
        doc.setFillColor(47, 117, 181);
        doc.setTextColor(255, 255, 255);
        doc.rect(hx, y, hotelCols[i], 9, "F");
        doc.text(h, hx + hotelCols[i] / 2, y + 5.8, { align: "center" });
        hx += hotelCols[i];
      });

      y += 9;
      hx = margin;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      hotelValues2.forEach((v, i) => {
        doc.setDrawColor(216, 224, 234);
        doc.setFillColor(255, 255, 255);
        doc.rect(hx, y, hotelCols[i], 11, "FD");
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(String(v || "—"), hotelCols[i] - 4);
        doc.text(lines, hx + 2, y + 4.8);
        hx += hotelCols[i];
      });

      y += 20;

      // Price
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text("Total Package includes Flights, Hotels and Visa:", margin, y);

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Total Price:", margin, y);

      const priceText = formatCurrency(quote.total_price);
      const priceWidth = doc.getTextWidth(priceText) + 6;
      doc.setFillColor(255, 242, 0);
      doc.rect(margin + 30, y - 5, priceWidth, 7, "F");
      doc.text(priceText, margin + 33, y);
      doc.setFont("helvetica", "normal");
      doc.text("including all.", margin + 33 + priceWidth, y);

      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      wrapText(
        doc,
        `BOOK NOW & PAY LATER — Pay ${formatCurrency(
          quote.deposit_amount
        )} now, rest in easy instalments.`,
        margin,
        y,
        contentWidth,
        5
      );

      y += 14;

      // Why
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.setTextColor(0, 102, 204);
      doc.text("Why you should book with Us:", margin, y);

      y += 7;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(17, 24, 39);
      wrapText(
        doc,
        "• Every trip is customized to match your preferences, budget, and travel style.",
        margin + 5,
        y,
        contentWidth - 5,
        5
      );
      y += 6;
      wrapText(
        doc,
        "• Special rates and insider perks through trusted supplier relationships.",
        margin + 5,
        y,
        contentWidth - 5,
        5
      );
      y += 6;
      wrapText(
        doc,
        "• Support before, during, and after your journey for a smooth Umrah experience.",
        margin + 5,
        y,
        contentWidth - 5,
        5
      );

      y += 12;

      // Consultant + QR
      const leftBoxW = 112;
      const rightBoxW = contentWidth - leftBoxW - 6;

      doc.setDrawColor(219, 228, 239);
      doc.setFillColor(252, 252, 253);
      doc.roundedRect(margin, y, leftBoxW, 34, 4, 4, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text("Kind Regards,", margin + 6, y + 9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(16);
      doc.text(agentName, margin + 6, y + 18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(11);
      doc.text("Travel Consultant", margin + 6, y + 26);

      doc.setDrawColor(219, 228, 239);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + leftBoxW + 6, y, rightBoxW, 34, 4, 4, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Scan to Contact on WhatsApp", margin + leftBoxW + 12, y + 8);

      try {
        await addImageFromUrl(doc, WHATSAPP_QR, "WEBP", margin + leftBoxW + 18, y + 10, 18, 18);
      } catch {}

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      wrapText(
        doc,
        "Quick direct contact with MashaAllah Trips",
        margin + leftBoxW + 42,
        y + 18,
        rightBoxW - 48,
        4.5
      );

      y += 44;

      // Trust logos bottom
      try {
        await addImageFromUrl(doc, TRUSTPILOT_LOGO, "WEBP", margin, y, 34, 10);
      } catch {}
      try {
        await addImageFromUrl(doc, IATA_ATOL_LOGO, "WEBP", pageWidth - margin - 34, y - 1, 34, 12);
      } catch {}

      y += 18;

      // Page 2
      doc.addPage();
      y = 16;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      doc.text("Notes", margin, y);

      y += 8;
      doc.setDrawColor(219, 228, 239);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentWidth, 44, 4, 4, "FD");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      wrapText(doc, safe(quote.notes), margin + 5, y + 8, contentWidth - 10, 5);

      y += 56;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("Terms & Conditions", margin, y);

      y += 8;
      doc.setDrawColor(219, 228, 239);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentWidth, 92, 4, 4, "FD");

      const terms = [
        "All quotations are subject to availability at the time of booking confirmation.",
        "Prices may change until flights, hotels, transport and all services are fully confirmed.",
        "Deposit payments may be non-refundable or partially refundable depending on supplier terms.",
        "Visa approval is subject to the rules and final decision of the relevant authorities.",
        "Flight timings, baggage allowance and routing may change as per airline operational updates.",
        "Hotel distance, room type and star rating remain subject to final booking confirmation.",
        "Full balance must be paid before travel as per agreed payment schedule.",
        "Special requests are not guaranteed unless confirmed in final booking documents.",
      ];

      let ty = y + 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);

      terms.forEach((term) => {
        const lines = doc.splitTextToSize(`• ${term}`, contentWidth - 12);
        doc.text(lines, margin + 6, ty);
        ty += lines.length * 5 + 2;
      });

      doc.setDrawColor(219, 228, 239);
      doc.line(margin, 282, pageWidth - margin, 282);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("MashaAllah Trips", margin, 288);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(
        "+44 204 5557 373 • www.mashaallahtrips.com • 13 Station Rd, London SE25 5AH, UK",
        pageWidth - margin,
        288,
        { align: "right" }
      );

      doc.save(`quotation-${safeFile(quote.booking_reference)}.pdf`);
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
              <img src={BRAND_LOGO} alt="MashaAllah Trips" style={sheetStyles.brandLogo} />
              <div style={sheetStyles.headerRight}>
                <div style={sheetStyles.refBox}>
                  <div style={sheetStyles.refLabel}>Quotation Ref</div>
                  <div style={sheetStyles.refValue}>{safe(quote.booking_reference)}</div>
                </div>
              </div>
            </div>

            <div style={sheetStyles.trustRowTop}>
              <img src={TRUSTPILOT_LOGO} alt="Trustpilot" style={sheetStyles.trustpilotTop} />
              <img src={IATA_ATOL_LOGO} alt="IATA ATOL" style={sheetStyles.iataTop} />
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

            <table style={{ ...sheetStyles.table, marginBottom: 16 }}>
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
                <img src={WHATSAPP_QR} alt="WhatsApp QR" style={sheetStyles.qrImg} />
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
    maxWidth: 1080,
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
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    background: "#ffffff",
    color: "#0f172a",
    borderRadius: 18,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  header: {
    padding: "26px 30px 0",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  brandLogo: {
    width: "auto",
    height: 62,
    objectFit: "contain",
  },
  headerRight: {
    minWidth: 260,
  },
  refBox: {
    border: "1px solid #dbe4ef",
    background: "#f8fbff",
    borderRadius: 14,
    padding: "14px 16px",
  },
  refLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  refValue: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  trustRowTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 12,
    paddingBottom: 12,
  },
  trustpilotTop: {
    height: 32,
    width: "auto",
    objectFit: "contain",
  },
  iataTop: {
    height: 40,
    width: "auto",
    objectFit: "contain",
  },
  royalBand: {
    textAlign: "center",
    padding: "18px 16px 20px",
    borderTop: "2px solid #0b4772",
    borderBottom: "2px solid #0b4772",
    background: "linear-gradient(90deg,#f7fbff,#fff8fc)",
  },
  proposalTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: "#0b4772",
    marginBottom: 6,
  },
  proposalSub: {
    fontSize: 14,
    color: "#475569",
  },
  section: {
    padding: "22px 30px 0",
  },
  metaLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 14,
    color: "#334155",
    marginBottom: 12,
  },
  para: {
    margin: "0 0 10px",
    color: "#334155",
    lineHeight: 1.6,
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 12,
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 18,
    alignItems: "stretch",
  },
  infoCard: {
    border: "1px solid #dbe4ef",
    borderRadius: 14,
    background: "#ffffff",
    overflow: "hidden",
  },
  infoCardTitle: {
    background: "#0b4772",
    color: "#fff",
    fontWeight: 700,
    padding: "11px 14px",
    fontSize: 14,
  },
  infoCardBody: {
    padding: "10px 14px",
  },
  infoRow: {
    display: "grid",
    gap: 4,
    padding: "9px 0",
    borderBottom: "1px solid #eef2f7",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 600,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #d8e0ea",
    marginBottom: 0,
  },
  th: {
    background: "#0b4772",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    padding: "10px 8px",
    border: "1px solid #0b4772",
    textAlign: "center",
  },
  td: {
    border: "1px solid #d8e0ea",
    padding: "10px 8px",
    fontSize: 13,
    color: "#0f172a",
    verticalAlign: "top",
  },
  packageInclude: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 12,
  },
  priceHighlight: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 14,
  },
  priceChip: {
    background: "#fff176",
    padding: "2px 6px",
    fontWeight: 900,
    borderRadius: 4,
  },
  offerText: {
    fontSize: 16,
    fontWeight: 800,
    color: "#dc2626",
    lineHeight: 1.5,
  },
  whyHeading: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0b4772",
    fontStyle: "italic",
    marginBottom: 10,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 22,
    lineHeight: 1.8,
    color: "#111827",
    fontSize: 15,
  },
  consultantCard: {
    border: "1px solid #dbe4ef",
    borderRadius: 14,
    background: "#fcfcfd",
    padding: 18,
  },
  consultantLabel: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: "#111827",
  },
  consultantName: {
    fontSize: 24,
    fontWeight: 900,
    color: "#dc2626",
    marginBottom: 6,
  },
  consultantRole: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  qrCard: {
    border: "1px solid #dbe4ef",
    borderRadius: 14,
    background: "#ffffff",
    padding: 18,
    textAlign: "center",
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 12,
  },
  qrImg: {
    width: 150,
    height: 150,
    objectFit: "contain",
    display: "block",
    margin: "0 auto 10px",
  },
  qrCaption: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
  },
  notesBox: {
    border: "1px solid #dbe4ef",
    borderRadius: 14,
    background: "#ffffff",
    padding: 16,
    fontSize: 14,
    lineHeight: 1.7,
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  termsBox: {
    border: "1px solid #dbe4ef",
    borderRadius: 14,
    background: "#ffffff",
    padding: 16,
  },
  termList: {
    margin: 0,
    paddingLeft: 22,
    lineHeight: 1.8,
    color: "#111827",
    fontSize: 14,
  },
  footer: {
    marginTop: 24,
    padding: "20px 30px 26px",
    borderTop: "1px solid #dbe4ef",
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
  },
};

const printStyles = `
  @page {
    size: A4;
    margin: 10mm;
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
      max-width: 100% !important;
      width: 100% !important;
    }
  }
`;
