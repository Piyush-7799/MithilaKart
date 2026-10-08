import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  ShoppingBag,
  ChevronRight,
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Layers,
} from "lucide-react";
import type { UserProfile, Order } from "../types";
import { getInitials, validateEmail } from "../utils/profileStorage";

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string) => Promise<void>;
  onLogout: () => void;
  orders: Order[];
  savedAddressesCount: number;
  cartCount: number;
  onOpenOrders: () => void;
  onOpenAddresses: () => void;
  onViewOrderDetails: (order: Order) => void;
  onContinueShopping: () => void;
  onOpenAdmin?: () => void;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function AccountModal({
  isOpen,
  onClose,
  profile,
  onLogin,
  onRegister,
  onLogout,
  orders,
  savedAddressesCount,
  cartCount,
  onOpenOrders,
  onOpenAddresses,
  onViewOrderDetails,
  onContinueShopping,
  onOpenAdmin,
}: AccountModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle close and reset edit state
  const handleClose = useCallback(() => {
    setAuthMode("login");
    setErrorMsg("");
    setFullName("");
    setEmail("");
    setPassword("");
    onClose();
  }, [onClose]);

  // Lock background scroll when modal is open
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
        handleClose();
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      if (authMode === "login") {
        await onLogin(trimmedEmail, password);
      } else {
        const trimmedName = fullName.trim();
        if (!trimmedName) {
          setErrorMsg("Please enter your full name.");
          setIsLoading(false);
          return;
        }
        await onRegister(trimmedName, trimmedEmail, password);
      }
      handleClose(); // successfully logged in/registered, close the modal
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = getInitials(profile?.fullName);
  const recentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div
      className="account-modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="My Account"
    >
      <div
        className="account-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="account-sheet-handle" aria-hidden="true" />
        {/* Header */}
        <div className="account-modal-header">
          <div className="account-header-title-wrap">
            <div className="account-header-icon-box">
              <User size={19} />
            </div>
            <div>
              <h2 className="account-modal-title">My Account</h2>
              <span className="account-modal-subtitle">
                MithilaKart Member Profile
              </span>
            </div>
          </div>

          <button
            type="button"
            className="account-modal-close-btn"
            onClick={handleClose}
            aria-label="Close Account"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="account-modal-body">
          {/* Profile Card / View or Edit */}
          <div className="account-profile-card">
            <div className="account-avatar-wrapper">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="account-avatar-img"
                />
              ) : initials ? (
                <div className="account-avatar-initials" aria-hidden="true">
                  {initials}
                </div>
              ) : (
                <div className="account-avatar-placeholder" aria-hidden="true">
                  <User size={28} />
                </div>
              )}
            </div>

            {profile ? (
              /* Profile Read View */
              <div className="account-profile-details">
                <div className="account-profile-name-row">
                  <strong className="account-user-name">
                    {profile.fullName || "Not added"}
                  </strong>
                  <button
                    type="button"
                    className="account-edit-trigger-btn"
                    onClick={() => {
                      onLogout();
                      handleClose();
                    }}
                    aria-label="Logout"
                  >
                    <span>Logout</span>
                  </button>
                </div>

                <div className="account-profile-meta-list">
                  <div className="account-meta-item">
                    <Phone size={14} className="account-meta-icon" />
                    <span>
                      {profile?.phone ? `+91 ${profile.phone}` : "Phone: Not added"}
                    </span>
                  </div>

                  <div className="account-meta-item">
                    <Mail size={14} className="account-meta-icon" />
                    <span>
                      {profile?.email ? profile.email : "Email: Not added"}
                    </span>
                  </div>
                </div>

                {!profile?.fullName && (
                  <span className="account-profile-hint">
                    Complete your profile for faster checkout and easy receipts.
                  </span>
                )}
              </div>
            ) : (
              /* Profile Edit Form -> Login/Register Form */
              <form className="account-edit-form" onSubmit={handleAuthSubmit} noValidate>
                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "0.25rem" }}>
                    {authMode === "login" ? "Login to your account" : "Create a new account"}
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                    {authMode === "login"
                      ? "Welcome back to MithilaKart."
                      : "Join MithilaKart for faster checkout."}
                  </p>
                </div>

                {authMode === "register" && (
                  <div className="account-form-field">
                    <label htmlFor="account-name-input" className="account-form-label">
                      Full Name *
                    </label>
                    <input
                      id="account-name-input"
                      type="text"
                      className="account-form-input"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setErrorMsg("");
                      }}
                      autoFocus
                    />
                  </div>
                )}

                <div className="account-form-field">
                  <label htmlFor="account-email-input" className="account-form-label">
                    Email Address *
                  </label>
                  <input
                    id="account-email-input"
                    type="email"
                    className="account-form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg("");
                    }}
                  />
                </div>

                <div className="account-form-field">
                  <label htmlFor="account-password-input" className="account-form-label">
                    Password *
                  </label>
                  <input
                    id="account-password-input"
                    type="password"
                    className="account-form-input"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg("");
                    }}
                  />
                </div>

                {errorMsg && (
                  <span className="account-field-error" role="alert" style={{ marginBottom: "1rem", display: "flex" }}>
                    <AlertCircle size={12} style={{ marginRight: "4px" }} /> {errorMsg}
                  </span>
                )}

                <div className="account-form-actions" style={{ flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                  <button
                    type="submit"
                    className="account-save-btn"
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Please wait..." : (authMode === "login" ? "Login" : "Register")}
                  </button>
                  <button
                    type="button"
                    className="account-cancel-btn"
                    style={{ width: "100%", justifyContent: "center", border: "none", background: "none" }}
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "register" : "login");
                      setErrorMsg("");
                    }}
                  >
                    {authMode === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Activity Statistics Bar */}
          <div className="account-stats-grid">
            <div className="account-stat-card">
              <span className="account-stat-value">{orders.length}</span>
              <span className="account-stat-label">Orders Placed</span>
            </div>
            <div className="account-stat-card">
              <span className="account-stat-value">{savedAddressesCount}</span>
              <span className="account-stat-label">Saved Addresses</span>
            </div>
            <div className="account-stat-card">
              <span className="account-stat-value">{cartCount}</span>
              <span className="account-stat-label">Cart Items</span>
            </div>
          </div>

          {/* Quick Navigation Sections: Saved Addresses & Orders */}
          <div className="account-nav-sections">
            {/* Saved Addresses Section */}
            <div
              className="account-nav-card"
              onClick={() => {
                onClose();
                onOpenAddresses();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClose();
                  onOpenAddresses();
                }
              }}
              aria-label="Manage saved addresses"
            >
              <div className="account-nav-icon-box address">
                <MapPin size={18} />
              </div>
              <div className="account-nav-info">
                <strong className="account-nav-title">Saved Addresses</strong>
                <span className="account-nav-sub">
                  {savedAddressesCount > 0
                    ? `${savedAddressesCount} saved ${savedAddressesCount === 1 ? "address" : "addresses"}`
                    : "No saved addresses"}
                </span>
              </div>
              <div className="account-nav-action">
                <span className="account-nav-cta-text">
                  {savedAddressesCount > 0 ? "Manage" : "Add address"}
                </span>
                <ChevronRight size={15} />
              </div>
            </div>

            {/* My Orders Section */}
            <div
              className="account-nav-card"
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClose();
                  onOpenOrders();
                }
              }}
              aria-label="Open order history"
            >
              <div className="account-nav-icon-box orders">
                <Package size={18} />
              </div>
              <div className="account-nav-info">
                <strong className="account-nav-title">My Orders</strong>
                <span className="account-nav-sub">
                  {orders.length > 0
                    ? `${orders.length} placed ${orders.length === 1 ? "order" : "orders"}`
                    : "No orders yet"}
                </span>
              </div>
              <div className="account-nav-action">
                <span className="account-nav-cta-text">
                  {orders.length > 0 ? "View All" : "Explore"}
                </span>
                <ChevronRight size={15} />
              </div>
            </div>
          </div>

          {/* Recent Order Preview Section */}
          <div className="account-recent-order-section">
            <div className="account-section-header">
              <span className="account-section-title">Recent Order</span>
            </div>

            {recentOrder ? (
              <div className="account-recent-order-card">
                <div className="recent-order-header">
                  <div className="recent-order-id-group">
                    <strong className="recent-order-id">{recentOrder.id}</strong>
                    <span className="recent-order-date">
                      {formatDate(recentOrder.createdAt)}
                    </span>
                  </div>
                  <span className="recent-order-badge">
                    {recentOrder.status}
                  </span>
                </div>

                <div className="recent-order-body">
                  <div className="recent-order-items-preview">
                    {recentOrder.items.slice(0, 3).map((it) => (
                      <span key={it.productId} className="recent-item-chip">
                        {it.name} (x{it.quantity})
                      </span>
                    ))}
                    {recentOrder.items.length > 3 && (
                      <span className="recent-item-more">
                        +{recentOrder.items.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="recent-order-eta-row">
                    <Clock size={12} />
                    <span>Delivery: {recentOrder.estimatedDelivery}</span>
                  </div>
                </div>

                <div className="recent-order-footer">
                  <div className="recent-order-total-group">
                    <span className="recent-order-label">Total</span>
                    <strong className="recent-order-price">₹{recentOrder.total}</strong>
                  </div>

                  <button
                    type="button"
                    className="recent-order-view-btn"
                    onClick={() => {
                      onClose();
                      onViewOrderDetails(recentOrder);
                    }}
                    aria-label={`View order ${recentOrder.id}`}
                  >
                    <span>View Order</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="account-recent-order-empty">
                <ShoppingBag size={24} className="recent-empty-icon" />
                <p className="recent-empty-text">
                  You haven't placed any orders yet. Fresh Mithila produce and pantry essentials arrive in 10-15 minutes!
                </p>
              </div>
            )}
          </div>

          {/* Local Admin Development Entry */}
          {onOpenAdmin && (
            <div className="account-dev-admin-box">
              <button
                type="button"
                className="account-dev-admin-btn"
                onClick={() => {
                  handleClose();
                  onOpenAdmin();
                }}
                title="Open Local Operations Admin"
                aria-label="Open Local Admin Dashboard (Development)"
              >
                <Layers size={16} />
                <span>Open Local Admin Dashboard (Dev)</span>
              </button>
            </div>
          )}

          {/* Trust Banner */}
          <div className="account-trust-banner">
            <ShieldCheck size={16} />
            <span>MithilaKart Express • Localized regional quick-commerce</span>
          </div>
        </div>

        {/* Footer */}
        <div className="account-modal-footer">
          <button
            type="button"
            className="account-continue-shopping-btn"
            onClick={() => {
              onClose();
              onContinueShopping();
            }}
            aria-label="Continue Shopping"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
