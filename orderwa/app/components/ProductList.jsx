"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import CheckoutForm from "./CheckoutForm";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.id,
          name: item.title,
          price: item.price,
          image: item.image,
        }));
        setProducts(formatted);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

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

  function handleAdd() {
    const newProduct = {
      id: Date.now(),
      name: "Laptop",
      price: 750000,
    };
    setProducts([...products, newProduct]);
  }

  function handleDelete(id) {
    setProducts(products.filter((product) => product.id !== id));
  }

  return (
    <div className="app">
  

      {loading && (
        <div className="loading-wrap">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
          <p className="loading">Loading products...</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <p>No product found</p>
      )}

      {!loading && !error && (
        <>
          <h2>Total products: ({filteredProducts.length})</h2>

          <div className="search">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={handleAdd}>Add Product</button>
          </div>

          <div className="product-list">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                />
                <button onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
                <button onClick={() => handleAddToCart(product)}>
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
                <p key={item.id}>
                  {item.image && (
      <img
        src={item.image}
        alt={item.name}
        width={50}
        height={50}
        style={{ objectFit: "contain" }}
      />
    )}            
                   {item.name} x{item.quantity} —{" "}
                  {(item.price * item.quantity).toLocaleString()} TZS
                  <button onClick={() => handleRemoveFromCart(index)}>
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
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;