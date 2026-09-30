import { Search, ShoppingBag, MapPin, ChevronDown, X, Zap } from "lucide-react";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  cartTotal?: number;
  onOpenCart: () => void;
}

export function Header({
  search,
  onSearchChange,
  cartCount,
  cartTotal = 0,
  onOpenCart,
}: HeaderProps) {
  return (
    <header className="navbar-container">
      <div className="navbar">
        {/* Brand / Logo */}
        <div className="brand-group">
          <div
            className="logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            role="button"
            tabIndex={0}
            aria-label="MithilaKart Home - Quick Commerce"
          >
            <div className="logo-mark" aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="brand-symbol"
              >
                <defs>
                  <linearGradient id="mk-m-gradient" x1="6" y1="9" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#064E3B" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="mk-gold-crest" x1="18" y1="3.5" x2="18" y2="13.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                {/* Symmetrical Geometric Mithila M with 45-degree facets */}
                <path
                  d="M6 29V12.5L9.5 9H11.5L18 18.5L24.5 9H26.5L30 12.5V29H25V14.2L18 24L11 14.2V29H6Z"
                  fill="url(#mk-m-gradient)"
                />
                {/* Mithila Sacred Diamond Crest (Ratna) */}
                <path
                  d="M18 3.5L23 8.5L18 13.5L13 8.5Z"
                  fill="url(#mk-gold-crest)"
                />
                {/* Inner Diamond Bindu Core */}
                <path
                  d="M18 6L20.5 8.5L18 11L15.5 8.5Z"
                  fill="#FEF3C7"
                />
              </svg>
            </div>

            <div className="logo-text-block">
              <span className="logo-name">
                Mithila<span className="logo-accent">Kart</span>
              </span>
              <span className="logo-tagline">
                <Zap size={11} className="zap-icon" /> 10-15 MIN DELIVERY
              </span>
            </div>
          </div>

          {/* Location / Delivery Indicator (Phase 4 placeholder) */}
          <div 
            className="location-pill" 
            title="Express delivery active across Mithila"
            role="button"
            tabIndex={0}
            aria-label="Delivery location: Delivering across Mithila"
          >
            <div className="location-icon-wrapper">
              <MapPin size={16} />
            </div>
            <div className="location-info">
              <div className="location-heading">
                <span>Deliver in 12 mins</span>
              </div>
              <div className="location-detail">
                <span className="location-address">Delivering across Mithila</span>
                <ChevronDown size={14} className="chevron-icon" />
              </div>
            </div>
          </div>
        </div>

        {/* Large Search Bar */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search milk, fresh mangoes, makhana, vegetables..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange("")}
              aria-label="Clear search text"
              type="button"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Header Actions / Cart Button */}
        <div className="header-actions">
          <button
            className={`cart-button ${cartCount > 0 ? "cart-button-active" : ""}`}
            onClick={onOpenCart}
            aria-label={`Open cart with ${cartCount} items`}
            type="button"
          >
            <div className="cart-icon-box">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <div className="cart-button-text">
              <span className="cart-btn-title">My Cart</span>
              {cartCount > 0 ? (
                <span className="cart-btn-sub">
                  {cartCount} {cartCount === 1 ? "item" : "items"} · ₹{cartTotal}
                </span>
              ) : (
                <span className="cart-btn-sub">Empty</span>
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
