import { useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Receipt,
  X,
} from "lucide-react";
import type { Order } from "../types";

export interface OrderConfirmationModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onViewOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

export function OrderConfirmationModal({
  isOpen,
  order,
  onClose,
  onViewOrder,
  onContinueShopping,
}: OrderConfirmationModalProps) {
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

  if (!isOpen || !order) return null;

  const addr = order.address;
  const itemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div
      className="order-confirm-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order Confirmation"
    >
      <div
        className="order-confirm-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="order-confirm-close-btn"
          onClick={onClose}
          aria-label="Close confirmation"
        >
          <X size={18} />
        </button>

        {/* Success Icon */}
        <div className="order-confirm-badge-wrap">
          <div className="order-confirm-icon-box">
            <CheckCircle2 size={36} className="order-confirm-icon" />
          </div>
          <h2 className="order-confirm-heading">Order Placed Successfully!</h2>
          <span className="order-confirm-id-tag">
            Order #{order.id}
          </span>
        </div>

        {/* Confirmation Details Card */}
        <div className="order-confirm-summary-card">
          <div className="confirm-summary-row">
            <div className="confirm-summary-label">
              <Clock size={15} />
              <span>Estimated delivery</span>
            </div>
            <strong className="confirm-summary-value eta">
              {order.estimatedDelivery}
            </strong>
          </div>

          <div className="confirm-summary-row">
            <div className="confirm-summary-label">
              <MapPin size={15} />
              <span>Delivering to</span>
            </div>
            <div className="confirm-summary-dest">
              <strong>
                {addr.label ? `${addr.label} · ` : ""}
                {addr.fullName}
              </strong>
              <span>
                {addr.house ? `${addr.house}, ` : ""}
                {addr.street}, {addr.city}
              </span>
            </div>
          </div>

          <div className="confirm-summary-row">
            <div className="confirm-summary-label">
              <ShoppingBag size={15} />
              <span>Items & payment</span>
            </div>
            <div className="confirm-summary-dest">
              <strong>
                {itemCount} {itemCount === 1 ? "item" : "items"} · ₹{order.total}
              </strong>
              <span className="confirm-payment-badge">
                {order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Trust Note */}
        <div className="confirm-trust-strip">
          <ShieldCheck size={16} />
          <span>Our delivery partner will reach your doorstep shortly.</span>
        </div>

        {/* Action Buttons */}
        <div className="order-confirm-actions">
          <button
            type="button"
            className="confirm-btn-primary"
            onClick={() => onViewOrder(order.id)}
            aria-label={`View order ${order.id}`}
          >
            <Receipt size={16} />
            <span>View Order</span>
          </button>

          <button
            type="button"
            className="confirm-btn-secondary"
            onClick={onContinueShopping}
            aria-label="Continue shopping"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
