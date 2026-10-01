"use client";
import { useState } from "react";

const products = [
    {id:14345, name:"jordan-4", category:"shoes", price:62000,  image:"",  stock:21 }, 
    {id:56462, name:"Black-tshirt", category:"tshirt", price:17000,  image:"",  stock:44 }, 
    {id:13452, name:"Gucci bag", category:"bag",  price:45000,  image:"",   stock:19 }
];

export default function ProductPage(){

    const [search , setSearch] = useState("");

    const filtered = products.filter((p) => 
     p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toString().includes(search.toLowerCase())
    );

    return(
        <div className="products-page">

            <div className="product-header">
                 <h2>Products</h2>   
                  <input 
                  type="text"
                  placeholder="Search product, category, id ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
            />
                 <button className="add-product-btn">Add product</button>
            </div>   
            
           

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
                        <td className="no-prod" colSpan={5}>
                            Total {filtered.length.toLocaleString()}
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    );
}
