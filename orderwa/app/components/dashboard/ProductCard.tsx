import Image from "next/image";

export default function ProductCard({name, category,  price, stock} : {name:string; category:string; price:number;  stock:number; }) {
    return(
        <div className="product-card">
            <p className="prod-name">{name}</p>
            <p className="prod-category">{category}</p>
            <p className="prod-price">{price.toLocaleString()} Tsh</p>
            <p className="prod-stock">{stock}</p>
        </div>
    );
}