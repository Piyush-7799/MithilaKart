import { useState, useEffect, useMemo } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import "./App.css";
import { Header } from "./components/Header";
import { PromoHero } from "./components/PromoHero";
import { CategoryList } from "./components/CategoryList";
import { ProductRail } from "./components/ProductRail";
import { ProductGrid } from "./components/ProductGrid";
import { CartDrawer } from "./components/CartDrawer";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { LocationModal } from "./components/LocationModal";
import { ProductDetailsModal } from "./components/ProductDetailsModal";
import { CATEGORIES, PRODUCTS } from "./data/products";
import type { CartItem, DeliveryLocation, FilterState, Product, SortOption } from "./types";
import { loadSavedCart, saveCart } from "./utils/cartStorage";
import { loadSavedLocation, saveLocation, clearSavedLocation } from "./utils/locationStorage";
import { loadWishlist, saveWishlist } from "./utils/wishlistStorage";

// Curated deterministic product IDs for homepage promotional rails
const POPULAR_PICKS_IDS = [
  "prod-fv-banana",
  "prod-db-full-cream-milk",
  "prod-db-curd",
  "prod-db-paneer",
  "prod-bs-marie-biscuits",
  "prod-bev-assam-tea",
  "prod-mdf-cashews",
  "prod-mdf-almonds",
  "prod-fv-tomato",
  "prod-bs-bhujia-sev",
];

const EVERYDAY_ESSENTIALS_IDS = [
  "prod-ars-chakki-atta",
  "prod-ars-basmati-rice",
  "prod-db-toned-milk",
  "prod-db-farm-eggs",
  "prod-ars-sugar",
  "prod-bs-rusk",
  "prod-hc-dishwash-gel",
  "prod-hc-detergent-liquid",
  "prod-bev-green-tea",
  "prod-ars-sooji",
];

const DEFAULT_FILTERS: FilterState = {
  priceRange: "all",
  discountThreshold: 0,
  specialOnly: false,
};

function App() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Phase 12: Smart filter and sort state (resets on refresh, no URL/storage persistence)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const handleUpdateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCategory("All");
  };

  // Restore cart from localStorage on mount, validated against valid product IDs
  const [cart, setCart] = useState<Record<string, number>>(() => {
    return loadSavedCart(new Set(PRODUCTS.map((p) => p.id)));
  });
  const [showCart, setShowCart] = useState(false);

  // Restore delivery location from localStorage on mount
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(() => {
    return loadSavedLocation();
  });
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Product Details Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Restore wishlist from localStorage on mount, validated against valid product IDs
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return loadWishlist(new Set(PRODUCTS.map((p) => p.id)));
  });
  const [showWishlist, setShowWishlist] = useState(false);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  const wishlistProducts = useMemo(() => {
    return wishlist
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }, [wishlist]);

  // Synchronize cart state to localStorage on every change
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Synchronize wishlist state to localStorage on every change
  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const handleClearWishlist = () => {
    setWishlist([]);
  };

  const handleSelectLocation = (location: DeliveryLocation) => {
    setSelectedLocation(location);
    saveLocation(location);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    clearSavedLocation();
  };

  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.min(99, (prev[id] || 0) + 1),
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] = updated[id] - 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const deleteFromCart = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const restoreCartItem = (id: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.min(99, Math.max(1, quantity)),
    }));
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setFilters(DEFAULT_FILTERS);
    setSortBy("relevance");
  };

  const clearSearch = () => {
    setSearch("");
  };

  const filteredProducts = useMemo(() => {
    const trimmed = search.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      // 1. Category filter check
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      if (!matchesCategory) return false;

      // 2. Search match across name, category, unit, badge, description, and Mithila Special metadata
      if (trimmed) {
        const nameMatch = product.name.toLowerCase().includes(trimmed);
        const categoryMatch = product.category.toLowerCase().includes(trimmed);
        const unitMatch = product.unit.toLowerCase().includes(trimmed);
        const badgeMatch = product.badge
          ? product.badge.toLowerCase().includes(trimmed)
          : false;
        const descMatch = product.description
          ? product.description.toLowerCase().includes(trimmed)
          : false;
        const specialMatch =
          Boolean(product.isMithilaSpecial) &&
          (trimmed.includes("special") ||
            trimmed.includes("mithila") ||
            trimmed.includes("regional"));

        const matchesSearch =
          nameMatch ||
          categoryMatch ||
          unitMatch ||
          badgeMatch ||
          descMatch ||
          specialMatch;
        if (!matchesSearch) return false;
      }

      // 3. Price filter check
      if (filters.priceRange !== "all") {
        switch (filters.priceRange) {
          case "under-100":
            if (product.price >= 100) return false;
            break;
          case "100-250":
            if (product.price < 100 || product.price > 250) return false;
            break;
          case "250-500":
            if (product.price <= 250 || product.price > 500) return false;
            break;
          case "500-plus":
            if (product.price <= 500) return false;
            break;
        }
      }

      // 4. Discount filter check
      if (filters.discountThreshold > 0) {
        if (!product.mrp || product.mrp <= product.price) {
          return false;
        }
        const discountPercent = Math.round(
          ((product.mrp - product.price) / product.mrp) * 100
        );
        if (discountPercent < filters.discountThreshold) {
          return false;
        }
      }

      // 5. Special Mithila regional filter check
      if (filters.specialOnly) {
        if (!product.isMithilaSpecial && product.category !== "Mithila Specials") {
          return false;
        }
      }

      return true;
    });
  }, [search, selectedCategory, filters]);

  // Derived sorted catalogue products
  const sortedProducts = useMemo(() => {
    if (sortBy === "relevance") {
      return filteredProducts;
    }

    const list = [...filteredProducts];

    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "discount-desc":
        return list.sort((a, b) => {
          const discA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
          const discB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
          return discB - discA;
        });
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  const mithilaSpecialsProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === "Mithila Specials"),
    []
  );

  const popularPicksProducts = useMemo(
    () =>
      POPULAR_PICKS_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(
        (p): p is Product => p !== undefined
      ),
    []
  );

  const everydayEssentialsProducts = useMemo(
    () =>
      EVERYDAY_ESSENTIALS_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(
        (p): p is Product => p !== undefined
      ),
    []
  );

  const handleShopNow = () => {
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExploreMithilaSpecials = () => {
    setSelectedCategory("Mithila Specials");
    const el = document.getElementById("products");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const cartItems: CartItem[] = Object.entries(cart).flatMap(([id, quantity]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return product ? [{ product, quantity }] : [];
  });

  const cartCount = Object.values(cart).reduce(
    (totalCount, quantity) => totalCount + quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const deliveryFee = subtotal > 0 && subtotal < 300 ? 30 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="app-container">
      <Header
        search={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        cartTotal={total}
        onOpenCart={() => setShowCart(true)}
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setShowLocationModal(true)}
        products={PRODUCTS}
        onSelectProduct={(product) => setSelectedProduct(product)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setShowWishlist(true)}
        wishlistSet={wishlistSet}
        onToggleWishlist={handleToggleWishlist}
      />

      <main className="main-content">
        {/* 1. Premium Promotional Hero */}
        <PromoHero
          onShopNow={handleShopNow}
          onExploreMithilaSpecials={handleExploreMithilaSpecials}
        />

        {/* 2. Category Navigation */}
        <CategoryList
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 3. Mithila Specials Showcase Rail */}
        <ProductRail
          title="Mithila Specials"
          subtitle="Local favourites worth discovering"
          badge="Signature Regional"
          products={mithilaSpecialsProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onSeeAll={handleExploreMithilaSpecials}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 4. Popular Picks Rail */}
        <ProductRail
          title="Popular Picks"
          subtitle="Everyday products people look for"
          badge="Trending Now"
          products={popularPicksProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onSeeAll={handleShopNow}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 5. Everyday Essentials Rail */}
        <ProductRail
          title="Everyday Essentials"
          subtitle="Daily needs, all in one place"
          badge="Daily Staples"
          products={everydayEssentialsProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onSeeAll={handleShopNow}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 6. Full Product Catalogue with Search, Category & Smart Filters */}
        <ProductGrid
          products={sortedProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onSelectProduct={(product) => setSelectedProduct(product)}
          onResetFilters={resetFilters}
          onClearSearch={clearSearch}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={search}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
          filters={filters}
          onUpdateFilter={handleUpdateFilter}
          sortBy={sortBy}
          onUpdateSort={setSortBy}
          categories={CATEGORIES}
          onClearAllFilters={handleClearAllFilters}
        />
      </main>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <aside className="floating-cart-wrapper" aria-label="Shopping cart quick access">
          <button
            type="button"
            className="floating-cart-pill"
            onClick={() => setShowCart(true)}
            aria-label={`View shopping cart with ${cartCount} items valued at ₹${total}`}
          >
            <div className="floating-cart-left">
              <div className="floating-icon-wrapper">
                <ShoppingBag size={18} />
                <span className="floating-badge">{cartCount}</span>
              </div>
              <div className="floating-details">
                <span className="floating-items">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
                <span className="floating-total">₹{total}</span>
              </div>
            </div>

            <div className="floating-cart-right">
              <span>View Cart</span>
              <ArrowRight size={17} />
            </div>
          </button>
        </aside>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cartItems={cartItems}
        cartCount={cartCount}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onDeleteFromCart={deleteFromCart}
        onRestoreCartItem={restoreCartItem}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setShowCart(false);
        }}
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setShowLocationModal(true)}
        allProducts={PRODUCTS}
        onSelectProduct={(product) => setSelectedProduct(product)}
        wishlistSet={wishlistSet}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={showWishlist}
        onClose={() => setShowWishlist(false)}
        products={wishlistProducts}
        cart={cart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onClearWishlist={handleClearWishlist}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onExploreCatalogue={() => {
          setShowWishlist(false);
          handleShopNow();
        }}
      />

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        onClearLocation={handleClearLocation}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        cartQuantity={selectedProduct ? cart[selectedProduct.id] || 0 : 0}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        isWishlisted={selectedProduct ? wishlistSet.has(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}

export default App;