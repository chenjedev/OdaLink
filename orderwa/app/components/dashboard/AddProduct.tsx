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
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isInvalid =
    name.trim() === "" ||
    price.trim() === "" ||
    Number(price) <= 0 ||
    stock.trim() === "" ||
    Number(stock) < 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isInvalid) {
      setError("Fill name, price and stock correctly");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("products").insert({
      name: name.trim(),
      category: category.trim() || null,
      price: Number(price),
      stock: Number(stock),
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

  if (isSuccess) {
    return (
      <div className="modal-overlay">
        <div className="add-prod-page">
          <div className="register-form">
            <div className="add-prod-header">
              <h2>Product added successfully</h2>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  onAdded();
                  onClose();
                }}
              >
                x
              </button>
            </div>

            <div className="detail-row">
              <span>Name</span>
              <strong>{name}</strong>
            </div>
            <div className="detail-row">
              <span>Category</span>
              <strong>{category || "—"}</strong>
            </div>
            <div className="detail-row">
              <span>Price</span>
              <strong>{Number(price).toLocaleString()} Tsh</strong>
            </div>
            <div className="detail-row">
              <span>Stock</span>
              <strong>{stock}</strong>
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
            <label>Category</label>
            <input
              type="text"
              placeholder="eg. shoes, tshirt, bag"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label>Stock</label>
            <input
              type="number"
              placeholder="eg. 20"
              value={stock}
              min={0}
              onChange={(e) => setStock(e.target.value)}
              required
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
