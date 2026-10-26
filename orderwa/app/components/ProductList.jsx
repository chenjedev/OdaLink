"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import CheckoutForm from "./CheckoutForm";

function ProductList({ products = [], shopSlug, shopId, shopName , shopPhone}) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // One cart per shop, so items from another shop never mix in
  const cartKey = `cart:${shopSlug}`;

  // Load cart from localStorage (browser only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      setCart([]);
    }
    setCartLoaded(true);
  }, [cartKey]);

  // Save cart only after first load
  useEffect(() => {
    if (!cartLoaded) return;
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch {
      // storage can be blocked; the cart still works in memory
    }
  }, [cart, cartLoaded, cartKey]);

  // Keep the saved cart in line with the shop's real products:
  // deleted or sold-out products leave the cart, and prices, photos
  // and stock limits are refreshed.
  useEffect(() => {
    if (!cartLoaded) return;

    setCart((prev) => {
      const synced = prev
        .map((item) => {
          const p = products.find((x) => x.id === item.id);
          if (!p) return null; // product was deleted
          const stock = p.stock ?? 0;
          if (stock <= 0) return null; // sold out
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

      // Return the old array when nothing changed, so React does not re-render
      return JSON.stringify(synced) === JSON.stringify(prev) ? prev : synced;
    });
  }, [cartLoaded, products]);

  // While the cart is open: stop the page behind it from scrolling,
  // and let the Escape key close it
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

  // Number shown on the cart icon: all pieces, not just different products
  const cartCount = cart.reduce((n, item) => n + item.quantity, 0);

  function handleAddToCart(product) {
    const stock = product.stock ?? 0;
    if (stock <= 0) return;

    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);

      if (found) {
        // Never put more in the cart than the shop has
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

  // delta is +1 (plus button) or -1 (minus button)
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
    <div className="app">
      {/* Top bar: shop name on the left, cart icon on the right */}
      <div className="store-bar">
        <p className="shop-label">{shopName ||shopSlug }</p>

        <button
          type="button"
          className="cart-btn"
          onClick={() => setCartOpen(true)}
          aria-label={`Open cart, ${cartCount} items`}
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
            aria-hidden="true"
          >
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.5L21 8H6" />
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      <h2>Total products: ({filteredProducts.length})</h2>

      <div className="search">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredProducts.length === 0 && <p>No product found</p>}

      <div className="product-list">
        {filteredProducts.map((product) => {
          const stock = product.stock ?? 0;
          const inCart = cart.find((i) => i.id === product.id)?.quantity ?? 0;
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
                onClick={() => handleAddToCart(product)}
                disabled={soldOut || atMax}
              >
                {soldOut
                  ? "Out of stock"
                  : atMax
                  ? "Max in cart"
                  : inCart > 0
                  ? `Add more · ${inCart}`
                  : "Add To Cart"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Cart drawer: opens from the cart icon */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-drawer-header">
              <h3>Your cart ({cartCount})</h3>
              <button
                type="button"
                className="cart-close"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className="cart-drawer-body">
              {cart.length === 0 && <p className="cart-empty">Cart is empty</p>}

              {cart.map((item) => {
                const max =
                  typeof item.stock === "number" ? item.stock : Infinity;

                return (
                  <div key={item.id} className="cart-row">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={50}
                        height={50}
                      />
                    ) : null}

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
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => changeQuantity(item.id, 1)}
                        disabled={item.quantity >= max}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-delete"
                      onClick={() => handleRemoveFromCart(item.id)}
                      aria-label="Remove from cart"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {cart.length > 0 && (
                <p className="cart-total">
                  Total: {totalCartPrice.toLocaleString()} TZS
                </p>
              )}

              <CheckoutForm
                cart={cart}
                setCart={setCart}
                cartTotal={totalCartPrice}
                shopId={shopId}
                shopName={shopName}
                shopPhone={shopPhone}    
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductList;