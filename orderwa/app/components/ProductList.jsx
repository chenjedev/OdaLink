"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ProductCard from "./ProductCard";
import CheckoutForm from "./CheckoutForm";

function ProductList({ products = [], shopSlug, shopId, shopName }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function handleAddToCart(product) {
    const found = cart.find((item) => item.id === product.id);

    if (found) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  }

  function handleRemoveFromCart(index) {
    setCart(cart.filter((_, i) => i !== index));
  }

  return (
    <div className="app">
      {(shopName || shopSlug) && (
        <p className="shop-label">Shop: {shopName || shopSlug}</p>
      )}

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
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image_url}
            />

            <button type="button" onClick={() => handleAddToCart(product)}>
              Add To Cart
            </button>
          </div>
        ))}
      </div>

      <div className="order-logic">
        <div className="cart-box">
          <h3>Cart ({cart.length})</h3>

          {cart.length === 0 && <p>Cart is empty</p>}

          {cart.map((item, index) => (
            <p key={`${item.id}-${index}`}>
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={50}
                  height={50}
                  style={{ objectFit: "contain", marginRight: 8 }}
                />
              ) : null}
              {item.name} x{item.quantity} —{" "}
              {(item.price * item.quantity).toLocaleString()} TZS
              <button
                type="button"
                onClick={() => handleRemoveFromCart(index)}
              >
                Delete
              </button>
            </p>
          ))}

          <p>
            <strong>Total: {totalCartPrice.toLocaleString()} TZS</strong>
          </p>
        </div>

        <div className="checkout-box">
          <CheckoutForm
            cart={cart}
            setCart={setCart}
            cartTotal={totalCartPrice}
            shopId={shopId}
            shopName={shopName}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductList;
