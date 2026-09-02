import Link from "next/link";
import "./globals.css";

export default function RootLayout({children}: {children: React.ReactNode}) {
  return(
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="nav">
            <Link href="/" className="brand">
              <span className="brand-mark">O</span>
              <span className="brand-name">OrderWa</span>
            </Link>
            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/login" className="nav-login">Login</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}