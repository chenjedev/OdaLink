
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

        const methods = data || [];
        setPaymentMethods(methods);

        if (methods.length > 0) {
          const savedPaymentId = checkoutData.selectedPaymentId;

          setSelectedPaymentId(
            methods.some((item) => item.id === savedPaymentId)
              ? savedPaymentId
              : methods[0].id
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
      setError(
        t(
          "Please select a payment method.",
          "Tafadhali chagua njia ya malipo."
        )
      );
      return;
    }

    sessionStorage.setItem(
      "odLinkCheckout",
      JSON.stringify({
        ...checkout,
        selectedPaymentId: selectedPayment.id,
      })
    );

    router.push(`/checkout/${shopSlug}/instructions`);
  }

  async function submitOrderWithoutPayment() {
    if (submitting || !checkout) return;

    setSubmitting(true);
    setError("");

    try {
      const items = checkout.cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      const { data: order, error: insertError } = await supabase
        .from("orders")
        .insert({
          shop_id: checkout.shopId,
          customer_name: checkout.name.trim(),
          customer_phone: checkout.phone.trim(),
          items,
          total: Number(checkout.cartTotal),
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Hifadhi ID ya oda ili ukurasa wa success uweze kuionyesha.
      sessionStorage.setItem(
        "odLinkOrderResult",
        JSON.stringify({
          orderId: order.id,
          shopName: checkout.shopName || shopSlug,
          total: Number(checkout.cartTotal),
          customerName: checkout.name.trim(),
        })
      );

      localStorage.removeItem(`cart:${shopSlug}`);
      sessionStorage.removeItem("odLinkCheckout");

      setSuccess(true);
    } catch (err) {
      console.error("Submit order failed:", err);

      setError(
        err?.message?.includes("Not enough stock") ||
          err?.message?.includes("Product not available") ||
          err?.message?.includes("Invalid quantity")
          ? err.message
          : t(
              "Your order could not be submitted. Please try again.",
              "Oda haikuweza kutumwa. Tafadhali jaribu tena."
            )
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p>{t("Loading checkout...", "Inapakia checkout...")}</p>
        </div>
      </main>
    );
  }

  if (success) {
    let orderResult = null;

    if (typeof window !== "undefined") {
      try {
        orderResult = JSON.parse(
          sessionStorage.getItem("odLinkOrderResult") || "null"
        );
      } catch {
        orderResult = null;
      }
    }

    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>

          <h1 style={styles.heading}>
            {t("Order submitted!", "Oda imetumwa!")}
          </h1>

          <p style={styles.muted}>
            {t(
              "Your order has been received by the system and is waiting for the seller to review it.",
              "Oda yako imepokelewa na inasubiri muuzaji aikague."
            )}
          </p>

          {orderResult?.orderId && (
            <div style={styles.totalBox}>
              <span>{t("Order ID", "Namba ya oda")}</span>
              <strong>{orderResult.orderId}</strong>
            </div>
          )}

          <div style={styles.pending}>
            <strong>{t("Status: Pending", "Hali: Inasubiri")}</strong>
            <p style={styles.detail}>
              {t(
                "Payment has not been confirmed. The seller can contact you to arrange payment and delivery.",
                "Malipo hayajathibitishwa. Muuzaji anaweza kuwasiliana nawe kupanga malipo na delivery."
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.primaryButton}
          >
            {t("Back to shop", "Rudi dukani")}
          </button>
        </div>
      </main>
    );
  }

  if (!checkout) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.error}>
            {error || "Checkout haipatikani."}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.primaryButton}
          >
            {t("Back to shop", "Rudi dukani")}
          </button>
        </div>
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
          {paymentMethods.length > 0
            ? t("Choose payment method", "Chagua njia ya malipo")
            : t("Complete your order", "Kamilisha oda yako")}
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
          <>
            <div style={styles.infoBox}>
              <h2 style={styles.infoTitle}>
                {t("No payment methods available", "Hakuna njia za malipo")}
              </h2>

              <p style={styles.detail}>
                {t(
                  "You can still submit your order. The seller can contact you to arrange payment and delivery.",
                  "Bado unaweza kutuma oda yako. Muuzaji atawasiliana nawe kupanga malipo na delivery."
                )}
              </p>
            </div>

            {error && (
              <p role="alert" style={styles.error}>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submitOrderWithoutPayment}
              disabled={submitting}
              style={{
                ...styles.primaryButton,
                opacity: submitting ? 0.65 : 1,
              }}
            >
              {submitting
                ? t("Submitting order...", "Inatuma oda...")
                : t("Submit Order", "Tuma Oda")}
            </button>

            <p style={styles.note}>
              {t(
                "Your order will be marked as pending until the seller reviews it. This does not confirm payment.",
                "Oda yako itakuwa inasubiri hadi muuzaji aikague. Hii haimaanishi kuwa malipo yamethibitishwa."
              )}
            </p>
          </>
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
                      background: selected ? "#f0fdfa" : "#ffffff",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selected}
                      onChange={() => setSelectedPaymentId(item.id)}
                      style={styles.radio}
                    />

                    <div style={styles.methodContent}>
                      <strong style={styles.methodTitle}>{label}</strong>

                      <p style={styles.detail}>
                        {t("Account name:", "Jina la akaunti:")}{" "}
                        {item.account_name || "—"}
                      </p>

                      <p style={styles.detail}>
                        {t("Account number:", "Namba ya malipo:")}{" "}
                        {item.account_number || "—"}
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

            {error && (
              <p role="alert" style={styles.error}>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={continueToInstructions}
              disabled={!selectedPaymentId}
              style={{
                ...styles.primaryButton,
                opacity: selectedPaymentId ? 1 : 0.6,
              }}
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
    width: "100%",
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "24px 14px",
    color: "#111827",
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  card: {
    display: "block",
    width: "100%",
    maxWidth: 520,
    minWidth: 0,
    margin: "0 auto",
    padding: 20,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxSizing: "border-box",
    textAlign: "left",
  },

  back: {
    display: "inline-block",
    border: 0,
    background: "transparent",
    padding: "6px 0",
    cursor: "pointer",
    fontSize: 15,
    color: "#0f766e",
  },

  heading: {
    display: "block",
    fontSize: 23,
    lineHeight: 1.4,
    margin: "18px 0 8px",
    fontWeight: 700,
    overflowWrap: "anywhere",
  },

  muted: {
    display: "block",
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "0 0 18px",
    overflowWrap: "anywhere",
  },

  totalBox: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: 14,
    background: "#f3f4f6",
    borderRadius: 10,
    marginBottom: 20,
    boxSizing: "border-box",
  },

  infoBox: {
    padding: 15,
    border: "1px solid #fed7aa",
    background: "#fff7ed",
    borderRadius: 10,
    marginBottom: 14,
  },

  infoTitle: {
    fontSize: 17,
    lineHeight: 1.5,
    margin: "0 0 8px",
  },

  methods: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
    width: "100%",
    minWidth: 0,
  },

  method: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
    minWidth: 0,
    padding: 14,
    borderRadius: 12,
    cursor: "pointer",
    boxSizing: "border-box",
    textAlign: "left",
  },

  radio: {
    flex: "0 0 18px",
    width: 18,
    height: 18,
    margin: "3px 0 0",
    accentColor: "#0f766e",
  },

  methodContent: {
    flex: "1 1 0%",
    minWidth: 0,
    overflowWrap: "anywhere",
  },

  methodTitle: {
    display: "block",
    fontSize: 16,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  detail: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#4b5563",
    margin: "7px 0 0",
    overflowWrap: "anywhere",
  },

  primaryButton: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: 18,
    padding: 14,
    background: "#0f766e",
    color: "#ffffff",
    border: 0,
    borderRadius: 9,
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 700,
    cursor: "pointer",
  },

  note: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "#92400e",
    background: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    marginTop: 14,
  },

  successIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "#d1fae5",
    color: "#047857",
    fontSize: 30,
    fontWeight: 700,
  },

  pending: {
    padding: 14,
    background: "#fef3c7",
    borderRadius: 10,
    marginTop: 16,
  },

  error: {
    color: "#dc2626",
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 14,
    overflowWrap: "anywhere",
  },
};
