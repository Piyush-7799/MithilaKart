import { LayoutGrid, Sparkles } from "lucide-react";
import type { Category } from "../types";

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export function CategoryList({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) {
  return (
    <section className="categories-section" aria-label="Product categories">
      <div className="section-header">
        <div>
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">
            Explore daily staples, fresh picks and regional Mithila specialties
          </p>
        </div>
      </div>

      <div className="categories-scroll-wrapper">
        <div className="categories-container" role="tablist">
          {/* All Products Option */}
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "All"}
            className={`category-pill ${selectedCategory === "All" ? "category-pill-active" : ""}`}
            onClick={() => onSelectCategory("All")}
          >
            <div className="category-icon-box">
              <LayoutGrid size={22} className="all-cat-icon" />
            </div>
            <span className="category-label">All Products</span>
          </button>

          {/* Dynamic Categories (Mithila Specials first) */}
          {categories.map((category) => {
            const isActive = selectedCategory === category.name;
            const isSignature = Boolean(category.isSignature);

            return (
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                key={category.name}
                className={`category-pill ${isActive ? "category-pill-active" : ""} ${
                  isSignature ? "category-pill-signature" : ""
                }`}
                onClick={() => onSelectCategory(category.name)}
              >
                {isSignature && (
                  <span className="signature-pill-tag">
                    <Sparkles size={9} /> Signature
                  </span>
                )}
                <div className="category-icon-box">
                  <span className="category-emoji">{category.icon}</span>
                </div>
                <span className="category-label">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
