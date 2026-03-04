import "./globals.css";

export const metadata = {
  title: "MashaAllah Trips | Agent Dashboard",
  description: "Agent dashboard for creating Umrah packages and booking tracking."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
