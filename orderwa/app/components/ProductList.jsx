"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import CheckoutForm from "./CheckoutForm";

function ProductList({ products = [], shopSlug, shopId, shopName, shopPhone }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [lang, setLang] = useState("en");

  const t = (en, sw) => (lang === "en" ? en : sw);
  const cartKey = `cart:${shopSlug}`;

  // Load cart
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      setCart([]);
    }
    setCartLoaded(true);
  }, [cartKey]);

  // Save cart
  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch {}
  }, [cart, cartLoaded, cartKey]);

  // Sync cart with real products
  useEffect(() => {
    if (!cartLoaded) return;

    setCart((prev) => {
      const synced = prev
        .map((item) => {
          const p = products.find((x) => x.id === item.id);
          if (!p) return null;
          const stock = p.stock ?? 0;
          if (stock <= 0) return null;
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            stock,
            quantity: Math.min(item.quantity, stock),
          };
        })
        .filter(Boolean);

      return JSON.stringify(synced) === JSON.stringify(prev) ? prev : synced;
    });
  }, [cartLoaded, products]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (!cartOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      if (e.key === "Escape") setCartOpen(false);
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [cartOpen]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);

  function handleAddToCart(product) {
    const stock = product.stock ?? 0;
    if (stock <= 0) return;

    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);

      if (found) {
        if (found.quantity >= stock) return prev;
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock,
          quantity: 1,
        },
      ];
    });
  }

  function changeQuantity(id, delta) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const max = typeof item.stock === "number" ? item.stock : Infinity;
        const next = Math.min(Math.max(item.quantity + delta, 1), max);
        return { ...item, quantity: next };
      })
    );
  }

  function handleRemoveFromCart(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="store-page">
      {/* Top bar */}
      <header className="store-header">
        <div className="store-header-inner">
          <div className="store-brand">
            <div className="store-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                  fill="#0d9488"
                  fillOpacity="0.15"
                />
                <path
                  d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
                  stroke="#0d9488"
                  strokeWidth="1.6"
                  fill="none"
                />
                <circle cx="12" cy="12" r="1.6" fill="#0d9488" />
              </svg>
            </div>
            <div>
              <h1 className="store-title">{shopName || shopSlug}</h1>
              <p className="store-subtitle">
                {t("Powered by OdaLink", "Inaendeshwa na OdaLink")}
              </p>
            </div>
          </div>

          <div className="store-header-actions">
            <button
              type="button"
              className="lang-btn"
              onClick={() => setLang(lang === "en" ? "sw" : "en")}
              aria-label="Change language"
            >
              {lang === "en" ? "SW" : "EN"}
            </button>

            <button
              type="button"
              className="cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label={t(
                `Open cart, ${cartCount} items`,
                `Fungua kikapu, bidhaa ${cartCount}`
              )}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.5L21 8H6" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="store-main">
        {/* Search */}
        <div className="store-search">
          <input
            type="text"
            placeholder={t("Search product...", "Tafuta bidhaa...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="store-empty">
            <p>{t("No product found", "Hakuna bidhaa iliyopatikana")}</p>
          </div>
        ) : (
          <div className="product-list">
            {filteredProducts.map((product) => {
              const stock = product.stock ?? 0;
              const inCart =
                cart.find((i) => i.id === product.id)?.quantity ?? 0;
              const soldOut = stock <= 0;
              const atMax = inCart >= stock;

              return (
                <div key={product.id} className="product-card">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image_url}
                  />

                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={soldOut || atMax}
                  >
                    {soldOut
                      ? t("Out of stock", "Bidhaa imeisha")
                      : atMax
                      ? t("Max in cart", "Umefikia kiwango cha juu")
                      : inCart > 0
                      ? t(`Add more · ${inCart}`, `Ongeza zaidi · ${inCart}`)
                      : t("Add To Cart", "Weka kwenye kikapu")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t("Your cart", "Kikapu chako")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <h3>
                {t(
                  `Your cart (${cartCount})`,
                  `Kikapu chako (${cartCount})`
                )}
              </h3>
              <button
                type="button"
                className="cart-close"
                onClick={() => setCartOpen(false)}
                aria-label={t("Close cart", "Funga kikapu")}
              >
                ✕
              </button>
            </div>

            <div className="cart-drawer-body">
              {cart.length === 0 && (
                <p className="cart-empty">
                  {t("Cart is empty", "Kikapu hakina bidhaa")}
                </p>
              )}

              {cart.map((item) => {
                const max =
                  typeof item.stock === "number" ? item.stock : Infinity;

                return (
                  <div key={item.id} className="cart-row">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="cart-img-placeholder" />
                    )}

                    <div className="cart-info">
                      <span className="cart-name">{item.name}</span>
                      <span className="cart-line-price">
                        {(item.price * item.quantity).toLocaleString()} TZS
                      </span>
                    </div>

                    <div className="qty-controls">
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, 1)}
                        disabled={item.quantity >= max}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-delete"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {cart.length > 0 && (
                <p className="cart-total">
                  {t("Total:", "Jumla:")}{" "}
                  {totalCartPrice.toLocaleString()} TZS
                </p>
              )}

              <CheckoutForm
                cart={cart}
                cartTotal={totalCartPrice}
                shopId={shopId}
                shopName={shopName}
                shopPhone={shopPhone}
                shopSlug={shopSlug}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;