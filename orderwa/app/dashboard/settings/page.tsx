"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Shop = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
};

type PaymentMethod = {
  id: string;
  shop_id: string;
  method: string;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  is_enabled: boolean;
  created_at: string;
};

type Lang = "en" | "sw";

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa (Vodacom)", color: "#e60000", mark: "M" },
  { value: "airtel_money", label: "Airtel Money", color: "#ed1c24", mark: "A" },
  { value: "tigopesa", label: "Tigo Pesa", color: "#0b3a8f", mark: "T" },
  { value: "halopesa", label: "HaloPesa", color: "#f58220", mark: "H" },
  { value: "selcom", label: "Selcom", color: "#00a651", mark: "S" },
  { value: "bank", label: "Bank transfer", color: "#1f2937", mark: "B" },
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
};

const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600 as const,
};

const styles = `
.sp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.sp-head h3 { margin: 0; }
.sp-round {
  flex: none;
  width: 40px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  font-size: 22px;
  line-height: 1;
  color: #0f172a;
  cursor: pointer;
}

.sp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
}
.sp-empty-icon {
  width: 56px;
  height: 38px;
  border: 4px solid #cbd5e1;
  border-radius: 8px;
  position: relative;
}
.sp-empty-icon::after {
  content: "";
  position: absolute;
  left: 0; right: 0; top: 8px;
  height: 4px;
  background: #cbd5e1;
}
.sp-primary {
  padding: 12px 20px;
  border: 0;
  border-radius: 12px;
  background: #0f766e;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.sp-primary:disabled { background: #94c8c1; cursor: not-allowed; }

.sp-logo {
  flex: none;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
}

.sp-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  background: #fff;
}
.sp-card-top { display: flex; align-items: center; gap: 12px; }
.sp-card-top strong { display: block; }
.sp-card-top small { color: #64748b; }
.sp-badge {
  margin-left: auto;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.sp-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
}
.sp-sheet {
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  max-height: 92dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 18px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  color: #0f172a;
}
@media (min-width: 640px) {
  .sp-overlay { align-items: center; padding: 16px; }
  .sp-sheet { border-radius: 18px; }
}
.sp-sheet-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.sp-sheet-head h4 { flex: 1; margin: 0; font-size: 18px; }
.sp-icon-btn {
  flex: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #334155;
  font-size: 16px;
  cursor: pointer;
}

.sp-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  color: inherit;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.sp-option:active { background: #f8fafc; }
.sp-option span.sp-name { flex: 1; }
.sp-plus {
  flex: none;
  width: 38px;
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: #f8fafc;
}

.sp-field { margin-bottom: 14px; }
.sp-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.sp-field input[type="text"] {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 16px;
  outline: none;
}
.sp-field input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}
.sp-check { display: flex; align-items: center; gap: 10px; margin: 6px 0 18px; }
.sp-error { margin: 0 0 12px; color: #dc2626; font-size: 14px; }
.sp-save-full { width: 100%; }
`;

export default function ShopSettings() {
  const router = useRouter();

  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<"picker" | "form" | null>(null);

  const [method, setMethod] = useState("mpesa");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

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

  // Stop the page behind the sheet from scrolling
  useEffect(() => {
    if (!sheet) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheet]);

  async function loadPaymentMethods(shopId: string) {
    const { data, error: methodsError } = await supabase
      .from("shop_payment_methods")
      .select(
        "id, shop_id, method, account_name, account_number, bank_name, is_enabled, created_at"
      )
      .eq("shop_id", shopId)
      .order("created_at", { ascending: true });

    if (methodsError) {
      console.error("Load payment methods failed:", methodsError.message);
      setError(
        t(
          "Could not load payment methods.",
          "Imeshindwa kupakia njia za malipo."
        )
      );
      return;
    }

    setMethods((data ?? []) as PaymentMethod[]);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error: shopError } = await supabase
        .from("shops")
        .select("id, name, slug, phone")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (shopError) {
        console.error("Load shop failed:", shopError.message);
        setError(
          t(
            "Could not load your shop. Please refresh and try again.",
            "Imeshindwa kupakia duka lako. Tafadhali jaribu tena."
          )
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const currentShop = data as Shop;
      setShop(currentShop);
      setName(currentShop.name ?? "");
      setPhone(currentShop.phone ?? "");

      await loadPaymentMethods(currentShop.id);

      if (!cancelled) setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = phoneDigits.length >= 9 && phoneDigits.length <= 15;

  const accountDigits = accountNumber.replace(/\D/g, "");
  const accountNumberOk =
    accountDigits.length >= 5 && accountDigits.length <= 30;

  const paymentFormValid =
    accountName.trim().length >= 2 &&
    accountNumberOk &&
    (method !== "bank" || bankName.trim().length >= 2);

  const shopDetailsUnchanged =
    !!shop &&
    name.trim() === shop.name &&
    phone.trim() === (shop.phone ?? "");

  function optionFor(value: string) {
    return (
      PAYMENT_OPTIONS.find((option) => option.value === value) ?? {
        value,
        label: value,
        color: "#64748b",
        mark: value.charAt(0).toUpperCase(),
      }
    );
  }

  function clearPaymentForm() {
    setEditingId(null);
    setMethod("mpesa");
    setAccountName("");
    setAccountNumber("");
    setBankName("");
    setIsEnabled(true);
  }

  function closeSheet() {
    clearPaymentForm();
    setSheet(null);
    setError("");
  }

  function openPicker() {
    clearPaymentForm();
    setError("");
    setSaved(false);
    setSheet("picker");
  }

  function chooseProvider(value: string) {
    setMethod(value);
    setError("");
    setSheet("form");
  }

  function editPaymentMethod(item: PaymentMethod) {
    setEditingId(item.id);
    setMethod(item.method);
    setAccountName(item.account_name);
    setAccountNumber(item.account_number);
    setBankName(item.bank_name ?? "");
    setIsEnabled(item.is_enabled);
    setError("");
    setSaved(false);
    setSheet("form");
  }

  async function handleShopSubmit(e: FormEvent) {
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

    setSaving(true);

    const { data, error: updateError } = await supabase
      .from("shops")
      .update({
        name: name.trim(),
        phone: phone.trim(),
      })
      .eq("id", shop.id)
      .select("id, name, slug, phone");

    setSaving(false);

    if (updateError) {
      console.error("Update shop failed:", updateError.message);
      setError(
        t(
          "Could not save shop settings. Please try again.",
          "Imeshindwa kuhifadhi mipangilio ya duka. Tafadhali jaribu tena."
        )
      );
      return;
    }

    if (!data || data.length === 0) {
      setError(
        t(
          "No changes were saved. Check your shop update permissions.",
          "Mabadiliko hayakuhifadhiwa. Kagua ruhusa za kubadilisha taarifa za duka."
        )
      );
      return;
    }

    const updated = data[0] as Shop;
    setShop(updated);
    setName(updated.name);
    setPhone(updated.phone ?? "");
    setSaved(true);
  }

  async function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();

    if (!shop) return;

    setError("");
    setSaved(false);

    if (!paymentFormValid) {
      setError(
        t(
          "Complete the payment details correctly.",
          "Jaza taarifa za malipo kwa usahihi."
        )
      );
      return;
    }

    setSaving(true);

    const payload = {
      shop_id: shop.id,
      method,
      account_name: accountName.trim(),
      account_number: accountNumber.trim(),
      bank_name: method === "bank" ? bankName.trim() : null,
      is_enabled: isEnabled,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from("shop_payment_methods")
        .update(payload)
        .eq("id", editingId)
        .eq("shop_id", shop.id)
        .select(
          "id, shop_id, method, account_name, account_number, bank_name, is_enabled, created_at"
        );

      setSaving(false);

      if (updateError || !data || data.length === 0) {
        console.error("Update payment method failed:", updateError?.message);
        setError(
          t(
            "Could not update this payment method.",
            "Imeshindwa kubadilisha njia hii ya malipo."
          )
        );
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("shop_payment_methods")
        .insert(payload)
        .select(
          "id, shop_id, method, account_name, account_number, bank_name, is_enabled, created_at"
        );

      setSaving(false);

      if (insertError || !data || data.length === 0) {
        console.error("Add payment method failed:", insertError?.message);
        setError(
          t(
            "Could not add this payment method. Please try again.",
            "Imeshindwa kuongeza njia hii ya malipo. Tafadhali jaribu tena."
          )
        );
        return;
      }
    }

    await loadPaymentMethods(shop.id);
    closeSheet();
    setSaved(true);
  }

  async function togglePaymentMethod(item: PaymentMethod) {
    if (!shop) return;

    setError("");
    setSaved(false);

    const { data, error: updateError } = await supabase
      .from("shop_payment_methods")
      .update({
        is_enabled: !item.is_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("shop_id", shop.id)
      .select("id");

    if (updateError || !data || data.length === 0) {
      console.error("Toggle payment method failed:", updateError?.message);
      setError(
        t(
          "Could not change this payment method.",
          "Imeshindwa kubadilisha hali ya njia hii ya malipo."
        )
      );
      return;
    }

    await loadPaymentMethods(shop.id);
  }

  async function deletePaymentMethod(item: PaymentMethod) {
    if (!shop) return;

    const confirmed = window.confirm(
      t(
        "Delete this payment method? This cannot be undone.",
        "Ufute njia hii ya malipo? Huwezi kurudisha kitendo hiki."
      )
    );

    if (!confirmed) return;

    setError("");
    setSaved(false);
    setDeletingId(item.id);

    const { data, error: deleteError } = await supabase
      .from("shop_payment_methods")
      .delete()
      .eq("id", item.id)
      .eq("shop_id", shop.id)
      .select("id");

    setDeletingId(null);

    if (deleteError || !data || data.length === 0) {
      console.error("Delete payment method failed:", deleteError?.message);
      setError(
        t(
          "Could not delete this payment method.",
          "Imeshindwa kufuta njia hii ya malipo."
        )
      );
      return;
    }

    setMethods((current) => current.filter((m) => m.id !== item.id));
  }

  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        {t("Loading settings...", "Inapakia mipangilio...")}
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ padding: 12 }}>
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

  const current = optionFor(method);

  return (
    <div
      style={{
        maxWidth: 560,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <style>{styles}</style>

      {error && !sheet && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleShopSubmit}>
        <div className="form-group">
          <label>{t("Shop name", "Jina la duka")}</label>
          <input
            style={inputStyle}
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
            style={inputStyle}
            type="tel"
            placeholder={t("eg. 0712345678", "mf. 0712345678")}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSaved(false);
            }}
            required
          />
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
            {t(
              "Customers send their orders to this number on WhatsApp.",
              "Wateja hutuma oda zao kupitia WhatsApp kwenye namba hii."
            )}
          </p>
        </div>

        <div className="form-group">
          <label>{t("Shop link name", "Jina la kiungo cha duka")}</label>
          <input
            style={inputStyle}
            type="text"
            value={`https://odalink.vercel.app/store/${shop.slug}`}
            readOnly
            disabled
          />
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>
            {t(
              "This link name cannot be changed here.",
              "Jina hili la kiungo haliwezi kubadilishwa hapa."
            )}
          </p>
        </div>

        <button
          type="submit"
          className="save-btn"
          disabled={
            saving ||
            !phoneOk ||
            name.trim().length < 2 ||
            shopDetailsUnchanged
          }
          style={{ marginTop: 8 }}
        >
          {saving && !sheet
            ? t("Saving...", "Inahifadhi...")
            : t("Save shop settings", "Hifadhi mipangilio ya duka")}
        </button>
      </form>

      <hr style={{ margin: "28px 0", borderColor: "#e5e7eb" }} />

      {/* ---------- Payment methods ---------- */}
      <div className="sp-head">
        <h3>{t("Payment methods", "Njia za malipo")}</h3>

        {methods.length > 0 && (
          <button
            type="button"
            className="sp-round"
            onClick={openPicker}
            aria-label={t("Add payment method", "Ongeza njia ya malipo")}
          >
            +
          </button>
        )}
      </div>

      {saved && (
        <p style={{ color: "#16a34a", fontWeight: 600 }}>
          {t(
            "Changes saved successfully.",
            "Mabadiliko yamehifadhiwa kikamilifu."
          )}
        </p>
      )}

      {methods.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon" />
          <span>
            {t(
              "No payment methods available",
              "Bado hujaongeza njia za malipo"
            )}
          </span>
          <button type="button" className="sp-primary" onClick={openPicker}>
            {t("Add payment method", "Ongeza njia ya malipo")}
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {methods.map((item) => {
            const opt = optionFor(item.method);

            return (
              <div key={item.id} className="sp-card">
                <div className="sp-card-top">
                  <span className="sp-logo" style={{ background: opt.color }}>
                    {opt.mark}
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <strong>{opt.label}</strong>
                    <small>
                      {item.method === "bank" && item.bank_name
                        ? `${item.bank_name} · `
                        : ""}
                      {item.account_number}
                    </small>
                  </div>

                  <span
                    className="sp-badge"
                    style={{
                      background: item.is_enabled ? "#dcfce7" : "#f3f4f6",
                      color: item.is_enabled ? "#166534" : "#4b5563",
                    }}
                  >
                    {item.is_enabled
                      ? t("Enabled", "Imewashwa")
                      : t("Disabled", "Imezimwa")}
                  </span>
                </div>

                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14,
                    color: "#475569",
                    overflowWrap: "anywhere",
                  }}
                >
                  {t("Account name", "Jina la akaunti")}: {item.account_name}
                </p>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => editPaymentMethod(item)}
                    style={{
                      ...buttonStyle,
                      background: "#e5e7eb",
                      color: "#111827",
                    }}
                  >
                    {t("Edit", "Hariri")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void togglePaymentMethod(item)}
                    style={{
                      ...buttonStyle,
                      background: item.is_enabled ? "#fef3c7" : "#dcfce7",
                      color: "#111827",
                    }}
                  >
                    {item.is_enabled
                      ? t("Disable", "Zima")
                      : t("Enable", "Washa")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void deletePaymentMethod(item)}
                    disabled={deletingId === item.id}
                    style={{
                      ...buttonStyle,
                      background: "#fee2e2",
                      color: "#991b1b",
                      opacity: deletingId === item.id ? 0.6 : 1,
                    }}
                  >
                    {deletingId === item.id
                      ? t("Deleting...", "Inafuta...")
                      : t("Delete", "Futa")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Step 1: choose a provider ---------- */}
      {sheet === "picker" && (
        <div className="sp-overlay" onClick={closeSheet}>
          <div
            className="sp-sheet"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sp-sheet-head">
              <h4>{t("Add payment method", "Ongeza njia ya malipo")}</h4>
              <button
                type="button"
                className="sp-icon-btn"
                onClick={closeSheet}
                aria-label={t("Close", "Funga")}
              >
                ✕
              </button>
            </div>

            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="sp-option"
                onClick={() => chooseProvider(option.value)}
              >
                <span className="sp-logo" style={{ background: option.color }}>
                  {option.mark}
                </span>
                <span className="sp-name">{option.label}</span>
                <span className="sp-plus">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Step 2: fill in the details ---------- */}
      {sheet === "form" && (
        <div className="sp-overlay" onClick={closeSheet}>
          <div
            className="sp-sheet"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handlePaymentSubmit}>
              <div className="sp-sheet-head">
                {!editingId && (
                  <button
                    type="button"
                    className="sp-icon-btn"
                    onClick={() => setSheet("picker")}
                    aria-label={t("Back", "Rudi")}
                  >
                    ‹
                  </button>
                )}

                <span className="sp-logo" style={{ background: current.color }}>
                  {current.mark}
                </span>

                <h4>{current.label}</h4>

                <button
                  type="button"
                  className="sp-icon-btn"
                  onClick={closeSheet}
                  aria-label={t("Close", "Funga")}
                >
                  ✕
                </button>
              </div>

              {method === "bank" && (
                <div className="sp-field">
                  <label>{t("Bank name", "Jina la benki")}</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder={t("Enter bank name", "Weka jina la benki")}
                    required
                  />
                </div>
              )}

              <div className="sp-field">
                <label>
                  {t("Account / recipient name", "Jina la akaunti / mpokeaji")}
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={t(
                    "Name registered to the account",
                    "Jina lililosajiliwa kwenye akaunti"
                  )}
                  maxLength={100}
                  required
                />
              </div>

              <div className="sp-field">
                <label>
                  {method === "bank"
                    ? t("Account number", "Namba ya akaunti")
                    : method === "selcom"
                      ? t("Selcom number / Till", "Namba ya Selcom / Till")
                      : t(
                          "Lipa Namba / Phone number",
                          "Lipa Namba / Namba ya simu"
                        )}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={t(
                    "Enter account or payment number",
                    "Weka namba ya akaunti au malipo"
                  )}
                  maxLength={50}
                  required
                />
              </div>

              <label className="sp-check">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
                <span>{t("Available to customers", "Ionekane kwa wateja")}</span>
              </label>

              {error && <p className="sp-error">{error}</p>}

              <button
                type="submit"
                className="sp-primary sp-save-full"
                disabled={saving || !paymentFormValid}
              >
                {saving
                  ? t("Saving...", "Inahifadhi...")
                  : editingId
                    ? t("Update method", "Sasisha njia")
                    : t("Save", "Hifadhi")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
