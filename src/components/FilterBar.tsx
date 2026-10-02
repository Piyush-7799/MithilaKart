import { useState, useMemo } from "react";
import { SlidersHorizontal, ArrowUpDown, Sparkles, X, ChevronDown } from "lucide-react";
import type { Category, FilterState, SortOption } from "../types";
import { FilterModal } from "./FilterModal";

interface FilterBarProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  sortBy: SortOption;
  onUpdateSort: (sortBy: SortOption) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: Category[];
  onClearAllFilters: () => void;
  resultCount: number;
}

const PRICE_LABELS: Record<string, string> = {
  "under-100": "Under ₹100",
  "100-250": "₹100–₹250",
  "250-500": "₹250–₹500",
  "500-plus": "₹500+",
};

export function FilterBar({
  filters,
  onUpdateFilter,
  sortBy,
  onUpdateSort,
  selectedCategory,
  onSelectCategory,
  categories,
  onClearAllFilters,
  resultCount,
}: FilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate active filter count (excluding default state)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange !== "all") count++;
    if (filters.discountThreshold > 0) count++;
    if (filters.specialOnly) count++;
    if (selectedCategory !== "All") count++;
    return count;
  }, [filters, selectedCategory]);

  // Construct active chips list
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];

    if (filters.specialOnly) {
      chips.push({
        id: "special",
        label: "Mithila Specials",
        onRemove: () => onUpdateFilter("specialOnly", false),
      });
    }

    if (filters.priceRange !== "all" && PRICE_LABELS[filters.priceRange]) {
      chips.push({
        id: "price",
        label: `Price: ${PRICE_LABELS[filters.priceRange]}`,
        onRemove: () => onUpdateFilter("priceRange", "all"),
      });
    }

    if (filters.discountThreshold > 0) {
      chips.push({
        id: "discount",
        label: `Discount: ${filters.discountThreshold}%+ OFF`,
        onRemove: () => onUpdateFilter("discountThreshold", 0),
      });
    }

    if (selectedCategory !== "All") {
      chips.push({
        id: "category",
        label: `Category: ${selectedCategory}`,
        onRemove: () => onSelectCategory("All"),
      });
    }

    return chips;
  }, [filters, selectedCategory, onUpdateFilter, onSelectCategory]);

  return (
    <div className="filter-bar-container" aria-label="Product catalogue filters and sorting">
      {/* Main Filter & Sort Controls Row */}
      <div className="filter-bar-main-row">
        {/* Left Actions: Filter Modal Trigger & Quick Specials Pill */}
        <div className="filter-bar-left">
          <button
            type="button"
            className={`filter-trigger-btn ${activeFilterCount > 0 ? "filter-trigger-active" : ""}`}
            onClick={() => setIsModalOpen(true)}
            aria-label={`Open filter options. ${activeFilterCount} active filters`}
            aria-expanded={isModalOpen}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge" aria-label={`${activeFilterCount} filters active`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Toggle: Mithila Specials Shortcut */}
          <button
            type="button"
            className={`quick-filter-pill ${filters.specialOnly ? "quick-filter-pill-active" : ""}`}
            onClick={() => onUpdateFilter("specialOnly", !filters.specialOnly)}
            aria-label="Toggle Mithila Specials only"
            aria-pressed={filters.specialOnly}
          >
            <Sparkles size={13} className="quick-pill-icon" />
            <span>Mithila Specials</span>
          </button>
        </div>

        {/* Right Action: Sort Dropdown */}
        <div className="filter-bar-right">
          <div className="sort-control-group">
            <label htmlFor="product-sort-select" className="sort-label">
              <ArrowUpDown size={14} className="sort-icon" />
              <span className="sort-label-text">Sort by:</span>
            </label>
            <div className="sort-select-wrapper">
              <select
                id="product-sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => onUpdateSort(e.target.value as SortOption)}
                aria-label="Sort products by"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount-desc">Discount: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <ChevronDown size={14} className="sort-chevron-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Row (Shown only when filters are active) */}
      {activeChips.length > 0 && (
        <div className="active-filters-strip" role="region" aria-label="Active filters">
          <div className="active-chips-track">
            {activeChips.map((chip) => (
              <span className="active-filter-chip" key={chip.id}>
                <span className="chip-text">{chip.label}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <button
              type="button"
              className="clear-all-filters-btn"
              onClick={onClearAllFilters}
              aria-label="Clear all active filters"
            >
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile/Desktop Filter Drawer & Modal */}
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          onSelectCategory(cat);
        }}
        filters={filters}
        onUpdateFilter={onUpdateFilter}
        onClearFilters={() => {
          onClearAllFilters();
        }}
        resultCount={resultCount}
      />
    </div>
  );
}
