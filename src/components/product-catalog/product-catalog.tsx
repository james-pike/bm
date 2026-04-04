import { component$, useSignal, useComputed$, useContext, $ } from "@builder.io/qwik";
import { LocaleContext, t } from "../../i18n";
import { allProducts, categoryLabel } from "../../routes/apparel/products";
import type { Product } from "../../routes/apparel/products";

const CATEGORY_ORDER = ["All", "Work Wear", "Jackets", "Polos", "Hats"];

const ProductCard = component$<{ item: Product; sku: string }>(({ item, sku }) => {
  const locale = useContext(LocaleContext);

  return (
    <a href={`/apparel/${sku}/`} class={`product-card product-card-link ${sku === "CAR-21" ? "product-card--cover" : ""}`}>
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
            <span class="product-card__sizes">{item.sizes === "One Size" ? t("modal.onesize", locale.value) : item.sizes}</span>
          </div>
        </div>
      </div>
    </a>
  );
});

export const ProductCatalog = component$<{ class?: string }>(({ "class": cls }) => {
  const locale = useContext(LocaleContext);
  const activeCat = useSignal("All");
  const searchQuery = useSignal("");
  const genderFilter = useSignal("All");
  const searchOpen = useSignal(false);
  const filterOpen = useSignal(false);

  const doSearch = $((query: string) => {
    if (query.trim()) {
      activeCat.value = "All";
      searchQuery.value = query.trim();
    } else {
      searchQuery.value = "";
    }
  });

  const filtered = useComputed$(() => {
    const pushLast = (items: Product[]) => {
      const last = items.filter((p) => p.sku === "CAR-12");
      return [...items.filter((p) => p.sku !== "CAR-12"), ...last];
    };
    const filterGender = (items: Product[]) => {
      if (genderFilter.value === "All") return items;
      const prefix = genderFilter.value === "Men" ? "men" : "women";
      return items.filter((p) => p.name.toLowerCase().includes(prefix));
    };

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return filterGender(pushLast(allProducts.filter((p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )));
    }

    if (activeCat.value !== "All") {
      const items = allProducts.filter((p) => p.category === activeCat.value);
      return filterGender(pushLast(items));
    }

    // Interleave: alternate 1 work wear, 1 other
    const workWear = allProducts.filter((p) => p.category === "Work Wear" && p.sku !== "CAR-12");
    const other = allProducts.filter((p) => p.category !== "Work Wear");
    const result: Product[] = [];
    let w = 0, o = 0;
    while (w < workWear.length || o < other.length) {
      if (o < other.length) result.push(other[o++]);
      if (w < workWear.length) result.push(workWear[w++]);
    }
    const car12 = allProducts.find((p) => p.sku === "CAR-12");
    if (car12) result.push(car12);
    return filterGender(result);
  });

  return (
    <section class={`home-catalog ${cls || ""}`}>
      <div class="home-catalog__inner">
        <div class="home-catalog__header">
          <h2 class="home-catalog__title">{t("nav.apparel", locale.value)}</h2>
          <div class="home-catalog__sidebar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              class="apparel-titlebar__search-input"
              placeholder=""
              aria-label="Search apparel"
              value={searchQuery.value}
              onInput$={(_, el) => { searchQuery.value = el.value; }}
              onKeyDown$={(e) => { if (e.key === "Enter") doSearch(searchQuery.value); }}
              onBlur$={() => doSearch(searchQuery.value)}
            />
          </div>
          <div class="home-catalog__tabs">
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                class={`apparel-titlebar__tab ${activeCat.value === cat ? "active" : ""}`}
                onClick$={() => {
                  if (activeCat.value === cat) { activeCat.value = "All"; return; }
                  activeCat.value = cat;
                  searchQuery.value = "";
                  const isDesktop = window.innerWidth > 1024;
                  const headerH = window.innerWidth <= 900 ? 46 : 58;
                  if (isDesktop) {
                    const grid = document.querySelector('.home-catalog .apparel-grid');
                    const gridTop = grid ? grid.getBoundingClientRect().top + window.scrollY - headerH - 8 : 0;
                    window.scrollTo({ top: gridTop, behavior: 'smooth' });
                  } else {
                    const catalog = document.querySelector('.home-catalog');
                    const tabH = (document.querySelector('.home-catalog__header') as HTMLElement)?.offsetHeight || 34;
                    const catalogTop = catalog ? catalog.getBoundingClientRect().top + window.scrollY : 0;
                    const stickyPos = catalogTop - headerH + tabH - 12;
                    window.scrollTo({ top: stickyPos, behavior: 'instant' });
                  }
                }}
              >
                {cat === "All" ? t("apparel.all", locale.value) : categoryLabel(cat, locale.value)}
              </button>
            ))}
            <div class="home-catalog__gender-section">
              <h3 class="home-catalog__filter-title">Filter</h3>
              {["All", "Men", "Women"].map((g) => (
                <button
                  key={g}
                  class={`apparel-titlebar__tab ${genderFilter.value === g ? "active" : ""}`}
                  onClick$={() => { genderFilter.value = g; }}
                >
                  {g === "All" ? "All" : g === "Men" ? "Men's" : "Women's"}
                </button>
              ))}
            </div>
          </div>
          <div class="home-catalog__right">
            <div class="gender-filter">
              <button
                class={`apparel-titlebar__action ${genderFilter.value !== "All" ? "gender-filter--active" : ""}`}
                aria-label="Filter"
                onClick$={() => (filterOpen.value = !filterOpen.value)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
              {filterOpen.value && (
                <div class="gender-filter__dropdown">
                  {["All", "Men", "Women"].map((g) => (
                    <button
                      key={g}
                      class={`gender-filter__option ${genderFilter.value === g ? "active" : ""}`}
                      onClick$={() => { genderFilter.value = g; filterOpen.value = false; }}
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
                value={searchQuery.value}
                onInput$={(_, el) => { searchQuery.value = el.value; }}
                onKeyDown$={(e) => { if (e.key === "Enter") doSearch(searchQuery.value); }}
                onBlur$={() => doSearch(searchQuery.value)}
              />
            </div>
            {searchOpen.value ? (
              <div class="apparel-titlebar__search apparel-titlebar__search--mobile">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input
                  type="text"
                  class="apparel-titlebar__search-input"
                  placeholder=""
                  aria-label="Search apparel"
                  autoFocus
                  value={searchQuery.value}
                  onInput$={(_, el) => { searchQuery.value = el.value; }}
                  onKeyDown$={(e) => { if (e.key === "Enter") { doSearch(searchQuery.value); searchOpen.value = false; } if (e.key === "Escape") { searchQuery.value = ""; searchOpen.value = false; } }}
                />
                <button class="apparel-titlebar__action" aria-label="Close search" onClick$={() => { doSearch(searchQuery.value); searchOpen.value = false; }} style="padding:2px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </div>
            ) : (
              <button class="apparel-titlebar__action apparel-titlebar__action--mobile-search" aria-label="Search" onClick$={() => (searchOpen.value = true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            )}
          </div>
        </div>
        <div class="apparel-grid">
          {filtered.value.map((item) => (
            <ProductCard key={item.sku} item={item} sku={item.sku} />
          ))}
        </div>
      </div>
    </section>
  );
});
