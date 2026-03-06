"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

function makeBookingReference() {
  const part1 = Math.random().toString(36).slice(2, 6).toUpperCase();
  const part2 = Date.now().toString().slice(-6);
  return `MAT-${part1}-${part2}`;
}

export default function NewQuotationPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [agentEmail, setAgentEmail] = useState("");

  // Client Details
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [departureCity, setDepartureCity] = useState("");

  // Package Basics
  const [packageTitle, setPackageTitle] = useState("");
  const [destination, setDestination] = useState("Makkah / Madinah");
  const [travelDate, setTravelDate] = useState("");
  const [umrahType, setUmrahType] = useState("");
  const [makkahNights, setMakkahNights] = useState("");
  const [madinahNights, setMadinahNights] = useState("");
  const [totalNights, setTotalNights] = useState("");
  const [visaIncluded, setVisaIncluded] = useState(false);
  const [transportIncluded, setTransportIncluded] = useState(false);
  const [ziyaratIncluded, setZiyaratIncluded] = useState(false);
  const [mealsIncluded, setMealsIncluded] = useState(false);

  // Hotel Details
  const [makkahHotelName, setMakkahHotelName] = useState("");
  const [makkahHotelRating, setMakkahHotelRating] = useState("");
  const [makkahRoomType, setMakkahRoomType] = useState("");
  const [makkahDistance, setMakkahDistance] = useState("");

  const [madinahHotelName, setMadinahHotelName] = useState("");
  const [madinahHotelRating, setMadinahHotelRating] = useState("");
  const [madinahRoomType, setMadinahRoomType] = useState("");
  const [madinahDistance, setMadinahDistance] = useState("");

  // Flight Details
  const [airline, setAirline] = useState("");
  const [outboundSector, setOutboundSector] = useState("");
  const [returnSector, setReturnSector] = useState("");
  const [baggage, setBaggage] = useState("");
  const [flightNotes, setFlightNotes] = useState("");

  // Pricing
  const [hotelCost, setHotelCost] = useState("");
  const [flightCost, setFlightCost] = useState("");
  const [visaCost, setVisaCost] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [ziyaratCost, setZiyaratCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [agentProfit, setAgentProfit] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  // Payment
  const [depositAmount, setDepositAmount] = useState("");
  const [remainingBalance, setRemainingBalance] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("");

  // Other
  const [notes, setNotes] = useState("");
  const [quotationStatus, setQuotationStatus] = useState("draft");
  const [bookingReference, setBookingReference] = useState(makeBookingReference());

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      setAgentEmail(session.user.email);
      setChecking(false);
    }

    checkSession();
  }, [router]);

  useEffect(() => {
    const mk = Number(makkahNights || 0);
    const md = Number(madinahNights || 0);
    const total = mk + md;
    if (total > 0) setTotalNights(String(total));
    if (!makkahNights && !madinahNights) setTotalNights("");
  }, [makkahNights, madinahNights]);

  useEffect(() => {
    const calc =
      Number(hotelCost || 0) +
      Number(flightCost || 0) +
      Number(visaCost || 0) +
      Number(transportCost || 0) +
      Number(ziyaratCost || 0) +
      Number(otherCost || 0) +
      Number(agentProfit || 0);

    if (calc > 0) {
      setTotalPrice(String(calc));
    }
  }, [
    hotelCost,
    flightCost,
    visaCost,
    transportCost,
    ziyaratCost,
    otherCost,
    agentProfit,
  ]);

  useEffect(() => {
    const total = Number(totalPrice || 0);
    const deposit = Number(depositAmount || 0);
    if (total >= 0 && deposit >= 0) {
      setRemainingBalance(String(Math.max(total - deposit, 0)));
    }
  }, [totalPrice, depositAmount]);

  const canSave = useMemo(() => {
    return (
      clientName.trim() &&
      clientPhone.trim() &&
      destination.trim() &&
      travelDate.trim() &&
      totalPrice.trim() &&
      !loading
    );
  }, [clientName, clientPhone, destination, travelDate, totalPrice, loading]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      const payload = {
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        adults: Number(adults || 0),
        children: Number(children || 0),
        infants: Number(infants || 0),
        departure_city: departureCity,

        package_title: packageTitle,
        destination,
        travel_date: travelDate,
        umrah_type: umrahType,
        makkah_nights: makkahNights ? Number(makkahNights) : null,
        madinah_nights: madinahNights ? Number(madinahNights) : null,
        total_nights: totalNights ? Number(totalNights) : null,

        visa_included: visaIncluded,
        transport_included: transportIncluded,
        ziyarat_included: ziyaratIncluded,
        meals_included: mealsIncluded,

        makkah_hotel_name: makkahHotelName,
        makkah_hotel_rating: makkahHotelRating,
        makkah_room_type: makkahRoomType,
        makkah_distance: makkahDistance,

        madinah_hotel_name: madinahHotelName,
        madinah_hotel_rating: madinahHotelRating,
        madinah_room_type: madinahRoomType,
        madinah_distance: madinahDistance,

        airline,
        outbound_sector: outboundSector,
        return_sector: returnSector,
        baggage,
        flight_notes: flightNotes,

        hotel_cost: hotelCost,
        flight_cost: flightCost,
        visa_cost: visaCost,
        transport_cost: transportCost,
        ziyarat_cost: ziyaratCost,
        other_cost: otherCost,
        agent_profit: agentProfit,
        total_price: totalPrice,

        deposit_amount: depositAmount,
        remaining_balance: remainingBalance,
        payment_plan: paymentPlan,

        notes,
        booking_reference: bookingReference,
        quotation_status: quotationStatus,
        created_by: agentEmail,
      };

      const { error } = await supabase.from("quotations").insert([payload]);

      if (error) {
        setMsg({
          type: "error",
          text: error.message || "Failed to save quotation.",
        });
        return;
      }

      setMsg({
        type: "success",
        text: `Quotation saved successfully. Booking Ref: ${bookingReference}`,
      });

      setBookingReference(makeBookingReference());
    } catch (err) {
      setMsg({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <div style={styles.loadingWrap}>Loading...</div>;
  }

  return (
    <main
      className="container"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 1100 }}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>Umrah Package Builder</h1>
            <p style={styles.subtitle}>
              Build a full quotation with hotels, flights, costs, deposit and booking reference.
            </p>
          </div>

          <Link href="/agent/dashboard" className="btn">
            ← Back to Dashboard
          </Link>
        </div>

        {msg.text ? (
          <div
            style={{
              marginBottom: 16,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.12)",
              background:
                msg.type === "error"
                  ? "rgba(255,70,70,.10)"
                  : "rgba(0,200,120,.10)",
              color: msg.type === "error" ? "#ffb4b4" : "#b9ffd9",
            }}
          >
            {msg.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <SectionTitle title="Client Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Client Name">
              <input
                className="input"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client full name"
                required
              />
            </Field>
            <Field label="Client Phone">
              <input
                className="input"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+44..."
                required
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Client Email">
              <input
                className="input"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@email.com"
              />
            </Field>
            <Field label="Departure City">
              <input
                className="input"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                placeholder="London / Manchester"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 18 }}>
            <Field label="Adults">
              <input
                className="input"
                type="number"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              />
            </Field>
            <Field label="Children">
              <input
                className="input"
                type="number"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 24 }}>
            <Field label="Infants">
              <input
                className="input"
                type="number"
                value={infants}
                onChange={(e) => setInfants(e.target.value)}
              />
            </Field>
            <Field label="Booking Reference">
              <input className="input" value={bookingReference} readOnly />
            </Field>
          </div>

          <SectionTitle title="Package Basics" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Package Title">
              <input
                className="input"
                value={packageTitle}
                onChange={(e) => setPackageTitle(e.target.value)}
                placeholder="5-Star Umrah with Flights"
              />
            </Field>
            <Field label="Umrah Type">
              <input
                className="input"
                value={umrahType}
                onChange={(e) => setUmrahType(e.target.value)}
                placeholder="Ramadan / Standard / Family"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Destination">
              <input
                className="input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Makkah / Madinah"
                required
              />
            </Field>
            <Field label="Travel Date">
              <input
                className="input"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                placeholder="2026-03-20"
                required
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 18 }}>
            <Field label="Makkah Nights">
              <input
                className="input"
                type="number"
                value={makkahNights}
                onChange={(e) => setMakkahNights(e.target.value)}
              />
            </Field>
            <Field label="Madinah Nights">
              <input
                className="input"
                type="number"
                value={madinahNights}
                onChange={(e) => setMadinahNights(e.target.value)}
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 20 }}>
            <Field label="Total Nights">
              <input className="input" value={totalNights} readOnly />
            </Field>

            <Field label="Quotation Status">
              <div style={styles.selectWrap}>
                <select
                  value={quotationStatus}
                  onChange={(e) => setQuotationStatus(e.target.value)}
                  style={styles.select}
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
                <span style={styles.selectArrow}>⌄</span>
              </div>
            </Field>
          </div>

          <div style={checkboxWrap}>
            <CheckItem label="Visa Included" checked={visaIncluded} onChange={setVisaIncluded} />
            <CheckItem label="Transport Included" checked={transportIncluded} onChange={setTransportIncluded} />
            <CheckItem label="Ziyarat Included" checked={ziyaratIncluded} onChange={setZiyaratIncluded} />
            <CheckItem label="Meals Included" checked={mealsIncluded} onChange={setMealsIncluded} />
          </div>

          <SectionTitle title="Hotel Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Makkah Hotel Name">
              <input
                className="input"
                value={makkahHotelName}
                onChange={(e) => setMakkahHotelName(e.target.value)}
                placeholder="Swissotel / Pullman..."
              />
            </Field>
            <Field label="Makkah Hotel Rating">
              <input
                className="input"
                value={makkahHotelRating}
                onChange={(e) => setMakkahHotelRating(e.target.value)}
                placeholder="5 Star"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Makkah Room Type">
              <input
                className="input"
                value={makkahRoomType}
                onChange={(e) => setMakkahRoomType(e.target.value)}
                placeholder="Quad / Triple / Double"
              />
            </Field>
            <Field label="Makkah Distance">
              <input
                className="input"
                value={makkahDistance}
                onChange={(e) => setMakkahDistance(e.target.value)}
                placeholder="200m from Haram"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Madinah Hotel Name">
              <input
                className="input"
                value={madinahHotelName}
                onChange={(e) => setMadinahHotelName(e.target.value)}
                placeholder="Anwar Al Madinah..."
              />
            </Field>
            <Field label="Madinah Hotel Rating">
              <input
                className="input"
                value={madinahHotelRating}
                onChange={(e) => setMadinahHotelRating(e.target.value)}
                placeholder="5 Star"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 24 }}>
            <Field label="Madinah Room Type">
              <input
                className="input"
                value={madinahRoomType}
                onChange={(e) => setMadinahRoomType(e.target.value)}
                placeholder="Quad / Triple / Double"
              />
            </Field>
            <Field label="Madinah Distance">
              <input
                className="input"
                value={madinahDistance}
                onChange={(e) => setMadinahDistance(e.target.value)}
                placeholder="150m from Masjid Nabawi"
              />
            </Field>
          </div>

          <SectionTitle title="Flight Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Airline">
              <input
                className="input"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                placeholder="Saudi / Qatar / Turkish"
              />
            </Field>
            <Field label="Baggage">
              <input
                className="input"
                value={baggage}
                onChange={(e) => setBaggage(e.target.value)}
                placeholder="23kg + 7kg"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Outbound Sector">
              <input
                className="input"
                value={outboundSector}
                onChange={(e) => setOutboundSector(e.target.value)}
                placeholder="LHR → JED"
              />
            </Field>
            <Field label="Return Sector">
              <input
                className="input"
                value={returnSector}
                onChange={(e) => setReturnSector(e.target.value)}
                placeholder="MED → LHR"
              />
            </Field>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Field label="Flight Notes">
              <textarea
                className="input"
                rows={3}
                value={flightNotes}
                onChange={(e) => setFlightNotes(e.target.value)}
                placeholder="Transit / timings / baggage notes"
              />
            </Field>
          </div>

          <SectionTitle title="Pricing Breakdown" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Hotel Cost">
              <input
                className="input"
                value={hotelCost}
                onChange={(e) => setHotelCost(e.target.value)}
                placeholder="500"
              />
            </Field>
            <Field label="Flight Cost">
              <input
                className="input"
                value={flightCost}
                onChange={(e) => setFlightCost(e.target.value)}
                placeholder="350"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Visa Cost">
              <input
                className="input"
                value={visaCost}
                onChange={(e) => setVisaCost(e.target.value)}
                placeholder="120"
              />
            </Field>
            <Field label="Transport Cost">
              <input
                className="input"
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
                placeholder="80"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Ziyarat Cost">
              <input
                className="input"
                value={ziyaratCost}
                onChange={(e) => setZiyaratCost(e.target.value)}
                placeholder="50"
              />
            </Field>
            <Field label="Other Cost">
              <input
                className="input"
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
                placeholder="30"
              />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 18 }}>
            <Field label="Agent Profit">
              <input
                className="input"
                value={agentProfit}
                onChange={(e) => setAgentProfit(e.target.value)}
                placeholder="150"
              />
            </Field>
            <Field label="Total Selling Price">
              <input
                className="input"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="1230"
                required
              />
            </Field>
          </div>

          <SectionTitle title="Payment Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Deposit Amount">
              <input
                className="input"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="200"
              />
            </Field>
            <Field label="Remaining Balance">
              <input className="input" value={remainingBalance} readOnly />
            </Field>
          </div>

          <div style={{ marginBottom: 18 }}>
            <Field label="Payment Plan">
              <input
                className="input"
                value={paymentPlan}
                onChange={(e) => setPaymentPlan(e.target.value)}
                placeholder="Deposit + remaining before travel"
              />
            </Field>
          </div>

          <SectionTitle title="Notes" />

          <div style={{ marginBottom: 22 }}>
            <Field label="Internal / Client Notes">
              <textarea
                className="input"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special requests / room preference / elderly passengers / wheelchairs etc."
              />
            </Field>
          </div>

          <button
            className="btn"
            type="submit"
            disabled={!canSave}
            style={{
              width: "100%",
              opacity: canSave ? 1 : 0.65,
              pointerEvents: canSave ? "auto" : "none",
            }}
          >
            {loading ? "Saving..." : "Save Full Quotation"}
          </button>
        </form>
      </div>
    </main>
  );
}

function SectionTitle({ title }) {
  return (
    <div
      style={{
        margin: "6px 0 14px",
        paddingBottom: 8,
        borderBottom: "1px solid rgba(255,255,255,.10)",
        fontWeight: 800,
        fontSize: 18,
      }}
    >
      {title}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ width: "100%" }}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,.10)",
        background: "rgba(255,255,255,.03)",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

const checkboxWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 24,
};

const styles = {
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
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 34,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "var(--muted)",
  },
  selectWrap: {
    position: "relative",
    width: "100%",
  },
  select: {
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: "rgba(255,255,255,.06)",
    color: "#e9e9f2",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 14,
    padding: "12px 42px 12px 14px",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    cursor: "pointer",
  },
  option: {
    backgroundColor: "#141421",
    color: "#e9e9f2",
  },
  selectArrow: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "rgba(255,255,255,.72)",
    fontSize: 16,
  },
};
