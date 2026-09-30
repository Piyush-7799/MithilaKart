import { PackageSearch, RotateCcw, Sparkles } from "lucide-react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  cart: Record<string, number>;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onResetFilters?: () => void;
  selectedCategory?: string;
  searchQuery?: string;
}

export function ProductGrid({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onResetFilters,
  selectedCategory = "All",
  searchQuery = "",
}: ProductGridProps) {
  const isMithilaSpecials = selectedCategory === "Mithila Specials";

  const sectionTitle =
    selectedCategory === "All"
      ? "Popular Essentials"
      : selectedCategory;

  const sectionBadge = isMithilaSpecials
    ? "🌾 Mithila Signature Category"
    : "Mithila Express Store";

  const sectionSubtitle = searchQuery
    ? `Showing results for "${searchQuery}"`
    : isMithilaSpecials
    ? "Authentic regional staples, traditional Makhana varieties & regional essentials"
    : "Guaranteed 10-15 minute delivery from your nearest dark store";

  return (
    <section className="products-section" id="products" aria-label="Product catalog">
      <div className="section-header">
        <div>
          <div className={`section-badge ${isMithilaSpecials ? "section-badge-special" : ""}`}>
            <Sparkles size={13} />
            <span>{sectionBadge}</span>
          </div>
          <h2 className="section-title">{sectionTitle}</h2>
          <p className="section-subtitle">{sectionSubtitle}</p>
        </div>

        <div className="product-count-badge">
          <span>{products.length} {products.length === 1 ? "Product" : "Products"}</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="no-products-state">
          <div className="no-products-icon-circle">
            <PackageSearch size={40} className="empty-search-icon" />
          </div>
          <h3>No matching items found</h3>
          <p>
            We couldn't find any products
            {searchQuery && <> matching <strong>"{searchQuery}"</strong></>}
            {selectedCategory !== "All" && <> in <strong>"{selectedCategory}"</strong></>}.
          </p>
          {onResetFilters && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={onResetFilters}
            >
              <RotateCcw size={15} />
              <span>Reset Filters & Show All</span>
            </button>
          )}
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
            />
          ))}
        </div>
      )}
    </section>
  );
}
