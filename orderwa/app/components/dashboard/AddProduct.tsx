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

const styles = `
.ap-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  padding: 0;
}
.ap-dialog {
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  max-height: 92dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px 18px calc(24px + env(safe-area-inset-bottom, 0px));
  color: #0f172a;
}
@media (min-width: 640px) {
  .ap-overlay { align-items: center; padding: 16px; }
  .ap-dialog { border-radius: 18px; padding: 24px; }
}
.ap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.ap-header h2 { margin: 0; font-size: 20px; font-weight: 700; }
.ap-close {
  flex: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #334155;
  font-size: 16px;
  cursor: pointer;
}
.ap-field { margin-bottom: 16px; }
.ap-field label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.ap-field input[type="text"],
.ap-field input[type="number"] {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
  font-size: 16px;
  color: #0f172a;
  outline: none;
}
.ap-field input:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}
.ap-field input[type="file"] {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 14px;
}
.ap-preview {
  display: block;
  margin-top: 10px;
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 10px;
  background: #f8fafc;
}
.ap-link-danger {
  display: block;
  margin-top: 8px;
  padding: 0;
  border: 0;
  background: none;
  color: #dc2626;
  font-weight: 600;
  cursor: pointer;
}
.ap-error { margin: 0 0 14px; color: #dc2626; font-size: 14px; }
.ap-save {
  width: 100%;
  padding: 14px;
  border: 0;
  border-radius: 12px;
  background: #0f766e;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.ap-save:disabled { background: #94c8c1; cursor: not-allowed; }
.ap-delete {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border: 1px solid #dc2626;
  border-radius: 12px;
  background: #fff;
  color: #dc2626;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.ap-delete:disabled { opacity: 0.6; }
.ap-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 15px;
}
.ap-row span { color: #64748b; }
.ap-row strong { text-align: right; overflow-wrap: anywhere; }
`;

export default function AddProduct({
  shopId,
  product,
  onClose,
  onAdded,
}: Props) {
  const editing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(
    product ? String(product.stock ?? 0) : ""
  );
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

  // Stop the page behind the modal from scrolling
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

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
          saveError =
            "Nothing was updated. Check the update policy on products.";
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

  function finish() {
    onAdded();
    onClose();
  }

  if (isSuccess) {
    return (
      <div className="ap-overlay">
        <style>{styles}</style>
        <div className="ap-dialog" role="dialog" aria-modal="true">
          <div className="ap-header">
            <h2>{editing ? "Product updated" : "Product added"}</h2>
            <button
              type="button"
              className="ap-close"
              onClick={finish}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {displayImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="ap-preview" src={displayImage} alt={name} />
          )}

          <div className="ap-row">
            <span>Name</span>
            <strong>{name}</strong>
          </div>
          <div className="ap-row">
            <span>Category</span>
            <strong>{category || "—"}</strong>
          </div>
          <div className="ap-row">
            <span>Price</span>
            <strong>{Number(price).toLocaleString()} TZS</strong>
          </div>
          <div className="ap-row">
            <span>Stock</span>
            <strong>{stock}</strong>
          </div>

          <button
            type="button"
            className="ap-save"
            style={{ marginTop: 20 }}
            onClick={finish}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-overlay">
      <style>{styles}</style>

      <div className="ap-dialog" role="dialog" aria-modal="true">
        <form onSubmit={handleSubmit}>
          <div className="ap-header">
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
            <button
              type="button"
              className="ap-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="ap-field">
            <label>Name</label>
            <input
              type="text"
              placeholder="eg. Black t-shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="ap-field">
            <label>Category</label>
            <input
              type="text"
              placeholder="eg. shoes, tshirt, bag"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="ap-field">
            <label>Price (TZS)</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="eg. 25000"
              value={price}
              min={1}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="ap-field">
            <label>Stock</label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="eg. 20"
              value={stock}
              min={0}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="ap-field">
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
                <img className="ap-preview" src={displayImage} alt="Preview" />
                <button
                  type="button"
                  className="ap-link-danger"
                  onClick={removePhoto}
                >
                  Remove photo
                </button>
              </>
            )}
          </div>

          {error && <p className="ap-error">{error}</p>}

          <button
            type="submit"
            className="ap-save"
            disabled={isInvalid || loading}
          >
            {loading ? "Saving..." : editing ? "Save changes" : "Save"}
          </button>

          {editing && (
            <button
              type="button"
              className="ap-delete"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete product
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
