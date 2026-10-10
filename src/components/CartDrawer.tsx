import { useState, useEffect, useRef, useMemo } from "react";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  MapPin,
  ChevronRight,
  Heart,
  RotateCcw,
  Clock,
  Home,
  Briefcase,
} from "lucide-react";
import type { CartItem, DeliveryLocation, Product } from "../types";
import { calculateCartDeliveryEta } from "../utils/deliveryEta";

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
  onRestoreCartItem?: (id: string, quantity: number) => void;
  onSelectCategory?: (category: string) => void;
  selectedLocation?: DeliveryLocation | null;
  onOpenLocationModal?: () => void;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  wishlistSet?: Set<string>;
  onToggleWishlist?: (id: string) => void;
  onProceedToCheckout?: () => void;
  onOpenOrders?: () => void;
  isItemAvailable?: (id: string) => boolean;
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
  onRestoreCartItem,
  onSelectCategory,
  selectedLocation,
  onOpenLocationModal,
  allProducts = [],
  onSelectProduct,
  wishlistSet,
  onToggleWishlist,
  onProceedToCheckout,
  onOpenOrders,
  isItemAvailable,
}: CartDrawerProps) {
  // Temporary accessible Undo toast state
  const [removedItem, setRemovedItem] = useState<{
    id: string;
    name: string;
    quantity: number;
  } | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  // Frontend-only Checkout Coming Soon notice
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);
  const checkoutNoticeTimeoutRef = useRef<number | null>(null);

  // Keyboard navigation: Escape key closes cart drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Clean up browser timers on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      if (checkoutNoticeTimeoutRef.current) {
        clearTimeout(checkoutNoticeTimeoutRef.current);
      }
    };
  }, []);

  // Free delivery calculations (₹300 threshold)
  const freeDeliveryThreshold = 300;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(1, subtotal / freeDeliveryThreshold);
  const progressPercent = Math.min(100, Math.round(freeDeliveryProgress * 100));

  // Genuine MRP savings calculation
  const mrpTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const unitMrp =
        item.product.mrp && item.product.mrp > item.product.price
          ? item.product.mrp
          : item.product.price;
      return acc + unitMrp * item.quantity;
    }, 0);
  }, [cartItems]);

  const productSavings = Math.max(0, mrpTotal - subtotal);
  const etaInfo = useMemo(() => {
    return calculateCartDeliveryEta(cartItems, selectedLocation || null);
  }, [cartItems, selectedLocation]);

  // Curated deterministic basket recommendations (4-6 products, excluded if in cart)
  const recommendedProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    const cartIdSet = new Set(cartItems.map((item) => item.product.id));

    // Curated high-affinity basket addition candidate IDs
    const CANDIDATE_IDS = [
      "prod-ms-raw-makhana",
      "prod-db-full-cream-milk",
      "prod-fv-banana",
      "prod-ars-chakki-atta",
      "prod-bev-assam-tea",
      "prod-mdf-cashews",
      "prod-bs-bhujia-sev",
      "prod-db-paneer",
      "prod-fv-tomato",
      "prod-ms-tikiya",
      "prod-ars-sugar",
      "prod-bs-rusk",
    ];

    const results: Product[] = [];

    // 1. Pick from curated candidates not in cart
    for (const id of CANDIDATE_IDS) {
      if (!cartIdSet.has(id)) {
        const prod = allProducts.find((p) => p.id === id);
        if (prod) {
          results.push(prod);
          if (results.length >= 6) break;
        }
      }
    }

    // 2. Backfill if fewer than 4 candidates
    if (results.length < 4) {
      for (const prod of allProducts) {
        if (!cartIdSet.has(prod.id) && !results.some((r) => r.id === prod.id)) {
          results.push(prod);
          if (results.length >= 6) break;
        }
      }
    }

    return results.slice(0, 6);
  }, [allProducts, cartItems]);

  const handleRemoveItem = (product: Product, quantity: number) => {
    // 1. Immediately remove item from cart
    onDeleteFromCart(product.id);

    // 2. Reset existing undo timer if any
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    // 3. Store removed item details
    setRemovedItem({
      id: product.id,
      name: product.name,
      quantity,
    });

    // 4. Set auto-dismiss timer
    undoTimeoutRef.current = window.setTimeout(() => {
      setRemovedItem(null);
      undoTimeoutRef.current = null;
    }, 4500);
  };

  const handleUndo = () => {
    if (!removedItem) return;

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    // Restore exact removed quantity
    if (onRestoreCartItem) {
      onRestoreCartItem(removedItem.id, removedItem.quantity);
    } else {
      for (let i = 0; i < removedItem.quantity; i++) {
        onAddToCart(removedItem.id);
      }
    }

    setRemovedItem(null);
  };

  const handleContinueToCheckout = () => {
    // Phase 18: If no delivery address/location is selected, open the address selection modal
    if (!selectedLocation) {
      if (onOpenLocationModal) {
        onOpenLocationModal();
      }
      return;
    }

    setShowCheckoutNotice(true);
    if (checkoutNoticeTimeoutRef.current) {
      clearTimeout(checkoutNoticeTimeoutRef.current);
    }
    checkoutNoticeTimeoutRef.current = window.setTimeout(() => {
      setShowCheckoutNotice(false);
      checkoutNoticeTimeoutRef.current = null;
    }, 5000);

    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
  };

  const handleStartShopping = (categoryName?: string) => {
    if (categoryName && onSelectCategory) {
      onSelectCategory(categoryName);
    }
    onClose();
    setTimeout(() => {
      const el = document.getElementById("products");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className="cart-backdrop"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Shopping Cart"
    >
      <aside
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Cart Drawer"
      >
        {/* 1. Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="drawer-heading">Your Cart</h2>
              <span className="drawer-subheading">
                {cartCount} {cartCount === 1 ? "item" : "items"}
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

        {/* 2. Delivery Experience & ETA Layer */}
        <section
          className="cart-delivery-info-bar cart-delivery-experience-card"
          onClick={onOpenLocationModal}
          role={onOpenLocationModal ? "button" : undefined}
          tabIndex={onOpenLocationModal ? 0 : undefined}
          aria-label={
            selectedLocation
              ? `Delivering to ${selectedLocation.displayName}. Estimated delivery ${etaInfo.etaText}. Click to change delivery location`
              : "Add a delivery address to proceed"
          }
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && onOpenLocationModal) {
              e.preventDefault();
              onOpenLocationModal();
            }
          }}
        >
          <div className="delivery-card-header-row">
            <div className="delivery-card-title-group">
              <div className="cart-delivery-info-icon delivery-card-icon-box">
                <MapPin size={15} />
              </div>
              <span className="cart-delivery-info-title delivery-card-title">
                Delivering to
              </span>
            </div>

            {onOpenLocationModal && (
              <button
                type="button"
                className="cart-delivery-change-btn delivery-card-change-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLocationModal();
                }}
                aria-label={selectedLocation ? "Change delivery address" : "Select delivery address"}
              >
                <span>{selectedLocation ? "Change" : "Select"}</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {selectedLocation ? (
            <div className="delivery-card-main-content">
              <div className="delivery-destination-details">
                <div className="delivery-recipient-row">
                  {selectedLocation.address ? (
                    <span className="delivery-label-chip">
                      {selectedLocation.address.label === "Home" && <Home size={11} />}
                      {selectedLocation.address.label === "Work" && <Briefcase size={11} />}
                      {selectedLocation.address.label === "Other" && <MapPin size={11} />}
                      <span>{selectedLocation.address.label}</span>
                    </span>
                  ) : (
                    <span className="delivery-label-chip">
                      <MapPin size={11} />
                      <span>{selectedLocation.label || "City"}</span>
                    </span>
                  )}
                  <strong className="delivery-recipient-name">
                    {selectedLocation.address?.fullName || selectedLocation.label}
                  </strong>
                </div>

                <div className="cart-delivery-text-group delivery-address-lines">
                  <span className="cart-delivery-info-address delivery-line-main">
                    {selectedLocation.displayName}
                  </span>
                  {selectedLocation.address && (
                    <span className="cart-delivery-info-subaddress delivery-line-sub">
                      {selectedLocation.address.house} • {selectedLocation.address.city}, {selectedLocation.address.state} - {selectedLocation.address.pincode}
                    </span>
                  )}
                  {selectedLocation.address?.landmark && (
                    <span className="delivery-line-landmark">
                      Landmark: {selectedLocation.address.landmark}
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery ETA & Serviceability Strip */}
              <div className="delivery-eta-strip">
                <div className="delivery-eta-info">
                  <div className="delivery-eta-time-row">
                    <Clock size={13} className="delivery-eta-clock-icon" />
                    <span className="delivery-eta-caption">Estimated delivery:</span>
                    <strong className="delivery-eta-value">{etaInfo.etaText}</strong>
                  </div>
                  <span className="delivery-eta-reason-text">{etaInfo.reason}</span>
                </div>
                <div className="delivery-service-tag" title="Express service active">
                  <span className="service-status-dot" aria-hidden="true" />
                  <span>{etaInfo.serviceabilityStatus}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="cart-delivery-info-content delivery-no-address-box">
              <div className="cart-delivery-text-group">
                <span className="cart-delivery-info-prompt delivery-no-address-title">
                  Add a delivery address
                </span>
                <span className="cart-delivery-info-sub delivery-no-address-sub">
                  Select an address to confirm 10–15 min express delivery and proceed to checkout.
                </span>
              </div>
              <button
                type="button"
                className="delivery-select-address-cta"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLocationModal?.();
                }}
                aria-label="Select delivery address"
              >
                <MapPin size={13} />
                <span>Select address</span>
              </button>
            </div>
          )}
        </section>

        {cartCount === 0 ? (
          /* Empty Cart State */
          <div className="drawer-empty-state">
            <div className="empty-cart-graphic">
              <ShoppingBag size={40} className="empty-bag-icon" />
            </div>
            <h3 className="empty-cart-title">Your cart is empty</h3>
            <p className="empty-cart-desc">
              Your basket is waiting for some fresh essentials and Mithila delicacies!
            </p>

            <button
              type="button"
              className="start-shopping-btn"
              onClick={() => handleStartShopping()}
              aria-label="Continue Shopping"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick Category Exploration */}
            <div className="empty-cart-suggestions">
              <span className="suggestions-title">Popular Categories</span>
              <div className="suggestion-chips">
                {[
                  { name: "Mithila Specials", icon: "🌾" },
                  { name: "Fruits & Vegetables", icon: "🥦" },
                  { name: "Dairy & Breakfast", icon: "🥛" },
                  { name: "Makhana & Dry Fruits", icon: "🥜" },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => handleStartShopping(cat.name)}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Delivery Assurance */}
            <div className="empty-cart-perk">
              <Zap size={14} className="empty-perk-icon" />
              <span>Free delivery on orders over ₹300 • 10-15 min delivery</span>
            </div>

            {onOpenOrders && (
              <button
                type="button"
                className="empty-cart-orders-btn"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                aria-label="View past orders"
              >
                <span>View Past Orders</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Scrollable Cart Content Area */}
            <div className="cart-scroll-content">
              {/* 3. Free Delivery Progress */}
              <div className="delivery-progress-card">
                <div className="progress-text-row">
                  {subtotal >= freeDeliveryThreshold ? (
                    <span className="free-delivery-unlocked">
                      🎉 You've unlocked FREE delivery
                    </span>
                  ) : (
                    <span className="free-delivery-needed">
                      Add <strong>₹{freeDeliveryRemaining}</strong> more for{" "}
                      <strong>FREE delivery</strong>
                    </span>
                  )}
                  <span className="progress-percent-label">{progressPercent}%</span>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress toward free delivery"
                >
                  <div
                    className={`progress-fill ${
                      progressPercent >= 100 ? "progress-fill-complete" : ""
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 4. Cart Items List */}
              <div className="drawer-items-list" role="list">
                {cartItems.map(({ product, quantity }) => {
                  const lineTotal = product.price * quantity;
                  const hasDiscount = product.mrp > product.price;
                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100
                      )
                    : 0;

                  return (
                    <div
                      className="drawer-item-card"
                      key={product.id}
                      role="listitem"
                    >
                      <div
                        className="item-thumbnail"
                        onClick={() => onSelectProduct?.(product)}
                        role={onSelectProduct ? "button" : undefined}
                        tabIndex={onSelectProduct ? 0 : undefined}
                        aria-label={
                          onSelectProduct
                            ? `View details for ${product.name}`
                            : undefined
                        }
                      >
                        {product.image.startsWith("http") ? (
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
                            display: product.image.startsWith("http")
                              ? "none"
                              : "flex",
                          }}
                        >
                          {product.fallbackIcon || "🛒"}
                        </span>
                      </div>

                      <div className="item-info">
                        <h4
                          className="item-title"
                          onClick={() => onSelectProduct?.(product)}
                          role={onSelectProduct ? "button" : undefined}
                          tabIndex={onSelectProduct ? 0 : undefined}
                        >
                          {product.name}
                        </h4>
                        <span className="item-pack-unit">{product.unit}</span>
                        {isItemAvailable && !isItemAvailable(product.id) && (
                          <span className="product-out-of-stock-badge cart-item-oos-badge">
                            Out of Stock
                          </span>
                        )}
                        <div className="item-pricing">
                          <span className="item-price-current">
                            ₹{product.price}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="item-price-mrp">
                                ₹{product.mrp}
                              </span>
                              <span className="item-discount-pill">
                                {discountPercent}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="item-action-controls">
                        <div className="drawer-stepper">
                          <button
                            type="button"
                            className="drawer-stepper-btn"
                            onClick={() => onRemoveFromCart(product.id)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>

                          <span
                            className="drawer-stepper-value"
                            aria-label={`Quantity: ${quantity}`}
                          >
                            {quantity}
                          </span>

                          <button
                            type="button"
                            className="drawer-stepper-btn"
                            onClick={() => onAddToCart(product.id)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="item-card-footer-row">
                          <button
                            type="button"
                            className="item-delete-btn"
                            onClick={() => handleRemoveItem(product, quantity)}
                            aria-label="Remove product"
                            title="Remove product"
                          >
                            <Trash2 size={13} />
                            <span className="delete-text">Remove</span>
                          </button>

                          <span className="item-line-total">₹{lineTotal}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 5. Savings Summary Banner */}
              {productSavings > 0 && (
                <div className="savings-badge-card">
                  <Sparkles size={15} className="savings-sparkle" />
                  <span>
                    You're saving <strong>₹{productSavings}</strong> on this
                    order!
                  </span>
                </div>
              )}

              {/* 6. Complete Your Basket (Suggested Products) */}
              {recommendedProducts.length > 0 && (
                <div className="cart-recommendations-box">
                  <div className="cart-recommendations-header">
                    <div>
                      <h4 className="cart-recommendations-title">
                        Complete your basket
                      </h4>
                      <span className="cart-recommendations-subtitle">
                        Popular essentials frequently added
                      </span>
                    </div>
                    <span className="cart-curated-badge">Handpicked</span>
                  </div>

                  <div className="cart-recommendations-track" role="list">
                    {recommendedProducts.map((prod) => {
                      const isWishlisted = wishlistSet?.has(prod.id);
                      const hasDiscount = prod.mrp > prod.price;

                      return (
                        <div
                          className="cart-rec-item"
                          key={prod.id}
                          role="listitem"
                        >
                          {onToggleWishlist && (
                            <button
                              type="button"
                              className={`cart-rec-wishlist-toggle ${
                                isWishlisted ? "active" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(prod.id);
                              }}
                              aria-label={
                                isWishlisted
                                  ? `Remove ${prod.name} from wishlist`
                                  : `Add ${prod.name} to wishlist`
                              }
                            >
                              <Heart
                                size={13}
                                fill={isWishlisted ? "#ef4444" : "none"}
                                color={isWishlisted ? "#ef4444" : "#94a3b8"}
                              />
                            </button>
                          )}

                          <div
                            className="cart-rec-img-box"
                            onClick={() => onSelectProduct?.(prod)}
                            role={onSelectProduct ? "button" : undefined}
                            tabIndex={onSelectProduct ? 0 : undefined}
                            aria-label={
                              onSelectProduct
                                ? `View details for ${prod.name}`
                                : undefined
                            }
                          >
                            {prod.image.startsWith("http") ? (
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="cart-rec-photo"
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
                              className="cart-rec-emoji-fallback"
                              style={{
                                display: prod.image.startsWith("http")
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              {prod.fallbackIcon || "🛒"}
                            </span>
                          </div>

                          <div className="cart-rec-meta">
                            <h5
                              className="cart-rec-title"
                              onClick={() => onSelectProduct?.(prod)}
                              role={onSelectProduct ? "button" : undefined}
                              tabIndex={onSelectProduct ? 0 : undefined}
                            >
                              {prod.name}
                            </h5>
                            <span className="cart-rec-unit-text">
                              {prod.unit}
                            </span>
                            <div className="cart-rec-price-strip">
                              <span className="cart-rec-selling-price">
                                ₹{prod.price}
                              </span>
                              {hasDiscount && (
                                <span className="cart-rec-mrp-price">
                                  ₹{prod.mrp}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="cart-rec-add-btn"
                            onClick={() => onAddToCart(prod.id)}
                            aria-label={`Add ${prod.name} to cart`}
                          >
                            <Plus size={13} />
                            <span>ADD</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. Order Summary */}
              <div className="bill-card">
                <div className="bill-header-row">
                  <h4 className="bill-heading">Order Summary</h4>
                  <span className="bill-delivery-note">Free delivery above ₹300</span>
                </div>

                <div className="bill-row">
                  <span className="bill-label">Subtotal</span>
                  <span className="bill-value">₹{subtotal}</span>
                </div>

                <div className="bill-row">
                  <div className="bill-label-with-hint">
                    <span>Estimated delivery</span>
                    <span className="fee-hint">{etaInfo.reason}</span>
                  </div>
                  <div className="bill-eta-summary-badge">
                    <Clock size={12} />
                    <strong>{etaInfo.etaText}</strong>
                  </div>
                </div>

                <div className="bill-row">
                  <div className="bill-label-with-hint">
                    <span>Delivery fee</span>
                    <span className="fee-hint">
                      {deliveryFee === 0
                        ? "Free delivery unlocked"
                        : "Orders below/equal to ₹300"}
                    </span>
                  </div>
                  <span
                    className={`bill-value ${
                      deliveryFee === 0 ? "fee-free" : ""
                    }`}
                  >
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                {productSavings > 0 && (
                  <div className="bill-row bill-savings-row">
                    <span className="bill-label">Product savings</span>
                    <span className="bill-value fee-free">
                      -₹{productSavings}
                    </span>
                  </div>
                )}

                <div className="bill-divider"></div>

                <div className="bill-row grand-total-row">
                  <div>
                    <strong className="grand-total-label">Total</strong>
                    <span className="inclusive-taxes">
                      Inclusive of all taxes
                    </span>
                  </div>
                  <strong className="grand-total-value">₹{total}</strong>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="safe-delivery-note">
                <ShieldCheck size={16} />
                <span>Contactless doorstep drop in {etaInfo.etaText}</span>
              </div>
            </div>

            {/* 8. Sticky Action Area (Undo Toast, Checkout Notice & CTA) */}
            <div className="drawer-footer">
              {/* Undo Removal Toast */}
              {removedItem && (
                <div
                  className="cart-undo-toast"
                  role="status"
                  aria-live="polite"
                >
                  <div className="cart-undo-message-group">
                    <span className="cart-undo-label">Item removed</span>
                    <span className="cart-undo-item-name">
                      {removedItem.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cart-undo-action-btn"
                    onClick={handleUndo}
                    aria-label={`Undo removal of ${removedItem.name}`}
                  >
                    <RotateCcw size={13} />
                    <span>Undo</span>
                  </button>
                </div>
              )}

              {/* Frontend-only Checkout Notice */}
              {showCheckoutNotice && (
                <div
                  className="cart-checkout-notice"
                  role="status"
                  aria-live="polite"
                >
                  <div className="checkout-notice-header">
                    <div className="checkout-notice-badge">
                      <Sparkles size={12} /> Checkout Ready
                    </div>
                    <button
                      type="button"
                      className="checkout-notice-close-btn"
                      onClick={() => setShowCheckoutNotice(false)}
                      aria-label="Dismiss checkout notice"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <strong className="checkout-notice-title">
                    Order Summary Verified
                  </strong>
                  <p className="checkout-notice-desc">
                    Your basket of {cartCount} {cartCount === 1 ? "item" : "items"} (₹{total}) is verified for delivery to{" "}
                    <strong>{selectedLocation?.displayName}</strong> in <strong>{etaInfo.etaText}</strong>.
                  </p>
                </div>
              )}

              {/* Proceed to Checkout CTA */}
              {(() => {
                const hasUnavailableItems = cartItems.some(
                  (item) => isItemAvailable && !isItemAvailable(item.product.id)
                );
                return (
                  <div className="checkout-action-wrapper">
                    <button
                      type="button"
                      className={`checkout-primary-btn ${!selectedLocation ? "checkout-btn-need-address" : ""} ${hasUnavailableItems ? "checkout-btn-disabled" : ""}`}
                      onClick={handleContinueToCheckout}
                      disabled={cartCount === 0 || hasUnavailableItems}
                      aria-label={
                        hasUnavailableItems
                          ? "Remove unavailable items to checkout"
                          : selectedLocation
                          ? `Proceed to Checkout • Total ₹${total}`
                          : "Select delivery address to proceed"
                      }
                    >
                      <div className="btn-price-summary">
                        <span className="btn-total">₹{total}</span>
                        <span className="btn-subtext">TOTAL</span>
                      </div>
                      <div className="btn-cta-text">
                        <span>
                          {hasUnavailableItems
                            ? "Remove out of stock items"
                            : selectedLocation
                            ? "Proceed to Checkout"
                            : "Select Address to Checkout"}
                        </span>
                        <ArrowRight size={18} />
                      </div>
                    </button>
                    <span className={`phase-note ${!selectedLocation || hasUnavailableItems ? "phase-note-alert" : ""}`}>
                      {hasUnavailableItems
                        ? "Please remove out of stock items from your cart to proceed"
                        : selectedLocation
                        ? `Doorstep delivery in ${etaInfo.etaText} • ${etaInfo.serviceabilityStatus}`
                        : "Please select an address before checkout"}
                    </span>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
