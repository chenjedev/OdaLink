function ProductCard({ id, name, price, image }) {
  return (
    <div>
      {image && (
        <img src={image} alt={name} />
      )}
      <p className="product-price">
        $ {Number(price).toLocaleString()}
      </p>
      <p className="product-name">
        {name}
      </p>
    </div>
  );
}

export default ProductCard;