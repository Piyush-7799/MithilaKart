import { PackageSearch, RotateCcw, Sparkles, SearchX, X } from "lucide-react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  cart: Record<string, number>;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onResetFilters?: () => void;
  onClearSearch?: () => void;
  selectedCategory?: string;
  searchQuery?: string;
  wishlistSet?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

export function ProductGrid({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectProduct,
  onResetFilters,
  onClearSearch,
  selectedCategory = "All",
  searchQuery = "",
  wishlistSet,
  onToggleWishlist,
}: ProductGridProps) {
  const isMithilaSpecials = selectedCategory === "Mithila Specials";
  const trimmedSearch = searchQuery.trim();
  const isSearching = Boolean(trimmedSearch);

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
    : isMithilaSpecials
    ? "Authentic regional staples, traditional Makhana varieties & regional essentials"
    : "Guaranteed 10-15 minute delivery from your nearest dark store";

  return (
    <section className="products-section" id="products" aria-label="Product catalog">
      <div className="section-header">
        <div>
          <div className={`section-badge ${isMithilaSpecials ? "section-badge-special" : ""} ${isSearching ? "section-badge-searching" : ""}`}>
            <Sparkles size={13} />
            <span>{sectionBadge}</span>
          </div>
          <h2 className="section-title">{sectionTitle}</h2>
          <p className="section-subtitle">{sectionSubtitle}</p>
        </div>

        <div className={`product-count-badge ${isSearching ? "product-count-search-active" : ""}`}>
          <span>
            {isSearching
              ? `Showing ${products.length} ${products.length === 1 ? "product" : "products"}`
              : `${products.length} ${products.length === 1 ? "Product" : "Products"}`}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="no-products-state">
          <div className="no-products-icon-circle">
            {isSearching ? (
              <SearchX size={44} className="empty-search-icon" />
            ) : (
              <PackageSearch size={44} className="empty-search-icon" />
            )}
          </div>
          <h3>No products found</h3>
          <p className="no-products-subtext">
            {isSearching ? (
              <>
                No products found for "<strong>{trimmedSearch}</strong>"
                {selectedCategory !== "All" && (
                  <> in <strong>{selectedCategory}</strong></>
                )}
                . Try searching for another product or category.
              </>
            ) : (
              <>
                No products currently available in <strong>{selectedCategory}</strong>.
              </>
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
                <span>Clear search</span>
              </button>
            )}

            {selectedCategory !== "All" && onResetFilters && (
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
