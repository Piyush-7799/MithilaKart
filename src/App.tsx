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
    { image: "🥛", name: "Fresh Milk", price: "₹65", unit: "1 L" },
    { image: "🍞", name: "Brown Bread", price: "₹40", unit: "400 g" },
    { image: "🍎", name: "Fresh Apples", price: "₹120", unit: "1 kg" },
    { image: "🥚", name: "Farm Eggs", price: "₹70", unit: "6 pcs" },
  ];

  return (
    <div>
      <nav className="navbar">
        <div className="logo">🛒 MithilaKart</div>

        <input
          className="search"
          type="text"
          placeholder="Search for groceries, fruits & more..."
        />

        <div className="location">📍 Deliver to: Your Location</div>
      </nav>

      <section className="hero">
        <h1>Fast Delivery in Mithila ⚡</h1>
        <p>
          Groceries and daily essentials delivered quickly to your doorstep.
        </p>
        <button>Shop Now</button>
      </section>

      <section className="section">
        <h2>Shop by Category</h2>

        <div className="categories">
          {categories.map((category) => (
            <div className="category" key={category.name}>
              <span>{category.icon}</span>
              <p>{category.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Popular Products</h2>

        <div className="products">
          {products.map((product) => (
            <div className="product" key={product.name}>
              <div className="product-image">{product.image}</div>

              <h3>{product.name}</h3>

              <p>{product.unit}</p>

              <div className="price">{product.price}</div>

              <button className="add-btn">ADD</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;