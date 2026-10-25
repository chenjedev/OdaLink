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

function CheckoutForm({ cart, setCart, cartTotal, shopId, shopName }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isInvalid =
    name.trim() === "" ||
    phone.trim().length < 10 ||
    cart.length === 0 ||
    sending;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

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

    setSuccess(
      `Order sent to ${shopName || "the shop"}. They will contact you on ${phone.trim()}.`
    );
    setName("");
    setPhone("");
    setCart([]);

    // Reload the shop's products so the new stock numbers show
    router.refresh();
  }

  // Nothing to order: show only the success message after an order, otherwise nothing
  if (cart.length === 0) {
    return success ? (
      <div className="checkout-box">
        <p style={{ color: "#16a34a" }}>{success}</p>
      </div>
    ) : null;
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