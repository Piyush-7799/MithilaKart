import { useState, useRef } from "react";
import { Search, ShoppingBag, MapPin, ChevronDown, X, Zap } from "lucide-react";
import type { DeliveryLocation, Product } from "../types";
import { SearchSuggestions } from "./SearchSuggestions";

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  cartTotal?: number;
  onOpenCart: () => void;
  selectedLocation: DeliveryLocation | null;
  onOpenLocationModal: () => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function Header({
  search,
  onSearchChange,
  cartCount,
  cartTotal = 0,
  onOpenCart,
  selectedLocation,
  onOpenLocationModal,
  products = [],
  onSelectProduct,
  selectedCategory,
  onSelectCategory,
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showSuggestions =
    isSearchFocused &&
    search.trim().length > 0 &&
    Boolean(onSelectProduct) &&
    products.length > 0;

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
            aria-label="MithilaKart Home"
          >
            <span className="logo-name">
              Mithila<span className="logo-accent">Kart</span>
            </span>
            <span className="logo-tagline">
              <Zap size={10} className="zap-icon" /> 10-15 MIN DELIVERY
            </span>
          </div>

          {/* Clickable Location Selector Button */}
          <button 
            type="button"
            className="location-pill" 
            onClick={onOpenLocationModal}
            title={selectedLocation ? `Delivery location: ${selectedLocation.displayName}` : "Select delivery location"}
            aria-label={`Delivery location: ${selectedLocation ? selectedLocation.displayName : "Select location"}`}
          >
            <div className="location-icon-wrapper">
              <MapPin size={16} />
            </div>
            <div className="location-info">
              <div className="location-heading">
                <span>Deliver to</span>
              </div>
              <div className="location-detail">
                <span className="location-address">
                  {selectedLocation ? selectedLocation.displayName : "Select location"}
                </span>
                <ChevronDown size={14} className="chevron-icon" />
              </div>
            </div>
          </button>
        </div>

        {/* Large Search Bar with Live Suggestions Dropdown */}
        <div className={`search-wrapper ${isSearchFocused ? "search-wrapper-focused" : ""}`}>
          <Search size={18} className="search-icon" />
          <input
            ref={searchInputRef}
            className="search-input"
            type="text"
            placeholder="Search milk, fresh mangoes, makhana, vegetables..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsSearchFocused(false);
              }
            }}
            aria-label="Search products"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          />
          {search && (
            <button
              className="search-clear-btn"
              onClick={() => {
                onSearchChange("");
                setIsSearchFocused(false);
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search text"
              type="button"
            >
              <X size={15} />
            </button>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && onSelectProduct && (
            <SearchSuggestions
              query={search}
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              onSelectProduct={(product) => {
                onSelectProduct(product);
                setIsSearchFocused(false);
              }}
              onClose={() => setIsSearchFocused(false)}
            />
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
