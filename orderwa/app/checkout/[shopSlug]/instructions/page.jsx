
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

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const shopSlug = params.shopSlug;

  const [checkout, setCheckout] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

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
          setError("Njia ya malipo haipatikani. Tafadhali chagua nyingine.");
        } else {
          setPayment(method);
        }
      } catch (err) {
        console.error("Checkout loading error:", err);

        if (active) {
          setError("Imeshindwa kupakia taarifa za malipo. Jaribu tena.");
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

  const paymentLabel = paymentInfo?.label || payment?.method || "Malipo";
  const ussd = paymentInfo?.ussd || "";

  async function copyNumber() {
    if (!payment?.account_number) return;

    try {
      await navigator.clipboard.writeText(payment.account_number);
      setCopied(true);
      setError("");
    } catch {
      setError("Imeshindikana kunakili namba. Tafadhali iandike mwenyewe.");
    }
  }

  function openUSSD() {
    if (!ussd) return;

    // Baadhi ya simu/browser huhitaji mtumiaji kuthibitisha USSD.
    window.location.href = `tel:${encodeURIComponent(ussd).replace("%2A", "*").replace("%23", "%23")}`;
  }

  async function handleSendConfirmation() {
    if (sending || success || !checkout || !payment) return;

    setError("");

    if (!confirmation.trim()) {
      setError("Bandika ujumbe wa uthibitisho wa malipo kwanza.");
      return;
    }

    const sellerNumber = toWhatsAppNumber(checkout.shopPhone);

    if (!sellerNumber) {
      setError(
        "Namba ya WhatsApp ya duka haipo. Tafadhali wasiliana na muuzaji."
      );
      return;
    }

    setSending(true);

    // Fungua tab wakati wa kubonyeza button ili kupunguza popup blocking.
    const whatsappWindow = window.open("about:blank", "_blank");

    try {
      const items = checkout.cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));

      // Hifadhi oda kama pending. SMS ya mteja si uthibitisho wa malipo
      // mpaka muuzaji ahakiki malipo.
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
        `Habari ${checkout.shopName || ""}, nimelipa kupitia ${paymentLabel}.`,
        "",
        `Oda ID: ${order.id}`,
        `Jina: ${checkout.name.trim()}`,
        `Simu ya mteja: ${checkout.phone.trim()}`,
        "",
        "Bidhaa:",
        ...itemLines,
        "",
        `Jumla: ${Number(checkout.cartTotal).toLocaleString()} TZS`,
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

      const url =
        `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`;

      setWhatsappUrl(url);
      setSuccess(true);

      localStorage.removeItem(`cart:${shopSlug}`);
      sessionStorage.removeItem("odLinkCheckout");

      if (whatsappWindow) {
        whatsappWindow.location.href = url;
      } else {
        // Ikiwa browser imezuia tab mpya, mteja anaweza kutumia link iliyoonyeshwa.
        setWhatsappUrl(url);
      }
    } catch (err) {
      console.error("Order submission failed:", err);

      if (whatsappWindow) whatsappWindow.close();

      setError(
        err?.message?.includes("Not enough stock") ||
          err?.message?.includes("Product not available") ||
          err?.message?.includes("Invalid quantity")
          ? err.message
          : "Oda haikuhifadhiwa. Tafadhali jaribu tena."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>Inapakia taarifa za malipo...</div>
      </main>
    );
  }

  if (success) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>

          <h1 style={styles.heading}>Oda yako imepokelewa!</h1>

          <p style={styles.bodyText}>
            Oda imehifadhiwa. Tuma ujumbe wa WhatsApp ulioandaliwa ili
            muuzaji akague malipo yako.
          </p>

          <p style={styles.note}>
            Hali ya oda: <strong>Pending — inasubiri uthibitisho.</strong>
            {" "}Kubonyeza Send ndani ya WhatsApp kunahitajika ili ujumbe ufike.
          </p>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={styles.primaryButton}
            >
              Tuma ujumbe WhatsApp
            </a>
          )}

          <button
            type="button"
            onClick={() => router.push(`/${shopSlug}`)}
            style={styles.secondaryButton}
          >
            Rudi dukani
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
            {error || "Taarifa za malipo hazipatikani."}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/checkout/${shopSlug}/payment`)}
            style={styles.primaryButton}
          >
            Chagua njia nyingine ya malipo
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
          ← Rudi nyuma
        </button>

        <div style={styles.header}>
          <div style={styles.paymentIcon}>TSh</div>
          <div style={{ minWidth: 0 }}>
            <h1 style={styles.heading}>{paymentLabel}</h1>
            <p style={styles.muted}>Please follow instructions to pay</p>
          </div>
        </div>

        <div style={styles.totalBox}>
          <span>Jumla ya kulipa</span>
          <strong>
            TSh {Number(checkout.cartTotal || 0).toLocaleString()}
          </strong>
        </div>

        {ussd && (
          <button
            type="button"
            onClick={openUSSD}
            style={styles.callButton}
          >
            ☎ Call {ussd}
          </button>
        )}

        <div style={styles.detailsBox}>
          {payment.bank_name && (
            <div style={styles.detail}>
              <span style={styles.detailLabel}>Benki</span>
              <strong style={styles.detailValue}>{payment.bank_name}</strong>
            </div>
          )}

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Phone number / Namba ya malipo</span>
            <strong style={styles.detailValue}>
              {payment.account_number || "—"}
            </strong>
          </div>

          <div style={styles.detail}>
            <span style={styles.detailLabel}>Payee name / Jina la mpokeaji</span>
            <strong style={styles.detailValue}>
              {payment.account_name || "—"}
            </strong>
          </div>

          <button
            type="button"
            onClick={copyNumber}
            style={styles.copyButton}
          >
            {copied ? "Namba imenakiliwa ✓" : "Nakili namba"}
          </button>
        </div>

        <h2 style={styles.sectionTitle}>Payment instructions</h2>

        <ol style={styles.instructions}>
          <li>
            Dial <strong>{ussd || "namba ya huduma ya malipo"}</strong>.
          </li>
          <li>
            Choose <strong>Send Money</strong> or{" "}
            <strong>Merchant Payment</strong>.
          </li>
          <li>
            Enter the phone number or merchant code, then enter the amount.
          </li>
          <li>Confirm payment.</li>
        </ol>

        <div style={styles.confirmationBox}>
          <h2 style={styles.sectionTitle}>Payment confirmation</h2>

          <p style={styles.muted}>
            Baada ya kulipa, bandika SMS ya uthibitisho hapa chini.
          </p>

          <textarea
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Paste your payment confirmation SMS here..."
            rows={4}
            style={styles.textarea}
          />
        </div>

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
          {sending ? "Inahifadhi oda..." : "Send confirmation"}
        </button>

        <p style={styles.note}>
          Oda itakuwa Pending hadi muuzaji athibitishe malipo. Ujumbe
          utafunguka WhatsApp; bonyeza Send ndani ya WhatsApp ili uutume.
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "20px 12px",
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
    marginBottom: 14,
    color: "#0f766e",
    background: "transparent",
    border: 0,
    fontSize: 15,
    cursor: "pointer",
  },

  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    minWidth: 0,
    marginBottom: 18,
  },

  paymentIcon: {
    display: "flex",
    flex: "0 0 48px",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#e6f7ed",
    color: "#16834a",
    fontSize: 13,
    fontWeight: 700,
  },

  heading: {
    display: "block",
    margin: "0 0 4px",
    fontSize: 22,
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },

  muted: {
    display: "block",
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
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
    marginBottom: 14,
    background: "#f3f4f6",
    borderRadius: 10,
    boxSizing: "border-box",
  },

  callButton: {
    display: "block",
    width: "100%",
    padding: 14,
    marginBottom: 16,
    background: "#16834a",
    color: "#ffffff",
    border: 0,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  detailsBox: {
    display: "block",
    width: "100%",
    padding: 14,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    boxSizing: "border-box",
  },

  detail: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
    width: "100%",
    minWidth: 0,
    marginBottom: 14,
    fontSize: 14,
    lineHeight: 1.5,
  },

  detailLabel: {
    display: "block",
    width: "100%",
    color: "#6b7280",
    overflowWrap: "anywhere",
  },

  detailValue: {
    display: "block",
    width: "100%",
    color: "#111827",
    fontSize: 15,
    overflowWrap: "anywhere",
    wordBreak: "normal",
  },

  copyButton: {
    display: "block",
    width: "100%",
    padding: 11,
    color: "#0f766e",
    background: "#ffffff",
    border: "1px solid #0f766e",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  sectionTitle: {
    display: "block",
    margin: "20px 0 8px",
    fontSize: 17,
    lineHeight: 1.4,
  },

  instructions: {
    display: "block",
    paddingLeft: 22,
    margin: "10px 0 18px",
    fontSize: 14,
    lineHeight: 1.8,
    overflowWrap: "anywhere",
  },

  confirmationBox: {
    display: "block",
    width: "100%",
    marginTop: 12,
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
    cursor: "pointer",
    boxSizing: "border-box",
  },

  note: {
    display: "block",
    marginTop: 14,
    padding: 12,
    color: "#92400e",
    background: "#fffbeb",
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
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

  bodyText: {
    fontSize: 15,
    lineHeight: 1.7,
    overflowWrap: "anywhere",
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
