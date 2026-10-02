import { useState, useEffect, useCallback } from "react";
import {
  X,
  Star,
  Zap,
  Plus,
  Minus,
  Sparkles,
  Package,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Heart,
} from "lucide-react";
import type { Product } from "../types";

export interface ProductDetailsModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

/**
 * Returns a neutral, factual description based on the product's name, category, and unit.
 * Does not make unsupported health, medical, origin, GI, or organic claims.
 */
function getProductDescription(product: Product): string {
  if (product.description && product.description.trim()) {
    return product.description.trim();
  }

  return "Quality everyday essential from the MithilaKart catalogue.";
}

interface ProductDetailsModalInnerProps {
  product: Product;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

function ProductDetailsModalInner({
  product,
  onClose,
  cartQuantity,
  onAddToCart,
  onRemoveFromCart,
  isWishlisted = false,
  onToggleWishlist,
}: ProductDetailsModalInnerProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Lock background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle Escape key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  const description = getProductDescription(product);

  return (
    <div
      className="product-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-modal-title"
    >
      <div
        className="product-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile pull handle */}
        <div className="product-modal-sheet-handle" aria-hidden="true" />

        {/* Close Button */}
        <button
          type="button"
          className="product-modal-close-btn"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={18} />
        </button>

        <div className="product-modal-content-grid">
          {/* Visual Showcase */}
          <div className="product-modal-visual-col">
            <div className="product-modal-image-stage">
              {discount > 0 && (
                <span className="product-modal-discount-tag">
                  {discount}% OFF
                </span>
              )}

              {product.isMithilaSpecial && (
                <span className="product-modal-special-tag">
                  <Sparkles size={11} /> Mithila Special
                </span>
              )}

              <div className="product-modal-image-box">
                {!imageError ? (
                  <>
                    {!imageLoaded && (
                      <div
                        className="product-modal-image-skeleton"
                        aria-hidden="true"
                      />
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`product-modal-img ${
                        imageLoaded
                          ? "product-modal-img-loaded"
                          : "product-modal-img-loading"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  </>
                ) : (
                  <div className="product-modal-fallback">
                    <span className="modal-fallback-icon">
                      {product.fallbackIcon || (
                        <Package size={56} className="modal-fallback-pkg-icon" />
                      )}
                    </span>
                    <span className="modal-fallback-label">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="product-modal-delivery-pill">
                <Zap size={13} className="delivery-zap" />
                <span>{product.delivery} Delivery</span>
              </div>
            </div>
          </div>

          {/* Details & Action Column */}
          <div className="product-modal-info-col">
            {/* Top Row: Mithila Special & Category & Rating & Wishlist Toggle */}
            <div className="product-modal-meta-top">
              <div className="product-modal-tags-left">
                {product.isMithilaSpecial && (
                  <span className="product-modal-special-badge">
                    <Sparkles size={11} /> Mithila Special
                  </span>
                )}
                <span className="product-modal-category">{product.category}</span>
              </div>

              <div className="product-modal-meta-right">
                <div
                  className="product-modal-rating"
                  title={`Rated ${product.rating} out of 5 stars`}
                >
                  <Star size={13} className="star-icon" />
                  <span>{product.rating}</span>
                </div>

                {onToggleWishlist && (
                  <button
                    type="button"
                    className={`product-modal-wishlist-btn ${
                      isWishlisted ? "product-modal-wishlist-btn-active" : ""
                    }`}
                    onClick={() => onToggleWishlist(product.id)}
                    aria-label={
                      isWishlisted
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                    }
                    aria-pressed={isWishlisted}
                  >
                    <Heart
                      size={15}
                      className="modal-wishlist-icon"
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                    <span>{isWishlisted ? "Saved" : "Save"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Product Title */}
            <h2 id="product-details-modal-title" className="product-modal-title">
              {product.name}
            </h2>

            {/* Unit / Weight Badge */}
            <div className="product-modal-unit-row">
              <span className="product-modal-unit-tag">{product.unit}</span>
            </div>

            {/* Pricing Section (₹99  ₹120  17% OFF) */}
            <div className="product-modal-price-box">
              <div className="product-modal-price-main">
                <span className="product-modal-price-current">
                  ₹{product.price}
                </span>
                {product.mrp > product.price && (
                  <span className="product-modal-price-mrp">
                    ₹{product.mrp}
                  </span>
                )}
                {discount > 0 && (
                  <span className="product-modal-discount-pill">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="product-modal-availability-row">
              <span className="availability-dot" aria-hidden="true" />
              <span className="availability-label">
                Available in stock • Delivery in {product.delivery}
              </span>
            </div>

            {/* About this product */}
            <div className="product-modal-description-card">
              <h3 className="product-modal-description-heading">
                About this product
              </h3>
              <p className="product-modal-description-text">{description}</p>
            </div>

            {/* Service & Delivery Perks */}
            <div className="product-modal-perks">
              <div className="product-perk-item">
                <Zap size={14} className="perk-icon-zap" />
                <span>10-15 Min Express Delivery</span>
              </div>
              <div className="product-perk-item">
                <ShieldCheck size={14} className="perk-icon-shield" />
                <span>Freshness & Quality Guaranteed</span>
              </div>
              <div className="product-perk-item">
                <RotateCcw size={14} className="perk-icon-rotate" />
                <span>Hassle-free Replacements</span>
              </div>
            </div>

            {/* Sticky/Bottom Cart Action Bar */}
            <div className="product-modal-action-bar">
              {cartQuantity > 0 ? (
                <div className="product-modal-cart-active">
                  <div className="product-modal-active-summary">
                    <span className="modal-summary-label">In Cart</span>
                    <span className="modal-summary-total">
                      {cartQuantity} {cartQuantity === 1 ? "unit" : "units"} • ₹
                      {cartQuantity * product.price}
                    </span>
                  </div>

                  <div className="product-modal-stepper">
                    <button
                      type="button"
                      className="modal-stepper-btn modal-stepper-dec"
                      onClick={() => onRemoveFromCart(product.id)}
                      aria-label={`Decrease quantity of ${product.name}`}
                    >
                      <Minus size={16} />
                    </button>

                    <span
                      className="modal-stepper-count"
                      aria-live="polite"
                      aria-label={`Current quantity is ${cartQuantity}`}
                    >
                      {cartQuantity}
                    </span>

                    <button
                      type="button"
                      className="modal-stepper-btn modal-stepper-inc"
                      onClick={() => onAddToCart(product.id)}
                      disabled={cartQuantity >= 99}
                      aria-label={`Increase quantity of ${product.name}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="product-modal-add-btn"
                  onClick={() => onAddToCart(product.id)}
                  aria-label={`Add ${product.name} to cart for ₹${product.price}`}
                >
                  <ShoppingBag size={18} />
                  <span>ADD TO CART</span>
                  <span className="modal-add-btn-price">₹{product.price}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsModal(props: ProductDetailsModalProps) {
  if (!props.isOpen || !props.product) {
    return null;
  }

  return (
    <ProductDetailsModalInner
      key={props.product.id}
      product={props.product}
      onClose={props.onClose}
      cartQuantity={props.cartQuantity}
      onAddToCart={props.onAddToCart}
      onRemoveFromCart={props.onRemoveFromCart}
      isWishlisted={props.isWishlisted}
      onToggleWishlist={props.onToggleWishlist}
    />
  );
}

export const ProductDetails = ProductDetailsModal;
