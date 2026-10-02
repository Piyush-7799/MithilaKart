import { Zap, Sparkles, ArrowRight, ShieldCheck, Clock, ShoppingBag } from "lucide-react";
import { DeliveryScooterIllustration } from "./DeliveryScooterIllustration";
import { MithilaSun, MithilaAripanLine } from "./MithilaMotif";

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
        {/* Subtle Decorative Background Geometry & Mithila Sun Aura */}
        <div className="promo-hero-glow promo-hero-glow-1" aria-hidden="true" />
        <div className="promo-hero-glow promo-hero-glow-2" aria-hidden="true" />
        <div className="promo-hero-pattern" aria-hidden="true" />
        <div className="promo-hero-sun-watermark" aria-hidden="true">
          <MithilaSun size={320} color="#fde68a" secondaryColor="#f59e0b" />
        </div>

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
              Fast Delivery in{" "}
              <span className="promo-hero-headline-highlight">Mithila</span>
            </h1>

            {/* Supporting Text */}
            <p className="promo-hero-subtext">
              Daily essentials, local favourites, delivered to your doorstep.
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
                <span>10–15 Min Doorstep Drop</span>
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

          {/* Right Column: Premium Delivery Scooter Showcase */}
          <div className="promo-hero-visual-col" aria-hidden="true">
            <DeliveryScooterIllustration />
          </div>
        </div>

        {/* Subtle Bottom Madhubani Aripan Trim */}
        <div className="promo-hero-bottom-border" aria-hidden="true">
          <MithilaAripanLine color="#fde68a" secondaryColor="#f59e0b" height={10} />
        </div>
      </div>
    </section>
  );
}
