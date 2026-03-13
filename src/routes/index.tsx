import { component$, useSignal, $ } from "@builder.io/qwik";
import { Link, type DocumentHead } from "@builder.io/qwik-city";

const badgeClass = (badge: string) => {
  if (badge === "New") return "product-card__badge product-card__badge--orange";
  if (badge === "Required") return "product-card__badge product-card__badge--gold";
  return "product-card__badge product-card__badge--green";
};

const heroSlides = [
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", label: "On the Job" },
  { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", label: "Polos" },
  { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop", label: "Hats" },
];

export default component$(() => {
  const activeSlide = useSignal(0);
  const touchStart = useSignal(0);

  const onTouchStart = $((e: TouchEvent) => {
    touchStart.value = e.touches[0].clientX;
  });

  const onTouchEnd = $((e: TouchEvent) => {
    const diff = touchStart.value - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeSlide.value < heroSlides.length - 1) {
        activeSlide.value++;
      } else if (diff < 0 && activeSlide.value > 0) {
        activeSlide.value--;
      }
    }
  });

  const featuredItems = [
    {
      name: "Classic Green Polo",
      category: "Polo",
      sizes: "S - 3XL",
      badge: "Best Seller",
      img: "https://images.unsplash.com/photo-1625910513413-5fc89e65cf4e?w=500&h=375&fit=crop",
    },
    {
      name: "Softshell Jacket",
      category: "Jacket",
      sizes: "S - 2XL",
      badge: "New",
      img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=375&fit=crop",
    },
    {
      name: "Embroidered Cap",
      category: "Hat",
      sizes: "One Size",
      badge: "Popular",
      img: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=500&h=375&fit=crop",
    },
    {
      name: "Crew Neck Tee",
      category: "T-Shirt",
      sizes: "XS - 3XL",
      badge: "Staff Pick",
      img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=375&fit=crop",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section class="hero">
        <div class="hero__bg" />
        <div class="hero__content">
          <div class="hero__text">
            <div class="hero__badge">
              <span class="hero__badge-dot" />
              Employee Exclusive
            </div>
            <h1 class="hero__title">
              Wear the{" "}
              <em>Carmichael</em>{" "}
              Brand
            </h1>
            <p class="hero__subtitle">
              Premium branded apparel for the Carmichael Engineering team.
              From the job site to the office — gear that fits your role.
            </p>
            <div class="hero__actions">
              <Link href="/apparel/#products" class="btn btn--primary">
                Browse Apparel
              </Link>
            </div>
            {/* Mobile carousel */}
            <div
              class="hero__carousel"
              onTouchStart$={onTouchStart}
              onTouchEnd$={onTouchEnd}
            >
              <div class="hero__carousel-viewport">
                {heroSlides.map((slide, i) => (
                  <div
                    key={slide.label}
                    class={`hero__carousel-slide ${activeSlide.value === i ? "active" : ""}`}
                  >
                    <img src={slide.src} alt={slide.label} width="600" height="400" />
                    <span class="hero__photo-label">{slide.label}</span>
                  </div>
                ))}
              </div>
              <div class="hero__carousel-dots">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.label}
                    class={`hero__carousel-dot ${activeSlide.value === i ? "active" : ""}`}
                    onClick$={() => (activeSlide.value = i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Desktop gallery */}
          <div class="hero__gallery">
            <div class="hero__photo hero__photo--tall">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=900&fit=crop" alt="Construction worker in safety gear" width="600" height="900" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">On the Job</span>
            </div>
            <div class="hero__photo">
              <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=400&fit=crop" alt="Folded polo shirts" width="400" height="400" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">Polos</span>
            </div>
            <div class="hero__photo">
              <img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=400&fit=crop" alt="Baseball cap" width="400" height="400" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">Hats</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div class="stats-row">
        <div class="stats-row__card">
          <div class="stats-row__number">14</div>
          <div class="stats-row__label">Available Items</div>
        </div>
        <div class="stats-row__card">
          <div class="stats-row__number">XS-5XL</div>
          <div class="stats-row__label">Size Range</div>
        </div>
        <div class="stats-row__card">
          <div class="stats-row__number">Free</div>
          <div class="stats-row__label">Shipping to Site</div>
        </div>
        <div class="stats-row__card">
          <div class="stats-row__number">Payroll</div>
          <div class="stats-row__label">Deduction Available</div>
        </div>
      </div>

      {/* Featured Banner */}
      <section class="section">
        <div class="featured-banner">
          <div class="featured-banner__content">
            <div class="featured-banner__tag">Just Landed</div>
            <h2 class="featured-banner__title">New Season<br />Jackets Are In</h2>
            <p class="featured-banner__text">
              Softshell and insulated options built for Canadian weather,
              with the Carmichael logo embroidered on chest and back.
            </p>
            <div>
              <Link href="/apparel/#products" class="btn btn--primary">Shop Jackets</Link>
            </div>
          </div>
          <div class="featured-banner__image">
            <img
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=700&h=500&fit=crop"
              alt="Jacket collection"
              width="700"
              height="500"
            />
          </div>
        </div>
      </section>

      {/* Staff Picks */}
      <section class="section section--full" style={{ background: "var(--ce-off-white)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div class="section__header">
            <div class="section__label">Staff Picks</div>
            <h2 class="section__title">Popular with the Team</h2>
            <p class="section__desc">
              A few favourites from the full collection.
            </p>
          </div>
          <div class="popular-grid">
            {featuredItems.map((item) => (
              <div key={item.name} class="product-card">
                <div class="product-card__image">
                  <img src={item.img} alt={item.name} width="500" height="375" />
                  <div class="product-card__image-overlay" />
                </div>
                <div class="product-card__info">
                  <div class="product-card__category">{item.category}</div>
                  <div class="product-card__name">{item.name}</div>
                  <div class="product-card__meta">
                    <span class="product-card__sizes">{item.sizes}</span>
                    <span class={badgeClass(item.badge)}>{item.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/apparel/#products" class="btn btn--outline">
              View All Items
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="cta-section">
        <div class="cta-section__inner">
          <h2 class="cta-section__title">Need Something Custom?</h2>
          <p class="cta-section__text">
            Team-specific gear, event merch, or bulk orders —
            the apparel coordinator has you covered.
          </p>
          <a href="mailto:apparel@carmichael-eng.ca" class="btn btn--white">
            Contact Apparel Team
          </a>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Carmichael Engineering - Employee Apparel Store",
  meta: [
    {
      name: "description",
      content: "Official Carmichael Engineering employee apparel store. Order branded polos, jackets, hats, and more.",
    },
  ],
};
