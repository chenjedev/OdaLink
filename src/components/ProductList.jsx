import { useState } from "react";
import ProductCard from "./ProductCard";

function ProductList() {
  const [products , setProduct] = useState([
  { id: 1, name: "Simu ya Tecno", price: 450000 },
  { id: 2, name: "Kaptura", price: 25000 },
  { id: 3, name: "Viatu", price: 60000 }
]);

// search
const [search, setSearch] = useState("");
const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));

// carts
const[cart , setCart] = useState([]);

function handleAddToCart(product) {
    setCart([...cart, product]);
}

function handleRemoveFromCart(index) {
    setCart(cart.filter((_, i) => i !== index));
}

// products
  function handleAdd() {
       const newProduct = { id: Date.now() , name: "Laptop", price: 750000 };

       setProduct([...products, newProduct]);
  }
   
  function handleDelete(id) {
    setProduct(products.filter((product) => product.id !== id));
  }


return (
    <div>
        <h2>Total products : ({filteredProducts.length})</h2>

        <input type="text" placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)}></input>

        <button onClick={handleAdd}>Add Product</button>
        
        {filteredProducts.length === 0 && <p>No product found</p>}

        {filteredProducts.map((product) => (
            <div key={product.id}>
            <ProductCard
                        id={product.id} 
                        name={product.name}
                        price={product.price}
            />
            <button onClick={() => handleDelete(product.id)}>Delete</button>
            <button onClick={() => handleAddToCart(product)}>Add To Cart</button>
            </div>
        ))}

        <h3>Cart ({cart.length})</h3>
        {cart.map((item, index) => (
            <p key={index}>
                {item.name} - {item.price.toLocaleString()} TZS
                <button onClick={() => handleRemoveFromCart(index)}>Delete</button>
            </p>
        ))}
        <p>
            Total : {cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}  TZS
        </p>
        
    </div>
);

}

export default ProductList;