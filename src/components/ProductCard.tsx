import { Star, Zap, Plus, Minus, Sparkles } from "lucide-react";
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
  const savings = product.mrp - product.price;

  return (
    <article
      className={`product-card ${product.isMithilaSpecial ? "product-card-signature" : ""}`}
      data-product-id={product.id}
    >
      {/* Visual Area */}
      <div className="product-visual-wrapper">
        {discount > 0 && (
          <span className="product-discount-tag">
            {discount}% OFF
          </span>
        )}

        {product.isMithilaSpecial && (
          <span className="product-signature-tag" title="Mithila Regional Special">
            <Sparkles size={10} /> Special
          </span>
        )}

        <div className="product-image-display">
          <span className="product-emoji-art">{product.image}</span>
        </div>

        <div className="product-delivery-badge">
          <Zap size={11} className="delivery-zap" />
          <span>{product.delivery}</span>
        </div>
      </div>

      {/* Details Area */}
      <div className="product-details">
        <div className="product-meta-row">
          <span className="product-unit-text">{product.unit}</span>
          <div className="product-rating-pill" title={`Rated ${product.rating} out of 5 stars`}>
            <Star size={12} className="star-icon" />
            <span>{product.rating}</span>
          </div>
        </div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {/* Pricing & Cart Action Row */}
        <div className="product-action-row">
          <div className="product-pricing">
            <div className="price-main-group">
              <span className="price-current">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="price-mrp">₹{product.mrp}</span>
              )}
            </div>
            {savings > 0 && (
              <span className="price-savings">Save ₹{savings}</span>
            )}
          </div>

          <div className="product-cart-controls">
            {quantity > 0 ? (
              <div className="quantity-stepper">
                <button
                  type="button"
                  className="stepper-btn stepper-btn-decrement"
                  onClick={() => onRemoveFromCart(product.id)}
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  <Minus size={14} />
                </button>

                <span className="stepper-count" aria-live="polite">
                  {quantity}
                </span>

                <button
                  type="button"
                  className="stepper-btn stepper-btn-increment"
                  onClick={() => onAddToCart(product.id)}
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="add-to-cart-btn"
                onClick={() => onAddToCart(product.id)}
                aria-label={`Add ${product.name} to cart`}
              >
                <span>ADD</span>
                <Plus size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
