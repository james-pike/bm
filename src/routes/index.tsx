import { component$, useSignal, useContext } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../i18n";
import { allProducts, categoryLabel } from "./apparel/products";
import type { Product } from "./apparel/products";


const teasers = [
  {
    slug: "work-wear",
    category: "Work Wear",
    tagKey: "teaser.workwear.tag" as const,
    titleKey: "teaser.workwear.title" as const,
    textKey: "teaser.workwear.text" as const,
    ctaKey: "teaser.workwear.cta" as const,
    imgs: [
      "/sku/_INSULATED_VIKING_frj3957frj_-removebg-preview.png",
      "/sku/ww2-removebg-preview.png",
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
      "/sku/l7603-ladies-soft-shell-removebg-preview.png",
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
      "/sku/womens-white-removebg-preview.png",
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


const TeaserCard = component$<{ t: typeof teasers[0] }>(({ t: teaser }) => {
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
  const homeCat = useSignal("All");

  return (
    <>
      {/* Hero */}
      <section class="hero dot-pattern dot-pattern--light">
        <div class="hero__bg" />
        <div class="hero__content">
          <div class="hero__text">
            <img src="/logo2.png" alt="Wear Your Carmichael Brand" class="hero__title-img" />
            <div class="hero__apparel-row">
              <p class="hero__subtitle-inline">{t("hero.subtitle", locale.value)}</p>
            </div>
          </div>
          <div class="hero__logo-slot">
            <img src="/carmichael-logo.png" alt="Carmichael" class="hero__logo-img" />
          </div>
        </div>

        {/* Featured Teasers */}
        <div class="section section--teasers">
          <div class="teaser-grid">
            {teasers.map((teaser) => (
              <TeaserCard key={teaser.slug} t={teaser} />
            ))}
          </div>

        </div>
      </section>

      {/* Apparel Catalog */}
      <section class="home-catalog">
        <div class="home-catalog__inner">
          <div class="home-catalog__header">
            <h2 class="home-catalog__title">{t("nav.apparel", locale.value)}</h2>
            <div class="home-catalog__tabs">
              {["All", "Work Wear", "Jackets", "Polos", "Hats"].map((cat) => (
                <button
                  key={cat}
                  class={`apparel-titlebar__tab ${homeCat.value === cat ? "active" : ""}`}
                  onClick$={() => {
                    homeCat.value = cat;
                    setTimeout(() => {
                      const grid = document.querySelector('.home-catalog .apparel-grid');
                      if (grid) {
                        const headerH = window.innerWidth <= 900 ? 48 : 58;
                        const tabH = document.querySelector('.home-catalog__header')?.getBoundingClientRect().height || 40;
                        const top = grid.getBoundingClientRect().top + window.scrollY - headerH - tabH + 2;
                        window.scrollTo({ top, behavior: 'instant' });
                      }
                    }, 50);
                  }}
                >
                  {cat === "All" ? t("apparel.all", locale.value) : categoryLabel(cat, locale.value)}
                </button>
              ))}
            </div>
          </div>
          <div class="apparel-grid">
            {(() => {
              const alsoBelongs: Record<string, string[]> = {
                "CAR-9": ["Jackets"],
                "CAR-13": ["Jackets"],
                "CAR-15": ["Jackets"],
                "CAR-16": ["Polos"],
              };
              let items: Product[];
              if (homeCat.value === "All") {
                const workWear = allProducts.filter((p) => p.category === "Work Wear" && p.sku !== "CAR-12");
                const other = allProducts.filter((p) => p.category !== "Work Wear");
                items = [];
                let w = 0, o = 0;
                while (w < workWear.length || o < other.length) {
                  if (o < other.length) items.push(other[o++]);
                  if (w < workWear.length) items.push(workWear[w++]);
                }
                const car12 = allProducts.find((p) => p.sku === "CAR-12");
                if (car12) items.push(car12);
              } else {
                items = allProducts.filter((p) => p.category === homeCat.value || alsoBelongs[p.sku]?.includes(homeCat.value));
                items = [...items.filter((p) => p.sku !== "CAR-12"), ...items.filter((p) => p.sku === "CAR-12")];
              }
              return items.map((item) => (
                <a key={item.sku} href={`/apparel/${item.sku}/`} class="product-card product-card-link">
                  <div class="product-card__image">
                    <img src={item.img} alt={item.name} width="440" height="440" />
                  </div>
                  <div class="product-card__info">
                    <div class="product-card__name-row">
                      <div class="product-card__name">
                        <span class="product-card__name-text">{item.name.replace(/#\S+/g, '').trim()}</span>
                        <span class="product-card__name-code">{(item.name.match(/#\S+/) || [''])[0]}</span>
                      </div>
                      <div class="product-card__price-group">
                        <div class="product-card__price">${item.price}</div>
                        <span class="product-card__sizes">{item.sizes}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ));
            })()}
          </div>
        </div>
      </section>
    </>
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
