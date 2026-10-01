import { useEffect, useCallback } from "react";
import { Heart, X, Plus, Minus, ArrowRight, Package, Sparkles } from "lucide-react";
import type { Product } from "../types";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  cart: Record<string, number>;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onRemoveFromWishlist: (id: string) => void;
  onClearWishlist?: () => void;
  onSelectProduct?: (product: Product) => void;
  onExploreCatalogue?: () => void;
}

export function WishlistDrawer({
  isOpen,
  onClose,
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onRemoveFromWishlist,
  onClearWishlist,
  onSelectProduct,
  onExploreCatalogue,
}: WishlistDrawerProps) {
  // Handle Escape key to close drawer
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleExplore = () => {
    onClose();
    if (onExploreCatalogue) {
      onExploreCatalogue();
    } else {
      setTimeout(() => {
        const el = document.getElementById("products");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <div
      className="wishlist-backdrop"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="wishlist-drawer-title"
    >
      <aside
        className="wishlist-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="wishlist-sheet-handle" aria-hidden="true" />

        {/* Drawer Header */}
        <div className="drawer-header wishlist-drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box wishlist-icon-header-box">
              <Heart size={20} fill="currentColor" />
            </div>
            <div>
              <h2 id="wishlist-drawer-title" className="drawer-heading">
                My Wishlist
              </h2>
              <span className="drawer-subheading">
                {products.length === 0
                  ? "Your saved favourites"
                  : `${products.length} saved ${products.length === 1 ? "favourite" : "favourites"}`}
              </span>
            </div>
          </div>

          <div className="wishlist-header-right-actions">
            {products.length > 0 && onClearWishlist && (
              <button
                type="button"
                className="wishlist-clear-all-btn"
                onClick={onClearWishlist}
                aria-label="Clear all favourites from wishlist"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close wishlist drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          /* Empty Wishlist State */
          <div className="drawer-empty-state wishlist-empty-state">
            <div className="empty-cart-graphic wishlist-empty-graphic">
              <Heart size={44} className="empty-wishlist-icon" />
            </div>
            <h3 className="empty-cart-title">No favourites yet</h3>
            <p className="empty-cart-desc">
              Save products you love and find them here anytime.
            </p>

            <button
              type="button"
              className="start-shopping-btn"
              onClick={handleExplore}
              aria-label="Explore Catalogue"
            >
              <span>Explore Catalogue</span>
              <ArrowRight size={16} />
            </button>

            <div className="wishlist-empty-tip">
              <Sparkles size={14} className="empty-tip-icon" />
              <span>Tap the heart icon on any product card to save it for later</span>
            </div>
          </div>
        ) : (
          /* Wishlist Items List */
          <div className="drawer-items-list wishlist-items-list">
            {products.map((product) => {
              const quantity = cart[product.id] || 0;
              const discount = Math.round(
                ((product.mrp - product.price) / product.mrp) * 100
              );

              return (
                <div className="drawer-item-card wishlist-item-card" key={product.id}>
                  {/* Thumbnail */}
                  <div
                    className="item-thumbnail wishlist-item-thumbnail"
                    onClick={() => onSelectProduct && onSelectProduct(product)}
                    role={onSelectProduct ? "button" : undefined}
                    tabIndex={onSelectProduct ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onSelectProduct && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onSelectProduct(product);
                      }
                    }}
                    title={`View details for ${product.name}`}
                  >
                    {product.image && product.image.startsWith("http") ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="item-thumbnail-photo"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="item-thumbnail-emoji"
                      style={{
                        display:
                          product.image && product.image.startsWith("http")
                            ? "none"
                            : "flex",
                      }}
                    >
                      {product.fallbackIcon || <Package size={22} />}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="item-info wishlist-item-info">
                    <div className="wishlist-title-row">
                      <h4
                        className="item-title wishlist-item-title"
                        onClick={() => onSelectProduct && onSelectProduct(product)}
                        role={onSelectProduct ? "button" : undefined}
                        tabIndex={onSelectProduct ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (onSelectProduct && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            onSelectProduct(product);
                          }
                        }}
                      >
                        {product.name}
                      </h4>
                      {product.isMithilaSpecial && (
                        <span className="wishlist-special-tag" title="Mithila Special">
                          <Sparkles size={10} /> Special
                        </span>
                      )}
                    </div>

                    <span className="item-pack-unit">{product.unit}</span>

                    <div className="item-pricing wishlist-pricing-row">
                      <span className="item-price-current">₹{product.price}</span>
                      {product.mrp > product.price && (
                        <span className="item-price-mrp">₹{product.mrp}</span>
                      )}
                      {discount > 0 && (
                        <span className="wishlist-discount-pill">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="wishlist-item-actions">
                    {/* Remove from wishlist button */}
                    <button
                      type="button"
                      className="wishlist-item-remove-btn"
                      onClick={() => onRemoveFromWishlist(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from favourites"
                    >
                      <Heart size={16} fill="currentColor" className="wishlist-remove-icon" />
                    </button>

                    {/* Cart ADD / Stepper */}
                    {quantity > 0 ? (
                      <div className="drawer-stepper wishlist-stepper">
                        <button
                          type="button"
                          className="drawer-stepper-btn"
                          onClick={() => onRemoveFromCart(product.id)}
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <Minus size={13} />
                        </button>

                        <span
                          className="drawer-stepper-value"
                          aria-live="polite"
                          aria-label={`Current quantity is ${quantity}`}
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          className="drawer-stepper-btn"
                          onClick={() => onAddToCart(product.id)}
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="wishlist-add-cart-btn"
                        onClick={() => onAddToCart(product.id)}
                        aria-label={`Add ${product.name} to cart`}
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info when items exist */}
        {products.length > 0 && (
          <div className="wishlist-drawer-footer">
            <button
              type="button"
              className="wishlist-continue-shopping-btn"
              onClick={handleExplore}
            >
              <span>Explore More Products</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
