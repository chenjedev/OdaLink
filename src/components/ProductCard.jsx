function ProductCard({id , name, price}) {
    return(
        <div>
            <p>{id} : {name} - {price.toLocaleString()} TZS</p>
        </div>
    );
}

export default ProductCard;