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
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="logo-icon-wrapper">
              <span className="logo-symbol">🌾</span>
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
            title="Express delivery active in Mithila region (Location picker coming in Phase 4)"
            role="button"
            tabIndex={0}
            aria-label="Delivery location selector placeholder"
          >
            <div className="location-icon-wrapper">
              <MapPin size={16} />
            </div>
            <div className="location-info">
              <div className="location-heading">
                <span>Deliver in 12 mins</span>
              </div>
              <div className="location-detail">
                <span className="location-address">Darbhanga & Madhubani, Bihar</span>
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
