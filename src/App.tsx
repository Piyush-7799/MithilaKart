import { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import "./App.css";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { CategoryList } from "./components/CategoryList";
import { ProductGrid } from "./components/ProductGrid";
import { CartDrawer } from "./components/CartDrawer";
import { LocationModal } from "./components/LocationModal";
import { CATEGORIES, PRODUCTS } from "./data/products";
import type { CartItem, DeliveryLocation } from "./types";
import { loadSavedCart, saveCart } from "./utils/cartStorage";
import { loadSavedLocation, saveLocation, clearSavedLocation } from "./utils/locationStorage";

function App() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  // Synchronize cart state to localStorage on every change
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

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

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    const searchMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return searchMatch && categoryMatch;
  });

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
      />

      <main className="main-content">
        <Hero />

        <CategoryList
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ProductGrid
          products={filteredProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onResetFilters={resetFilters}
          selectedCategory={selectedCategory}
          searchQuery={search}
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
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setShowCart(false);
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
    </div>
  );
}

export default App;