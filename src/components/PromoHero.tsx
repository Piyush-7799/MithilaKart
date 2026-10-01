import { Zap, Sparkles, ArrowRight, ShieldCheck, Clock, ShoppingBag } from "lucide-react";

interface PromoHeroProps {
  onShopNow: () => void;
  onExploreMithilaSpecials: () => void;
}

export function PromoHero({
  onShopNow,
  onExploreMithilaSpecials,
}: PromoHeroProps) {
  return (
    <section className="promo-hero-section" aria-label="Promotional Announcement">
      <div className="promo-hero-banner">
        {/* Subtle Decorative Background Geometry */}
        <div className="promo-hero-glow promo-hero-glow-1" aria-hidden="true" />
        <div className="promo-hero-glow promo-hero-glow-2" aria-hidden="true" />
        <div className="promo-hero-pattern" aria-hidden="true" />

        <div className="promo-hero-layout">
          {/* Left Column: Copy, Badges & CTAs */}
          <div className="promo-hero-text-col">
            {/* Promotional Badges Strip */}
            <div className="promo-badges-strip" role="list" aria-label="Store highlights">
              <span className="promo-badge promo-badge-delivery" role="listitem">
                <Zap size={12} className="promo-badge-icon" />
                10–15 MIN DELIVERY
              </span>
              <span className="promo-badge promo-badge-specials" role="listitem">
                <Sparkles size={12} className="promo-badge-icon" />
                MITHILA SPECIALS
              </span>
              <span className="promo-badge promo-badge-essentials" role="listitem">
                <ShoppingBag size={12} className="promo-badge-icon" />
                EVERYDAY ESSENTIALS
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="promo-hero-headline">
              Mithila's everyday shopping,{" "}
              <span className="promo-hero-headline-highlight">delivered fast.</span>
            </h1>

            {/* Supporting Text */}
            <p className="promo-hero-subtext">
              Fresh essentials, local favourites, and daily needs — all in one place.
            </p>

            {/* CTAs */}
            <div className="promo-hero-actions">
              <button
                type="button"
                className="promo-cta-primary"
                onClick={onShopNow}
                aria-label="Shop Now - View product catalogue"
              >
                <span>Shop Now</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="promo-cta-secondary"
                onClick={onExploreMithilaSpecials}
                aria-label="Explore Mithila Specials category"
              >
                <Sparkles size={16} className="promo-secondary-icon" />
                <span>Explore Mithila Specials</span>
              </button>
            </div>

            {/* Trust Perks Footer */}
            <div className="promo-hero-perks">
              <div className="promo-perk-item">
                <Clock size={14} className="promo-perk-icon" />
                <span>Instant Local Dispatch</span>
              </div>
              <span className="promo-perk-divider" aria-hidden="true">•</span>
              <div className="promo-perk-item">
                <ShieldCheck size={14} className="promo-perk-icon" />
                <span>Quality Inspected</span>
              </div>
              <span className="promo-perk-divider" aria-hidden="true">•</span>
              <div className="promo-perk-item">
                <span className="promo-perk-dot" aria-hidden="true" />
                <span>₹300+ Free Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Grocery Showcase Card Composition */}
          <div className="promo-hero-visual-col" aria-hidden="true">
            <div className="promo-showcase-container">
              {/* Feature Floating Card 1: Regional Makhana Special */}
              <div className="promo-card promo-card-special">
                <div className="promo-card-icon-box special-icon-box">
                  <span className="promo-emoji">🌾</span>
                </div>
                <div className="promo-card-info">
                  <span className="promo-card-tag">Signature Selection</span>
                  <strong className="promo-card-title">Phool Makhana</strong>
                  <span className="promo-card-sub">Local Farm Direct</span>
                </div>
              </div>

              {/* Feature Floating Card 2: Fresh Everyday Staples */}
              <div className="promo-card promo-card-fresh">
                <div className="promo-card-icon-box fresh-icon-box">
                  <span className="promo-emoji">🥛</span>
                </div>
                <div className="promo-card-info">
                  <span className="promo-card-tag">Fresh Daily</span>
                  <strong className="promo-card-title">Dairy & Staples</strong>
                  <span className="promo-card-sub">Morning Dispatch</span>
                </div>
              </div>

              {/* Feature Floating Card 3: Fast Express Promise */}
              <div className="promo-card promo-card-express">
                <div className="promo-card-icon-box express-icon-box">
                  <Zap size={20} className="express-zap-icon" />
                </div>
                <div className="promo-card-info">
                  <span className="promo-card-tag">Quick Dispatch</span>
                  <strong className="promo-card-title">10–15 Min Drop</strong>
                  <span className="promo-card-sub">Dark Store Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
