"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
// adjust path

type Props = {
  shopId: string;
  onClose: () => void;
  onAdded: () => void;
};

export default function AddProduct({ shopId, onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isInvalid =
    name.trim() === "" || price.trim() === "" || Number(price) <= 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isInvalid) {
      setError("Enter name and a valid price");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("products").insert({
      name: name.trim(),
      price: Number(price),
      image: image.trim() || null,
      shop_id: shopId,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onAdded();
  }

  return (
    <div className="add-product-modal">
      <div className="add-product-box">
        <h3>Add product</h3>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              type="text"
              placeholder="eg. Black t-shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label>Price (TZS)</label>
            <input
              type="number"
              placeholder="eg. 25000"
              value={price}
              min={1}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label>Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={isInvalid || loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
