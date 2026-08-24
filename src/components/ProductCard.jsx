function ProductCard({id , name, price, quantity}) {
    return(
        <div>
            <p>{id} : {name} x{quantity} - {price.toLocaleString()} TZS</p>
        </div>
    );
}

export default ProductCard;