
"use client";

import { useLanguage } from "./LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "sw" : "en")}
      aria-label="Change language"
    >
      {lang === "en" ? "SW" : "EN"}
    </button>
  );
}
