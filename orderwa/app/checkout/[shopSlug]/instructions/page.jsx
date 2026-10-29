"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa", ussd: "*150*00#", short: "M", color: "#dc2626" },
  { value: "airtel_money", label: "Airtel Money", ussd: "*150*60#", short: "A", color: "#e11d48" },
  { value: "tigopesa", label: "Tigo Pesa", ussd: "*150*01#", short: "T", color: "#2563eb" },
  { value: "halopesa", label: "HaloPesa", ussd: "*150*88#", short: "H", color: "#ea580c" },
  { value: "selcom", label: "Selcom", ussd: "", short: "S", color: "#0f766e" },
  { value: "bank", label: "Bank", ussd: "", short: "B", color: "#374151" },
];

// Turns 0712345678 into 255712345678, the format wa.me expects.
function toWhatsAppNumber(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "255" + digits.slice(1);
  if (digits.length === 9) digits = "255" + digits;

  return digits;
}

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const shopSlug = params.shopSlug;

  const [checkout, setCheckout] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Load checkout data and the payment method the customer chose.
  useEffect(() => {
    let active = true;

    async function loadCheckout() {
      try {
        const saved = sessionStorage.getItem("odLinkCheckout");

        if (!saved) {
          router.replace(`/${shopSlug}`);
          return;
        }

        const data = JSON.parse(saved);

        if (!data.shopId || !data.cart?.length || !data.name || !data.phone) {
          sessionStorage.removeItem("odLinkCheckout");
          router.replace(`/${shopSlug}`);
          return;
        }

        if (!data.selectedPaymentId) {
          router.replace(`/checkout/${shopSlug}/payment`);
          return;
        }

        if (active) setCheckout(data);

        const { data: method, error: paymentError } = await supabase
          .from("shop_payment_methods")
          .select("id, shop_id, method, account_name, account_number, bank_name")
          .eq("shop_id", data.shopId)
          .eq("id", data.selectedPaymentId)
          .eq("is_enabled", true)
          .maybeSingle();

        if (paymentError) throw paymentError;
        if (!active) return;

        if (!method) {
          setError("This payment method is not available. Please choose another.");
        } else {
          setPayment(method);
        }
      } catch (err) {
        console.error("Checkout loading error:", err);
        if (active) {
          setError("Could not load payment details. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCheckout();

    return () => {
      active = false;
    };
  }, [shopSlug, router]);

  const paymentInfo = PAYMENT_OPTIONS.find((item) => item.value === payment?.method);
  const paymentLabel = paymentInfo?.label || payment?.method || "Payment";
  const ussd = paymentInfo?.ussd || "";

  async function copyValue(field, value) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedField(field);
      setError("");
      setTimeout(() => setCopiedField(""), 2000);
    } catch {
      setError("Could not copy. Please type it in yourself.");
    }
  }

  // '#' must be encoded in a tel: link, otherwise the phone drops it.
  function openUSSD() {
    if (!ussd) return;
    window.location.href = `tel:${ussd.replace("#", "%23")}`;
  }

  // "I have paid": save the order, open WhatsApp with a prefilled message, show thank-you.
  async function handleIHavePaid() {
    if (sending || success || !checkout || !payment) return;

    setError("");

    const sellerNumber = toWhatsAppNumber(checkout.shopPhone);

    if (!sellerNumber) {
      setError("This shop has no WhatsApp number. Please contact the seller.");
      return;
    }

    setSending(true);

    // Open the tab inside the click so the browser does not block it as a popup.
    const whatsappWindow = window.open("about:blank", "_blank");

    try {
      const items = checkout.cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      // The order stays "pending" until the seller confirms the payment.
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

      const itemLines = checkout.cart.map(
        (item) =>
          `- ${item.name} x${item.quantity}: ${(
            Number(item.price) * Number(item.quantity)
          ).toLocaleString()} TZS`
      );

      const message = [
        `Hello ${checkout.shopName || ""}, I have paid via ${paymentLabel}.`,
        "",
        `Order: #${order.id}`,
        `Name: ${checkout.name.trim()}`,
        `Phone: ${checkout.phone.trim()}`,
        "",
        "Items:",
        ...itemLines,
        "",
        `Total: ${Number(checkout.cartTotal).toLocaleString()} TZS`,
        `Payment method: ${paymentLabel}`,
        `Paid to: ${payment.account_name || "-"} (${payment.account_number || "-"})`,
        ...(payment.bank_name ? [`Bank: ${payment.bank_name}`] : []),
        "",
        // Only added when the customer pasted their payment SMS.
        ...(confirmation.trim()
          ? ["Payment SMS:", confirmation.trim(), ""]
          : []),
        "Please confirm my payment and my order.",
      ].join("\n");

      const url = `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`;

      setOrderId(order.id);
      setWhatsappUrl(url);
      setSuccess(true);

      localStorage.removeItem(`cart:${shopSlug}`);
      sessionStorage.removeItem("odLinkCheckout");

      // If the tab was blocked, the thank-you screen shows a WhatsApp button instead.
      if (whatsappWindow) {
        whatsappWindow.location.href = url;
      }
    } catch (err) {
      console.error("Order submission failed:", err);

      if (whatsappWindow) whatsappWindow.close();

      setError(
        err?.message?.includes("Not enough stock") ||
          err?.message?.includes("Product not available") ||
          err?.message?.includes("Invalid quantity")
          ? err.message
          : "Your order could not be saved. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.muted}>Loading payment details...</p>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>

          <h1 style={styles.successHeading}>Thank you for your order!</h1>

          <p style={styles.bodyText}>
            Your order #{orderId} has been received. Please wait for the
            seller to confirm your payment.
          </p>

          <div style={styles.pending}>
            <strong>Status: Pending</strong>
            <p style={styles.pendingText}>
              In WhatsApp, tap Send so the seller gets your message. If
              WhatsApp did not open, use the button below.
            </p>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={styles.primaryButton}
            >
              Open WhatsApp
            </a>
          )}

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.secondaryButton}
          >
            Back to shop
          </button>
        </div>
      </main>
    );
  }

  if (!checkout || !payment) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p role="alert" style={styles.error}>
            {error || "Payment details not found."}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/checkout/${shopSlug}/payment`)}
            style={styles.primaryButton}
          >
            Choose another payment method
          </button>
        </div>
      </main>
    );
  }

  const total = Number(checkout.cartTotal || 0);

  const rows = [
    payment.bank_name && {
      field: "bank",
      label: "Bank",
      value: payment.bank_name,
      copy: payment.bank_name,
    },
    {
      field: "number",
      label: payment.method === "bank" ? "Account number" : "Phone number",
      value: payment.account_number || "—",
      copy: payment.account_number,
    },
    {
      field: "name",
      label: "Payee name",
      value: payment.account_name || "—",
      copy: payment.account_name,
    },
    {
      field: "amount",
      label: "Amount",
      value: `TSh ${total.toLocaleString()}`,
      copy: String(total),
    },
  ].filter(Boolean);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <button
          type="button"
          onClick={() => router.back()}
          style={styles.back}
        >
          ← {paymentLabel}
        </button>

        <div style={styles.header}>
          <div style={{ minWidth: 0 }}>
            <p style={styles.amount}>TSh {total.toLocaleString()}</p>
            <p style={styles.muted}>Please follow instructions to pay</p>
          </div>

          <span
            style={{
              ...styles.paymentIcon,
              background: paymentInfo?.color || "#374151",
            }}
          >
            {paymentInfo?.short || paymentLabel.charAt(0)}
          </span>
        </div>

        {ussd && (
          <button type="button" onClick={openUSSD} style={styles.callButton}>
            Pay · dial {ussd}
          </button>
        )}

        <div style={styles.detailsBox}>
          {rows.map((row) => (
            <div key={row.field} style={styles.row}>
              <div style={styles.rowText}>
                <span style={styles.rowLabel}>{row.label}</span>
                <strong style={styles.rowValue}>{row.value}</strong>
              </div>

              {row.copy && (
                <button
                  type="button"
                  onClick={() => copyValue(row.field, row.copy)}
                  style={styles.copyButton}
                >
                  {copiedField === row.field ? "Copied ✓" : "Copy"}
                </button>
              )}
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>How to pay</h2>

        <ol style={styles.instructions}>
          <li>
            Dial <strong>{ussd || "your payment service code"}</strong>.
          </li>
          <li>
            Choose <strong>Send money</strong> or{" "}
            <strong>Merchant payment</strong>.
          </li>
          <li>Enter the number above and the amount.</li>
          <li>Confirm with your PIN, then tap “I have paid” below.</li>
        </ol>

        <h2 style={styles.sectionTitle}>Payment SMS (optional)</h2>
        <p style={styles.muted}>
          Paste the confirmation SMS to help the seller check your payment
          faster.
        </p>

        <textarea
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="Paste your payment confirmation SMS here..."
          rows={4}
          style={styles.textarea}
        />
      </div>

      <div style={styles.bottomBar}>
        <div style={styles.bottomInner}>
          {error && (
            <p role="alert" style={styles.errorInBar}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleIHavePaid}
            disabled={sending}
            style={{
              ...styles.payButton,
              opacity: sending ? 0.65 : 1,
            }}
          >
            {sending ? "Saving order..." : "I have paid"}
          </button>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "20px 12px 140px",
    background: "#f8fafc",
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
    writingMode: "horizontal-tb",
  },
  back: {
    display: "inline-block",
    padding: "6px 0",
    marginBottom: 10,
    color: "#111827",
    background: "transparent",
    border: 0,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    minWidth: 0,
    marginBottom: 16,
  },
  amount: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
    fontWeight: 700,
    overflowWrap: "anywhere",
  },
  paymentIcon: {
    display: "flex",
    flex: "0 0 52px",
    alignItems: "center",
    justifyContent: "center",
    width: 52,
    height: 52,
    borderRadius: "50%",
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 700,
  },
  muted: {
    display: "block",
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
  callButton: {
    display: "block",
    width: "100%",
    padding: 14,
    marginBottom: 16,
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  detailsBox: {
    display: "block",
    width: "100%",
    padding: "4px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxSizing: "border-box",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  rowText: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  rowValue: {
    fontSize: 16,
    color: "#111827",
    overflowWrap: "anywhere",
  },
  copyButton: {
    flex: "0 0 auto",
    padding: "8px 12px",
    color: "#0f766e",
    background: "#ffffff",
    border: "1px solid #0f766e",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  sectionTitle: {
    display: "block",
    margin: "22px 0 8px",
    fontSize: 17,
    lineHeight: 1.4,
  },
  instructions: {
    display: "block",
    paddingLeft: 22,
    margin: "8px 0 0",
    fontSize: 14,
    lineHeight: 1.8,
    overflowWrap: "anywhere",
  },
  textarea: {
    display: "block",
    width: "100%",
    minHeight: 100,
    marginTop: 10,
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 9,
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#111827",
    fontSize: 15,
    lineHeight: 1.5,
    resize: "vertical",
    fontFamily: "inherit",
  },
  bottomBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "12px 12px calc(12px + env(safe-area-inset-bottom, 0px))",
    background: "#ffffff",
    borderTop: "1px solid #e5e7eb",
    boxSizing: "border-box",
  },
  bottomInner: {
    width: "100%",
    maxWidth: 480,
    margin: "0 auto",
  },
  payButton: {
    display: "block",
    width: "100%",
    padding: 15,
    color: "#ffffff",
    background: "#111827",
    border: 0,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
  },
  errorInBar: {
    margin: "0 0 10px",
    color: "#dc2626",
    fontSize: 14,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  primaryButton: {
    display: "block",
    width: "100%",
    marginTop: 16,
    padding: 14,
    color: "#ffffff",
    background: "#0f766e",
    border: 0,
    borderRadius: 9,
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  secondaryButton: {
    display: "block",
    width: "100%",
    marginTop: 10,
    padding: 12,
    color: "#111827",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 9,
    fontSize: 15,
    cursor: "pointer",
    boxSizing: "border-box",
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
  successHeading: {
    margin: "16px 0 8px",
    fontSize: 22,
    lineHeight: 1.35,
  },
  bodyText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.7,
    overflowWrap: "anywhere",
  },
  pending: {
    marginTop: 16,
    padding: 14,
    background: "#fef3c7",
    borderRadius: 10,
  },
  pendingText: {
    margin: "6px 0 0",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#92400e",
  },
  error: {
    display: "block",
    marginTop: 12,
    color: "#dc2626",
    fontSize: 14,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
};
