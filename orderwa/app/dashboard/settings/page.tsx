
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

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
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "tigopesa", label: "Tigo Pesa" },
  { value: "halopesa", label: "HaloPesa" },
  { value: "selcom", label: "Selcom" },
  { value: "bank", label: "Bank / Benki" },
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

export default function SettingsPage() {
  const router = useRouter();

  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

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

    load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk =
    phoneDigits.length >= 9 && phoneDigits.length <= 15;

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

  function resetPaymentForm() {
    setEditingId(null);
    setMethod("mpesa");
    setAccountName("");
    setAccountNumber("");
    setBankName("");
    setIsEnabled(true);
    setError("");
    setSaved(false);
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

    window.scrollTo({ top: 0, behavior: "smooth" });
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
    resetPaymentForm();
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

    if (editingId === item.id) resetPaymentForm();
  }

  function methodLabel(value: string) {
    return (
      PAYMENT_OPTIONS.find((option) => option.value === value)?.label ??
      value
    );
  }

  if (loading) {
    return (
      <div className="products-page" style={{ padding: 12 }}>
        {t("Loading settings...", "Inapakia mipangilio...")}
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="products-page" style={{ padding: 12 }}>
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
        padding: 12,
        maxWidth: 560,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div className="product-header" style={{ marginBottom: 16 }}>
        <h2>{t("Settings", "Mipangilio")}</h2>
      </div>

      {error && (
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
            value={shop.slug}
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
          {saving
            ? t("Saving...", "Inahifadhi...")
            : t("Save shop settings", "Hifadhi mipangilio ya duka")}
        </button>
      </form>

      <hr style={{ margin: "28px 0", borderColor: "#e5e7eb" }} />

      <div className="product-header" style={{ marginBottom: 12 }}>
        <h3>{t("Payment methods", "Njia za malipo")}</h3>
      </div>

      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
        {t(
          "Add as many payment methods as your shop needs. Each method keeps its own account details.",
          "Ongeza njia za malipo unazohitaji. Kila njia ina taarifa zake tofauti za akaunti."
        )}
      </p>

      <form
        onSubmit={handlePaymentSubmit}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
        }}
      >
        <h4 style={{ marginTop: 0, marginBottom: 16 }}>
          {editingId
            ? t("Edit payment method", "Hariri njia ya malipo")
            : t("Add payment method", "Ongeza njia ya malipo")}
        </h4>

        <div className="form-group">
          <label>{t("Payment provider", "Mtoa huduma wa malipo")}</label>
          <select
            style={inputStyle}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            required
          >
            {PAYMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {method === "bank" && (
          <div className="form-group">
            <label>{t("Bank name", "Jina la benki")}</label>
            <input
              style={inputStyle}
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder={t("Enter bank name", "Weka jina la benki")}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>{t("Account / recipient name", "Jina la akaunti / mpokeaji")}</label>
          <input
            style={inputStyle}
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

        <div className="form-group">
          <label>
            {method === "bank"
              ? t("Account number", "Namba ya akaunti")
              : method === "selcom"
                ? t("Selcom number / Till", "Namba ya Selcom / Till")
                : t("Lipa Namba / Phone number", "Lipa Namba / Namba ya simu")}
          </label>
          <input
            style={inputStyle}
            type="text"
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

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "16px 0",
          }}
        >
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          <span>
            {t(
              "Available to customers",
              "Ionekane kwa wateja"
            )}
          </span>
        </label>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="submit"
            className="save-btn"
            disabled={saving || !paymentFormValid}
            style={{
              ...buttonStyle,
              color: "#fff",
              opacity: saving || !paymentFormValid ? 0.6 : 1,
            }}
          >
            {saving
              ? t("Saving...", "Inahifadhi...")
              : editingId
                ? t("Update method", "Sasisha njia")
                : t("Add method", "Ongeza njia")}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetPaymentForm}
              style={{
                ...buttonStyle,
                background: "#e5e7eb",
                color: "#111827",
              }}
            >
              {t("Cancel", "Ghairi")}
            </button>
          )}
        </div>
      </form>

      {saved && (
        <p style={{ color: "#16a34a", fontWeight: 600 }}>
          {t(
            "Changes saved successfully.",
            "Mabadiliko yamehifadhiwa kikamilifu."
          )}
        </p>
      )}

      <h4 style={{ marginBottom: 12 }}>
        {t("Your payment methods", "Njia zako za malipo")}
      </h4>

      {methods.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          {t(
            "No payment methods added yet.",
            "Bado hujaongeza njia za malipo."
          )}
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {methods.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 14,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>{methodLabel(item.method)}</strong>

                  <p style={{ margin: "8px 0 4px", overflowWrap: "anywhere" }}>
                    {t("Account name", "Jina la akaunti")}: {item.account_name}
                  </p>

                  <p style={{ margin: "4px 0", overflowWrap: "anywhere" }}>
                    {t("Number", "Namba")}: {item.account_number}
                  </p>

                  {item.method === "bank" && item.bank_name && (
                    <p style={{ margin: "4px 0" }}>
                      {t("Bank", "Benki")}: {item.bank_name}
                    </p>
                  )}

                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      background: item.is_enabled ? "#dcfce7" : "#f3f4f6",
                      color: item.is_enabled ? "#166534" : "#4b5563",
                    }}
                  >
                    {item.is_enabled
                      ? t("Enabled", "Imewashwa")
                      : t("Disabled", "Imezimwa")}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 14,
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
                  onClick={() => togglePaymentMethod(item)}
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
                  onClick={() => deletePaymentMethod(item)}
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
          ))}
        </div>
      )}
    </div>
  );
}
