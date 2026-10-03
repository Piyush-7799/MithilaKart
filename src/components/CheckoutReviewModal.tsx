import { useEffect, useCallback } from "react";
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Banknote,
  ArrowRight,
  AlertCircle,
  Home,
  Briefcase,
} from "lucide-react";
import type { CartItem, DeliveryEtaInfo, DeliveryLocation } from "../types";

export interface CheckoutReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  productSavings: number;
  total: number;
  selectedLocation: DeliveryLocation | null;
  etaInfo: DeliveryEtaInfo;
  onPlaceOrder: () => void;
  onChangeAddress?: () => void;
}

export function CheckoutReviewModal({
  isOpen,
  onClose,
  cartItems,
  cartCount,
  subtotal,
  deliveryFee,
  productSavings,
  total,
  selectedLocation,
  etaInfo,
  onPlaceOrder,
  onChangeAddress,
}: CheckoutReviewModalProps) {
  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  // Handle escape key
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

  const addr = selectedLocation?.address;
  const isAddressValid = Boolean(selectedLocation);
  const isCartValid = cartItems.length > 0;
  const canPlaceOrder = isAddressValid && isCartValid;

  return (
    <div
      className="checkout-review-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Checkout Review"
    >
      <div
        className="checkout-review-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checkout-sheet-handle" aria-hidden="true" />
        {/* Header */}
        <div className="checkout-review-header">
          <div>
            <h2 className="checkout-review-title">Review Your Order</h2>
            <span className="checkout-review-subtitle">
              {cartCount} {cartCount === 1 ? "item" : "items"} · Mithila Express Delivery
            </span>
          </div>
          <button
            type="button"
            className="checkout-review-close-btn"
            onClick={onClose}
            aria-label="Close review"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="checkout-review-body">
          {/* Missing address or empty cart warning */}
          {!canPlaceOrder && (
            <div className="review-validation-alert" role="alert">
              <AlertCircle size={18} />
              <span>
                {!isCartValid
                  ? "Your cart is empty. Please add items before placing an order."
                  : "Please select a delivery address before placing your order."}
              </span>
            </div>
          )}

          {/* Delivery Address Section */}
          <div className="review-section">
            <div className="review-section-header">
              <span className="review-section-title">Delivery Details</span>
              {onChangeAddress && (
                <button
                  type="button"
                  className="review-change-btn"
                  onClick={onChangeAddress}
                  aria-label="Change delivery address"
                >
                  Change
                </button>
              )}
            </div>

            <div className="review-address-card">
              <div className="review-address-icon">
                <MapPin size={18} />
              </div>
              <div className="review-address-details">
                <div className="review-address-headline">
                  {addr?.label && (
                    <span className="review-address-chip">
                      {addr.label === "Home" ? (
                        <Home size={11} />
                      ) : addr.label === "Work" ? (
                        <Briefcase size={11} />
                      ) : (
                        <MapPin size={11} />
                      )}
                      {addr.label}
                    </span>
                  )}
                  <strong className="review-recipient-name">
                    {addr?.fullName || "Valued Customer"}
                  </strong>
                  {addr?.phone && (
                    <span className="review-recipient-phone">· {addr.phone}</span>
                  )}
                </div>

                <p className="review-address-text">
                  {addr ? (
                    <>
                      {addr.house}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      {addr.landmark && (
                        <span className="review-landmark">
                          {" "}(Landmark: {addr.landmark})
                        </span>
                      )}
                    </>
                  ) : (
                    selectedLocation?.displayName || "No address selected"
                  )}
                </p>

                <div className="review-eta-badge">
                  <Clock size={13} />
                  <span>
                    Estimated delivery in <strong>{etaInfo.etaText}</strong>
                  </span>
                  <span className="review-eta-divider">•</span>
                  <span className="review-eta-reason">{etaInfo.reason}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary Section */}
          <div className="review-section">
            <div className="review-section-header">
              <span className="review-section-title">Items in Order ({cartCount})</span>
            </div>

            <div className="review-items-list" role="list">
              {cartItems.map(({ product, quantity }) => {
                const lineTotal = product.price * quantity;
                return (
                  <div key={product.id} className="review-item-row" role="listitem">
                    <div className="review-item-thumb">
                      {product.image.startsWith("http") ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="review-item-fallback"
                        style={{
                          display: product.image.startsWith("http") ? "none" : "flex",
                        }}
                      >
                        {product.fallbackIcon || "🛒"}
                      </span>
                    </div>

                    <div className="review-item-info">
                      <span className="review-item-name">{product.name}</span>
                      <span className="review-item-unit">{product.unit}</span>
                    </div>

                    <div className="review-item-calc">
                      <span className="review-item-qty-price">
                        {quantity} × ₹{product.price}
                      </span>
                      <strong className="review-item-line-total">₹{lineTotal}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="review-section">
            <div className="review-section-header">
              <span className="review-section-title">Payment Method</span>
            </div>

            <div className="review-payment-card">
              <div className="review-payment-radio">
                <div className="review-radio-circle checked">
                  <div className="review-radio-inner" />
                </div>
              </div>
              <div className="review-payment-details">
                <div className="review-payment-title-row">
                  <Banknote size={17} className="review-payment-icon" />
                  <strong className="review-payment-name">Cash / UPI on Delivery</strong>
                  <span className="review-payment-badge">Standard</span>
                </div>
                <p className="review-payment-note">
                  Pay comfortably via Cash or UPI at your doorstep upon delivery. No advance payment required.
                </p>
              </div>
            </div>
          </div>

          {/* Bill Summary Section */}
          <div className="review-section">
            <div className="review-section-header">
              <span className="review-section-title">Bill Details</span>
            </div>

            <div className="review-bill-card">
              <div className="review-bill-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="review-bill-row">
                <span>Estimated delivery</span>
                <span className="review-bill-eta">{etaInfo.etaText}</span>
              </div>
              <div className="review-bill-row">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? "review-free-tag" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              {productSavings > 0 && (
                <div className="review-bill-row savings">
                  <span>Product savings</span>
                  <span className="review-free-tag">-₹{productSavings}</span>
                </div>
              )}
              <div className="review-bill-divider" />
              <div className="review-bill-row total">
                <div>
                  <strong>To Pay</strong>
                  <span className="review-taxes-note">Inclusive of all taxes</span>
                </div>
                <strong className="review-total-val">₹{total}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="checkout-review-footer">
          <div className="review-guarantee-note">
            <ShieldCheck size={15} />
            <span>Mithila Express doorstep drop • Verified packing</span>
          </div>

          <button
            type="button"
            className="checkout-place-order-btn"
            onClick={onPlaceOrder}
            disabled={!canPlaceOrder}
            aria-label={`Place Order for ₹${total}`}
          >
            <div className="place-btn-content">
              <span className="place-btn-label">Place Order</span>
              <span className="place-btn-total">₹{total}</span>
            </div>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
