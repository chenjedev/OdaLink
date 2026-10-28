"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "tigopesa", label: "Tigo Pesa" },
  { value: "halopesa", label: "HaloPesa" },
  { value: "selcom", label: "Selcom" },
  { value: "bank", label: "Bank / Benki" },
];

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const shopSlug = params.shopSlug;

  const [checkout, setCheckout] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = (en, sw) => (checkout?.lang === "sw" ? sw : en);

  useEffect(() => {
    let active = true;

    async function loadPaymentMethods() {
      try {
        const saved = sessionStorage.getItem("odLinkCheckout");

        if (!saved) {
          router.replace(`/${shopSlug}`);
          return;
        }

        const checkoutData = JSON.parse(saved);

        if (
          !checkoutData.shopId ||
          !checkoutData.cart?.length ||
          !checkoutData.name ||
          !checkoutData.phone
        ) {
          sessionStorage.removeItem("odLinkCheckout");
          router.replace(`/${shopSlug}`);
          return;
        }

        if (active) setCheckout(checkoutData);

        const { data, error: paymentError } = await supabase
          .from("shop_payment_methods")
          .select(
            "id, shop_id, method, account_name, account_number, bank_name"
          )
          .eq("shop_id", checkoutData.shopId)
          .eq("is_enabled", true)
          .order("created_at", { ascending: true });

        if (paymentError) throw paymentError;

        if (!active) return;

        setPaymentMethods(data || []);

        if (data?.length) {
          const savedPaymentId = checkoutData.selectedPaymentId;

          setSelectedPaymentId(
            data.some((item) => item.id === savedPaymentId)
              ? savedPaymentId
              : data[0].id
          );
        }
      } catch (err) {
        console.error("Payment methods error:", err);

        if (active) {
          setError(
            "Imeshindwa kupakia njia za malipo. Tafadhali jaribu tena."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPaymentMethods();

    return () => {
      active = false;
    };
  }, [shopSlug, router]);

  function continueToInstructions() {
    setError("");

    const selectedPayment = paymentMethods.find(
      (item) => item.id === selectedPaymentId
    );

    if (!selectedPayment || !checkout) {
      setError(t("Please select a payment method.", "Tafadhali chagua njia ya malipo."));
      return;
    }

    const updatedCheckout = {
      ...checkout,
      selectedPaymentId: selectedPayment.id,
    };

    sessionStorage.setItem(
      "odLinkCheckout",
      JSON.stringify(updatedCheckout)
    );

    router.push(`/checkout/${shopSlug}/instructions`);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <p>{t("Loading payment methods...", "Inapakia njia za malipo...")}</p>
      </main>
    );
  }

  if (!checkout) {
    return (
      <main style={styles.page}>
        <p>{error || t("Loading checkout...", "Inapakia checkout...")}</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <button
          type="button"
          onClick={() => router.back()}
          style={styles.back}
        >
          ← {t("Back", "Rudi nyuma")}
        </button>

        <h1 style={styles.heading}>
          {t("Choose payment method", "Chagua njia ya malipo")}
        </h1>

        <p style={styles.muted}>
          {t("Shop:", "Duka:")} {checkout.shopName || shopSlug}
        </p>

        <div style={styles.totalBox}>
          <span>{t("Order total", "Jumla ya oda")}</span>
          <strong>
            {Number(checkout.cartTotal || 0).toLocaleString()} TZS
          </strong>
        </div>

        {paymentMethods.length === 0 ? (
          <p style={styles.error}>
            {t(
              "This shop has no enabled payment methods. Please contact the seller.",
              "Duka hili halijaweka njia za malipo. Tafadhali wasiliana na muuzaji."
            )}
          </p>
        ) : (
          <>
            <div style={styles.methods}>
              {paymentMethods.map((item) => {
                const label =
                  PAYMENT_OPTIONS.find(
                    (option) => option.value === item.method
                  )?.label || item.method;

                const selected = selectedPaymentId === item.id;

                return (
                  <label
                    key={item.id}
                    style={{
                      ...styles.method,
                      border: selected
                        ? "2px solid #0f766e"
                        : "1px solid #d1d5db",
                      background: selected ? "#f0fdfa" : "#fff",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selected}
                      onChange={() => setSelectedPaymentId(item.id)}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>{label}</strong>

                      <p style={styles.detail}>
                        {t("Account name:", "Jina la akaunti:")}{" "}
                        {item.account_name}
                      </p>

                      <p style={styles.detail}>
                        {t("Account number:", "Namba ya malipo:")}{" "}
                        {item.account_number}
                      </p>

                      {item.method === "bank" && item.bank_name && (
                        <p style={styles.detail}>
                          {t("Bank:", "Benki:")} {item.bank_name}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button
              type="button"
              onClick={continueToInstructions}
              disabled={!selectedPaymentId}
              style={styles.primaryButton}
            >
              {t("Continue to payment", "Endelea kulipa")} →
            </button>
          </>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px 14px",
    color: "#111827",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
    padding: 20,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxSizing: "border-box",
  },
  back: {
    border: 0,
    background: "transparent",
    padding: "6px 0",
    cursor: "pointer",
    fontSize: 15,
    color: "#0f766e",
  },
  heading: {
    fontSize: 23,
    margin: "18px 0 8px",
  },
  muted: {
    color: "#6b7280",
    marginBottom: 18,
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 20,
  },
  methods: {
    display: "grid",
    gap: 10,
  },
  method: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  detail: {
    margin: "7px 0 0",
    fontSize: 14,
    color: "#4b5563",
    overflowWrap: "anywhere",
  },
  primaryButton: {
    width: "100%",
    marginTop: 18,
    padding: 14,
    background: "#0f766e",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    marginTop: 14,
  },
};