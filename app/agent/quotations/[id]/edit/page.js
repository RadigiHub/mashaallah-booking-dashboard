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
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [departureCity, setDepartureCity] = useState("");

  const [packageTitle, setPackageTitle] = useState("");
  const [destination, setDestination] = useState("Makkah / Madinah");
  const [travelDate, setTravelDate] = useState("");
  const [umrahType, setUmrahType] = useState("");
  const [makkahNights, setMakkahNights] = useState("");
  const [madinahNights, setMadinahNights] = useState("");
  const [totalNights, setTotalNights] = useState("");
  const [quotationStatus, setQuotationStatus] = useState("draft");

  const [visaIncluded, setVisaIncluded] = useState(false);
  const [transportIncluded, setTransportIncluded] = useState(false);
  const [ziyaratIncluded, setZiyaratIncluded] = useState(false);
  const [mealsIncluded, setMealsIncluded] = useState(false);

  const [makkahHotelName, setMakkahHotelName] = useState("");
  const [makkahHotelRating, setMakkahHotelRating] = useState("");
  const [makkahRoomType, setMakkahRoomType] = useState("");
  const [makkahDistance, setMakkahDistance] = useState("");

  const [madinahHotelName, setMadinahHotelName] = useState("");
  const [madinahHotelRating, setMadinahHotelRating] = useState("");
  const [madinahRoomType, setMadinahRoomType] = useState("");
  const [madinahDistance, setMadinahDistance] = useState("");

  const [airline, setAirline] = useState("");
  const [outboundSector, setOutboundSector] = useState("");
  const [returnSector, setReturnSector] = useState("");
  const [baggage, setBaggage] = useState("");
  const [flightNotes, setFlightNotes] = useState("");

  const [hotelCost, setHotelCost] = useState("");
  const [flightCost, setFlightCost] = useState("");
  const [visaCost, setVisaCost] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [ziyaratCost, setZiyaratCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [agentProfit, setAgentProfit] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  const [depositAmount, setDepositAmount] = useState("");
  const [remainingBalance, setRemainingBalance] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("");

  const [notes, setNotes] = useState("");
  const [bookingReference, setBookingReference] = useState("");

  useEffect(() => {
    async function loadPage() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user?.email) {
        router.replace("/agent/login");
        return;
      }

      const { data: agentRow, error: agentError } = await supabase
        .from("agents")
        .select("email, is_active")
        .ilike("email", session.user.email)
        .maybeSingle();

      if (agentError || !agentRow || agentRow.is_active === false) {
        await supabase.auth.signOut();
        router.replace("/agent/login");
        return;
      }

      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .maybeSingle();

      if (error || !data) {
        setMsg({ type: "error", text: "Quotation not found." });
        setChecking(false);
        setLoading(false);
        return;
      }

      setClientName(data.client_name || "");
      setClientPhone(data.client_phone || "");
      setClientEmail(data.client_email || "");
      setAdults(data.adults ?? 1);
      setChildren(data.children ?? 0);
      setInfants(data.infants ?? 0);
      setDepartureCity(data.departure_city || "");

      setPackageTitle(data.package_title || "");
      setDestination(data.destination || "Makkah / Madinah");
      setTravelDate(data.travel_date || "");
      setUmrahType(data.umrah_type || "");
      setMakkahNights(data.makkah_nights ?? "");
      setMadinahNights(data.madinah_nights ?? "");
      setTotalNights(data.total_nights ?? "");
      setQuotationStatus(data.quotation_status || "draft");

      setVisaIncluded(!!data.visa_included);
      setTransportIncluded(!!data.transport_included);
      setZiyaratIncluded(!!data.ziyarat_included);
      setMealsIncluded(!!data.meals_included);

      setMakkahHotelName(data.makkah_hotel_name || "");
      setMakkahHotelRating(data.makkah_hotel_rating || "");
      setMakkahRoomType(data.makkah_room_type || "");
      setMakkahDistance(data.makkah_distance || "");

      setMadinahHotelName(data.madinah_hotel_name || "");
      setMadinahHotelRating(data.madinah_hotel_rating || "");
      setMadinahRoomType(data.madinah_room_type || "");
      setMadinahDistance(data.madinah_distance || "");

      setAirline(data.airline || "");
      setOutboundSector(data.outbound_sector || "");
      setReturnSector(data.return_sector || "");
      setBaggage(data.baggage || "");
      setFlightNotes(data.flight_notes || "");

      setHotelCost(data.hotel_cost || "");
      setFlightCost(data.flight_cost || "");
      setVisaCost(data.visa_cost || "");
      setTransportCost(data.transport_cost || "");
      setZiyaratCost(data.ziyarat_cost || "");
      setOtherCost(data.other_cost || "");
      setAgentProfit(data.agent_profit || "");
      setTotalPrice(data.total_price || "");

      setDepositAmount(data.deposit_amount || "");
      setRemainingBalance(data.remaining_balance || "");
      setPaymentPlan(data.payment_plan || "");

      setNotes(data.notes || "");
      setBookingReference(data.booking_reference || "");

      setChecking(false);
      setLoading(false);
    }

    if (quotationId) loadPage();
  }, [quotationId, router]);

  useEffect(() => {
    const mk = Number(makkahNights || 0);
    const md = Number(madinahNights || 0);
    const total = mk + md;
    if (total > 0) setTotalNights(String(total));
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

    if (calc > 0) setTotalPrice(String(calc));
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

  async function handleUpdate(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setSaving(true);

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
      };

      const { error } = await supabase
        .from("quotations")
        .update(payload)
        .eq("id", quotationId);

      if (error) {
        setMsg({ type: "error", text: error.message || "Update failed." });
        setSaving(false);
        return;
      }

      router.push(`/agent/quotations/${quotationId}`);
    } catch (err) {
      setMsg({ type: "error", text: "Something went wrong while updating." });
      setSaving(false);
    }
  }

  if (checking || loading) {
    return <div style={styles.loadingWrap}>Loading quotation...</div>;
  }

  return (
    <main
      className="container"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 1100 }}>
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.title}>Edit Quotation</h1>
            <p style={styles.subtitle}>
              Update client, package, flight, hotel and pricing details.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

        <form onSubmit={handleUpdate}>
          <SectionTitle title="Client Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Client Name">
              <input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
            </Field>
            <Field label="Client Phone">
              <input className="input" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Client Email">
              <input className="input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </Field>
            <Field label="Departure City">
              <input className="input" value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 18 }}>
            <Field label="Adults">
              <input className="input" type="number" value={adults} onChange={(e) => setAdults(e.target.value)} />
            </Field>
            <Field label="Children">
              <input className="input" type="number" value={children} onChange={(e) => setChildren(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 24 }}>
            <Field label="Infants">
              <input className="input" type="number" value={infants} onChange={(e) => setInfants(e.target.value)} />
            </Field>
            <Field label="Booking Reference">
              <input className="input" value={bookingReference} onChange={(e) => setBookingReference(e.target.value)} />
            </Field>
          </div>

          <SectionTitle title="Package Basics" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Package Title">
              <input className="input" value={packageTitle} onChange={(e) => setPackageTitle(e.target.value)} />
            </Field>
            <Field label="Umrah Type">
              <input className="input" value={umrahType} onChange={(e) => setUmrahType(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Destination">
              <input className="input" value={destination} onChange={(e) => setDestination(e.target.value)} required />
            </Field>
            <Field label="Travel Date">
              <input className="input" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 18 }}>
            <Field label="Makkah Nights">
              <input className="input" type="number" value={makkahNights} onChange={(e) => setMakkahNights(e.target.value)} />
            </Field>
            <Field label="Madinah Nights">
              <input className="input" type="number" value={madinahNights} onChange={(e) => setMadinahNights(e.target.value)} />
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
                  <option style={styles.option} value="draft">Draft</option>
                  <option style={styles.option} value="sent">Sent</option>
                  <option style={styles.option} value="confirmed">Confirmed</option>
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
              <input className="input" value={makkahHotelName} onChange={(e) => setMakkahHotelName(e.target.value)} />
            </Field>
            <Field label="Makkah Hotel Rating">
              <input className="input" value={makkahHotelRating} onChange={(e) => setMakkahHotelRating(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Makkah Room Type">
              <input className="input" value={makkahRoomType} onChange={(e) => setMakkahRoomType(e.target.value)} />
            </Field>
            <Field label="Makkah Distance">
              <input className="input" value={makkahDistance} onChange={(e) => setMakkahDistance(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Madinah Hotel Name">
              <input className="input" value={madinahHotelName} onChange={(e) => setMadinahHotelName(e.target.value)} />
            </Field>
            <Field label="Madinah Hotel Rating">
              <input className="input" value={madinahHotelRating} onChange={(e) => setMadinahHotelRating(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 24 }}>
            <Field label="Madinah Room Type">
              <input className="input" value={madinahRoomType} onChange={(e) => setMadinahRoomType(e.target.value)} />
            </Field>
            <Field label="Madinah Distance">
              <input className="input" value={madinahDistance} onChange={(e) => setMadinahDistance(e.target.value)} />
            </Field>
          </div>

          <SectionTitle title="Flight Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Airline">
              <input className="input" value={airline} onChange={(e) => setAirline(e.target.value)} />
            </Field>
            <Field label="Baggage">
              <input className="input" value={baggage} onChange={(e) => setBaggage(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Outbound Sector">
              <input className="input" value={outboundSector} onChange={(e) => setOutboundSector(e.target.value)} />
            </Field>
            <Field label="Return Sector">
              <input className="input" value={returnSector} onChange={(e) => setReturnSector(e.target.value)} />
            </Field>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Field label="Flight Notes">
              <textarea className="input" rows={4} value={flightNotes} onChange={(e) => setFlightNotes(e.target.value)} />
            </Field>
          </div>

          <SectionTitle title="Pricing Breakdown" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Hotel Cost">
              <input className="input" value={hotelCost} onChange={(e) => setHotelCost(e.target.value)} />
            </Field>
            <Field label="Flight Cost">
              <input className="input" value={flightCost} onChange={(e) => setFlightCost(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Visa Cost">
              <input className="input" value={visaCost} onChange={(e) => setVisaCost(e.target.value)} />
            </Field>
            <Field label="Transport Cost">
              <input className="input" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Ziyarat Cost">
              <input className="input" value={ziyaratCost} onChange={(e) => setZiyaratCost(e.target.value)} />
            </Field>
            <Field label="Other Cost">
              <input className="input" value={otherCost} onChange={(e) => setOtherCost(e.target.value)} />
            </Field>
          </div>

          <div className="row" style={{ marginBottom: 18 }}>
            <Field label="Agent Profit">
              <input className="input" value={agentProfit} onChange={(e) => setAgentProfit(e.target.value)} />
            </Field>
            <Field label="Total Selling Price">
              <input className="input" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} required />
            </Field>
          </div>

          <SectionTitle title="Payment Details" />

          <div className="row" style={{ marginBottom: 14 }}>
            <Field label="Deposit Amount">
              <input className="input" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
            </Field>
            <Field label="Remaining Balance">
              <input className="input" value={remainingBalance} readOnly />
            </Field>
          </div>

          <div style={{ marginBottom: 18 }}>
            <Field label="Payment Plan">
              <input className="input" value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value)} />
            </Field>
          </div>

          <SectionTitle title="Notes" />

          <div style={{ marginBottom: 22 }}>
            <Field label="Internal / Client Notes">
              <textarea className="input" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
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
