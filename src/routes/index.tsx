import { component$, useSignal, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

const heroSlides = [
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", label: "On the Job" },
  { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", label: "Polos" },
  { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop", label: "Hats" },
];


const teasers = [
  {
    tag: "Just Landed",
    title: "New Season Jackets",
    text: "Softshell and insulated options built for Canadian weather.",
    cta: "Shop Jackets",
    img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=400&fit=crop",
  },
  {
    tag: "Team Favourite",
    title: "Classic Polos",
    text: "The go-to for site visits and the office.",
    cta: "Shop Polos",
    img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop",
  },
  {
    tag: "Cold Weather",
    title: "Hoodies & Layers",
    text: "Pullover and zip-up hoodies for cooler days.",
    cta: "Shop Hoodies",
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop",
  },
  {
    tag: "Headwear",
    title: "Caps & Beanies",
    text: "Embroidered caps and knit beanies for every season.",
    cta: "Shop Hats",
    img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop",
  },
  {
    tag: "Essentials",
    title: "Crew Neck Tees",
    text: "Lightweight branded tees for everyday wear.",
    cta: "Shop Tees",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
  },
  {
    tag: "Performance",
    title: "Athletic Wear",
    text: "Moisture-wicking performance gear for active days.",
    cta: "Shop Performance",
    img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=400&fit=crop",
  },
  {
    tag: "Job Site",
    title: "Safety Gear",
    text: "Hi-vis vests and rain jackets that meet safety standards.",
    cta: "Shop Safety",
    img: "https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=600&h=400&fit=crop",
  },
  {
    tag: "Layering",
    title: "Zip-Up Fleece",
    text: "Mid-weight fleece for transitional weather.",
    cta: "Shop Fleece",
    img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=400&fit=crop",
  },
  {
    tag: "Winter Ready",
    title: "Insulated Parkas",
    text: "Heavy-duty insulation for the coldest job sites.",
    cta: "Shop Parkas",
    img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=400&fit=crop",
  },
  {
    tag: "New Arrival",
    title: "Softshell Vests",
    text: "Wind-resistant vests with Carmichael branding.",
    cta: "Shop Vests",
    img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=400&fit=crop",
  },
];

export default component$(() => {
  const activeSlide = useSignal(0);
  const touchStart = useSignal(0);
  const activeTeaser = useSignal(0);
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

  return (
    <>
      {/* Hero */}
      <section class="hero dot-pattern dot-pattern--light">
        <div class="hero__bg" />
        <div class="hero__content">
          <div class="hero__text">
            {/* <div class="hero__badge">
              <span class="hero__badge-dot" />
              Employee Exclusive
            </div> */}
            <h1 class="hero__title">
              <span class="hero__title--accent">Wear</span> Your<br /><em>Carmichael</em> Brand
            </h1>
            <div class="hero__apparel-row">
              <p class="hero__subtitle-inline">Premium apparel to fit all roles, from the job site to the office.</p>
            </div>
            {/* <div class="hero__actions">
              <a href="/apparel/" class="hero__badge hero__badge--cta">
                <span class="hero__badge-dot" />
                Browse Apparel
              </a>
            </div> */}
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
          {/* Desktop bento gallery */}
          <div class="hero__bento">
            <div class="hero__photo hero__bento-a">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=900&fit=crop" alt="Construction worker in safety gear" width="600" height="900" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">On the Job</span>
            </div>
            <div class="hero__photo hero__bento-b">
              <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop" alt="Folded polo shirts" width="600" height="400" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">Polos</span>
            </div>
            <div class="hero__photo hero__bento-c">
              <img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop" alt="Baseball cap" width="600" height="400" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">Hats</span>
            </div>
            <div class="hero__photo hero__bento-d">
              <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop" alt="Hoodies" width="600" height="400" />
              <div class="hero__photo-overlay" />
              <span class="hero__photo-label">Hoodies</span>
            </div>
          </div>
        </div>

        {/* Featured Teasers */}
        <div class="section section--teasers">
          {/* Desktop: grid of cards */}
          <div class="teaser-grid">
            {teasers.map((t) => (
              <a key={t.tag} href="/apparel/" class="teaser-card">
                <div class="teaser-card__image">
                  <img src={t.img} alt={t.title} width="600" height="400" />
                </div>
                <div class="teaser-card__body">
                  <div class="featured-banner__tag">{t.tag}</div>
                  <h3 class="teaser-card__title">{t.title}</h3>
                  <p class="teaser-card__text">{t.text}</p>
                  <span class="btn btn--primary btn--sm">{t.cta}</span>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile: fade carousel */}
          <div class="teaser-carousel">
            <div class="teaser-carousel__viewport">
              {teasers.map((t, i) => (
                <div
                  key={t.tag}
                  class={`teaser-carousel__slide ${activeTeaser.value === i ? "active" : ""}`}
                >
                  <div class="featured-banner">
                    <div class="featured-banner__content">
                      <div class="featured-banner__tag">{t.tag}</div>
                      <h2 class="featured-banner__title">{t.title}</h2>
                      <p class="featured-banner__text">{t.text}</p>
                      <div>
                        <a href="/apparel/" class="btn btn--primary">{t.cta}</a>
                      </div>
                    </div>
                    <div class="featured-banner__image">
                      <img src={t.img} alt={t.title} width="700" height="500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div class="teaser-carousel__dots">
              {teasers.map((t, i) => (
                <button
                  key={t.tag}
                  class={`teaser-carousel__dot ${activeTeaser.value === i ? "active" : ""}`}
                  onClick$={() => (activeTeaser.value = i)}
                  aria-label={`Teaser ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* <div class="stats-row dot-pattern">
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
      </div> */}
    </>
  );
});

export const head: DocumentHead = {
  title: "Carmichael Engineering - Employee Apparel",
  meta: [
    {
      name: "description",
      content: "Official Carmichael Engineering employee apparel. Order branded polos, jackets, hats, and more.",
    },
  ],
};
