"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa", short: "M", color: "#dc2626" },
  { value: "airtel_money", label: "Airtel Money", short: "A", color: "#e11d48" },
  { value: "tigopesa", label: "Tigo Pesa", short: "T", color: "#2563eb" },
  { value: "halopesa", label: "HaloPesa", short: "H", color: "#ea580c" },
  { value: "selcom", label: "Selcom", short: "S", color: "#0f766e" },
  { value: "bank", label: "Bank", short: "B", color: "#374151" },
];

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const shopSlug = params.shopSlug;

  const [checkout, setCheckout] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Load the checkout data saved by CheckoutForm, then the seller's payment methods.
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
          .select("id, shop_id, method, account_name, account_number, bank_name")
          .eq("shop_id", checkoutData.shopId)
          .eq("is_enabled", true)
          .order("created_at", { ascending: true });

        if (paymentError) throw paymentError;
        if (!active) return;

        setPaymentMethods(data || []);
      } catch (err) {
        console.error("Payment methods error:", err);
        if (active) {
          setError("Could not load payment methods. Please try again.");
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

  // Tapping a method saves the choice and opens the instructions screen.
  function choosePayment(item) {
    if (!checkout) return;

    sessionStorage.setItem(
      "odLinkCheckout",
      JSON.stringify({ ...checkout, selectedPaymentId: item.id })
    );

    router.push(`/checkout/${shopSlug}/instructions`);
  }

  // Used only when the seller has no payment methods set up.
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

      setOrderId(order.id);
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
          : "Your order could not be submitted. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.muted}>Loading checkout...</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>

          <h1 style={styles.heading}>Thank you for your order!</h1>

          <p style={styles.bodyText}>
            Your order #{orderId} has been received. The seller will contact
            you to arrange payment and delivery.
          </p>

          <div style={styles.pending}>
            <strong>Status: Pending</strong>
            <p style={styles.detail}>
              Payment has not been confirmed yet.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.primaryButton}
          >
            Back to shop
          </button>
        </div>
      </main>
    );
  }

  if (!checkout) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p role="alert" style={styles.error}>
            {error || "Checkout not found."}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.primaryButton}
          >
            Back to shop
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
          ← Back
        </button>

        <p style={styles.shopName}>{checkout.shopName || shopSlug}</p>

        <div style={styles.amountBox}>
          <span style={styles.amountLabel}>Amount to pay</span>
          <strong style={styles.amount}>
            TSh {Number(checkout.cartTotal || 0).toLocaleString()}
          </strong>
        </div>

        {paymentMethods.length === 0 ? (
          <>
            <div style={styles.infoBox}>
              <h2 style={styles.infoTitle}>No payment methods available</h2>
              <p style={styles.detail}>
                You can still submit your order. The seller will contact you
                to arrange payment and delivery.
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
              {submitting ? "Submitting order..." : "Submit order"}
            </button>
          </>
        ) : (
          <>
            <h1 style={styles.heading}>Choose payment method</h1>

            <div style={styles.methods}>
              {paymentMethods.map((item) => {
                const option = PAYMENT_OPTIONS.find(
                  (o) => o.value === item.method
                );
                const label = option?.label || item.method;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => choosePayment(item)}
                    style={styles.method}
                  >
                    <span
                      style={{
                        ...styles.methodIcon,
                        background: option?.color || "#374151",
                      }}
                    >
                      {option?.short || label.charAt(0)}
                    </span>

                    <span style={styles.methodText}>
                      <strong style={styles.methodTitle}>{label}</strong>
                      {item.account_name && (
                        <span style={styles.methodSub}>
                          {item.account_name}
                        </span>
                      )}
                    </span>

                    <span style={styles.chevron}>›</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <p role="alert" style={styles.error}>
                {error}
              </p>
            )}
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
    padding: "20px 14px",
    color: "#111827",
    boxSizing: "border-box",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  card: {
    display: "block",
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
    margin: "0 auto",
    padding: 18,
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
  shopName: {
    margin: "10px 0 0",
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    overflowWrap: "anywhere",
  },
  amountBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "18px 0 22px",
  },
  amountLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  amount: {
    fontSize: 32,
    lineHeight: 1.2,
    fontWeight: 700,
    overflowWrap: "anywhere",
  },
  heading: {
    display: "block",
    margin: "0 0 12px",
    fontSize: 18,
    lineHeight: 1.4,
    fontWeight: 700,
  },
  muted: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
  },
  methods: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  method: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
    padding: "14px 14px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    cursor: "pointer",
    textAlign: "left",
    boxSizing: "border-box",
    color: "#111827",
    font: "inherit",
  },
  methodIcon: {
    display: "flex",
    flex: "0 0 40px",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: "50%",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
  },
  methodText: {
    display: "flex",
    flex: "1 1 0%",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  methodTitle: {
    fontSize: 16,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  methodSub: {
    fontSize: 13,
    color: "#6b7280",
    overflowWrap: "anywhere",
  },
  chevron: {
    flex: "0 0 auto",
    fontSize: 24,
    lineHeight: 1,
    color: "#9ca3af",
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
  detail: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#4b5563",
    margin: "7px 0 0",
    overflowWrap: "anywhere",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 1.7,
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
