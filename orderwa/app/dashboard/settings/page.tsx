
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Shop = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  payment_method: string | null;
  payment_number: string | null;
  payment_name: string | null;
};

type Lang = "en" | "sw";

export default function SettingsPage() {
  const router = useRouter();

  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [paymentName, setPaymentName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const t = (en: string, sw: string) =>
    lang === "en" ? en : sw;

  useEffect(() => {
    function syncLanguage(event?: Event) {
      const customEvent = event as CustomEvent<Lang> | undefined;
      const eventLang = customEvent?.detail;
      const storedLang = localStorage.getItem("odLinkLanguage");

      const nextLang =
        eventLang === "en" || eventLang === "sw"
          ? eventLang
          : storedLang === "en" || storedLang === "sw"
            ? storedLang
            : "en";

      setLang(nextLang);
    }

    syncLanguage();

    window.addEventListener("odLinkLanguageChange", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener("odLinkLanguageChange", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: shopErr } = await supabase
        .from("shops")
        .select(
          "id, name, slug, phone, payment_method, payment_number, payment_name"
        )
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopErr) {
        console.error("Load shop failed:", shopErr.message);
        setError(
          "Could not load your shop. Please refresh and try again."
        );
      }

      if (data) {
        const s = data as Shop;

        setShop(s);
        setName(s.name ?? "");
        setPhone(s.phone ?? "");

        setPaymentMethod(s.payment_method ?? "");
        setPaymentNumber(s.payment_number ?? "");
        setPaymentName(s.payment_name ?? "");
      }

      setLoading(false);
    }

    load();
  }, [router]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk =
    phoneDigits.length >= 9 && phoneDigits.length <= 15;

  const paymentNumberDigits = paymentNumber.replace(/\D/g, "");
  const paymentNumberOk =
    paymentNumberDigits.length >= 9 &&
    paymentNumberDigits.length <= 15;

  const paymentEnabled = paymentMethod !== "";

  const paymentValid =
    !paymentEnabled ||
    (paymentNumberOk && paymentName.trim().length >= 2);

  const isInvalid =
    name.trim().length < 2 || !phoneOk || !paymentValid;

  const unchanged =
    !!shop &&
    name.trim() === (shop.name ?? "") &&
    phone.trim() === (shop.phone ?? "") &&
    paymentMethod === (shop.payment_method ?? "") &&
    paymentNumber.trim() === (shop.payment_number ?? "") &&
    paymentName.trim() === (shop.payment_name ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!shop) return;

    setError("");
    setSaved(false);

    if (name.trim().length < 2 || !phoneOk) {
      setError(
        t(
          "Enter a shop name and a valid WhatsApp number.",
          "Weka jina la duka na namba sahihi ya WhatsApp."
        )
      );
      return;
    }

    if (paymentEnabled && !paymentNumberOk) {
      setError(
        t(
          "Enter a valid payment number containing 9 to 15 digits.",
          "Weka namba sahihi ya malipo yenye tarakimu 9 hadi 15."
        )
      );
      return;
    }

    if (paymentEnabled && paymentName.trim().length < 2) {
      setError(
        t(
          "Enter the name of the payment recipient.",
          "Weka jina la mpokeaji wa malipo."
        )
      );
      return;
    }

    setSaving(true);

    const { data, error: updateErr } = await supabase
      .from("shops")
      .update({
        name: name.trim(),
        phone: phone.trim(),
        payment_method: paymentMethod || null,
        payment_number: paymentNumber.trim() || null,
        payment_name: paymentName.trim() || null,
      })
      .eq("id", shop.id)
      .select(
        "id, name, slug, phone, payment_method, payment_number, payment_name"
      );

    setSaving(false);

    if (updateErr) {
      console.error("Update shop failed:", updateErr.message);

      setError(
        t(
          "Could not save your changes. Please try again.",
          "Imeshindwa kuhifadhi mabadiliko yako. Tafadhali jaribu tena."
        )
      );
      return;
    }

    if (!data || data.length === 0) {
      setError(
        t(
          "Nothing was saved. Check the update policy on the shops table.",
          "Hakuna kilichohifadhiwa. Kagua ruhusa za kusasisha taarifa kwenye jedwali la shops."
        )
      );
      return;
    }

    const updated = data[0] as Shop;

    setShop(updated);
    setName(updated.name ?? "");
    setPhone(updated.phone ?? "");

    setPaymentMethod(updated.payment_method ?? "");
    setPaymentNumber(updated.payment_number ?? "");
    setPaymentName(updated.payment_name ?? "");

    setSaved(true);
  }

  if (loading) {
    return (
      <p>{t("Loading settings...", "Inapakia mipangilio...")}</p>
    );
  }

  if (!shop) {
    return (
      <div className="products-page">
        <div className="product-header">
          <h2>{t("Settings", "Mipangilio")}</h2>
        </div>

        <p style={{ color: "#dc2626" }}>
          {error ||
            t(
              "No shop found for this account.",
              "Hakuna duka lililopatikana kwenye akaunti hii."
            )}
        </p>
      </div>
    );
  }

  return (
    <div
      className="products-page"
      style={{
        padding: "12px",
        maxWidth: 520,
        boxSizing: "border-box",
      }}
    >
      <div className="product-header" style={{ marginBottom: "16px" }}>
        <h2>{t("Settings", "Mipangilio")}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t("Shop name", "Jina la duka")}</label>

          <input
            type="text"
            placeholder={t("eg. Irene Fashion", "mf. Irene Fashion")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            maxLength={40}
            required
          />
        </div>

        <div className="form-group">
          <label>{t("WhatsApp number", "Namba ya WhatsApp")}</label>

          <input
            type="tel"
            placeholder={t("eg. 0712345678", "mf. 0712345678")}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSaved(false);
            }}
            required
          />

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              margin: "6px 0 0",
            }}
          >
            {t(
              "Customers send their orders to this number on WhatsApp. Use a number that has WhatsApp.",
              "Wateja watatuma oda zao kupitia WhatsApp kwenye namba hii. Tumia namba yenye akaunti ya WhatsApp."
            )}
          </p>
        </div>

        <div className="form-group">
          <label>{t("Shop link name", "Jina la kiungo cha duka")}</label>

          <input type="text" value={shop.slug} readOnly disabled />

          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              margin: "6px 0 0",
            }}
          >
            {t(
              "This cannot be changed, because customers already have links that use it.",
              "Jina hili haliwezi kubadilishwa kwa sababu wateja tayari wanatumia viungo vinavyolitumia."
            )}
          </p>
        </div>

        <hr style={{ margin: "24px 0", borderColor: "#e5e7eb" }} />

        <div className="product-header" style={{ marginBottom: "16px" }}>
          <h3>{t("Payment settings", "Mipangilio ya malipo")}</h3>
        </div>

        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            marginBottom: 16,
          }}
        >
          {t(
            "Set up the mobile money account customers should use to pay your shop.",
            "Weka taarifa za akaunti ya simu ambayo wateja watatumia kulipia bidhaa za duka lako."
          )}
        </p>

        <div className="form-group">
          <label>{t("Payment method", "Njia ya malipo")}</label>

          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setSaved(false);
            }}
          >
            <option value="">
              {t("Not configured", "Haijawekwa")}
            </option>
            <option value="mpesa">M-Pesa</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="tigopesa">Tigo Pesa</option>
          </select>
        </div>

        {paymentEnabled && (
          <>
            <div className="form-group">
              <label>
                {t(
                  "Lipa Namba / Payment number",
                  "Lipa Namba / Namba ya malipo"
                )}
              </label>

              <input
                type="tel"
                placeholder={t(
                  "Enter business or mobile number",
                  "Weka namba ya biashara au simu"
                )}
                value={paymentNumber}
                onChange={(e) => {
                  setPaymentNumber(e.target.value);
                  setSaved(false);
                }}
                required
              />

              <p
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  margin: "6px 0 0",
                }}
              >
                {t(
                  "Enter the number customers should use to pay.",
                  "Weka namba ambayo wateja wanapaswa kutumia kulipia."
                )}
              </p>
            </div>

            <div className="form-group">
              <label>
                {t("Recipient name", "Jina la mpokeaji")}
              </label>

              <input
                type="text"
                placeholder={t(
                  "Name registered to the account",
                  "Jina lililosajiliwa kwenye akaunti"
                )}
                value={paymentName}
                onChange={(e) => {
                  setPaymentName(e.target.value);
                  setSaved(false);
                }}
                maxLength={80}
                required
              />
            </div>
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        {saved && (
          <p style={{ color: "#16a34a", fontWeight: 600 }}>
            {t(
              "Changes saved successfully.",
              "Mabadiliko yamehifadhiwa kikamilifu."
            )}
          </p>
        )}

        <div className="form-group">
          <button
            type="submit"
            className="save-btn"
            disabled={isInvalid || saving || unchanged}
          >
            {saving
              ? t("Saving...", "Inahifadhi...")
              : t("Save changes", "Hifadhi mabadiliko")}
          </button>
        </div>
      </form>
    </div>
  );
}
