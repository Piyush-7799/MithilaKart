import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  ShoppingBag,
  Edit3,
  Check,
  ChevronRight,
  Clock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import type { UserProfile, Order } from "../types";
import { getInitials, validateIndianPhone, validateEmail } from "../utils/profileStorage";

export interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  orders: Order[];
  savedAddressesCount: number;
  cartCount: number;
  onOpenOrders: () => void;
  onOpenAddresses: () => void;
  onViewOrderDetails: (order: Order) => void;
  onContinueShopping: () => void;
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
  onSaveProfile,
  orders,
  savedAddressesCount,
  cartCount,
  onOpenOrders,
  onOpenAddresses,
  onViewOrderDetails,
  onContinueShopping,
}: AccountModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  // Handle close and reset edit state
  const handleClose = useCallback(() => {
    setIsEditing(false);
    setErrors({});
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

  const handleStartEdit = () => {
    setFullName(profile?.fullName || "");
    setPhone(profile?.phone || "");
    setEmail(profile?.email || "");
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = "Please enter your full name.";
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !validateIndianPhone(trimmedPhone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail && !validateEmail(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const updatedProfile: UserProfile = {
      id: profile?.id || `user_${Date.now()}`,
      fullName: trimmedName,
      phone: trimmedPhone || undefined,
      email: trimmedEmail || undefined,
      createdAt: profile?.createdAt || now,
      updatedAt: now,
    };

    onSaveProfile(updatedProfile);
    setIsEditing(false);
    setErrors({});
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

            {!isEditing ? (
              /* Profile Read View */
              <div className="account-profile-details">
                <div className="account-profile-name-row">
                  <strong className="account-user-name">
                    {profile?.fullName || "Not added"}
                  </strong>
                  <button
                    type="button"
                    className="account-edit-trigger-btn"
                    onClick={handleStartEdit}
                    aria-label="Edit Profile"
                  >
                    <Edit3 size={13} />
                    <span>Edit Profile</span>
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
              /* Profile Edit Form */
              <form className="account-edit-form" onSubmit={handleSave} noValidate>
                <div className="account-form-field">
                  <label htmlFor="account-name-input" className="account-form-label">
                    Full Name *
                  </label>
                  <input
                    id="account-name-input"
                    type="text"
                    className={`account-form-input ${errors.fullName ? "input-error" : ""}`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    autoFocus
                  />
                  {errors.fullName && (
                    <span className="account-field-error" role="alert">
                      <AlertCircle size={12} /> {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="account-form-field">
                  <label htmlFor="account-phone-input" className="account-form-label">
                    Mobile Number (Optional)
                  </label>
                  <input
                    id="account-phone-input"
                    type="tel"
                    className={`account-form-input ${errors.phone ? "input-error" : ""}`}
                    placeholder="10-digit mobile number"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                  />
                  {errors.phone && (
                    <span className="account-field-error" role="alert">
                      <AlertCircle size={12} /> {errors.phone}
                    </span>
                  )}
                </div>

                <div className="account-form-field">
                  <label htmlFor="account-email-input" className="account-form-label">
                    Email Address (Optional)
                  </label>
                  <input
                    id="account-email-input"
                    type="email"
                    className={`account-form-input ${errors.email ? "input-error" : ""}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  />
                  {errors.email && (
                    <span className="account-field-error" role="alert">
                      <AlertCircle size={12} /> {errors.email}
                    </span>
                  )}
                </div>

                <div className="account-form-actions">
                  <button
                    type="button"
                    className="account-cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="account-save-btn"
                  >
                    <Check size={14} />
                    <span>Save Changes</span>
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
