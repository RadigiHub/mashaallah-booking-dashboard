export default function Home() {
  return (
    <main className="container">
      <div className="card" style={{marginTop: 30}}>
        <h1 style={{margin: 0, fontSize: 28}}>MashaAllah Trips — Agent Dashboard</h1>
        <p style={{color: "var(--muted)", marginTop: 10, lineHeight: 1.6}}>
          Welcome. Please continue to the agent login to create Umrah packages and send quotations.
        </p>

        <div style={{display:"flex", gap:12, marginTop:16, flexWrap:"wrap"}}>
          <a className="btn" href="/agent/login">Go to Agent Login</a>
        </div>

        <div style={{marginTop: 16, fontSize: 12, color: "var(--muted)"}}>
          Note: This is a secure internal dashboard. If you reached here by mistake, please close this tab.
        </div>
      </div>
    </main>
  );
}
