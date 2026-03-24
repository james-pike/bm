import { component$, Slot, useContext, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { categories, categoryLabel } from "./products";

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

  const activeCategory = useComputed$(() => loc.url.searchParams.get("category") || "All");
  const activeBanner = useComputed$(() => heroBanners[activeCategory.value] || heroBanners.All);

  return (
    <div class="apparel-page">
      {isCatalog.value && (
        <div class="collection-hero">
          <div class="collection-hero__viewport">
            <div class="collection-hero__slide active">
              <div class="collection-hero__panel">
                <img src={activeBanner.value[0].src} alt={activeBanner.value[0].alt} width="640" height="360" />
              </div>
              <div class="collection-hero__panel">
                <img src={activeBanner.value[1].src} alt={activeBanner.value[1].alt} width="640" height="360" />
              </div>
            </div>
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
              <button class="apparel-titlebar__action" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
              <button class="apparel-titlebar__action" aria-label="Filter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
      <Slot />
    </div>
  );
});
