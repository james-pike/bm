import { component$ } from "@builder.io/qwik";
import { type DocumentHead, routeLoader$ } from "@builder.io/qwik-city";

// Catalog index is tech-only; BM logins (clothing/electrical) only reach product detail pages.
export const useCatalogGuard = routeLoader$(({ cookie, redirect }) => {
  const val = cookie.get("ce_auth")?.value;
  if (val !== "tech") {
    throw redirect(302, "/");
  }
});

export default component$(() => {
  return <></>;
});

export const head: DocumentHead = {
  title: "Shop Apparel - Black & McDonald Apparel",
};
