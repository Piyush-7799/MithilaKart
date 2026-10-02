import { useEffect, memo } from "react";
import { X, Sparkles, RotateCcw, Check } from "lucide-react";
import type { Category, DiscountThreshold, FilterState, PriceRange } from "../types";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClearFilters: () => void;
  resultCount: number;
}

const PRICE_OPTIONS: { id: PriceRange; label: string; sub?: string }[] = [
  { id: "all", label: "All Prices" },
  { id: "under-100", label: "Under ₹100", sub: "Budget essentials" },
  { id: "100-250", label: "₹100–₹250", sub: "Daily staples" },
  { id: "250-500", label: "₹250–₹500", sub: "Premium picks" },
  { id: "500-plus", label: "₹500+", sub: "Bulk & gourmet" },
];

const DISCOUNT_OPTIONS: { id: DiscountThreshold; label: string }[] = [
  { id: 0, label: "Any Discount" },
  { id: 10, label: "10%+ OFF" },
  { id: 20, label: "20%+ OFF" },
  { id: 30, label: "30%+ OFF" },
];

function FilterModalInner({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  filters,
  onUpdateFilter,
  onClearFilters,
  resultCount,
}: FilterModalProps) {
  // Close on Escape key press
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

  if (!isOpen) return null;

  const hasActiveFilters =
    filters.priceRange !== "all" ||
    filters.discountThreshold > 0 ||
    filters.specialOnly ||
    selectedCategory !== "All";

  return (
    <div
      className="filter-modal-backdrop"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Filter products"
    >
      <div
        className="filter-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="filter-modal-header">
          <div className="filter-modal-title-group">
            <h3 className="filter-modal-title">Filters</h3>
            {hasActiveFilters && (
              <span className="filter-modal-active-badge">Active</span>
            )}
          </div>
          <button
            type="button"
            className="filter-modal-close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="filter-modal-body">
          {/* 1. Special Mithila Regional Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Regional Specialty</h4>
            <div className="filter-options-grid">
              <button
                type="button"
                className={`filter-chip-option filter-chip-special ${
                  filters.specialOnly ? "filter-chip-selected" : ""
                }`}
                onClick={() => onUpdateFilter("specialOnly", !filters.specialOnly)}
                aria-pressed={filters.specialOnly}
              >
                <Sparkles size={14} className="filter-chip-icon" />
                <span>Mithila Specials only</span>
                {filters.specialOnly && <Check size={14} className="filter-check-icon" />}
              </button>
            </div>
          </div>

          {/* 2. Price Range Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Price Range</h4>
            <div className="filter-options-grid">
              {PRICE_OPTIONS.map((opt) => {
                const isSelected = filters.priceRange === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`filter-chip-option ${
                      isSelected ? "filter-chip-selected" : ""
                    }`}
                    onClick={() => onUpdateFilter("priceRange", opt.id)}
                    aria-pressed={isSelected}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="filter-check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Discount Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Discount Offer</h4>
            <div className="filter-options-grid">
              {DISCOUNT_OPTIONS.map((opt) => {
                const isSelected = filters.discountThreshold === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`filter-chip-option ${
                      isSelected ? "filter-chip-selected" : ""
                    }`}
                    onClick={() => onUpdateFilter("discountThreshold", opt.id)}
                    aria-pressed={isSelected}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="filter-check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Category Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">Category</h4>
            <div className="filter-categories-grid">
              <button
                type="button"
                className={`filter-category-pill ${
                  selectedCategory === "All" ? "filter-category-selected" : ""
                }`}
                onClick={() => onSelectCategory("All")}
                aria-pressed={selectedCategory === "All"}
              >
                <span className="filter-category-icon">🛒</span>
                <span className="filter-category-name">All Products</span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    className={`filter-category-pill ${
                      isSelected ? "filter-category-selected" : ""
                    } ${cat.isSignature ? "filter-category-signature" : ""}`}
                    onClick={() => onSelectCategory(cat.name)}
                    aria-pressed={isSelected}
                  >
                    <span className="filter-category-icon">{cat.icon}</span>
                    <span className="filter-category-name">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="filter-modal-footer">
          <button
            type="button"
            className="filter-clear-all-btn"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            aria-label="Clear all filters"
          >
            <RotateCcw size={14} />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            className="filter-apply-btn"
            onClick={onClose}
            aria-label={`Apply filters, view ${resultCount} products`}
          >
            <span>Show {resultCount} {resultCount === 1 ? "Product" : "Products"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const FilterModal = memo(FilterModalInner);

