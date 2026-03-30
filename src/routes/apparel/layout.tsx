import { component$, Slot, useContext, useComputed$, useSignal, $ } from "@builder.io/qwik";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { categories as rawCategories, categoryLabel } from "./products";

const CATEGORY_ORDER = ["All", "Work Wear", "Jackets", "Polos", "Hats"];
const categories = CATEGORY_ORDER.filter(c => rawCategories.includes(c));

// Keyed by category — "All" shows a general banner, others match their filter
const heroBanners: Record<string, [{ src: string; alt: string }, { src: string; alt: string }]> = {
  All: [
    { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=360&fit=crop", alt: "On the job" },
    { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=640&h=360&fit=crop", alt: "Apparel collection" },
  ],
  Polos: [
    { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=640&h=360&fit=crop", alt: "Polos" },
    { src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=640&h=360&fit=crop", alt: "Collection" },
  ],
  Jackets: [
    { src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=640&h=360&fit=crop", alt: "Jackets" },
    { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=360&fit=crop", alt: "On the job" },
  ],
  "Work Wear": [
    { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=360&fit=crop", alt: "On the job" },
    { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=640&h=360&fit=crop", alt: "Apparel collection" },
  ],
  Hats: [
    { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=640&h=360&fit=crop", alt: "Caps & hats" },
    { src: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=640&h=360&fit=crop", alt: "Headwear" },
  ],
};

export const useApparelAuthGuard = routeLoader$(({ cookie, redirect }) => {
  if (cookie.get("ce_auth")?.value !== "authenticated") {
    throw redirect(302, "/?login=1");
  }
});

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loc = useLocation();
  const nav = useNavigate();

  const isCatalog = useComputed$(() => /^\/apparel\/?$/.test(loc.url.pathname));
  const searchOpen = useSignal(false);
  const searchQuery = useSignal(loc.url.searchParams.get("q") || "");

  const doSearch = $((query: string) => {
    const cat = loc.url.searchParams.get("category") || "All";
    if (query.trim()) {
      nav(`/apparel/?category=All&q=${encodeURIComponent(query.trim())}`);
    } else {
      nav(`/apparel/?category=${cat}`);
    }
  });

  const activeCategory = useComputed$(() => loc.url.searchParams.get("category") || "All");

  return (
    <div class="apparel-page dot-pattern">
      {isCatalog.value && (
        <div class="collection-hero">
          <div class="collection-hero__viewport">
            {Object.entries(heroBanners).map(([cat, imgs]) => (
              <div key={cat} class={`collection-hero__slide ${activeCategory.value === cat ? "active" : ""}`}>
                <div class="collection-hero__panel">
                  <img src={imgs[0].src} alt={imgs[0].alt} width="640" height="360" loading="eager" />
                </div>
                <div class="collection-hero__panel">
                  <img src={imgs[1].src} alt={imgs[1].alt} width="640" height="360" loading="eager" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {isCatalog.value && (
        <div class="apparel-titlebar apparel-titlebar--overlap">
          <div class="apparel-titlebar__row">
            <div class="apparel-titlebar__left">
              <h1 class="apparel-catalog__title" onClick$={() => nav("/apparel/?category=All")} style={{ cursor: "pointer" }}>
                {t("apparel.title", locale.value)}
              </h1>
              <div class="apparel-titlebar__tabs">
                {categories.map((cat) => {
                  const active = (loc.url.searchParams.get("category") || "All") === cat;
                  return (
                    <button
                      key={cat}
                      class={`apparel-titlebar__tab ${active ? "active" : ""}`}
                      onClick$={() => nav(`/apparel/?category=${cat}`)}
                    >
                    {categoryLabel(cat, locale.value)}
                  </button>
                );
                })}
              </div>
            </div>
            <div class="apparel-titlebar__right">
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
