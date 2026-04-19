import { component$, Slot, useComputed$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { ProductCatalog } from "../../components/product-catalog/product-catalog";

export const useApparelAuthGuard = routeLoader$(({ cookie, redirect }) => {
  const val = cookie.get("ce_auth")?.value;
  // Any authenticated user may view product detail pages; unauthenticated → home.
  if (val !== "clothing" && val !== "tech" && val !== "electrical" && val !== "authenticated") {
    throw redirect(302, "/");
  }
});

export default component$(() => {
  const loc = useLocation();
  const isCatalog = useComputed$(() => /^\/apparel\/?$/.test(loc.url.pathname));

  return (
    <div class="apparel-page dot-pattern">
      {isCatalog.value ? (
        <ProductCatalog />
      ) : (
        <Slot />
      )}
    </div>
  );
});
