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

  const subtitle = useComputed$(() => {
    // Extract SKU from path: /apparel/CM-1/ -> CM-1
    const path = loc.url.pathname;
    const match = path.match(/^\/apparel\/([^/]+)\/?$/);
    if (match) {
      const sku = match[1];
      const product = allProducts.find((p) => p.sku === sku);
      if (product) return product.name;
    }
    const cat = loc.url.searchParams.get("category") || "All";
    if (cat !== "All" && categories.includes(cat)) {
      return categoryLabel(cat, locale.value);
    }
    return "";
  });

  const isProduct = useComputed$(() => /^\/apparel\/[^/]+\/?$/.test(loc.url.pathname));

  return (
    <div class="apparel-page dot-pattern dot-pattern--light">
      <div class="apparel-catalog__title-row">
        <h1 class="apparel-catalog__title">
          {isProduct.value ? (
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
