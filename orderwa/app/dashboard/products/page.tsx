"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProduct from "../../components/dashboard/AddProduct";
import { supabase } from "../../../lib/supabase";

type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string | null;
  category?: string | null;
  stock?: number | null;
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

    const { data: shopData } = await supabase
      .from("shops")
      .select("id, name, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    setShop(shopData as Shop | null);

    if (shopData) {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image")
        .eq("shop_id", shopData.id)
        .order("id");

      setProducts((data as Product[]) ?? []);
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
          Huna duka bado. Signup mpya inapaswa kuunda shop otomatiki.
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

      <table className="products-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Price</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{Number(p.price).toLocaleString()} Tsh</td>
              <td>
                {p.image ? (
                  <img src={p.image} alt="" width={40} height={40} />
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="no-prod" colSpan={4}>
                No product found
              </td>
            </tr>
          )}
          <tr>
            <td colSpan={4}>Total {filtered.length}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
