import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

export interface ProductRailProps {
  title: string;
  subtitle?: string;
  badge?: string;
  products: Product[];
  cart: Record<string, number>;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onSeeAll?: () => void;
  wishlistSet?: Set<string>;
  onToggleWishlist?: (id: string) => void;
}

export function ProductRail({
  title,
  subtitle,
  badge,
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onSelectProduct,
  onSeeAll,
  wishlistSet,
  onToggleWishlist,
}: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = (offset: number) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="product-rail-section" aria-label={title}>
      {/* Rail Header */}
      <div className="product-rail-header">
        <div className="product-rail-header-text">
          {badge && (
            <div className="product-rail-badge">
              <Sparkles size={11} className="rail-badge-icon" />
              <span>{badge}</span>
            </div>
          )}
          <h2 className="product-rail-title">{title}</h2>
          {subtitle && <p className="product-rail-subtitle">{subtitle}</p>}
        </div>

        <div className="product-rail-actions">
          {onSeeAll && (
            <button
              type="button"
              className="product-rail-see-all-btn"
              onClick={onSeeAll}
              aria-label={`See all ${title}`}
            >
              <span>See all</span>
              <ArrowRight size={14} />
            </button>
          )}

          {/* Desktop Left / Right Navigation Controls */}
          <div className="product-rail-nav-group" aria-hidden="true">
            <button
              type="button"
              className="rail-nav-btn rail-nav-prev"
              onClick={() => handleScroll(-360)}
              aria-label="Scroll left"
              tabIndex={-1}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="rail-nav-btn rail-nav-next"
              onClick={() => handleScroll(360)}
              aria-label="Scroll right"
              tabIndex={-1}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Product Rail Track */}
      <div
        className="product-rail-track"
        ref={trackRef}
        role="region"
        aria-label={`${title} product rail`}
        tabIndex={0}
      >
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
    </section>
  );
}
