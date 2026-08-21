import { useState } from "react";
import ProductList from "./ProductList";

function Toggle() {
    const[isOpen , setIsOpen ] = useState(false);


    return(
        <div>
            
            <h2>Product List</h2>
            {isOpen && <ProductList />}
            <button onClick={() =>  setIsOpen(!isOpen)}>{isOpen ? "Hide" : "Show" }</button>
        </div>
    )
}

export default Toggle;