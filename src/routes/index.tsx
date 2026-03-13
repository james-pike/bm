import { component$, useSignal, useComputed$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

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

const allProducts = [
  { name: "Classic Green Polo", category: "Polos", sizes: "S - 3XL", badge: "Best Seller", colors: ["#00703c", "#1a1a18", "#ffffff"], img: "https://images.unsplash.com/photo-1625910513413-5fc89e65cf4e?w=440&h=330&fit=crop" },
  { name: "Performance Polo", category: "Polos", sizes: "S - 2XL", badge: "", colors: ["#00703c", "#2c3e50", "#94a3b8"], img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop" },
  { name: "Women's Classic Polo", category: "Polos", sizes: "XS - 2XL", badge: "", colors: ["#00703c", "#ffffff", "#1a1a18"], img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=440&h=330&fit=crop" },
  { name: "Softshell Jacket", category: "Jackets", sizes: "S - 2XL", badge: "New", colors: ["#1a1a18", "#00703c"], img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=440&h=330&fit=crop" },
  { name: "Insulated Parka", category: "Jackets", sizes: "M - 3XL", badge: "", colors: ["#1a1a18", "#2c3e50"], img: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=440&h=330&fit=crop" },
  { name: "Crew Neck Tee", category: "T-Shirts", sizes: "XS - 3XL", badge: "Staff Pick", colors: ["#00703c", "#1a1a18", "#ffffff", "#94a3b8"], img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=440&h=330&fit=crop" },
  { name: "Performance Tee", category: "T-Shirts", sizes: "S - 3XL", badge: "", colors: ["#00703c", "#1a1a18", "#E6570C"], img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=440&h=330&fit=crop" },
  { name: "Embroidered Cap", category: "Hats", sizes: "One Size", badge: "Popular", colors: ["#00703c", "#1a1a18", "#2c3e50"], img: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=440&h=330&fit=crop" },
  { name: "Knit Beanie", category: "Hats", sizes: "One Size", badge: "", colors: ["#00703c", "#1a1a18", "#94a3b8"], img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=440&h=330&fit=crop" },
  { name: "Trucker Hat", category: "Hats", sizes: "One Size", badge: "", colors: ["#00703c", "#1a1a18"], img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=440&h=330&fit=crop" },
  { name: "Pullover Hoodie", category: "Hoodies", sizes: "S - 3XL", badge: "New", colors: ["#00703c", "#1a1a18", "#2c3e50"], img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=440&h=330&fit=crop" },
  { name: "Zip-Up Hoodie", category: "Hoodies", sizes: "S - 2XL", badge: "", colors: ["#1a1a18", "#00703c", "#94a3b8"], img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=440&h=330&fit=crop" },
  { name: "Hi-Vis Safety Vest", category: "Safety", sizes: "S - 5XL", badge: "Required", colors: ["#e4ba3f", "#E6570C"], img: "https://images.unsplash.com/photo-1618517048289-4646b455e281?w=440&h=330&fit=crop" },
  { name: "Safety Rain Jacket", category: "Safety", sizes: "S - 4XL", badge: "", colors: ["#e4ba3f", "#1a1a18"], img: "https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=440&h=330&fit=crop" },
];

const categories = ["All", "Polos", "T-Shirts", "Jackets", "Hoodies", "Hats", "Safety"];

type SortKey = "popular" | "newest" | "name";

export default component$(() => {
  const activeSlide = useSignal(0);
  const touchStart = useSignal(0);
  const activeCategory = useSignal("All");
  const sortBy = useSignal<SortKey>("popular");

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

  const filtered = useComputed$(() => {
    const items = activeCategory.value === "All"
      ? [...allProducts]
      : allProducts.filter((p) => p.category === activeCategory.value);

    if (sortBy.value === "name") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy.value === "newest") {
      items.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
    }
    return items;
  });

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
              <a href="#products" class="btn btn--primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 1.68l-.97 7.75A2 2 0 0 0 3.3 15.1l3.6 3.6a1 1 0 0 0 .7.3H12m8-8V4.14a2 2 0 0 0-1.34-1.68" /><path d="M15 19l2 2 4-4" /></svg>
                Browse Apparel
              </a>
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
              <a href="#products" class="btn btn--primary">Shop Jackets</a>
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

      {/* Full Product Catalog */}
      <section class="section section--full" style={{ background: "var(--ce-off-white)" }}>
        <div class="apparel-catalog" id="products">
          <div class="apparel-catalog__header">
            <div class="apparel-catalog__title-row">
              <h2 class="apparel-catalog__title">
                {activeCategory.value === "All" ? "All Apparel" : activeCategory.value}
              </h2>
              <span class="apparel-catalog__count">{filtered.value.length} items</span>
            </div>
            <div class="apparel-catalog__controls">
              <div class="apparel-catalog__chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    class={`apparel-catalog__chip ${activeCategory.value === cat ? "active" : ""}`}
                    onClick$={() => (activeCategory.value = cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                class="apparel-catalog__sort"
                value={sortBy.value}
                onChange$={(_, el) => (sortBy.value = el.value as SortKey)}
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
          <div class="apparel-grid">
            {filtered.value.map((item) => (
              <div key={item.name} class="product-card">
                <div class="product-card__image">
                  <img src={item.img} alt={item.name} width="440" height="330" />
                  <div class="product-card__image-overlay" />
                </div>
                <div class="product-card__info">
                  <div class="product-card__category">{item.category}</div>
                  <div class="product-card__name">{item.name}</div>
                  <div class="product-card__colors">
                    {item.colors.map((color) => (
                      <span
                        key={color}
                        class={`product-card__color-dot ${color === "#ffffff" ? "product-card__color-dot--light" : ""}`}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div class="product-card__meta">
                    <span class="product-card__sizes">{item.sizes}</span>
                    {item.badge && <span class={badgeClass(item.badge)}>{item.badge}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
