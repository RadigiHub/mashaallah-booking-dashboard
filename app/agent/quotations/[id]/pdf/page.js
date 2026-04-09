"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function PDFPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", id)
        .single();

      setData(data);
    };

    fetchData();
  }, [id]);

  if (!data) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ background: "#fff", padding: 30, fontFamily: "Segoe UI" }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", borderBottom: "3px solid #0a3d62", paddingBottom: 20 }}>
        <img
          src="https://mashaallahtrips.com/wp-content/uploads/2026/01/Iata-Atol-confidence-1-3.png"
          style={{ height: 60 }}
        />
        <h1 style={{ color: "#0a3d62", marginTop: 10 }}>
          Umrah Package Proposal
        </h1>
        <p style={{ color: "#555" }}>
          Premium Travel Experience by MashaAllah Trips
        </p>
      </div>

      {/* BODY */}
      <div style={{ marginTop: 20 }}>

        <p><b>Quotation Ref:</b> {data.booking_reference}</p>

        <p>
          Dear Customer,<br />
          We are pleased to present your Umrah quotation with carefully selected flights and hotels.
        </p>

        {/* FLIGHTS */}
        <h3>Flights Details</h3>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Flight</th>
              <th style={th}>Route</th>
              <th style={th}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>{data.travel_date}</td>
              <td style={td}>Saudi Airlines</td>
              <td style={td}>LHR → JED → MED → LHR</td>
              <td style={td}>-</td>
            </tr>
          </tbody>
        </table>

        {/* HOTELS */}
        <h3>Hotel Details</h3>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>City</th>
              <th style={th}>Hotel</th>
              <th style={th}>Room</th>
              <th style={th}>Nights</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>Makkah</td>
              <td style={td}>{data.makkah_hotel}</td>
              <td style={td}>{data.makkah_room_type}</td>
              <td style={td}>{data.makkah_nights}</td>
            </tr>
            <tr>
              <td style={td}>Madinah</td>
              <td style={td}>{data.madinah_hotel}</td>
              <td style={td}>{data.madinah_room_type}</td>
              <td style={td}>{data.madinah_nights}</td>
            </tr>
          </tbody>
        </table>

        {/* PRICE */}
        <div style={priceBox}>
          Total Price: £{data.total_price} (All Inclusive)
        </div>

        {/* OFFER */}
        <p style={{ color: "red", fontWeight: "bold" }}>
          BOOK NOW & PAY LATER – Pay £600 now, rest in easy instalments.
        </p>

        {/* CONSULTANT */}
        <div style={consultant}>
          <b>Consultant:</b> Shehroz Malik<br />
          Travel Consultant
        </div>

        {/* QR */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <p><b>Scan to Contact on WhatsApp</b></p>
          <img
            src="https://mashaallahtrips.com/wp-content/uploads/2026/04/wa.link_b7jw9k.webp"
            style={{ width: 120 }}
          />
        </div>

        {/* TRUST */}
        <div style={trust}>
          <img src="https://mashaallahtrips.com/wp-content/uploads/2026/04/Trustpilot-logo-Mashaallah-trips-.webp" />
          <img src="https://mashaallahtrips.com/wp-content/uploads/2026/04/iata-atol-logo-mashaallah-trips-.webp" />
        </div>

      </div>

      {/* FOOTER */}
      <div style={footer}>
        MashaAllah Trips | +44 7845 733642 | www.mashaallahtrips.com
      </div>

    </div>
  );
}

/* STYLES */

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10
};

const th = {
  background: "#0a3d62",
  color: "#fff",
  padding: 10
};

const td = {
  border: "1px solid #ddd",
  padding: 10
};

const priceBox = {
  background: "#f1f6fb",
  padding: 15,
  borderLeft: "5px solid #0a3d62",
  fontWeight: "bold",
  marginTop: 20
};

const consultant = {
  marginTop: 20,
  padding: 15,
  background: "#f9f9f9",
  borderRadius: 10
};

const trust = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 20
};

const footer = {
  textAlign: "center",
  marginTop: 30,
  fontSize: 12,
  borderTop: "1px solid #ddd",
  paddingTop: 10
};
