import { component$, useContext } from "@builder.io/qwik";
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
  "BM-1": "center 80%",
  "BM-2": "center 80%",
  "BM-3": "center 35%",
  "BM-4": "center 35%",
  "BM-5": "center 35%",
  "BM-6": "center 35%",
  "BM-7": "center 10%",
  "BM-8": "center 10%",
};

const CATEGORY_FALLBACK_IMG: Record<string, string> = {
  "Work Wear": "/CTA_en_OurServices_FS_Plumbing-1.webp",
  "Jackets": "/accessories.webp",
  "Accessories": "/CTA_en_OurServices_FS_MSNAD-1.webp",
};

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loginType = useContext(LoginTypeContext);

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
              <div class="hero-categories">
                {allProducts.map((p) => {
                  const img = <img src={SKU_IMG_OVERRIDE[p.sku] || p.img || CATEGORY_FALLBACK_IMG[p.category] || "/truck2.webp"} alt={p.name} width="400" height="300" loading="eager" decoding="sync" style={SKU_OBJECT_POSITION[p.sku] ? { objectPosition: SKU_OBJECT_POSITION[p.sku] } : undefined} />;
                  const label = <span class="category-card__label">{p.name}</span>;
                  return loginType.value === "electrical" ? (
                    <a key={p.sku} href={`/apparel/${p.sku}/`} class="category-card">
                      {img}
                      {label}
                    </a>
                  ) : (
                    <div key={p.sku} class="category-card category-card--visual">
                      {img}
                      {label}
                    </div>
                  );
                })}
              </div>
              <div class="hero__print-cta">
                <a href="/print/" class="hero__print-btn">Download / Print Catalog</a>
              </div>
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
