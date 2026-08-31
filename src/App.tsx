import { useState } from "react";
import "./App.css";

function App() {
  const categories = [
    { icon: "🥦", name: "Fruits & Vegetables" },
    { icon: "🥛", name: "Dairy & Breakfast" },
    { icon: "🍪", name: "Snacks & Biscuits" },
    { icon: "🥤", name: "Beverages" },
    { icon: "🍚", name: "Atta, Rice & Dal" },
    { icon: "🧴", name: "Personal Care" },
  ];

  const products = [
    {
      image: "🥛",
      name: "Fresh Milk",
      price: 65,
      mrp: 70,
      unit: "1 L",
      category: "Dairy & Breakfast",
      rating: 4.6,
      delivery: "10-15 min",
    },
    {
      image: "🍞",
      name: "Brown Bread",
      price: 40,
      mrp: 50,
      unit: "400 g",
      category: "Dairy & Breakfast",
      rating: 4.4,
      delivery: "10-15 min",
    },
    {
      image: "🍎",
      name: "Fresh Apples",
      price: 120,
      mrp: 150,
      unit: "1 kg",
      category: "Fruits & Vegetables",
      rating: 4.7,
      delivery: "15-20 min",
    },
    {
      image: "🥚",
      name: "Farm Eggs",
      price: 70,
      mrp: 80,
      unit: "6 pcs",
      category: "Dairy & Breakfast",
      rating: 4.5,
      delivery: "10-15 min",
    },
    {
      image: "🍪",
      name: "Chocolate Biscuits",
      price: 30,
      mrp: 40,
      unit: "200 g",
      category: "Snacks & Biscuits",
      rating: 4.3,
      delivery: "10-15 min",
    },
    {
      image: "🥤",
      name: "Cold Drink",
      price: 45,
      mrp: 50,
      unit: "750 ml",
      category: "Beverages",
      rating: 4.2,
      delivery: "10-15 min",
    },
    {
      image: "🍚",
      name: "Basmati Rice",
      price: 180,
      mrp: 220,
      unit: "1 kg",
      category: "Atta, Rice & Dal",
      rating: 4.6,
      delivery: "15-20 min",
    },
    {
      image: "🧴",
      name: "Face Wash",
      price: 150,
      mrp: 180,
      unit: "100 ml",
      category: "Personal Care",
      rating: 4.5,
      delivery: "15-20 min",
    },
  ];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCart, setShowCart] = useState(false);

  const addToCart = (name: string) => {
    setCart((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => {
      const updated = { ...prev };

      if (updated[name] > 1) {
        updated[name] = updated[name] - 1;
      } else {
        delete updated[name];
      }

      return updated;
    });
  };

  const deleteFromCart = (name: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const filteredProducts = products.filter((product) => {
    const searchMatch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return searchMatch && categoryMatch;
  });

  const cartItems = products.filter((product) => cart[product.name]);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, product) =>
      total + product.price * cart[product.name],
    0
  );

  const deliveryFee = subtotal > 0 && subtotal < 300 ? 30 : 0;

  const total = subtotal + deliveryFee;

  return (
    <div>
      <nav className="navbar">
        <div className="logo">🛒 MithilaKart</div>

        <input
          className="search"
          type="text"
          placeholder="Search for groceries, fruits & more..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="location">
          📍 Deliver to: <strong>Your Location</strong>
        </div>

        <button
          className="cart-button"
          onClick={() => setShowCart(true)}
        >
          🛒 Cart ({cartCount})
        </button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">⚡ Quick Commerce for Mithila</span>

          <h1>
            Fast Delivery in <span>Mithila</span>
          </h1>

          <p>
            Groceries and daily essentials delivered quickly
            to your doorstep.
          </p>

          <button
            onClick={() => {
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Shop Now →
          </button>
        </div>

        <div className="hero-emoji">
          🛵
        </div>
      </section>

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
            onClick={() => setSelectedCategory("All")}
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
              onClick={() =>
                setSelectedCategory(category.name)
              }
            >
              <span>{category.icon}</span>
              <p>{category.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="products">
        <div className="section-heading">
          <div>
            <h2>Popular Products</h2>
            <span>
              {filteredProducts.length} products available
            </span>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <div>🔍</div>
            <h3>No products found</h3>
            <p>Try searching for another product.</p>
          </div>
        ) : (
          <div className="products">
            {filteredProducts.map((product) => {
              const discount = Math.round(
                ((product.mrp - product.price) / product.mrp) * 100
              );

              return (
                <div className="product" key={product.name}>
                  <div className="product-image-wrapper">
                    <span className="discount-badge">
                      {discount}% OFF
                    </span>

                    <div className="product-image">
                      {product.image}
                    </div>
                  </div>

                  <div className="delivery-time">
                    ⚡ {product.delivery}
                  </div>

                  <h3>{product.name}</h3>

                  <p className="product-unit">
                    {product.unit}
                  </p>

                  <div className="rating">
                    ⭐ {product.rating}
                  </div>

                  <div className="price-row">
                    <div>
                      <span className="price">
                        ₹{product.price}
                      </span>

                      <span className="mrp">
                        ₹{product.mrp}
                      </span>
                    </div>

                    {cart[product.name] ? (
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            removeFromCart(product.name)
                          }
                        >
                          −
                        </button>

                        <span>{cart[product.name]}</span>

                        <button
                          onClick={() =>
                            addToCart(product.name)
                          }
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="add-btn"
                        onClick={() =>
                          addToCart(product.name)
                        }
                      >
                        ADD
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {cartCount > 0 && (
        <button
          className="floating-cart"
          onClick={() => setShowCart(true)}
        >
          <span>🛒 View Cart</span>

          <span>
            {cartCount} items · ₹{total}
          </span>

          <span>→</span>
        </button>
      )}

      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >
          <div
            className="cart-page"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <h2>Your Cart 🛒</h2>
                <p>{cartCount} items</p>
              </div>

              <button
                className="close-cart"
                onClick={() => setShowCart(false)}
              >
                ✕
              </button>
            </div>

            {cartCount === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>

                <h3>Your cart is empty</h3>

                <p>Add some products to continue.</p>

                <button
                  onClick={() => setShowCart(false)}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-products">
                  {cartItems.map((product) => (
                    <div
                      className="cart-product"
                      key={product.name}
                    >
                      <div className="cart-product-image">
                        {product.image}
                      </div>

                      <div className="cart-product-info">
                        <h3>{product.name}</h3>

                        <p>{product.unit}</p>

                        <strong>
                          ₹{product.price}
                        </strong>
                      </div>

                      <div className="cart-actions">
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              removeFromCart(product.name)
                            }
                          >
                            −
                          </button>

                          <span>
                            {cart[product.name]}
                          </span>

                          <button
                            onClick={() =>
                              addToCart(product.name)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteFromCart(product.name)
                          }
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="cart-product-total">
                        ₹
                        {product.price *
                          cart[product.name]}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bill">
                  <h3>Bill Details</h3>

                  <div>
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div>
                    <span>Delivery Fee</span>

                    <span>
                      {deliveryFee === 0
                        ? "FREE"
                        : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="free-delivery">
                    {subtotal >= 300
                      ? "🎉 You got free delivery!"
                      : `Add ₹${300 - subtotal} more for FREE delivery`}
                  </div>

                  <hr />

                  <div className="grand-total">
                    <strong>Total</strong>
                    <strong>₹{total}</strong>
                  </div>

                  <button className="checkout-btn">
                    Proceed to Checkout →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;