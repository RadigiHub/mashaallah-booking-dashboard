export default function Dashboard() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "rgba(0,0,0,0.4)",
        padding: "40px",
        borderRadius: "14px",
        width: "600px",
        textAlign: "center"
      }}>
        <h1>MashaAllah Trips</h1>
        <h2>Agent Dashboard</h2>

        <p>Welcome to the internal Umrah booking system.</p>

        <div style={{marginTop:"30px",display:"grid",gap:"15px"}}>

          <button style={btn}>Create Umrah Package</button>

          <button style={btn}>Generate Client Quotation</button>

          <button style={btn}>View Bookings</button>

          <button style={btn}>Send WhatsApp Quote</button>

        </div>
      </div>
    </div>
  );
}

const btn = {
  padding:"14px",
  borderRadius:"8px",
  border:"none",
  background:"linear-gradient(90deg,#7b2ff7,#f107a3)",
  color:"white",
  fontSize:"16px",
  cursor:"pointer"
}
