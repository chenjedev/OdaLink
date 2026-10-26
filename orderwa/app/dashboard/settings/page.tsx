"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Shop = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error: shopErr } = await supabase
        .from("shops")
        .select("id, name, slug, phone")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopErr) {
        console.error("Load shop failed:", shopErr.message);
        setError("Could not load your shop");
      }

      if (data) {
        const s = data as Shop;
        setShop(s);
        setName(s.name ?? "");
        setPhone(s.phone ?? "");
      }

      setLoading(false);
    }

    load();
  }, [router]);

  // A phone number needs 9 to 15 digits (spaces, + and dashes are allowed)
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = phoneDigits.length >= 9 && phoneDigits.length <= 15;
  const isInvalid = name.trim().length < 2 || !phoneOk;

  // Anything changed since the last save?
  const unchanged =
    !!shop &&
    name.trim() === (shop.name ?? "") &&
    phone.trim() === (shop.phone ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!shop) return;

    setError("");
    setSaved(false);

    if (isInvalid) {
      setError("Enter a shop name and a valid WhatsApp number");
      return;
    }

    setSaving(true);

    // .select() lets us see whether a row was really updated
    const { data, error: updateErr } = await supabase
      .from("shops")
      .update({ name: name.trim(), phone: phone.trim() })
      .eq("id", shop.id)
      .select("id, name, slug, phone");

    setSaving(false);

    if (updateErr) {
      console.error("Update shop failed:", updateErr.message);
      setError("Could not save your changes. Please try again.");
      return;
    }

    if (!data || data.length === 0) {
      setError("Nothing was saved. Check the update policy on the shops table.");
      return;
    }

    const updated = data[0] as Shop;
    setShop(updated);
    setName(updated.name ?? "");
    setPhone(updated.phone ?? "");
    setSaved(true);
  }

  if (loading) {
    return <p>Loading settings...</p>;
  }

  if (!shop) {
    return (
      <div className="products-page">
        <div className="product-header">
          <h2>Settings</h2>
        </div>
        <p style={{ color: "#dc2626" }}>
          {error || "No shop found for this account."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="products-page"
      style={{ padding: "12px", maxWidth: 520, boxSizing: "border-box" }}
    >
      <div className="product-header" style={{ marginBottom: "16px" }}>
        <h2>Settings</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Shop name</label>
          <input
            type="text"
            placeholder="eg. Irene Fashion"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            maxLength={40}
            required
          />
        </div>

        <div className="form-group">
          <label>WhatsApp number</label>
          <input
            type="tel"
            placeholder="eg. 0712345678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSaved(false);
            }}
            required
          />
          <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>
            Customers send their orders to this number on WhatsApp. Use a number
            that has WhatsApp.
          </p>
        </div>

        <div className="form-group">
          <label>Shop link name</label>
          <input type="text" value={shop.slug} readOnly disabled />
          <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>
            This cannot be changed, because customers already have links that
            use it.
          </p>
        </div>

        {error && <p className="form-error">{error}</p>}
        {saved && (
          <p style={{ color: "#16a34a", fontWeight: 600 }}>Changes saved</p>
        )}

        <div className="form-group">
          <button
            type="submit"
            className="save-btn"
            disabled={isInvalid || saving || unchanged}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}