
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

function toWhatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.length === 9) return "255" + digits;

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const t = (en, sw) =>
    checkout?.lang === "sw" ? sw : en;

  useEffect(() => {
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

      const paymentId = data.selectedPaymentId;

      if (!paymentId) {
        router.replace(`/checkout/${shopSlug}/payment`);
        return;
      }

      setCheckout(data);

      async function loadPayment() {
        const { data: methods, error: paymentError } = await supabase
          .from("shop_payment_methods")
          .select(
            "id, shop_id, method, account_name, account_number, bank_name"
          )
          .eq("shop_id", data.shopId)
          .eq("is_enabled", true)
          .eq("id", paymentId)
          .maybeSingle();

        if (paymentError) {
          console.error(paymentError);
          setError(
            "Imeshindwa kupata taarifa za malipo. Tafadhali jaribu tena."
          );
        } else if (!methods) {
          setError(
            "Njia hii ya malipo haipatikani tena. Tafadhali chagua nyingine."
          );
        } else {
          setPayment(methods);
        }

        setLoading(false);
      }

      loadPayment();
    } catch (err) {
      console.error(err);
      setError("Taarifa za checkout hazijasomeka. Tafadhali anza tena.");
      setLoading(false);
    }
  }, [shopSlug, router]);

  async function copyNumber() {
    if (!payment?.account_number) return;

    try {
      await navigator.clipboard.writeText(payment.account_number);
      setCopied(true);
    } catch {
      setError(
        "Imeshindikana kunakili namba. Tafadhali iandike mwenyewe."
      );
    }
  }

  async function handlePaid() {
    if (sending || success || !checkout || !payment) return;

    setSending(true);
    setError("");

    // Fungua dirisha mapema ili browser isizuie WhatsApp baada ya kuhifadhi oda.
    const whatsappWindow = window.open("about:blank", "_blank");

    try {
      const items = checkout.cart.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      // Hifadhi oda kwa status pending; malipo bado yanahitaji kuthibitishwa.
      const { data: order, error: insertError } = await supabase
        .from("orders")
        .insert({
          shop_id: checkout.shopId,
          customer_name: checkout.name.trim(),
          customer_phone: checkout.phone.trim(),
          items,
          total: checkout.cartTotal,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const paymentLabel =
        PAYMENT_OPTIONS.find((item) => item.value === payment.method)
          ?.label || payment.method;

      const orderLines = checkout.cart.map(
        (item) =>
          `- ${item.name} x${item.quantity} — ${(
            Number(item.price) * Number(item.quantity)
          ).toLocaleString()} TZS`
      );

      const message = [
        `Habari ${checkout.shopName || ""}, nimeweka oda kupitia OdaLink.`,
        "",
        `Oda ID: ${order.id}`,
        `Jina: ${checkout.name.trim()}`,
        `Simu: ${checkout.phone.trim()}`,
        "",
        "Bidhaa:",
        ...orderLines,
        "",
        `Jumla: ${Number(checkout.cartTotal).toLocaleString()} TZS`,
        `Njia ya malipo: ${paymentLabel}`,
        `Jina la akaunti: ${payment.account_name}`,
        `Namba ya malipo: ${payment.account_number}`,
        ...(payment.bank_name ? [`Benki: ${payment.bank_name}`] : []),
        "",
        "Nimechagua I Have Paid. Tafadhali hakiki malipo yangu na uthibitishe oda.",
      ].join("\n");

      const sellerNumber = toWhatsAppNumber(checkout.shopPhone);

      const url = sellerNumber
        ? `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`
        : "";

      setWhatsappUrl(url);
      setSuccess(true);

      // Futa kikapu baada tu ya oda kuhifadhiwa kwa mafanikio.
      localStorage.removeItem(`cart:${shopSlug}`);
      sessionStorage.removeItem("odLinkCheckout");

      if (url && whatsappWindow) {
        whatsappWindow.location.href = url;
      } else if (whatsappWindow) {
        whatsappWindow.close();
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

          <p style={styles.successText}>
            Oda yako imepokelewa na inashughulikiwa. Muuzaji atakagua malipo
            yako na kukuthibitishia oda.
          </p>

          <p style={styles.note}>
            Hali ya oda: <strong>Inasubiri uthibitisho (Pending)</strong>
          </p>

          {whatsappUrl ? (
            <>
              <p style={styles.muted}>
                WhatsApp inafunguka ikiwa na ujumbe wa oda yako. Ikiwa
                haijafunguka, bonyeza hapa chini kutuma ujumbe kwa muuzaji.
              </p>

              <a href={whatsappUrl} target="_blank" rel="noreferrer" style={styles.primaryButton}>
                Tuma oda kupitia WhatsApp
              </a>
            </>
          ) : (
            <p style={styles.muted}>
              Oda imehifadhiwa. Wasiliana na duka moja kwa moja ili
              kuwajulisha kuhusu malipo yako.
            </p>
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
          <p style={styles.error}>
            {error || "Taarifa za malipo hazipatikani."}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/checkout/${shopSlug}/payment`)}
            style={styles.primaryButton}
          >
            Chagua njia ya malipo tena
          </button>
        </div>
      </main>
    );
  }

  const paymentLabel =
    PAYMENT_OPTIONS.find((item) => item.value === payment.method)?.label ||
    payment.method;

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

        <h1 style={styles.heading}>Maelekezo ya malipo</h1>

        <p style={styles.muted}>
          Lipa kiasi kilichoonyeshwa kwa kutumia taarifa hizi.
        </p>

        <div style={styles.totalBox}>
          <span>Jumla ya kulipa</span>
          <strong>
            {Number(checkout.cartTotal).toLocaleString()} TZS
          </strong>
        </div>

        <div style={styles.detailsBox}>
          <p style={styles.detail}>
            <span>Njia ya malipo</span>
            <strong>{paymentLabel}</strong>
          </p>

          {payment.bank_name && (
            <p style={styles.detail}>
              <span>Benki</span>
              <strong>{payment.bank_name}</strong>
            </p>
          )}

          <p style={styles.detail}>
            <span>Jina la akaunti</span>
            <strong>{payment.account_name}</strong>
          </p>

          <p style={styles.detail}>
            <span>Namba ya malipo</span>
            <strong style={{ overflowWrap: "anywhere" }}>
              {payment.account_number}
            </strong>
          </p>

          <button
            type="button"
            onClick={copyNumber}
            style={styles.copyButton}
          >
            {copied ? "Namba imenakiliwa ✓" : "Nakili namba ya malipo"}
          </button>
        </div>

        <ol style={styles.instructions}>
          <li>Fanya malipo kwa namba iliyoonyeshwa hapo juu.</li>
          <li>Hakikisha umetuma kiasi sahihi cha oda yako.</li>
          <li>Baada ya kulipa, bonyeza kitufe cha “I Have Paid”.</li>
          <li>WhatsApp itafunguka ili utume taarifa za oda kwa muuzaji.</li>
        </ol>

        <p style={styles.note}>
          Kubonyeza “I Have Paid” hakuthibitishi malipo yenyewe. Muuzaji
          atahakiki malipo kabla ya kuthibitisha oda.
        </p>

        {error && <p role="alert" style={styles.error}>{error}</p>}

        <button
          type="button"
          onClick={handlePaid}
          disabled={sending}
          style={{
            ...styles.primaryButton,
            opacity: sending ? 0.65 : 1,
          }}
        >
          {sending ? "Inahifadhi oda..." : "I Have Paid"}
        </button>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#111827",
    padding: "24px 14px",
    boxSizing: "border-box",
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
    color: "#0f766e",
    fontSize: 15,
    cursor: "pointer",
  },
  heading: {
    fontSize: 24,
    margin: "18px 0 8px",
  },
  muted: {
    color: "#6b7280",
    lineHeight: 1.6,
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 16,
    margin: "18px 0",
    background: "#f3f4f6",
    borderRadius: 10,
  },
  detailsBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 14,
  },
  detail: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    margin: "0 0 14px",
    fontSize: 14,
  },
  copyButton: {
    width: "100%",
    padding: 11,
    border: "1px solid #0f766e",
    borderRadius: 8,
    color: "#0f766e",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  instructions: {
    paddingLeft: 22,
    lineHeight: 1.8,
    fontSize: 14,
    marginTop: 22,
  },
  note: {
    padding: 12,
    background: "#fffbeb",
    color: "#92400e",
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.6,
  },
  primaryButton: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    marginTop: 16,
    padding: 14,
    background: "#0f766e",
    color: "#fff",
    border: 0,
    borderRadius: 9,
    fontSize: 16,
    fontWeight: 700,
    textDecoration: "none",
    cursor: "pointer",
  },
  secondaryButton: {
    width: "100%",
    marginTop: 10,
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 9,
    background: "#fff",
    cursor: "pointer",
  },
  successIcon: {
    display: "grid",
    placeItems: "center",
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "#d1fae5",
    color: "#047857",
    fontSize: 30,
    fontWeight: 700,
  },
  successText: {
    lineHeight: 1.7,
  },
  error: {
    color: "#dc2626",
    lineHeight: 1.6,
  },
};
