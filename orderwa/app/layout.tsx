import Link from "next/link";
import "./globals.css";
export default function RootLayout({children}) {
  return(
    <html>
      <body>

            <nav className="nav">
                <Link href="/">Home</Link>
                <Link href="/login">Login</Link>
                <Link href="/dashboard">Dashboard</Link>
            </nav>

            <main>{children}</main>

            <footer className="footer">2026 OrderWa</footer>
      </body>
      </html>
  );
}