import { component$, useSignal, useContext, useVisibleTask$, useComputed$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../i18n";
import { ProductCatalog } from "../components/product-catalog/product-catalog";
import { LoginTypeContext } from "./layout";

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loginType = useContext(LoginTypeContext);
  const isTech = useComputed$(() => loginType.value === "tech");
  const hasCartItems = useSignal(false);

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

  return (
    <div class="home-page">
      {/* Hero */}
      <section class="hero">
        <div class="hero__content">
          <div class="hero__text">
            <div class="hero__logo-group">
              <div class="hero__middle-section dot-pattern dot-pattern--light">
                <div class="hero__top-row">
                </div>
                <div class="hero__logo-stack">
                  <div class="hero__badge-row">
                    <div class="hero__badge">
                      <span class="hero__badge-dot" />
                      {t("hero.badge", locale.value)}
                    </div>
                  </div>
                  <img src="/BlackMcDonald_Logo.webp" alt="Black & McDonald" class="hero__title-img" width="1633" height="844" loading="eager" decoding="sync" />
                  <div class="hero__apparel-row">
                    <span class="hero__title-apparel">{t("logo.apparel", locale.value)}</span>
                  </div>
                </div>
              </div>
              <div class="hero-carousel dot-pattern dot-pattern--light">
                <div class="hero-carousel__scroller">
                  <div class="hero-carousel__slide hero-carousel__slide--video" data-active>
                    <video src="/bm-herov2.mp4" autoplay muted loop playsInline preload="metadata" poster="/bm-hero-poster.webp" class="hero-carousel__video" />
                  </div>
                </div>
              </div>
              <div class="hero-bento">
                <div class="hero-bento-carousel dot-pattern dot-pattern--light">
                  <div class="hero-bento-carousel__scroller">
                    <div class="hero-bento-carousel__slide hero-bento-carousel__slide--video" data-active>
                      <video src="/bm-herov2.mp4" autoplay muted loop playsInline preload="metadata" poster="/bm-hero-poster.webp" class="hero-bento-carousel__video" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="hero-categories">
                {isTech.value ? (<>
                  <a href="/apparel/" class="category-card category-card--tech-primary">
                    <picture>
                      <source media="(max-width: 767px)" srcset="/carmichael-services/chiller-retrofit.jpeg" />
                      <source media="(min-width: 768px) and (max-width: 1024px)" srcset="/carmichael-services/hvac-retrofit.jpeg" />
                      <img src="/carmichael-services/boiler-technicians.jpeg" alt="Work Wear" width="400" height="300" loading="eager" decoding="sync" />
                    </picture>
                    <span class="category-card__label">{t("teaser.workwear.title", locale.value)}</span>
                  </a>
                  <a href="/apparel/" class="category-card category-card--tech-extra category-card--tech-desktop">
                    <img src="/carmichael-services/careers.jpeg" alt="" width="400" height="300" loading="eager" decoding="sync" />
                  </a>
                  <a href="/apparel/" class="category-card category-card--tech-extra category-card--tech-desktop">
                    <img src="/carmichael-services/hvac-retrofit.jpeg" alt="" width="400" height="300" loading="eager" decoding="sync" />
                  </a>
                  <a href="/apparel/" class="category-card category-card--tech-extra category-card--tech-tablet">
                    <img src="/carmichael-services/chiller-retrofit.jpeg" alt="" width="400" height="300" loading="eager" decoding="sync" />
                  </a>
                </>) : (<>
                  <a href="/apparel/#work-wear" class="category-card">
                    <img src="/carmichael-services/boiler-technicians.jpeg" alt="Work Wear" width="400" height="300" loading="eager" decoding="sync" />
                    <span class="category-card__label">{t("teaser.workwear.title", locale.value)}</span>
                  </a>
                  <a href="/apparel/#jackets" class="category-card">
                    <img src="/carmichael-services/careers.jpeg" alt="Jackets" width="400" height="300" loading="eager" decoding="sync" />
                    <span class="category-card__label">{t("teaser.jackets.title", locale.value)}</span>
                  </a>
                  <a href="/apparel/#accessories" class="category-card">
                    <img src="/carmichael-services/boiler-technicians.jpeg" alt="Accessories" width="400" height="300" loading="eager" decoding="sync" />
                    <span class="category-card__label">{t("teaser.accessories.title", locale.value)}</span>
                  </a>
                  <div class="category-card category-card--visual">
                    <img src="/truck2.webp" alt="Black & McDonald — Est. 1921" width="400" height="300" loading="eager" decoding="sync" />
                  </div>
                </>)}
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
  title: "Black & McDonald Apparel",
  meta: [
    { name: "description", content: "Black & McDonald Employee Apparel. Order branded jackets, vests, work wear, and more." },
    { name: "robots", content: "noindex, nofollow" },
    { name: "theme-color", content: "#ffffff" },
    { property: "og:title", content: "Black & McDonald Apparel" },
    { property: "og:description", content: "Internal apparel ordering for Black & McDonald staff." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://apparel.blackandmcdonald.com/" },
    { property: "og:image", content: "https://apparel.blackandmcdonald.com/bm-logo.gif" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Black & McDonald Apparel" },
    { name: "twitter:description", content: "Internal apparel ordering for Black & McDonald staff." },
    { name: "twitter:image", content: "https://apparel.blackandmcdonald.com/bm-logo.gif" },
  ],
};
