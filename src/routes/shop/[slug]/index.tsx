import { component$, useSignal, $, useContext } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../../i18n";

const heroSlides = [
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop", labelKey: "hero.label.onthejob" as const },
  { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", labelKey: "hero.label.polos" as const },
  { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop", labelKey: "hero.label.hats" as const },
];

const teasers = [
  { slug: "jackets", category: "Jackets", tagKey: "teaser.jackets.tag" as const, titleKey: "teaser.jackets.title" as const, textKey: "teaser.jackets.text" as const, ctaKey: "teaser.jackets.cta" as const, imgs: ["https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=400&fit=crop"] },
  { slug: "polos", category: "Polos", tagKey: "teaser.polos.tag" as const, titleKey: "teaser.polos.title" as const, textKey: "teaser.polos.text" as const, ctaKey: "teaser.polos.cta" as const, imgs: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop"] },
  { slug: "hoodies", category: "Hoodies", tagKey: "teaser.hoodies.tag" as const, titleKey: "teaser.hoodies.title" as const, textKey: "teaser.hoodies.text" as const, ctaKey: "teaser.hoodies.cta" as const, imgs: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=600&h=400&fit=crop"] },
  { slug: "hats", category: "Hats", tagKey: "teaser.hats.tag" as const, titleKey: "teaser.hats.title" as const, textKey: "teaser.hats.text" as const, ctaKey: "teaser.hats.cta" as const, imgs: ["https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=400&fit=crop"] },
  { slug: "tees", category: "T-Shirts", tagKey: "teaser.tees.tag" as const, titleKey: "teaser.tees.title" as const, textKey: "teaser.tees.text" as const, ctaKey: "teaser.tees.cta" as const, imgs: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=400&fit=crop"] },
  { slug: "safety", category: "Safety", tagKey: "teaser.safety.tag" as const, titleKey: "teaser.safety.title" as const, textKey: "teaser.safety.text" as const, ctaKey: "teaser.safety.cta" as const, imgs: ["https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop"] },
];

const allProducts = [
  { name: "Classic Green Polo", category: "Polos", sizes: "S - 3XL", img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=440&h=330&fit=crop" },
  { name: "Performance Polo", category: "Polos", sizes: "S - 2XL", img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop" },
  { name: "Women's Classic Polo", category: "Polos", sizes: "XS - 2XL", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=440&h=330&fit=crop" },
  { name: "Striped Polo", category: "Polos", sizes: "S - 2XL", img: "https://images.unsplash.com/photo-1625910513413-5fc45e80fd10?w=440&h=330&fit=crop" },
  { name: "Long Sleeve Polo", category: "Polos", sizes: "S - 3XL", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=440&h=330&fit=crop" },
  { name: "Softshell Jacket", category: "Jackets", sizes: "S - 2XL", img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=440&h=330&fit=crop" },
  { name: "Insulated Parka", category: "Jackets", sizes: "M - 3XL", img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop" },
  { name: "Crew Neck Tee", category: "T-Shirts", sizes: "XS - 3XL", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=440&h=330&fit=crop" },
  { name: "Performance Tee", category: "T-Shirts", sizes: "S - 3XL", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=440&h=330&fit=crop" },
  { name: "Embroidered Cap", category: "Hats", sizes: "One Size", img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=440&h=330&fit=crop" },
  { name: "Knit Beanie", category: "Hats", sizes: "One Size", img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=440&h=330&fit=crop" },
  { name: "Trucker Hat", category: "Hats", sizes: "One Size", img: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=440&h=330&fit=crop" },
  { name: "Pullover Hoodie", category: "Hoodies", sizes: "S - 3XL", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=440&h=330&fit=crop" },
  { name: "Zip-Up Hoodie", category: "Hoodies", sizes: "S - 2XL", img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=440&h=330&fit=crop" },
  { name: "Hi-Vis Safety Vest", category: "Safety", sizes: "S - 5XL", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=440&h=330&fit=crop" },
  { name: "Safety Rain Jacket", category: "Safety", sizes: "S - 4XL", img: "https://images.unsplash.com/photo-1545594861-3bef43ff2fc8?w=440&h=330&fit=crop" },
];

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loc = useLocation();
  const slug = loc.params.slug;
  const activeTeaser = teasers.find((ts) => ts.slug === slug) || teasers[0];
  const products = allProducts.filter((p) => p.category === activeTeaser.category);

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

  return (
    <>
      <section class="hero dot-pattern dot-pattern--light">
        <div class="hero__bg" />
        <div class="hero__content">
          <div class="hero__text">
            <h1 class="hero__title">
              <span class="hero__title--accent">{t("hero.accent", locale.value)}</span> {t("hero.title.your", locale.value)}<br /><em>Carmichael</em> {t("hero.title.brand", locale.value)}
            </h1>
            <div class="hero__apparel-row">
              <p class="hero__subtitle-inline">{t("hero.subtitle", locale.value)}</p>
            </div>
            <div
              class="hero__carousel"
              onTouchStart$={onTouchStart}
              onTouchEnd$={onTouchEnd}
            >
              <div class="hero__carousel-viewport">
                {heroSlides.map((slide, i) => (
                  <div
                    key={slide.labelKey}
                    class={`hero__carousel-slide ${activeSlide.value === i ? "active" : ""}`}
                  >
                    <img src={slide.src} alt={t(slide.labelKey, locale.value)} width="600" height="400" />
                    <span class="hero__photo-label">{t(slide.labelKey, locale.value)}</span>
                  </div>
                ))}
              </div>
              <div class="hero__carousel-dots">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.labelKey}
                    class={`hero__carousel-dot ${activeSlide.value === i ? "active" : ""}`}
                    onClick$={() => (activeSlide.value = i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Browse section */}
        <div class="section section--teasers">
          <div class="hero__browse">
            <nav class="hero-nav">
              {teasers.map((ts) => (
                <a
                  key={ts.slug}
                  href={`/shop/${ts.slug}/`}
                  class={`hero-nav__item ${ts.slug === slug ? "active" : ""}`}
                >
                  <img src={ts.imgs[0]} alt={t(ts.titleKey, locale.value)} width="60" height="40" />
                  <div class="hero-nav__info">
                    <span class="hero-nav__tag">{t(ts.tagKey, locale.value)}</span>
                    <span class="hero-nav__title">{t(ts.titleKey, locale.value)}</span>
                  </div>
                </a>
              ))}
              <a href="/" class="hero-nav__back">{t("shop.back", locale.value)}</a>
            </nav>
            <div class="hero__products">
              <div class="hero__products-header">
                <h2 class="hero__products-title">{t(activeTeaser.titleKey, locale.value)}</h2>
                <span class="hero__products-count">{products.length} {t("shop.items", locale.value)}</span>
              </div>
              <div class="hero__products-grid">
                {products.map((item) => (
                  <a key={item.name} href="/apparel/" class="hero-product-card">
                    <div class="hero-product-card__image">
                      <img src={item.img} alt={item.name} width="440" height="330" />
                    </div>
                    <div class="hero-product-card__info">
                      <span class="hero-product-card__name">{item.name}</span>
                      <span class="hero-product-card__sizes">{item.sizes}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Carmichael Engineering - Employee Apparel",
};
