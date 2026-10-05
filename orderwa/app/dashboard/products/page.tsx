"use client";
import { useState } from "react";
import AddProduct from "../../components/dashboard/AddProduct";

const products = [
    {id:14345, name:"jordan-4", category:"shoes", price:62000,  image:"",  stock:21 }, 
    {id:56462, name:"Black-tshirt", category:"tshirt", price:17000,  image:"",  stock:44 }, 
    {id:13452, name:"Gucci bag", category:"bag",  price:45000,  image:"",   stock:19 }
];

export default function ProductPage(){

    const [search , setSearch] = useState("");
    const [showForm , setShowForm] = useState(false);

    const filtered = products.filter((p) => 
     p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toString().includes(search.toLowerCase())
    );

    return(
        <div className="products-page">

            <div className="product-header">
                 <h2>Products</h2>
                 <div className="header-actions">
                    <button className="more-btn">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    <button className="add-product-btn" onClick={() => setShowForm(true)}>
                        Add product
                    </button>
                 </div>
            </div>

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
            
           {showForm && <AddProduct onClose={() => setShowForm(false)} />}
            
            <table className="products-table">
                <thead>
                 <tr>
                  <th>Id</th>
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
                            <td>{p.name}</td>
                            <td>{p.category}</td>
                            <td>{p.price.toLocaleString()} Tsh</td>
                            <td>{p.stock.toLocaleString()}</td>
                        </tr>
                        
                    )) }

                    {filtered.length === 0 && (
                    <tr>
                        
                        <td className="no-prod" colSpan={5}>No product found</td>
                       
                    </tr>
                    )}

                     <tr>
                        <td>
                            Total {filtered.length.toLocaleString()}
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    );
}