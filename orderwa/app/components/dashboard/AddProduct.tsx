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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isInvalid =
    name.trim() === "" ||
    price.trim() === "" ||
    Number(price) <= 0 ||
    stock.trim() === "" ||
    Number(stock) < 0;

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
    let imageUrl: string | null = null;

    try {
      // 1. Upload the photo (optional) into this shop's folder
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

      // 2. Save the product
      const { error: insertError } = await supabase.from("products").insert({
        name: name.trim(),
        category: category.trim() || null,
        price: Number(price),
        stock: Number(stock),
        shop_id: shopId,
        image_url: imageUrl,
      });

      if (insertError) {
        // Don't leave an orphan photo behind
        if (uploadedPath) {
          await supabase.storage.from(BUCKET).remove([uploadedPath]);
        }
        setError(insertError.message);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Add product failed:", err);
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
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

          <div className="form-group">
            <label>Photo (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                style={{ marginTop: 8, maxWidth: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 8 }}
              />
            )}
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
