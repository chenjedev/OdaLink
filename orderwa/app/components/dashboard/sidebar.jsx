"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Sidebar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile top: ☰ + OdaLink */}
      <div className="mobile-top">
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          ☰
        </button>
        <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">O</span>
          <span className="brand-name">OdaLink</span>
        </Link>
      </div>

      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )}

      <div className={`dash-nav ${menuOpen ? "open" : ""}`}>
        <Link
          href="/"
          className="brand desktop-brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-mark">O</span>
          <span className="brand-name">OdaLink</span>
        </Link>

        <Link
          href="/dashboard"
          className={pathname === "/dashboard" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/products"
          className={pathname === "/dashboard/products" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Products
        </Link>
        <Link
          href="/dashboard/orders"
          className={pathname === "/dashboard/orders" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Orders
        </Link>
      </div>
    </>
  );
}

export default Sidebar;