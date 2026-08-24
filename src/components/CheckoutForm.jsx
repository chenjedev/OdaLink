import { useState } from "react";


function CheckoutForm({cart , setCart}) {
    const[phone, setPhone] = useState("");
    const[name, setName] = useState("");
    const isInvalid = name.trim() === "" || phone.trim() === "" || cart.length === 0 ;
    const cartSummary = cart.map((item) => (`${item.name} x ${item.quantity} - (${(item.price * item.quantity).toLocaleString()}) `)).join(" , ");
    const totalCartPrice = cart.reduce((sum , item) => sum + item.price * item.quantity, 0).toLocaleString();

    function handleSubmit(e) {
        e.preventDefault();

        if(name === "" || phone === "" || cart.length === 0) {
            alert("Please enter your name and phone");
            return;
        }

        alert(`Order sent successfully for ${name} (${phone})\n ` + 
              `items : ${cartSummary}\n  ` +
               `Total:  ${totalCartPrice}` );

        setName("");
        setPhone("");
        setCart([]);
    }

    return(
        <div>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="eg. John Doe" value={name} onChange={(e) => setName(e.target.value)}></input>
            <input type="text" placeholder="eg, 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)}></input>
             
            {cart.map((item, index) => (
                <p key={index}>
                    {item.name} x{item.quantity}-{" "}- {(item.price * item.quantity).toLocaleString()} TZS
                </p>

            ))}

            <p> Total : {cart.reduce((sum, item) => sum + item.price*item.quantity, 0).toLocaleString()}  TZS</p>
            
            <button type="submit" disabled={isInvalid}>Submit</button>
          </form>
        <p>Name: {name} </p>
        <p>Phone {phone}</p>
        </div>
    );
}

export default CheckoutForm;