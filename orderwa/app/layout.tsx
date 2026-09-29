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
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="nav-login">Start free</Link>
              
            </nav>
          </div>
        </header>
        <main>{children}</main>

        <footer className="footer">
                <div className="footer-inner">
                  <div className="footer-brand">
                    <span className="brand-mark">O</span>
                    <span className="brand-name">OrderWa</span>
                  </div>
                  <p className="footer-tag">WhatsApp orders, organized.</p>
                  <div className="footer-links">
                    <Link href="/login">Login</Link>
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/store/demo">Demo store</Link>
                  </div>
                  <p className="footer-copy">© 2026 OrderWa. All rights reserved.</p>
                </div>
              </footer>
      </body>
    </html>
  );
}