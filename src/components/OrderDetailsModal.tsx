import { useEffect, useCallback } from "react";
import {
  X,
  ArrowLeft,
  RotateCcw,
  Clock,
  MapPin,
  Banknote,
  ShieldCheck,
  Check,
  Home,
  Briefcase,
} from "lucide-react";
import type { Order, OrderStatus } from "../types";

export interface OrderDetailsModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onReorder: (order: Order) => void;
  onBackToOrders?: () => void;
}

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "Placed", label: "Order Placed", desc: "Received and verified" },
  { status: "Confirmed", label: "Confirmed", desc: "Accepted by store" },
  { status: "Preparing", label: "Preparing", desc: "Freshly packed" },
  { status: "Out for Delivery", label: "Out for Delivery", desc: "Partner en route" },
  { status: "Delivered", label: "Delivered", desc: "Delivered at doorstep" },
];

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function OrderDetailsModal({
  isOpen,
  order,
  onClose,
  onReorder,
  onBackToOrders,
}: OrderDetailsModalProps) {
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
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.status === order.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div
      className="order-details-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Order Details for ${order.id}`}
    >
      <div
        className="order-details-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="order-details-sheet-handle" aria-hidden="true" />
        {/* Header */}
        <div className="order-details-header">
          <div className="order-details-header-left">
            {onBackToOrders && (
              <button
                type="button"
                className="order-back-btn"
                onClick={onBackToOrders}
                aria-label="Back to orders"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="order-details-heading">{order.id}</h2>
              <span className="order-details-date">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="order-details-close-btn"
            onClick={onClose}
            aria-label="Close order details"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="order-details-body">
          {/* Status Timeline */}
          <div className="order-timeline-card">
            <h3 className="timeline-heading">Order Status</h3>
            <div className="order-timeline-steps">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div
                    key={step.status}
                    className={`timeline-step ${
                      isCurrent
                        ? "timeline-step-current"
                        : isCompleted
                        ? "timeline-step-completed"
                        : "timeline-step-pending"
                    }`}
                  >
                    <div className="timeline-node-wrapper">
                      <div className="timeline-node">
                        {isCompleted || isCurrent ? (
                          <Check size={12} strokeWidth={3} />
                        ) : (
                          <span className="timeline-node-dot" />
                        )}
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div
                          className={`timeline-connector ${
                            idx < activeIndex ? "timeline-connector-active" : ""
                          }`}
                        />
                      )}
                    </div>
                    <div className="timeline-content">
                      <strong className="timeline-step-title">{step.label}</strong>
                      <span className="timeline-step-desc">
                        {isCurrent ? `${step.desc} • ${order.estimatedDelivery}` : step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="timeline-note">
              <span>Status: <strong>{order.status}</strong> · Doorstep drop within {order.estimatedDelivery}</span>
            </div>
          </div>

          {/* Delivery Address (From Snapshot!) */}
          <div className="order-details-section">
            <h3 className="details-section-heading">Delivery Destination</h3>
            <div className="details-address-card">
              <div className="details-address-icon">
                <MapPin size={18} />
              </div>
              <div className="details-address-info">
                <div className="details-address-title-row">
                  {addr.label && (
                    <span className="details-label-chip">
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
                  <strong>{addr.fullName}</strong>
                  {addr.phone && <span className="details-phone">· {addr.phone}</span>}
                </div>
                <p className="details-address-lines">
                  {addr.house ? `${addr.house}, ` : ""}
                  {addr.street}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""}
                  {addr.pincode ? ` - ${addr.pincode}` : ""}
                  {addr.landmark && (
                    <span className="details-landmark"> (Landmark: {addr.landmark})</span>
                  )}
                </p>
                <div className="details-eta-strip">
                  <Clock size={13} />
                  <span>Estimated delivery: <strong>{order.estimatedDelivery}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Breakdown (From Snapshot!) */}
          <div className="order-details-section">
            <h3 className="details-section-heading">
              Items in this Order ({order.items.length})
            </h3>
            <div className="details-items-list" role="list">
              {order.items.map((item) => (
                <div key={item.productId} className="details-item-row" role="listitem">
                  <div className="details-item-thumb">
                    {item.image && item.image.startsWith("http") ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <span>🛒</span>
                    )}
                  </div>
                  <div className="details-item-main">
                    <span className="details-item-name">{item.name}</span>
                    {item.unit && (
                      <span className="details-item-unit">{item.unit}</span>
                    )}
                    <span className="details-item-calc">
                      {item.quantity} × ₹{item.price}
                    </span>
                  </div>
                  <strong className="details-item-price">
                    ₹{item.lineTotal || item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Bill Summary (From Snapshot!) */}
          <div className="order-details-section">
            <h3 className="details-section-heading">Payment & Bill Details</h3>
            <div className="details-bill-card">
              <div className="details-payment-row">
                <div className="details-payment-method">
                  <Banknote size={16} />
                  <span>Payment Method: <strong>{order.paymentMethod}</strong></span>
                </div>
                <span className="details-payment-status">Pay at Delivery</span>
              </div>

              <div className="details-bill-divider" />

              <div className="details-bill-row">
                <span>Items Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>

              <div className="details-bill-row">
                <span>Delivery Fee</span>
                <span className={order.deliveryFee === 0 ? "details-free-tag" : ""}>
                  {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                </span>
              </div>

              {order.savings > 0 && (
                <div className="details-bill-row savings">
                  <span>Product Savings</span>
                  <span className="details-free-tag">-₹{order.savings}</span>
                </div>
              )}

              <div className="details-bill-divider" />

              <div className="details-bill-row total">
                <div>
                  <strong>Total Paid / Payable</strong>
                  <span className="details-tax-hint">Inclusive of all taxes</span>
                </div>
                <strong className="details-total-amount">₹{order.total}</strong>
              </div>
            </div>
          </div>

          {/* Safety note */}
          <div className="details-trust-note">
            <ShieldCheck size={16} />
            <span>MithilaKart Guaranteed • 100% Quality Inspected</span>
          </div>
        </div>

        {/* Footer Actions: Reorder */}
        <div className="order-details-footer">
          <button
            type="button"
            className="details-reorder-btn"
            onClick={() => onReorder(order)}
            aria-label={`Reorder all items from ${order.id}`}
          >
            <RotateCcw size={16} />
            <span>Reorder Items</span>
          </button>
        </div>
      </div>
    </div>
  );
}
