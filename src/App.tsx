import { useState, useEffect, useMemo, useCallback } from "react";
import { useProducts } from "./hooks/useProducts";
import { ShoppingBag, ArrowRight, Sparkles, Layers } from "lucide-react";
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
import { CheckoutReviewModal } from "./components/CheckoutReviewModal";
import { OrderConfirmationModal } from "./components/OrderConfirmationModal";
import { OrderHistoryModal } from "./components/OrderHistoryModal";
import { OrderDetailsModal } from "./components/OrderDetailsModal";
import { AccountModal } from "./components/AccountModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { SectionDivider } from "./components/SectionDivider";
import { CATEGORIES } from "./data/products";
import type {
  CartItem,
  DeliveryLocation,
  FilterState,
  Product,
  SortOption,
  Order,
  OrderItem,
  OrderStatus,
  UserProfile,
} from "./types";
import { loadSavedCart, saveCart } from "./utils/cartStorage";
import { loadSavedLocation, saveLocation, clearSavedLocation } from "./utils/locationStorage";
import {
  loadSavedAddresses,
  getSelectedAddressId,
  saveSelectedAddressId,
  addressToDeliveryLocation,
} from "./utils/addressStorage";
import { loadWishlist, saveWishlist } from "./utils/wishlistStorage";
import {
  createAddressSnapshot,
  updateOrderStatus,
} from "./utils/orderStorage";
import {
  createOrder as apiCreateOrder,
  fetchOrders as apiFetchOrders,
  fetchOrderById as apiFetchOrderById,
  loginUser,
  registerUser,
  fetchCurrentUser,
  TOKEN_KEY
} from "./services/api";
import { calculateCartDeliveryEta } from "./utils/deliveryEta";
import {
  getAdminProductOverrides,
  setProductAvailability,
  resetAdminProductOverrides,
  isProductAvailable,
  type AdminProductOverrides,
} from "./utils/adminStorage";

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
  // Phase 23.2: Fetch products from API; falls back to static data if unavailable
  const { products: PRODUCTS, isLoading: productsLoading, isApiConnected } = useProducts();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Phase 12: Smart filter and sort state (resets on refresh, no URL/storage persistence)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const handleUpdateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedCategory("All");
  }, []);

  // Restore cart from localStorage on mount.
  // On first render, PRODUCTS may still be loading from API — cart validation
  // against API product IDs happens after load via the useEffect below.
  const [cart, setCart] = useState<Record<string, number>>(() => {
    return loadSavedCart(new Set(PRODUCTS.map((p) => p.id)));
  });
  const [showCart, setShowCart] = useState(false);

  // Restore delivery location from localStorage on mount, fall back to selected address if available
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(() => {
    const loc = loadSavedLocation();
    if (loc) return loc;
    const addresses = loadSavedAddresses();
    if (addresses.length > 0) {
      const selectedId = getSelectedAddressId();
      const active = addresses.find((a) => a.id === selectedId) || addresses[0];
      const deliveryLoc = addressToDeliveryLocation(active);
      saveLocation(deliveryLoc);
      saveSelectedAddressId(active.id);
      return deliveryLoc;
    }
    return null;
  });
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Product Details Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  // Restore wishlist from localStorage on mount.
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return loadWishlist(new Set(PRODUCTS.map((p) => p.id)));
  });
  const [showWishlist, setShowWishlist] = useState(false);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  const wishlistProducts = useMemo(() => {
    return wishlist
      .map((id) => PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }, [wishlist, PRODUCTS]);

  // Synchronize cart state to localStorage on every change
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Synchronize wishlist state to localStorage on every change
  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  // Phase 21 & 23.4: User profile & account modal state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchCurrentUser().then(res => {
        setProfile(res.user);
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setProfile(null);
      });
    }
  }, []);

  // Phase 20: Orders and order history state
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    if (profile?.id) {
      apiFetchOrders().then(setOrders).catch(console.error);
    }
  }, [profile?.id]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showCheckoutReview, setShowCheckoutReview] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // Phase 22: Admin Dashboard & Product Availability overrides state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [productOverrides, setProductOverrides] = useState<AdminProductOverrides>(() =>
    getAdminProductOverrides()
  );

  const isItemAvailable = useCallback(
    (id: string) => {
      return isProductAvailable(id, productOverrides);
    },
    [productOverrides]
  );

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    const success = updateOrderStatus(orderId, newStatus);
    if (success) {
      try {
        const fetchedOrders = await apiFetchOrders(profile?.id);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch updated orders", err);
      }
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
      );
    }
  }, [profile]);

  const handleToggleProductAvailability = useCallback(
    (productId: string, isAvailable: boolean) => {
      const updated = setProductAvailability(productId, isAvailable);
      setProductOverrides(updated);
    },
    []
  );

  const handleResetProductOverrides = useCallback(() => {
    resetAdminProductOverrides();
    setProductOverrides({});
  }, []);

  const handleLogin = useCallback(async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    localStorage.setItem(TOKEN_KEY, res.token);
    setProfile(res.user);
    setOrderToast("Logged in successfully");
  }, []);

  const handleRegister = useCallback(async (name: string, email: string, pass: string) => {
    const res = await registerUser(name, email, pass);
    localStorage.setItem(TOKEN_KEY, res.token);
    setProfile(res.user);
    setOrderToast("Account created successfully");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    setOrders([]);
    setOrderToast("Logged out");
    setShowAccountModal(false);
  }, []);

  // Auto-dismiss floating order toasts
  useEffect(() => {
    if (!orderToast) return;
    const t = setTimeout(() => setOrderToast(null), 3500);
    return () => clearTimeout(t);
  }, [orderToast]);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  }, []);

  const handleRemoveFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, []);

  const handleClearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const handleSelectLocation = useCallback((location: DeliveryLocation) => {
    setSelectedLocation(location);
    saveLocation(location);
    if (location.address) {
      saveSelectedAddressId(location.address.id);
    }
  }, []);

  const handleClearLocation = useCallback(() => {
    setSelectedLocation(null);
    clearSavedLocation();
    saveSelectedAddressId(null);
  }, []);

  const addToCart = useCallback(
    (id: string) => {
      if (!isItemAvailable(id)) {
        setOrderToast("This item is currently out of stock.");
        return;
      }
      setCart((prev) => ({
        ...prev,
        [id]: Math.min(99, (prev[id] || 0) + 1),
      }));
    },
    [isItemAvailable]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] = updated[id] - 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  }, []);

  const deleteFromCart = useCallback((id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const restoreCartItem = useCallback((id: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.min(99, Math.max(1, quantity)),
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("All");
    setFilters(DEFAULT_FILTERS);
    setSortBy("relevance");
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const filteredProducts = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    const searchTokens = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];

    return PRODUCTS.filter((product) => {
      // 1. Category filter check
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      if (!matchesCategory) return false;

      // 2. Search match across name, category, unit, badge, description, and Mithila Special metadata
      if (searchTokens.length > 0) {
        const matchesAllTokens = searchTokens.every((token) => {
          const nameMatch = product.name.toLowerCase().includes(token);
          const categoryMatch = product.category.toLowerCase().includes(token);
          const unitMatch = product.unit.toLowerCase().includes(token);
          const badgeMatch = product.badge
            ? product.badge.toLowerCase().includes(token)
            : false;
          const descMatch = product.description
            ? product.description.toLowerCase().includes(token)
            : false;
          const specialMatch =
            Boolean(product.isMithilaSpecial) &&
            (token === "special" || token === "mithila" || token === "regional");

          return (
            nameMatch ||
            categoryMatch ||
            unitMatch ||
            badgeMatch ||
            descMatch ||
            specialMatch
          );
        });
        if (!matchesAllTokens) return false;
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
  }, [search, selectedCategory, filters, PRODUCTS]);

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
    [PRODUCTS]
  );

  const popularPicksProducts = useMemo(
    () =>
      POPULAR_PICKS_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(
        (p): p is Product => p !== undefined
      ),
    [PRODUCTS]
  );

  const everydayEssentialsProducts = useMemo(
    () =>
      EVERYDAY_ESSENTIALS_IDS.map((id) => PRODUCTS.find((p) => p.id === id)).filter(
        (p): p is Product => p !== undefined
      ),
    [PRODUCTS]
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

  const deliveryFee = subtotal > 0 && subtotal <= 300 ? 30 : 0;
  const total = subtotal + deliveryFee;

  const mrpTotal = cartItems.reduce(
    (acc, item) => acc + (item.product.mrp || item.product.price) * item.quantity,
    0
  );
  const productSavings = Math.max(0, mrpTotal - subtotal);

  const etaInfo = useMemo(() => {
    return calculateCartDeliveryEta(cartItems, selectedLocation);
  }, [cartItems, selectedLocation]);

  const handleProceedToCheckout = useCallback(() => {
    if (!selectedLocation) {
      setShowLocationModal(true);
      return;
    }
    if (cartItems.length === 0) {
      return;
    }
    setShowCheckoutReview(true);
  }, [selectedLocation, cartItems.length]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedLocation) {
      setShowLocationModal(true);
      return;
    }
    if (cartItems.length === 0 || isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderItems: OrderItem[] = cartItems.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        quantity,
        price: product.price,
        mrp: product.mrp,
        unit: product.unit,
        lineTotal: product.price * quantity,
      }));

      const addressSnapshot = createAddressSnapshot(selectedLocation);
      if (!selectedLocation.address && profile?.fullName) {
        addressSnapshot.fullName = profile.fullName;
        if (profile.phone) {
          addressSnapshot.phone = profile.phone;
        }
      }

      const apiOrderRes = await apiCreateOrder({
        address: addressSnapshot,
        items: orderItems,
        paymentMethod: "Cash on Delivery",
      });

      const newOrder = apiOrderRes.order;

      // Refresh orders list from API
      try {
        const fetchedOrders = await apiFetchOrders(profile?.id);
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch updated orders", err);
      }

      // Clear cart (only after successful creation)
      setCart({});

      // Close review and cart drawer
      setShowCheckoutReview(false);
      setShowCart(false);

      // Show confirmation modal
      setConfirmedOrder(newOrder);
      setShowOrderConfirmation(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      setOrderToast(msg);
    } finally {
      setIsPlacingOrder(false);
    }
  }, [selectedLocation, cartItems, profile, isPlacingOrder]);

  const handleReorder = useCallback((orderToReorder: Order) => {
    const availableItems: { id: string; quantity: number }[] = [];
    let skippedCount = 0;

    orderToReorder.items.forEach((item) => {
      const exists = PRODUCTS.some((p) => p.id === item.productId);
      if (exists) {
        availableItems.push({ id: item.productId, quantity: item.quantity });
      } else {
        skippedCount++;
      }
    });

    if (availableItems.length === 0) {
      setOrderToast("None of the items in this order are currently available in the catalogue.");
      return;
    }

    setCart((prev) => {
      const updated = { ...prev };
      availableItems.forEach(({ id, quantity }) => {
        updated[id] = Math.min(99, (updated[id] || 0) + quantity);
      });
      return updated;
    });

    if (skippedCount > 0) {
      setOrderToast(
        `Added ${availableItems.length} items to cart (${skippedCount} discontinued item skipped).`
      );
    } else {
      setOrderToast("Items added to cart!");
    }

    setShowOrderDetails(false);
    setShowOrderHistory(false);
    setShowOrderConfirmation(false);
    setShowCart(true);
  }, [PRODUCTS]);

  const handleViewOrder = useCallback(async (orderId: string) => {
    try {
      const ord = await apiFetchOrderById(orderId);
      if (ord) {
        setSelectedOrder(ord);
        setShowOrderConfirmation(false);
        setShowOrderDetails(true);
      }
    } catch (err) {
      console.error("Failed to view order", err);
    }
  }, []);

  // Phase 22: Admin Dashboard dedicated operations view
  if (isAdminMode) {
    return (
      <div className="app-container admin-app-view">
        <AdminDashboard
          onBackToStore={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            setIsAdminMode(false);
          }}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onViewOrderDetails={(order) => {
            setSelectedOrder(order);
            setShowOrderDetails(true);
          }}
          products={PRODUCTS}
          productOverrides={productOverrides}
          onToggleProductAvailability={handleToggleProductAvailability}
          onResetProductOverrides={handleResetProductOverrides}
          userProfile={profile}
          savedAddresses={loadSavedAddresses()}
          cartCount={cartCount}
        />

        {/* Order Details Modal reused for Admin Inspection */}
        <OrderDetailsModal
          isOpen={showOrderDetails}
          order={selectedOrder}
          onClose={() => setShowOrderDetails(false)}
          onReorder={handleReorder}
          onBackToOrders={() => setShowOrderDetails(false)}
        />

        {/* Order / Admin Floating Toast */}
        {orderToast && (
          <div className="order-floating-toast" role="status" aria-live="polite">
            <Sparkles size={16} />
            <span>{orderToast}</span>
          </div>
        )}
      </div>
    );
  }

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
        onSelectProduct={handleSelectProduct}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setShowWishlist(true)}
        wishlistSet={wishlistSet}
        onToggleWishlist={handleToggleWishlist}
        orderCount={orders.length}
        onOpenOrders={() => setShowOrderHistory(true)}
        userProfile={profile}
        onOpenAccount={() => setShowAccountModal(true)}
      />

      <main className="main-content">
        {/* 1. Premium Promotional Hero */}
        <PromoHero
          onShopNow={handleShopNow}
          onExploreMithilaSpecials={handleExploreMithilaSpecials}
        />

        {/* Section Divider: Hero to Categories */}
        <SectionDivider motif="lotus" />

        {/* 2. Category Navigation */}
        <CategoryList
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Section Divider: Categories to Showcase Rails */}
        <SectionDivider motif="fish" />

        {/* 3. Mithila Specials Showcase Rail */}
        <ProductRail
          title="Mithila Specials"
          subtitle="Local favourites worth discovering"
          badge="Signature Regional"
          products={mithilaSpecialsProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onSelectProduct={handleSelectProduct}
          onSeeAll={handleExploreMithilaSpecials}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
          isProductAvailable={isItemAvailable}
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
          onSelectProduct={handleSelectProduct}
          onSeeAll={handleShopNow}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
          isProductAvailable={isItemAvailable}
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
          onSelectProduct={handleSelectProduct}
          onSeeAll={handleShopNow}
          wishlistSet={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
          isProductAvailable={isItemAvailable}
        />

        {/* Section Divider: Rails to Full Catalogue */}
        <SectionDivider motif="sun" />

        {/* 6. Full Product Catalogue with Search, Category & Smart Filters */}
        {productsLoading ? (
          <section className="product-grid-loading" aria-busy="true" aria-label="Loading products">
            <div className="product-grid-loading-inner">
              <div className="product-loading-spinner" aria-hidden="true" />
              <p className="product-loading-text">Loading catalogue…</p>
              <p className="product-loading-sub">Fetching products from database</p>
            </div>
          </section>
        ) : (
        <ProductGrid
          products={sortedProducts}
          cart={cart}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onSelectProduct={handleSelectProduct}
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
          isProductAvailable={isItemAvailable}
        />
        )}

        {/* Storefront Footer with Local Admin Entry */}
        <footer className="storefront-footer" aria-label="MithilaKart footer">
          <div className="storefront-footer-inner">
            <div className="storefront-footer-brand">
              <span className="storefront-footer-logo">
                Mithila<span className="logo-accent">Kart</span>
              </span>
              <p className="storefront-footer-tagline">
                Authentic regional quick-commerce. Fresh daily essentials, seasonal produce and
                authentic Mithila specialties delivered in 10-15 minutes.
              </p>
              <div className="storefront-service-cities">
                <span>Serving: Darbhanga • Madhubani • Samastipur</span>
              </div>
            </div>

            <div className="storefront-footer-nav">
              <div className="storefront-footer-col">
                <span className="storefront-footer-col-title">Shop</span>
                <button
                  type="button"
                  className="storefront-footer-link"
                  onClick={handleShopNow}
                >
                  All Products
                </button>
                <button
                  type="button"
                  className="storefront-footer-link"
                  onClick={handleExploreMithilaSpecials}
                >
                  Mithila Specials
                </button>
              </div>

              <div className="storefront-footer-col">
                <span className="storefront-footer-col-title">Account</span>
                <button
                  type="button"
                  className="storefront-footer-link"
                  onClick={() => setShowOrderHistory(true)}
                >
                  My Orders ({orders.length})
                </button>
                <button
                  type="button"
                  className="storefront-footer-link"
                  onClick={() => setShowAccountModal(true)}
                >
                  My Profile
                </button>
                <button
                  type="button"
                  className="storefront-footer-link"
                  onClick={() => setShowLocationModal(true)}
                >
                  Addresses
                </button>
              </div>

              <div className="storefront-footer-col storefront-footer-dev-col">
                <span className="storefront-footer-col-title">Operations</span>
                <button
                  type="button"
                  className="storefront-admin-entry-btn"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "instant" });
                    setIsAdminMode(true);
                  }}
                  title="Open Local Operations Admin"
                  aria-label="Open Local Admin Dashboard (Development)"
                >
                  <Layers size={14} />
                  <span>Local Admin (Dev)</span>
                </button>
                <span className="storefront-admin-hint">
                  Client-side development dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="storefront-footer-bottom">
            <p>© {new Date().getFullYear()} MithilaKart. Authentic regional quick-commerce.</p>
            <span className="storefront-footer-phase-badge">
              Phase 23.2 • {isApiConnected ? `API Connected • ${PRODUCTS.length} products` : "Local Data"}
            </span>
          </div>
        </footer>
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
        onSelectProduct={handleSelectProduct}
        wishlistSet={wishlistSet}
        onToggleWishlist={handleToggleWishlist}
        onProceedToCheckout={handleProceedToCheckout}
        onOpenOrders={() => {
          setShowCart(false);
          setShowOrderHistory(true);
        }}
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
        onSelectProduct={handleSelectProduct}
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
        isAvailable={selectedProduct ? isItemAvailable(selectedProduct.id) : true}
      />

      {/* Checkout Review Modal */}
      <CheckoutReviewModal
        isOpen={showCheckoutReview}
        onClose={() => setShowCheckoutReview(false)}
        cartItems={cartItems}
        cartCount={cartCount}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        productSavings={productSavings}
        total={total}
        selectedLocation={selectedLocation}
        etaInfo={etaInfo}
        onPlaceOrder={handlePlaceOrder}
        onChangeAddress={() => {
          setShowCheckoutReview(false);
          setShowLocationModal(true);
        }}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        order={confirmedOrder}
        onClose={() => setShowOrderConfirmation(false)}
        onViewOrder={handleViewOrder}
        onContinueShopping={() => setShowOrderConfirmation(false)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
        orders={orders}
        onSelectOrder={(order) => {
          setSelectedOrder(order);
          setShowOrderDetails(true);
        }}
        onReorder={handleReorder}
        onStartShopping={() => {
          setShowOrderHistory(false);
          handleShopNow();
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        order={selectedOrder}
        onClose={() => setShowOrderDetails(false)}
        onReorder={handleReorder}
        onBackToOrders={() => {
          setShowOrderDetails(false);
          setShowOrderHistory(true);
        }}
      />

      {/* Account & Profile Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        profile={profile}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        orders={orders}
        savedAddressesCount={loadSavedAddresses().length}
        cartCount={cartCount}
        onOpenOrders={() => {
          setShowAccountModal(false);
          setShowOrderHistory(true);
        }}
        onOpenAddresses={() => {
          setShowAccountModal(false);
          setShowLocationModal(true);
        }}
        onViewOrderDetails={(order) => {
          setSelectedOrder(order);
          setShowAccountModal(false);
          setShowOrderDetails(true);
        }}
        onContinueShopping={() => {
          setShowAccountModal(false);
          handleShopNow();
        }}
        onOpenAdmin={() => {
          window.scrollTo({ top: 0, behavior: "instant" });
          setIsAdminMode(true);
        }}
      />

      {/* Order / Reorder / Profile Floating Toast */}
      {orderToast && (
        <div className="order-floating-toast" role="status" aria-live="polite">
          <Sparkles size={16} />
          <span>{orderToast}</span>
        </div>
      )}
    </div>
  );
}

export default App;