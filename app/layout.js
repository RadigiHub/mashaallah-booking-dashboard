export const metadata = {
  title: "MashaAllah Trips | Booking Dashboard",
  description: "Agent dashboard and booking tracking portal"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>{children}</body>
    </html>
  );
}
