import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
}

export function ProductCard({
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart,
}: ProductCardProps) {
  const discount = Math.round(
    ((product.mrp - product.price) / product.mrp) * 100
  );

  return (
    <div className="product" key={product.id}>
      <div className="product-image-wrapper">
        <span className="discount-badge">{discount}% OFF</span>

        <div className="product-image">{product.image}</div>
      </div>

      <div className="delivery-time">⚡ {product.delivery}</div>

      <h3>{product.name}</h3>

      <p className="product-unit">{product.unit}</p>

      <div className="rating">⭐ {product.rating}</div>

      <div className="price-row">
        <div>
          <span className="price">₹{product.price}</span>
          <span className="mrp">₹{product.mrp}</span>
        </div>

        {quantity > 0 ? (
          <div className="quantity-control">
            <button
              onClick={() => onRemoveFromCart(product.id)}
              aria-label={`Decrease quantity of ${product.name}`}
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              onClick={() => onAddToCart(product.id)}
              aria-label={`Increase quantity of ${product.name}`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="add-btn"
            onClick={() => onAddToCart(product.id)}
            aria-label={`Add ${product.name} to cart`}
          >
            ADD
          </button>
        )}
      </div>
    </div>
  );
}
