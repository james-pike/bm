import { component$, Slot, useContext, useComputed$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { categories, categoryLabel } from "./products";

const heroBanners = [
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1280&h=720&fit=crop", alt: "On the job" },
  { src: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1280&h=720&fit=crop", alt: "Apparel collection" },
  { src: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=1280&h=720&fit=crop", alt: "Caps & hats" },
];

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

  const heroIndex = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const interval = setInterval(() => {
      heroIndex.value = (heroIndex.value + 1) % heroBanners.length;
    }, 5000);
    cleanup(() => clearInterval(interval));
  });

  return (
    <div class="apparel-page">
      {isCatalog.value && (
        <div class="collection-hero">
          <div class="collection-hero__viewport">
            {heroBanners.map((slide, i) => (
              <div key={i} class={`collection-hero__slide ${heroIndex.value === i ? "active" : ""}`}>
                <img src={slide.src} alt={slide.alt} width="1280" height="720" />
              </div>
            ))}
          </div>
          <div class="collection-hero__dots">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                class={`collection-hero__dot ${heroIndex.value === i ? "active" : ""}`}
                onClick$={() => (heroIndex.value = i)}
              />
            ))}
          </div>
        </div>
      )}
      {isCatalog.value && (
        <div class="apparel-titlebar apparel-titlebar--overlap">
          <div class="apparel-titlebar__row">
            <h1 class="apparel-catalog__title">
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
        </div>
      )}
      <Slot />
    </div>
  );
});
