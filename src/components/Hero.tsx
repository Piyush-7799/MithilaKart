import { Zap, ArrowRight, ShieldCheck, Clock, Sparkles } from "lucide-react";

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
    <section className="hero-section">
      <div className="hero-banner">
        {/* Decorative background glow & shapes */}
        <div className="hero-glow-circle hero-glow-1"></div>
        <div className="hero-glow-circle hero-glow-2"></div>
        <div className="hero-grid-pattern"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Mithila's Fastest Quick-Commerce</span>
          </div>

          <h1 className="hero-title">
            Fast Delivery in <span className="hero-title-highlight">Mithila</span>
          </h1>

          <p className="hero-description">
            Get farm-fresh vegetables, dairy, pantry staples, and authentic regional
            specialties delivered straight to your doorstep in 10-15 minutes.
          </p>

          <div className="hero-actions">
            <button
              className="hero-cta-btn"
              onClick={handleScrollToProducts}
              type="button"
            >
              <span>Shop Fresh Essentials</span>
              <ArrowRight size={18} />
            </button>
            <div className="hero-guarantee">
              <span className="guarantee-dot"></span>
              <span>Express Dark Stores active across Mithila</span>
            </div>
          </div>

          {/* Quick Perks / Trust Metrics */}
          <div className="hero-perks">
            <div className="perk-item">
              <div className="perk-icon-wrapper">
                <Clock size={16} />
              </div>
              <div className="perk-text">
                <strong>10-15 Min</strong>
                <span>Doorstep Drop</span>
              </div>
            </div>

            <div className="perk-item">
              <div className="perk-icon-wrapper">
                <Zap size={16} />
              </div>
              <div className="perk-text">
                <strong>Farm Fresh</strong>
                <span>Direct Harvest</span>
              </div>
            </div>

            <div className="perk-item">
              <div className="perk-icon-wrapper">
                <ShieldCheck size={16} />
              </div>
              <div className="perk-text">
                <strong>Best Quality</strong>
                <span>100% Inspected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Visual Card / Badge Showcase */}
        <div className="hero-visual">
          <div className="hero-card-showcase">
            <div className="showcase-badge">
              <span className="pulse-indicator"></span>
              <span>Express Delivery Active</span>
            </div>
            
            <div className="showcase-delivery-illustration">
              <div className="scooter-circle">
                <span className="scooter-emoji">🛵</span>
              </div>
            </div>

            <div className="showcase-info">
              <h3>Direct to Your Kitchen</h3>
              <p>Mithila Makhana, dairy, fruits & daily essentials curated with care.</p>
              
              <div className="showcase-metrics">
                <div className="metric">
                  <span className="metric-val">⚡ 12 min</span>
                  <span className="metric-lbl">Avg Delivery</span>
                </div>
                <div className="metric-divider"></div>
                <div className="metric">
                  <span className="metric-val">₹0 Fee</span>
                  <span className="metric-lbl">Orders ₹300+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
