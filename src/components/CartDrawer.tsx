import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import type { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onDeleteFromCart: (id: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  cartCount,
  subtotal,
  deliveryFee,
  total,
  onAddToCart,
  onRemoveFromCart,
  onDeleteFromCart,
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Calculate total savings from MRP
  const totalSavings = cartItems.reduce((acc, item) => {
    const savingsPerUnit = Math.max(0, item.product.mrp - item.product.price);
    return acc + savingsPerUnit * item.quantity;
  }, 0);

  // Progress toward free delivery (₹300 threshold)
  const freeDeliveryThreshold = 300;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeeded = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="cart-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <aside className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="drawer-heading">Your Cart</h2>
              <span className="drawer-subheading">
                {cartCount} {cartCount === 1 ? "item" : "items"} in basket
              </span>
            </div>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {cartCount === 0 ? (
          /* Empty Cart State */
          <div className="drawer-empty-state">
            <div className="empty-cart-graphic">
              <ShoppingBag size={48} className="empty-bag-icon" />
            </div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any fresh groceries or essentials yet.</p>
            <button
              type="button"
              className="start-shopping-btn"
              onClick={onClose}
            >
              <span>Start Shopping Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Free Delivery Progress Bar */}
            <div className="delivery-progress-card">
              <div className="progress-text-row">
                {subtotal >= freeDeliveryThreshold ? (
                  <span className="free-delivery-unlocked">
                    <Sparkles size={14} /> You've unlocked <strong>FREE Delivery!</strong>
                  </span>
                ) : (
                  <span className="free-delivery-needed">
                    Add <strong>₹{amountNeeded}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
                <span className="progress-percent-label">{progressPercent}%</span>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`progress-fill ${progressPercent >= 100 ? "progress-fill-complete" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Scrollable Cart Items */}
            <div className="drawer-items-list">
              {cartItems.map(({ product, quantity }) => {
                const itemTotal = product.price * quantity;
                const itemMrpTotal = product.mrp * quantity;

                return (
                  <div className="drawer-item-card" key={product.id}>
                    <div className="item-thumbnail">
                      {product.image.startsWith("http") ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="item-thumbnail-photo"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="item-thumbnail-emoji"
                        style={{ display: product.image.startsWith("http") ? "none" : "flex" }}
                      >
                        {product.fallbackIcon || "🛒"}
                      </span>
                    </div>

                    <div className="item-info">
                      <h4 className="item-title">{product.name}</h4>
                      <span className="item-pack-unit">{product.unit}</span>
                      <div className="item-pricing">
                        <span className="item-price-current">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="item-price-mrp">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>

                    <div className="item-action-controls">
                      <div className="drawer-stepper">
                        <button
                          type="button"
                          className="drawer-stepper-btn"
                          onClick={() => onRemoveFromCart(product.id)}
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <Minus size={13} />
                        </button>

                        <span className="drawer-stepper-value">{quantity}</span>

                        <button
                          type="button"
                          className="drawer-stepper-btn"
                          onClick={() => onAddToCart(product.id)}
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="item-delete-btn"
                        onClick={() => onDeleteFromCart(product.id)}
                        aria-label={`Remove ${product.name} from cart`}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>

                      <div className="item-line-total">
                        <span>₹{itemTotal}</span>
                        {itemMrpTotal > itemTotal && (
                          <span className="item-line-mrp">₹{itemMrpTotal}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bill Summary & Sticky Checkout */}
            <div className="drawer-footer">
              {/* Savings Announcement */}
              {totalSavings > 0 && (
                <div className="savings-badge-card">
                  <Sparkles size={14} className="savings-sparkle" />
                  <span>You're saving <strong>₹{totalSavings}</strong> on this order!</span>
                </div>
              )}

              {/* Bill Details */}
              <div className="bill-card">
                <h4 className="bill-heading">Bill Details</h4>

                <div className="bill-row">
                  <span className="bill-label">Item Total (MRP discounts applied)</span>
                  <span className="bill-value">₹{subtotal}</span>
                </div>

                <div className="bill-row">
                  <div className="bill-label-with-hint">
                    <span>Delivery Partner Fee</span>
                    <span className="fee-hint">{deliveryFee === 0 ? "Threshold met" : "Standard 15 min"}</span>
                  </div>
                  <span className={`bill-value ${deliveryFee === 0 ? "fee-free" : ""}`}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="bill-row">
                  <span className="bill-label">Handling & Packaging</span>
                  <span className="bill-value fee-free">FREE</span>
                </div>

                <div className="bill-divider"></div>

                <div className="bill-row grand-total-row">
                  <div>
                    <strong className="grand-total-label">Grand Total</strong>
                    <span className="inclusive-taxes">Inclusive of all taxes</span>
                  </div>
                  <strong className="grand-total-value">₹{total}</strong>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="safe-delivery-note">
                <ShieldCheck size={16} />
                <span>Contactless doorstep drop in 10-15 minutes</span>
              </div>

              {/* Checkout Button (Non-functional as required) */}
              <div className="checkout-action-wrapper">
                <button
                  type="button"
                  className="checkout-primary-btn"
                  title="Checkout flow will be implemented in Phase 5"
                >
                  <div className="btn-price-summary">
                    <span className="btn-total">₹{total}</span>
                    <span className="btn-subtext">TOTAL</span>
                  </div>
                  <div className="btn-cta-text">
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={18} />
                  </div>
                </button>
                <span className="phase-note">Checkout flow arrives in Phase 5</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
