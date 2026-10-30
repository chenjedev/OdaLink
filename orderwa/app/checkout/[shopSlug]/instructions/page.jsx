"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa", ussd: "*150*00#", color: "#e60000", mark: "M" },
  { value: "airtel_money", label: "Airtel Money", ussd: "*150*60#", color: "#ed1c24", mark: "A" },
  { value: "tigopesa", label: "Tigo Pesa", ussd: "*150*01#", color: "#0b3a8f", mark: "T" },
  { value: "halopesa", label: "HaloPesa", ussd: "*150*88#", color: "#f58220", mark: "H" },
  { value: "selcom", label: "Selcom", ussd: "", color: "#00a651", mark: "S" },
  { value: "bank", label: "Bank / Benki", ussd: "", color: "#1f2937", mark: "B" },
];

function toWhatsAppNumber(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "255" + digits.slice(1);
  if (digits.length === 9) digits = "255" + digits;
  return digits;
}

/* ---------- Small inline icons ---------- */

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function DetailRow({ label, value, copied, onCopy, copyLabel }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value || "—"}</span>
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copyLabel}
          style={styles.iconButton}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      ) : (
        <span style={styles.iconSpacer} />
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
  const [showSms, setShowSms] = useState(false);
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
  const brandColor = paymentInfo?.color || "#475569";
  const brandMark =
    paymentInfo?.mark || (paymentLabel.charAt(0) || "P").toUpperCase();
  const ussd = paymentInfo?.ussd || "";
  const total = Number(checkout?.cartTotal || 0);
  const isBank = payment?.method === "bank";
  const sellerNumber = toWhatsAppNumber(checkout?.shopPhone);

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

  async function handleIHavePaid() {
    if (sending || success || !checkout || !payment) return;

    setError("");

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

      // Saved as pending: "I have paid" is not proof of payment
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

      const sms = confirmation.trim();

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
        ...(sms
          ? ["", "UJUMBE WA UTHIBITISHO WA MALIPO:", sms]
          : []),
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
          <h1 style={styles.successHeading}>
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
        {/* Back + provider */}
        <button
          type="button"
          onClick={() => router.back()}
          style={styles.back}
        >
          <BackIcon />
          <span>{paymentLabel}</span>
        </button>

        {/* Amount + provider logo */}
        <div style={styles.hero}>
          <div style={{ minWidth: 0 }}>
            <h1 style={styles.amount}>TSh {total.toLocaleString()}</h1>
            <p style={styles.subtitle}>
              {t(
                "Please follow instructions to pay",
                "Tafadhali fuata maelekezo ili ulipe"
              )}
            </p>
          </div>

          <span style={{ ...styles.logo, background: brandColor }}>
            {brandMark}
          </span>
        </div>

        {/* One short paragraph */}
        {ussd ? (
          <p style={styles.instructions}>
            {t("Dial", "Piga")}{" "}
            <a
              href={`tel:${ussd.replace(/#/g, "%23")}`}
              style={styles.ussdLink}
            >
              {ussd}
            </a>
            ,{" "}
            {t(
              "choose 'Send money' or 'Merchant Payment', enter the number and the amount, then confirm with your PIN.",
              "chagua 'Tuma pesa' au 'Malipo ya Biashara', weka namba na kiasi, kisha thibitisha kwa PIN."
            )}
          </p>
        ) : (
          <p style={styles.instructions}>
            {t(
              "Send the amount below to the details shown, then tap “I have paid”.",
              "Tuma kiasi kilichoonyeshwa kwenye taarifa zilizo hapa chini, kisha bonyeza “Nimelipa”."
            )}
          </p>
        )}

        {ussd && (
          <a
            href={`tel:${ussd.replace(/#/g, "%23")}`}
            style={styles.payButton}
          >
            <PhoneIcon />
            {t("Pay", "Lipa")}
          </a>
        )}

        <div style={styles.divider} />

        {/* Details (Amount instead of Reference) */}
        <div>
          <DetailRow
            label={
              isBank
                ? t("Account number", "Namba ya akaunti")
                : t("Phone number", "Namba ya simu")
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
            label={t("Amount", "Kiasi")}
            value={`TSh ${total.toLocaleString()}`}
            copied={copiedKey === "amount"}
            copyLabel={t("Copy", "Nakili")}
            onCopy={() => copyText(String(total), "amount")}
          />

          <DetailRow
            label={t("Payee name", "Jina la mpokeaji")}
            value={payment.account_name}
            copied={copiedKey === "name"}
            copyLabel={t("Copy", "Nakili")}
            onCopy={() => copyText(payment.account_name, "name")}
          />
        </div>

        {sellerNumber && (
          <a
            href={`https://wa.me/${sellerNumber}`}
            target="_blank"
            rel="noreferrer"
            style={styles.help}
          >
            {t("Get help?", "Unahitaji msaada?")}
          </a>
        )}

        {/* Actions: in the page, never hidden behind a fixed bar */}
        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleIHavePaid}
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

        {!showSms ? (
          <button
            type="button"
            onClick={() => setShowSms(true)}
            style={styles.outlineButton}
          >
            <MessageIcon />
            {t("Add payment SMS (optional)", "Ongeza SMS ya malipo (si lazima)")}
          </button>
        ) : (
          <textarea
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder={t(
              "Paste the payment confirmation SMS here",
              "Bandika SMS ya uthibitisho wa malipo hapa"
            )}
            rows={3}
            style={styles.textarea}
          />
        )}

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
    padding: 22,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 28,
    boxSizing: "border-box",
    textAlign: "left",
  },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: 14,
    padding: "4px 0",
    marginBottom: 18,
    color: "#0f172a",
    background: "transparent",
    border: 0,
    fontSize: 18,
    fontWeight: 500,
    cursor: "pointer",
  },
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  amount: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#0f172a",
    overflowWrap: "anywhere",
  },
  subtitle: {
    margin: "10px 0 0",
    fontSize: 17,
    lineHeight: 1.4,
    color: "#334155",
  },
  logo: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 68,
    height: 68,
    borderRadius: "50%",
    color: "#ffffff",
    fontSize: 30,
    fontWeight: 800,
  },
  instructions: {
    margin: "26px 0 18px",
    fontSize: 17,
    lineHeight: 1.6,
    color: "#64748b",
  },
  ussdLink: {
    color: "#475569",
    textDecoration: "underline",
  },
  payButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    padding: 16,
    color: "#0f172a",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 999,
    boxSizing: "border-box",
    fontSize: 18,
    fontWeight: 600,
    textDecoration: "none",
  },
  divider: {
    height: 1,
    margin: "22px 0 6px",
    background: "#e2e8f0",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px 0",
  },
  rowLabel: {
    flex: "none",
    color: "#64748b",
    fontSize: 17,
  },
  rowValue: {
    flex: 1,
    minWidth: 0,
    textAlign: "right",
    color: "#0f172a",
    fontSize: 17,
    fontWeight: 500,
    overflowWrap: "anywhere",
  },
  iconButton: {
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    padding: 0,
    color: "#475569",
    background: "transparent",
    border: 0,
    cursor: "pointer",
  },
  iconSpacer: {
    flex: "none",
    width: 36,
    height: 36,
  },
  help: {
    display: "block",
    margin: "18px 0 22px",
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
    textDecoration: "underline",
  },
  primaryButton: {
    display: "block",
    width: "100%",
    marginTop: 14,
    padding: 16,
    color: "#ffffff",
    background: "#0f766e",
    border: 0,
    borderRadius: 16,
    boxSizing: "border-box",
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
  outlineButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    marginTop: 12,
    padding: 15,
    color: "#0f172a",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 16,
    boxSizing: "border-box",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    display: "block",
    width: "100%",
    marginTop: 10,
    padding: 14,
    color: "#111827",
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 16,
    boxSizing: "border-box",
    fontSize: 16,
    cursor: "pointer",
  },
  textarea: {
    display: "block",
    width: "100%",
    minHeight: 84,
    marginTop: 12,
    padding: 12,
    border: "1.5px solid #e2e8f0",
    borderRadius: 16,
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#111827",
    fontSize: 16,
    lineHeight: 1.5,
    resize: "vertical",
  },
  note: {
    margin: "14px 0 0",
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 1.6,
    textAlign: "center",
  },
  successHeading: {
    margin: "14px 0 8px",
    fontSize: 22,
    lineHeight: 1.35,
  },
  bodyText: {
    margin: "0 0 4px",
    fontSize: 16,
    lineHeight: 1.7,
    color: "#475569",
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
    textAlign: "center",
    overflowWrap: "anywhere",
  },
};
