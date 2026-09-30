import type { Product } from "../types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  cart: Record<string, number>;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
}

export function ProductGrid({
  products,
  cart,
  onAddToCart,
  onRemoveFromCart,
}: ProductGridProps) {
  return (
    <section className="section" id="products">
      <div className="section-heading">
        <div>
          <h2>Popular Products</h2>
          <span>{products.length} products available</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <div>🔍</div>
          <h3>No products found</h3>
          <p>Try searching for another product.</p>
        </div>
      ) : (
        <div className="products">
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
