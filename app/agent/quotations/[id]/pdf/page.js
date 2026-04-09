"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function QuotationPDF() {
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

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ background: "#fff", padding: "30px", fontFamily: "Segoe UI" }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", borderBottom: "3px solid #0a3d62", paddingBottom: "20px" }}>
        <img
          src="https://mashaallahtrips.com/wp-content/uploads/2026/01/Iata-Atol-confidence-1-3.png"
          style={{ height: "60px" }}
        />
        <h1 style={{ margin: "10px 0", color: "#0a3d62" }}>
          Umrah Package Proposal
        </h1>
        <p style={{ color: "#555" }}>
          Premium Travel Experience by MashaAllah Trips
        </p>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px 0" }}>

        <p><b>Quotation Ref:</b> {data.booking_reference}</p>

        <p>
          Dear Customer,<br />
          We are pleased to present your Umrah quotation with carefully selected flights and hotels.
        </p>

        {/* FLIGHTS */}
        <h3>Flights Details</h3>
        <table style={tableStyle}>
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
        <table style={tableStyle}>
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
        <div style={consultantBox}>
          <b>Consultant:</b> Shehroz Malik<br />
          Travel Consultant
        </div>

        {/* QR */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p><b>Scan to Contact on WhatsApp</b></p>
          <img
            src="https://mashaallahtrips.com/wp-content/uploads/2026/04/wa.link_b7jw9k.webp"
            style={{ width: "120px" }}
          />
        </div>

        {/* TRUST */}
        <div style={trustBox}>
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

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px"
};

const th = {
  background: "#0a3d62",
  color: "#fff",
  padding: "10px",
  fontSize: "13px"
};

const td = {
  border: "1px solid #ddd",
  padding: "10px",
  fontSize: "13px"
};

const priceBox = {
  background: "#f1f6fb",
  padding: "15px",
  borderLeft: "5px solid #0a3d62",
  fontSize: "18px",
  fontWeight: "bold",
  marginTop: "20px"
};

const consultantBox = {
  marginTop: "20px",
  padding: "15px",
  background: "#f9f9f9",
  borderRadius: "10px"
};

const trustBox = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px"
};

const footer = {
  textAlign: "center",
  fontSize: "12px",
  marginTop: "30px",
  borderTop: "1px solid #ddd",
  paddingTop: "10px"
};
