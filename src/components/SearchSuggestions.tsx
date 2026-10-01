import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Tag, Package } from "lucide-react";
import type { Product } from "../types";

interface SearchSuggestionsProps {
  query: string;
  products: Product[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

export function SearchSuggestions({
  query,
  products,
  selectedCategory = "All",
  onSelectCategory,
  onSelectProduct,
  onClose,
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim().toLowerCase();
  const isFilteringCategory = selectedCategory !== "All";

  const matchesQuery = (p: Product) => {
    const nameMatch = p.name.toLowerCase().includes(trimmedQuery);
    const catMatch = p.category.toLowerCase().includes(trimmedQuery);
    const unitMatch = p.unit.toLowerCase().includes(trimmedQuery);
    const badgeMatch = p.badge ? p.badge.toLowerCase().includes(trimmedQuery) : false;
    const descMatch = p.description ? p.description.toLowerCase().includes(trimmedQuery) : false;
    const specialMatch =
      Boolean(p.isMithilaSpecial) &&
      (trimmedQuery.includes("special") ||
        trimmedQuery.includes("mithila") ||
        trimmedQuery.includes("regional"));

    return nameMatch || catMatch || unitMatch || badgeMatch || descMatch || specialMatch;
  };

  // Find matching products within current category filter
  const matchingProducts = products.filter((p) => {
    if (isFilteringCategory && p.category !== selectedCategory) {
      return false;
    }
    return matchesQuery(p);
  });

  const suggestions = matchingProducts.slice(0, 5);

  // Check if matches exist outside the current category
  const otherMatchesCount = isFilteringCategory
    ? products.filter((p) => p.category !== selectedCategory && matchesQuery(p)).length
    : 0;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Handle keyboard navigation (Escape, ArrowUp, ArrowDown, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        onSelectProduct(suggestions[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [suggestions, selectedIndex, onSelectProduct, onClose]);

  const handleViewAll = () => {
    onClose();
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="search-suggestions-dropdown"
      role="listbox"
      aria-label="Search suggestions"
    >
      <div className="suggestions-header">
        <span className="suggestions-header-title">
          {suggestions.length > 0 ? (
            <>
              {isFilteringCategory ? `Suggested in ${selectedCategory}` : "Suggested Products"}
              <span className="suggestions-count-tag">
                {matchingProducts.length}
              </span>
            </>
          ) : (
            "Search results"
          )}
        </span>
        <span className="suggestions-hint">Press Esc to dismiss</span>
      </div>

      {suggestions.length > 0 ? (
        <div className="suggestions-list">
          {suggestions.map((product, index) => {
            const isHighlighted = selectedIndex === index;

            return (
              <button
                type="button"
                role="option"
                aria-selected={isHighlighted}
                key={product.id}
                className={`suggestion-item ${
                  isHighlighted ? "suggestion-item-highlighted" : ""
                }`}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-thumb-box">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="suggestion-thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fb) fb.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className="suggestion-thumb-fallback"
                    style={{ display: product.image ? "none" : "flex" }}
                  >
                    {product.fallbackIcon || <Package size={18} />}
                  </span>
                </div>

                <div className="suggestion-details">
                  <div className="suggestion-title-row">
                    <span className="suggestion-name">{product.name}</span>
                    {product.isMithilaSpecial && (
                      <span className="suggestion-special-tag" title="Mithila Special">
                        <Sparkles size={10} /> Special
                      </span>
                    )}
                  </div>
                  <div className="suggestion-meta-row">
                    <span className="suggestion-category">{product.category}</span>
                    <span className="suggestion-dot">•</span>
                    <span className="suggestion-unit">{product.unit}</span>
                  </div>
                </div>

                <div className="suggestion-price-group">
                  <span className="suggestion-price">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="suggestion-mrp">₹{product.mrp}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="suggestions-empty">
          <Tag size={16} className="suggestions-empty-icon" />
          <div className="suggestions-empty-content">
            <span>
              {isFilteringCategory
                ? `No quick matches for "${query}" in ${selectedCategory}.`
                : `No quick matches for "${query}".`}
            </span>
            {otherMatchesCount > 0 && onSelectCategory && (
              <button
                type="button"
                className="suggestions-switch-cat-btn"
                onClick={() => {
                  onSelectCategory("All");
                }}
              >
                Search all categories ({otherMatchesCount} {otherMatchesCount === 1 ? "match" : "matches"})
              </button>
            )}
          </div>
        </div>
      )}

      {matchingProducts.length > 5 && (
        <div className="suggestions-footer">
          <button
            type="button"
            className="suggestions-view-all-btn"
            onClick={handleViewAll}
          >
            <span>View all {matchingProducts.length} results</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
