"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = params?.id;

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agentEmail, setAgentEmail] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

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

  // PNR / Rendered Itinerary
  const [pnrRaw, setPnrRaw] = useState("");
  const [pnrRendered, setPnrRendered] = useState("");

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
  const [bookingReference, setBookingReference] = useState("");

  useEffect(() => {
    async function loadQuotation() {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      setAgentEmail(session.user.email);

      const { data: quote, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .maybeSingle();

      if (error || !quote || quote.is_archived === true) {
        setMsg({ type: "error", text: "Quotation not found." });
        setChecking(false);
        setLoading(false);
        return;
      }

      setClientName(quote.client_name || "");
      setClientPhone(quote.client_phone || "");
      setClientEmail(quote.client_email || "");
      setAdults(quote.adults ?? 1);
      setChildren(quote.children ?? 0);
      setInfants(quote.infants ?? 0);
      setDepartureCity(quote.departure_city || "");

      setPackageTitle(quote.package_title || "");
      setDestination(quote.destination || "Makkah / Madinah");
      setTravelDate(quote.travel_date || "");
      setUmrahType(quote.umrah_type || "");
      setMakkahNights(toInputValue(quote.makkah_nights));
      setMadinahNights(toInputValue(quote.madinah_nights));
      setTotalNights(toInputValue(quote.total_nights));

      setVisaIncluded(Boolean(quote.visa_included));
      setTransportIncluded(Boolean(quote.transport_included));
      setZiyaratIncluded(Boolean(quote.ziyarat_included));
      setMealsIncluded(Boolean(quote.meals_included));

      setPnrRaw(quote.pnr_raw || "");
      setPnrRendered(quote.pnr_rendered || "");

      setMakkahHotelName(quote.makkah_hotel_name || "");
      setMakkahHotelRating(quote.makkah_hotel_rating || "");
      setMakkahRoomType(quote.makkah_room_type || "");
      setMakkahDistance(quote.makkah_distance || "");

      setMadinahHotelName(quote.madinah_hotel_name || "");
      setMadinahHotelRating(quote.madinah_hotel_rating || "");
      setMadinahRoomType(quote.madinah_room_type || "");
      setMadinahDistance(quote.madinah_distance || "");

      setAirline(quote.airline || "");
      setOutboundSector(quote.outbound_sector || "");
      setReturnSector(quote.return_sector || "");
      setBaggage(quote.baggage || "");
      setFlightNotes(quote.flight_notes || "");

      setHotelCost(toInputValue(quote.hotel_cost));
      setFlightCost(toInputValue(quote.flight_cost));
      setVisaCost(toInputValue(quote.visa_cost));
      setTransportCost(toInputValue(quote.transport_cost));
      setZiyaratCost(toInputValue(quote.ziyarat_cost));
      setOtherCost(toInputValue(quote.other_cost));
      setAgentProfit(toInputValue(quote.agent_profit));
      setTotalPrice(toInputValue(quote.total_price));

      setDepositAmount(toInputValue(quote.deposit_amount));
      setRemainingBalance(toInputValue(quote.remaining_balance));
      setPaymentPlan(quote.payment_plan || "");

      setNotes(quote.notes || "");
      setQuotationStatus(quote.quotation_status || "draft");
      setBookingReference(quote.booking_reference || "");

      setChecking(false);
      setLoading(false);
    }

    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId, router]);

  useEffect(() => {
    const mk = Number(makkahNights || 0);
    const md = Number(madinahNights || 0);
    const total = mk + md;
    if (total > 0) {
      setTotalNights(String(total));
    }
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
      totalPrice.toString().trim() &&
      !saving
    );
  }, [clientName, clientPhone, destination, travelDate, totalPrice, saving]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setSaving(true);

    const payload = {
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      adults: Number(adults || 0),
      children: Number(children || 0),
      infants: Number(infants || 0),
      departure_city: departureCity,

      package_title: packageTitle,
      destination: destination,
      travel_date: travelDate,
      umrah_type: umrahType,
      makkah_nights: makkahNights ? Number(makkahNights) : null,
      madinah_nights: madinahNights ? Number(madinahNights) : null,
      total_nights: totalNights ? Number(totalNights) : null,

      visa_included: visaIncluded,
      transport_included: transportIncluded,
      ziyarat_included: ziyaratIncluded,
      meals_included: mealsIncluded,

      pnr_raw: pnrRaw,
      pnr_rendered: pnrRendered,

      makkah_hotel_name: makkahHotelName,
      makkah_hotel_rating: makkahHotelRating,
      makkah_room_type: makkahRoomType,
      makkah_distance: makkahDistance,

      madinah_hotel_name: madinahHotelName,
      madinah_hotel_rating: madinahHotelRating,
      madinah_room_type: madinahRoomType,
      madinah_distance: madinahDistance,

      airline: airline,
      outbound_sector: outboundSector,
      return_sector: returnSector,
      baggage: baggage,
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

      notes: notes,
      booking_reference: bookingReference,
      quotation_status: quotationStatus,
      created_by: agentEmail,
    };

    const { error } = await supabase
      .from("quotations")
      .update(payload)
      .eq("id", quotationId);

    if (error) {
      setMsg({
        type: "error",
        text: error.message || "Failed to update quotation.",
      });
      setSaving(false);
      return;
    }

    router.push(`/agent/quotations/${quotationId}`);
  }

  if (checking || loading) {
    return <div style={styles.loadingWrap}>Loading quotation for edit...</div>;
  }

  return (
    <main
      className="container"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 1100 }}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>Edit Umrah Quotation</h1>
            <p style={styles.subtitle}>
              Update package, hotels, flights, pricing, payment and notes.
            </p>
          </div>

          <div style={styles.topButtons}>
            <Link href={`/agent/quotations/${quotationId}`} className="btn">
              ← Back to Detail
            </Link>
            <Link href="/agent/quotations" className="btn">
              Saved Quotations
            </Link>
          </div>
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
              <input
                className="input"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value)}
              />
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
              <select
                className="input"
                value={quotationStatus}
                onChange={(e) => setQuotationStatus(e.target.value)}
                style={styles.darkSelect}
              >
                <option style={styles.optionDark} value="draft">
                  Draft
                </option>
                <option style={styles.optionDark} value="sent">
                  Sent
                </option>
                <option style={styles.optionDark} value="confirmed">
                  Confirmed
                </option>
              </select>
            </Field>
          </div>

          <div style={checkboxWrap}>
            <CheckItem
              label="Visa Included"
              checked={visaIncluded}
              onChange={setVisaIncluded}
            />
            <CheckItem
              label="Transport Included"
              checked={transportIncluded}
              onChange={setTransportIncluded}
            />
            <CheckItem
              label="Ziyarat Included"
              checked={ziyaratIncluded}
              onChange={setZiyaratIncluded}
            />
            <CheckItem
              label="Meals Included"
              checked={mealsIncluded}
              onChange={setMealsIncluded}
            />
          </div>

          <SectionTitle title="PNR / Itinerary Data" />

          <div style={{ marginBottom: 14 }}>
            <Field label="Raw PNR">
              <textarea
                className="input"
                rows={6}
                value={pnrRaw}
                onChange={(e) => setPnrRaw(e.target.value)}
                placeholder="Paste raw PNR here"
                style={styles.textarea}
              />
            </Field>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Field label="Rendered / Converted Itinerary">
              <textarea
                className="input"
                rows={6}
                value={pnrRendered}
                onChange={(e) => setPnrRendered(e.target.value)}
                placeholder="Paste converted readable itinerary here"
                style={styles.textarea}
              />
            </Field>
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
                style={styles.textarea}
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
                style={styles.textarea}
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
            {saving ? "Updating..." : "Update Quotation"}
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
    <div>
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

function toInputValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
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
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 34,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "var(--muted)",
  },
  topButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  textarea: {
    resize: "vertical",
    minHeight: 110,
  },
  darkSelect: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    background: "rgba(255,255,255,.06)",
    color: "#e9e9f2",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 14,
    padding: "12px 14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  optionDark: {
    backgroundColor: "#141421",
    color: "#e9e9f2",
  },
};
