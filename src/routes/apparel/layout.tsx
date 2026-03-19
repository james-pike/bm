import { component$, Slot, useContext, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { LocaleContext, t } from "../../i18n";
import { allProducts, categories, categoryLabel } from "./products";

export const useApparelAuthGuard = routeLoader$(({ cookie, redirect }) => {
  if (cookie.get("ce_auth")?.value !== "authenticated") {
    throw redirect(302, "/?login=1");
  }
});

export default component$(() => {
  const locale = useContext(LocaleContext);
  const loc = useLocation();
  const nav = useNavigate();

  const sku = loc.params.sku;
  const product = useComputed$(() => sku ? allProducts.find((p) => p.sku === sku) || null : null);
  const activeCategory = useComputed$(() => {
    const cat = loc.url.searchParams.get("category") || "All";
    return categories.includes(cat) ? cat : "All";
  });

  const subtitle = useComputed$(() => {
    if (product.value) return product.value.name;
    if (activeCategory.value !== "All") return categoryLabel(activeCategory.value, locale.value);
    return "";
  });

  return (
    <div class="apparel-page dot-pattern dot-pattern--light">
      <div class="apparel-catalog__title-row">
        <h1 class="apparel-catalog__title">
          {sku ? (
            <span class="apparel-catalog__title-back" onClick$={() => nav("/apparel/")}>
              {t("apparel.title", locale.value)}
            </span>
          ) : (
            t("apparel.title", locale.value)
          )}
          {subtitle.value && (
            <span class="apparel-catalog__title-cat"> — {subtitle.value}</span>
          )}
        </h1>
      </div>
      <Slot />
    </div>
  );
});
