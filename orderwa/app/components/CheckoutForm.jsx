
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

// Messages raised by our database trigger that are safe and useful to show the customer
const SAFE_MESSAGES = [
  "Not enough stock",
  "Product not available",
  "Invalid quantity",
  "Order must have",
];

const PAYMENT_OPTIONS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "tigopesa", label: "Tigo Pesa" },
  { value: "halopesa", label: "HaloPesa" },
  { value: "selcom", label: "Selcom" },
  { value: "bank", label: "Bank / Benki" },
];

// Tanzanian numbers: 0712345678 becomes 255712345678
function toWhatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.length === 9) return "255" + digits;
  return digits;
}

function CheckoutForm({
  cart,
  setCart,
  cartTotal,
  shopId,
  shopName,
  shopPhone,
  lang = "en",
}) {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const [step, setStep] = useState("details");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const t = (en, sw) => (lang === "sw" ? sw : en);

  const selectedPayment = paymentMethods.find(
    (item) => item.id === selectedPaymentId
  );

  const isInvalid =
    name.trim() === "" ||
    phone.trim().length < 10 ||
    cart.length === 0 ||
    sending;

  async function continueToPayment(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWhatsappUrl("");

    if (!shopId) {
      setError(
        t(
          "This shop is not available right now.",
          "Duka hili halipatikani kwa sasa."
        )
      );
      return;
    }

    if (name.trim() === "" || phone.trim().length < 10) {
      setError(
        t(
          "Please enter your name and a valid phone number.",
          "Tafadhali weka jina lako na namba sahihi ya simu."
        )
      );
      return;
    }

    if (cart.length === 0) {
      setError(t("Your cart is empty.", "Kikapu chako hakina bidhaa."));
      return;
    }

    setLoadingPayments(true);

    const { data, error: paymentError } = await supabase
      .from("shop_payment_methods")
      .select(
        "id, shop_id, method, account_name, account_number, bank_name, is_enabled"
      )
      .eq("shop_id", shopId)
      .eq("is_enabled", true)
      .order("created_at", { ascending: true });

    setLoadingPayments(false);

    if (paymentError) {
      console.error("Load payment methods failed:", paymentError.message);
      setError(
        t(
          "Could not load payment methods. Please try again.",
          "Imeshindwa kupakia njia za malipo. Tafadhali jaribu tena."
        )
      );
      return;
    }

    if (!data || data.length === 0) {
      setError(
        t(
          "This shop has no payment methods available yet. Please contact the seller.",
          "Duka hili bado halijaweka njia za malipo. Tafadhali wasiliana na muuzaji."
        )
      );
      return;
    }

    setPaymentMethods(data);
    setSelectedPaymentId(data[0].id);
    setStep("payment");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWhatsappUrl("");

    if (!shopId) {
      setError(
        t(
          "This shop is not available right now.",
          "Duka hili halipatikani kwa sasa."
        )
      );
      return;
    }

    if (!selectedPayment) {
      setError(
        t(
          "Please select a payment method.",
          "Tafadhali chagua njia ya malipo."
        )
      );
      return;
    }

    if (name.trim() === "" || phone.trim().length < 10) {
      setError(
        t(
          "Please enter your name and a valid phone number.",
          "Tafadhali weka jina lako na namba sahihi ya simu."
        )
      );
      setStep("details");
      return;
    }

    if (cart.length === 0) {
      setError(t("Your cart is empty.", "Kikapu chako hakina bidhaa."));
      return;
    }

    setSending(true);

    // Keep the existing order structure unchanged.
    const items = cart.map((item) => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabase.from("orders").insert({
      shop_id: shopId,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      items,
      total: cartTotal,
    });

    setSending(false);

    if (insertError) {
      console.error("Order failed:", insertError.message);

      const isSafe = SAFE_MESSAGES.some((message) =>
        insertError.message.startsWith(message)
      );

      setError(
        isSafe
          ? insertError.message
          : t(
              "Could not send your order. Please try again.",
              "Oda yako haikutumwa. Tafadhali jaribu tena."
            )
      );

      if (isSafe) router.refresh();
      return;
    }

    // Prepare the WhatsApp message for the seller.
    const sellerNumber = toWhatsAppNumber(shopPhone);

    if (sellerNumber) {
      const lines = cart.map(
        (item) =>
          `• ${item.name} x${item.quantity} — ${(
            item.price * item.quantity
          ).toLocaleString()} TZS`
      );

      const paymentLines = [
        `Payment method: ${
          PAYMENT_OPTIONS.find(
            (option) => option.value === selectedPayment.method
          )?.label || selectedPayment.method
        }`,
        `Payment account name: ${selectedPayment.account_name}`,
        `Payment account number: ${selectedPayment.account_number}`,
      ];

      if (selectedPayment.bank_name) {
        paymentLines.push(`Bank: ${selectedPayment.bank_name}`);
      }

      const text = [
        `Hello ${shopName || ""}, I just placed an order on OdaLink:`,
        "",
        ...lines,
        "",
        `Total: ${cartTotal.toLocaleString()} TZS`,
        "",
        ...paymentLines,
        "",
        `Customer name: ${name.trim()}`,
        `Customer phone: ${phone.trim()}`,
        "",
        `Manage this order (seller): ${window.location.origin}/dashboard/orders?q=${encodeURIComponent(
          phone.trim()
        )}`,
      ].join("\n");

      setWhatsappUrl(
        `https://wa.me/${sellerNumber}?text=${encodeURIComponent(text)}`
      );
    }

    setSuccess(
      t(
        `Order sent to ${shopName || "the shop"}. They will contact you on ${phone.trim()}.`,
        `Oda imetumwa kwa ${shopName || "duka"}. Watawasiliana nawe kupitia ${phone.trim()}.`
      )
    );

    setName("");
    setPhone("");
    setStep("details");
    setPaymentMethods([]);
    setSelectedPaymentId("");
    setCart([]);

    router.refresh();
  }

  // Show success after the cart has been cleared.
  if (cart.length === 0) {
    if (!success) return null;

    return (
      <div className="checkout-box">
        <p
          style={{
            color: "#0f766e",
            fontWeight: 600,
            margin: "4px 0 14px",
          }}
        >
          {success}
        </p>

        {whatsappUrl && (
          <>
            <p style={{ margin: "0 0 10px" }}>
              {t(
                "For a faster reply, also send your order on WhatsApp:",
                "Ili upate majibu haraka, pia tuma oda yako kupitia WhatsApp:"
              )}
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                padding: "12px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                background: "#0f766e",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              {t("Send on WhatsApp", "Tuma kupitia WhatsApp")}
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="checkout-box">
      {step === "details" && (
        <form onSubmit={continueToPayment}>
          <input
            type="text"
            placeholder={t(
              "Your name, eg. John Doe",
              "Jina lako, mfano John Doe"
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder={t(
              "Phone, eg. 0712345678",
              "Namba ya simu, mfano 0712345678"
            )}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          {error && <p style={{ color: "#dc2626" }}>{error}</p>}

          <button
            type="submit"
            disabled={isInvalid || loadingPayments}
          >
            {loadingPayments
              ? t("Loading payment methods...", "Inapakia njia za malipo...")
              : t(
                  `Proceed to checkout · ${cartTotal.toLocaleString()} TZS`,
                  `Endelea na checkout · ${cartTotal.toLocaleString()} TZS`
                )}
          </button>
        </form>
      )}

      {step === "payment" && (
        <div>
          <h3 style={{ marginTop: 0 }}>
            {t("Choose payment method", "Chagua njia ya malipo")}
          </h3>

          <p style={{ marginBottom: 16 }}>
            {t("Order total:", "Jumla ya oda:")}{" "}
            <strong>{cartTotal.toLocaleString()} TZS</strong>
          </p>

          {paymentMethods.map((item) => {
            const label =
              PAYMENT_OPTIONS.find(
                (option) => option.value === item.method
              )?.label || item.method;

            return (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  border:
                    selectedPaymentId === item.id
                      ? "2px solid #0f766e"
                      : "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={item.id}
                  checked={selectedPaymentId === item.id}
                  onChange={() => setSelectedPaymentId(item.id)}
                  style={{ marginTop: 4 }}
                />

                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong>{label}</strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 6,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {t("Account name:", "Jina la akaunti:")}{" "}
                    {item.account_name}
                  </span>

                  <span
                    style={{
                      display: "block",
                      marginTop: 4,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {t("Payment number:", "Namba ya malipo:")}{" "}
                    {item.account_number}
                  </span>

                  {item.method === "bank" && item.bank_name && (
                    <span style={{ display: "block", marginTop: 4 }}>
                      {t("Bank:", "Benki:")} {item.bank_name}
                    </span>
                  )}
                </span>
              </label>
            );
          })}

          {error && (
            <p style={{ color: "#dc2626" }} role="alert">
              {error}
            </p>
          )}

          <p style={{ fontSize: 13, color: "#6b7280" }}>
            {t(
              "Check the payment details carefully before making a payment.",
              "Kagua taarifa za malipo kwa makini kabla ya kulipa."
            )}
          </p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || !selectedPayment}
          >
            {sending
              ? t("Sending order...", "Inatuma oda...")
              : t(
                  `Place order · ${cartTotal.toLocaleString()} TZS`,
                  `Tuma oda · ${cartTotal.toLocaleString()} TZS`
                )}
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setStep("details");
            }}
            disabled={sending}
            style={{
              display: "block",
              marginTop: 10,
              background: "transparent",
              color: "inherit",
              border: "1px solid #d1d5db",
            }}
          >
            {t("Back", "Rudi nyuma")}
          </button>
        </div>
      )}
    </div>
  );
}

export default CheckoutForm;
