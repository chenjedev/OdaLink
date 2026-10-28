“use client”;

import { useEffect, useState } from “react”;
import Link from “next/link”;
import { usePathname, useRouter } from “next/navigation”;
import { supabase } from “../../../lib/supabase”;

function Sidebar() {
const router = useRouter();
const pathname = usePathname();
const [menuOpen, setMenuOpen] = useState(false);
const [lang, setLang] = useState(“en”);

useEffect(() => {
const saved = localStorage.getItem(“odLinkLanguage”);

if (saved === "en" || saved === "sw") {
  setLang(saved);
}
const syncLanguage = (event) => {
  const eventLang = event?.detail;
  if (eventLang === "en" || eventLang === "sw") {
    setLang(eventLang);
  } else {
    const current = localStorage.getItem("odLinkLanguage");
    if (current === "en" || current === "sw") {
      setLang(current);
    }
  }
};
window.addEventListener("odLinkLanguageChange", syncLanguage);
window.addEventListener("storage", syncLanguage);
return () => {
  window.removeEventListener("odLinkLanguageChange", syncLanguage);
  window.removeEventListener("storage", syncLanguage);
};

}, []);

function changeLanguage(next) {
localStorage.setItem(“odLinkLanguage”, next);
setLang(next);

window.dispatchEvent(
  new CustomEvent("odLinkLanguageChange", { detail: next })
);

}

async function handleLogout() {
setMenuOpen(false);
await supabase.auth.signOut();
router.push(”/login”);
}

const t = (en, sw) => (lang === “en” ? en : sw);

return (
<>
<button
className=“menu-btn”
onClick={() => setMenuOpen(!menuOpen)}
aria-label={t(“Open menu”, “Fungua menyu”)}
>
☰
    <Link
      href="/"
      className="brand"
      onClick={() => setMenuOpen(false)}
    >
      <span className="brand-mark">O</span>
      <span className="brand-name">OdaLink</span>
    </Link>
  </div>
  {menuOpen && (
    <div
      className="overlay"
      onClick={() => setMenuOpen(false)}
    />
  )}
  <div className={`dash-nav ${menuOpen ? "open" : ""}`}>
    <Link
      href="/"
      className="brand desktop-brand"
      onClick={() => setMenuOpen(false)}
    >
      <span className="brand-name">OdaLink</span>
    </Link>
    <button
      type="button"
      onClick={() => changeLanguage(lang === "en" ? "sw" : "en")}
      aria-label={t("Switch to Swahili", "Badili kwenda Kiingereza")}
      style={{
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "transparent",
        color: "inherit",
        margin: "8px 0",
      }}
    >
      {lang === "en" ? "English / Kiswahili" : "Kiswahili / English"}
    </button>
    <Link
      href="/dashboard"
      className={pathname === "/dashboard" ? "active" : ""}
      onClick={() => setMenuOpen(false)}
    >
      {t("Dashboard", "Dashibodi")}
    </Link>
    <Link
      href="/dashboard/products"
      className={pathname === "/dashboard/products" ? "active" : ""}
      onClick={() => setMenuOpen(false)}
    >
      {t("Products", "Bidhaa")}
    </Link>
    <Link
      href="/dashboard/orders"
      className={pathname === "/dashboard/orders" ? "active" : ""}
      onClick={() => setMenuOpen(false)}
    >
      {t("Orders", "Oda")}
    </Link>
    <Link
      href="/dashboard/settings"
      className={pathname === "/dashboard/settings" ? "active" : ""}
      onClick={() => setMenuOpen(false)}
    >
      {t("Settings", "Mipangilio")}
    </Link>
    <button
      type="button"
      className="logout-btn"
      onClick={handleLogout}
      style={{ color: "red" }}
    >
      {t("Logout", "Toka")}
    </button>
  </div>
</>

);
}

export default Sidebar;