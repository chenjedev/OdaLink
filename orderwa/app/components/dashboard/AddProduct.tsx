"use client";

import { useState, FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

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
  const [isSuccess, setIsSuccess] = useState(false);

  const isInvalid =
    name.trim() === "" || price.trim() === "" || Number(price) <= 0;

  async function handleSubmit(e: FormEvent) {
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
    setIsSuccess(true);
  }

  // Success screen
  if (isSuccess) {
    return (
      <div className="modal-overlay">
        <div className="add-prod-page">
          <div className="register-form">
            <div className="add-prod-header">
              <h2>Product added successfully</h2>
              <button type="button" className="cancel-btn" onClick={() => { onAdded(); onClose(); }}>
                x
              </button>
            </div>

            <div className="detail-row">
              <span>Name</span>
              <strong>{name}</strong>
            </div>
            <div className="detail-row">
              <span>Price</span>
              <strong>{Number(price).toLocaleString()} Tsh</strong>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="save-btn"
                onClick={() => {
                  onAdded();
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="modal-overlay">
      <div className="add-prod-page">
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="add-prod-header">
            <h2>Add Product</h2>
            <button type="button" className="cancel-btn" onClick={onClose}>
              x
            </button>
          </div>

          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="eg. Black t-shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price (TZS)</label>
            <input
              type="number"
              placeholder="eg. 25000"
              value={price}
              min={1}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <button
              type="submit"
              className="save-btn"
              disabled={isInvalid || loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
