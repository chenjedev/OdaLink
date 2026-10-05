"use client";

import React, {useState} from "react";

function AddOrder({ onClose } : { onClose: () => void })  {
    const [customer , setCustomer] = useState("");
    const [phone , setPhone] = useState("");
    const [items , setItems] = useState("");
    const [total , setTotal] = useState("");
    const [status , setStatus] = useState("");

    const [isAdd,  setIsAdd] = useState(false);
    
    function handleAdd(e: React.SubmitEvent) {
        e.preventDefault();
        setIsAdd(true);
    }
 
 if (isAdd) {
    return (
        <div className="modal-overlay">
            <div className="add-prod-page">
                <div className="register-form">
                    <div className="add-prod-header">
                        <h2>Order added successfully</h2>
                        <button type="button" className="cancel-btn" onClick={onClose}>x</button>
                    </div>

                    <div className="detail-row">
                        <span>Customer</span>
                        <strong>{customer}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Phone</span>
                        <strong>{phone}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Items</span>
                        <strong>{items}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Total</span>
                        <strong>{Number(total).toLocaleString()} Tsh</strong>
                    </div>

                    <div className="form-group">
                        <button type="button" className="save-btn" onClick={onClose}>Done</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

    return(
        <div className="modal-overlay"  >
          <div className="add-prod-page">
            <form className="register-form" onSubmit={handleAdd}>
                  <div className="add-prod-header">
                    <h2>Add Order </h2>
                    <button  type="button" className="cancel-btn" onClick={onClose}>x</button>
                  </div>

                  <div className="form-group">
                    <label>Customer</label>
                    <input 
                         type="text"
                         placeholder="Customer..." 
                         value={customer}   
                         onChange={(e) => setCustomer(e.target.value)}
                         required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                         type="text"
                         placeholder="Phone..."   
                         value={phone} 
                         onChange={(e) => setPhone(e.target.value)}
                         required
                    />
                  </div>

                  <div className="form-group">
                    <label>Items</label>
                    <input 
                         type="text"
                         placeholder="Items..."   
                         value={items}
                         onChange={(e) => setItems(e.target.value)}
                         required 
                    />
                  </div> 
                 
                 <div className="form-group">
                    <label>Total</label>
                    <input 
                         type="text"
                         placeholder="Total..."   
                         value={total} 
                         onChange={(e) => setTotal(e.target.value)}
                         required
                    />
                  </div>

                   <div className="form-group">
                    <button className="save-btn">Save</button>
                    </div>

            </form>
          </div>
        </div> 
    );

}


export default AddOrder;