"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../../lib/supabase";

const BUCKET = "product-images";
const MAX_PICK_BYTES = 15 * 1024 * 1024; // refuse huge files before processing
const MAX_SIDE = 1000; // longest side in pixels after resizing

// Phone photos are often several MB. Shrink to ~1000px JPEG before upload,
// which keeps each file small and well under the 5 MB bucket limit.
async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image");

  // JPEG has no transparency, so paint white behind PNGs
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not process the image")),
      "image/jpeg",
      0.8
    );
  });
}

// Turn a public image URL back into its path inside the bucket
function pathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

type EditableProduct = {
  id: number | string;
  name: string;
  price: number;
  category?: string | null;
  stock?: number | null;
  image_url?: string | null;
};

type Props = {
  shopId: string;
  product?: EditableProduct | null; // when given, this form edits that product
  onClose: () => void;
  onAdded: () => void; // called after add, edit or delete so the list reloads
};

export default function AddProduct({ shopId, product, onClose, onAdded }: Props) {
  const editing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock ?? 0) : "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(""); // preview of a newly picked photo
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    product?.image_url ?? null
  ); // photo shown now
  const originalImageUrl = product?.image_url ?? null; // photo saved in the database
  const [inputKey, setInputKey] = useState(0); // used to clear the file input
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isInvalid =
    name.trim() === "" ||
    price.trim() === "" ||
    Number(price) <= 0 ||
    stock.trim() === "" ||
    Number(stock) < 0;

  const displayImage = preview || existingImageUrl || "";

  // Free the temporary preview URL when it changes or the form closes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError("");

    if (!file) {
      setImageFile(null);
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PICK_BYTES) {
      setError("That photo is too large. Choose one under 15 MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setImageFile(null);
    setPreview("");
    setExistingImageUrl(null);
    setInputKey((k) => k + 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isInvalid) {
      setError("Fill name, price and stock correctly");
      setLoading(false);
      return;
    }

    let uploadedPath: string | null = null;

    try {
      // 1. Photo: keep the current one, or upload a new one
      let imageUrl: string | null = existingImageUrl;

      if (imageFile) {
        const blob = await resizeImage(imageFile);
        const path = `${shopId}/${crypto.randomUUID()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: "image/jpeg" });

        if (uploadError) {
          console.error("Upload failed:", uploadError.message);
          setError("Could not upload the photo. Try another one.");
          return;
        }

        uploadedPath = path;
        imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data
          .publicUrl;
      }

      // 2. Save the product (update when editing, insert when new)
      const fields = {
        name: name.trim(),
        category: category.trim() || null,
        price: Number(price),
        stock: Number(stock),
        image_url: imageUrl,
      };

      let saveError: string | null = null;

      if (product) {
        const { data, error: updateError } = await supabase
          .from("products")
          .update(fields)
          .eq("id", product.id)
          .eq("shop_id", shopId)
          .select("id");

        if (updateError) saveError = updateError.message;
        else if (!data || data.length === 0)
          saveError = "Nothing was updated. Check the update policy on products.";
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert({ ...fields, shop_id: shopId });
        if (insertError) saveError = insertError.message;
      }

      if (saveError) {
        // Don't leave an orphan photo behind
        if (uploadedPath) {
          await supabase.storage.from(BUCKET).remove([uploadedPath]);
        }
        setError(saveError);
        return;
      }

      // 3. Saved. If the old photo was replaced or removed, delete it from storage
      if (originalImageUrl && originalImageUrl !== imageUrl) {
        const oldPath = pathFromUrl(originalImageUrl);
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Save product failed:", err);
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Soft delete: the product stays in the database (old orders stay safe)
  // but disappears from the dashboard and the storefront.
  async function handleDelete() {
    if (!product) return;

    const ok = window.confirm(
      `Delete "${product.name}"? Customers won't see it anymore. Past orders stay safe.`
    );
    if (!ok) return;

    setError("");
    setLoading(true);

    const { data, error: deleteError } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", product.id)
      .eq("shop_id", shopId)
      .select("id");

    setLoading(false);

    if (deleteError || !data || data.length === 0) {
      console.error("Delete product failed:", deleteError?.message);
      setError("Could not delete the product");
      return;
    }

    onAdded();
    onClose();
  }

  if (isSuccess) {
    return (
      <div className="modal-overlay">
        <div className="add-prod-page">
          <div className="register-form">
            <div className="add-prod-header">
              <h2>{editing ? "Product updated" : "Product added successfully"}</h2>
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

            {displayImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={name}
                style={{ maxWidth: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 8 }}
              />
            )}

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
              <strong>{Number(price).toLocaleString()} TZS</strong>
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
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
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

          <div className="form-group">
            <label>Photo (optional)</label>
            <input
              key={inputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            {displayImage && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt="Preview"
                  style={{ marginTop: 8, maxWidth: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 8 }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    display: "block",
                    marginTop: 6,
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Remove photo
                </button>
              </>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-group">
            <button
              type="submit"
              className="save-btn"
              disabled={isInvalid || loading}
            >
              {loading ? "Saving..." : editing ? "Save changes" : "Save"}
            </button>
          </div>

          {editing && (
            <div className="form-group">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "none",
                  border: "1px solid #dc2626",
                  color: "#dc2626",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete product
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}