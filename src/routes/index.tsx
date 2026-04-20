import { component$, useContext, useSignal } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../i18n";
import { allProducts } from "./apparel/products";
import { LoginTypeContext } from "./layout";

const SKU_IMG_OVERRIDE: Record<string, string> = {
  "BM-1": "/paxton-black.png",
  "BM-2": "/paxton-grey.png",
  "BM-3": "/gilliamjacket-black.png",
  "BM-4": "/gilliam-black.png",
  "BM-5": "/duck-black.png",
  "BM-6": "/duckgrey.png",
  "BM-7": "/cooler-black.png",
  "BM-8": "/backpack-black.png",
};

const SKU_OBJECT_POSITION: Record<string, string> = {
  "BM-1": "center 96%",
  "BM-2": "center 96%",
  "BM-4": "center 60%",
  "BM-5": "center 60%",
  "BM-6": "center 60%",
};

const SKU_CONTAIN: Record<string, boolean> = {
  "BM-3": true,
  "BM-7": true,
  "BM-8": true,
};

const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  "Work Wear": "/CTA_en_OurServices_FS_Plumbing-1.webp",
  "Jackets": "/accessories.webp",
  "Accessories": "/CTA_en_OurServices_FS_MSNAD-1.webp",
};

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loginType = useContext(LoginTypeContext);
  const compact = useSignal<boolean>(false);

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
                  <img src="/BlackMcDonald_Logo.webp" alt="Black & McDonald" class="hero__title-img" width="1633" height="844" loading="eager" decoding="sync" />
                  <div class="hero__apparel-row">
                    <span class="hero__title-apparel">{t("logo.apparel", locale.value)}</span>
                    <img src="/good-catch-logo-en.jpg" alt="Good Catch Awards" class="hero__patch-img" width="200" height="200" loading="eager" decoding="sync" />
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
              {loginType.value === "electrical" ? (
                <div class="hero-categories">
                  <a href="/apparel/#work-wear" class="category-card">
                    <img src="/CTA_en_OurServices_FS_Plumbing-1.webp" alt="Work Wear" width="400" height="300" loading="eager" decoding="sync" />
                    <span class="category-card__label">{t("teaser.workwear.title", locale.value)}</span>
                  </a>
                  <a href="/apparel/#jackets" class="category-card">
                    <img src="/jackets.webp" alt="Jackets" width="400" height="300" loading="eager" decoding="sync" />
                    <span class="category-card__label">{t("teaser.jackets.title", locale.value)}</span>
                  </a>
                  <a href="/apparel/#accessories" class="category-card">
                    <img src="/CTA_en_OurServices_FS_MSNAD-1.webp" alt="Accessories" width="400" height="300" loading="eager" decoding="sync" />
                    <span class="category-card__label">{t("teaser.accessories.title", locale.value)}</span>
                  </a>
                  <div class="category-card category-card--visual">
                    <img src="/truck2.webp" alt="Black & McDonald — Est. 1921" width="400" height="300" loading="eager" decoding="sync" />
                  </div>
                </div>
              ) : (
                <>
                  <div class="hero__products-tab">
                    <span class="hero__products-tab-label">Good Catch Apparel</span>
                    <button
                      type="button"
                      class="hero__products-tab-toggle"
                      aria-label={compact.value ? "Switch to wider view" : "Switch to narrower view"}
                      onClick$={() => (compact.value = !compact.value)}
                    >
                      {compact.value ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="7" height="16" rx="1"/><rect x="13" y="4" width="7" height="16" rx="1"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
                      )}
                    </button>
                  </div>
                  <div class={`hero-categories ${compact.value ? "hero-categories--compact" : "hero-categories--wide"}`}>
                    {allProducts.map((p) => {
                      const imgStyle: Record<string, string> = {};
                      if (SKU_OBJECT_POSITION[p.sku]) imgStyle.objectPosition = SKU_OBJECT_POSITION[p.sku];
                      if (SKU_CONTAIN[p.sku]) { imgStyle.objectFit = "contain"; imgStyle.background = "#ffffff"; }
                      return (
                        <a key={p.sku} href={`/apparel/${p.sku}/`} class="category-card">
                          <img src={SKU_IMG_OVERRIDE[p.sku] || p.img || CATEGORY_FALLBACK_IMG[p.category] || "/truck2.webp"} alt={p.name} width="400" height="300" loading="eager" decoding="sync" style={Object.keys(imgStyle).length ? imgStyle : undefined} />
                          <span class="category-card__label">{p.name}</span>
                        </a>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div class="hero__print-cta">
              <a href="/print/" class="hero__print-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Download / Print Catalog
              </a>
            </div>
          </div>
        </div>

      </section>
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
