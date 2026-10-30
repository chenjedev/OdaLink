"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa", ussd: "*150*00#" },
  { value: "airtel_money", label: "Airtel Money", ussd: "*150*60#" },
  { value: "tigopesa", label: "Tigo Pesa", ussd: "*150*01#" },
  { value: "halopesa", label: "HaloPesa", ussd: "*150*88#" },
  { value: "selcom", label: "Selcom", ussd: "" },
  { value: "bank", label: "Bank / Benki", ussd: "" },
];

function toWhatsAppNumber(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "255" + digits.slice(1);
  if (digits.length === 9) digits = "255" + digits;
  return digits;
}

function DetailRow({ label, value, big, copied, onCopy, copyLabel }) {
  return (
    <div style={styles.row}>
      <div style={{ minWidth: 0 }}>
        <span style={styles.rowLabel}>{label}</span>
        <strong style={big ? styles.rowValueBig : styles.rowValue}>
          {value || "—"}
        </strong>
      </div>

      {onCopy && (
        <button type="button" onClick={onCopy} style={styles.copyButton}>
          {copied ? "✓" : copyLabel}
        </button>
      )}
    </div>
  );
}

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const shopSlug = params.shopSlug;

  const [checkout, setCheckout] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const t = (en, sw) => (checkout?.lang === "sw" ? sw : en);

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

        if (
          !data.shopId ||
          !data.cart?.length ||
          !data.name ||
          !data.phone
        ) {
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
          .select(
            "id, shop_id, method, account_name, account_number, bank_name"
          )
          .eq("shop_id", data.shopId)
          .eq("id", data.selectedPaymentId)
          .eq("is_enabled", true)
          .maybeSingle();

        if (paymentError) throw paymentError;
        if (!active) return;

        if (!method) {
          setError("Payment method not available. Please choose another.");
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

  const paymentInfo = PAYMENT_OPTIONS.find(
    (item) => item.value === payment?.method
  );
  const paymentLabel = paymentInfo?.label || payment?.method || "Payment";
  const ussd = paymentInfo?.ussd || "";
  const total = Number(checkout?.cartTotal || 0);
  const isBank = payment?.method === "bank";

  async function copyText(value, key) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopiedKey(key);
      setError("");
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setError(
        t(
          "Could not copy. Please type it yourself.",
          "Imeshindikana kunakili. Tafadhali iandike mwenyewe."
        )
      );
    }
  }

  async function handleSendConfirmation() {
    if (sending || success || !checkout || !payment) return;

    setError("");

    if (confirmation.trim().length < 5) {
      setError(
        t(
          "Paste the payment confirmation message first.",
          "Bandika ujumbe wa uthibitisho wa malipo kwanza."
        )
      );
      return;
    }

    const sellerNumber = toWhatsAppNumber(checkout.shopPhone);

    if (!sellerNumber) {
      setError(
        t(
          "The shop has no WhatsApp number. Please contact the seller.",
          "Namba ya WhatsApp ya duka haipo. Tafadhali wasiliana na muuzaji."
        )
      );
      return;
    }

    setSending(true);

    // Open the tab during the tap so the browser does not block it.
    const whatsappWindow = window.open("about:blank", "_blank");

    try {
      const items = checkout.cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      // Saved as pending: the customer's SMS is not proof of payment
      // until the seller checks it.
      const { data: order, error: insertError } = await supabase
        .from("orders")
        .insert({
          shop_id: checkout.shopId,
          customer_name: checkout.name.trim(),
          customer_phone: checkout.phone.trim(),
          items,
          total,
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
        `Habari ${checkout.shopName || ""}, nimelipa kupitia ${paymentLabel}.`,
        "",
        `Oda ID: ${order.id}`,
        `Jina: ${checkout.name.trim()}`,
        `Simu ya mteja: ${checkout.phone.trim()}`,
        "",
        "Bidhaa:",
        ...itemLines,
        "",
        `Jumla: ${total.toLocaleString()} TZS`,
        `Njia ya malipo: ${paymentLabel}`,
        `Jina la akaunti: ${payment.account_name || "-"}`,
        `Namba ya malipo: ${payment.account_number || "-"}`,
        ...(payment.bank_name ? [`Benki: ${payment.bank_name}`] : []),
        "",
        "UJUMBE WA UTHIBITISHO WA MALIPO:",
        confirmation.trim(),
        "",
        "Tafadhali hakiki malipo yangu na uthibitishe oda. Oda yangu inasubiri uthibitisho.",
      ].join("\n");

      const url = `https://wa.me/${sellerNumber}?text=${encodeURIComponent(
        message
      )}`;

      setWhatsappUrl(url);
      setSuccess(true);

      localStorage.removeItem(`cart:${shopSlug}`);
      sessionStorage.removeItem("odLinkCheckout");

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
          : t(
              "The order was not saved. Please try again.",
              "Oda haikuhifadhiwa. Tafadhali jaribu tena."
            )
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>Loading...</div>
      </main>
    );
  }

  if (success) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.heading}>
            {t("Order received!", "Oda yako imepokelewa!")}
          </h1>
          <p style={styles.bodyText}>
            {t(
              "Your order is saved. Send the WhatsApp message so the seller can check your payment.",
              "Oda imehifadhiwa. Tuma ujumbe wa WhatsApp ili muuzaji akague malipo yako."
            )}
          </p>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={styles.primaryButton}
            >
              {t("Send on WhatsApp", "Tuma ujumbe WhatsApp")}
            </a>
          )}

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.secondaryButton}
          >
            {t("Back to shop", "Rudi dukani")}
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
            {t("Choose another payment method", "Chagua njia nyingine")}
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
          ← {paymentLabel}
        </button>

        {/* Where to pay */}
        <div style={styles.detailsBox}>
          <DetailRow
            label={
              isBank
                ? t("Account number", "Namba ya akaunti")
                : t("Pay to number", "Namba ya kulipa")
            }
            value={payment.account_number}
            copied={copiedKey === "number"}
            copyLabel={t("Copy", "Nakili")}
            onCopy={() => copyText(payment.account_number, "number")}
          />

          {payment.bank_name && (
            <DetailRow label={t("Bank", "Benki")} value={payment.bank_name} />
          )}

          <DetailRow
            label={t("Name", "Jina")}
            value={payment.account_name}
          />

          <DetailRow
            big
            label={t("Amount", "Kiasi")}
            value={`TSh ${total.toLocaleString()}`}
            copied={copiedKey === "amount"}
            copyLabel={t("Copy", "Nakili")}
            onCopy={() => copyText(String(total), "amount")}
          />
        </div>

        {/* How to pay */}
        {ussd ? (
          <>
            <a
              href={`tel:${ussd.replace(/#/g, "%23")}`}
              style={styles.dialButton}
            >
              {t("Dial", "Piga")} {ussd}
            </a>

            <ol style={styles.steps}>
              <li>
                {t("Choose", "Chagua")}{" "}
                <strong>{t("Send Money", "Tuma Pesa")}</strong>{" "}
                {t("or", "au")}{" "}
                <strong>{t("Merchant Payment", "Malipo ya Biashara")}</strong>.
              </li>
              <li>
                {t(
                  "Enter the number and amount above, then confirm with your PIN.",
                  "Weka namba na kiasi kilicho juu, kisha thibitisha kwa PIN."
                )}
              </li>
            </ol>
          </>
        ) : (
          <p style={styles.stepsText}>
            {t(
              "Send the amount to the details above.",
              "Tuma kiasi kwenye taarifa zilizo juu."
            )}
          </p>
        )}

        {/* After paying */}
        <label style={styles.label} htmlFor="confirmation">
          {t(
            "After paying, paste the confirmation SMS:",
            "Ukishalipa, bandika SMS ya uthibitisho:"
          )}
        </label>
        <textarea
          id="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={t(
            "Payment confirmation message",
            "Ujumbe wa uthibitisho wa malipo"
          )}
          rows={3}
          style={styles.textarea}
        />

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSendConfirmation}
          disabled={sending}
          style={{
            ...styles.primaryButton,
            opacity: sending ? 0.65 : 1,
          }}
        >
          {sending
            ? t("Saving order...", "Inahifadhi oda...")
            : t("I have paid", "Nimelipa")}
        </button>

        <p style={styles.note}>
          {t(
            "The order stays Pending until the seller confirms your payment.",
            "Oda inabaki Pending hadi muuzaji athibitishe malipo."
          )}
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "16px 12px 40px",
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
    borderRadius: 16,
    boxSizing: "border-box",
    textAlign: "left",
  },
  back: {
    display: "inline-block",
    padding: "4px 0",
    marginBottom: 14,
    color: "#0f172a",
    background: "transparent",
    border: 0,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
  },
  detailsBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "4px 14px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  rowLabel: {
    display: "block",
    marginBottom: 2,
    color: "#6b7280",
    fontSize: 13,
  },
  rowValue: {
    display: "block",
    fontSize: 17,
    overflowWrap: "anywhere",
  },
  rowValueBig: {
    display: "block",
    fontSize: 24,
    overflowWrap: "anywhere",
  },
  copyButton: {
    flex: "none",
    minWidth: 72,
    padding: "10px 14px",
    color: "#0f766e",
    background: "#ffffff",
    border: "1px solid #0f766e",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  dialButton: {
    display: "block",
    width: "100%",
    marginTop: 14,
    padding: 14,
    color: "#ffffff",
    background: "#0f766e",
    borderRadius: 12,
    boxSizing: "border-box",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
  },
  steps: {
    margin: "14px 0 0",
    paddingLeft: 22,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#374151",
  },
  stepsText: {
    margin: "14px 0 0",
    fontSize: 15,
    lineHeight: 1.7,
    color: "#374151",
  },
  label: {
    display: "block",
    margin: "20px 0 8px",
    fontSize: 15,
    fontWeight: 700,
  },
  textarea: {
    display: "block",
    width: "100%",
    minHeight: 84,
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#111827",
    fontSize: 15,
    lineHeight: 1.5,
    resize: "vertical",
  },
  primaryButton: {
    display: "block",
    width: "100%",
    marginTop: 14,
    padding: 15,
    color: "#ffffff",
    background: "#0f766e",
    border: 0,
    borderRadius: 12,
    boxSizing: "border-box",
    fontSize: 17,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
  secondaryButton: {
    display: "block",
    width: "100%",
    marginTop: 10,
    padding: 13,
    color: "#111827",
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    boxSizing: "border-box",
    fontSize: 15,
    cursor: "pointer",
  },
  note: {
    margin: "12px 0 0",
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 1.6,
    textAlign: "center",
  },
  heading: {
    margin: "14px 0 8px",
    fontSize: 22,
    lineHeight: 1.35,
  },
  bodyText: {
    margin: "0 0 4px",
    fontSize: 15,
    lineHeight: 1.7,
    color: "#374151",
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
  error: {
    display: "block",
    marginTop: 12,
    color: "#dc2626",
    fontSize: 14,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },
};
