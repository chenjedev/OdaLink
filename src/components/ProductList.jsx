import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import CheckoutForm from "./CheckoutForm";

function ProductList() {
  const [products , setProduct] = useState([]);

  useEffect(() => {
    
                 fetch(`https://fakestoreapi.com/products`)
                 .then((res) => res.json())
                 .then((data) => 
                 { const formated = data.map((item) => ({id: item.id, name: item.title, price: item.price})); 
                  setProduct(formated);
                  setLoading(false);
                  })
                  .catch((err) => {
                    setError("Failed to load product");
                    setLoading(false);
                });
            
        }, []);
        


// search
const [search, setSearch] = useState("");
const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));

// carts
const[cart , setCart] = useState( () => {
    const saved = localStorage.getItem("cart");
    return saved? JSON.parse(saved) : [];    
});

useEffect (() => {
    localStorage.setItem("cart", JSON.stringify(cart));
}, [cart]);

function handleAddToCart(product) {
    const found = cart.find((item) => item.id === product.id);

    if(found){
        setCart(cart.map((item) => item.id === product.id ? {...item, quantity: item.quantity + 1} : item));
    }  else {
        setCart([...cart, {...product, quantity:1}]);
    }

}

function handleRemoveFromCart(index) {
    setCart(cart.filter((_, i) => i !== index));
}

const totalCartPrice = cart.reduce((sum, item) => sum + item.price*item.quantity, 0);

// products
  function handleAdd() {
       const newProduct = { id: Date.now() , name: "Laptop", price: 750000 };

       setProduct([...products, newProduct]);
  }
   
  function handleDelete(id) {
    setProduct(products.filter((product) => product.id !== id));
  }

// loading and error
const[loading , setLoading] = useState(true);
const[error, setError] = useState(null);

return (
    <div>

        {loading && <p>Loading products....</p>}
        {error && <p style={{color: "red"}}>{error}</p>}
        {!loading && !error && filteredProducts.length === 0 && <p>No product found</p>}


        <h2>Total products : ({filteredProducts.length})</h2>

        <input type="text" placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)}></input>

        <button onClick={handleAdd}>Add Product</button>
        
       

        {filteredProducts.map((product) => (
            <div key={product.id}>
            <ProductCard
                        id={product.id} 
                        name={product.name}
                        quantity={product.quantity}
                        price={product.price}
            />
            <button onClick={() => handleDelete(product.id)}>Delete</button>
            <button onClick={() => handleAddToCart(product)}>Add To Cart</button>
            </div>
        ))}

        <h3>Cart ({cart.length})</h3>
        {cart.map((item, index) => (
            <p key={index}>
                {item.name} {item.quantity}-{" "} - {(item.price * item.quantity).toLocaleString()} TZS
                <button onClick={() => handleRemoveFromCart(index)}>Delete</button>
            </p>
        ))}
        <p>
            Total :  {totalCartPrice.toLocaleString()}  TZS
        </p>

        <CheckoutForm cart={cart} setCart={setCart} cartTotal={totalCartPrice} />
        
    </div>
);

}

export default ProductList;