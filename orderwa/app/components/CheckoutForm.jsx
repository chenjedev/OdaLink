
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function CheckoutForm({
  cart,
  cartTotal,
  shopId,
  shopName,
  shopPhone,
  shopSlug,
  lang = "en",
}) {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = (en, sw) => (lang === "sw" ? sw : en);

  async function continueToPayment(e) {
    e.preventDefault();
    setError("");

    if (!shopId || !shopSlug) {
      setError(
        t(
          "This shop is not available right now.",
          "Duka hili halipatikani kwa sasa."
        )
      );
      return;
    }

    if (!name.trim() || phone.trim().length < 10) {
      setError(
        t(
          "Please enter your name and a valid phone number.",
          "Tafadhali weka jina lako na namba sahihi ya simu."
        )
      );
      return;
    }

    if (!cart || cart.length === 0) {
      setError(
        t("Your cart is empty.", "Kikapu chako hakina bidhaa.")
      );
      return;
    }

    setLoading(true);

    try {
      const checkoutData = {
        shopId,
        shopName: shopName || "",
        shopPhone: shopPhone || "",
        shopSlug,
        name: name.trim(),
        phone: phone.trim(),
        cart,
        cartTotal,
        lang,
      };

      sessionStorage.setItem(
        "odLinkCheckout",
        JSON.stringify(checkoutData)
      );

      router.push(
        `/checkout/${encodeURIComponent(shopSlug)}/payment`
      );
    } catch (err) {
      console.error("Checkout navigation error:", err);
      setError(
        t(
          "Could not continue to checkout. Please try again.",
          "Imeshindikana kuendelea. Tafadhali jaribu tena."
        )
      );
      setLoading(false);
    }
  }

  return (
    <div className="checkout-box">
      <form onSubmit={continueToPayment}>
        <input
          type="text"
          placeholder={t(
            "Your name, eg. John Doe",
            "Jina lako, mfano John Doe"
          )}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
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
          autoComplete="tel"
          required
        />

        {error && (
          <p role="alert" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            !name.trim() ||
            phone.trim().length < 10 ||
            !cart?.length
          }
        >
          {loading
            ? t("Opening checkout...", "Inafungua checkout...")
            : t(
                `Proceed to checkout · ${Number(cartTotal).toLocaleString()} TZS`,
                `Endelea na malipo · ${Number(cartTotal).toLocaleString()} TZS`
              )}
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;
