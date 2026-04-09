import { component$, useSignal, useComputed$, useContext, $, useVisibleTask$ } from "@builder.io/qwik";
import { LocaleContext, t } from "../../i18n";
import { allProducts, categoryLabel } from "../../routes/apparel/products";
import type { Product } from "../../routes/apparel/products";

const CATEGORY_ORDER = ["All", "Work Wear", "Jackets", "Polos", "Hats"];

const CATEGORY_ICONS: Record<string, string> = {
  "All": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  "Work Wear": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M4 6h16v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/><path d="M4 6l-2 4v2h4V8"/><path d="M20 6l2 4v2h-4V8"/></svg>',
  "Jackets": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2l5 6v12a2 2 0 01-2 2h-3V12h-6v10H6a2 2 0 01-2-2V8l5-6"/><path d="M9 2a3 3 0 006 0"/><line x1="12" y1="12" x2="12" y2="22"/></svg>',
  "Polos": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2 12 5.5 8 2 3.62 3.46a2 2 0 00-1.34 1.93v15.12a2 2 0 001.34 1.93L8 24l4-3.5L16 24l4.38-1.46a2 2 0 001.34-1.93V5.39a2 2 0 00-1.34-1.93z"/></svg>',
  "Hats": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 00-7 7c0 3 2 5 3 6h8c1-1 3-3 3-6a7 7 0 00-7-7z"/><path d="M5 15h14"/><path d="M6 18h12"/></svg>',
};

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
  const searchOpen = useSignal(false);
  const tabletCols = useSignal(2);

  const HASH_TO_CAT: Record<string, string> = {
    "work-wear": "Work Wear",
    "jackets": "Jackets",
    "polos": "Polos",
    "hats": "Hats",
  };

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && HASH_TO_CAT[hash]) {
      activeCat.value = HASH_TO_CAT[hash];
      history.replaceState(null, "", window.location.pathname);
    }
  });

  const doSearch = $((query: string) => {
    if (query.trim()) {
      activeCat.value = "All";
      searchQuery.value = query.trim();
    } else {
      searchQuery.value = "";
    }
  });

  const filtered = useComputed$(() => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return allProducts.filter((p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (activeCat.value !== "All") {
      return allProducts.filter((p) => p.category === activeCat.value);
    }

    // Interleave: alternate 1 work wear, 1 other
    const workWear = allProducts.filter((p) => p.category === "Work Wear");
    const other = allProducts.filter((p) => p.category !== "Work Wear");
    const result: Product[] = [];
    let w = 0, o = 0;
    while (w < workWear.length || o < other.length) {
      if (o < other.length) result.push(other[o++]);
      if (w < workWear.length) result.push(workWear[w++]);
    }
    return result;
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
                  const headerH = window.innerWidth <= 900 ? 49 : 58;
                  if (isDesktop) {
                    const grid = document.querySelector('.home-catalog .apparel-grid');
                    const gridTop = grid ? grid.getBoundingClientRect().top + window.scrollY - headerH - 8 : 0;
                    const needsScrollUp = gridTop < window.scrollY;
                    window.scrollTo({ top: gridTop, behavior: needsScrollUp ? 'instant' : 'smooth' });
                  } else {
                    const catalog = document.querySelector('.home-catalog');
                    const tabH = (document.querySelector('.home-catalog__header') as HTMLElement)?.offsetHeight || 34;
                    const catalogTop = catalog ? catalog.getBoundingClientRect().top + window.scrollY : 0;
                    const stickyPos = catalogTop - headerH + tabH - 30;
                    window.scrollTo({ top: stickyPos, behavior: 'instant' });
                  }
                }}
              >
                <span class="apparel-titlebar__tab-icon" dangerouslySetInnerHTML={CATEGORY_ICONS[cat]} />
                {cat === "All" ? t("apparel.all", locale.value) : categoryLabel(cat, locale.value)}
              </button>
            ))}
          </div>
          <div class="home-catalog__right">
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
                  onBlur$={() => { doSearch(searchQuery.value); searchOpen.value = false; }}
                />
                <button class="apparel-titlebar__action" aria-label="Close search" onClick$={() => { doSearch(searchQuery.value); searchOpen.value = false; }} style="padding:2px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </div>
            ) : (
              <>
                <button
                  class="apparel-titlebar__action apparel-titlebar__action--tablet-cols"
                  aria-label={`Show ${tabletCols.value === 2 ? 3 : 2} per row`}
                  onClick$={() => { tabletCols.value = tabletCols.value === 2 ? 3 : 2; }}
                >
                  {tabletCols.value === 2 ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18"/><rect x="9.5" y="3" width="5" height="18"/><rect x="16" y="3" width="5" height="18"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="18"/><rect x="13" y="3" width="8" height="18"/></svg>
                  )}
                </button>
                <button class="apparel-titlebar__action apparel-titlebar__action--mobile-search" aria-label="Search" onClick$={() => (searchOpen.value = true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </button>
              </>
            )}
          </div>
        </div>
        <div class={`apparel-grid apparel-grid--cols-${tabletCols.value}`}>
          {filtered.value.map((item) => (
            <ProductCard key={item.sku} item={item} sku={item.sku} />
          ))}
        </div>
      </div>
    </section>
  );
});
