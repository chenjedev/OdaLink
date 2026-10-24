"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddProduct from "../../components/dashboard/AddProduct";
import { supabase } from "../../../lib/supabase";

type Product = {
  id: number | string;
  name: string;
  price: number;
  category?: string | null;
  stock?: number | null;
  image_url?: string | null; // Added image URL to types
};

type Shop = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    // Get current user shop settings
    const { data: shopData, error: shopErr } = await supabase
      .from("shops")
      .select("id, name, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (shopErr) console.error("Load shop failed:", shopErr.message);

    setShop(shopData as Shop | null);

    if (shopData) {
      // Included image_url in supabase query string selection
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, stock, image_url")
        .eq("shop_id", shopData.id)
        .order("id");

      if (error) console.error("Load products failed:", error.message);

      setProducts((data as Product[]) ?? []);
    } else {
      setProducts([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [router]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString().includes(search.toLowerCase())
  );

  if (loading) {
    return <p>Loading products...</p>;
  }

  return (
    <div className="products-page">
      <div className="product-header">
        <h2>Products {shop ? `— ${shop.name}` : ""}</h2>
        <div className="header-actions">
          <button className="more-btn" type="button">
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
          <button
            className="add-product-btn"
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!shop}
          >
            Add product
          </button>
        </div>
      </div>

      {!shop && (
        <p style={{ color: "#dc2626" }}>
          Huna duka bado. Angalia console kwa error.
        </p>
      )}

      <div className="search-wrapper">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          placeholder="Search by product, variant names or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {showForm && shop && (
        <AddProduct
          shopId={shop.id}
          onClose={() => setShowForm(false)}
          onAdded={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {/* Wrapping the table to prevent visual breaking on small mobile viewports */}
      <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table className="products-table" style={{ width: "100%", minWidth: "500px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      width={40}
                      height={40}
                      style={{ 
                        objectFit: "contain", 
                        borderRadius: 4, 
                        display: "block",
                        maxWidth: "100%",
                        height: "auto"
                      }}
                    />
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "11px" }}>—</span>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.category ?? "—"}</td>
                <td>{Number(p.price).toLocaleString()} Tsh</td>
                <td>{p.stock ?? 0}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="no-prod" colSpan={6}>
                  No product found
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={6}>Total {filtered.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
              }
