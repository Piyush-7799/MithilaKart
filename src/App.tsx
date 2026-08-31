
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
    { image: "🥛", name: "Fresh Milk", price: 65, unit: "1 L", category: "Dairy & Breakfast" },
    { image: "🍞", name: "Brown Bread", price: 40, unit: "400 g", category: "Dairy & Breakfast" },
    { image: "🍎", name: "Fresh Apples", price: 120, unit: "1 kg", category: "Fruits & Vegetables" },
    { image: "🥚", name: "Farm Eggs", price: 70, unit: "6 pcs", category: "Dairy & Breakfast" },
    { image: "🍪", name: "Biscuits", price: 30, unit: "200 g", category: "Snacks & Biscuits" },
    { image: "🥤", name: "Cold Drink", price: 45, unit: "750 ml", category: "Beverages" },
    { image: "🍚", name: "Basmati Rice", price: 180, unit: "1 kg", category: "Atta, Rice & Dal" },
    { image: "🧴", name: "Face Wash", price: 150, unit: "100 ml", category: "Personal Care" },
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
          📍 Deliver to: Your Location
        </div>

        <button
          className="cart-button"
          onClick={() => setShowCart(true)}
        >
          🛒 Cart ({cartCount})
        </button>
      </nav>

      <section className="hero">
        <h1>Fast Delivery in Mithila ⚡</h1>

        <p>
          Groceries and daily essentials delivered quickly to your doorstep.
        </p>

        <button
          onClick={() => {
            document
              .getElementById("products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Shop Now
        </button>
      </section>

      <section className="section">
        <h2>Shop by Category</h2>

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
        <h2>Popular Products</h2>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h3>😕 No products found</h3>
            <p>Try searching for another product.</p>
          </div>
        ) : (
          <div className="products">
            {filteredProducts.map((product) => (
              <div className="product" key={product.name}>
                <div className="product-image">
                  {product.image}
                </div>

                <h3>{product.name}</h3>

                <p>{product.unit}</p>

                <div className="price">
                  ₹{product.price}
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
            ))}
          </div>
        )}
      </section>

      {cartCount > 0 && (
        <button
          className="floating-cart"
          onClick={() => setShowCart(true)}
        >
          🛒 View Cart
          <span>
            {cartCount} items · ₹{total}
          </span>
        </button>
      )}

      {showCart && (
        <div className="cart-overlay">
          <div className="cart-page">
            <div className="cart-header">
              <h2>Your Cart 🛒</h2>

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

