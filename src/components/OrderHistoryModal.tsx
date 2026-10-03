import { useEffect, useCallback } from "react";
import {
  X,
  Package,
  Clock,
  ArrowRight,
  RotateCcw,
  Receipt,
  ChevronRight,
} from "lucide-react";
import type { Order } from "../types";

export interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onStartShopping: () => void;
}

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

export function OrderHistoryModal({
  isOpen,
  onClose,
  orders,
  onSelectOrder,
  onReorder,
  onStartShopping,
}: OrderHistoryModalProps) {
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

  return (
    <div
      className="order-history-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order History"
    >
      <div
        className="order-history-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="order-history-sheet-handle" aria-hidden="true" />
        {/* Header */}
        <div className="order-history-header">
          <div className="order-history-title-group">
            <div className="order-history-icon-box">
              <Package size={20} />
            </div>
            <div>
              <h2 className="order-history-heading">My Orders</h2>
              <span className="order-history-subheading">
                {orders.length} {orders.length === 1 ? "order placed" : "orders placed"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="order-history-close-btn"
            onClick={onClose}
            aria-label="Close orders"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="order-history-body">
          {orders.length === 0 ? (
            /* Empty State */
            <div className="order-history-empty">
              <div className="order-empty-icon-wrap">
                <Receipt size={40} className="order-empty-icon" />
              </div>
              <h3 className="order-empty-title">No orders yet</h3>
              <p className="order-empty-desc">
                Your future MithilaKart orders will appear here. Enjoy 10-15 minute delivery across Mithila!
              </p>
              <button
                type="button"
                className="order-empty-cta"
                onClick={onStartShopping}
                aria-label="Start Shopping"
              >
                <span>Start Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            /* Orders List */
            <div className="order-history-list" role="list">
              {orders.map((order) => {
                const totalItemUnits = order.items.reduce(
                  (sum, it) => sum + it.quantity,
                  0
                );

                return (
                  <div
                    key={order.id}
                    className="order-card"
                    role="listitem"
                    onClick={() => onSelectOrder(order)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectOrder(order);
                      }
                    }}
                    aria-label={`Order ${order.id}, total ₹${order.total}`}
                  >
                    {/* Top Row: ID, Date, Status */}
                    <div className="order-card-header">
                      <div className="order-card-id-group">
                        <strong className="order-card-id">{order.id}</strong>
                        <span className="order-card-date">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="order-card-status-badge">
                        <span className="order-status-dot" />
                        <span>{order.status}</span>
                      </div>
                    </div>

                    {/* Middle Row: Items preview & delivery ETA */}
                    <div className="order-card-preview">
                      <div className="order-card-thumbs">
                        {order.items.slice(0, 4).map((it) => (
                          <div key={it.productId} className="order-mini-thumb">
                            {it.image && it.image.startsWith("http") ? (
                              <img src={it.image} alt={it.name} loading="lazy" />
                            ) : (
                              <span>🛒</span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="order-mini-thumb-more">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      <div className="order-card-items-desc">
                        <span className="order-items-summary">
                          {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                        </span>
                        <div className="order-card-eta-row">
                          <Clock size={12} />
                          <span>Delivery: {order.estimatedDelivery}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Total & Actions */}
                    <div className="order-card-footer">
                      <div className="order-card-price-info">
                        <span className="order-card-price-label">
                          {totalItemUnits} {totalItemUnits === 1 ? "item" : "items"}
                        </span>
                        <strong className="order-card-total">₹{order.total}</strong>
                      </div>

                      <div
                        className="order-card-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="order-reorder-btn"
                          onClick={() => onReorder(order)}
                          aria-label={`Reorder items from ${order.id}`}
                        >
                          <RotateCcw size={13} />
                          <span>Reorder</span>
                        </button>

                        <button
                          type="button"
                          className="order-view-details-btn"
                          onClick={() => onSelectOrder(order)}
                          aria-label={`View details for ${order.id}`}
                        >
                          <span>Details</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
