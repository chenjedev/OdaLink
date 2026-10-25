"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

// Messages raised by our database trigger that are safe and useful to show the customer
const SAFE_MESSAGES = [
  "Not enough stock",
  "Product not available",
  "Invalid quantity",
  "Order must have",
];

function CheckoutForm({ cart, setCart, cartTotal, shopId, shopName }) {
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
      return;
    }

    setSuccess(
      `Order sent to ${shopName || "the shop"}. They will contact you on ${phone.trim()}.`
    );
    setName("");
    setPhone("");
    setCart([]);
  }

  return (
    <div className="checkout-box">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="eg. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="tel"
          placeholder="eg. 0712345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {cart.map((item, index) => (
          <p key={index}>
            {item.name} x{item.quantity} —{" "}
            {(item.price * item.quantity).toLocaleString()} TZS
          </p>
        ))}

        <p>Total: {cartTotal.toLocaleString()} TZS</p>

        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {success && <p style={{ color: "#16a34a" }}>{success}</p>}

        <button type="submit" disabled={isInvalid}>
          {sending ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;