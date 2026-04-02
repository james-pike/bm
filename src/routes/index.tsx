import { component$, useSignal, useContext } from "@builder.io/qwik";
import { Carousel } from "@qwik-ui/headless";
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
  const homeSearch = useSignal("");
  const homeSearchOpen = useSignal(false);
  const homeGender = useSignal("All");
  const homeFilterOpen = useSignal(false);

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
                <div class="hero-card-header__actions">
                  <button class="hero-card-header__btn" onClick$={() => {
                    const btn = document.querySelector('.locale-btn') as HTMLElement;
                    btn?.click();
                  }} aria-label="Language">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    <span class="hero-card-header__btn-label">{locale.value === "en" ? "Français" : "English"}</span>
                  </button>
                  <button class="hero-card-header__btn" onClick$={() => {
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
                <div class="hero__apparel-row">
                  <span class="hero__title-apparel">{t("logo.apparel", locale.value)}</span>
                  <p class="hero__subtitle-inline">{t("hero.subtitle", locale.value)}</p>
                </div>
              </div>
              <div class="hero-bento__item hero-left-img">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop&crop=center" alt="On the job" loading="eager" />
              </div>
              <Carousel.Root class="hero-carousel" autoPlayIntervalMs={6000} align="start" sensitivity={{ touch: 0.5, mouse: 0.5 }} rewind>
                <Carousel.Scroller class="hero-carousel__scroller">
                  <Carousel.Slide class="hero-carousel__slide">
                    <img src="/van.jpeg" alt="On the job" loading="eager" />
                  </Carousel.Slide>
                  <Carousel.Slide class="hero-carousel__slide">
                    <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop&crop=center" alt="On the job" loading="eager" />
                  </Carousel.Slide>
                  <Carousel.Slide class="hero-carousel__slide">
                    <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=500&fit=crop&crop=center" alt="Apparel" loading="eager" />
                  </Carousel.Slide>
                </Carousel.Scroller>
              </Carousel.Root>
              <div class="hero-bento">
                <div class="hero-bento__item hero-bento__b">
                  <img src="/van.jpeg" alt="On the job" loading="eager" />
                </div>
                <div class="hero-bento__row">
                  <div class="hero-bento__item hero-bento__c">
                    <img src="/van.jpeg" alt="On the job" loading="eager" />
                  </div>
                  <div class="hero-bento__item hero-bento__d">
                    <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&crop=center" alt="On the job" loading="eager" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      <div class="teaser-card-section">
        {teasers.map((teaser) => (
          <TeaserCard key={teaser.slug} t={teaser} />
        ))}
      </div>

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
                    if (homeCat.value === cat) { homeCat.value = "All"; return; }
                    const catalog = document.querySelector('.home-catalog');
                    const headerH = window.innerWidth <= 900 ? 46 : 58;
                    const tabH = (document.querySelector('.home-catalog__header') as HTMLElement)?.offsetHeight || 34;
                    const catalogTop = catalog ? catalog.getBoundingClientRect().top + window.scrollY : 0;
                    const stickyPos = catalogTop - headerH + tabH - 12;
                    homeCat.value = cat;
                    window.scrollTo({ top: stickyPos, behavior: 'instant' });
                  }}
                >
                  {cat === "All" ? t("apparel.all", locale.value) : cat === "Work Wear" ? "Workwear" : categoryLabel(cat, locale.value)}
                </button>
              ))}
              <div class="home-catalog__gender-section">
                <h3 class="home-catalog__filter-title">Filter</h3>
                {["All", "Men", "Women"].map((g) => (
                  <button
                    key={g}
                    class={`apparel-titlebar__tab ${homeGender.value === g ? "active" : ""}`}
                    onClick$={() => { homeGender.value = g; }}
                  >
                    {g === "All" ? "All" : g === "Men" ? "Men's" : "Women's"}
                  </button>
                ))}
              </div>
            </div>
            <div class="home-catalog__right">
              <div class="gender-filter">
                <button
                  class={`apparel-titlebar__action ${homeGender.value !== "All" ? "gender-filter--active" : ""}`}
                  aria-label="Filter"
                  onClick$={() => (homeFilterOpen.value = !homeFilterOpen.value)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                </button>
                {homeFilterOpen.value && (
                  <div class="gender-filter__dropdown">
                    {["All", "Men", "Women"].map((g) => (
                      <button
                        key={g}
                        class={`gender-filter__option ${homeGender.value === g ? "active" : ""}`}
                        onClick$={() => { homeGender.value = g; homeFilterOpen.value = false; }}
                      >
                        {g === "All" ? "All" : g === "Men" ? "Men's" : "Women's"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div class="apparel-titlebar__search home-catalog__search-desktop">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  class="apparel-titlebar__search-input"
                  placeholder=""
                  aria-label="Search apparel"
                  value={homeSearch.value}
                  onInput$={(_, el) => { homeSearch.value = el.value; }}
                  onKeyDown$={(e) => { if (e.key === "Enter") { homeCat.value = "All"; } }}
                  onBlur$={() => { if (homeSearch.value) homeCat.value = "All"; }}
                />
              </div>
              {homeSearchOpen.value ? (
                <div class="apparel-titlebar__search apparel-titlebar__search--mobile">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  <input
                    type="text"
                    class="apparel-titlebar__search-input"
                    placeholder=""
                    aria-label="Search apparel"
                    autoFocus
                    value={homeSearch.value}
                    onInput$={(_, el) => { homeSearch.value = el.value; }}
                    onKeyDown$={(e) => { if (e.key === "Enter") { homeCat.value = "All"; homeSearchOpen.value = false; } if (e.key === "Escape") { homeSearch.value = ""; homeSearchOpen.value = false; } }}
                  />
                  <button class="apparel-titlebar__action" aria-label="Close search" onClick$={() => { homeSearchOpen.value = false; }} style="padding:2px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                  </button>
                </div>
              ) : (
                <button class="apparel-titlebar__action apparel-titlebar__action--mobile-search" aria-label="Search" onClick$={() => (homeSearchOpen.value = true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </button>
              )}
            </div>
          </div>
          <div class="apparel-grid">
            {(() => {
              const filterGender = (list: Product[]) => {
                if (homeGender.value === "All") return list;
                const prefix = homeGender.value === "Men" ? "men" : "women";
                return list.filter((p) => p.name.toLowerCase().includes(prefix));
              };
              let items: Product[];
              if (homeSearch.value) {
                const q = homeSearch.value.toLowerCase();
                items = allProducts.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
              } else if (homeCat.value === "All") {
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
                items = allProducts.filter((p) => p.category === homeCat.value);
                items = [...items.filter((p) => p.sku !== "CAR-12"), ...items.filter((p) => p.sku === "CAR-12")];
              }
              return filterGender(items).map((item) => (
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
