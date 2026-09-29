"use client";

import Image from "next/image";

function ProductCard({ id, name, price, image }) {
  return (
    <div>
      {image && (
        <Image src={image} alt={name} width={320} height={160} />
      )}
      <p className="product-price">
        TZS {Number(price).toLocaleString()}
      </p>
      <p className="product-name">
        {name}
      </p>
    </div>
  );
}

export default ProductCard;