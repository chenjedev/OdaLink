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

// WhatsApp links need the number in international form, digits only.
// Tanzanian numbers: 0712345678 becomes 255712345678
function toWhatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.length === 9) return "255" + digits;
  return digits;
}

function CheckoutForm({ cart, setCart, cartTotal, shopId, shopName, shopPhone }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const isInvalid =
    name.trim() === "" ||
    phone.trim().length < 10 ||
    cart.length === 0 ||
    sending;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setWhatsappUrl("");

    if (!shopId) {
      setError("This shop is not available right now.");
      return;
    }
    if (name.trim() === "" || phone.trim().length < 10) {
      setError("Please enter your name and a valid phone number");
      return;
    }
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setSending(true);

    // Keep only what the shop needs to see
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

      // Show the database's own message only when it is one of ours
      const isSafe = SAFE_MESSAGES.some((m) =>
        insertError.message.startsWith(m)
      );
      setError(
        isSafe
          ? insertError.message
          : "Could not send your order. Please try again."
      );

      // Reload the shop's products so stock numbers and cart limits are fresh
      if (isSafe) router.refresh();
      return;
    }

    // The order is saved. Now prepare the WhatsApp message for the seller.
    // This must happen before the cart is cleared, because it lists the items.
    const sellerNumber = toWhatsAppNumber(shopPhone);
    if (sellerNumber) {
      const lines = cart.map(
        (item) =>
          `• ${item.name} x${item.quantity} — ${(
            item.price * item.quantity
          ).toLocaleString()} TZS`
      );
      const text = [
        `Hello ${shopName || ""}, I just placed an order on OdaLink:`,
        "",
        ...lines,
        "",
        `Total: ${cartTotal.toLocaleString()} TZS`,
        `Name: ${name.trim()}`,
        `Phone: ${phone.trim()}`,
         "",
        `Manage this order (seller): ${window.location.origin}/dashboard/orders?q=${encodeURIComponent(phone.trim())}`,
      ].join("\n");

      setWhatsappUrl(
        `https://wa.me/${sellerNumber}?text=${encodeURIComponent(text)}`
      );
    }

    setSuccess(
      `Order sent to ${shopName || "the shop"}. They will contact you on ${phone.trim()}.`
    );
    setName("");
    setPhone("");
    setCart([]);

    // Reload the shop's products so the new stock numbers show
    router.refresh();
  }

  // Nothing to order: after an order show the success message (and the WhatsApp
  // button), otherwise show nothing
  if (cart.length === 0) {
    if (!success) return null;

    return (
      <div className="checkout-box">
        <p style={{ color: "#16a34a", fontWeight: 600, margin: "4px 0 14px" }}>{success}</p>

        {whatsappUrl && (
          <>
            <p style={{ margin: "0 0 10px" }}>For a faster reply, also send your order on WhatsApp:</p>

            {/* A link (not window.open), because phones block popups opened after a delay */}
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
                background: "#25D366",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Send on WhatsApp
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="checkout-box">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name, eg. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone, eg. 0712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        <button type="submit" disabled={isInvalid}>
          {sending
            ? "Sending..."
            : `Send order · ${cartTotal.toLocaleString()} TZS`}
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;