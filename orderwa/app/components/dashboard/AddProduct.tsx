"use client";

import React, {useState} from "react";

function AddProduct({ onClose } : { onClose: () => void })  {
    const [name , setName] = useState("");
    const [category , setCategory] = useState("");
    const [price , setPrice] = useState("");
    const [stock , setStock] = useState("");

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
                        <h2>Product added successfully</h2>
                        <button type="button" className="cancel-btn" onClick={onClose}>x</button>
                    </div>

                    <div className="detail-row">
                        <span>Name</span>
                        <strong>{name}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Category</span>
                        <strong>{category}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Price</span>
                        <strong>{Number(price).toLocaleString()} Tsh</strong>
                    </div>
                    <div className="detail-row">
                        <span>Stock</span>
                        <strong>{Number(stock).toLocaleString()}</strong>
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
                    <h2>Add poduct </h2>
                    <button  type="button" className="cancel-btn" onClick={onClose}>x</button>
                  </div>

                  <div className="form-group">
                    <label>Name</label>
                    <input 
                         type="text"
                         placeholder="Name..." 
                         value={name}   
                         onChange={(e) => setName(e.target.value)}
                         required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input 
                         type="text"
                         placeholder="Category..."   
                         value={category} 
                         onChange={(e) => setCategory(e.target.value)}
                         required
                    />
                  </div>

                  <div className="form-group">
                    <label>Price</label>
                    <input 
                         type="text"
                         placeholder="Price..."   
                         value={price}
                         onChange={(e) => setPrice(e.target.value)}
                         required 
                    />
                  </div> 
                 
                 <div className="form-group">
                    <label>Stock</label>
                    <input 
                         type="text"
                         placeholder="Stock..."   
                         value={stock} 
                         onChange={(e) => setStock(e.target.value)}
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


export default AddProduct;