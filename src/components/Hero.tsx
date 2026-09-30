interface HeroProps {
  onShopNow?: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  const handleScrollToProducts = () => {
    if (onShopNow) {
      onShopNow();
    } else {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tag">⚡ Quick Commerce for Mithila</span>

        <h1>
          Fast Delivery in <span>Mithila</span>
        </h1>

        <p>
          Groceries and daily essentials delivered quickly to your doorstep.
        </p>

        <button onClick={handleScrollToProducts}>Shop Now →</button>
      </div>

      <div className="hero-emoji">🛵</div>
    </section>
  );
}
