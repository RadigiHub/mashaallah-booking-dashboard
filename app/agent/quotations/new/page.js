"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function NewQuotationPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [agentEmail, setAgentEmail] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);

    try {
      const { error } = await supabase.from("quotations").insert([
        {
          client_name: clientName,
          client_phone: clientPhone,
          destination: destination,
          travel_date: travelDate,
          total_price: totalPrice,
          created_by: agentEmail,
        },
      ]);

      if (error) {
        setMsg({
          type: "error",
          text: error.message || "Failed to save quotation.",
        });
        return;
      }

      setMsg({
        type: "success",
        text: "Quotation saved successfully.",
      });

      setClientName("");
      setClientPhone("");
      setDestination("");
      setTravelDate("");
      setTotalPrice("");
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
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(1200px 700px at 15% 20%, rgba(123,47,247,0.35), transparent 55%), radial-gradient(900px 600px at 85% 30%, rgba(241,7,163,0.25), transparent 55%), radial-gradient(700px 500px at 50% 95%, rgba(0,255,200,0.10), transparent 60%), #070712",
          color: "white",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <main
      className="container"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 720 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 32 }}>New Client Quotation</h1>
            <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
              Add client travel details and save quotation in the system.
            </p>
          </div>

          <a href="/agent/dashboard" className="btn">
            ← Back to Dashboard
          </a>
        </div>

        {msg.text ? (
          <div
            style={{
              marginBottom: 14,
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
          <div className="row" style={{ marginBottom: 14 }}>
            <div>
              <div className="label">Client Name</div>
              <input
                className="input"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>

            <div>
              <div className="label">Client Phone</div>
              <input
                className="input"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+44..."
                required
              />
            </div>
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <div>
              <div className="label">Destination</div>
              <input
                className="input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Makkah / Madinah"
                required
              />
            </div>

            <div>
              <div className="label">Travel Date</div>
              <input
                className="input"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                placeholder="e.g. 15 Ramadan / 2026-03-20"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="label">Total Price</div>
            <input
              className="input"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="£999"
              required
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? "none" : "auto",
            }}
          >
            {loading ? "Saving..." : "Save Quotation"}
          </button>
        </form>
      </div>
    </main>
  );
}
