import { useState, memo } from "react";
import { Star, Zap, Plus, Minus, Sparkles, Package, Heart } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  isAvailable?: boolean;
}

function ProductCardInner({
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  onSelectProduct,
  isWishlisted = false,
  onToggleWishlist,
  isAvailable = true,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <article
      className={`product-card ${product.isMithilaSpecial ? "product-card-signature" : ""} ${!isAvailable ? "product-card-unavailable" : ""}`}
      data-product-id={product.id}
    >
      <div
        className="product-card-content"
        onClick={() => onSelectProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectProduct(product);
          }
        }}
        aria-label={`View details for ${product.name}`}
      >
        {/* Visual Area */}
        <div className="product-visual-wrapper">
          {!isAvailable ? (
            <span className="product-out-of-stock-tag" title="Currently out of stock">
              Out of Stock
            </span>
          ) : discount > 0 ? (
            <span className="product-discount-tag">
              {discount}% OFF
            </span>
          ) : null}

          {product.isMithilaSpecial && (
            <span className="product-signature-tag" title="Mithila Regional Special">
              <Sparkles size={10} /> Mithila Special
            </span>
          )}

          {/* Favourite / Wishlist Toggle Button */}
          {onToggleWishlist && (
            <button
              type="button"
              className={`product-wishlist-btn ${isWishlisted ? "product-wishlist-btn-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                }
              }}
              aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={isWishlisted}
            >
              <Heart
                size={16}
                className="product-wishlist-icon"
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>
          )}

          <div className="product-image-display">
            {!imageError ? (
              <>
                {!imageLoaded && (
                  <div className="product-image-skeleton" aria-hidden="true" />
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className={`product-img ${imageLoaded ? "product-img-loaded" : "product-img-loading"}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className="product-image-fallback">
                <span className="fallback-icon">
                  {product.fallbackIcon || <Package size={32} className="fallback-pkg-icon" />}
                </span>
                <span className="fallback-category-label">{product.category}</span>
              </div>
            )}
          </div>

          <div className="product-delivery-badge">
            <Zap size={11} className="delivery-zap" />
            <span>{product.delivery}</span>
          </div>
        </div>

        {/* Details Area */}
        <div className="product-details">
          {/* 1. Product Name */}
          <h3 className="product-name" title={product.name}>
            {product.name}
          </h3>

          {/* 2. Quantity / Unit & Rating Row */}
          <div className="product-meta-row">
            <span className="product-unit-text">{product.unit}</span>
            <div className="product-rating-pill" title={`Rated ${product.rating} out of 5 stars`}>
              <Star size={11} className="star-icon" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* 3. Pricing & 4. Add Button Row */}
          <div className="product-action-row">
            <div className="product-pricing">
              <div className="price-main-group">
                <span className="price-current">₹{product.price}</span>
                {product.mrp > product.price && (
                  <span className="price-mrp">₹{product.mrp}</span>
                )}
                {discount > 0 && (
                  <span className="price-discount-pill">{discount}% OFF</span>
                )}
              </div>
            </div>

            <div
              className="product-cart-controls"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {!isAvailable ? (
                <button
                  type="button"
                  className="out-of-stock-btn"
                  disabled
                  aria-label={`${product.name} is currently out of stock`}
                >
                  <span>Out of Stock</span>
                </button>
              ) : quantity > 0 ? (
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
                    disabled={quantity >= 99}
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
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardInner);

