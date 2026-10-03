import { memo } from "react";
import { PackageSearch, RotateCcw, Sparkles, SearchX, X } from "lucide-react";
import type { Category, FilterState, Product, SortOption } from "../types";
import { ProductCard } from "./ProductCard";
import { FilterBar } from "./FilterBar";
import { MithilaLotus } from "./MithilaMotif";

interface ProductGridProps {
  products: Product[];
  cart: Record<string, number>;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onResetFilters?: () => void;
  onClearSearch?: () => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  searchQuery?: string;
  wishlistSet?: Set<string>;
  onToggleWishlist?: (id: string) => void;
  filters?: FilterState;
  onUpdateFilter?: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  sortBy?: SortOption;
  onUpdateSort?: (sortBy: SortOption) => void;
  categories?: Category[];
  onClearAllFilters?: () => void;
  isProductAvailable?: (id: string) => boolean;
}

function ProductGridInner({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectProduct,
  onResetFilters,
  onClearSearch,
  selectedCategory = "All",
  onSelectCategory,
  searchQuery = "",
  wishlistSet,
  onToggleWishlist,
  filters = { priceRange: "all", discountThreshold: 0, specialOnly: false },
  onUpdateFilter,
  sortBy = "relevance",
  onUpdateSort,
  categories = [],
  onClearAllFilters,
  isProductAvailable,
}: ProductGridProps) {
  const isMithilaSpecials = selectedCategory === "Mithila Specials";
  const trimmedSearch = searchQuery.trim();
  const isSearching = Boolean(trimmedSearch);

  const hasFilterActive =
    filters.priceRange !== "all" ||
    filters.discountThreshold > 0 ||
    filters.specialOnly ||
    selectedCategory !== "All";

  const sectionTitle = isSearching
    ? `Search Results for "${trimmedSearch}"`
    : selectedCategory === "All"
    ? "Popular Essentials"
    : selectedCategory;

  const sectionBadge = isSearching
    ? "🔍 Search Results"
    : isMithilaSpecials
    ? "🌾 Mithila Signature Category"
    : "Mithila Express Store";

  const sectionSubtitle = isSearching
    ? `Showing ${products.length} matching ${
        products.length === 1 ? "product" : "products"
      }${selectedCategory !== "All" ? ` in ${selectedCategory}` : " across catalogue"}`
    : hasFilterActive
    ? `Showing ${products.length} filtered ${
        products.length === 1 ? "product" : "products"
      }`
    : isMithilaSpecials
    ? "Authentic regional staples, traditional Makhana varieties & regional essentials"
    : "Guaranteed 10-15 minute delivery from your nearest dark store";

  return (
    <section className="products-section" id="products" aria-label="Product catalog">
      {/* Section Header */}
      <div className="section-header">
        <div>
          <div
            className={`section-badge ${
              isMithilaSpecials ? "section-badge-special" : ""
            } ${isSearching ? "section-badge-searching" : ""}`}
          >
            <Sparkles size={13} />
            <span>{sectionBadge}</span>
          </div>
          <h2 className="section-title">{sectionTitle}</h2>
          <p className="section-subtitle">{sectionSubtitle}</p>
        </div>

        <div
          className={`product-count-badge ${
            isSearching || hasFilterActive ? "product-count-search-active" : ""
          }`}
        >
          <span>
            {isSearching
              ? `Showing ${products.length} ${
                  products.length === 1 ? "product" : "products"
                }`
              : hasFilterActive
              ? `${products.length} ${
                  products.length === 1 ? "product found" : "products found"
                }`
              : `${products.length} ${
                  products.length === 1 ? "Product" : "Products"
                }`}
          </span>
        </div>
      </div>

      {/* Phase 12: Smart Filters & Sort Controls Bar */}
      {onUpdateFilter && onUpdateSort && onSelectCategory && onClearAllFilters && (
        <FilterBar
          filters={filters}
          onUpdateFilter={onUpdateFilter}
          sortBy={sortBy}
          onUpdateSort={onUpdateSort}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          categories={categories}
          onClearAllFilters={onClearAllFilters}
          resultCount={products.length}
        />
      )}

      {products.length === 0 ? (
        <div className="no-products-state">
          <div className="no-products-art-container" aria-hidden="true">
            <div className="no-products-icon-circle">
              {isSearching ? (
                <SearchX size={36} className="empty-search-icon" />
              ) : (
                <PackageSearch size={36} className="empty-search-icon" />
              )}
            </div>
            <div className="no-products-motif-accent">
              <MithilaLotus size={24} color="#059669" secondaryColor="#d97706" />
            </div>
          </div>
          <h3>No products found</h3>
          <p className="no-products-subtext">
            {isSearching ? (
              <>
                No products found for "<strong>{trimmedSearch}</strong>"
                {selectedCategory !== "All" && (
                  <> in <strong>{selectedCategory}</strong></>
                )}
                . Try another search or explore a different category.
              </>
            ) : hasFilterActive ? (
              <>Try another search or explore a different category.</>
            ) : (
              <>No products currently available in <strong>{selectedCategory}</strong>. Try another search or explore a different category.</>
            )}
          </p>

          <div className="no-products-actions">
            {isSearching && onClearSearch && (
              <button
                type="button"
                className="clear-search-action-btn"
                onClick={onClearSearch}
                aria-label="Clear current search query"
              >
                <X size={15} />
                <span>Clear Search</span>
              </button>
            )}

            {hasFilterActive && onClearAllFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={onClearAllFilters}
                aria-label="Clear all applied filters"
              >
                <RotateCcw size={15} />
                <span>Clear Filters</span>
              </button>
            )}

            {!isSearching && !hasFilterActive && selectedCategory !== "All" && onResetFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={onResetFilters}
              >
                <RotateCcw size={15} />
                <span>Show All Products</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart[product.id] || 0}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              onSelectProduct={onSelectProduct}
              isWishlisted={wishlistSet ? wishlistSet.has(product.id) : false}
              onToggleWishlist={onToggleWishlist}
              isAvailable={isProductAvailable ? isProductAvailable(product.id) : true}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export const ProductGrid = memo(ProductGridInner);

