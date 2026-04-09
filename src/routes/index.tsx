import { component$, useSignal, useContext, useVisibleTask$ } from "@builder.io/qwik";
import { Carousel } from "@qwik-ui/headless";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../i18n";
import { categoryLabel } from "./apparel/products";
import { ProductCatalog } from "../components/product-catalog/product-catalog";


/* eslint-disable @typescript-eslint/no-unused-vars */
const _teasers = [
  {
    slug: "work-wear",
    category: "Work Wear",
    tagKey: "teaser.workwear.tag" as const,
    titleKey: "teaser.workwear.title" as const,
    textKey: "teaser.workwear.text" as const,
    ctaKey: "teaser.workwear.cta" as const,
    imgs: [
      "/sku/_INSULATED_VIKING_frj3957frj_-removebg-preview.png",
      "/sku/carmicheal-337-logo.png",
    ],
    skewed: true,
  },
  {
    slug: "all",
    category: "All",
    tagKey: "teaser.all.tag" as const,
    titleKey: "teaser.all.title" as const,
    textKey: "teaser.all.text" as const,
    ctaKey: "teaser.all.cta" as const,
    imgs: [
      "/hat/30109107PS2_FRONT.JPG",
      "/softshell/j7603-soft-shell.png",
    ],
    skewed: true,
  },
  {
    slug: "jackets",
    category: "Jackets",
    tagKey: "teaser.jackets.tag" as const,
    titleKey: "teaser.jackets.title" as const,
    textKey: "teaser.jackets.text" as const,
    ctaKey: "teaser.jackets.cta" as const,
    imgs: [
      "/sku/j7603-soft-shell-removebg-preview.png",
      "/womens-fleece.png",
    ],
    skewed: true,
  },
  {
    slug: "polos",
    category: "Polos",
    tagKey: "teaser.polos.tag" as const,
    titleKey: "teaser.polos.title" as const,
    textKey: "teaser.polos.text" as const,
    ctaKey: "teaser.polos.cta" as const,
    imgs: [
      "/sku/green-removebg-preview.png",
      "/sku/car20.png",
    ],
    skewed: true,
  },
  {
    slug: "hats",
    category: "Hats",
    tagKey: "teaser.hats.tag" as const,
    titleKey: "teaser.hats.title" as const,
    textKey: "teaser.hats.text" as const,
    ctaKey: "teaser.hats.cta" as const,
    imgs: [
      "/hat/30109107PS2_FRONT.JPG",
      "/beanie/1.png",
    ],
    skewed: true,
  },
];


const TeaserCard = component$<{ t: typeof _teasers[0] }>(({ t: teaser }) => {
  const locale = useContext(LocaleContext);
  const imgIndex = useSignal(0);
  const hovering = useSignal(false);

  return (
    <a
      href={`/apparel/?category=${teaser.category}`}
      class="teaser-card"
      onMouseEnter$={() => (hovering.value = true)}
      onMouseLeave$={() => (hovering.value = false)}
    >
      <div class={`teaser-card__image ${(teaser as any).skewed ? "teaser-card__image--skewed" : ""}`}>
        {(teaser as any).skewed ? (
          teaser.imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={t(teaser.titleKey, locale.value)}
              width="600"
              height="400"
              loading="eager"
              decoding="async"
              class="teaser-card__skewed-img"
            />
          ))
        ) : (
          teaser.imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={t(teaser.titleKey, locale.value)}
              width="600"
              height="400"
              loading="eager"
              decoding="async"
              class={`teaser-card__img ${imgIndex.value === i ? "active" : ""} ${(teaser as any).imgClass || ""}`}
            />
          ))
        )}
      </div>
      <div class="teaser-card__dots" />
      <div class="teaser-card__body">
        <div class="featured-banner__tag">{t(teaser.tagKey, locale.value)}</div>
        <h3 class="teaser-card__title">{t(teaser.titleKey, locale.value)}</h3>
        <p class="teaser-card__text">{t(teaser.textKey, locale.value)}</p>
        <span class="btn btn--primary btn--sm">{t(teaser.ctaKey, locale.value)}</span>
      </div>
    </a>
  );
});

export default component$(() => {
  const locale = useContext(LocaleContext);
  const hasCartItems = useSignal(false);
  const heroIndex = useSignal(0);
  const bentoIndex = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const check = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("ce_cart") || "[]");
        hasCartItems.value = cart.length > 0;
      } catch { hasCartItems.value = false; }
    };
    check();
    window.addEventListener("cart-updated", check);
    cleanup(() => window.removeEventListener("cart-updated", check));
  });

  // Carousel autoplay (manual to avoid qwik-ui serialization bug)
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const id = setInterval(() => {
      heroIndex.value = (heroIndex.value + 1) % 2;
      bentoIndex.value = (bentoIndex.value + 1) % 2;
    }, 6000);
    cleanup(() => clearInterval(id));
  });

  return (
    <div class="home-page">
      {/* Hero */}
      <section class="hero">
        <div class="hero__content">
          <div class="hero__text">
            <div class="hero__logo-group">
              <div class="hero-card-header dot-pattern dot-pattern--light">
                <a href="/" class="hero-card-header__logo">
                  <img src="/carmichael-logo.png" alt="Carmichael" class="hero-card-header__logo-img" width="200" height="200" loading="eager" />
                  <div class="hero-card-header__brand">
                    <img src="/logo3.png" alt="Carmichael" class="hero-card-header__brand-text" width="408" height="61" loading="eager" />
                    <span class="hero-card-header__apparel">{t("logo.apparel", locale.value)}</span>
                  </div>
                </a>
                <nav class="hero-card-header__nav">
                  <a href="/" class="hero-card-header__nav-link active">{t("nav.home", locale.value)}</a>
                  <a href="/apparel/" class="hero-card-header__nav-link">{t("nav.apparel", locale.value)}</a>
                </nav>
                <div class="hero-card-header__actions">
                  <button class="hero-card-header__btn" onClick$={() => {
                    const btn = document.querySelector('.locale-btn') as HTMLElement;
                    btn?.click();
                  }} aria-label="Language">
                    <span class="hero-card-header__locale-short">{locale.value === "en" ? "FR" : "EN"}</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    <span class="hero-card-header__btn-label">{locale.value === "en" ? "Français" : "English"}</span>
                  </button>
                  <button class={`hero-card-header__btn ${hasCartItems.value ? "hero-card-header__btn--cart-active" : ""}`} onClick$={() => {
                    const btn = document.querySelector('.cart-btn') as HTMLElement;
                    btn?.click();
                  }} aria-label="Cart">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
                    <span class="hero-card-header__btn-label">{t("cart.mycart", locale.value)}</span>
                  </button>
                  <button class="hero-card-header__btn" onClick$={() => {
                    const btn = document.querySelector('.hamburger-btn') as HTMLElement;
                    btn?.click();
                  }} aria-label="Menu">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>
                  </button>
                </div>
              </div>
              <div class="hero__middle-section dot-pattern dot-pattern--light">
                <div class="hero__top-row">
                  <div class="hero__badge">
                    <span class="hero__badge-dot" />
                    {t("hero.badge", locale.value)}
                  </div>
                  <img src="/carmichael-logo.png" alt="" class="hero__title-icon" width="200" height="200" loading="eager" decoding="sync" />
                </div>
                <img src="/logo3.png" alt="Carmichael" class="hero__title-img" width="408" height="61" loading="eager" decoding="sync" />
                <span class="hero__title-apparel">{t("logo.apparel", locale.value)}</span>
                <p class="hero__subtitle-inline">{t("hero.subtitle", locale.value)}</p>
                <div class="hero__logo-spacer">
                  <img src="/carmichael-services/canada2.png" alt="Proudly Canadian" class="hero__logo-spacer-canada" loading="eager" />
                </div>
              </div>
              <Carousel.Root class="hero-carousel" bind:selectedIndex={heroIndex} align="start" sensitivity={{ touch: 0.5, mouse: 0.5 }} rewind>
                <Carousel.Scroller class="hero-carousel__scroller">
                  <Carousel.Slide class="hero-carousel__slide">
                    <img src="/carmichael-services/van-building.jpeg" alt="Carmichael van" loading="eager" />
                  </Carousel.Slide>
                  <Carousel.Slide class="hero-carousel__slide hero-carousel__slide--transparent">
                    <img src="/carmichael.png" alt="Carmichael vintage car" loading="eager" />
                  </Carousel.Slide>
                </Carousel.Scroller>
                <Carousel.Pagination class="hero-carousel__dots">
                  <Carousel.Bullet class="hero-carousel__dot" />
                  <Carousel.Bullet class="hero-carousel__dot" />
                </Carousel.Pagination>
              </Carousel.Root>
              <div class="hero-bento">
                <Carousel.Root class="hero-bento-carousel" bind:selectedIndex={bentoIndex} align="start" sensitivity={{ touch: 0.5, mouse: 0.5 }} rewind>
                  <Carousel.Scroller class="hero-bento-carousel__scroller">
                    <Carousel.Slide class="hero-bento-carousel__slide">
                      <img src="/carmichael-services/van-building.jpeg" alt="Carmichael van" loading="eager" />
                    </Carousel.Slide>
                    <Carousel.Slide class="hero-bento-carousel__slide hero-bento-carousel__slide--transparent">
                      <img src="/carmichael.png" alt="Carmichael vintage car" loading="eager" />
                    </Carousel.Slide>
                  </Carousel.Scroller>
                  <Carousel.Pagination class="hero-bento-carousel__dots">
                    <Carousel.Bullet class="hero-bento-carousel__dot" />
                    <Carousel.Bullet class="hero-bento-carousel__dot" />
                  </Carousel.Pagination>
                </Carousel.Root>
              </div>
              <div class="hero__logo-spacer hero__logo-spacer--mobile">
                <img src="/carmichael-services/canada2.png" alt="Proudly Canadian" class="hero__logo-spacer-canada" loading="eager" />
              </div>
              <div class="hero-categories">
                <a href="/apparel/#work-wear" class="category-card">
                  <img src="/carmichael-services/boiler-technicians.jpeg" alt="Work Wear" width="400" height="300" loading="lazy" />
                  <span class="category-card__label">{categoryLabel("Work Wear", locale.value)}</span>
                </a>
                <a href="/apparel/#jackets" class="category-card">
                  <img src="/carmichael-services/careers.jpeg" alt="Jackets" width="400" height="300" loading="lazy" />
                  <span class="category-card__label">{t("teaser.jackets.title", locale.value)}</span>
                </a>
                <a href="/apparel/#polos" class="category-card">
                  <img src="/carmichael-services/hvac-retrofit.jpeg" alt="Polos" width="400" height="300" loading="lazy" />
                  <span class="category-card__label">{t("teaser.polos.title", locale.value)}</span>
                </a>
                <a href="/apparel/#hats" class="category-card">
                  <img src="/hat/30109107PS2_FRONT.JPG" alt="Hats" width="400" height="300" loading="lazy" />
                  <span class="category-card__label">{t("teaser.hats.title", locale.value)}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </section>



      {/* Apparel Catalog */}
      <ProductCatalog />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Carmichael Apparel",
  meta: [
    {
      name: "description",
      content: "Carmichael Employee Apparel. Order branded jackets, polos, hats, and more.",
    },
  ],
};
