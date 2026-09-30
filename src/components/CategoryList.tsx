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
    <section className="section">
      <div className="section-heading">
        <h2>Shop by Category</h2>
        <span>Explore all categories</span>
      </div>

      <div className="categories">
        <div
          className={
            selectedCategory === "All"
              ? "category active-category"
              : "category"
          }
          onClick={() => onSelectCategory("All")}
        >
          <span>🛍️</span>
          <p>All Products</p>
        </div>

        {categories.map((category) => (
          <div
            className={
              selectedCategory === category.name
                ? "category active-category"
                : "category"
            }
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
          >
            <span>{category.icon}</span>
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
