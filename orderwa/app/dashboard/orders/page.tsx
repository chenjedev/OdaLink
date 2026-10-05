"use client";
import {useState} from "react";
import AddOrder from "../../components/dashboard/AddOrder";

const orders = [
  {id: 1042,customer: "John Doe", phone: "0712345678",items: "jordan-4 x2, T-shirt x1",total: 141000,status: "pending",},
  {id: 1043,customer: "Amina Juma",phone: "0754123456",items: "Kitenge dress x2",total: 70000,status: "confirmed",},
  {id: 1044,customer: "Baraka Mushi",phone: "0765987654",items: "Sneakers x1, Socks x3",total: 98500,status: "delivered",},
  {id: 1045,customer: "Neema Joseph",phone: "0621456789",items: "Handbag x1",total: 45000,status: "cancelled",},
  {id: 1046,customer: "Hassan Ally",phone: "0688234567",items: "Jeans x2, Belt x1, T-shirt x2",total: 132000,status: "pending",},
];

export default function OrderPage(){
    
        const [search , setSearch] = useState("");
        const [showForm , setShowForm] = useState(false);
    
        const filtered = orders.filter((o) => 
         o.customer.toLowerCase().includes(search.toLowerCase()) ||
         o.items.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toString().includes(search.toLowerCase())
        );
    
        return(
            <div className="products-page">
    
                <div className="product-header">
                     <h2>Orders</h2>
                     <div className="header-actions">
                        <button className="more-btn">
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        <button className="add-product-btn" onClick={() => setShowForm(true)}>
                            Add order
                        </button>
                     </div>
                </div>

                <div className="search-wrapper">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input 
                      type="text"
                      placeholder="Search order, customer, id ..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />
                </div>
                
               {showForm && <AddOrder onClose={() => setShowForm(false)} />}
    
                <table className="products-table">
                    <thead>
                     <tr>
                      <th>Id</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                     </tr>
                    </thead>
    
                    <tbody>
                        {filtered.map((o) => (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.customer}</td>
                                <td>{o.phone}</td>
                                <td>{o.items}</td>
                                <td>{o.total.toLocaleString()} Tsh</td>
                                <td> <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span> </td>
                            </tr>
                        )) }
    
                        {filtered.length === 0 && (
                        <tr>
                            <td className="no-prod" colSpan={6}>No order found</td>
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