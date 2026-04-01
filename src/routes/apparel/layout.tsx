import { component$, Slot, useContext, useComputed$, useSignal, $, createContextId, useContextProvider } from "@builder.io/qwik";
import type { Signal } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { categories as rawCategories, categoryLabel } from "./products";

export const CategoryContext = createContextId<Signal<string>>("apparel-category");
export const SearchContext = createContextId<Signal<string>>("apparel-search");
export const GenderContext = createContextId<Signal<string>>("apparel-gender");

const CATEGORY_ORDER = ["All", "Work Wear", "Jackets", "Polos", "Hats"];
const categories = CATEGORY_ORDER.filter(c => rawCategories.includes(c));

// Keyed by category — "All" shows a general banner, others match their filter
const heroImg = [
  { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=640&h=360&fit=crop", alt: "Apparel collection" },
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=360&fit=crop", alt: "On the job" },
] as [{ src: string; alt: string }, { src: string; alt: string }];

export const useApparelAuthGuard = routeLoader$(({ cookie, redirect }) => {
  if (cookie.get("ce_auth")?.value !== "authenticated") {
    throw redirect(302, "/?login=1");
  }
});

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loc = useLocation();


  const isCatalog = useComputed$(() => /^\/apparel\/?$/.test(loc.url.pathname));
  const searchOpen = useSignal(false);
  const filterOpen = useSignal(false);
  const activeCategory = useSignal(loc.url.searchParams.get("category") || "All");
  const searchQuery = useSignal(loc.url.searchParams.get("q") || "");
  const genderFilter = useSignal("All");

  useContextProvider(CategoryContext, activeCategory);
  useContextProvider(SearchContext, searchQuery);
  useContextProvider(GenderContext, genderFilter);

  const doSearch = $((query: string) => {
    if (query.trim()) {
      activeCategory.value = "All";
      searchQuery.value = query.trim();
    } else {
      searchQuery.value = "";
    }
  });

  return (
    <div class="apparel-page dot-pattern">
      <div class="collection-hero" style={isCatalog.value ? {} : { display: 'none' }}>
        <div class="collection-hero__viewport">
          <div class="collection-hero__slide active">
            <div class="collection-hero__panel">
              <img src={heroImg[0].src} alt={heroImg[0].alt} width="640" height="360" loading="eager" decoding="sync" />
            </div>
            <div class="collection-hero__panel">
              <img src={heroImg[1].src} alt={heroImg[1].alt} width="640" height="360" loading="eager" decoding="sync" />
            </div>
          </div>
        </div>
      </div>
      {isCatalog.value && (
        <div class="apparel-titlebar apparel-titlebar--overlap">
          <div class="apparel-titlebar__row">
            <div class="apparel-titlebar__left">
              <h1 class="apparel-catalog__title" onClick$={() => (activeCategory.value = "All")} style={{ cursor: "pointer" }}>
                {t("apparel.title", locale.value)}
              </h1>
              <div class="apparel-titlebar__tabs">
                {categories.filter(c => c !== "All").map((cat) => (
                    <button
                      key={cat}
                      class={`apparel-titlebar__tab ${activeCategory.value === cat ? "active" : ""}`}
                      onClick$={() => {
                        const headerH = window.innerWidth <= 900 ? 46 : 58;
                        const titlebar = document.querySelector('.apparel-titlebar');
                        const titlebarH = (titlebar as HTMLElement)?.offsetHeight || 34;
                        const catalog = document.querySelector('.apparel-catalog');
                        const stickyPos = catalog ? catalog.getBoundingClientRect().top + window.scrollY - headerH - titlebarH : 0;
                        if (activeCategory.value === cat && cat !== "All") { activeCategory.value = "All"; } else
                        activeCategory.value = cat;
                        searchQuery.value = "";
                        if (window.innerWidth <= 1024) {
                          window.scrollTo({ top: stickyPos, behavior: 'instant' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }
                      }}
                    >
                    {cat === "Work Wear" ? "Workwear" : categoryLabel(cat, locale.value)}
                  </button>
                ))}
              </div>
            </div>
            <div class="apparel-titlebar__right">
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
              <div class="apparel-titlebar__search">
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
        </div>
      )}
      <Slot />
    </div>
  );
});
