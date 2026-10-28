
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddProduct from "../../components/dashboard/AddProduct";
import { supabase } from "../../../lib/supabase";

type Product = {
  id: number | string;
  name: string;
  price: number;
  category?: string | null;
  stock?: number | null;
  image_url?: string | null;
};

type Shop = {
  id: string;
  name: string;
  slug: string;
};

type Lang = "en" | "sw";

export default function ProductPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>("en");

  const t = (en: string, sw: string) => (lang === "en" ? en : sw);

  // Read the language selected in the dashboard Sidebar.
  useEffect(() => {
    function syncLanguage(event?: Event) {
      const customEvent = event as CustomEvent<Lang> | undefined;
      const eventLang = customEvent?.detail;
      const saved = localStorage.getItem("odLinkLanguage");

      const nextLang =
        eventLang === "en" || eventLang === "sw"
          ? eventLang
          : saved === "en" || saved === "sw"
            ? saved
            : "en";

      setLang(nextLang);
    }

    syncLanguage();

    window.addEventListener("odLinkLanguageChange", syncLanguage);
    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener("odLinkLanguageChange", syncLanguage);
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  async function load() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    // Get current user shop settings.
    const { data: shopData, error: shopErr } = await supabase
      .from("shops")
      .select("id, name, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (shopErr) console.error("Load shop failed:", shopErr.message);

    setShop(shopData as Shop | null);

    if (shopData) {
      // Only active products: deleted ones are hidden.
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, stock, image_url")
        .eq("shop_id", shopData.id)
        .eq("is_active", true)
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

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString().includes(search.toLowerCase())
  );

  if (loading) {
    return <p>{t("Loading products...", "Inapakia bidhaa...")}</p>;
  }

  return (
    <div
      className="products-page"
      style={{
        padding: "12px",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div className="product-header" style={{ marginBottom: "16px" }}>
        <h2>{t("Products", "Bidhaa")}</h2>

        <div className="header-actions">
          <button
            className="add-product-btn"
            type="button"
            onClick={() => setShowForm(true)}
            disabled={!shop}
          >
            {t("Add product", "Ongeza bidhaa")}
          </button>
        </div>
      </div>

      {!shop && (
        <p style={{ color: "#dc2626" }}>
          {t(
            "No store. Check console for error.",
            "Hakuna duka. Angalia console kwa maelezo ya hitilafu."
          )}
        </p>
      )}

      <div className="search-wrapper" style={{ marginBottom: "16px" }}>
        <i className="fa-solid fa-magnifying-glass search-icon"></i>

        <input
          type="text"
          placeholder={t(
            "Search by product, variant names or SKU",
            "Tafuta bidhaa, majina ya aina au SKU"
          )}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          style={{ width: "100%", boxSizing: "border-box" }}
        />
      </div>

      {/* One form for both: no product = add, a product = edit. */}
      {(showForm || editing) && shop && (
        <AddProduct
          key={editing ? String(editing.id) : "new"}
          shopId={shop.id}
          product={editing}
          onClose={closeForm}
          onAdded={() => {
            closeForm();
            load();
          }}
        />
      )}

      <div style={{ width: "100%", overflowX: "hidden" }}>
        <table
          className="products-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            border: "none",
          }}
        >
          <thead></thead>

          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => setEditing(p)}
                style={{
                  borderBottom: "1px solid #f3f4f6",
                  padding: "15px",
                  cursor: "pointer",
                }}
              >
                {/* Column 1: Image */}
                <td
                  style={{
                    width: "50px",
                    padding: "10px 4px",
                    verticalAlign: "middle",
                  }}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      width={44}
                      height={44}
                      style={{
                        objectFit: "cover",
                        borderRadius: 6,
                        display: "block",
                        width: "44px",
                        height: "44px",
                        backgroundColor: "#f9fafb",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: 6,
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#9ca3af",
                        fontSize: "11px",
                      }}
                    >
                      —
                    </div>
                  )}
                </td>

                {/* Column 2: Name and category */}
                <td
                  style={{
                    padding: "10px 8px",
                    verticalAlign: "middle",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      display: "block",
                      lineHeight: "1.3",
                    }}
                  >
                    {p.name}
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    {p.category ?? "—"}
                  </span>
                </td>

                {/* Column 3: Price and stock */}
                <td
                  style={{
                    width: "110px",
                    padding: "10px 4px",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#059669",
                      display: "block",
                      lineHeight: "1.3",
                    }}
                  >
                    {Number(p.price).toLocaleString()} TZS
                  </span>

                  <span
                    style={{
                      fontSize: "12px",
                      color: p.stock && p.stock > 0 ? "#4b5563" : "#dc2626",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    {p.stock ?? 0} {t("left", "zimebaki")}
                  </span>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  className="no-prod"
                  colSpan={3}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  {t("No product found", "Hakuna bidhaa iliyopatikana")}
                </td>
              </tr>
            )}

            <tr>
              <td
                colSpan={3}
                style={{
                  padding: "12px 4px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {t("Total", "Jumla")} {filtered.length}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
